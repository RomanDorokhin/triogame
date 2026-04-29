'use strict';

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
  LW = W / 3;
  LX = [LW * 0.5, LW * 1.5, LW * 2.5];
  NR = Math.max(16, Math.min(LW * 0.25, 28));
}

resize();
window.addEventListener('resize', resize);
