if (typeof console === "undefined") {
  console = {
    log: function() {},
    debug: function() {}
  };
}

var df = (function () {
  var subscriptions = {};
  var __subscribe = function(events, cb, once) {
    events.replace(/(\s)\s*/g, "$1").split(" ").forEach(function(e) {
      subscriptions[e] || (subscriptions[e] = []);
      subscriptions[e].push({ cb: cb, once: once });
    });
  };

  return {
    subscribe: function(e, cb) {
      __subscribe(e, cb, false);
    },

    subscribeOnce: function(e, cb) {
      __subscribe(e, cb, true);
    },

    publish: function(events) {
      var args = Array.prototype.slice.call(arguments, 1);
      events.replace(/(\s)\s*/g, "$1").split(" ").forEach(function(e) {
        subscriptions[e] && subscriptions[e].forEach(function(obj, index) {
          obj.cb && obj.cb.apply(this, args);
          obj.once && subscriptions[e].splice(index, 1);
        });
      });
    }
  }; 
})();

$(document).ready(function() {
  df.publish("ready");
});

