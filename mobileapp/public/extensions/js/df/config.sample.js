df.config = (function() {
  return {
    "production": (typeof(env) == "undefined" || env == "production"),
    "websocket": {
      "server": "",
      "port": 3001
    },
    "scoreboard": {
      "inverted": false
    },
    "ga": {
      "account": ""
    }
  };
})();

