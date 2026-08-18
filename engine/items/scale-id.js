/* engine/items/scale-id.js — shown a scale notated ascending, identify
   which scale it is. Precedent: none directly (scale-builder.html is a
   piano-click "build the scale" exercise, not an identification MCQ) —
   found as a real gap while mapping course/ lessons to item types for
   engine/curriculum.js: 07/08-*.md (grade 1) and grade2/01-*.md have no
   item type at all otherwise. Same proven shape as interval-id.js/
   triad-id.js (render notation, MCQ the name), built the same night. */
import { SCALES, getScales } from '../content.js';
import { toneToAbc } from '../notation.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

export default {
  id: 'scale-id',
  generate(params, rng) {
    const grade = params.grade || 1;
    const pool = getScales(grade);
    const scale = pick(pool, rng);
    const abcNotes = scale.notes.map(toneToAbc).join('');
    return {
      type: 'scale-id',
      prompt: 'Which scale is this?',
      promptAbc: `X:1\nT:\nM:4/4\nL:1/4\nK:C\n${abcNotes}|]`,
      answer: scale.name,
      inputMode: 'choice4',
      concept: `scale-id:${scale.key}`,
      meta: { grade, key: scale.key, type: scale.type },
    };
  },
  distractors(item, n, rng) {
    const grade = item.meta.grade;
    const pool = getScales(grade).map((s) => s.name);
    // Plausible confusion: same type (major vs harmonic minor), or the
    // relative-minor/major pairing — a much more realistic mix-up than
    // an unrelated key.
    const sameType = SCALES[3].filter((s) => s.type === item.meta.type && s.name !== item.answer).map((s) => s.name);
    return pickDistractors(item.answer, sameType, pool, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — ${item.answer}.` : `That was ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
