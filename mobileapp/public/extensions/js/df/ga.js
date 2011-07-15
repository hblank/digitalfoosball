df.ga = (function() {
  window._gaq = window._gaq || [];
  if (df.config.env === "production" && df.config.ga) {
    _gaq.push(["_setAccount", df.config.ga]);
    _gaq.push(["_trackPageview"]);
    _gaq.push(["_trackPageLoadTime"]);

    var ga = document.createElement("script");
    ga.type = "text/javascript";
    ga.async = true;
    ga.src = ("https:" == document.location.protocol ? "https://ssl" : "http://www") + ".google-analytics.com/ga.js";

    var s = document.getElementsByTagName("script")[0];
    s.parentNode.insertBefore(ga, s);
  }

  return {
    track: function(page) {
      if (df.config.env === "production" && df.config.ga) {
        _gaq.push(["_trackPageview", page]);
      }
    }
  };
})();

