'use strict';

import { BEAT, LEAD_BEATS, SONG_MS } from './config.js';
import { BEATS_PER_LOOP, getPatternForLoop } from './patterns.js';

/**
 * @param {number} gStart
 * @param {string} diff
 * @returns {{ ht: number, lane: number }[]}
 */
export function buildSched(gStart, diff) {
  const loops = Math.ceil(SONG_MS / (BEATS_PER_LOOP * BEAT)) + 1;
  const out = [];
  for (let L = 0; L < loops; L++) {
    const pat = getPatternForLoop(diff, L);
    for (const row of pat) {
      const beat = row[0];
      const lanes = row.slice(1);
      for (const lane of lanes) {
        out.push({ ht: gStart + (LEAD_BEATS + L * BEATS_PER_LOOP + beat) * BEAT, lane });
      }
    }
  }
  out.sort((a, b) => a.ht - b.ht);
  return out;
}
