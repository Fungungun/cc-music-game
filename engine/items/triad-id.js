/* engine/items/triad-id.js — identify a triad (root position or 1st
   inversion). Precedent: chord-game.html's chord-identification mode.
   Uses content.js TRIADS and the derived chordAbc() (never hand-typed —
   see engine/notation.js header for why). */
import { TRIADS, getTriads } from '../content.js';
import { chordAbc } from '../notation.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

export default {
  id: 'triad-id',
  generate(params, rng) {
    const grade = params.grade || 1;
    const pool = getTriads(grade);
    const triad = pick(pool, rng);
    return {
      type: 'triad-id',
      prompt: 'What chord is this?',
      promptAbc: `X:1\nT:\nM:4/4\nL:1/4\nK:C\n${chordAbc(triad.notes)}|]`,
      answer: triad.name,
      inputMode: 'choice4',
      concept: `triad-id:${triad.key}:${triad.inversion}`,
      meta: { grade, key: triad.key, type: triad.type, inversion: triad.inversion, notes: triad.notes },
    };
  },
  distractors(item, n, rng) {
    const grade = item.meta.grade;
    const pool = getTriads(grade).map((t) => t.name);
    // Plausible confusion: same key, different inversion; or same
    // inversion/quality, a neighbouring key — both realistic mix-ups.
    const sameKeyOtherInversion = TRIADS
      .filter((t) => t.key === item.meta.key && t.name !== item.answer)
      .map((t) => t.name);
    return pickDistractors(item.answer, sameKeyOtherInversion, pool, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — ${item.answer}.` : `That was ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
