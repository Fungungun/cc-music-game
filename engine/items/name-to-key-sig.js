/* engine/items/name-to-key-sig.js — reverse of key-sig-to-name: given a
   major key name, how many sharps or flats does it have? */
import { KEY_SIGNATURES } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

function sigLabel(ks) {
  if (ks.sharps > 0) return `${ks.sharps} sharp${ks.sharps > 1 ? 's' : ''}`;
  if (ks.flats > 0) return `${ks.flats} flat${ks.flats > 1 ? 's' : ''}`;
  return 'no sharps or flats';
}

// Same grade-1-scarcity reasoning as key-sig-to-name.js: only 3 distinct
// signature labels exist at grade 1, one short of 4 options. Distractor
// labels are drawn from the full grade-3 range of possible signatures.
const ALL_SIG_LABELS = [...new Set(KEY_SIGNATURES[3].map(sigLabel))];

export default {
  id: 'name-to-key-sig',
  generate(params, rng) {
    const grade = params.grade || 1;
    const ks = pick(KEY_SIGNATURES[Math.min(grade, 3)], rng);
    return {
      type: 'name-to-key-sig',
      prompt: `How many sharps or flats does ${ks.key} have?`,
      answer: sigLabel(ks),
      inputMode: 'choice4',
      concept: `name-to-key-sig:${ks.key}`,
      meta: { grade, key: ks.key },
    };
  },
  distractors(item, n, rng) {
    return pickDistractors(item.answer, [], ALL_SIG_LABELS, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — ${item.meta.key} has ${item.answer}.` : `${item.meta.key} has ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
