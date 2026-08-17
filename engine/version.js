/* Music Maestro — single source of truth for the app version.
   Bump this on every commit (see CLAUDE.md "Version bumping rule").

   This is deliberately NOT rendered anywhere in the UI — a prior version of
   the app injected APP_VERSION as a visible footer on every page
   (game.js, removed in commit f78ac73, "Redesign Parent View as a practice
   record") and that was a deliberate design decision, not an oversight.
   This module exists only to give the 19+ HTML files' cache-busting query
   strings (<script src="game.js?v=...">) one canonical value to stay in
   sync with, enforced by tests/version-sync.test.mjs. */

export const APP_VERSION = "v7.0 · 2026-08-17";

/* URL-query-safe slug derived from APP_VERSION, used as the ?v= value on
   every <script src="....js?v=CACHE_BUST_TOKEN"> tag across the site.
   Keep this in the format YYYYMMDD-short-label so it sorts and diffs
   sensibly in git history. */
export const CACHE_BUST_TOKEN = "20260817-v7-foundations";
