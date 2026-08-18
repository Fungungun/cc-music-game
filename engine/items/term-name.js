/* engine/items/term-name.js — reverse of term-meaning: given a meaning,
   pick the term. Precedent: exam-questions.js's genTermReverse(). */
import { getAllTermsForGrade } from '../content.js';
import { pick } from '../rng.js';
import { pickDistractors } from './_shared.js';

export default {
  id: 'term-name',
  generate(params, rng) {
    const grade = params.grade || 1;
    const terms = getAllTermsForGrade(grade);
    const t = pick(terms, rng);
    return {
      type: 'term-name',
      prompt: `Which term means "${t.meaning}"?`,
      answer: t.term,
      inputMode: 'choice4',
      concept: `term-name:${t.id}`,
      meta: { grade, termId: t.id, category: t.category },
    };
  },
  distractors(item, n, rng) {
    const terms = getAllTermsForGrade(item.meta.grade);
    // De-duped defensively for the same reason as term-meaning.js's
    // distractors(), even though term display strings are unique by
    // construction today — cheap insurance against the exact class of
    // bug tests/items.test.js's 500-seeded-item run caught there.
    const sameCategory = [...new Set(
      terms.filter((t) => t.category === item.meta.category && t.id !== item.meta.termId).map((t) => t.term)
    )];
    const allTerms = [...new Set(terms.map((t) => t.term))];
    return pickDistractors(item.answer, sameCategory, allTerms, n, rng);
  },
  explain(item, given) {
    const correct = given === item.answer;
    return correct ? `Yes — ${item.answer}.` : `That was ${item.answer}, not ${given}.`;
  },
  speak(item) { return item.prompt; },
};
