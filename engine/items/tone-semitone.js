/* engine/items/tone-semitone.js — AMEB Grade 1 Theory gap: is the
   distance between two adjacent notes a tone (2 semitones) or a
   semitone (1 semitone)? No precedent in the current app at all.

   This is intentionally NOT a 4-option MCQ. It's a genuinely binary
   classification (like true/false), not a content-scarcity problem —
   forcing in two unrelated fake options ("Major 3rd", "Perfect 5th")
   would be confusing, not honest, and isn't what the plan's "never fewer
   than 4 options" rule is for (that rule targets cases like Grade 1
   cadences, where MORE real options exist but were arbitrarily withheld,
   turning a real question into a coin flip). Uses a distinct
   inputMode: 'choice2' so the renderer can present it as a clear two-way
   choice rather than a padded four-button grid. */
import { pick } from '../rng.js';
import { toneToAbc } from '../notation.js';

// Every adjacent white/black-key pair within one octave, tagged tone/semitone.
// Grade 1 scope: keep it inside the octave C4-C5 and the taught keys
// (C, G, F major + A, D, E harmonic minor) so every pair is something the
// student has actually seen notated.
const PAIRS = [
  { a: 'C4', b: 'D4', kind: 'tone' }, { a: 'D4', b: 'E4', kind: 'tone' },
  { a: 'E4', b: 'F4', kind: 'semitone' }, { a: 'F4', b: 'G4', kind: 'tone' },
  { a: 'G4', b: 'A4', kind: 'tone' }, { a: 'A4', b: 'B4', kind: 'tone' },
  { a: 'B4', b: 'C5', kind: 'semitone' },
  { a: 'F4', b: 'F#4', kind: 'semitone' }, { a: 'G4', b: 'G#4', kind: 'semitone' },
  { a: 'C4', b: 'C#4', kind: 'semitone' },
  { a: 'G4', b: 'A4', kind: 'tone' }, { a: 'D4', b: 'E4', kind: 'tone' },
];

export default {
  id: 'tone-semitone',
  generate(params, rng) {
    const pair = pick(PAIRS, rng);
    return {
      type: 'tone-semitone',
      prompt: 'Is the distance between these two notes a tone or a semitone?',
      promptAbc: `X:1\nT:\nM:4/4\nL:1/4\nK:C\n${toneToAbc(pair.a)}${toneToAbc(pair.b)}2|]`,
      answer: pair.kind,
      choices: ['tone', 'semitone'],
      inputMode: 'choice2',
      concept: `tone-semitone:${pair.kind}`,
      meta: { a: pair.a, b: pair.b },
    };
  },
  distractors() { return []; }, // choices are fixed for choice2 — no distractor pool needed
  explain(item, given) {
    const correct = given === item.answer;
    const label = item.answer === 'tone' ? 'a tone (2 semitones)' : 'a semitone (1 semitone) — the smallest step in music';
    return correct ? `Yes — that's ${label}.` : `That's actually ${label}.`;
  },
  speak(item) { return item.prompt; },
};
