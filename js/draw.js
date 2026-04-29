'use strict';

import { BEAT, BPM, DC, LR, LC, SONG_MS, LEAD_BEATS, COPY, LANE_UNLOCK_MS } from './config.js';
import { phaseLabel } from './patterns.js';
import { game } from './state.js';
import { ctx, W, H, HY, LX, NR } from './canvas.js';

export function rr(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export function drawBG(t) {
  ctx.fillStyle = '#05050a';
  ctx.fillRect(0, 0, W, H);

  if (game.st === 'play' || game.st === 'pause') {
    const bp = ((t - game.gStart) % BEAT) / BEAT;
    game.beatPulse = Math.max(0, 1 - bp * 3.6);
    const ac = game.activeLanes;
    for (let l = 0; l < ac; l++) {
      const x0 = (l * W) / ac;
      const x1 = ((l + 1) * W) / ac;
      const g = ctx.createLinearGradient(x0, 0, x1, 0);
      g.addColorStop(0, 'transparent');
      g.addColorStop(0.5, `rgba(${LR[l]},${0.022 + game.beatPulse * 0.08})`);
      g.addColorStop(1, 'transparent');
      ctx.fillStyle = g;
      ctx.fillRect(x0, 0, x1 - x0, H);
    }
  }

  const gs = 54;
  const go = (t * 0.032) % gs;
  ctx.strokeStyle = 'rgba(255,255,255,.03)';
  ctx.lineWidth = 1;
  for (let y = go; y < H; y += gs) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }
  for (let x = 0; x < W; x += gs) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
}

