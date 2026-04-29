'use strict';

import { DC, JD_BASE, LC } from './config.js';
import { game, saveBest, setSt } from './state.js';
import { spawnParts, addFloat, spawnComboFlare } from './fx.js';
import { LX, HY, NR } from './canvas.js';

function getJudgments() {
  const mul = DC[game.diff].jdMul;
  return JD_BASE.map((j) => ({
    ...j,
    md: j.md * mul,
  }));
}

export function spawnNotes(t) {
  const tr = DC[game.diff].travel;
  while (game.schedI < game.sched.length) {
    const s = game.sched[game.schedI];
    if (s.ht - tr > t + 70) break;
    game.notes.push({ lane: s.lane, ht: s.ht, y: 0, st: 'f', a: 1 });
    game.schedI++;
  }
}

export function updNotes(t) {
  const tr = DC[game.diff].travel;
  const JD = getJudgments();
  const missTh = HY + JD[2].md + NR + 14;
  for (let i = game.notes.length - 1; i >= 0; i--) {
    const n = game.notes[i];
    if (n.st === 'f') {
      n.y = ((t - (n.ht - tr)) / tr) * HY;
      if (n.y > missTh) doMiss(n);
    } else if (n.st === 'h') {
      n.y -= 2.5;
      n.a -= 0.07;
      if (n.a <= 0) game.notes.splice(i, 1);
    } else if (n.st === 'm') {
      n.a -= 0.055;
      if (n.a <= 0) game.notes.splice(i, 1);
    }
  }
}

function doMiss(n) {
  if (n.st !== 'f') return;
  n.st = 'm';
  game.combo = 0;
  game.miss++;
  const dmg = DC[game.diff].missDmg;
  game.hp = Math.max(0, game.hp - dmg);
  game.shake = Math.max(game.shake, 9);
  spawnParts(LX[n.lane], HY + 6, '#ff4466', 5, false);
  addFloat(LX[n.lane], HY - 58, 'MISS', '#ff4466');
  if (game.hp <= 0) {
    setTimeout(() => {
      saveBest();
      setSt('results');
    }, 360);
  }
}

export function tap(lane) {
  game.flash[lane] = 1;
  if (game.st === 'results') {
    setSt('menu');
    return;
  }
  if (game.st === 'pause') {
    resume();
    return;
  }
  if (game.st !== 'play') return;

  const JD = getJudgments();
  let best = null;
  let bestD = Infinity;
  const maxD = JD[2].md + NR;
  for (const n of game.notes) {
    if (n.lane !== lane || n.st !== 'f') continue;
    const d = Math.abs(n.y - HY);
    if (d < maxD && d < bestD) {
      best = n;
      bestD = d;
    }
  }

  if (!best) {
    addFloat(LX[lane], HY - 42, '×', 'rgba(255,80,80,.7)');
    return;
  }

  let j = null;
  for (const jd of JD) {
    if (bestD <= jd.md) {
      j = jd;
      break;
    }
  }
  if (!j) return;

  best.st = 'h';
  best.a = 1;
  const mult = Math.max(1, 1 + Math.floor(game.combo / 20));
  game.score += j.pt * mult;
  game.combo++;
  game.maxCombo = Math.max(game.maxCombo, game.combo);
  game.hp = Math.min(100, game.hp + j.hp);
  if (j.nm === 'PERFECT') game.perf++;
  else if (j.nm === 'GREAT') game.grt++;
  else game.gd++;

  const isPerf = j.nm === 'PERFECT';
  spawnParts(LX[lane], HY, LC[lane], isPerf ? 20 : 10, isPerf);
  addFloat(LX[lane], HY - 58, j.nm, j.cl);
  if (game.combo >= 20 && game.combo % 10 === 0) spawnComboFlare(game.combo);
}

export function pause() {
  if (game.st !== 'play') return;
  setSt('pause');
  game.pauseT = performance.now();
}

export function resume() {
  if (game.st !== 'pause') return;
  const gap = performance.now() - game.pauseT;
  game.gStart += gap;
  for (const s of game.sched) s.ht += gap;
  for (const n of game.notes) n.ht += gap;
  setSt('play');
}
