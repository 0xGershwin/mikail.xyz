(function () {
  var root = document.querySelector("[data-now]");
  if (!root) return;

  var src = root.getAttribute("data-src") || "data/now.json";
  var stamp = root.querySelector("[data-now-stamp]");
  var linesRoot = root.querySelector("[data-now-lines]");

  function text(value) {
    return document.createTextNode(value == null ? "" : String(value));
  }

  function fail() {
    if (stamp) stamp.textContent = "";
    if (linesRoot) {
      linesRoot.innerHTML = "";
      var p = document.createElement("p");
      p.className = "prose muted";
      p.appendChild(text("Now failed to load. Check data/now.json."));
      linesRoot.appendChild(p);
    }
  }

  fetch(src)
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load now");
      return response.json();
    })
    .then(function (data) {
      if (!data || typeof data !== "object") throw new Error("bad now");
      if (stamp) {
        stamp.textContent = data.updated ? "last updated: " + data.updated : "";
      }
      if (!linesRoot) return;
      linesRoot.innerHTML = "";
      var lines = data.lines || [];
      var painted = 0;
      lines.forEach(function (line) {
        if (!line) return;
        var p = document.createElement("p");
        p.className = "prose";
        p.appendChild(text(line));
        linesRoot.appendChild(p);
        painted += 1;
      });
      if (!painted) fail();
    })
    .catch(fail);
})();
