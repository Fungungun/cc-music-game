/* Music Maestro — engine/scheduler.js
   Mastery model + spaced repetition + adaptive item selection.
   Phase 2.3, 2026-08-17.

   This is the fix for the single biggest gap the pre-rebuild audit
   found: EVERY question generator in the old app picked with
   Math.floor(Math.random()*n) — including the one function that would
   have made it adaptive, weightedPickConcept() (old game.js:974), which
   was written and never called from anywhere. terms-flashcards.html was
   the one module with real spaced repetition (an SM-2-inspired fixed
   interval ladder) and proved the team knew how; this file generalizes
   that proven logic from flashcard terms to every concept in the app,
   instead of reinventing it.

   Also fixes a second real problem: the old parent view showed a
   LIFETIME CUMULATIVE accuracy percentage per concept (correct/(correct+
   wrong) since forever), which can never recover — a child who struggled
   in week 1 and is now perfect still reads as "needs review" in week 8.
   mastery() here is an exponentially-weighted moving average, so recent
   performance dominates the estimate. */

const INTERVAL_DAYS = [0, 1, 3, 7, 14, 30, 60]; // ported from terms-flashcards.html:159
const DAY_MS = 86400000;
const EWMA_ALPHA = 0.3; // higher = more weight on the most recent attempt
const MASTERED_THRESHOLD = 0.85;
const MIN_ATTEMPTS_FOR_CONFIDENCE = 3; // matches the old getMastered()'s reps>=3

/* ────────────────────────────────────────────────────────────
   Per-concept state
   ──────────────────────────────────────────────────────────── */
export function initConceptState() {
  return { reps: 0, interval: 0, nextDue: 0, ewma: null, attempts: 0, lastSeen: 0, lastResult: null };
}

/* Records ONE result for a concept. Callers must call this exactly once
   per QUESTION answered, not once per ATTEMPT at that question — the old
   app double-counted retries in five modules (note-namer, interval-quiz,
   chord-game, aural-training, form-detective all called onWrong() +
   trackAnswer(false) on every wrong attempt before the eventual correct
   one, so a question answered right on the second try recorded 50%
   accuracy for that concept). The session layer (Phase 2.4) is
   responsible for collapsing multi-attempt questions to one call here. */
export function recordAttempt(state, correct, now) {
  now = now != null ? now : Date.now();
  const s = { ...state };
  s.attempts += 1;
  s.lastSeen = now;
  s.lastResult = correct;
  s.ewma = s.ewma == null ? (correct ? 1 : 0) : s.ewma + EWMA_ALPHA * ((correct ? 1 : 0) - s.ewma);

  if (correct) {
    s.reps += 1;
    const idx = Math.min(s.reps, INTERVAL_DAYS.length - 1);
    s.interval = INTERVAL_DAYS[idx];
    s.nextDue = now + s.interval * DAY_MS;
  } else {
    s.reps = 0;
    s.interval = 0;
    s.nextDue = now; // due immediately — the whole point of an SRS lapse
  }
  return s;
}

/* 0-1 mastery estimate, or null if there isn't enough data to be
   confident yet ("Early sample", matching the old progress.js quality()
   labels — see engine/state.js). */
export function mastery(state) {
  if (!state || state.attempts < MIN_ATTEMPTS_FOR_CONFIDENCE || state.ewma == null) return null;
  return state.ewma;
}

export function isMastered(state) {
  const m = mastery(state);
  return m != null && m >= MASTERED_THRESHOLD && state.reps >= MIN_ATTEMPTS_FOR_CONFIDENCE;
}

export function isDue(state, now) {
  now = now != null ? now : Date.now();
  return !state || state.nextDue <= now;
}

/* ────────────────────────────────────────────────────────────
   Adaptive selection — the actual fix for the dead
   weightedPickConcept() the old app never called.
   ──────────────────────────────────────────────────────────── */

/* Weight a single concept for "how much does this concept need
   practice right now". Higher = more likely to be picked.
     - due concepts get a strong flat bonus (SRS lapses are urgent)
     - never-seen concepts get a strong bonus too (introduce new content)
     - otherwise, weight rises as mastery falls (weak concepts practised
       more), using (1 - ewma)^2 so genuinely weak concepts stand out
       more than a small extra practice would justify for an
       already-strong one */
export function conceptWeight(state, now) {
  now = now != null ? now : Date.now();
  if (!state || state.attempts === 0) return 3;
  if (isDue(state, now)) return 2.5;
  const m = state.ewma == null ? 0.5 : state.ewma;
  return 0.2 + Math.pow(1 - m, 2) * 2;
}

/* Weighted-random pick of one concept from `concepts` (an array of
   concept id strings), using `getState(conceptId) -> ConceptState|undefined`
   to look up each one's practice history. `rng` defaults to Math.random;
   pass a seeded one (engine/rng.js createRng) for reproducible sessions. */
export function pickNextConcept(concepts, getState, rng, now) {
  rng = rng || Math.random;
  now = now != null ? now : Date.now();
  if (!concepts.length) return null;
  const weights = concepts.map((c) => conceptWeight(getState(c), now));
  const total = weights.reduce((a, b) => a + b, 0);
  let r = rng() * total;
  for (let i = 0; i < concepts.length; i++) {
    r -= weights[i];
    if (r <= 0) return concepts[i];
  }
  return concepts[concepts.length - 1];
}

/* Concepts due for SRS review right now, soonest-due first — the "warm-up"
   pool for engine/session.js's bounded session structure. */
export function dueConcepts(allConceptIds, getState, now) {
  now = now != null ? now : Date.now();
  return allConceptIds
    .filter((c) => getState(c) && isDue(getState(c), now) && getState(c).attempts > 0)
    .sort((a, b) => (getState(a).nextDue || 0) - (getState(b).nextDue || 0));
}

/* Weakest N concepts with enough data to be confident about (mirrors the
   old getWeakConcepts()/getWeakConceptsForModule(), but ranked by the
   recency-weighted mastery() instead of raw lifetime accuracy). */
export function weakestConcepts(allConceptIds, getState, n) {
  return allConceptIds
    .map((c) => ({ concept: c, m: mastery(getState(c)) }))
    .filter((x) => x.m != null)
    .sort((a, b) => a.m - b.m)
    .slice(0, n)
    .map((x) => x.concept);
}
