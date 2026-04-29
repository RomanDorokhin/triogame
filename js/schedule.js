'use strict';

import {
  BEAT,
  BEATS_PER_LOOP,
  LEAD_BEATS,
  SONG_MS,
  activeLaneCapAtBodyMs,
} from './config.js';
import { getPatternForLoop } from './patterns.js';

/**
 * @param {number} gStart
 * @param {string} diff
 * @returns {{ ht: number, lane: number }[]}
 */
export function buildSched(gStart, diff) {
  const loops = Math.ceil(SONG_MS / (BEATS_PER_LOOP * BEAT)) + 1;
  const out = [];
  const seen = new Set();
  for (let L = 0; L < loops; L++) {
    const pat = getPatternForLoop(diff, L);
    for (const row of pat) {
      const beat = row[0];
      const bodyMs = (L * BEATS_PER_LOOP + beat) * BEAT;
      const cap = activeLaneCapAtBodyMs(bodyMs);
      const raw = row.slice(1).map((ln) => ln % cap);
      const lanes = [...new Set(raw)].sort((a, b) => a - b);
      const toSpawn = lanes.length ? lanes : [0];
      for (const lane of toSpawn) {
        const ht = gStart + (LEAD_BEATS + L * BEATS_PER_LOOP + beat) * BEAT;
        const key = `${ht.toFixed(2)}_${lane}`;
        if (seen.has(key)) continue;
        seen.add(key);
        out.push({ ht, lane });
      }
    }
  }
  out.sort((a, b) => a.ht - b.ht);
  return out;
}
