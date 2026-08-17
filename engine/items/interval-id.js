/* engine/items/interval-id.js — name the interval between two notes.
   Precedent: interval-quiz.html + aural-training.html's interval mode
   (both already agreed on the INTERVALS table; content.js's
   INTERVAL_ROOTS resolved the root-note-pool divergence between them —
   see engine/content.js RESOLVED CONFLICT comment).
   Grade 1: number only (shortName). Grade 2-3: full quality+number
   (name). Supports both harmonic (both notes together) and melodic
   (notes one after another) presentation. */
import { INTERVALS, INTERVAL_ROOTS, getIntervals } from '../content.js';
import { toneToAbc } from '../notation.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

function transposeUp(rootTone, semitones, Tonal) {
  const upperMidi = Tonal.Note.midi(rootTone) + semitones;
  return Tonal.Note.fromMidi(upperMidi);
}

export default {
  id: 'interval-id',
  generate(params, rng) {
    const Tonal = globalThis.Tonal;
    const grade = params.grade || 1;
    const mode = params.mode || pick(['harmonic', 'melodic'], rng);
    const ivs = getIntervals(grade);
    const iv = pick(ivs, rng);
    const root = pick(INTERVAL_ROOTS[Math.min(grade, 3)], rng);
    const upper = transposeUp(root, iv.semitones, Tonal);
    const label = grade === 1 ? iv.shortName : iv.name;

    const rootAbc = toneToAbc(root);
    const upperAbc = toneToAbc(upper);
    const abcBody = mode === 'harmonic' ? `[${rootAbc}${upperAbc}]4` : `${rootAbc}2${upperAbc}2`;

    return {
      type: 'interval-id',
      prompt: grade === 1 ? 'Name the interval (number only).' : 'Name this interval.',
      promptAbc: `X:1\nT:\nM:4/4\nL:1/4\nK:C\n${abcBody}|]`,
      answer: label,
      inputMode: 'choice4',
      concept: `interval-id:${iv.id}`,
      meta: { grade, intervalId: iv.id, semitones: iv.semitones, song: iv.song, mode, root, upper },
    };
  },
  distractors(item, n, rng) {
    const grade = item.meta.grade;
    const ivs = getIntervals(grade);
    const labelFor = (iv) => (grade === 1 ? iv.shortName : iv.name);
    const allLabels = ivs.map(labelFor);
    const own = ivs.find((iv) => iv.id === item.meta.intervalId);
    const ownIndex = ivs.indexOf(own);
    // Plausible confusion: an interval one semitone or one number away —
    // e.g. mixing up a Major 3rd for a Minor 3rd (1 semitone off) or a
    // 4th for a 5th (adjacent number), not a random distant interval.
    const weighted = [ivs[ownIndex - 1], ivs[ownIndex + 1]].filter(Boolean).map(labelFor);
    return pickDistractors(item.answer, weighted, allLabels, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    const hint = item.meta.song ? ` Think: ${item.meta.song}.` : '';
    return correct
      ? `Yes — a ${item.answer} (${item.meta.semitones} semitones).${hint}`
      : `That was a ${item.answer} (${item.meta.semitones} semitones), not ${given}.${hint}`;
  },
  speak(item) { return item.prompt; },
};
