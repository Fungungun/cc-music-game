/* engine/items/note-name.js — staff position -> letter name.
   Precedent: note-namer.html + engine/content.js NOTE_NAMES. */
import { getNoteNames } from '../content.js';
import { toneToAbc } from '../notation.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

function adjacentLetters(letter) {
  // The realistic confusion for a note-naming mistake is the letter just
  // above or below it in the musical alphabet (a line/space neighbour),
  // not an unrelated letter — matches the plan's explicit guidance
  // ("adjacent line/space for note naming").
  const i = LETTERS.indexOf(letter);
  return [LETTERS[(i + 6) % 7], LETTERS[(i + 1) % 7], LETTERS[(i + 5) % 7], LETTERS[(i + 2) % 7]];
}

export default {
  id: 'note-name',
  generate(params, rng) {
    const grade = params.grade || 1;
    const clef = params.clef || pick(['treble', 'bass'], rng);
    const pool = getNoteNames(clef, grade);
    const note = pick(pool, rng);
    return {
      type: 'note-name',
      prompt: 'What note is this?',
      promptAbc: `X:1\nT:\nM:4/4\nL:1/4\nK:C${clef === 'bass' ? ' clef=bass' : ''}\n${toneToAbc(note.tone)}4|]`,
      answer: note.letter,
      inputMode: 'choice4',
      concept: `note-name:${note.tone}:${clef}`,
      meta: { tone: note.tone, clef, ledger: note.ledger },
    };
  },
  distractors(item, n, rng) {
    return pickDistractors(item.answer, adjacentLetters(item.answer), LETTERS, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct
      ? `Yes — that's ${item.answer}.`
      : `That note is ${item.answer}, not ${given}.`;
  },
  speak(item) {
    return 'What note is this?';
  },
};
