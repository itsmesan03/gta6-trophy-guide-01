[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/itsmesan03/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/itsmesan03/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

# gta6-trophy-guide-01 — Leonida Trophy Guide for GTA VI

Entry for the make.fun competition "GTA 6 Trophy Guide":
https://make.fun/bounty/gta6-trophy-guide-01

An offline guide and tracker for all 55 Grand Theft Auto VI trophies on
PlayStation 5: a roadmap to platinum, a missables view, and a plain-words
guide to each trophy with sources. The tracker remembers what you earned, and
story spoilers stay hidden unless you ask for them. No account, no network.

## Run it

The guide is plain static files under `app/` — no build step, no network
loads, any static server can host it.

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `app/` and
`screenshots/` into the output directory and writes `dossier.json` with the
kit's vendored library. Open `out/app/index.html` in a browser.

## Screenshots

- `screenshots/1-cover.jpg` — tracker, 13 of 55 earned
- `screenshots/2-roadmap.jpg` — roadmap to platinum
- `screenshots/3-missables.jpg` — missables view
- `screenshots/4-spoiler.jpg` — tracker with story spoilers hidden
