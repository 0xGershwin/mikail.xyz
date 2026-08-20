# mikail.xyz

Static personal site. Hosted on GitHub Pages from the default branch root.

Live: https://0xgershwin.github.io/mikail.xyz/

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
- `venture` is one of `agents`, `rwa`, `markets`
- `date` is ISO `YYYY-MM-DD`

Home shows the five newest entries. `/ships` shows the full reverse-chronological log and filters by venture and type.

## Local

No build step. From the repo root:

```bash
python3 -m http.server 8000
```

Then open http://127.0.0.1:8000/
