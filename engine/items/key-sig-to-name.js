/* engine/items/key-sig-to-name.js — given a key signature (sharps/flats
   count), name the major key. Precedent: key-signatures.html
   (exam-questions.js genKeySig). Fixes the distractor-grade-leak bug:
   exam-questions.js:61 pulled distractors from SYLLABUS.keySignatures[3]
   regardless of the student's own grade, so a Grade 1 student could be
   offered "B major" or "Ab major" as wrong answers to a 3-key question. */
import { KEY_SIGNATURES } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

// Grade 1 has only 3 keys (C, G, F) — a strict grade-1-only distractor
// pool can supply at most 2 distractors, one short of the required 4-
// option minimum. The full grade-3 key list is used for DISTRACTORS only
// (never as a tested item at grade 1); seeing "Ab major" as one wrong
// choice among four doesn't teach a grade-1 student anything false, it's
// just an unfamiliar name in the option grid — the same "widen the pool
// across grades" technique the plan sanctions for cadence-id below.
const ALL_KEY_NAMES = KEY_SIGNATURES[3].map((k) => k.key);

function sigLabel(ks) {
  if (ks.sharps > 0) return `${ks.sharps} sharp${ks.sharps > 1 ? 's' : ''}`;
  if (ks.flats > 0) return `${ks.flats} flat${ks.flats > 1 ? 's' : ''}`;
  return 'no sharps or flats';
}

export default {
  id: 'key-sig-to-name',
  generate(params, rng) {
    const grade = params.grade || 1;
    const pool = KEY_SIGNATURES[Math.min(grade, 3)];
    const ks = pick(pool, rng);
    return {
      type: 'key-sig-to-name',
      prompt: `Which major key has ${sigLabel(ks)}?`,
      answer: ks.key,
      inputMode: 'choice4',
      concept: `key-sig-to-name:${ks.key}`,
      meta: { grade },
    };
  },
  distractors(item, n, rng) {
    return pickDistractors(item.answer, [], ALL_KEY_NAMES, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — ${item.answer}.` : `That signature is ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
