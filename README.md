# mikail.xyz

Static personal site. Hosted on GitHub Pages from the default branch root.

Live: https://0xgershwin.github.io/mikail.xyz/

## Edit identity

The one-liner under the name on the home page is `data/site.json`:

```json
{ "thesis": "one line under the name" }
```

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
