df.app = (function() {
  var hostId,
      clientId;

  var viewPage = function(page) {
    if (!($("#"+page).hasClass("active"))) {
      $(".page.active").removeClass("active");
      $("#"+page).addClass("active");
      df.ga.track("/" + page);
    }
  };

  var actionIfPermitted = function(action) {
    if (!hostId || hostId === clientId) {
      action();
    } else {
      df.dialog.openDialog(function(answer) {
        answer && action();
      });
    }
  };

  $(".js_target").live("click",function(e) {
    e.preventDefault();
    window.open($(this).attr("href"),($(this).attr("data-target") || "_blank"))
  });

  $(".js_quickstart").live("click",function(e) {
    e.preventDefault();
    df.publish("client:event", "start");
  });

  $(".js_rematch").live("click",function(e) {
    e.preventDefault();
    df.publish("client:event", "start", {rematch:true});
  });

  $(".js_login").live("click",function(e) {
    e.preventDefault();
    if (parseInt($(this).attr("data-opponents"),10) == 2) {
      $("#login").addClass("opponents2");
      $("#login").find("input[name^=team2]").attr("disabled", "disabled");
    } else {
      $("#login").removeClass("opponents2");
      $("#login").find("input[name^=team2]").removeAttr("disabled");
    }

    $("#login form input[type=email].error:not([disabled=disabled])").removeClass("error");
    viewPage("login");
  });

  $("#login form input.error").live("focusin", function(e) {
    $(this).removeClass("error");
  });

  $(".js_home").live("click", function(e) {
    e.preventDefault();
    viewPage("home");
  });

  $("#login form").bind("submit", function(e) {
    e.preventDefault();
    var error = false;
    var players = {
      home: [],
      visitors: []
    };
    var $inputs = $("#login form .formrow input[type=email]:not([disabled=disabled])");
        $inputs.removeClass("error");
    $inputs.each(function(idx,elm){
      var val = elm.value;
      if(val == ""){
        $(elm).addClass("error");
        error = true;
      } else {
        players[idx / $inputs.length < 0.5 ? "home" : "visitors"].push(val);
      }
    });

    if (!error) {
      df.publish("client:event", "start", {"players": players});
    }
  });

  $(".js_quit").live("click",function(e) {
    e.preventDefault();
    actionIfPermitted(function() {
      df.publish("client:event", "quit");
    });
  });

  $(".js_abort").live("click",function(e) {
    e.preventDefault();
    actionIfPermitted(function() {
      df.publish("client:event", "abort");
    });
  });

  $(".js_undo").live("click",function(e) {
    e.preventDefault();
    !$(this).hasClass("js_disabled") && actionIfPermitted(function() {
      df.publish("client:event", "undo");
    });
  });

  df.subscribe("socket:message", function(msg) {
    viewPage(msg.view);
  });

  df.subscribe("socket:clientId", function(id) {
    clientId = id;
  });

  df.subscribe("socket:host", function(id) {
    hostId = id;
  });

  if(!(!!(document.createElementNS && document.createElementNS("http://www.w3.org/2000/svg", "svg").createSVGRect))) {
    $("html").addClass("nosvg");
  }

  if (window.navigator.standalone) {
    document.addEventListener("touchmove", function(e){
      e.preventDefault();
    }, false); 
  } else {
    $(window).bind("load orientationchange", function(e){
      window.scrollTo(0, 1);
    });
  }

  return {};
})();


