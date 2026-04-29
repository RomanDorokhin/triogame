'use strict';

import { SONG_MS } from './config.js';
import { ctx, W, H, resize } from './canvas.js';
import { game, saveBest, setSt, updateActivityLoop, updateLaneUnlock } from './state.js';
import { spawnNotes, updNotes } from './notes.js';
import { updParts, updFloats } from './fx.js';
import {
  drawBG,
  drawLanes,
  drawHitZones,
  drawNotes,
  drawParts,
  drawFloats,
  drawHUD,
  drawPause,
  drawIntro,
  drawMenu,
  drawResults,
} from './draw.js';
import { bindInput } from './input.js';

bindInput();

function loop(t) {
  requestAnimationFrame(loop);

  let ox = 0;
  let oy = 0;
  if (game.shake > 0) {
    ox = (Math.random() - 0.5) * game.shake * 2.5;
    oy = (Math.random() - 0.5) * game.shake * 2.5;
    game.shake *= 0.72;
    if (game.shake < 0.3) game.shake = 0;
  }
  ctx.save();
  if (ox || oy) ctx.translate(ox, oy);

  if (game.st === 'intro') {
    drawIntro(t);
  } else if (game.st === 'menu') {
    drawMenu(t);
  } else if (game.st === 'play') {
    if (t - game.gStart > SONG_MS) {
      saveBest();
      setSt('results');
    }
    updateActivityLoop(t);
    updateLaneUnlock(t);
    resize();
    spawnNotes(t);
    updNotes(t);
    updParts();
    updFloats();
    drawBG(t);
    drawLanes();
    drawHitZones(t);
    drawNotes();
    drawParts();
    drawFloats();
    drawHUD(t);
  } else if (game.st === 'pause') {
    updateActivityLoop(t);
    updateLaneUnlock(t);
    resize();
    drawBG(t);
    drawLanes();
    drawHitZones(t);
    drawNotes();
    drawParts();
    drawFloats();
    drawHUD(t);
    drawPause(t);
  } else if (game.st === 'results') {
    updParts();
    drawResults(t);
  }

  ctx.restore();
}

requestAnimationFrame(loop);
