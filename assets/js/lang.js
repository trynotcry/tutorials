(function () {
  var KEY = "tutorial-lang";
  var bodyLang = document.body.getAttribute("data-lang");
  if (bodyLang === "pl" || bodyLang === "en") {
    try { localStorage.setItem(KEY, bodyLang); } catch (e) {}
  }
})();
