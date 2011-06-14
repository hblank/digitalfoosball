var sys = require("sys"),
    fs = require("fs");

exports.config = (function() {
  var configfiles = {
    base: __dirname+"/../config.json",
    rev: __dirname+"/../rev.json"
  },
  config,
  reader;

  for (var file in configfiles) {
    if (!(reader = fs.readFileSync(configfiles[file]))) {
      throw new Error("Couldn't read config file " + configfiles[file]);
    }

    JSON.parse(reader)
    if (!config) {
      config = JSON.parse(reader);
    } else {
      var more = JSON.parse(reader);
      for (var key in more) {
        config[key] = more[key];
      }
    }
  }
  sys.debug("Successfully read and parsed config files:\n" + JSON.stringify(config, null, " ") + "\n");
  return config;
})();

