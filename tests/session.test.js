/* Phase 2.4 — engine/session.js. Verifies the bounded-session state
   machine: a session actually ends (unlike 9 of the old app's 10
   modules), hearts depletion ends it gently with a distinct reason
   rather than mid-item, the completion XP bonus and day-streak credit
   are earned only by finishing (not by answering a single question, the
   exact old bug where recordDailyActivity() fired from every
   onCorrect/onWrong). */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createSession, currentItem, isSessionOver, answerCurrent,
  earnedStreakCredit, accuracy, summary, DEFAULT_HEARTS, XP_PER_CORRECT, XP_COMPLETION_BONUS,
} from '../engine/session.js';

function fakeItems(n) {
  return Array.from({ length: n }, (_, i) => ({ id: `item-${i}`, type: 'fake' }));
}

test('a fresh session starts unended, at index 0, with default hearts', () => {
  const s = createSession(fakeItems(5));
  assert.equal(isSessionOver(s), false);
  assert.equal(s.hearts, DEFAULT_HEARTS);
  assert.equal(currentItem(s).id, 'item-0');
});

test('answering every item correctly reaches a real, distinct END — unlike 9 of the old app\'s 10 modules', () => {
  let s = createSession(fakeItems(5));
  for (let i = 0; i < 5; i++) {
    assert.equal(isSessionOver(s), false, `should not be over before item ${i}`);
    s = answerCurrent(s, true, 1000 + i);
  }
  assert.equal(isSessionOver(s), true);
  assert.equal(s.endReason, 'completed');
  assert.equal(currentItem(s), null, 'no current item once the session has ended');
});

test('the completion bonus is only awarded to a session that actually finishes', () => {
  let s = createSession(fakeItems(3));
  s = answerCurrent(s, true);
  s = answerCurrent(s, true);
  assert.equal(s.xp, XP_PER_CORRECT * 2, 'no bonus yet — not finished');
  s = answerCurrent(s, true);
  assert.equal(s.xp, XP_PER_CORRECT * 3 + XP_COMPLETION_BONUS, 'bonus awarded exactly on completion');
});

test('running out of hearts ends the session gently, with its own distinct reason — never mid-item', () => {
  let s = createSession(fakeItems(20), { hearts: 3 });
  s = answerCurrent(s, false); // hearts 3->2
  assert.equal(isSessionOver(s), false);
  s = answerCurrent(s, false); // hearts 2->1
  assert.equal(isSessionOver(s), false);
  s = answerCurrent(s, false); // hearts 1->0
  assert.equal(isSessionOver(s), true);
  assert.equal(s.endReason, 'out-of-hearts');
  assert.equal(s.hearts, 0);
  assert.ok(s.index < s.items.length, 'ended before reaching the end of the item list, not after');
  assert.equal(s.xp, 0, 'no completion bonus for an unfinished session');
});

test('a correct answer never costs a heart; hearts never go negative', () => {
  let s = createSession(fakeItems(10), { hearts: 1 });
  s = answerCurrent(s, true);
  assert.equal(s.hearts, 1);
  s = answerCurrent(s, false);
  assert.equal(s.hearts, 0);
  assert.ok(isSessionOver(s));
});

test('answerCurrent is a no-op once the session has already ended (defensive against a stray extra call)', () => {
  let s = createSession(fakeItems(1));
  s = answerCurrent(s, true);
  assert.ok(isSessionOver(s));
  const again = answerCurrent(s, true);
  assert.deepEqual(again, s);
});

test('earnedStreakCredit is true ONLY for a completed session — the exact fix for the old bug where ANY answered question incremented the day streak', () => {
  let completed = createSession(fakeItems(1));
  completed = answerCurrent(completed, true);
  assert.equal(earnedStreakCredit(completed), true);

  let outOfHearts = createSession(fakeItems(10), { hearts: 1 });
  outOfHearts = answerCurrent(outOfHearts, false);
  assert.equal(earnedStreakCredit(outOfHearts), false);

  const inProgress = createSession(fakeItems(10));
  assert.equal(earnedStreakCredit(inProgress), false, 'a session with unanswered items has definitely not earned credit');
});

test('accuracy is null with no answers yet, and correct otherwise', () => {
  let s = createSession(fakeItems(4));
  assert.equal(accuracy(s), null);
  s = answerCurrent(s, true);
  s = answerCurrent(s, true);
  s = answerCurrent(s, false);
  assert.equal(accuracy(s), 2 / 3);
});

test('summary() gives a UI-ready snapshot', () => {
  let s = createSession(fakeItems(2), { now: 5000 });
  s = answerCurrent(s, true, 5100);
  s = answerCurrent(s, true, 5300);
  const sum = summary(s);
  assert.equal(sum.correctCount, 2);
  assert.equal(sum.wrongCount, 0);
  assert.equal(sum.accuracy, 1);
  assert.equal(sum.completed, true);
  assert.equal(sum.durationMs, 300);
  assert.equal(sum.xp, XP_PER_CORRECT * 2 + XP_COMPLETION_BONUS);
});
