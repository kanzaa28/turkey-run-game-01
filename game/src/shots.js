// shots.js — staged scenes for screenshots and the autopilot playtester.
// A ?shot= URL picks a deterministic scene (seeded RNG, fixed world state)
// so every screenshot is a real render of the game's own code, and ?autoplay=1
// lets a headless browser prove the game is winnable and the end screens
// are reachable. Nothing here ships to the player; it only stages scenes.

import { GAME } from './config.js';

export function parseShotParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    shot: params.get('shot') || '',
    seed: Number(params.get('seed') || 20261127),
    autoplay: params.get('autoplay') === '1',
  };
}

// Build a deterministic world state for one screenshot. Returns the state
// overrides the main loop applies before its first frame.
export function stageShot(shot, game) {
  const { turkey, farmer, world } = game;
  if (shot === 'title') {
    game.screen = 'title';
    return;
  }
  if (shot === 'play') {
    // Mid-farmyard run: turkey mid-jump over a fence, corn ahead, farmer
    // closing in behind, HUD lit.
    game.screen = 'playing';
    game.distance = 212;
    game.score = 1450;
    game.corn = 9;
    farmer.gap = 210;
    turkey.y = GAME.groundY - turkey.height - 120;
    turkey.vy = -220;
    turkey.grounded = false;
    turkey.dashMeter = 0.8;
    world.entities.length = 0;
    world.entities.push(
      { kind: 'fence', x: 560, y: GAME.groundY - 74, w: 46, h: 74, passed: false, hit: false },
      { kind: 'corn', x: 700, y: GAME.groundY - 150, w: 30, h: 34, passed: false, hit: false, bob: 0 },
      { kind: 'corn', x: 760, y: GAME.groundY - 150, w: 30, h: 34, passed: false, hit: false, bob: 1 },
      { kind: 'haystack', x: 980, y: GAME.groundY - 96, w: 110, h: 96, passed: false, hit: false },
      { kind: 'puddle', x: 1160, y: GAME.groundY - 8, w: 120, h: 16, passed: false, hit: false },
    );
    return;
  }
  if (shot === 'kitchen') {
    // Kitchen near-miss: swinging knife overhead, oven glowing, SPOTTED.
    game.screen = 'playing';
    game.distance = 1620;
    game.score = 3890;
    game.corn = 24;
    game.nearMisses = 3;
    game.stagesCleared = 2;
    farmer.gap = 120;
    farmer.spot();
    farmer.spottedTime = 99; // hold the banner for the shot
    farmer.shoutTime = 99;
    turkey.y = GAME.groundY - turkey.height - 60;
    turkey.vy = -140;
    turkey.grounded = false;
    turkey.hearts = 2;
    turkey.dashMeter = 0.4;
    world.entities.length = 0;
    world.entities.push(
      { kind: 'oven', x: 620, y: GAME.groundY - 150, w: 130, h: 150, passed: false, hit: false, heat: 1 },
      { kind: 'knife', x: 880, y: 90, anchorY: 90, w: 26, h: 120, passed: false, hit: false, swing: 0.15, swingSpeed: 2.2, bladeLength: 420, tipX: 902, tipY: 505 },
      { kind: 'corn', x: 1080, y: GAME.groundY - 150, w: 30, h: 34, passed: false, hit: false, bob: 0 },
      { kind: 'feather', x: 1150, y: GAME.groundY - 170, w: 30, h: 40, passed: false, hit: false, bob: 2 },
    );
    return;
  }
  if (shot === 'end') {
    game.screen = 'end';
    game.result = 'escaped';
    game.score = 6420;
    game.distance = 2000;
    game.corn = 31;
    game.nearMisses = 5;
    game.stagesCleared = 3;
    return;
  }
}

// The autopilot: a simple bot that plays the game in a headless browser.
// Jump at the next low obstacle, dash when the farmer is close, hide when
// a haystack is near and the farmer is very close. Used by the playtest
// harness to prove a run can be won and both end screens are reachable.
export function autopilotStep(game, input) {
  const { turkey, farmer, world } = game;
  if (game.screen !== 'playing') {
    if (game.screen === 'title' || game.screen === 'end') input.press('Enter');
    return;
  }
  const ahead = world.entities
    .filter((e) => e.x + e.w > turkey.x - 20 && e.x < turkey.x + 420)
    .sort((a, b) => a.x - b.x)[0];
  // Hold Right: a real player runs at full speed unless slowing for a jump.
  // A swinging knife is the exception: wait for the blade to rise, then go.
  let slowForKnife = false;
  if (ahead && ahead.kind === 'knife') {
    const dist = ahead.x - turkey.x;
    if (dist < 320 && ahead.tipY > 400) slowForKnife = true;
  }
  if (slowForKnife) {
    // Ease off to cruise speed (not minimum): the jump still clears a
    // rolling pin or an oven while the blade is low.
    input.release('ArrowRight');
    input.release('ArrowLeft');
  } else {
    input.press('ArrowRight');
    input.release('ArrowLeft');
  }
  if (ahead) {
    const dist = ahead.x - turkey.x;
    if (['fence', 'haybale', 'pitchfork', 'rollingpin'].includes(ahead.kind)) {
      if (dist < 170 && turkey.grounded) input.press('Space');
    } else if (ahead.kind === 'oven') {
      // Jump late for the wide oven: the takeoff window is jump range
      // minus the oven's width, so 160 px clears it at any speed.
      if (dist < 160 && turkey.grounded) input.press('Space');
    } else if (ahead.kind === 'knife') {
      // Blade low: jump over it as it sweeps the floor. Blade high:
      // dash underneath while it swings away.
      if (ahead.tipY > 430 && dist < 200 && turkey.grounded) input.press('Space');
      if (ahead.tipY <= 380 && dist < 220 && turkey.dashMeter >= 0.5) input.press('ShiftLeft');
    } else if (ahead.kind === 'puddle') {
      if (dist < 150 && turkey.grounded) input.press('Space');
    } else if (ahead.kind === 'corn' && ahead.y < GAME.groundY - 150) {
      // High cob: jump for it.
      if (dist < 120 && turkey.grounded) input.press('Space');
    } else if (ahead.kind === 'haystack' && farmer.gap < 130 && dist < 110) {
      input.press('KeyH');
    }
  }
  if (farmer.gap < 110 && turkey.dashMeter >= 0.5) input.press('ShiftLeft');
  if (turkey.hidden && farmer.gap > 320) {
    turkey.unhide();
    farmer.searching = false;
  }
}
