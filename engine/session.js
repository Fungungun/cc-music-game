/* Music Maestro — engine/session.js
   Bounded session state machine. Phase 2.4, 2026-08-17.

   This is the single most important behavioural change in the whole
   rebuild plan. Nine of the old app's ten modules never ended — they
   looped random questions forever, and the one "milestone" modal that
   appeared every 5-10 answers had "Keep practising" as its primary
   button. A child had no way to finish anything, and the day streak
   incremented on a single answered question (old game.js:709 called
   recordDailyActivity() from every onCorrect/onWrong), so there was no
   real unit of "one day's practice" either.

   This module is ONLY the state machine (pure, synchronous, fully unit-
   testable) — it does not touch the DOM, does not render an item, does
   not play audio. It answers exactly one question: "given what just
   happened, what state is the session in now, and should it end?" The
   actual per-item UI (rendering a staff, a piano, a choice grid; reading
   a screen-reader-friendly result out loud; the confetti/fanfare
   celebration) is the render/*.js + speech.js layer, which needs a real
   browser and a person looking at it — deliberately out of scope for
   this file and for tonight's autonomous pass. */

export const DEFAULT_HEARTS = 5;
export const XP_PER_CORRECT = 10;
export const XP_COMPLETION_BONUS = 30;

/* config.items must already be a flat, ordered array of built Items
   (engine/items.js buildItem() results) — assembling WHICH items go in
   warm-up/new-skill/challenge and in what proportion is a curriculum
   decision (Phase 3's engine/curriculum.js knows what "the next skill"
   means; this file doesn't need to). config.sections optionally labels
   index ranges for UI display, e.g. [{name:'warmup', count:5}, ...]. */
export function createSession(items, opts) {
  opts = opts || {};
  return {
    items,
    sections: opts.sections || null,
    index: 0,
    hearts: opts.hearts != null ? opts.hearts : DEFAULT_HEARTS,
    xp: 0,
    correctCount: 0,
    wrongCount: 0,
    // one result per QUESTION, not per attempt — the caller must resolve
    // a multi-attempt question (e.g. two wrong tries then a correct one)
    // to a single call to answerCurrent(), matching the same "count once"
    // rule engine/scheduler.js's recordAttempt() depends on. This is the
    // direct fix for the double-counting bug found in five old modules.
    startedAt: opts.now != null ? opts.now : Date.now(),
    completedAt: null,
    ended: false,
    endReason: null, // 'completed' | 'out-of-hearts'
  };
}

export function currentItem(session) {
  if (session.ended) return null;
  return session.items[session.index] || null;
}

export function isSessionOver(session) {
  return session.ended;
}

/* Advances the session by exactly one answered question. `correct` is
   the FINAL result for that question (see the note in createSession).
   Ending on hearts===0 is deliberately gentle: it happens at the natural
   boundary after the item that spent the last heart, with a distinct
   endReason so the UI can show "let's pick this up next time" rather
   than a punitive lockout screen — never mid-item, never silently. */
export function answerCurrent(session, correct, now) {
  now = now != null ? now : Date.now();
  if (session.ended) return session;

  const next = {
    ...session,
    index: session.index + 1,
    correctCount: session.correctCount + (correct ? 1 : 0),
    wrongCount: session.wrongCount + (correct ? 0 : 1),
    hearts: correct ? session.hearts : Math.max(0, session.hearts - 1),
    xp: session.xp + (correct ? XP_PER_CORRECT : 0),
  };

  if (next.hearts <= 0) {
    next.ended = true;
    next.endReason = 'out-of-hearts';
    next.completedAt = now;
  } else if (next.index >= next.items.length) {
    next.ended = true;
    next.endReason = 'completed';
    next.completedAt = now;
    next.xp += XP_COMPLETION_BONUS; // only a FINISHED session earns the bonus
  }
  return next;
}

/* A "completed" session is one that reached the end of its item list
   with hearts remaining — this, not "answered at least one question", is
   what should increment the day streak (engine/state.js
   recordDailyActivity()). The old app called recordDailyActivity() from
   every single onCorrect/onWrong handler in every module, so one
   answered question was already a full streak day; that is not
   reproduced here on purpose. */
export function earnedStreakCredit(session) {
  return session.ended && session.endReason === 'completed';
}

export function accuracy(session) {
  const total = session.correctCount + session.wrongCount;
  return total === 0 ? null : session.correctCount / total;
}

export function summary(session) {
  return {
    correctCount: session.correctCount,
    wrongCount: session.wrongCount,
    accuracy: accuracy(session),
    xp: session.xp,
    endReason: session.endReason,
    completed: earnedStreakCredit(session),
    durationMs: session.completedAt != null ? session.completedAt - session.startedAt : null,
  };
}
