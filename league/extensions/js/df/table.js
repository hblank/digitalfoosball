df.table = (function() {
  df.subscribe("app:table", function($content) {
    $content.find("table").delegate("tr", "click", function() {
      location.href = $(this).find("a").first().attr("href");
    });
  });

  return {};
})();

