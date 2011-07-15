df.socket = (function() {
  var message = {},
      host;

  df.subscribe("ready", function() {
    var socket = new io.Socket(df.config.socketconf.host, {
      port: df.config.socketconf.port,
      transports: ["websocket", "xhr-multipart", "xhr-polling", "jsonp-polling"], 
      maxReconnectionAttempts: 50
    });

    socket.on("connect", function() {
      df.publish("socket:clientId", socket.transport.sessionid);
    });

    socket.on("reconnect", function() {
      df.publish("socket:clientId", socket.transport.sessionid);
    });

    socket.on("message", function(msg) {
      !df.config.production && console.log("message: " + JSON.stringify(msg));

      if (JSON.stringify(msg) === JSON.stringify(message)) { return; }
      message = msg;

      if (host !== message.host) {
        host = message.host;
        df.publish("socket:host", host);
      }

      df.publish("socket:message", message);
    });
    
    socket.connect();

    df.subscribe("client:event", function(event, data) {
      socket.send({
        event: event,
        data: data
      });
    });
  });

  return {};
})();

