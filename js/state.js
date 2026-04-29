'use strict';

import { BEAT, LEAD_BEATS, LANE_UNLOCK_MS } from './config.js';
import { buildSched } from './schedule.js';

/** Единый объект состояния (присваивания из других модулей безопасны). */
export const game = {
  st: /** @type {'intro'|'menu'|'play'|'pause'|'results'} */ ('intro'),
  diff: 'norm',
  score: 0,
  combo: 0,
  maxCombo: 0,
  perf: 0,
  grt: 0,
  gd: 0,
  miss: 0,
  hp: 65,
  notes: /** @type {any[]} */ ([]),
  parts: /** @type {any[]} */ ([]),
  floats: /** @type {any[]} */ ([]),
  flash: [0, 0, 0],
  shake: 0,
  beatPulse: 0,
  sched: /** @type {{ ht: number, lane: number }[]} */ ([]),
  schedI: 0,
  gStart: 0,
  pauseT: 0,
  activityLoop: 0,
  /** Активных игровых колонок 1…3 (растёт по времени трека) */
  activeLanes: 1,
  best: { easy: 0, norm: 0, hard: 0 },
  mBtns: /** @type {Record<string, {x:number,y:number,w:number,h:number}>} */ ({}),
};

export function setSt(v) {
  game.st = v;
}

export function setDiff(d) {
  game.diff = d;
}

export function goToMenuFromIntro() {
  game.st = 'menu';
}

export function initGame(d) {
  game.diff = d;
  game.st = 'play';
  game.score = game.combo = game.maxCombo = game.perf = game.grt = game.gd = game.miss = 0;
  game.hp = 72;
  game.notes.length = 0;
  game.parts.length = 0;
  game.floats.length = 0;
  game.flash = [0, 0, 0];
  game.shake = game.beatPulse = 0;
  game.schedI = 0;
  game.activityLoop = 0;
  game.activeLanes = 1;
  game.gStart = performance.now();
  game.sched = buildSched(game.gStart, game.diff);
}

export function saveBest() {
  game.best[game.diff] = Math.max(game.best[game.diff], game.score);
}

export function updateActivityLoop(t) {
  const elapsed = t - game.gStart;
  const beat = elapsed / BEAT - LEAD_BEATS;
  game.activityLoop = Math.max(0, Math.floor(beat / 16));
}

/** После лид-ина: сначала 1 колонка, затем 2, затем 3 */
export function updateLaneUnlock(t) {
  const songMs = t - game.gStart - LEAD_BEATS * BEAT;
  if (songMs < LANE_UNLOCK_MS[0]) game.activeLanes = 1;
  else if (songMs < LANE_UNLOCK_MS[1]) game.activeLanes = 2;
  else game.activeLanes = 3;
}
