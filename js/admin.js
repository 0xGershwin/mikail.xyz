(function () {
  var OWNER = "0xGershwin";
  var REPO = "mikail.xyz";
  var BRANCH = "main";
  var API = "https://api.github.com/repos/" + OWNER + "/" + REPO + "/contents/";
  var TOKEN_KEY = "mikail.admin.pat";
  var TYPES = ["LAUNCH", "WIN", "RELEASE", "POST", "DEMO"];
  var VENTURES = ["agents", "rwa", "markets", "labs"];
  var DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

  var nowState = { updated: "", lines: [""] };
  var shipsState = [];

  function $(sel) {
    return document.querySelector(sel);
  }

  function text(value) {
    return document.createTextNode(value == null ? "" : String(value));
  }

  function today() {
    var d = new Date();
    var m = String(d.getMonth() + 1);
    var day = String(d.getDate());
    if (m.length < 2) m = "0" + m;
    if (day.length < 2) day = "0" + day;
    return d.getFullYear() + "-" + m + "-" + day;
  }

  function sortShips(entries) {
    return entries.slice().sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
  }

  function toBase64(str) {
    var bytes = new TextEncoder().encode(str);
    var bin = "";
    for (var i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return btoa(bin);
  }

  function fromBase64(b64) {
    var clean = String(b64 || "").replace(/\s/g, "");
    var bin = atob(clean);
    var bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return new TextDecoder().decode(bytes);
  }

  function serialize(value) {
    return JSON.stringify(value, null, 2) + "\n";
  }

  function token() {
    return window.localStorage.getItem(TOKEN_KEY) || "";
  }

  function setStatus(node, kind, message) {
    if (!node) return;
    node.className = "admin-status mono" + (kind ? " is-" + kind : "");
    node.textContent = message || "";
  }

  function paintTokenStatus() {
    var stored = token();
    var node = $("[data-token-status]");
    if (!stored) {
      setStatus(node, "", "no token");
      return;
    }
    setStatus(node, "ok", "stored · …" + stored.slice(-4));
  }

  function apiHeaders() {
    var headers = {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    };
    var pat = token();
    if (pat) headers.Authorization = "Bearer " + pat;
    return headers;
  }

  function readGithubJson(response) {
    return response.json().then(function (body) {
      if (!response.ok) {
        var msg = (body && body.message) || response.statusText || "request failed";
        throw new Error(msg);
      }
      return body;
    });
  }

  function getRemoteFile(path) {
    return fetch(API + path + "?ref=" + encodeURIComponent(BRANCH), {
      headers: apiHeaders(),
    }).then(readGithubJson);
  }

  function putRemoteFile(path, content, message) {
    return getRemoteFile(path).then(function (meta) {
      return fetch(API + path, {
        method: "PUT",
        headers: apiHeaders(),
        body: JSON.stringify({
          message: message,
          content: toBase64(content),
          sha: meta.sha,
          branch: BRANCH,
        }),
      }).then(readGithubJson);
    });
  }

  function loadLocalJson(path) {
    return fetch(path, { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Could not load " + path);
      return response.json();
    });
  }

  function applyNow(data) {
    nowState = {
      updated: data && data.updated ? String(data.updated) : "",
      lines: data && data.lines && data.lines.length ? data.lines.slice() : [""],
    };
    paintNow();
  }

  function applyShips(data) {
    if (!Array.isArray(data)) throw new Error("ships.json must be an array");
    shipsState = data.map(function (entry) {
      return {
        date: entry.date || "",
        type: entry.type || "DEMO",
        venture: entry.venture || "labs",
        title: entry.title || "",
        link: entry.link || "",
        blurb: entry.blurb || "",
      };
    });
    paintShips();
  }

  function paintNow() {
    var date = $("[data-now-updated]");
    var root = $("[data-now-lines]");
    if (date) date.value = nowState.updated || "";
    if (!root) return;
    root.innerHTML = "";
    nowState.lines.forEach(function (line, index) {
      var row = document.createElement("div");
      row.className = "admin-line";

      var area = document.createElement("textarea");
      area.className = "admin-textarea";
      area.value = line;
      area.setAttribute("aria-label", "Now paragraph " + (index + 1));
      area.addEventListener("input", function () {
        nowState.lines[index] = area.value;
      });

      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "chip";
      remove.appendChild(text("del"));
      remove.addEventListener("click", function () {
        if (nowState.lines.length === 1) {
          nowState.lines[0] = "";
        } else {
          nowState.lines.splice(index, 1);
        }
        paintNow();
      });

      row.appendChild(area);
      row.appendChild(remove);
      root.appendChild(row);
    });
  }

  function optionList(select, values, selected) {
    values.forEach(function (value) {
      var opt = document.createElement("option");
      opt.value = value;
      opt.appendChild(text(value));
      if (value === selected) opt.selected = true;
      select.appendChild(opt);
    });
  }

  function bindInput(entry, key, node) {
    node.addEventListener("input", function () {
      entry[key] = node.value;
    });
  }

  function paintShips() {
    var body = $("[data-ship-rows]");
    if (!body) return;
    body.innerHTML = "";
    shipsState.forEach(function (entry, index) {
      var tr = document.createElement("tr");

      var date = document.createElement("input");
      date.className = "admin-input";
      date.type = "date";
      date.value = entry.date;
      date.setAttribute("aria-label", "date");
      bindInput(entry, "date", date);

      var type = document.createElement("select");
      type.className = "admin-select";
      type.setAttribute("aria-label", "type");
      optionList(type, TYPES, entry.type);
      bindInput(entry, "type", type);

      var venture = document.createElement("select");
      venture.className = "admin-select";
      venture.setAttribute("aria-label", "venture");
      optionList(venture, VENTURES, entry.venture);
      bindInput(entry, "venture", venture);

      var title = document.createElement("input");
      title.className = "admin-input";
      title.type = "text";
      title.value = entry.title;
      title.setAttribute("aria-label", "title");
      bindInput(entry, "title", title);

      var link = document.createElement("input");
      link.className = "admin-input";
      link.type = "text";
      link.value = entry.link;
      link.setAttribute("aria-label", "link");
      bindInput(entry, "link", link);

      var blurb = document.createElement("input");
      blurb.className = "admin-input";
      blurb.type = "text";
      blurb.value = entry.blurb;
      blurb.setAttribute("aria-label", "blurb");
      bindInput(entry, "blurb", blurb);

      var del = document.createElement("button");
      del.type = "button";
      del.className = "chip";
      del.appendChild(text("del"));
      del.addEventListener("click", function () {
        if (!window.confirm("Delete this ship row?")) return;
        shipsState.splice(index, 1);
        paintShips();
      });

      [date, type, venture, title, link, blurb, del].forEach(function (node) {
        var td = document.createElement("td");
        td.appendChild(node);
        tr.appendChild(td);
      });
      body.appendChild(tr);
    });
  }

  function cleanNow() {
    var updated = ($("[data-now-updated]") || {}).value || nowState.updated;
    var lines = nowState.lines
      .map(function (line) {
        return String(line || "").replace(/\s+/g, " ").trim();
      })
      .filter(Boolean);
    if (!DATE_RE.test(updated)) throw new Error("updated must be YYYY-MM-DD");
    if (!lines.length) throw new Error("now needs at least one paragraph");
    return { updated: updated, lines: lines };
  }

  function cleanShips() {
    if (!shipsState.length) throw new Error("ships cannot be empty");
    var rows = shipsState.map(function (entry, index) {
      var row = {
        date: String(entry.date || "").trim(),
        type: String(entry.type || "").trim(),
        venture: String(entry.venture || "").trim(),
        title: String(entry.title || "").trim(),
        link: String(entry.link || "").trim(),
        blurb: String(entry.blurb || "").trim(),
      };
      var n = index + 1;
      if (!DATE_RE.test(row.date)) throw new Error("row " + n + ": date must be YYYY-MM-DD");
      if (TYPES.indexOf(row.type) === -1) throw new Error("row " + n + ": bad type");
      if (VENTURES.indexOf(row.venture) === -1) throw new Error("row " + n + ": bad venture");
      if (!row.title) throw new Error("row " + n + ": title required");
      return row;
    });
    return sortShips(rows);
  }

  function saveFile(path, value, message, statusNode) {
    if (!token()) {
      setStatus(statusNode, "err", "error: store a PAT first");
      return;
    }
    setStatus(statusNode, "", "saving…");
    putRemoteFile(path, serialize(value), message)
      .then(function () {
        setStatus(statusNode, "ok", "saved");
      })
      .catch(function (err) {
        setStatus(statusNode, "err", "error: " + (err.message || err));
      });
  }

  function hydrateFromGithub() {
    if (!token()) return;
    getRemoteFile("data/now.json")
      .then(function (file) {
        applyNow(JSON.parse(fromBase64(file.content)));
        setStatus($("[data-now-status]"), "", "loaded from github");
      })
      .catch(function (err) {
        setStatus($("[data-now-status]"), "err", "error: " + (err.message || err));
      });
    getRemoteFile("data/ships.json")
      .then(function (file) {
        applyShips(JSON.parse(fromBase64(file.content)));
        setStatus($("[data-ship-status]"), "", "loaded from github");
      })
      .catch(function (err) {
        setStatus($("[data-ship-status]"), "err", "error: " + (err.message || err));
      });
  }

  $("[data-store-token]").addEventListener("click", function () {
    var input = $("#pat");
    var value = (input.value || "").trim();
    if (!value) {
      setStatus($("[data-token-status]"), "err", "error: empty token");
      return;
    }
    window.localStorage.setItem(TOKEN_KEY, value);
    input.value = "";
    paintTokenStatus();
    hydrateFromGithub();
  });

  $("[data-clear-token]").addEventListener("click", function () {
    window.localStorage.removeItem(TOKEN_KEY);
    $("#pat").value = "";
    paintTokenStatus();
  });

  $("[data-now-updated]").addEventListener("input", function (event) {
    nowState.updated = event.target.value;
  });

  $("[data-now-add]").addEventListener("click", function () {
    nowState.lines.push("");
    paintNow();
  });

  $("[data-now-save]").addEventListener("click", function () {
    try {
      var next = cleanNow();
      nowState = { updated: next.updated, lines: next.lines.slice() };
      paintNow();
      saveFile("data/now.json", next, "admin: update now", $("[data-now-status]"));
    } catch (err) {
      setStatus($("[data-now-status]"), "err", "error: " + (err.message || err));
    }
  });

  $("[data-ship-add]").addEventListener("click", function () {
    shipsState.unshift({
      date: today(),
      type: "DEMO",
      venture: "labs",
      title: "",
      link: "",
      blurb: "",
    });
    paintShips();
  });

  $("[data-ship-save]").addEventListener("click", function () {
    try {
      var next = cleanShips();
      shipsState = next.map(function (entry) {
        return {
          date: entry.date,
          type: entry.type,
          venture: entry.venture,
          title: entry.title,
          link: entry.link,
          blurb: entry.blurb,
        };
      });
      paintShips();
      saveFile("data/ships.json", next, "admin: update ships", $("[data-ship-status]"));
    } catch (err) {
      setStatus($("[data-ship-status]"), "err", "error: " + (err.message || err));
    }
  });

  paintTokenStatus();

  loadLocalJson("../data/now.json")
    .then(applyNow)
    .catch(function (err) {
      setStatus($("[data-now-status]"), "err", "error: " + (err.message || err));
      paintNow();
    });

  loadLocalJson("../data/ships.json")
    .then(applyShips)
    .catch(function (err) {
      setStatus($("[data-ship-status]"), "err", "error: " + (err.message || err));
    });

  if (token()) hydrateFromGithub();
})();
