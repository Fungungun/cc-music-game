/* Music Maestro — engine/items/_shared.js
   Common helpers for item type modules. Phase 2.1, 2026-08-17. */
import { shuffle, without } from '../rng.js';

/* Every MCQ item must render exactly 4 plausible options — never fewer.
   The current app ships 2-option questions in five places (Grade 1-2
   cadences, higher/lower aural, form-detective's form/cadence questions,
   mock-exam cadences), which reduces "answer correctly" to a coin flip
   that still gets scored as knowledge. This throws loudly instead of
   silently shipping a weak question — a failing test is better than a
   50%-by-guessing item reaching a child. */
export function assembleChoices(correct, distractors, rng) {
  const uniqueDistractors = [...new Set(distractors)].filter((d) => d !== correct);
  if (uniqueDistractors.length < 3) {
    throw new Error(
      `assembleChoices: need 3 distinct distractors, got ${uniqueDistractors.length} ` +
      `(correct="${correct}", distractors=[${distractors.join(', ')}]) — widen the distractor ` +
      `pool for this item type rather than shipping fewer than 4 options.`
    );
  }
  return shuffle([correct, ...uniqueDistractors.slice(0, 3)], rng);
}

/* Pick n distinct plausible distractors from a pool of {value, weight}-ish
   candidates, highest-weight first, falling back to random fill from the
   remaining pool if there aren't enough weighted candidates. `weighted`
   is an array of values already in priority order (most-plausible-
   confusion first); `pool` is the full universe to fall back to. */
export function pickDistractors(correct, weighted, pool, n, rng) {
  const out = [];
  for (const w of weighted) {
    if (out.length >= n) break;
    if (w !== correct && !out.includes(w)) out.push(w);
  }
  if (out.length < n) {
    const remaining = without(correct, pool).filter((v) => !out.includes(v));
    const fill = shuffle(remaining, rng).slice(0, n - out.length);
    out.push(...fill);
  }
  return out.slice(0, n);
}
