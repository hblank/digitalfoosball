var sys = require("sys"),
    fs = require("fs"),
    config = require("./config").config;

exports.locales = (function() {
  return JSON.parse(fs.readFileSync( __dirname + "/../resources/locales_" + config.locale + ".json"));
})();

