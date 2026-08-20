(function () {
  var root = document.querySelector("[data-site]");
  if (!root) return;

  var src = root.getAttribute("data-src") || "data/site.json";
  var thesis = root.querySelector("[data-site-thesis]");
  var avatar = root.querySelector("[data-site-avatar]");

  // The avatar path is stable, so a version stamp is what busts the CDN copy.
  function avatarSrc(data) {
    if (!data.avatar) return "";
    if (!data.avatarUpdated) return data.avatar;
    return data.avatar + "?v=" + encodeURIComponent(data.avatarUpdated);
  }

  var url = src + (src.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
  fetch(url, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load site");
      return response.json();
    })
    .then(function (data) {
      if (!data || typeof data !== "object") throw new Error("bad site");
      if (thesis) thesis.textContent = data.thesis || "";
      if (!avatar) return;
      var url = avatarSrc(data);
      if (!url) {
        avatar.hidden = true;
        return;
      }
      avatar.onload = function () {
        avatar.hidden = false;
      };
      avatar.src = url;
    })
    .catch(function () {
      if (thesis) thesis.textContent = "";
      if (avatar) avatar.hidden = true;
    });
})();
