/* Music Maestro — engine/state.js
   One typed learner state object, local-first, with a real retry queue
   for server sync. Phase 2.5, 2026-08-17.

   Replaces the 12 ad-hoc localStorage keys the old app wrote directly
   (cc-grade, mm-mastery, mm-day-streak, cc-<module> x10, cc-daily,
   cc-terms-srs, ...) with one versioned object under a single key, and
   fixes a real data-loss bug: the old mmSyncProgress() (auth.js:107) was
   fire-and-forget — POST /api/progress, no retry, no response check — so
   every failed request (offline, a dropped connection, a 500) silently
   discarded that answer forever, while GET /api/progress (the read path
   that would restore it) was never even called by any client code. The
   sync queue here persists every unconfirmed change locally until a
   flush actually succeeds, so a lost network request delays a sync, it
   doesn't erase the answer.

   Storage and network are both injected (not hardcoded to `window.
   localStorage` / `fetch`) so this module is fully unit-testable in Node
   without a browser or a real server, and so the browser code that wires
   it up controls exactly when a flush happens. */
import { initConceptState, recordAttempt } from './scheduler.js';

const STORAGE_KEY = 'mm-state-v1';
export const STATE_VERSION = 1;

/* ────────────────────────────────────────────────────────────
   Storage backend — defaults to globalThis.localStorage when present
   (the browser), with an in-memory Map fallback so tests and any
   non-browser caller still work without special-casing.
   ──────────────────────────────────────────────────────────── */
function memoryStorage() {
  const m = new Map();
  return {
    getItem: (k) => (m.has(k) ? m.get(k) : null),
    setItem: (k, v) => { m.set(k, String(v)); },
    removeItem: (k) => { m.delete(k); },
  };
}
export function defaultStorage() {
  return (typeof globalThis.localStorage !== 'undefined') ? globalThis.localStorage : memoryStorage();
}

/* ────────────────────────────────────────────────────────────
   State shape
   ──────────────────────────────────────────────────────────── */
export function createState() {
  return {
    version: STATE_VERSION,
    playerName: null,
    grade: 1,
    lang: 'en',
    xp: 0,
    hearts: 5,
    streak: { days: 0, last: null, history: {} },
    concepts: {}, // conceptId -> ConceptState (engine/scheduler.js shape)
    moduleStats: {}, // module -> { highScore, streak } — legacy-compatible per-module high score
    pendingSync: [], // [{ id, type, payload, createdAt, attempts }]
    lastSessionAt: null,
  };
}

export function loadState(storage) {
  storage = storage || defaultStorage();
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return createState();
    const parsed = JSON.parse(raw);
    if (parsed.version !== STATE_VERSION) return createState(); // future migration point
    return { ...createState(), ...parsed };
  } catch {
    return createState();
  }
}

export function saveState(storage, state) {
  storage = storage || defaultStorage();
  storage.setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

/* ────────────────────────────────────────────────────────────
   Concept mastery — thin wrapper over engine/scheduler.js that also
   enqueues a sync op, so recording progress and queuing it to reach the
   server are never two steps a caller can forget to do together.
   ──────────────────────────────────────────────────────────── */
export function recordConceptAttempt(state, concept, correct, now) {
  now = now != null ? now : Date.now();
  const prevConceptState = state.concepts[concept] || initConceptState();
  const nextConceptState = recordAttempt(prevConceptState, correct, now);
  const nextState = {
    ...state,
    concepts: { ...state.concepts, [concept]: nextConceptState },
  };
  return enqueueSync(nextState, 'concept-attempt', { concept, correct, at: now });
}

/* ────────────────────────────────────────────────────────────
   Sync queue — the actual fix for the fire-and-forget bug.
   ──────────────────────────────────────────────────────────── */
let _idCounter = 0;
function nextSyncId() {
  _idCounter += 1;
  return `${Date.now()}-${_idCounter}`;
}

export function enqueueSync(state, type, payload) {
  const op = { id: nextSyncId(), type, payload, createdAt: Date.now(), attempts: 0 };
  return { ...state, pendingSync: [...state.pendingSync, op] };
}

/* Attempts to send every pending op via `sendFn(op) -> Promise<boolean>`.
   Ops that succeed are removed; ops that fail stay queued (with attempts
   incremented) for the next flush — nothing is ever discarded just
   because one attempt failed, unlike the old fire-and-forget POST. Ops
   are sent in order but independently: one failure doesn't block later
   ops in the same flush from being tried. Returns the next state plus a
   summary for the caller (e.g. to decide when to schedule a retry). */
export async function flushSyncQueue(state, sendFn) {
  if (!state.pendingSync.length) return { state, sent: 0, failed: 0 };
  const remaining = [];
  let sent = 0;
  let failed = 0;
  for (const op of state.pendingSync) {
    let ok = false;
    try {
      ok = await sendFn(op);
    } catch {
      ok = false;
    }
    if (ok) {
      sent += 1;
    } else {
      failed += 1;
      remaining.push({ ...op, attempts: op.attempts + 1 });
    }
  }
  return { state: { ...state, pendingSync: remaining }, sent, failed };
}

export function pendingSyncCount(state) {
  return state.pendingSync.length;
}

/* ────────────────────────────────────────────────────────────
   Day streak — ported from old game.js's getDayStreak()/
   recordDailyActivity() (localDateStr/idempotent-per-day/reset-if-gap
   logic), generalized to operate on an injected state object instead of
   reading/writing localStorage directly.
   ──────────────────────────────────────────────────────────── */
function localDateStr(d) {
  d = d || new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function recordDailyActivity(state, now) {
  const nowDate = now ? new Date(now) : new Date();
  const today = localDateStr(nowDate);
  const s = state.streak;
  if (s.last === today) return state; // idempotent per day — matches old game.js:709

  // Ported exactly as old game.js:721 computed it: continuation is
  // "was the last recorded day literally yesterday's date string",
  // not a generic day-count diff — kept identical rather than
  // "improved", since date-string comparison sidesteps DST/timezone
  // edge cases a Date-arithmetic diff could introduce.
  const yesterday = localDateStr(new Date(nowDate.getTime() - 86400000));
  const days = s.last === yesterday ? (s.days || 0) + 1 : 1;
  const history = { ...s.history, [today]: true };

  // Prune history older than 70 days — ported exactly as a cutoff-date
  // comparison (old game.js:723-724), not a "keep the most recent 70
  // entries" count, which would behave differently across a gap in the
  // history (e.g. a long break followed by one day of practice).
  const cutoff = localDateStr(new Date(nowDate.getTime() - 70 * 86400000));
  for (const k of Object.keys(history)) {
    if (k < cutoff) delete history[k];
  }

  return { ...state, streak: { days, last: today, history } };
}
