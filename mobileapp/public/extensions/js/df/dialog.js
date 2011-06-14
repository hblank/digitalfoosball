df.dialog = (function() {
  var $dialog, $shim;

  var resizeShim = function() {
    $shim.css("height", Math.max($("html").height(), $(".page").height()));
  };

  var openDialog = function(callback) {
    if (!$dialog) {
      $.get("/dialog", function(partial) {
        $shim = $("<div id=\"shim\"></div>");
        $dialog = $(partial);
        $("body").append($dialog).append($shim);

        $dialog.find("a").bind("click", function(e) {
          e.preventDefault();
          $dialog.addClass("hide");
          $shim.hide();
          $(window).unbind("resize", resizeShim);
          callback(e.target.hash.slice(1) === "confirm");
        });
        show();
      });
    } else {
      show();
    }
  };

  var show = function() {
    $(window).bind("resize", resizeShim).trigger("resize");
    $shim.show();
    $dialog.removeClass("hide");
  };

  return {
    openDialog: openDialog
  };
})();

