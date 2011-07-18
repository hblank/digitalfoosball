function init() {
  var configfiles = {
    base : __dirname+"/../config.json",
  }
  var obj = "";
  for (var file in configfiles) {
    var reader = require("fs").readFileSync(configfiles[file]);
    if(!reader)
      throw new Error("Couldn't read config file " + configfiles[file]);
    if(!obj)
      obj = JSON.parse(reader);
    else {
      var more = JSON.parse(reader);
      for(var key in more)
        obj[key]=more[key];
    }
  }
  console.log("Successfully read and parsed config file \n"+JSON.stringify(obj, null, " ")+"\n");
  return obj;
}

exports.config = init();
