// farmer.js — the pursuer: Farmer Bram, in overalls and a straw hat.
// He chases, he searches haystacks, and he corners a turkey that stalls.
// His gap behind the turkey is the run's real health bar.

import { GAME, FARMER, PALETTE } from './config.js';

export function createFarmer() {
  return {
    gap: FARMER.startGap, // px behind the turkey's x
    searching: false,
    searchTime: 0,
    spotted: false,
    spottedTime: 0,
    walkPhase: 0,
    shout: '', // speech bubble text, shown when he spots or searches
    shoutTime: 0,

    get x() { return 300 - this.gap - FARMER.width; },
    get caught() { return this.gap <= FARMER.catchDistance; },

    // Called when the turkey is seen in the open: a speed boost + a shout.
    spot(audio) {
      if (this.spotted) return;
      this.spotted = true;
      this.spottedTime = 3;
      this.shout = 'THERE YOU ARE!';
      this.shoutTime = 1.6;
      if (audio) audio.spotted();
    },

    // Called when the turkey ducks into a haystack: he stops and searches.
    startSearch() {
      this.searching = true;
      this.searchTime = FARMER.searchSeconds;
      this.shout = 'WHERE DID IT GO?';
      this.shoutTime = 2.2;
    },

    update(dt, turkeySpeed, turkeyHidden, stageMultiplier) {
      // Closing speed: he gains when the turkey is slow, loses when it sprints.
      const turkeySlowdown = Math.max(0, 300 - turkeySpeed);
      let closeRate = FARMER.baseGain * stageMultiplier + turkeySlowdown * 0.55;
      if (this.spotted) closeRate += FARMER.spottedBoost;
      if (this.searching) {
        closeRate = 0;
        this.searchTime -= dt;
        if (this.searchTime <= 0) {
          this.searching = false;
          // Giving up costs him ground: the turkey slipped away.
          this.gap = Math.min(560, this.gap + 130);
        }
      }
      if (turkeyHidden && !this.searching) this.startSearch();
      if (this.spottedTime > 0) {
        this.spottedTime -= dt;
        if (this.spottedTime <= 0) this.spotted = false;
      }
      if (this.shoutTime > 0) this.shoutTime -= dt;
      this.gap -= closeRate * dt;
      // The turkey pulling away opens the gap again (it cannot go negative
      // except by being caught; it caps at a far, safe distance). Sprinting
      // recovers ground slowly, so the chase never fully goes away.
      const pullAway = Math.max(0, turkeySpeed - 280) * 0.25;
      this.gap += pullAway * dt;
      this.gap = Math.max(10, Math.min(620, this.gap));
      this.walkPhase += dt * (6 + closeRate / 12);
    },

    draw(ctx) {
      // The farmer is always drawn on screen: when the gap is wide he
      // lurks just at the left edge, so the chase is always visible.
      const x = Math.max(-60, Math.min(260, this.x));
      const y = GAME.groundY - FARMER.height;
      const bob = Math.sin(this.walkPhase) * 2;
      ctx.save();
      ctx.translate(x, y + bob);
      // Legs in overalls, mid-stride.
      const stride = Math.sin(this.walkPhase) * 10;
      ctx.strokeStyle = PALETTE.farmerOveralls;
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(30, 78); ctx.lineTo(30 + stride, 104);
      ctx.moveTo(46, 78); ctx.lineTo(46 - stride, 104);
      ctx.stroke();
      // Overalls body.
      ctx.fillStyle = PALETTE.farmerOveralls;
      ctx.fillRect(20, 52, 40, 30);
      // Shirt sleeves + arms pumping.
      ctx.fillStyle = PALETTE.farmerShirt;
      ctx.fillRect(12, 34, 14, 26);
      ctx.fillRect(52, 34, 14, 26);
      // Shirt torso.
      ctx.fillStyle = PALETTE.farmerShirt;
      ctx.fillRect(18, 30, 44, 26);
      // Head, beard, nose.
      ctx.fillStyle = PALETTE.farmerSkin;
      ctx.beginPath();
      ctx.arc(40, 20, 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = PALETTE.farmerBeard;
      ctx.beginPath();
      ctx.arc(40, 27, 10, 0, Math.PI);
      ctx.fill();
      ctx.fillStyle = '#1a1a1a';
      ctx.beginPath();
      ctx.arc(45, 18, 2, 0, Math.PI * 2);
      ctx.fill();
      // Straw hat.
      ctx.fillStyle = PALETTE.farmerHat;
      ctx.beginPath();
      ctx.ellipse(40, 10, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(26, -2, 28, 12);
      // The carving knife in his hand — the reason to run.
      ctx.save();
      ctx.translate(64, 48);
      ctx.rotate(0.5);
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(0, 0, 5, 16);
      ctx.fillStyle = '#d7dbdd';
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(30, -6); ctx.lineTo(30, 2); ctx.lineTo(0, 6);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
      // Speech bubble.
      if (this.shoutTime > 0 && this.shout) {
        ctx.font = 'bold 17px Georgia, serif';
        const w = ctx.measureText(this.shout).width + 18;
        ctx.fillStyle = '#fff8e7';
        ctx.strokeStyle = '#5d4037';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(6, -52, w, 30, 8);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = '#5d4037';
        ctx.fillText(this.shout, 15, -32);
      }
      ctx.restore();
    },
  };
}
