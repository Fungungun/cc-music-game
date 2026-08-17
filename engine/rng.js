/* Music Maestro — engine/rng.js
   Seedable PRNG. Phase 2.1, 2026-08-17.

   Every existing question generator in the app uses raw Math.random(),
   which makes a session impossible to reproduce (can't replay a bug
   report, can't write a deterministic "generate 500 items and check
   invariants" test without accepting flakiness). mulberry32 is a small,
   fast, public-domain 32-bit PRNG — good enough for picking quiz items
   and distractors (not cryptography), and its short, auditable
   implementation is preferable here to a dependency. */

export function createRng(seed) {
  let a = seed >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Pick a random element. `rng` defaults to Math.random for call sites that
   don't need reproducibility (e.g. live gameplay); pass a seeded rng in
   tests for determinism. */
export function pick(arr, rng) {
  rng = rng || Math.random;
  return arr[Math.floor(rng() * arr.length)];
}

/* Fisher-Yates shuffle — unbiased, unlike the sort(() => Math.random()-0.5)
   pattern used throughout the current app (exam-questions.js:9, and
   independently re-implemented in at least 6 other files), which is a
   well-known biased shuffle (it doesn't produce a uniform permutation). */
export function shuffle(arr, rng) {
  rng = rng || Math.random;
  const out = arr.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function pickN(arr, n, rng) {
  return shuffle(arr, rng).slice(0, n);
}

export function without(val, arr) {
  return arr.filter((v) => v !== val);
}
