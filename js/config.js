'use strict';

/** BPM → ms per beat */
export const BPM = 128;
export const BEAT = 60000 / BPM;

/** Song length (ms) and scheduling */
export const SONG_MS = 120000;
export const LEAD_BEATS = 4;

/** Lane colors */
export const LC = ['#ff2d78', '#00d4ff', '#9945ff'];
export const LR = ['255,45,120', '0,212,255', '153,69,255'];

/** Difficulty: note travel time, tint, label, miss damage, judgment scale */
export const DC = {
  easy: {
    travel: 2400,
    col: '#00ff88',
    lbl: 'ЛЕГКО',
    missDmg: 10,
    jdMul: 1.35,
  },
  norm: {
    travel: 2000,
    col: '#00d4ff',
    lbl: 'НОРМАЛЬНО',
    missDmg: 13,
    jdMul: 1.12,
  },
  hard: {
    travel: 1500,
    col: '#ff2d78',
    lbl: 'СЛОЖНО',
    missDmg: 15,
    jdMul: 1,
  },
};

/** Base judgments; effective window = md * jdMul from DC */
export const JD_BASE = [
  { nm: 'PERFECT', md: 22, pt: 300, cl: '#ffd700', hp: 3 },
  { nm: 'GREAT', md: 44, pt: 200, cl: '#00d4ff', hp: 1 },
  { nm: 'GOOD', md: 66, pt: 100, cl: '#00ff88', hp: 0 },
];

/** One 16-beat block ≈ 7.5 s — cycle 4 “активности” */
export const BEATS_PER_LOOP = 16;

/**
 * Прогрессия дорожек по времени после лид-ина (мс):
 * до LANE_UNLOCK_MS[0] — 1 колонка, до [1] — 2, дальше — 3.
 */
export const LANE_UNLOCK_MS = [38000, 76000];

/** Короткие тексты «зачем играть» (для экранов и HUD) */
export const COPY = {
  tagline: 'Поймай ритм — не дай энергии упасть до конца трека.',
  menuSub:
    'Шарики падают вниз по дорожке. Нажми в тот миг, когда шарик совпадает с ярким кольцом внизу — это не стрельба и не «сбивание», а тайминг. Сначала одна дорожка, потом две, потом три.',
  menuHint:
    'Цель: продержаться до конца песни с максимальным счётом. Дорожки открываются по ходу — сначала проще.',
  hudGoal: 'Тап, когда шарик совпал с кольцом внизу',
  hudLeadIn: 'Совпади шарик с кольцом — тап в этот миг (A S D)',
};

/** Сколько колонок активно в момент t (мс) тела трека после лид-ина */
export function activeLaneCapAtBodyMs(ms) {
  if (ms < 0) return 1;
  if (ms < LANE_UNLOCK_MS[0]) return 1;
  if (ms < LANE_UNLOCK_MS[1]) return 2;
  return 3;
}
