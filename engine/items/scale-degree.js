/* engine/items/scale-degree.js — AMEB Grade 1 Theory gap: "in the key of
   X, which scale degree is this note?" No precedent in the current app.
   (Grade 3's interval-quiz.html "in a key" mode is a related-but-distinct
   skill — naming the INTERVAL from the keynote, not the degree number —
   and is covered by interval-id with a keyContext param, not this type.) */
import { getScales } from '../content.js';
import { toneToAbc } from '../notation.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th'];

function adjacentDegrees(degree) {
  // A degree-counting slip almost always lands on a neighbour (off-by-one),
  // not a random degree — the plausible confusion for "3rd" is "2nd" or
  // "4th", not "7th".
  const i = ORDINALS.indexOf(degree);
  const out = [];
  for (const d of [-2, -1, 1, 2]) {
    const j = i + d;
    if (j >= 0 && j < ORDINALS.length) out.push(ORDINALS[j]);
  }
  return out;
}

export default {
  id: 'scale-degree',
  generate(params, rng) {
    const grade = params.grade || 1;
    const scale = pick(getScales(grade).filter((s) => s.type === 'major'), rng);
    const degreeIndex = Math.floor(rng ? rng() : Math.random() * 7); // 0-6, degree 8 == degree 1
    const note = scale.notes[degreeIndex];
    return {
      type: 'scale-degree',
      prompt: `In the key of ${scale.key} major, which scale degree is this note?`,
      promptAbc: `X:1\nT:\nM:4/4\nL:1/4\nK:${scale.key}\n${toneToAbc(note)}4|]`,
      answer: ORDINALS[degreeIndex],
      inputMode: 'choice4',
      concept: `scale-degree:${scale.key}:${ORDINALS[degreeIndex]}`,
      meta: { key: scale.key, note },
    };
  },
  distractors(item, n, rng) {
    return pickDistractors(item.answer, adjacentDegrees(item.answer), ORDINALS.slice(0, 7), n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct
      ? `Yes — the ${item.answer} degree of ${item.meta.key} major.`
      : `That's the ${item.answer} degree of ${item.meta.key} major, not the ${given}.`;
  },
  speak(item) { return item.prompt; },
};
