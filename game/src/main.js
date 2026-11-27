// main.js — the state machine and game loop for GOBBLE OR GONE.
// Screens: title → playing → paused → end (caught or escaped).
// The loop owns score, distance, lives and the farmer's pursuit; the
// modules own their own update and draw.

import { GAME, STAGES, SCORES, FARMER } from './config.js';
import { createTurkey } from './turkey.js';
import { createFarmer } from './farmer.js';
import { createWorld, stageForDistance, METRES_TO_PX } from './world.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { drawHud, drawTitle, drawPause, drawEnd } from './render.js';
import { parseShotParams, stageShot, autopilotStep } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = GAME.width;
canvas.height = GAME.height;

const input = createInput();
const audio = createAudio();
const params = parseShotParams();

const game = {
  screen: 'title',
  result: null, // 'caught' | 'escaped'
  score: 0,
  distance: 0,
  best: 0,
  corn: 0,
  nearMisses: 0,
  stagesCleared: 0,
  messages: [],
  time: 0,
  runsEscaped: 0,
  runsCaught: 0,
  turkey: createTurkey(),
  farmer: createFarmer(),
  world: createWorld(params.seed),
  stage: STAGES[0],
};

function addMessage(text, color) {
  game.messages.push({ text, color: color || '#ffe9b0', life: 1.4 });
  if (game.messages.length > 3) game.messages.shift();
}

function handleEvent(event) {
  const { turkey, farmer } = game;
  if (event.type === 'pickup') {
    if (event.kind === 'corn') {
      game.score += SCORES.corn;
      game.corn += 1;
      addMessage(`+${SCORES.corn} CORN`, '#f1c40f');
      audio.pickup();
    } else if (event.kind === 'feather') {
      game.score += SCORES.feather;
      turkey.dashMeter = 1;
      addMessage(`+${SCORES.feather} GOLDEN FEATHER — DASH FULL`, '#ffd700');
      audio.pickup();
    } else if (event.kind === 'pie') {
      game.score += SCORES.pie;
      if (turkey.hearts < 3) turkey.hearts += 1;
      addMessage(`+${SCORES.pie} PUMPKIN PIE — +1 HEART`, '#e67e22');
      audio.pickup();
    }
  } else if (event.type === 'hit') {
    if (turkey.hurt()) {
      audio.hurt();
      farmer.gap = Math.max(FARMER.catchDistance + 30, farmer.gap - 60);
      addMessage('OUCH! The farmer gains on you!', '#e74c3c');
      if (turkey.hearts <= 0) endRun('caught');
    }
  } else if (event.type === 'trip') {
    if (turkey.hurt()) {
      audio.hurt();
      farmer.gap = Math.max(FARMER.catchDistance + 30, farmer.gap - 50);
      addMessage('You slipped in a puddle!', '#e74c3c');
      if (turkey.hearts <= 0) endRun('caught');
    }
  } else if (event.type === 'cleared') {
    game.score += 10;
  }
}

function endRun(result) {
  game.result = result;
  game.screen = 'end';
  if (result === 'escaped') {
    game.score += SCORES.escapeBonus;
    game.runsEscaped += 1;
    audio.escapeJingle();
  } else {
    game.runsCaught += 1;
    audio.caughtSting();
  }
  game.best = Math.max(game.best, Math.floor(game.distance));
  try {
    localStorage.setItem('gobble-or-gone-best', String(game.best));
  } catch (err) { /* storage may be unavailable; the run still counts */ }
}

function startRun() {
  game.turkey = createTurkey();
  game.farmer = createFarmer();
  game.world.reset(params.seed);
  game.screen = 'playing';
  game.result = null;
  game.score = 0;
  game.distance = 0;
  game.corn = 0;
  game.nearMisses = 0;
  game.stagesCleared = 0;
  game.messages = [];
  audio.unlock();
  audio.gobble();
}

