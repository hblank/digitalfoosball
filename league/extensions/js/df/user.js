df.user = (function() {
  df.subscribe("app:user", function($content) {
    $content.find(".meter").each(function() {
      var $this = $(this);
      $this.css("width", $this.data("percentage") + "%").addClass("final");
    });
  });

  return {};
})();

