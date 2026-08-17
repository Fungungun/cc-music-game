/* engine/items/cadence-id.js — identify a cadence type, from notation
   (visual) or by ear (aural, playChords set — the renderer/session layer
   is responsible for actually triggering playback before accepting an
   answer, same UX rule mock-exam.html already enforced: "play button
   mandatory before answering"). Precedent: chord-game.html's cadence
   mode + exam-questions.js genCadence(). Uses content.js CADENCES and
   cadenceAbc() (derived, not hand-typed — see engine/notation.js and the
   RESOLVED CONFLICT #4 comment in engine/content.js for why that matters
   here specifically).

   Grade 1-2 only have 2 cadence TYPES taught (Perfect, Plagal) — too few
   for a fair 4-option question from the grade's own pool alone. Widened
   the DISTRACTOR pool to all 4 type names across the whole curriculum
   (Perfect/Plagal/Imperfect/Interrupted), same technique as
   key-sig-to-name.js/name-to-key-sig.js: seeing "Imperfect Cadence" as
   one wrong option among four doesn't teach a grade-1 student anything
   false, it's an unfamiliar label in the choice grid, not a tested fact. */
import { CADENCES, getCadences } from '../content.js';
import { cadenceAbc } from '../notation.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

const ALL_TYPE_NAMES = [...new Set(CADENCES.map((c) => c.name))];

export default {
  id: 'cadence-id',
  generate(params, rng) {
    const grade = params.grade || 1;
    const mode = params.mode || pick(['visual', 'aural'], rng);
    const pool = getCadences(grade);
    const cad = pick(pool, rng);
    return {
      type: 'cadence-id',
      prompt: mode === 'aural'
        ? `Listen and identify the cadence type (${cad.label}).`
        : `Which cadence is this (${cad.label})?`,
      promptAbc: mode === 'visual' ? cadenceAbc(cad.chords) : null,
      promptAudio: mode === 'aural' ? { chords: cad.chords, mustPlayBeforeAnswer: true } : null,
      answer: cad.name,
      inputMode: 'choice4',
      concept: `cadence-id:${cad.type}:${cad.key}`,
      meta: { grade, mode, type: cad.type, key: cad.key, chords: cad.chords },
    };
  },
  distractors(item, n, rng) {
    // Same-key cadences of a different type are the most realistic
    // confusion (the student heard/saw the right key context, just
    // named the function wrong).
    const sameKeyOtherType = CADENCES
      .filter((c) => c.key === item.meta.key && c.name !== item.answer)
      .map((c) => c.name);
    return pickDistractors(item.answer, sameKeyOtherType, ALL_TYPE_NAMES, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — a ${item.answer}.` : `That was a ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
