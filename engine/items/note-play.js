/* engine/items/note-play.js — letter/staff -> tap the piano key.
   Non-MCQ 'piano-click' input mode. MIDI-ready: Phase 8's engine/midi.js
   can satisfy the same item (accept a real key press matching
   item.answer) without any change here — the item doesn't know or care
   whether the input came from an on-screen click or a MIDI NoteOn. */
import { getNoteNames } from '../content.js';
import { toneToAbc } from '../notation.js';
import { pick } from '../rng.js';

export default {
  id: 'note-play',
  generate(params, rng) {
    const grade = params.grade || 1;
    const clef = params.clef || pick(['treble', 'bass'], rng);
    const showStaff = params.showStaff !== false;
    const pool = getNoteNames(clef, grade);
    const note = pick(pool, rng);
    return {
      type: 'note-play',
      prompt: showStaff ? 'Play this note on the keyboard.' : `Play ${note.letter} on the keyboard.`,
      promptAbc: showStaff
        ? `X:1\nT:\nM:4/4\nL:1/4\nK:C${clef === 'bass' ? ' clef=bass' : ''}\n${toneToAbc(note.tone)}4|]`
        : null,
      answer: note.tone,
      inputMode: 'piano-click',
      concept: `note-play:${note.tone}:${clef}`,
      meta: { clef, letter: note.letter },
    };
  },
  distractors() { return []; },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — that's ${item.meta.letter}.` : `That's not quite it. ${item.meta.letter} is ${item.answer}.`;
  },
  speak(item) { return item.prompt; },
};
