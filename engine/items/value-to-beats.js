/* engine/items/value-to-beats.js — shown a note/rest, how many beats is
   it worth in 4/4? Precedent: note-values.html — with one deliberate fix.

   note-values.html:380 rendered the note's NAME ("Crotchet") directly
   above the question "How many beats is a crotchet worth?" — the answer
   was visible in the question itself; notation reading was never
   actually tested. This item shows ONLY the notation (via promptAbc),
   never the name — the prompt text below is generic and names nothing. */
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
  id: 'value-to-beats',
  generate(params, rng) {
    const grade = params.grade || 1;
    const type = params.type || 'both';
    const nv = pick(getNoteValues(grade, type), rng);
    // note-values.html's ABC convention: L:1/8, so a bare letter is a
    // quaver; nv.abc already carries its own duration multiplier (B8,
    // B4, B2, B, B/2, B6, B3, B3/2) exactly as authored there.
    return {
      type: 'value-to-beats',
      prompt: nv.isNote ? 'How many beats is this note worth in 4/4 time?' : 'How many beats is this rest worth in 4/4 time?',
      promptAbc: `X:1\nT:\nM:4/4\nL:1/8\nK:C\n${nv.abc}|]`,
      answer: beatsLabel(nv.beatsIn44),
      inputMode: 'choice4',
      concept: `value-to-beats:${nv.id}`,
      meta: { noteValueId: nv.id, beatsIn44: nv.beatsIn44, isNote: nv.isNote },
    };
  },
  distractors(item, n, rng) {
    const allBeats = [0.25, 0.5, 0.75, 1, 1.5, 2, 3, 4].map(beatsLabel);
    const own = item.meta.beatsIn44;
    // Plausible confusion: half or double the real value (a very common
    // real mistake — e.g. thinking a minim is 1 beat instead of 2, or a
    // crotchet is 2 instead of 1), then fall back to the nearest others.
    const weighted = [beatsLabel(own / 2), beatsLabel(own * 2), beatsLabel(own * 1.5), beatsLabel(own + 1)]
      .filter((l) => allBeats.includes(l));
    return pickDistractors(item.answer, weighted, allBeats, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    const label = item.meta.isNote ? 'note' : 'rest';
    return correct
      ? `Yes — that ${label} is worth ${item.answer}.`
      : `That ${label} is worth ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
