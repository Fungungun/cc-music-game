/* engine/items/time-signature-id.js — from a notated bar (no printed
   meter — that would just show the answer), identify the time signature.
   Revives engine/content.js TIME_SIGNATURES, which was carried over from
   SYLLABUS.timeSignatures but had ZERO consumers anywhere in the old app
   — despite game.js's AMEB_PAGE_TAGS advertising rhythm-trainer.html as
   "Identify time signatures and duple/triple/compound metre", that
   module contained no identification questions at all, only a tap-along
   accuracy drill. This is the item type that data was always meant to
   power.

   Renders with M:none (abcjs's documented way to suppress the displayed
   meter symbol) and a single unbarred group of notes totalling the
   signature's beat count, so nothing in the rendered notation reveals
   the answer — the learner must count. NOTE for whoever builds the
   staff-click/choice4 renderer in Phase 2.2's render/ layer: verify
   M:none actually renders with no meter symbol in a live browser before
   shipping — this was written and unit-tested at the data/string level
   only, not visually confirmed against abcjs's real output. */
import { TIME_SIGNATURES } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

// Build a bar of L:1/8 groups, one per beat, so the bar length is
// unambiguous and nothing about note choice hints at the answer.
// groupEighths = how many eighth-notes make up ONE beat of this time
// signature: 2 for a crotchet beat (2/4, 3/4, 4/4), 4 for a minim beat
// (2/2, cut time), 3 for a dotted-crotchet beat (6/8, 9/8, compound).
// Working in whole eighth-note groups (not a fractional "quarter-beats"
// intermediate value) avoids a real bug this file had: converting 9/8's
// 3 dotted-crotchet beats to "4.5 quarter-beats" and back to eighths via
// Math.round(4.5*2)=9... looks right until you pair THAT into c2 chunks
// (9 is odd) and silently get a 10-eighth bar instead. Filling by GROUP
// directly (3 groups of 3 eighths = 9, always exact) sidesteps the
// rounding entirely.
function fillBar(numGroups, groupEighths) {
  const group = groupEighths === 2 ? 'c2' : groupEighths === 4 ? 'c4' : 'c3';
  return Array(numGroups).fill(group).join(' ');
}
function groupEighthsFor(unit) {
  if (unit.includes('dotted')) return 3; // compound: dotted-crotchet beat
  if (unit === 'minim') return 4;        // cut time: minim beat
  return 2;                              // simple: crotchet beat
}

export default {
  id: 'time-signature-id',
  generate(params, rng) {
    const grade = params.grade || 1;
    const ts = pick(TIME_SIGNATURES[Math.min(grade, 3)], rng);
    return {
      type: 'time-signature-id',
      prompt: 'Count the beats. Which time signature is this?',
      promptAbc: `X:1\nT:\nM:none\nL:1/8\nK:C\n${fillBar(ts.beats, groupEighthsFor(ts.unit))}|]`,
      answer: ts.sig,
      inputMode: 'choice4',
      concept: `time-signature-id:${ts.sig.replace('/', '-')}`,
      meta: { beats: ts.beats, unit: ts.unit, feel: ts.feel },
    };
  },
  distractors(item, n, rng) {
    const allSigs = ['2/4', '3/4', '4/4', '2/2', '6/8', '9/8'];
    // Plausible confusion: mixing up simple duple/triple/quadruple with
    // each other (2/4 vs 3/4 vs 4/4) is the classic real mistake, more
    // than confusing simple with compound (6/8 sounds and looks very
    // different from 3/4 in the notation, less likely to be confused).
    const sameFamily = item.answer.endsWith('/8')
      ? ['6/8', '9/8']
      : ['2/4', '3/4', '4/4', '2/2'];
    return pickDistractors(item.answer, sameFamily, allSigs, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct
      ? `Yes — ${item.answer}, ${item.meta.beats} beats per bar (${item.meta.feel}).`
      : `That was ${item.answer} (${item.meta.beats} beats per bar), not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
