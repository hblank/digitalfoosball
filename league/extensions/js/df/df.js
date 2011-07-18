if (typeof console === "undefined") {
  console = {
    log: function() {},
    debug: function() {}
  };
}

df = (function(df) {
  var subscriptions = {};
  var subscribe = function(events, cb, once) {
    events.replace(/(\s)\s*/g, "$1").split(" ").forEach(function(e) {
      subscriptions[e] || (subscriptions[e] = []);
      subscriptions[e].push({ cb: cb, once: once });
    });
  };

  df.subscribe = function(e, cb) {
    subscribe(e, cb, false);
  };

  df.subscribeOnce = function(e, cb) {
    subscribe(e, cb, true);
  };

  df.publish = function(events) {
    var args = Array.prototype.slice.call(arguments, 1);
    events.replace(/(\s)\s*/g, "$1").split(" ").forEach(function(e) {
      subscriptions[e] && subscriptions[e].forEach(function(obj, index) {
        obj.cb && obj.cb.apply(this, args);
        obj.once && subscriptions[e].splice(index, 1);
      });
    });
  };

  return df;
})(typeof df === "undefined" ? {} : df);

$(document).ready(function() {
  df.publish("ready");
});

