exports.TableEvents = (function() {
  var subscriptions = {};

  var __subscribe = function(events, cb, once) {
    events.replace(/(\s)\s*/g, "$1").split(" ").forEach(function(e) {
      subscriptions[e] || (subscriptions[e] = []);
      subscriptions[e].push({ cb: cb, once: once });
    });
  };

  this.subscribe = function(e, cb) {
    __subscribe(e, cb, false);
  };

  this.subscribeOnce = function(e, cb) {
    __subscribe(e, cb, true);
  };

  this.publish = function(events) {
    var args = Array.prototype.slice.call(arguments, 1);
    events.replace(/(\s)\s*/g, "$1").split(" ").forEach(function(e) {
      subscriptions[e] && subscriptions[e].forEach(function(obj, index) {
        obj.cb && obj.cb.apply(this, args);
        obj.once && subscriptions[e].splice(index, 1);
      });
    });
  };

  return this;
})();

