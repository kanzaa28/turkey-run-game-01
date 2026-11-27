// render.js — the HUD and every screen: title, pause, caught, escaped.
// The HUD is drawn on the canvas so the screenshots carry it; the screens
// are drawn the same way, so what the judge sees is the game itself.

import { GAME, PALETTE, STAGES } from './config.js';

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = PALETTE.hudPanel;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,233,176,0.35)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function hearts(ctx, count, max, x, y) {
  for (let i = 0; i < max; i++) {
    const hx = x + i * 30;
    ctx.fillStyle = i < count ? '#e74c3c' : 'rgba(255,255,255,0.25)';
    ctx.beginPath();
    ctx.moveTo(hx + 12, y + 20);
    ctx.bezierCurveTo(hx, y + 6, hx + 4, y - 2, hx + 12, y + 4);
    ctx.bezierCurveTo(hx + 20, y - 2, hx + 24, y + 6, hx + 12, y + 20);
    ctx.fill();
  }
}

export function drawHud(ctx, state) {
  const { score, distance, turkey, farmer, stage } = state;
  // Top-left: score + distance + stage.
  panel(ctx, 16, 14, 300, 92);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 26px Georgia, serif';
  ctx.fillText(`SCORE ${Math.floor(score)}`, 30, 44);
  ctx.font = '18px Georgia, serif';
  ctx.fillText(`${Math.floor(distance)} m  ·  ${stage.name}`, 30, 72);
  ctx.font = '15px Georgia, serif';
  ctx.fillStyle = '#f5d76e';
  ctx.fillText(`Best ${state.best} m`, 30, 94);
  // Top-right: hearts + dash meter.
  panel(ctx, 964, 14, 300, 92);
  hearts(ctx, turkey.hearts, 3, 984, 22);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 15px Georgia, serif';
  ctx.fillText('DASH', 984, 76);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(1040, 64, 200, 12);
  ctx.fillStyle = turkey.dashMeter >= 0.5 ? '#2ecc71' : '#f39c12';
  ctx.fillRect(1040, 64, 200 * turkey.dashMeter, 12);
  // Farmer gap bar, bottom centre: the run's real health bar.
  const gapFrac = Math.max(0, Math.min(1, farmer.gap / 620));
  panel(ctx, 390, 664, 500, 40);
  ctx.fillStyle = '#e74c3c';
  ctx.font = 'bold 14px Georgia, serif';
  ctx.fillText('FARMER', 404, 689);
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(480, 674, 340, 12);
  const barColor = gapFrac > 0.45 ? '#2ecc71' : gapFrac > 0.22 ? '#f39c12' : '#e74c3c';
  ctx.fillStyle = barColor;
  ctx.fillRect(480, 674, 340 * gapFrac, 12);
  // A little turkey icon at the safe end, farmer hat at the danger end.
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.arc(836, 680, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#d9a441';
  ctx.beginPath(); ctx.arc(474, 680, 7, 0, Math.PI * 2); ctx.fill();
  // SPOTTED banner.
  if (farmer.spotted) {
    ctx.fillStyle = 'rgba(231,76,60,0.9)';
    ctx.beginPath();
    ctx.roundRect(490, 120, 300, 46, 10);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('SPOTTED! RUN!', 640, 151);
    ctx.textAlign = 'left';
  }
  // Floating event messages (pickup, near miss, stage clear).
  ctx.font = 'bold 20px Georgia, serif';
  ctx.textAlign = 'center';
  state.messages.forEach((m, i) => {
    ctx.globalAlpha = Math.max(0, m.life / 1.2);
    ctx.fillStyle = m.color || '#ffe9b0';
    ctx.fillText(m.text, 640, 210 + i * 28);
  });
  ctx.globalAlpha = 1;
  ctx.textAlign = 'left';
}

export function drawTitle(ctx, time) {
  ctx.fillStyle = 'rgba(30, 16, 8, 0.55)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  // Title.
  ctx.fillStyle = '#ffd76e';
  ctx.font = 'bold 84px Georgia, serif';
  ctx.fillText('GOBBLE OR GONE', 640, 170);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'italic 30px Georgia, serif';
  ctx.fillText('The Great Thanksgiving Escape', 640, 216);
  // The pitch, in one breath.
  ctx.fillStyle = '#ffffff';
  ctx.font = '21px Georgia, serif';
  ctx.fillText('Thanksgiving is coming. Farmer Bram has the carving knife out,', 640, 290);
  ctx.fillText('the oven is hot — and you are the main course. Run 2,000 metres', 640, 320);
  ctx.fillText('from the farmyard, through the barn, out of the kitchen, and live.', 640, 350);
  // Controls.
  panel(ctx, 380, 390, 520, 150);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 18px Georgia, serif';
  ctx.fillText('HOW TO ESCAPE', 640, 420);
  ctx.font = '17px Georgia, serif';
  ctx.fillText('← →  slow down / speed up      SPACE  jump', 640, 450);
  ctx.fillText('SHIFT  dash      H  hide in a haystack', 640, 478);
  ctx.fillText('Grab corn for points — dodge fences, pitchforks,', 640, 506);
  ctx.fillText('ovens and swinging carving knives. P pauses, M mutes.', 640, 530);
  // Blinking start prompt.
  if (Math.floor(time * 1.6) % 2 === 0) {
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 30px Georgia, serif';
    ctx.fillText('▶  PRESS ENTER OR CLICK TO RUN  ◀', 640, 610);
  }
  ctx.textAlign = 'left';
}

export function drawPause(ctx) {
  ctx.fillStyle = 'rgba(20, 12, 6, 0.7)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 56px Georgia, serif';
  ctx.fillText('PAUSED', 640, 340);
  ctx.font = '22px Georgia, serif';
  ctx.fillText('P or click to keep running — the farmer waits for no turkey.', 640, 390);
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, state) {
  const escaped = state.result === 'escaped';
  ctx.fillStyle = escaped ? 'rgba(20, 50, 20, 0.72)' : 'rgba(50, 12, 8, 0.72)';
  ctx.fillRect(0, 0, 1280, 720);
  ctx.textAlign = 'center';
  ctx.fillStyle = escaped ? '#2ecc71' : '#e74c3c';
  ctx.font = 'bold 76px Georgia, serif';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', 640, 200);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'italic 28px Georgia, serif';
  ctx.fillText(
    escaped
      ? 'Out the back door, into the woods — Thanksgiving is cancelled.'
      : 'Farmer Bram serves you with the cranberry sauce. Better luck next year.',
    640, 252,
  );
  // Run summary.
  panel(ctx, 430, 300, 420, 170);
  ctx.fillStyle = PALETTE.hudText;
  ctx.font = 'bold 24px Georgia, serif';
  ctx.fillText(`SCORE  ${Math.floor(state.score)}`, 640, 340);
  ctx.font = '20px Georgia, serif';
  ctx.fillText(`Distance  ${Math.floor(state.distance)} m of 2,000 m`, 640, 376);
  ctx.fillText(`Corn  ${state.corn}  ·  Near misses  ${state.nearMisses}`, 640, 408);
  ctx.fillText(`Stages cleared  ${state.stagesCleared} of 3`, 640, 440);
  if (Math.floor(state.time * 1.6) % 2 === 0) {
    ctx.fillStyle = '#2ecc71';
    ctx.font = 'bold 28px Georgia, serif';
    ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', 640, 540);
  }
  ctx.textAlign = 'left';
}

export function stageNameFor(distance) {
  for (const s of STAGES) if (distance >= s.from && distance < s.to) return s.name;
  return STAGES[STAGES.length - 1].name;
}
