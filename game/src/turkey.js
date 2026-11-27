// turkey.js — the player: a plump brown turkey with a fanned tail,
// physics (run, jump, dash, hide) and all of its own drawing.
// The turkey stays at a fixed screen column; the world scrolls past it.

import { GAME, TURKEY, PALETTE } from './config.js';

export function createTurkey() {
  return {
    x: TURKEY.x,
    y: GAME.groundY - TURKEY.height, // feet on the ground
    vy: 0,
    width: TURKEY.width,
    height: TURKEY.height,
    grounded: true,
    speed: TURKEY.cruiseSpeed,
    dashTime: 0,
    dashMeter: 1, // 0..1, refills as you run
    hidden: false,
    hideTime: 0,
    hearts: TURKEY.maxHearts,
    invulnerableTime: 0, // brief grace after a hit
    runPhase: 0, // leg-waddle animation phase
    flap: 0, // wing-flap timer after a jump
    facing: 1,

    get feetY() { return this.y + this.height; },

    jump(audio) {
      if (!this.grounded || this.hidden) return false;
      this.vy = TURKEY.jumpVelocity;
      this.grounded = false;
      this.flap = 0.35;
      if (audio) audio.jump();
      return true;
    },

    dash(audio) {
      if (this.dashMeter < 0.5 || this.dashTime > 0 || this.hidden) return false;
      this.dashMeter -= 0.5;
      this.dashTime = TURKEY.dashSeconds;
      if (audio) audio.dash();
      return true;
    },

    hide(audio) {
      if (this.hidden || !this.grounded) return false;
      this.hidden = true;
      this.hideTime = 0;
      if (audio) audio.hide();
      return true;
    },

    unhide() {
      this.hidden = false;
      this.hideTime = 0;
    },

    hurt() {
      if (this.invulnerableTime > 0) return false;
      this.hearts -= 1;
      this.invulnerableTime = 1.6;
      return true;
    },

    update(dt, input, audio) {
      // Speed: Right speeds up, Left slows down; dash overrides both.
      let target = TURKEY.cruiseSpeed;
      if (input.right) target = TURKEY.maxSpeed;
      if (input.left) target = TURKEY.minSpeed;
      if (this.hidden) target = 0;
      if (this.dashTime > 0) {
        this.dashTime -= dt;
        target = TURKEY.dashSpeed;
      }
      this.speed += (target - this.speed) * Math.min(1, dt * 6);
      this.dashMeter = Math.min(1, this.dashMeter + TURKEY.dashRefillPerMetre * this.speed * dt * 0.06);

      // Vertical physics.
      this.vy += GAME.gravity * dt;
      this.y += this.vy * dt;
      const floor = GAME.groundY - this.height;
      if (this.y >= floor) {
        this.y = floor;
        this.vy = 0;
        this.grounded = true;
      } else {
        this.grounded = false;
      }

      if (this.hidden) this.hideTime += dt;
      if (this.invulnerableTime > 0) this.invulnerableTime -= dt;
      if (this.flap > 0) this.flap -= dt;
      this.runPhase += dt * (this.speed / 40);
      return this.speed;
    },

    draw(ctx) {
      if (this.hidden) return; // tucked inside the haystack, invisible
      // Blink while invulnerable after a hit.
      if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime * 12) % 2 === 0) return;
      const x = this.x;
      const y = this.y;
      const waddle = Math.sin(this.runPhase * 2) * 2;
      ctx.save();
      ctx.translate(x, y + waddle * 0.3);

      // Fanned tail: five autumn feathers.
      ctx.save();
      ctx.translate(2, 26);
      PALETTE.turkeyTail.forEach((color, i) => {
        const angle = -0.9 + i * 0.45;
        ctx.save();
        ctx.rotate(angle);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(-16, -14, 7, 17, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // Body: a plump ellipse.
      ctx.fillStyle = PALETTE.turkeyBody;
      ctx.beginPath();
      ctx.ellipse(32, 34, 26, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      // Wing, flapping on jump.
      ctx.fillStyle = PALETTE.turkeyWing;
      ctx.save();
      ctx.translate(30, 30);
      ctx.rotate(this.flap > 0 ? -0.9 : Math.sin(this.runPhase) * 0.15);
      ctx.beginPath();
      ctx.ellipse(-4, 2, 15, 9, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
      // Head + snood + wattle + beak.
      ctx.fillStyle = PALETTE.turkeyHead;
      ctx.beginPath();
      ctx.arc(56, 12, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.turkeyWattle;
      ctx.beginPath();
      ctx.arc(60, 22, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.turkeyBeak;
      ctx.beginPath();
      ctx.moveTo(66, 10);
      ctx.lineTo(76, 14);
      ctx.lineTo(66, 18);
      ctx.closePath();
      ctx.fill();
      // Eye, always looking over its shoulder at the farmer.
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(53, 9, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(54, 8, 1, 0, Math.PI * 2);
      ctx.fill();
      // Legs, waddling.
      ctx.strokeStyle = '#e67e22';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      const legSwing = this.grounded ? Math.sin(this.runPhase * 2) * 7 : 4;
      ctx.beginPath();
      ctx.moveTo(26, 54); ctx.lineTo(26 + legSwing, 62);
      ctx.moveTo(40, 54); ctx.lineTo(40 - legSwing, 62);
      ctx.stroke();
      ctx.restore();
    },
  };
}
