function(head, req) {
  start({"headers": {"content-type": "text/html"}});
  
  var mustache = require("lib/mustache"),
      template = this.templates["table.html"],
      config = getRow().value,
      locales = JSON.parse(this.resources["locales_" + config.locale + ".json"]);

  var data = {
    table: []
  };

  for (var key in locales) {
    data["locales." + key] = locales[key];
  }

  var row = getRow(),
      table = row ? row.value.league.table : {};

  for (var name in table) {
    var player = table[name];
    player.name = name;
    data.table.push(player);
  }

  data.table.sort(function(a, b) {
    return (a.score > b.score) ? -1 : ((a.score < b.score) ? 1 : 0);
  });

  var pos = 0,
      prev;
  
  for (var i in data.table) {
    player = data.table[i];
    pos++;
    if (player.score != prev) {
    	player.position = pos;
    }
    prev = player.score;
    player.goals.diff = player.goals.scored - player.goals.conceded;
  }

  return mustache.to_html(template, data);
};

