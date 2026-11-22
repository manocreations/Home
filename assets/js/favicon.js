/* Auto favicon: black icon on light theme, white icon on dark theme.
   Follows the browser/OS preference and updates live when it changes. */
(function () {
  var base = (function () {
    // resolve path relative to this script so it works on any page / folder
    var s = document.currentScript;
    return s ? s.src.replace(/js\/favicon\.js(\?.*)?$/, "img/") : "assets/img/";
  })();
  var mq = window.matchMedia("(prefers-color-scheme: dark)");

  function apply() {
    var file = mq.matches ? "favicon-dark.png" : "favicon.png";
    var old = document.querySelectorAll('link[rel~="icon"]');
    for (var i = 0; i < old.length; i++) old[i].parentNode.removeChild(old[i]);
    var link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    link.sizes = "64x64";
    link.href = base + file;
    document.head.appendChild(link);
  }

  apply();
  if (mq.addEventListener) mq.addEventListener("change", apply);
  else if (mq.addListener) mq.addListener(apply);
})();
