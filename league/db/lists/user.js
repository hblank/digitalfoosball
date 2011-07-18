function(head, req) {
  start({"headers": {"content-type": "text/html"}});

  var mustache = require("lib/mustache"),
      template = this.templates["user.html"],
      config = getRow().value,
      locales = JSON.parse(this.resources["locales_" + config.locale + ".json"]);
 
  var data = {
    user: {
      name: req.query["name"],
      games: {
        won: {
          amount: 0
        },
        lost: {
          amount: 0
        }
      },
      goals: {
        scored: {
          amount: 0
        },
        conceded: {
          amount: 0
        }
      },
      graph: {
        ranks: []
      }
    },
    games: []
  };

  for (var key in locales) {
    data["locales." + key] = locales[key];
  }

  var row, last_score, opponents = {}, teammates = {};

  var get_rank = function(table) {
    var list = [];

    for (var name in table) {
      var player = table[name];
      player.name = name;
      list.push(player);
    }

    list.sort(function(a, b) {
      return (a.score > b.score) ? -1 : ((a.score < b.score) ? 1 : 0);
    });

    data.user.graph.max || (data.user.graph.max = list.length);
    for (var i = 0; i < list.length; ++i) {
      var player = list[i];
      if (player.name === data.user.name) {
        data.user.score != undefined || (data.user.score = player.score);

        var rank = i + 1;
        while (rank - 2 >= 0 && list[rank - 2].score === data.user.score) {
          rank--;
        };

        if (!data.user.challenger) {
          var challenger = i == 0 ? list[1] : list[i-1];
          data.user.challenger = {
            name: challenger.name,
            rank: data.user.score == challenger.score ? rank : (i == 0 ? rank + 1 : rank -1)
          };
        }
        return rank;
      }
    }
  };

  var push_players = function(players, group, push, game) {
    players.forEach(function(player) {
      group[player] || (group[player] = {
        entire: 0,
        count: 0
      });
      group[player].entire++;
      push && group[player].count++;
      !group[player].avatar && game.players.avatars && game.players.avatars[player] && (group[player].avatar = game.players.avatars[player]);
    });
  };

  var formatDate = function(time) {
    var date = new Date(time),
        day = date.getDate(),
        month = date.getMonth() + 1;
    return [day > 9 ? day : "0" + day, month > 9 ? month : "0" + month, date.getFullYear()].join(".");
  };

  while (row = getRow()) {
    var game = row.value,
        league = game.league;
    delete game.league;

    var rank = get_rank(league.table);
    data.user.rank !== undefined || (data.user.rank = rank);
    data.user.graph.ranks.unshift(rank);
    !data.user.avatar && game.players.avatars && game.players.avatars[data.user.name] && (data.user.avatar = game.players.avatars[data.user.name]);
    data.user.challenger && !data.user.challenger.avatar && game.players.avatars && game.players.avatars[data.user.challenger.name] && (data.user.challenger.avatar = game.players.avatars[data.user.challenger.name]);

    var isHome = game.players.home.indexOf(data.user.name) != -1,
        isVisitors = !isHome && game.players.visitors.indexOf(data.user.name) != -1
        
    if (isHome || isVisitors) {
      game.goals = game.goals.reduce(function(prev, curr) {++prev[curr.scorer]; return prev; }, {home: 0, visitors: 0});

      isWinner = isHome ? game.goals.home > game.goals.visitors : game.goals.home < game.goals.visitors;
      isWinner ? data.user.games.won.amount++ : data.user.games.lost.amount++;
      isHome ? ((data.user.goals.scored.amount += game.goals.home) && (data.user.goals.conceded.amount += game.goals.visitors)) : ((data.user.goals.scored.amount += game.goals.visitors) && (data.user.goals.conceded.amount += game.goals.home));

      if (game.players.home.length > 1) {
        var mate = isHome ? game.players.home[game.players.home.indexOf(data.user.name) === 0 ? 1 : 0] : game.players.visitors[game.players.visitors.indexOf(data.user.name) === 0 ? 1 : 0];
        push_players([mate], teammates, isWinner, game);
      } else {
    	  game.players.visitors.push("");
    	  game.players.home.push("");
      }

      push_players(isHome ? game.players.visitors : game.players.home, opponents, !isWinner, game);

      var score = league.table[data.user.name].score;
      var curr_score = last_score - score;
      last_score !== undefined && (data.games[data.games.length - 1].score = curr_score > 0 ? "+" + curr_score : curr_score);
      last_score = score;
      game.end = formatDate(game.end);
      data.games.length < 5 && data.games.push(game);
    }
  }
  data.games[data.games.length - 1].score = last_score > 0 ? "+" + last_score : last_score;
  data.user.registered = formatDate(data.games[data.games.length - 1].start);

  for (var name in opponents) {
    var o = opponents[name];
    o.name = name;
    o.quote = parseInt(o.count / o.entire * 100, 10);
    if (data.user.nemesis) {
      o.quote > data.user.nemesis.quote && (data.user.nemesis = o);
    } else {
      data.user.nemesis = o;
    }
  }

  for (var name in teammates) {
    var o = teammates[name];
    o.name = name;
    o.quote = parseInt(o.count / o.entire * 100, 10);
    if (data.user.teammate) {
      o.quote > data.user.teammate.quote && (data.user.teammate = o);
    } else {
      data.user.teammate = o;
    }
  }
  
  data.user.goals.scored.percentage = ~~(data.user.goals.scored.amount / (data.user.goals.scored.amount + data.user.goals.conceded.amount) * 1e2);
  data.user.goals.conceded.percentage = ~~(data.user.goals.conceded.amount / (data.user.goals.scored.amount + data.user.goals.conceded.amount) * 1e2);
  data.user.games.won.percentage = ~~(data.user.games.won.amount / (data.user.games.won.amount + data.user.games.lost.amount) * 1e2);
  data.user.games.lost.percentage = ~~(data.user.games.lost.amount / (data.user.games.won.amount + data.user.games.lost.amount) * 1e2);

  data.user.graph.ranks = data.user.graph.ranks.filter(function(rank) { return rank > 0; });
  data.user.graph.ranks = data.user.graph.ranks.map(function(rank) { return (rank - data.user.graph.max) * -1; }).join(",");

  return mustache.to_html(template, data);
};

