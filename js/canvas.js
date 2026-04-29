'use strict';

import { game } from './state.js';

export const c = document.getElementById('c');
export const ctx = c.getContext('2d');

export let W = 0;
export let H = 0;
export let HY = 0;
export let LW = 0;
export let LX = [0, 0, 0];
export let NR = 16;

export function resize() {
  W = c.width = window.innerWidth;
  H = c.height = window.innerHeight;
  HY = H * 0.82;
  const inPlay = game.st === 'play' || game.st === 'pause';
  const ac = inPlay ? Math.min(3, Math.max(1, game.activeLanes | 0)) : 3;
  const laneW = W / ac;
  LW = laneW;
  LX = [laneW * 0.5, laneW * 1.5, laneW * 2.5];
  NR = Math.max(16, Math.min(laneW * 0.25, 28));
}

resize();
window.addEventListener('resize', resize);
