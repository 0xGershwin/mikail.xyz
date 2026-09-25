# mikail.xyz

## Current: holding page (since 2026-09-24)

The homepage is a deliberately simple under-construction page while the full site is rebuilt.

| File | Role |
|---|---|
| `index.html` | Public page: photo, name, headline, GitHub link (inline CSS/JS) |
| `site.json` | `{ "headline": "...", "avatarVersion": "..." }`, fetched with `cache: "no-store"` |
| `avatar.jpg` | 512px profile photo, loaded as `avatar.jpg?v=<avatarVersion>` |
| `admin/` | Unlisted editor (noindex): crop and upload photo, edit headline, waits until Pages is live |
| `favicon.svg` | Favicon |

**Editing:** open `/admin/` and use a fine-grained PAT with **Contents: Read and write** on
`0xGershwin/mikail.xyz`. It's stored in `localStorage` under `mikail.admin.pat`, the same key the
previous admin used. Each save is one commit via the Git Data API; identical saves commit nothing.

**Still served, just unlinked:** `/demos/particles/`, `/demos/perlin/`, `/ships/`, `/writing/`, `data/*.json`,
`assets/`, `css/`, `js/` (the old homepage's data and assets, kept for the full site).

**Rollback** to the previous homepage and admin:

```bash
git checkout pre-holding-2026-09-24 -- index.html admin/index.html
git rm avatar.jpg site.json favicon.svg && git commit -m "Restore previous homepage" && git push
```

---

## Previous site (pre-holding): kept for reference

Static personal site. Hosted on GitHub Pages from the default branch root.

Live: https://0xgershwin.github.io/mikail.xyz/

## Edit identity

The one-liner under the name on the home page is `data/site.json`:

```json
{
  "thesis": "one line under the name",
  "avatar": "assets/avatar.jpg",
  "avatarUpdated": "2026-08-20T17:50:00.000Z"
}
```

`avatar` is optional — drop it and the header renders text only. Upload from `/admin/`, which center-crops to a 512px square JPEG, commits it to `assets/avatar.jpg`, and stamps `avatarUpdated` so the CDN copy is not reused.

## Edit now

The home “Now” block is `data/now.json`:

```json
{
  "updated": "2026-08-19",
  "lines": ["paragraph one", "paragraph two"]
}
```

## Edit ships

All feed entries live in `data/ships.json`. Each object:

```json
{
  "date": "2026-08-19",
  "type": "LAUNCH",
  "venture": "agents",
  "title": "short changelog title",
  "link": "https://github.com/MikailR",
  "blurb": "one line"
}
```

- `type` is one of `LAUNCH`, `WIN`, `RELEASE`, `POST`, `DEMO`
- `venture` is one of `agents`, `rwa`, `markets`, `labs`
- `date` is ISO `YYYY-MM-DD`

Home shows the five newest entries. `/ships` shows the full reverse-chronological log and filters by venture and type.

## Admin

Unlisted console at `/admin/` (not linked from public nav). It edits `data/site.json`, `data/now.json`, and `data/ships.json` and publishes by committing to `0xGershwin/mikail.xyz` on the default branch through the GitHub Contents API.

Needs a **fine-grained PAT** with `contents:write` on `0xGershwin/mikail.xyz`. Paste it once in the admin UI. The token is stored only in that browser’s `localStorage` — never in this repo, never on a server.

## Local

No build step. From the repo root:

```bash
python3 -m http.server 8000
```

Then open http://127.0.0.1:8000/
