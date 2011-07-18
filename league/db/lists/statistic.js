function(head, req) {
  start({"headers": {"content-type": "text/html"}});

  var mustache = require("lib/mustache"),
      template = this.templates["statistic.html"],
      config = getRow().value,
      locales = JSON.parse(this.resources["locales_" + config.locale + ".json"]);

  var data = {
    total: {
      games: 0,
      goals: 0,
      duration: 0,
      days: 0
    },
    avg: {
      gamesPerDay: 0,
      durationPerGame: 0,
      durationPerDay: 0
    },
    goals: {
      home: {
        amount: 0
      },
      visitors: {
        amount: 0
      }
    },
    victories: {
      home: {
        amount: 0
      },
      visitors: {
        amount: 0
      }
    },
    games: []
  };

  for (var key in locales) {
    data["locales." + key] = locales[key];
  }

  var row, currDay, lastDay, matchDays = 0, totalDuration = 0;

  var formatDate = function(time) {
    var date = new Date(time),
        day = date.getDate(),
        month = date.getMonth() + 1;
    return [day > 9 ? day : "0" + day, month > 9 ? month : "0" + month, date.getFullYear()].join(".");
  };

  var truncTime = function(timestamp) {
    var time = new Date(timestamp).getTime();
    return time - time % (1000 * 60 * 60 * 24);
  };

  while (row = getRow()) {
    var game = row.value,
        league = game.league;
    delete game.league;

    if (!data.players) {
      data.players = {
        amount: 0
      };

      var list = [];

      for (var name in league.table) {
        var p = league.table[name];
        ++data.players.amount;

        p.name = name;
        p.goals.diff = p.goals.scored - p.goals.conceded;
        p.games.total = p.games.won + p.games.lost;
        list.push(p);
      }

      list.sort(function(a, b) {
        return (a.goals.diff > b.goals.diff) ? -1 : ((a.goals.diff < b.goals.diff) ? 1 : 0);
      });

      var formatPlayer = function(player) {
        var diff = player.goals.diff;
        return {
          name: player.name,
          diff: (diff > 0 ? "+" + diff : diff)
        };
      };

      data.players.topscorer = formatPlayer(list[0]);
      data.players.loser = formatPlayer(list[list.length - 1]);

      list.sort(function(a, b) {
        return (a.games.total > b.games.total) ? -1 : ((a.games.total < b.games.total) ? 1 : 0);
      });

      data.players.mostactive = {
        name: list[0].name,
        games: list[0].games.total
      };
    }

    data.since = formatDate(game.start);

    ++data.total.games;

    lastDay || (lastDay = truncTime(0));
    currDay = truncTime(game.end);

    if (lastDay != currDay) {
      ++data.total.days;
      lastDay = currDay;
    }

    game.goals = game.goals.reduce(function(prev, curr) {++prev[curr.scorer]; return prev; }, {home: 0, visitors: 0});

    ["home", "visitors"].forEach(function(side) {
      data.goals[side].amount += game.goals[side];
      data.total.goals += game.goals[side];
    });

    game.goals.home > game.goals.visitors ? ++data.victories.home.amount : ++data.victories.visitors.amount;

    data.total.duration += game.end - game.start;

    if (game.players.home.length < 2) {
      game.players.visitors.push("");
      game.players.home.push("");
    }
    game.end = formatDate(game.end);
    data.games.length < 5 && data.games.push(game);
  }


  data.goals.home.percentage = ~~(data.goals.home.amount / data.total.goals * 1e2);
  data.goals.visitors.percentage = ~~(data.goals.visitors.amount / data.total.goals * 1e2);
  data.victories.home.percentage = ~~(data.victories.home.amount / data.total.games * 1e2);
  data.victories.visitors.percentage = ~~(data.victories.visitors.amount / data.total.games * 1e2);

  data.avg.gamesPerDay = ~~(data.total.games / data.total.days);
  data.avg.durationPerGame = ~~(data.total.duration / data.total.games / 1e3);
  data.avg.durationPerDay = ~~(data.total.duration / data.total.days / 1e3 / 60);

  return mustache.to_html(template, data);
};

