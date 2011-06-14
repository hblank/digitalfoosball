var http = require("http"),
    sys = require("sys"),
    io = require("socket.io"),
    fs = require("fs"),
    mustache = require("mustache"),
    express = require("express"),
    config = require("./config").config,
    locales = require("./locales").locales,
    referee = require("./referee"),
    te = require("./tableevents").TableEvents;

var app = express.createServer(),
    sockapp = express.createServer(); 

app.configure(function() {
  app.set("views", __dirname + "/../views");
  app.set("view options", {layout: false});
  app.set("view engine", "html");

  app.register(".html", {
    compile: function(str, options){
      return function(locals){
        return mustache.to_html(str, locals);
      };
    }
  });
  //app.use(express.compiler({ src: __dirname + "/../public", enable: ["less"] }));
  app.use(express.favicon(__dirname + "/../public/images/favicons/fi_standard.ico"));
  app.use(express.static(__dirname + "/../public"));
});

app.configure("production", function() {
  sys.debug("Using express.js config for \x1b[1mproduction\x1b[0m mode\n");
  app.use(express.logger({
    format: ":date :method :status HTTP/:http-version :url :response-timems  :user-agent",
    stream: fs.createWriteStream(__dirname + "/../../../shared/logs/access_" + new Date().getTime() + ".log")
  }));
  app.use(express.errorHandler());
});

app.configure("development", function() {
  sys.debug("Using express.js config for \x1b[1mdevelopment\x1b[0m mode\n");
  app.use(express.logger({format: "\x1b[1m:method\x1b[0m :status HTTP/:http-version \x1b[33m:url\x1b[0m :response-timems"}));
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.post("/events/*", function(req, res){
  var parts = req.url.split("/"),
      type = parts[2],
      action = parts[3],
      opts = {"Content-Type": "text/plain"};

  if (type == "goals" && {visitors: true, home: true}[action]) {
    te.publish("arduino:goal", action);

    res.writeHead(200, opts);
    res.end("Added Goal for " + action);
  } else {
    res.writeHead(404, opts);
    res.end();
  }
});

var data = {
  isProduction: /\bproduction\b/.test(process.env.NODE_ENV),
  scoreboard: config.scoreboard,
  cdn: config.production.cdn,
  rev: config.rev
};

for (var key in locales) {
  data["locales." + key] = locales[key];
}

app.get('/', function(req, res){
  //don't switch scoreboard on wall mounted iPad
  //should be checked with cookie value
  if(req.headers['user-agent'].indexOf("iPad") != -1) { 
    data.scoreboard.inverted = false;
  }
  res.render("index", data);
});

app.get("/dialog", function(req, res) {
  res.render("partials/dialog", data);
});

app.listen(config.port);
sys.debug("\x1b[1mExpress server started on port " + app.address().port + "\x1b[0m");

sockapp.listen(config.socketport);
sys.debug("\x1b[1mExpress WebSocket server started on port " + sockapp.address().port + "\x1b[0m\n");

var socket = io.listen(sockapp);
socket.on("connection", function(client) {
  te.subscribeOnce("referee:welcome", function(msg) {
    client.send(msg);
  });
  te.publish("client:connect", client);

  client.on("message", function(msg) {
    te.publish("client:message", client, msg);
  });

  client.on("disconnect", function() {
    te.publish("client:disconnect", client);
  });
});

te.subscribe("referee:update", function(msg) {
  socket.broadcast(msg);
});

process.on("uncaughtException", function (err) {
  sys.debug("[UNCAUGHT EXCEPTION] " + err + "\n" + JSON.stringify(err, null, " "));
  process.exit();
});

