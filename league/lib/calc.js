var http = require('http'),
    sys = require('sys'),
    config = require('./config').config;

var queue = [],
    busy = false;

var start = function() {
  getCurrentLeague(observe);
};

var getCurrentLeague = function(cb) {
  var opts = {
    host: config.couchdb.host,
    port: config.couchdb.port,
    path: "/" + config.couchdb.database + "/_design/league/_view/ranked_games?skip=1&limit=1&descending=true",
    headers: {
      "Connection": "keep-alive",
      "Content-Encoding": "utf8",
      "Content-Type": "application/json",
      "accept": "application/json"
    }
  };
  http.get(opts, function(res) {
    var ret = "";
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      ret += chunk;
    });
    res.on("end", function() {
      var doc = JSON.parse(ret).rows[0];
      var league = doc ? doc.value.league : {
        seq: 0,
        table: {}
      };
      cb(league)
    });
  });
};

var observe = function(league) {
  var opts = {
    host: config.couchdb.host,
    port: config.couchdb.port,
    path: "/" + config.couchdb.database + "/_changes?feed=continuous&since=" + league.seq + "&filter=league/unranked_games",
    headers: {
      "Connection": "keep-alive",
      "Content-Encoding": "utf8",
      "Content-Type": "application/json",
      "accept": "application/json"
    }
  };
  var buffer = "";
  http.get(opts, function(res) {
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      try {
        buffer += chunk;
        var doc = JSON.parse(buffer);
        if (doc.id) {
          queue.push({ id: doc.id, seq: doc.seq });
          startWriting(league);
        }
        buffer = "";
      } catch(e) {
        buffer += chunk;
      }
    });
    res.on("end", function() {
      buffer = "";
      observe(league);
    });
  });
};

var startWriting = function(league) {
  if (busy) { return; }
  busy = true;
  var current = queue.shift();
  getDoc(current.id, function(doc) {
    var table = calculateTable(league.table, doc);
    league.seq = current.seq;
    league.table = table;
    doc.league = league
    var opts = {
      host: config.couchdb.host,
      port: config.couchdb.port,
      path: "/" + config.couchdb.database + "/" + doc._id,
      method: "PUT",
      headers: {
        "Connection": "keep-alive",
        "Content-Encoding": "utf8",
        "Content-Type": "application/json",
        "accept": "application/json"
      }
    };

    var req = http.request(opts, function(res) {
      if (res.statusCode === 201) {
        busy = false;
        queue.length && startWriting(league);
      } else {
        throw "cannot put current table!";
      }
    });
    req.write(JSON.stringify(doc));
    req.end();
  });
};

var getDoc = function(id, cb) {
  var opts = {
    host: config.couchdb.host,
    port: config.couchdb.port,
    path: "/" + config.couchdb.database + "/" + id,
    headers: {
      "Connection": "keep-alive",
      "Content-Encoding": "utf8",
      "Content-Type": "application/json",
      "accept": "application/json"
    }
  };

  http.get(opts, function(res) {
    var ret = "";
    res.setEncoding("utf8");
    res.on("data", function(chunk) {
      ret += chunk;
    });
    res.on("end", function() {
      cb(JSON.parse(ret));
    });
  });
};

var calculateTable = function(table, doc) {
  doc.players.home.concat(doc.players.visitors).forEach(function(player) {
    table[player] = table[player] || { goals: { scored: 0, conceded: 0 }, games: { won: 0, lost: 0}, score: 0};
  });

  var goalsHome = doc.goals.filter(function(goal) {
    return goal.scorer == "home";
  }).length;

  var goalsVisitors = doc.goals.filter(function(goal) {
    return goal.scorer == "visitors";
  }).length;

  var winners = goalsHome > goalsVisitors ? doc.players.home : doc.players.visitors,
      losers = goalsHome < goalsVisitors ? doc.players.home : doc.players.visitors;

  var goalsWinner = goalsHome > goalsVisitors ? goalsHome : goalsVisitors,
      goalsLoser = goalsHome < goalsVisitors ? goalsHome : goalsVisitors;

  var goalValue = (goalsWinner - goalsLoser) / 10;
      goalValue > 0 || (goalValue = 0);

  if (doc.players.home.length === 1) {
    var delta = parseInt(10 * (1 + goalValue - (1 / (1 + Math.pow(10, (table[losers[0]].score - table[winners[0]].score) / 400)))), 10);

    table[winners[0]].score += delta * 2;
    table[winners[0]].goals.scored += goalsWinner;
    table[winners[0]].goals.conceded += goalsLoser;
    table[winners[0]].games.won++;

    table[losers[0]].score -= delta * 2;
    table[losers[0]].goals.scored += goalsLoser;
    table[losers[0]].goals.conceded += goalsWinner;
    table[losers[0]].games.lost++;
  } else {
    var delta00 = parseInt(10 * (1 + goalValue - (1 / (1 + Math.pow(10, (table[losers[0]].score - table[winners[0]].score) / 400)))), 10),
        delta01 = parseInt(10 * (1 + goalValue - (1 / (1 + Math.pow(10, (table[losers[1]].score - table[winners[0]].score) / 400)))), 10),
        delta10 = parseInt(10 * (1 + goalValue - (1 / (1 + Math.pow(10, (table[losers[0]].score - table[winners[1]].score) / 400)))), 10),
        delta11 = parseInt(10 * (1 + goalValue - (1 / (1 + Math.pow(10, (table[losers[1]].score - table[winners[1]].score) / 400)))), 10);

    table[winners[0]].score += (delta00 + delta01);
    table[winners[0]].goals.scored += goalsWinner;
    table[winners[0]].goals.conceded += goalsLoser;
    table[winners[0]].games.won++;

    table[winners[1]].score += (delta10 + delta11);
    table[winners[1]].goals.scored += goalsWinner;
    table[winners[1]].goals.conceded += goalsLoser;
    table[winners[1]].games.won++;

    table[losers[0]].score -= (delta00 + delta10);
    table[losers[0]].goals.scored += goalsLoser;
    table[losers[0]].goals.conceded += goalsWinner;
    table[losers[0]].games.lost++;

    table[losers[1]].score -= (delta01 + delta11);
    table[losers[1]].goals.scored += goalsLoser;
    table[losers[1]].goals.conceded += goalsWinner;
    table[losers[1]].games.lost++;
  }
  return table;
};

start();