function update(dt) {
  game.time += dt;
  for (const m of game.messages) m.life -= dt;
  game.messages = game.messages.filter((m) => m.life > 0);

  if (game.screen === 'title') {
    if (input.consumeConfirm()) startRun();
    return;
  }
  if (game.screen === 'end') {
    if (input.consumeRestart() || input.consumeConfirm()) startRun();
    return;
  }
  if (game.screen !== 'playing') return;

  if (input.consumePause()) {
    game.screen = 'paused';
    return;
  }
  if (input.consumeMute()) audio.toggleMute();

  const { turkey, farmer, world } = game;
  if (input.consumeJump()) turkey.jump(audio);
  if (input.consumeDash()) turkey.dash(audio);
  if (input.consumeHide()) {
    const haystack = world.nearestHaystack(turkey.x);
    if (haystack && !turkey.hidden) {
      turkey.hide(audio);
      farmer.startSearch();
      game.score += SCORES.hideBonus;
      addMessage(`+${SCORES.hideBonus} SLIPPED AWAY!`, '#2ecc71');
    }
  }

  const speed = turkey.update(dt, input, audio);
  const gained = world.update(dt, speed, turkey, audio, handleEvent);
  game.distance += gained;
  game.score += gained * 2; // distance itself scores: 2 points a metre

  const stage = stageForDistance(game.distance);
  if (stage !== game.stage) {
    game.stage = stage;
    game.stagesCleared += 1;
    game.score += SCORES.stageBonus;
    addMessage(`+${SCORES.stageBonus} ${stage.name} — IT GETS HOTTER!`, '#ffd76e');
    audio.stageClear();
  }

  // Spotted: the farmer sees the turkey in the open while close.
  if (!turkey.hidden && farmer.gap < 190 && !farmer.searching) farmer.spot(audio);

  farmer.update(dt, speed, turkey.hidden, stage.farmerSpeed);

  if (world.nearMissCheck(turkey)) {
    game.score += SCORES.nearMiss;
    game.nearMisses += 1;
    addMessage(`+${SCORES.nearMiss} BY A WHISKER!`, '#f39c12');
  }

  if (farmer.caught) endRun('caught');
  if (game.distance >= GAME.escapeDistance) endRun('escaped');
}

function draw() {
  const { turkey, farmer, world } = game;
  if (game.screen === 'title') {
    // The title plays over a live farmyard backdrop.
    world.draw(ctx, 0, game.time);
    turkey.draw(ctx);
    drawTitle(ctx, game.time);
    return;
  }
  if (game.screen === 'paused') {
    world.draw(ctx, game.distance, game.time);
    turkey.draw(ctx);
    farmer.draw(ctx);
    drawHud(ctx, game);
    drawPause(ctx);
    return;
  }
  if (game.screen === 'end') {
    world.draw(ctx, game.distance, game.time);
    drawEnd(ctx, game);
    return;
  }
  // Playing.
  world.draw(ctx, game.distance, game.time);
  farmer.draw(ctx);
  turkey.draw(ctx);
  drawHud(ctx, game);
}

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  if (params.autoplay) autopilotStep(game, input);
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// Best distance remembered across runs on this machine.
try {
  game.best = Number(localStorage.getItem('gobble-or-gone-best') || 0);
} catch (err) { /* ignore */ }

// Staged screenshot scenes (?shot=title|play|kitchen|end) are real renders:
// the scene is set up, then the loop draws it every frame.
if (params.shot) {
  game.world.setDistance(params.shot === 'play' ? 212 : params.shot === 'kitchen' ? 1620 : 0);
  stageShot(params.shot, game);
  game.stage = stageForDistance(game.distance);
  if (params.shot === 'play' || params.shot === 'kitchen') {
    // Freeze the action for a clean screenshot: no updates, just draws.
    draw();
  }
}
if (!params.shot || params.shot === 'title') requestAnimationFrame(loop);
if (params.shot === 'play' || params.shot === 'kitchen' || params.shot === 'end') {
  // Keep drawing the frozen frame (fonts settle, canvas stays live).
  const redraw = () => { draw(); requestAnimationFrame(redraw); };
  requestAnimationFrame(redraw);
}

// Test hooks for the headless playtest harness.
window.__game = game;
window.__startRun = startRun;
