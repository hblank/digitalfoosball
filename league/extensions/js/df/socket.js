df.socket = (function() {
  var message = {};
  
  df.subscribe("ready", function() {
    var socket = new io.Socket(df.config.socketconf.host, {
      port: df.config.socketconf.port,
      transports: ["websocket", "xhr-multipart", "xhr-polling", "jsonp-polling"],
      maxReconnectionAttempts: 50
    });

    socket.on("message", function(msg) {
      if (JSON.stringify(msg) === JSON.stringify(message)) { return; }
      message = msg;

      df.publish("socket:message", message);
    });

    window.WebSocket ? socket.connect() : window.setTimeout("socket.connect()", 500); //hide loading bar in not non-websocket clients
  });

  return {};
})();

