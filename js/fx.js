'use strict';

import { game } from './state.js';
import { W, H } from './canvas.js';

export function spawnParts(x, y, col, n, perfect) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + Math.random() * 0.5;
    const sp = perfect ? 4 + Math.random() * 5 : 1.5 + Math.random() * 3;
    game.parts.push({
      x,
      y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - (perfect ? 2 : 1),
      r: perfect ? 2 + Math.random() * 3 : 1.5 + Math.random() * 2,
      col,
      a: 1,
      l: 0,
      ml: perfect ? 52 : 36,
    });
  }
  if (perfect) {
    for (let i = 0; i < 7; i++) {
      game.parts.push({
        x: x + (Math.random() - 0.5) * 55,
        y: y + (Math.random() - 0.5) * 30,
        vx: (Math.random() - 0.5) * 2,
        vy: -Math.random() * 4 - 1,
        r: 1 + Math.random() * 2.5,
        col: '#ffd700',
        a: 1,
        l: 0,
        ml: 58,
      });
    }
  }
}

export function spawnComboFlare(combo) {
  const hue = (combo * 7) % 360;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    game.parts.push({
      x: W / 2,
      y: H / 2,
      vx: Math.cos(a) * 6,
      vy: Math.sin(a) * 6,
      r: 3,
      col: `hsl(${hue},100%,65%)`,
      a: 1,
      l: 0,
      ml: 45,
    });
  }
}

export function updParts() {
  for (let i = game.parts.length - 1; i >= 0; i--) {
    const p = game.parts[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.18;
    p.vx *= 0.95;
    p.a = 1 - ++p.l / p.ml;
    if (p.a <= 0) game.parts.splice(i, 1);
  }
}

export function addFloat(x, y, txt, col) {
  game.floats.push({ x, y, txt, col, a: 1, vy: -1.6 });
}

export function updFloats() {
  for (let i = game.floats.length - 1; i >= 0; i--) {
    const f = game.floats[i];
    f.y += f.vy;
    f.a -= 0.024;
    if (f.a <= 0) game.floats.splice(i, 1);
  }
}
