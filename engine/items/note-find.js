/* engine/items/note-find.js — letter name -> tap the staff position.
   Reverse of note-name. Non-MCQ: the renderer draws a staff and the
   learner clicks/taps the position; grading compares the click's nearest
   staff position to item.answer (the target tone). No distractors — a
   click-target input mode doesn't offer multiple-choice options. */
import { getNoteNames } from '../content.js';
import { pick } from '../rng.js';

export default {
  id: 'note-find',
  generate(params, rng) {
    const grade = params.grade || 1;
    const clef = params.clef || pick(['treble', 'bass'], rng);
    const pool = getNoteNames(clef, grade);
    const note = pick(pool, rng);
    return {
      type: 'note-find',
      prompt: `Tap ${note.letter} on the staff.`,
      answer: note.tone,
      inputMode: 'staff-click',
      concept: `note-find:${note.tone}:${clef}`,
      meta: { clef, letter: note.letter, ledger: note.ledger, candidatePool: pool.map((n) => n.tone) },
    };
  },
  distractors() { return []; },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — that's ${item.meta.letter}.` : `That was the wrong spot. ${item.meta.letter} is here.`;
  },
  speak(item) { return item.prompt; },
};
