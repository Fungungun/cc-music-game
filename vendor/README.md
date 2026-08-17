# Vendored runtime dependencies

Self-hosted, pinned copies of every third-party script this app loads. Added Phase 1.2
(2026-08-17) because `abcjs` and `marked` were previously loaded unpinned from jsDelivr
(`.../npm/abcjs/...`, `.../npm/marked/...` — no version in the URL), meaning any upstream
breaking release would silently change or break every page. Tone.js and Tonal were already
version-pinned in their CDN URLs but still depended on third-party hosts staying up.

Every file below was downloaded from the exact version that was live in production at the time
of vendoring, and verified byte-identical to the unpinned "latest" response before being
committed — see the Phase 1.2 commit message for the verification method.

| File | Package | Version | Source |
|---|---|---|---|
| `tone/Tone.min.js` | tone | 14.8.32 | `cdnjs.cloudflare.com/ajax/libs/tone/14.8.32/Tone.min.js` |
| `tonal/tonal.min.js` | tonal | 6.4.3 | `cdn.jsdelivr.net/npm/tonal@6.4.3/browser/tonal.min.js` |
| `abcjs/abcjs-basic-min.js` | abcjs | 6.7.0 | `cdn.jsdelivr.net/npm/abcjs@6.7.0/dist/abcjs-basic-min.js` |
| `marked/marked.min.js` | marked | 15.0.12 | `cdn.jsdelivr.net/npm/marked@15.0.12/marked.min.js` |

## Updating a vendored library

1. Decide on a target version deliberately — don't just grab "latest". Check the package's
   changelog for breaking changes first, especially for `abcjs` (staff rendering) and `tonal`
   (used by `tests/theory.test.js` to validate all music data — a Tonal behavior change could
   silently flip what the test suite considers "correct").
2. `curl -sf https://cdn.jsdelivr.net/npm/<pkg>@<version>/<path> -o vendor/<pkg>/<file>`
3. Update the version/source row in the table above.
4. Run `npm test` — `tests/theory.test.js` (Phase 1.6) and `tests/browser-smoke.mjs` are the
   most likely to catch a breaking change.
5. Bump `APP_VERSION` / `CACHE_BUST_TOKEN` in `engine/version.js` per the normal rule.

## Why not npm + a bundler

This project deliberately has no build step (see `CLAUDE.md` "Tech stack" — pure HTML/CSS/JS
deployed as static files via Cloudflare Pages). Vendoring is copy-in, not `npm install`; there is
no `node_modules` dependency at runtime, only at test-time (Node's built-in `node:test`, `node:vm`
etc. — zero third-party packages required, see `package.json`).
