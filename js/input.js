'use strict';

import { c, W } from './canvas.js';
import { game, initGame, goToMenuFromIntro, setDiff, saveBest, setSt } from './state.js';
import { tap, pause, resume } from './notes.js';

function laneFromClientX(clientX) {
  const ac = game.activeLanes;
  return Math.min(ac - 1, Math.max(0, Math.floor(clientX / (W / ac))));
}

function hitRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function menuClick(x, y) {
  if (game.st === 'intro') {
    const r = game.mBtns.introStart;
    if (r && hitRect(x, y, r)) goToMenuFromIntro();
    return;
  }
  if (game.st !== 'menu') return;

  for (const dk of ['easy', 'norm', 'hard']) {
    const r = game.mBtns[dk];
    if (r && hitRect(x, y, r)) {
      setDiff(dk);
      return;
    }
  }
  const play = game.mBtns.play;
  if (play && hitRect(x, y, play)) initGame(game.diff);
}

export function bindInput() {
  c.addEventListener(
    'touchstart',
    (e) => {
      e.preventDefault();
      const t = e.changedTouches[0];
      if (game.st === 'intro' || game.st === 'menu') menuClick(t.clientX, t.clientY);
      else if (game.st === 'play' || game.st === 'pause')
        tap(laneFromClientX(t.clientX));
      else if (game.st === 'results') {
        saveBest();
        setSt('menu');
      }
    },
    { passive: false },
  );

  c.addEventListener('mousedown', (e) => {
    if (game.st === 'intro' || game.st === 'menu') menuClick(e.clientX, e.clientY);
    else if (game.st === 'play' || game.st === 'pause')
      tap(laneFromClientX(e.clientX));
    else if (game.st === 'results') {
      saveBest();
      setSt('menu');
    }
  });

  document.addEventListener('keydown', (e) => {
    const km = {
      a: 0,
      ArrowLeft: 0,
      '1': 0,
      s: 1,
      ArrowDown: 1,
      '2': 1,
      d: 2,
      ArrowRight: 2,
      '3': 2,
    };
    if (km[e.key] !== undefined) {
      if (game.st === 'play' || game.st === 'pause') {
        const lane = km[e.key];
        if (lane < game.activeLanes) {
          e.preventDefault();
          tap(lane);
        }
      }
    }
    if (e.key === 'Escape') {
      if (game.st === 'play') pause();
      else if (game.st === 'pause') resume();
      else if (game.st === 'results') {
        saveBest();
        setSt('menu');
      }
    }
    if ((e.key === ' ' || e.key === 'Enter') && game.st === 'intro') {
      e.preventDefault();
      goToMenuFromIntro();
    }
    if ((e.key === ' ' || e.key === 'Enter') && game.st === 'menu') {
      e.preventDefault();
      initGame(game.diff);
    }
    if ((e.key === ' ' || e.key === 'Enter') && game.st === 'results') {
      e.preventDefault();
      saveBest();
      setSt('menu');
    }
  });
}
