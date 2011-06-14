var sys = require("sys"),
    http = require("http"),
    config = require("./config").config,
    announcer = require("./announcer"),
    assistant = require("./assistant"),
    press = require("./press"),
    te = require("./tableevents").TableEvents;

var kickertable = {
  view: "home",
  host: null,
  game: {
    type: "game",
    start: 0,
    end: 0,
    players: {
      home: [],
      visitors: []
    },
    goals: [],
    tweetId: "",
    feed: []
  }
};

var events = {
  start: function(data) {
    resetGame(data && data.rematch);
    kickertable.game.start = new Date().getTime();

    if (data && data.players) {
      kickertable.game.players = data.players;
    }

    kickertable.view = "scoreboard";
    te.publish("referee:openingwhistle", kickertable.game);
  },
  abort: function() {
    kickertable.game.end = new Date().getTime();
    te.publish("referee:abort", kickertable.game);

    resetGame();
    kickertable.host = undefined;
    te.publish("referee:update", kickertable);
  },
  quit: function() {
    resetGame();
    kickertable.host = undefined;
    te.publish("referee:update", kickertable);
  },
  undo: function() {
    kickertable.game.goals.pop();
    te.publish("referee:undo", kickertable.game);
  }
};

var resetGame = function(rematch) {
  kickertable.view = "home";
  kickertable.game.start = 0;
  kickertable.game.end = 0;
  kickertable.game.tweetId = "0";

  if (rematch) {
    var home = kickertable.game.players.home;
    kickertable.game.players.home = kickertable.game.players.visitors;
    kickertable.game.players.visitors = home;
  } else {
    kickertable.game.players = {
      home: [],
      visitors: []
    }
  };

  kickertable.game.goals = [];
  kickertable.game.feed = [];

  te.publish("referee:reset");
};

te.subscribe("assistant:resume", function(backup) {
  kickertable = backup;
  kickertable.host = undefined;
  te.publish("referee:update", kickertable);
});

te.subscribe("client:connect", function(client) {
  te.publish("referee:welcome", kickertable);
});

te.subscribe("client:message", function(client, msg) {
  kickertable.host = client.sessionId;
  events[msg.event](msg.data);
});

te.subscribe("client:disconnect", function(client) {
  if (kickertable.host == client.sessionId) {
    kickertable.host = undefined;
    te.publish("referee:update", kickertable)
  };
});

te.subscribe("press:avatars", function(avatars) {
  kickertable.game.players.avatars = avatars;
  te.publish("referee:update", kickertable);
});

te.subscribe("press:wrote", function(tweetId) {
  game.tweetId = tweetId;

  if (kickertable.view === "summary") {
    te.publish("referee:update", kickertable);
  }
});

te.subscribe("announcer:announcement", function(msg) {
  kickertable.game.feed.push(msg);
  te.publish("referee:update", kickertable);
});

te.subscribe("arduino:goal", function(scorer) { 
  var goal = { 
    type: "goal", 
    scorer: scorer, 
    time: new Date().getTime() 
  };

  if (kickertable.view == "scoreboard") {
    kickertable.game.goals.push(goal);

    if (kickertable.game.goals.filter(function(g) { return goal.scorer === g.scorer; }).length === 6) {
      kickertable.view = "summary";
      kickertable.game.tweetId = "-2";
      kickertable.game.end = new Date().getTime();

      te.publish("referee:finalwhistle", kickertable.game);
    } else {
      te.publish("referee:goal", kickertable.game);
      te.publish("referee:update", kickertable);
    }
  } else {
    te.publish("referee:fastgoal", goal);
  }
});

te.publish("referee:ready");

