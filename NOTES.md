# GOBBLE OR GONE — The Great Thanksgiving Escape — build notes

Entry for `turkey-run-game-01` ("Make the best turkey escape game",
$250, 20 paid places, closes 29 Nov 2026 10:00 WITA).
Package root (this directory) is the GitHub repo root. BUILD ONLY — not
bundled, not submitted, nothing signed. Parent handles repo + bundle +
submit.

## What was built

An original 2D canvas turkey escape game (no libraries, no network, all
art drawn in code, all sound synthesised live with WebAudio). The player
is a turkey running 2,000 m from the farmyard, through the barn, out of
the kitchen — chased by Farmer Bram with his carving knife.

- **3 stages, escalating:** Farmyard (fences, puddles, corn, haystacks;
  farmer walks) → Barn (hay bales, pitchforks, pumpkin pie +1 heart;
  farmer jogs) → Kitchen (glowing ovens, swinging pendulum carving
  knives, rolling pins; farmer sprints).
- **Farmer AI:** chases with a visible gap bar; gains when the turkey
  slows/stalls/is hit, loses when it sprints; SPOTTED! speed boost +
  shout when close and in the open; searches haystacks (turkey hides
  with H, slips away +75, farmer loses ground).
- **Player tools:** ←/→ speed control, Space jump (1.0 s floaty air),
  Shift dash (meter refills as you run, golden feather refills it),
  H hide in haystacks. Score from distance, corn +50, feather +100,
  pie +150, hide +75, near-miss +40, stage bonus +500, escape +1,000.
- **Screens:** title (with instructions + start prompt), HUD (score,
  distance, stage, best, 3 hearts, dash meter, farmer gap bar, SPOTTED
  banner, floating event messages), pause, CAUGHT! and ESCAPED! end
  screens with run summary + restart (R / click).
- **Sound:** WebAudio synth — gobble, jump, dash, pickup, hurt, knife
  whoosh, spotted alarm, stage jingle, escape arpeggio, caught sting.
  M mutes.

## Files

- `game/index.html` — shell (data-URI favicon, no external refs)
- `game/src/config.js` — tuning, palette, stages
- `game/src/random.js` — seeded RNG for staged scenes
- `game/src/input.js` — keyboard + mouse
- `game/src/audio.js` — synthesised sounds
- `game/src/turkey.js` — player physics + vector-art turkey
- `game/src/farmer.js` — chase/search/corner AI + farmer art
- `game/src/world.js` — stages, obstacles, pickups, scenery
- `game/src/render.js` — HUD, title, pause, end screens
- `game/src/shots.js` — `?shot=` staged scenes + autopilot playtester
- `game/src/main.js` — state machine + loop
- `main.ts` — entrypoint (revised after first write, rule 11);
  `vendor/makefun-game.ts` copied from the kit unchanged
  (sha256 dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129)
- `screenshots/` — 4 real renders, 1280x720 JPEG, 48–91 KB each

## Measured verification (headless Chromium, CDP)

- **Playtest (autopilot, `?autoplay=1`, 150 s runs):** final run —
  **ESCAPED twice** (runsEscaped 2, runsCaught 0), escape-run scores
  ~5,800–5,900 before the +1,000 escape bonus; best single-run reach
  1,973 m with 3 hearts. Corn collected (up to 10/run), near-misses
  counted (up to 5/run), all 3 stages reached.
- **Forced-state tests:** farmer gap forced to 50 → CAUGHT! end screen;
  distance forced to 1,995 m → ESCAPED! end screen (score 1,510 incl.
  +1,000 bonus). Restart works (autopilot restarts from end screens).
- **Console errors: 0. External requests: 0. Failed requests: 0.**
  11 local requests per load (index + 10 modules), all same-origin.
- **Bugs found and fixed in-session:** farmer closed 26 px/s at cruise
  (unwinnable) → 6 px/s; corn spawned too high to collect on the run →
  two heights; knife blade hung above jump reach (decorative only) →
  rebuilt as a floor-sweeping pendulum; oven jump landed inside the oven
  (jump range < trigger + width) → floatier jump (1.0 s air) + later
  trigger; autopilot slowed to 150 px/s for knives, where jumps can't
  clear a rolling pin → slows to cruise instead.
- **Dossier:** `MAKEFUN_OUTPUT_DIR` run twice into separate dirs —
  **byte-identical, sha256
  e2e0ab7ebb726a1bcba05d8bae89f34e126828e41f8cf104ec272c588a96c654**,
  381,412 bytes; text block 59,196 bytes, all 11 source files whole,
  no truncation; total output 679,747 bytes (caps: 64 MiB / 1,000
  entries). No local scorer exists for this comp (server grades it).
- **Screenshots:** `?shot=title|play|kitchen|end`, all visually checked
  at full size: title, mid-run HUD, kitchen SPOTTED near-miss, ESCAPED!
  summary. No scrollbars, no external content.

## Weaknesses, honestly

- The autopilot never gets caught (it always sprints, gap stays 620);
  the caught path is proven only by the forced-state test. A human who
  dawdles will be caught, but the chase pressure at cruise is gentle
  (gap shrinks ~3 px/s) — the tension comes mostly from hazard hits.
- The kitchen is the make-or-break stretch: the bot still dies there
  sometimes (2 escapes in 150 s across the final runs). A skilled human
  with dash + hide has more tools than the bot, but the last 600 m are
  hard — by design, and the near-miss bonuses reward threading it.
- Flat vector art, no textures: it reads cleanly at contact-sheet size,
  but it is not a richly illustrated scene. The title screen and the
  kitchen near-miss shot carry most of the visual weight.
- Sounds are synth-only (no recorded audio); the judge sees the
  screenshots + source outline, so sound is a play-feel bonus only.

## For the parent (submit time)

- Repo must be created AFTER the competition opened (2026-11-27
  02:00 UTC); add `.makefun/owner.json` (wallet
  5WZTqcSuhjjizXsWk2pF7RyoN1UrYFAbT1xLWYxdqb5d) at push time, NOT in
  this package dir. README needs the three live make.fun badges +
  GitHub About (website on make.fun, topic `makefun`) before submit.
- Title suggestion: "GOBBLE OR GONE — The Great Thanksgiving Escape".
- Bundle with COMPLETE --muse-usage rows (this build session + parent).
- Next blind round: 2026-11-27 14:00 UTC — submit before then to be
  judged in round 1.
