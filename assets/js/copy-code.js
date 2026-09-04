(function () {
  function addButtons() {
    var blocks = document.querySelectorAll("pre");
    blocks.forEach(function (pre) {
      if (pre.parentElement.classList.contains("code-block")) return; // already wrapped

      var code = pre.querySelector("code") || pre;

      var wrapper = document.createElement("div");
      wrapper.className = "code-block";
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "copy-btn";
      btn.setAttribute("aria-label", "Copy code");
      var lang = (document.body.getAttribute("data-lang") || "pl");
      var labelCopy = lang === "en" ? "Copy" : "Kopiuj";
      var labelCopied = lang === "en" ? "Copied!" : "Skopiowano!";
      btn.textContent = labelCopy;

      btn.addEventListener("click", function () {
        var text = code.innerText;
        var done = function () {
          btn.textContent = labelCopied;
          btn.classList.add("copied");
          setTimeout(function () {
            btn.textContent = labelCopy;
            btn.classList.remove("copied");
          }, 1600);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done, fallbackCopy);
        } else {
          fallbackCopy();
        }

        function fallbackCopy() {
          var ta = document.createElement("textarea");
          ta.value = text;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta);
          done();
        }
      });

      wrapper.appendChild(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addButtons);
  } else {
    addButtons();
  }
})();
