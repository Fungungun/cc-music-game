/* Phase 2.3 — engine/scheduler.js. Verifies the SM-2 interval ladder
   matches terms-flashcards.html's proven production values exactly, the
   mastery model recovers from a bad start (fixing the old lifetime-
   cumulative-accuracy-can-never-recover problem), and adaptive selection
   actually biases toward due/new/weak concepts over many draws — this is
   the wiring the plan's dead weightedPickConcept() never got. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  initConceptState, recordAttempt, mastery, isMastered, isDue,
  conceptWeight, pickNextConcept, dueConcepts, weakestConcepts,
} from '../engine/scheduler.js';
import { createRng } from '../engine/rng.js';

const DAY_MS = 86400000;

test('SM-2 interval ladder matches terms-flashcards.html exactly: 1, 3, 7, 14, 30, 60 days', () => {
  let s = initConceptState();
  const now0 = 1000000000000;
  const expectedIntervals = [1, 3, 7, 14, 30, 60, 60]; // reps 1..7, capped at index 6
  let now = now0;
  for (let i = 0; i < expectedIntervals.length; i++) {
    s = recordAttempt(s, true, now);
    assert.equal(s.interval, expectedIntervals[i], `after ${i + 1} correct reps, interval should be ${expectedIntervals[i]} days`);
    assert.equal(s.nextDue, now + expectedIntervals[i] * DAY_MS);
    now += 1000; // doesn't matter for this test, just advancing the clock a little
  }
});

test('a wrong answer resets reps/interval to 0 and makes the concept due immediately', () => {
  let s = initConceptState();
  const now = 1000000000000;
  s = recordAttempt(s, true, now);
  s = recordAttempt(s, true, now + 1000);
  assert.ok(s.reps > 0);
  s = recordAttempt(s, false, now + 2000);
  assert.equal(s.reps, 0);
  assert.equal(s.interval, 0);
  assert.equal(s.nextDue, now + 2000);
  assert.ok(isDue(s, now + 2000));
});

test('mastery() is null until MIN_ATTEMPTS_FOR_CONFIDENCE, then reflects an EWMA (recency-weighted) accuracy', () => {
  let s = initConceptState();
  const now = 1000000000000;
  s = recordAttempt(s, true, now);
  assert.equal(mastery(s), null, 'should not be confident after 1 attempt');
  s = recordAttempt(s, true, now + 1);
  assert.equal(mastery(s), null, 'should not be confident after 2 attempts');
  s = recordAttempt(s, true, now + 2);
  assert.notEqual(mastery(s), null, 'should have a mastery estimate after 3 attempts');
  assert.ok(mastery(s) > 0.9, 'three correct in a row should read as high mastery');
});

test('mastery recovers after a bad start — the exact problem lifetime-cumulative accuracy could never fix', () => {
  let s = initConceptState();
  let now = 1000000000000;
  // A rough first week: mostly wrong.
  for (let i = 0; i < 10; i++) { s = recordAttempt(s, i < 2, now); now += DAY_MS; }
  const roughMastery = mastery(s);
  assert.ok(roughMastery < 0.5, 'should read as weak after a rough start');
  // Then the child masters it: 15 correct in a row.
  for (let i = 0; i < 15; i++) { s = recordAttempt(s, true, now); now += DAY_MS; }
  const recoveredMastery = mastery(s);
  assert.ok(recoveredMastery > 0.9, `should have recovered to near-perfect mastery, got ${recoveredMastery}`);
  // A raw lifetime-cumulative accuracy (correct/total) would still be
  // dragged down by the rough start — confirm EWMA genuinely beats that.
  const lifetimeCumulative = s.attempts > 0 ? (2 + 15) / s.attempts : 0;
  assert.ok(recoveredMastery > lifetimeCumulative, 'EWMA should recover faster than a lifetime cumulative average would');
});

test('isMastered requires both a high EWMA and enough reps', () => {
  let s = initConceptState();
  let now = 1000000000000;
  for (let i = 0; i < 5; i++) { s = recordAttempt(s, true, now); now += DAY_MS; }
  assert.ok(isMastered(s));

  let s2 = initConceptState();
  s2 = recordAttempt(s2, true, now);
  s2 = recordAttempt(s2, true, now + 1);
  s2 = recordAttempt(s2, true, now + 2);
  // 3 correct in a row gives ewma > 0.85 but reps===3 (>= MIN_ATTEMPTS_FOR_CONFIDENCE=3) so this IS mastered
  assert.ok(isMastered(s2));

  let s3 = initConceptState();
  s3 = recordAttempt(s3, true, now);
  s3 = recordAttempt(s3, true, now + 1);
  assert.equal(isMastered(s3), false, 'only 2 attempts — not enough confidence yet');
});

test('conceptWeight strongly favours due and never-seen concepts over recently-mastered ones', () => {
  const now = 1000000000000;
  let mastered = initConceptState();
  for (let i = 0; i < 6; i++) mastered = recordAttempt(mastered, true, now - (10 - i) * DAY_MS);
  const neverSeen = initConceptState();
  let dueNow = initConceptState();
  dueNow = recordAttempt(dueNow, false, now - DAY_MS); // wrong yesterday -> due now

  const wMastered = conceptWeight(mastered, now);
  const wNeverSeen = conceptWeight(neverSeen, now);
  const wDue = conceptWeight(dueNow, now);
  assert.ok(wNeverSeen > wMastered, 'a never-seen concept should outweigh a mastered one');
  assert.ok(wDue > wMastered, 'a due (lapsed) concept should outweigh a mastered one');
});

test('pickNextConcept is deterministic under a seeded rng, and over many draws favours weak/due concepts', () => {
  const now = 1000000000000;
  const states = {
    strong: (() => { let s = initConceptState(); for (let i = 0; i < 8; i++) s = recordAttempt(s, true, now - (20 - i) * DAY_MS); return s; })(),
    weak: (() => { let s = initConceptState(); for (let i = 0; i < 5; i++) s = recordAttempt(s, i % 3 === 0, now - (20 - i) * DAY_MS); return s; })(),
    fresh: initConceptState(),
  };
  const getState = (c) => states[c];
  const concepts = ['strong', 'weak', 'fresh'];

  // Determinism: same seed -> same sequence.
  const rngA = createRng(7);
  const rngB = createRng(7);
  const seqA = Array.from({ length: 30 }, () => pickNextConcept(concepts, getState, rngA, now));
  const seqB = Array.from({ length: 30 }, () => pickNextConcept(concepts, getState, rngB, now));
  assert.deepEqual(seqA, seqB);

  // Distribution: 'strong' should be picked meaningfully less often.
  const rngC = createRng(99);
  const counts = { strong: 0, weak: 0, fresh: 0 };
  for (let i = 0; i < 3000; i++) counts[pickNextConcept(concepts, getState, rngC, now)]++;
  assert.ok(counts.strong < counts.weak, `strong (${counts.strong}) should be picked less than weak (${counts.weak})`);
  assert.ok(counts.strong < counts.fresh, `strong (${counts.strong}) should be picked less than fresh (${counts.fresh})`);
});

test('dueConcepts returns only attempted, due concepts, soonest first', () => {
  const now = 1000000000000;
  const states = {};
  let a = initConceptState(); a = recordAttempt(a, false, now - 5000); states.a = a; // due, 5s ago
  let b = initConceptState(); b = recordAttempt(b, false, now - 1000); states.b = b; // due, 1s ago (more recent lapse)
  let c = initConceptState(); c = recordAttempt(c, true, now); states.c = c; // not due (interval 1 day)
  const d = initConceptState(); states.d = d; // never attempted

  const result = dueConcepts(['a', 'b', 'c', 'd'], (id) => states[id], now);
  assert.deepEqual(result, ['a', 'b']);
});

test('weakestConcepts ranks by mastery ascending and excludes concepts without enough data', () => {
  const now = 1000000000000;
  const states = {};
  let strong = initConceptState(); for (let i = 0; i < 5; i++) strong = recordAttempt(strong, true, now + i);
  let weak = initConceptState(); for (let i = 0; i < 5; i++) weak = recordAttempt(weak, false, now + i);
  const insufficientData = initConceptState(); // 0 attempts
  states.strong = strong; states.weak = weak; states.insufficient = insufficientData;

  const result = weakestConcepts(['strong', 'weak', 'insufficient'], (id) => states[id], 5);
  assert.deepEqual(result, ['weak', 'strong']);
});
