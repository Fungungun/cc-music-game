/* engine/items/complete-the-bar.js — shown one note in a bar, choose
   which note value completes it exactly. No precedent in the current
   app. New item type — kept deliberately simple (single given note +
   single missing note, simple time signatures only) rather than a
   general multi-note bar-filling solver, to keep the arithmetic
   trivially verifiable rather than clever. */
import { NOTE_VALUES, getNoteValues } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

// Simple time signatures only (compound bar-completion needs 3-eighth
// beat grouping logic complete-the-bar doesn't need to solve yet).
const BARS = [
  { sig: '2/4', beats: 2 },
  { sig: '3/4', beats: 3 },
  { sig: '4/4', beats: 4 },
];

function beatsLabel(beats) {
  if (beats === 0.25) return '¼ beat';
  if (beats === 0.5) return '½ beat';
  if (beats === 0.75) return '¾ beat';
  if (beats === 1) return '1 beat';
  if (beats === 1.5) return '1½ beats';
  return `${beats} beats`;
}

// Every (given, missing) note-value pair from the grade-scoped pool whose
// beats sum EXACTLY to the bar length. Computed from data, not
// hand-authored, so it can never drift from NOTE_VALUES' real beat
// values (the exact class of bug engine/content.js's cadence-ABC fix
// closed for chord data — see engine/notation.js header).
function validPairs(bar, pool) {
  const out = [];
  for (const given of pool) {
    for (const missing of pool) {
      if (given.beatsIn44 + missing.beatsIn44 === bar.beats) out.push({ given, missing });
    }
  }
  return out;
}

export default {
  id: 'complete-the-bar',
  generate(params, rng) {
    const grade = params.grade || 1;
    const pool = getNoteValues(grade, 'notes');
    const bar = pick(BARS, rng);
    const pairs = validPairs(bar, pool);
    if (!pairs.length) return null; // caller should retry with different params
    const chosen = pick(pairs, rng);
    return {
      type: 'complete-the-bar',
      prompt: `This bar is in ${bar.sig} time. One note is missing. Which note completes it?`,
      promptAbc: `X:1\nT:\nM:${bar.sig}\nL:1/8\nK:C\n${chosen.given.abc} z${Math.round((bar.beats - chosen.given.beatsIn44) * 2)}|]`,
      answer: chosen.missing.name,
      inputMode: 'choice4',
      concept: `complete-the-bar:${bar.sig}:${chosen.missing.id}`,
      meta: { grade, sig: bar.sig, barBeats: bar.beats, givenId: chosen.given.id, missingId: chosen.missing.id, missingBeats: chosen.missing.beatsIn44 },
    };
  },
  distractors(item, n, rng) {
    const grade = item.meta.grade;
    const pool = getNoteValues(6, 'notes').map((v) => v.name); // full range for variety
    const own = NOTE_VALUES.find((v) => v.id === item.meta.missingId);
    const order = ['Semibreve', 'Dotted minim', 'Minim', 'Dotted crotchet', 'Crotchet', 'Dotted quaver', 'Quaver', 'Semiquaver'];
    const i = order.indexOf(own.name);
    const weighted = [order[i - 1], order[i + 1]].filter((n) => n && pool.includes(n));
    return pickDistractors(item.answer, weighted, pool, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct
      ? `Yes — ${item.answer} (${beatsLabel(item.meta.missingBeats)}) completes the bar.`
      : `The missing note was ${item.answer} (${beatsLabel(item.meta.missingBeats)}), not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
