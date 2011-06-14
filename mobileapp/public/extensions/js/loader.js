/**
 * Script loader
 */
var basePath = "/";
(function () {
 var load_all = function(scripts) {
   var html = "";
   for (var i = 0; i < scripts.length; i++) {
     var src = scripts[i];
     if(!(location.href.match(/^file/))) {
       html += "<script type=\"text/javascript\" src=\"" + basePath + src + "\"></script>";
     }
   }
   document.write(html);
 };

 window.load = function(scripts) {
   load_all(scripts);
 };
})();

/**
 * Loading configuration starts here
 */
load([].concat(dependencies));

//fuck the cache while beta phase
typeof(window["less"]) != "undefined" && less.refresh(true);

