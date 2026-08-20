(function () {
  var root = document.querySelector("[data-site]");
  if (!root) return;

  var src = root.getAttribute("data-src") || "data/site.json";
  var thesis = root.querySelector("[data-site-thesis]");

  fetch(src)
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load site");
      return response.json();
    })
    .then(function (data) {
      if (!data || typeof data !== "object") throw new Error("bad site");
      if (thesis) thesis.textContent = data.thesis || "";
    })
    .catch(function () {
      if (thesis) thesis.textContent = "";
    });
})();