export function drawLanes() {
  const ac = game.activeLanes;
  for (let i = 1; i < ac; i++) {
    const x = (i * W) / ac;
    ctx.strokeStyle = 'rgba(255,255,255,.09)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(0,0,0,.42)';
  ctx.fillRect(0, HY + NR * 1.9, W, H - HY - NR * 1.9);

  const laneW = W / ac;
  for (let l = 0; l < ac; l++) {
    if (game.flash[l] > 0) {
      ctx.fillStyle = `rgba(${LR[l]},${game.flash[l] * 0.16})`;
      ctx.fillRect((l * W) / ac, 0, laneW, H);
      game.flash[l] = Math.max(0, game.flash[l] - 0.1);
    }
  }
}

export function drawHitZones(t) {
  const ac = game.activeLanes;
  const keys = ['A', 'S', 'D'];
  for (let l = 0; l < ac; l++) {
    const x = LX[l];
    const col = LC[l];
    const rgb = LR[l];
    const pulse = Math.sin(t / 230 + l * 1.3) * 3;

    ctx.beginPath();
    ctx.arc(x, HY, NR + 11 + pulse, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},.2)`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, HY, NR + 4, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${rgb},.7)`;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = col;
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const g = ctx.createRadialGradient(x, HY, 0, x, HY, NR);
    g.addColorStop(0, `rgba(${rgb},.14)`);
    g.addColorStop(1, `rgba(${rgb},.04)`);
    ctx.beginPath();
    ctx.arc(x, HY, NR, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    ctx.font = `bold ${Math.round(NR * 0.52)}px Orbitron,monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(${rgb},.4)`;
    ctx.fillText(keys[l], x, HY);
  }
}

export function drawNotes() {
  for (const n of game.notes) {
    ctx.globalAlpha = n.a;
    const x = LX[n.lane];
    const col = LC[n.lane];
    const rgb = LR[n.lane];
    ctx.shadowColor = col;

    if (n.st === 'h') {
      const p = 1 - n.a;
      ctx.shadowBlur = 14 * n.a;
      ctx.beginPath();
      ctx.arc(x, n.y, NR + p * NR * 2.5, 0, Math.PI * 2);
      ctx.strokeStyle = col;
      ctx.lineWidth = 3 * n.a;
      ctx.stroke();
    } else if (n.st === 'm') {
      ctx.shadowBlur = 8;
      ctx.fillStyle = `rgba(255,68,100,${n.a * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, n.y, NR * 0.65, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const dist = HY - n.y;
      if (dist > 0 && dist < H * 0.55) {
        ctx.globalAlpha = n.a * 0.28;
        ctx.strokeStyle = col;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([3, 7]);
        ctx.beginPath();
        ctx.moveTo(x, n.y + NR);
        ctx.lineTo(x, n.y + Math.min(dist * 0.5, 80));
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = n.a;
      }

      ctx.shadowBlur = 18;
      const g = ctx.createRadialGradient(x, n.y, 0, x, n.y, NR);
      g.addColorStop(0, '#fff');
      g.addColorStop(0.3, col);
      g.addColorStop(1, `rgba(${rgb},.22)`);
      ctx.beginPath();
      ctx.arc(x, n.y, NR, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();

      ctx.shadowBlur = 4;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(x, n.y, NR * 0.22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }
}

export function drawParts() {
  for (const p of game.parts) {
    ctx.globalAlpha = p.a;
    ctx.fillStyle = p.col;
    ctx.shadowColor = p.col;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export function drawFloats() {
  for (const f of game.floats) {
    ctx.globalAlpha = f.a;
    ctx.fillStyle = f.col;
    ctx.shadowColor = f.col;
    ctx.shadowBlur = 10;
    ctx.font = `bold ${Math.round(W * 0.042)}px Orbitron,monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(f.txt, f.x, f.y);
  }
  ctx.shadowBlur = 0;
  ctx.globalAlpha = 1;
}

export function drawHUD(t) {
  const elapsed = t - game.gStart;
  const prog = Math.min(1, elapsed / SONG_MS);
  ctx.fillStyle = 'rgba(255,255,255,.07)';
  ctx.fillRect(0, 0, W, 3);
  ctx.fillStyle = DC[game.diff].col;
  ctx.shadowColor = DC[game.diff].col;
  ctx.shadowBlur = 6;
  ctx.fillRect(0, 0, W * prog, 3);
  ctx.shadowBlur = 0;

  const bw = W * 0.62;
  const bh = 5;
  const bx = (W - bw) / 2;
  const by = 10;
  ctx.fillStyle = 'rgba(255,255,255,.08)';
  rr(bx, by, bw, bh, 2.5);
  ctx.fill();
  const hw = Math.max(0, (game.hp / 100) * bw);
  const hcol = game.hp > 55 ? '#00ff88' : game.hp > 28 ? '#ffd700' : '#ff2d78';
  const hg = ctx.createLinearGradient(bx, 0, bx + bw, 0);
  hg.addColorStop(0, hcol + '88');
  hg.addColorStop(1, hcol);
  ctx.fillStyle = hg;
  ctx.shadowColor = hcol;
  ctx.shadowBlur = 7;
  if (hw > 0) {
    rr(bx, by, hw, bh, 2.5);
    ctx.fill();
  }
  ctx.shadowBlur = 0;

  ctx.font = `bold ${Math.round(Math.min(W * 0.058, 34))}px Orbitron,monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 12;
  ctx.fillText(game.score.toLocaleString(), W / 2, 42);
  ctx.shadowBlur = 0;

  const act = phaseLabel(game.activityLoop);
  ctx.font = `${Math.round(W * 0.018)}px Orbitron,monospace`;
  ctx.fillStyle = 'rgba(255,255,255,.45)';
  ctx.fillText(act, W / 2, 58);

  const songBody = elapsed - LEAD_BEATS * BEAT;
  let tier = 'УРОВЕНЬ 1 — одна дорожка (S, центр)';
  if (songBody >= LANE_UNLOCK_MS[1]) tier = 'УРОВЕНЬ 3 — три дорожки (A S D)';
  else if (songBody >= LANE_UNLOCK_MS[0]) tier = 'УРОВЕНЬ 2 — две дорожки (A S)';
  ctx.font = `${Math.round(W * 0.016)}px Orbitron,monospace`;
  ctx.fillStyle = 'rgba(255,215,0,.55)';
  ctx.fillText(tier, W / 2, 76);

  ctx.font = `${Math.round(W * 0.014)}px Orbitron,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.35)';
  ctx.fillText(COPY.hudGoal, W / 2, 92);

  if (game.combo > 1) {
    const big = game.combo >= 100;
    const sz = Math.min(W * 0.04 + (big ? W * 0.008 : 0), 26);
    ctx.font = `bold ${Math.round(sz)}px Orbitron,monospace`;
    let cc = 'rgba(255,255,255,.9)';
    let cb = 8;
    if (game.combo >= 50) {
      cc = `hsl(${(t / 8) % 360},100%,65%)`;
      cb = 28;
    } else if (game.combo >= 20) {
      cc = '#ffd700';
      cb = 18;
    }
    ctx.fillStyle = cc;
    ctx.shadowColor = cc;
    ctx.shadowBlur = cb;
    ctx.fillText(`${game.combo}× COMBO`, W / 2, 112);
    ctx.shadowBlur = 0;
  }

  const mult = Math.max(1, 1 + Math.floor(game.combo / 20));
  if (mult > 1) {
    ctx.font = `${Math.round(W * 0.029)}px Orbitron`;
    ctx.textAlign = 'right';
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffd700';
    ctx.shadowBlur = 10;
    ctx.fillText(`×${mult}`, W - 10, 28);
    ctx.shadowBlur = 0;
  }

  const tl = Math.max(0, SONG_MS - elapsed);
  if (tl < 11000) {
    const ts = Math.ceil(tl / 1000);
    ctx.font = `bold ${Math.round(W * 0.034)}px Orbitron`;
    ctx.textAlign = 'left';
    ctx.fillStyle = ts <= 5 ? '#ff2d78' : 'rgba(255,255,255,.5)';
    ctx.fillText(`${ts}`, 10, 30);
  }

  ctx.font = `${Math.round(W * 0.02)}px Orbitron`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  const hex = DC[game.diff].col.slice(1);
  const rgbDiff = hex.match(/../g).map((x) => parseInt(x, 16)).join(',');
  ctx.fillStyle = `rgba(${rgbDiff},0.5)`;
  ctx.fillText(DC[game.diff].lbl, 10, H - 12);
}

export function drawPause(t) {
  ctx.fillStyle = 'rgba(0,0,0,.72)';
  ctx.fillRect(0, 0, W, H);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `bold ${Math.round(W * 0.1)}px Orbitron,monospace`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#00d4ff';
  ctx.shadowBlur = 25;
  ctx.fillText('ПАУЗА', W / 2, H / 2 - H * 0.06);
  ctx.shadowBlur = 0;
  const pp = 0.88 + Math.sin(t / 500) * 0.12;
  ctx.font = `bold ${Math.round(W * 0.038 * pp)}px Orbitron`;
  ctx.fillStyle = 'rgba(255,255,255,.7)';
  ctx.fillText('ТАП / ESC — продолжить', W / 2, H / 2 + H * 0.06);
}

/** Меню: сложность + одна кнопка «НАЧАТЬ» */
export function drawMenu(t) {
  drawBG(t);
  const cx = W / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 ${Math.round(W * 0.065)}px Orbitron,monospace`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#9945ff';
  ctx.shadowBlur = 12;
  ctx.fillText('TAP BEATS', cx, H * 0.16);
  ctx.shadowBlur = 0;

  ctx.font = `${Math.round(W * 0.024)}px Orbitron,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.48)';
  ctx.fillText(COPY.tagline, cx, H * 0.24);
  ctx.font = `${Math.round(W * 0.02)}px Orbitron,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.36)';
  ctx.fillText(`${BPM} BPM  •  ${COPY.menuHint}`, cx, H * 0.275);
  const subWords = COPY.menuSub.split(' ');
  const midW = Math.ceil(subWords.length / 2);
  ctx.fillText(subWords.slice(0, midW).join(' '), cx, H * 0.305);
  ctx.fillText(subWords.slice(midW).join(' '), cx, H * 0.33);

  const dks = ['easy', 'norm', 'hard'];
  const dls = ['ЛЕГКО', 'НОРМАЛЬНО', 'СЛОЖНО'];
  const bw = Math.min(W * 0.26, 118);
  const bh = 44;
  const tw = dks.length * bw + (dks.length - 1) * 10;
  const bsx = (W - tw) / 2;
  const bsy = H * 0.38;

  dks.forEach((dk, i) => {
    const bx = bsx + i * (bw + 10);
    const col = DC[dk].col;
    const active = game.diff === dk;
    ctx.shadowColor = col;
    ctx.shadowBlur = active ? 14 : 4;
    ctx.strokeStyle = active ? col : col + '55';
    ctx.lineWidth = active ? 2 : 1;
    rr(bx, bsy, bw, bh, 7);
    ctx.stroke();
    if (active) {
      ctx.fillStyle = col + '1a';
      rr(bx, bsy, bw, bh, 7);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.font = `bold ${Math.round(W * 0.024)}px Orbitron`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = active ? '#fff' : col + 'bb';
    ctx.fillText(dls[i], bx + bw / 2, bsy + bh / 2);
    game.mBtns[dk] = { x: bx, y: bsy, w: bw, h: bh };
  });

  const sbw = Math.min(W * 0.55, 280);
  const sbh = 52;
  const sbx = (W - sbw) / 2;
  const sby = H * 0.56;
  const col = DC[game.diff].col;
  ctx.shadowColor = col;
  ctx.shadowBlur = 18;
  ctx.strokeStyle = col;
  ctx.lineWidth = 2;
  rr(sbx, sby, sbw, sbh, 12);
  ctx.stroke();
  ctx.fillStyle = col + '22';
  rr(sbx, sby, sbw, sbh, 12);
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.font = `bold ${Math.round(W * 0.038)}px Orbitron`;
  ctx.fillStyle = '#fff';
  ctx.fillText('НАЧАТЬ', cx, sby + sbh / 2);
  game.mBtns.play = { x: sbx, y: sby, w: sbw, h: sbh };

  ctx.font = `${Math.round(W * 0.022)}px Orbitron`;
  ctx.fillStyle = 'rgba(255,255,255,.32)';
  ctx.fillText('A S D или тап по зоне колонки', cx, H * 0.7);

  if (game.best[game.diff] > 0) {
    ctx.font = `${Math.round(W * 0.022)}px Orbitron`;
    ctx.fillStyle = 'rgba(255,215,0,.55)';
    ctx.fillText(`★ рекорд  ${game.best[game.diff].toLocaleString()}`, cx, H * 0.78);
  }
}

export function drawResults(t) {
  drawBG(t);
  const cx = W / 2;
  const tot = game.perf + game.grt + game.gd + game.miss;
  const acc =
    tot > 0
      ? Math.round(
          ((game.perf * 1 + game.grt * 0.67 + game.gd * 0.33) / tot) * 100,
        )
      : 0;

  let grade;
  let gcol;
  if (acc >= 95) {
    grade = 'S';
    gcol = '#ffd700';
  } else if (acc >= 85) {
    grade = 'A';
    gcol = '#00ff88';
  } else if (acc >= 70) {
    grade = 'B';
    gcol = '#00d4ff';
  } else if (acc >= 50) {
    grade = 'C';
    gcol = '#9945ff';
  } else {
    grade = 'D';
    gcol = '#ff2d78';
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.font = `bold ${Math.round(W * 0.06)}px Orbitron`;
  ctx.fillStyle = 'rgba(255,255,255,.9)';
  ctx.fillText('РЕЗУЛЬТАТ', cx, H * 0.11);

  const gs = 0.95 + Math.sin(t / 640) * 0.05;
  ctx.save();
  ctx.translate(cx, H * 0.31);
  ctx.scale(gs, gs);
  ctx.font = `900 ${Math.round(W * 0.23)}px Orbitron`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = gcol;
  ctx.shadowColor = gcol;
  ctx.shadowBlur = 36;
  ctx.fillText(grade, 0, 0);
  ctx.restore();
  ctx.shadowBlur = 0;

  const rows = [
    ['СЧЁТ', game.score.toLocaleString(), '#fff'],
    ['ТОЧНОСТЬ', acc + '%', gcol],
    ['МАКС. КОМБО', game.maxCombo + '×', '#00d4ff'],
  ];
  rows.forEach(([lbl, val, col], i) => {
    const y = H * 0.47 + i * H * 0.1;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.font = `${Math.round(W * 0.025)}px Orbitron`;
    ctx.fillStyle = 'rgba(255,255,255,.42)';
    ctx.fillText(lbl, cx, y);
    ctx.font = `bold ${Math.round(W * 0.057)}px Orbitron`;
    ctx.fillStyle = col;
    ctx.shadowColor = col;
    ctx.shadowBlur = 10;
    ctx.fillText(val, cx, y + H * 0.043);
    ctx.shadowBlur = 0;
  });

  ctx.font = `${Math.round(W * 0.019)}px Orbitron,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.38)';
  ctx.fillText(
    `PERFECT ${game.perf}   GREAT ${game.grt}   GOOD ${game.gd}   MISS ${game.miss}`,
    cx,
    H * 0.78,
  );

  ctx.font = `${Math.round(W * 0.02)}px Orbitron,sans-serif`;
  ctx.fillStyle = 'rgba(255,255,255,.4)';
  ctx.fillText(COPY.hudGoal + ' — чем точнее попадания, тем выше оценка.', cx, H * 0.86);

  const rp = 0.9 + Math.sin(t / 450) * 0.1;
  ctx.font = `bold ${Math.round(W * 0.042 * rp)}px Orbitron`;
  ctx.fillStyle = '#fff';
  ctx.shadowColor = DC[game.diff].col;
  ctx.shadowBlur = 18;
  ctx.fillText('[ ТАП — МЕНЮ ]', cx, H * 0.92);
  ctx.shadowBlur = 0;

  if (game.best[game.diff] > 0) {
    ctx.font = `${Math.round(W * 0.02)}px Orbitron`;
    ctx.fillStyle = 'rgba(255,215,0,.55)';
    ctx.fillText(`★ рекорд: ${game.best[game.diff].toLocaleString()}`, cx, H * 0.97);
  }
}
