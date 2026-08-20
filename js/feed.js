(function () {
  var root = document.querySelector("[data-feed]");
  if (!root) return;

  var src = root.getAttribute("data-src");
  var mode = root.getAttribute("data-mode") || "feed";

  function sortEntries(entries) {
    return entries.slice().sort(function (a, b) {
      if (a.date === b.date) return 0;
      return a.date < b.date ? 1 : -1;
    });
  }

  function text(value) {
    return document.createTextNode(value == null ? "" : String(value));
  }

  // Resolve repo-root-relative links (e.g. demos/particles/) from both / and /ships/.
  function resolveLink(link) {
    if (!link || /^(https?:)?\/\//i.test(link) || link.charAt(0) === "/" || link.charAt(0) === "#") {
      return link;
    }
    var dataDir = (src || "").replace(/[^/]*$/, "");
    var siteRoot = dataDir.replace(/data\/?$/, "");
    return siteRoot + link;
  }

  function el(tag, className) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    return node;
  }

  function renderRecent(entries) {
    root.innerHTML = "";
    sortEntries(entries)
      .slice(0, 5)
      .forEach(function (entry) {
        var item = el("li");

        var date = el("span", "mono meta");
        date.appendChild(text(entry.date));

        var type = el("span", "mono meta");
        type.appendChild(text(entry.type));

        var title = el("a", "title");
        title.href = resolveLink(entry.link) || "#";
        title.appendChild(text(entry.title));

        var arrow = el("a", "arrow mono");
        arrow.href = resolveLink(entry.link) || "#";
        arrow.setAttribute("aria-label", "Open " + entry.title);
        arrow.appendChild(text("→"));

        item.appendChild(date);
        item.appendChild(type);
        item.appendChild(title);
        item.appendChild(arrow);
        root.appendChild(item);
      });
  }

  function unique(values) {
    var seen = {};
    var out = [];
    values.forEach(function (value) {
      if (!seen[value]) {
        seen[value] = true;
        out.push(value);
      }
    });
    return out;
  }

  function readFilters() {
    var params = new URLSearchParams(window.location.search);
    return {
      venture: params.get("venture") || "",
      type: params.get("type") || "",
    };
  }

  function writeFilters(filters) {
    var params = new URLSearchParams();
    if (filters.venture) params.set("venture", filters.venture);
    if (filters.type) params.set("type", filters.type);
    var query = params.toString();
    var next = window.location.pathname + (query ? "?" + query : "") + window.location.hash;
    window.history.replaceState({}, "", next);
  }

  function applyFilters(entries, filters) {
    return entries.filter(function (entry) {
      if (filters.venture && entry.venture !== filters.venture) return false;
      if (filters.type && entry.type !== filters.type) return false;
      return true;
    });
  }

  function renderChips(group, values, selected, onPick) {
    group.innerHTML = "";
    values.forEach(function (value) {
      var button = el("button", "chip" + (selected === value ? " is-active" : ""));
      button.type = "button";
      button.appendChild(text(value === "" ? "all" : value));
      button.setAttribute("aria-pressed", selected === value ? "true" : "false");
      button.addEventListener("click", function () {
        onPick(value);
      });
      group.appendChild(button);
    });
  }

  function renderFeed(entries) {
    var filtersRoot = document.querySelector("[data-filters]");
    var empty = document.querySelector("[data-empty]");
    var filters = readFilters();

    function paint() {
      writeFilters(filters);
      if (filtersRoot) {
        var ventures = unique(entries.map(function (entry) { return entry.venture; })).sort();
        var types = unique(entries.map(function (entry) { return entry.type; }));
        var typeOrder = ["LAUNCH", "WIN", "RELEASE", "POST", "DEMO"];
        types.sort(function (a, b) {
          return typeOrder.indexOf(a) - typeOrder.indexOf(b);
        });

        var ventureRow = filtersRoot.querySelector("[data-filter-venture]");
        var typeRow = filtersRoot.querySelector("[data-filter-type]");
        if (ventureRow) {
          renderChips(ventureRow, [""].concat(ventures), filters.venture, function (value) {
            filters.venture = value;
            paint();
          });
        }
        if (typeRow) {
          renderChips(typeRow, [""].concat(types), filters.type, function (value) {
            filters.type = value;
            paint();
          });
        }
      }

      var visible = sortEntries(applyFilters(entries, filters));
      root.innerHTML = "";
      visible.forEach(function (entry) {
        var item = el("li");

        var line = el("div", "feed-line");
        var date = el("span", "mono muted");
        date.appendChild(text(entry.date));
        var type = el("span", "mono muted");
        type.appendChild(text(entry.type));
        var venture = el("span", "mono muted");
        venture.appendChild(text(entry.venture));
        var title = el("a", "feed-title");
        title.href = resolveLink(entry.link) || "#";
        title.appendChild(text(entry.title + " →"));

        line.appendChild(date);
        line.appendChild(type);
        line.appendChild(venture);
        line.appendChild(title);

        var blurb = el("p", "feed-blurb");
        blurb.appendChild(text(entry.blurb));

        item.appendChild(line);
        item.appendChild(blurb);
        root.appendChild(item);
      });

      if (empty) empty.hidden = visible.length > 0;
    }

    paint();
  }

  var url = src + (src.indexOf("?") >= 0 ? "&" : "?") + "t=" + Date.now();
  fetch(url, { cache: "no-store" })
    .then(function (response) {
      if (!response.ok) throw new Error("Could not load ships");
      return response.json();
    })
    .then(function (entries) {
      if (mode === "recent") renderRecent(entries);
      else renderFeed(entries);
    })
    .catch(function () {
      root.innerHTML = "";
      var item = el(mode === "recent" ? "li" : "li", "muted");
      item.appendChild(text("Feed failed to load. Check data/ships.json."));
      root.appendChild(item);
    });
})();
