/* engine/items/beats-to-value.js — reverse of value-to-beats: given a
   beat count, which note/rest name is worth that many beats? */
import { getNoteValues } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

function beatsLabel(beats) {
  if (beats === 0.25) return '¼ beat';
  if (beats === 0.5) return '½ beat';
  if (beats === 0.75) return '¾ beat';
  if (beats === 1) return '1 beat';
  if (beats === 1.5) return '1½ beats';
  return `${beats} beats`;
}

export default {
  id: 'beats-to-value',
  generate(params, rng) {
    const grade = params.grade || 1;
    const type = params.type || 'both';
    const nv = pick(getNoteValues(grade, type), rng);
    return {
      type: 'beats-to-value',
      prompt: `Which ${nv.isNote ? 'note' : 'rest'} is worth ${beatsLabel(nv.beatsIn44)} in 4/4 time?`,
      answer: nv.name,
      inputMode: 'choice4',
      concept: `beats-to-value:${nv.id}`,
      meta: { noteValueId: nv.id, isNote: nv.isNote, grade, type: nv.isNote ? 'notes' : 'rests' },
    };
  },
  distractors(item, n, rng) {
    const pool = getNoteValues(6, item.meta.type).map((v) => v.name); // full range, same isNote/isRest kind
    const own = getNoteValues(6, 'both').find((v) => v.name === item.answer);
    // Plausible confusion: the note/rest one step longer or shorter in the
    // standard halving sequence (semibreve>minim>crotchet>quaver>semiquaver).
    const order = ['Semibreve', 'Minim', 'Crotchet', 'Quaver', 'Semiquaver'];
    const baseOrder = order.filter((o) => pool.includes(o));
    const i = baseOrder.indexOf(item.answer);
    const weighted = [baseOrder[i - 1], baseOrder[i + 1]].filter(Boolean);
    return pickDistractors(item.answer, weighted, pool, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — the ${item.answer}.` : `That's the ${item.answer}, not the ${given}.`;
  },
  speak(item) { return item.prompt; },
};
