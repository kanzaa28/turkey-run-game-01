// main.ts — the entrypoint for GOBBLE OR GONE (turkey-run-game-01).
// Node 22, standard library only. It copies this repository's game/ and
// screenshots/ into /output (or MAKEFUN_OUTPUT_DIR outside the grader)
// and writes /output/dossier.json with the kit's vendored buildDossier,
// so the judge reads exactly the game and screenshots handed in.
// The program is deterministic: two runs write byte-identical output.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

// The gate's caps, from the kit's RULES.txt: dossier text at most 160 KiB,
// at most 4 screenshots of at most 256 KiB each, game/ at most 993 files
// and 48 MiB, every path under game/ at most 1,000 bytes.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(out, 'dossier.json'), dossier);

// A one-line receipt on stderr so a run's output is checkable at a glance;
// it never touches the bytes the grader compares.
console.error(`gobble-or-gone: wrote ${join(out, 'dossier.json')} (${Buffer.byteLength(dossier)} bytes)`);
