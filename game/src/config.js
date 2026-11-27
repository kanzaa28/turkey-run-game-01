// config.js — tuning, palette and stage definitions for GOBBLE OR GONE.
// One clear job: every number the game balances on lives here, so tuning
// never hides inside the physics or the renderer.

export const GAME = {
  width: 1280,
  height: 720,
  groundY: 600, // top of the ground band
  gravity: 2000, // px/s^2 — a floaty jump: 1.0 s of air, so a jump clears
  // the widest oven (130 px) from a fair takeoff window at any speed
  escapeDistance: 2000, // metres to the woods — reaching it means ESCAPED
};

export const TURKEY = {
  x: 300, // fixed screen column; the world scrolls past
  width: 64,
  height: 58,
  cruiseSpeed: 300, // px/s of world scroll at cruise
  minSpeed: 150,
  maxSpeed: 430,
  jumpVelocity: -1000,
  dashSpeed: 720, // px/s while dashing
  dashSeconds: 0.55,
  dashRefillPerMetre: 0.011, // dash meter refills as you run
  maxHearts: 3,
};

export const FARMER = {
  width: 74,
  height: 104,
  // Farmer speed is the turkey's cruise speed minus the gap drift: he gains
  // when the turkey slows, stalls or hides, and loses when the turkey sprints.
  // At cruise the gap is nearly stable, so hazards — not a timer — decide runs.
  baseGain: 6, // px/s he closes per second at cruise
  spottedBoost: 60, // extra closing speed while SPOTTED
  searchSeconds: 2.4, // how long he searches a haystack before giving up
  catchDistance: 46, // gap below this and the turkey is CAUGHT
  startGap: 340, // px behind the turkey at the start of a run
};

export const STAGES = [
  {
    id: 'farmyard',
    name: 'THE FARMYARD',
    from: 0,
    to: 600,
    sky: ['#f7b733', '#e8862e'],
    ground: '#7a5230',
    grass: '#c98f3d',
    farmerSpeed: 1.0,
    obstacleGap: [420, 700],
    kinds: ['fence', 'puddle', 'corn', 'haystack'],
  },
  {
    id: 'barn',
    name: 'THE BARN',
    from: 600,
    to: 1400,
    sky: ['#8a4b2d', '#5e2f1e'],
    ground: '#4a2c17',
    grass: '#8a5a2b',
    farmerSpeed: 1.18,
    obstacleGap: [360, 600],
    kinds: ['haybale', 'pitchfork', 'haystack', 'corn', 'pie'],
  },
  {
    id: 'kitchen',
    name: 'THE KITCHEN',
    from: 1400,
    to: 2000,
    sky: ['#3d2b4f', '#241a33'],
    ground: '#33241f',
    grass: '#6b4a3a',
    farmerSpeed: 1.38,
    obstacleGap: [360, 560],
    kinds: ['oven', 'knife', 'rollingpin', 'corn', 'feather'],
  },
];

export const SCORES = {
  corn: 50,
  feather: 100,
  pie: 150,
  stageBonus: 500,
  hideBonus: 75, // slipping away while the farmer searches
  nearMiss: 40, // clearing a knife or oven by a whisker
  escapeBonus: 1000,
};

export const PALETTE = {
  turkeyBody: '#8a5a2b',
  turkeyWing: '#6e4520',
  turkeyHead: '#a06a35',
  turkeyWattle: '#c0392b',
  turkeyBeak: '#e67e22',
  turkeyTail: ['#b5651d', '#d35400', '#e67e22', '#f39c12', '#c0392b'],
  farmerShirt: '#4a6fa5',
  farmerOveralls: '#2e4a6b',
  farmerHat: '#d9a441',
  farmerSkin: '#e8b88a',
  farmerBeard: '#e8e0d0',
  corn: '#f1c40f',
  featherGold: '#ffd700',
  hudPanel: 'rgba(20, 12, 6, 0.72)',
  hudText: '#ffe9b0',
  danger: '#e74c3c',
  safe: '#2ecc71',
};
