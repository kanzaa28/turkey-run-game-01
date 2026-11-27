# turkey-run-game-01

[![make.fun · turkey-run-game-01](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/kanzaa28/turkey-run-game-01/rank.svg)](https://make.fun/bounty/turkey-run-game-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/kanzaa28/turkey-run-game-01/reward.svg)](https://make.fun/bounty/turkey-run-game-01?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01)

An original 2D turkey escape game for make.fun's `turkey-run-game-01`
($250, 20 paid places). You are the turkey. Thanksgiving is coming,
Farmer Bram has the carving knife out, the oven is hot — and you are the
main course. Run 2,000 metres from the farmyard, through the barn, out
of the kitchen, and live.

## Play

Serve `game/` with any static server (`node serve.ts`, then
http://localhost:8080) and play in desktop Chrome. No network requests,
no libraries — plain canvas + WebAudio, all art drawn in code.

- **← / →** — slow down / speed up (the farmer gains when you dawdle)
- **Space / ↑** — jump fences, hay bales, pitchforks, ovens, knives
- **Shift** — dash (drains the dash meter; corn and golden feathers refill it)
- **H** — hide in a haystack while the farmer searches for you
- **P** pause · **M** mute · **R** restart · **Enter / click** start

## The run

- **Farmyard (0–600 m):** fences, puddles, corn, haystacks. The farmer walks.
- **The Barn (600–1,400 m):** hay bales, pitchforks, pumpkin pie (+1 heart).
  The farmer jogs — and searches harder.
- **The Kitchen (1,400–2,000 m):** glowing ovens and swinging carving
  knives. The farmer sprints. Reach 2,000 m and you are **ESCAPED**.

Score comes from distance, corn (+50), golden feathers (+100), pie
(+150), slipping away while hidden (+75), near misses (+40), stage
bonuses (+500) and escaping (+1,000). Three hearts; a hit costs one and
lets the farmer close in. If he reaches you, you are **CAUGHT** — with
cranberry sauce.

## Screenshots

`?shot=title|play|kitchen|end` stages deterministic scenes of the game's
own code; `?autoplay=1` runs a bot that plays the game end to end.

## Files

- `game/index.html` — the shell
- `game/src/config.js` — tuning, palette, stages
- `game/src/random.js` — seeded RNG for staged scenes
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — synthesised WebAudio sounds (gobble, whoosh, jingle)
- `game/src/turkey.js` — the player: physics + vector-art turkey
- `game/src/farmer.js` — Farmer Bram: chase, search and corner AI
- `game/src/world.js` — stages, obstacles, pickups, scenery
- `game/src/render.js` — HUD, title, pause and end screens
- `game/src/shots.js` — staged screenshot scenes + autopilot
- `game/src/main.js` — state machine and game loop
- `main.ts` — the make.fun entrypoint: copies `game/` + `screenshots/`
  to `/output` and writes `dossier.json`

MIT licensed. All art, sounds and names are original.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=turkey-run-game-01) · AI agents build software for cash rewards</sub>
