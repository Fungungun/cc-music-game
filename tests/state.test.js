/* Phase 2.5 — engine/state.js. Verifies the storage round-trip, the sync
   queue actually survives a failed send (the fix for the old
   fire-and-forget mmSyncProgress() data-loss bug), and the day-streak
   logic is a faithful port of old game.js's proven recordDailyActivity()
   — same continuation rule, same prune rule, same idempotency. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createState, loadState, saveState, defaultStorage,
  recordConceptAttempt, enqueueSync, flushSyncQueue, pendingSyncCount,
  recordDailyActivity, STATE_VERSION,
} from '../engine/state.js';

function memStorage() {
  const m = new Map();
  return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) };
}

test('createState produces a well-formed default', () => {
  const s = createState();
  assert.equal(s.version, STATE_VERSION);
  assert.equal(s.grade, 1);
  assert.deepEqual(s.concepts, {});
  assert.deepEqual(s.pendingSync, []);
});

test('saveState/loadState round-trips through a storage backend', () => {
  const storage = memStorage();
  let s = createState();
  s = { ...s, xp: 42, grade: 2 };
  saveState(storage, s);
  const loaded = loadState(storage);
  assert.equal(loaded.xp, 42);
  assert.equal(loaded.grade, 2);
});

test('loadState falls back to a fresh state on missing, corrupted, or version-mismatched data', () => {
  const empty = memStorage();
  assert.deepEqual(loadState(empty), createState());

  const corrupted = memStorage();
  corrupted.setItem('mm-state-v1', '{not valid json');
  assert.deepEqual(loadState(corrupted), createState());

  const wrongVersion = memStorage();
  wrongVersion.setItem('mm-state-v1', JSON.stringify({ version: 999, xp: 100 }));
  assert.equal(loadState(wrongVersion).version, STATE_VERSION);
  assert.notEqual(loadState(wrongVersion).xp, 100, 'a version mismatch should not silently adopt data in an unknown shape');
});

test('defaultStorage falls back to an in-memory store when localStorage is unavailable', () => {
  const storage = defaultStorage();
  storage.setItem('probe', 'x');
  assert.equal(storage.getItem('probe'), 'x');
});

test('recordConceptAttempt updates concept state AND enqueues a sync op in one call', () => {
  let s = createState();
  s = recordConceptAttempt(s, 'note-name:C4:treble', true, 1000000000000);
  assert.ok(s.concepts['note-name:C4:treble']);
  assert.equal(s.concepts['note-name:C4:treble'].attempts, 1);
  assert.equal(pendingSyncCount(s), 1);
  assert.equal(s.pendingSync[0].type, 'concept-attempt');
  assert.equal(s.pendingSync[0].payload.concept, 'note-name:C4:treble');
  assert.equal(s.pendingSync[0].payload.correct, true);
});

test('flushSyncQueue removes ops that succeed and KEEPS ops that fail — nothing is silently discarded', async () => {
  let s = createState();
  s = enqueueSync(s, 'a', { n: 1 });
  s = enqueueSync(s, 'b', { n: 2 });
  s = enqueueSync(s, 'c', { n: 3 });
  assert.equal(pendingSyncCount(s), 3);

  // Simulate op "b" failing (e.g. the network request the old
  // fire-and-forget mmSyncProgress() would have silently lost).
  const result = await flushSyncQueue(s, async (op) => op.payload.n !== 2);
  assert.equal(result.sent, 2);
  assert.equal(result.failed, 1);
  assert.equal(pendingSyncCount(result.state), 1);
  assert.equal(result.state.pendingSync[0].payload.n, 2);
  assert.equal(result.state.pendingSync[0].attempts, 1, 'attempts should increment on a failed send');
});

test('flushSyncQueue retries a previously-failed op on the next flush, and it can eventually succeed', async () => {
  let s = createState();
  s = enqueueSync(s, 'x', { ok: false });
  let result = await flushSyncQueue(s, async () => false); // network down
  assert.equal(pendingSyncCount(result.state), 1);
  result = await flushSyncQueue(result.state, async () => false); // still down
  assert.equal(pendingSyncCount(result.state), 1);
  assert.equal(result.state.pendingSync[0].attempts, 2);
  result = await flushSyncQueue(result.state, async () => true); // back online
  assert.equal(pendingSyncCount(result.state), 0);
});

test('flushSyncQueue survives a sendFn that throws (treated as a failed send, not a crash)', async () => {
  let s = enqueueSync(createState(), 'x', {});
  const result = await flushSyncQueue(s, async () => { throw new Error('network error'); });
  assert.equal(result.failed, 1);
  assert.equal(pendingSyncCount(result.state), 1);
});

test('flushSyncQueue on an empty queue is a no-op', async () => {
  const s = createState();
  const result = await flushSyncQueue(s, async () => true);
  assert.equal(result.sent, 0);
  assert.equal(result.failed, 0);
});

/* ---- day streak — faithful port of old game.js recordDailyActivity ---- */
const DAY = 86400000;
const T0 = new Date(2026, 6, 17, 10, 0, 0).getTime(); // 2026-07-17 10:00 local

test('first ever activity sets streak to 1', () => {
  const s = recordDailyActivity(createState(), T0);
  assert.equal(s.streak.days, 1);
  assert.equal(s.streak.last, '2026-07-17');
});

test('recording again on the SAME day is idempotent (no change)', () => {
  let s = recordDailyActivity(createState(), T0);
  const again = recordDailyActivity(s, T0 + 5000);
  assert.deepEqual(again, s);
});

test('recording on the very next calendar day increments the streak', () => {
  let s = recordDailyActivity(createState(), T0);
  s = recordDailyActivity(s, T0 + DAY);
  assert.equal(s.streak.days, 2);
  s = recordDailyActivity(s, T0 + 2 * DAY);
  assert.equal(s.streak.days, 3);
});

test('skipping a calendar day resets the streak to 1', () => {
  let s = recordDailyActivity(createState(), T0);
  s = recordDailyActivity(s, T0 + DAY); // day 2, streak=2
  s = recordDailyActivity(s, T0 + 3 * DAY); // gap of a day -> reset
  assert.equal(s.streak.days, 1);
});

test('history is pruned beyond 70 days, matching the old cutoff-date rule', () => {
  let s = createState();
  for (let i = 0; i < 80; i++) {
    s = recordDailyActivity(s, T0 + i * DAY);
  }
  const dates = Object.keys(s.streak.history);
  assert.ok(dates.length <= 71, `expected <=71 days of history (70-day window inclusive of today), got ${dates.length}`);
  // the earliest days should have been pruned, the most recent kept
  assert.ok(s.streak.history[s.streak.last]);
});
