/* engine/items/term-meaning.js — Italian/French performance term -> its
   meaning. Precedent: terms-flashcards.html (self-graded flip-card, no
   MCQ) + exam-questions.js's genTermMeaning(). Genuine gap in the
   original 14-type list from last night's Phase 2.1 commit: terms cover
   68 data points across 3 lessons (13, grade2/08, grade3/06) — the
   single largest content area in engine/content.js by item count — and
   had no MCQ item type at all until this one. Added the same night as
   engine/curriculum.js, once the gap surfaced while mapping every lesson
   to an item type. */
import { getAllTermsForGrade } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

export default {
  id: 'term-meaning',
  generate(params, rng) {
    const grade = params.grade || 1;
    const terms = getAllTermsForGrade(grade);
    const t = pick(terms, rng);
    return {
      type: 'term-meaning',
      prompt: `What does "${t.term}" mean?`,
      answer: t.meaning,
      inputMode: 'choice4',
      concept: `term-meaning:${t.id}`,
      meta: { grade, termId: t.id, category: t.category },
    };
  },
  distractors(item, n, rng) {
    const terms = getAllTermsForGrade(item.meta.grade);
    // A handful of terms are genuine English synonyms (Adagio/Lento both
    // "Slow", rall./rit. both "Gradually getting slower", decresc./dim.
    // both "Gradually getting softer") — real music-theory fact, not a
    // data bug (see engine/content.js TERMS). De-dupe by VALUE before
    // sampling: assembleChoices already excludes any distractor that
    // equals the correct answer text, but without de-duping here the
    // fallback-fill step could draw the same duplicate string twice from
    // two different term ids and come up short on distinct distractors —
    // exactly the bug this de-dupe fixes (found by tests/items.test.js's
    // 500-seeded-item run, not by inspection).
    const sameCategory = [...new Set(
      terms.filter((t) => t.category === item.meta.category && t.id !== item.meta.termId).map((t) => t.meaning)
    )];
    const allMeanings = [...new Set(terms.map((t) => t.meaning))];
    return pickDistractors(item.answer, sameCategory, allMeanings, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — ${item.answer}.` : `That means ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
