# CLAUDE.md — CC Music Game (v5.3)

Context for Claude Code sessions working on this project.

---

## Project purpose

A commercial web-based **music theory learning + AMEB exam preparation platform**, targeting **AMEB Piano (classical) Syllabus 2026, Grades 1–3**. Grade 1 is free; Grades 2–3 require a one-time $14.99 AUD payment via Stripe. Hosted at `music.vensoai.com`.

The product approach is: **teach → practice → exam prep**. Every module has an educational component, a game/practice mode, and feeds into the mock exam question bank.

---

## Tech stack

| Tool | Purpose |
|---|---|
| Pure HTML/CSS/JS | No build step — deployed as static files |
| Tone.js v14.8.32 | Piano audio via Salamander Grand Piano samples |
| Tonal.js | Music theory helpers (scales, intervals, note math) |
| abcjs | Renders sheet music from ABC notation strings |
| Cloudflare Pages | Auto-deploys on `git push` to `main` |
| Supabase v2 JS SDK | Auth (sign-in/up/out), profile, progress sync |
| Stripe | One-time payment link, $14.99 AUD |

**No npm, no bundlers, no framework.** All scripts loaded from CDN.

---

## CDN script tags (exact — do not change)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.32/Tone.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tonal/browser/tonal.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs/dist/abcjs-basic-min.js"></script>
<script src="game.js"></script>
```

Every HTML page (except `index.html`, which may optionally omit abcjs) must include all four tags in `<head>`, preceded by `<link rel="stylesheet" href="style.css">`.

---

## File structure

```
index.html              Home page — hero + grade selector + 12 module cards + exam CTA
style.css               Shared styles (design system, components, responsive)
game.js                 Shared utilities + SYLLABUS data object (see below)
i18n.js                 Translation strings — English / Chinese / Spanish
supabase.js             Supabase auth helpers (do not modify unless auth breaks)

note-namer.html         Identify notes on treble/bass clef staff
scale-builder.html      Build major & harmonic minor scales on piano keyboard
key-signatures.html     Identify key signatures (sharps/flats → key name) [NEW]
note-values.html        Identify note/rest values in beats [NEW]
interval-quiz.html      Name diatonic intervals (visual + aural modes)
chord-game.html         Identify triads, inversions, cadence types
rhythm-trainer.html     Tap along to rhythms + identify time signatures
terms-flashcards.html   Italian/French terms — SRS spaced repetition
aural-training.html     Ear training — intervals, pitch direction, sing-back
form-detective.html     Binary/Ternary form, cadence types, time signatures
learn.html              Theory reference — all testable content per grade
mock-exam.html          Mock exam — 20-question sessions drawn from 100-question banks

landing.html            Public landing page (auth gate)
reset-password.html     Password reset flow
teachers.html           For Teachers page
privacy.html            Privacy policy
terms.html              Terms of service
404.html                Not found page
sw.js                   Service worker (PWA offline support)
CLAUDE.md               This file
```

---

## SYLLABUS data object (game.js)

`SYLLABUS` is the single source of truth for all curriculum content. All modules read from it.

```javascript
SYLLABUS.scales[grade]           // Array of scale objects {name, key, type, notes[]}
SYLLABUS.keySignatures[grade]    // Array {key, relativeMinor, sharps, flats, accidentals[]}
SYLLABUS.intervals[1]            // Grade 1 interval list (number-only answers)
SYLLABUS.intervals[2]            // Grades 2-3 interval list (quality+number answers)
SYLLABUS.getIntervals(grade)     // Returns intervals[1] for grade 1, intervals[2] for 2-3
SYLLABUS.intervalRoots[grade]    // Root notes available for interval exercises
SYLLABUS.chords[grade]           // { triads[], cadences[] }
SYLLABUS.terms[grade]            // Terms introduced in that grade only (not cumulative)
SYLLABUS.getAllTermsForGrade(g)  // Returns all terms from grades 1 through g (cumulative)
SYLLABUS.timeSignatures[grade]   // Array {sig, beats, unit, feel}
SYLLABUS.noteValues              // Array {id, name, abcDur, beatsIn44, hasRest}
SYLLABUS.getScales(grade)        // Returns scales for that grade (cumulative up to grade 3)
```

---

## Piano sampler (game.js: initSampler)

```javascript
initSampler(onReady)
```

Shows `#loading-overlay`, creates Tone.Sampler with Salamander samples, hides overlay and calls `onReady()` when done. Includes 5-second fallback timeout. Call inside `DOMContentLoaded`.

---

## Audio gotchas

1. **User gesture required**: Always call `await ensureAudio()` before any `sampler.triggerAttackRelease()`.
2. **Delay before triggering**: Use `Tone.now() + 0.05` to avoid audio clicks.
3. **iPad Safari**: User must tap something before any sound plays.

---

## Cloudflare Pages deployment

**GitHub repo**: `fungungun/cc-music-game` | **Branch**: `main`
**Live URL**: `music.vensoai.com` (custom domain on Cloudflare Pages)

```bash
git add -p                         # stage specific changes
git commit -m "vX.Y: describe"
git push                           # auto-deploys within ~60s
```

**All links must be relative** — `href="style.css"`, never `/style.css` or absolute paths.

---

## localStorage keys

| Key | Contents |
|---|---|
| `cc-note-namer` | `{ highScore, streak }` |
| `cc-scale-builder` | `{ highScore, streak }` |
| `cc-key-signatures` | `{ highScore, streak }` |
| `cc-note-values` | `{ highScore, streak }` |
| `cc-interval-quiz` | `{ highScore, streak }` |
| `cc-chord-game` | `{ highScore, streak }` |
| `cc-rhythm-trainer` | `{ highScore, streak }` |
| `cc-terms-flashcards` | `{ highScore, streak }` |
| `cc-aural-training` | `{ highScore, streak }` |
| `cc-form-detective` | `{ highScore, streak }` |
| `cc-mock-exam` | `{ highScore, streak }` |
| `cc-terms-srs` | `{ [termId]: { nextDue, interval, reps } }` |
| `mm-mastery` | `{ [module:concept]: { correct, wrong, lastSeen } }` |
| `cc-grade` | `"1"` / `"2"` / `"3"` |
| `mm-unlocked` | `"true"` (fallback when Supabase unavailable) |
| `player-name` | Display name |
| `mm-lang` | `"en"` / `"zh"` / `"es"` |

`getModuleData(module)` / `saveModuleData(module, data)` handle per-module reads/writes.

---

## Design system (style.css)

**Font**: Nunito (Google Fonts, 400-900 weights)
**Minimum font size**: 16px (18px default)
**Background**: `#EFF2F7`

**CSS colour variables:**
```css
--pink:    #FFB7C5  --mint:    #C7F2E3  --lavender: #E0D4F7
--yellow:  #FFF3B0  --coral:   #FFD4A3  --sky:      #D4EEFF
--purple:  #F0D4FF  --white:   #FFFFFF  --offwhite: #F9F9F9
--text:    #1a2233  --text-light: #5a6480
```

**Module accent colours** (used as `data-accent` on `.module-card`):

| Module | Accent | Band gradient |
|---|---|---|
| Note Namer | `pink` | `#FF8FAB → #FFB7C5` |
| Scale Builder | `mint` | `#2E8B6E → #7FD9B5` |
| Key Signatures | `teal` | `#0097A7 → #80DEEA` |
| Note Values | `coral` | `#E07B20 → #FFD4A3` |
| Interval Quiz | `lavender` | `#7B52C9 → #C4B5F5` |
| Chord Game | `yellow` | `#D4A017 → #FFE066` |
| Rhythm Trainer | `orange` | `#F57C00 → #FFCC80` |
| Terms Flashcards | `sky` | `#3a7bd5 → #80C4F0` |
| Aural Training | `mint2` | `#00897B → #80CBC4` |
| Form Detective | `purple` | `#8B2FC9 → #D4AAFF` |
| Learn | `grape` | `#6d3fc9 → #C4AAFF` |
| Mock Exam | `brown` | `#bf7a30 → #FFD4A3` |

**Key component classes:**
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-mint`, `.btn-lavender`, etc.
- `.answer-btn` with `.correct-ans` / `.wrong-ans`
- `.option-btn` with `.correct-opt` / `.wrong-opt` (mock exam style)
- `.mode-btn` / `.mode-toggle` — tab/toggle pills
- `.staff-container` — white card for abcjs staff rendering
- `.flashcard-area` / `.flashcard-inner` / `.flashcard-face` — 3D flip card
- `.question-card` / `.question-text` / `.options-grid` — mock exam layout
- `.play-btn` — purple gradient, audio play trigger
- `.hint-box` — yellow hint callout
- `.learn-card` — theory reference card (used in learn.html)
- `.exam-banner` — purple CTA banner (used on index.html)
- `.review-item` — wrong answer review in mock exam
- `.progress-steps` / `.step-dot` — step indicator row
- `.cat-chip` — terms category badge (`.cat-tempo`, `.cat-dynamic`, etc.)
- `.grade-badge` / `.grade-badge.grade-1/2/3`

---

## Grade gating

```javascript
getGrade()           // Returns 1-3; falls back to 1 if Grade 2+ without access
hasFullAccess()      // true if Supabase profile shows paid, or localStorage mm-unlocked
showUpgradeModal()   // Shows inline upgrade modal with Stripe link
gotoPayment()        // Requires sign-in first, then redirects to Stripe
```

`STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/eVq5kE1Kf6rZ2OH78h1ck04'`

---

## ABC notation quick reference

| Scientific pitch | ABC | Notes |
|---|---|---|
| C4 (middle C) | `c` | lowercase = octave 4 |
| C5 | `c'` | prime = +1 octave |
| C3 | `C` | uppercase = octave 3 |
| C2 | `C,` | comma = octave 2 |
| F#4 | `^f` | `^` = sharp |
| Bb4 | `_b` | `_` = flat |
| Chord C4-E4-G4 | `[ceg]` | |
| Whole note (L:1/4) | `c4` | duration multiplier |
| Bass clef | `K:C clef=bass` | |

`toneToAbc(noteName)` converts Tone.js note names to ABC.
`abcSingleNote(abcNote, clef)` builds a minimal single-note ABC string.
`renderAbc(divId, abcStr, extraOpts)` wraps ABCJS with default options (scale 2.2).

**The target div must exist in the DOM before calling `renderAbc`.**

---

## Piano keyboard (game.js: buildKeyboard)

```javascript
buildKeyboard(containerId, {
  startMidi: 48, endMidi: 84,   // C3-C6
  onKeyClick: function(toneNote, midiNum, element) {},
  whiteWidth: 36, blackWidth: 22,
  whiteHeight: 120, blackHeight: 75,
})
highlightPianoKeys(noteNames, className)   // 'active' | 'correct' | 'wrong-key' | 'scale-hint'
clearPianoHighlights()
```

Container must have `overflow-x: auto` (class `.keyboard-scroll`) for small screens.

---

## Concept mastery tracking

```javascript
trackAnswer(module, concept, isCorrect)    // Persists to mm-mastery in localStorage
getWeakConcepts(n)                         // Returns n lowest-accuracy concepts (global)
getWeakConceptsForModule(module, n)        // Filtered to one module
weightedPickConcept(pool)                  // Picks from pool weighted by weakness
```

---

## Encouraging messages

`randomCorrect()` / `randomWrong()` — rotate through 10 correct + 5 wrong messages. Use `{name}` placeholder (resolved via `getPlayerName()`). Respect current language if `TRANSLATIONS` is loaded.

---

## AMEB curriculum scope (v5.0)

### Grade 1 (Free)
- **Scales:** C, G, F major; A, D, E harmonic minor
- **Key signatures:** C (0), G (1#), F (1b)
- **Intervals:** P1, M2, M3, P4, P5, P8 — answered by number only
- **Chords:** C, G, F major root position; Perfect (V-I) + Plagal (IV-I) in C
- **Time sigs:** 2/4, 3/4, 4/4
- **Note values:** semibreve, minim, crotchet, quaver, semiquaver + rests
- **Terms:** 17 terms (Adagio, Andante, Moderato, Allegro, Presto, accel., rall., rit., riten., a tempo, f, p, cresc., decresc., dim., legato, staccato)
- **Aural:** higher/lower pitch; clap beats; sing back 5-6 note phrase
- **GK:** name notes/rests/signs/terms; title; key/tonality

### Grade 2 (Paid)
- **All Grade 1 content, plus:**
- **Scales:** + D, A, Bb, Eb major; + G, C harmonic minor (12 total)
- **Key signatures:** + D (2#), A (3#), Bb (2b), Eb (3b)
- **Intervals:** All 12 — full quality + number names (M2, m3, P4, d5, etc.)
- **Chords:** + D, A major; A, D, E minor root position; + cadences in G and F major
- **Time sigs:** + 6/8 (compound duple); dotted minim, dotted crotchet
- **Terms:** + 24 terms (Lento, Largo, Allegretto, Vivace, pp, ff, mp, mf, Maestoso, Cantabile, etc.)
- **Aural:** rhythm in duple/triple; melodic sing-back; M3 or P5 higher/lower
- **GK:** + identify key changes

### Grade 3 (Paid)
- **All Grade 1-2 content, plus:**
- **Scales:** + E, Ab major; completing 5 harmonic minors (14 scales total)
- **Key signatures:** + E (4#), B (5#), Ab (4b)
- **Intervals:** Same 12 — answered as "2nd/3rd of scale" (keynote given)
- **Chords:** + 1st inversions of C, G, F major + A, D, E minor; + Imperfect (I-V) + Interrupted (V-VI) cadences
- **Time sigs:** + 2/2 (cut time), 9/8
- **Terms:** + 27 terms (Agitato, Tranquillo, Dolce, Sfz, Attacca, Una corda, Tre corde, etc.)
- **Form:** Binary (AB), Ternary (ABA)
- **GK:** + key changes; form identification

---

## Mock Exam architecture (mock-exam.html)

Questions are **dynamically generated** from `SYLLABUS` data (not a fixed question bank), giving infinite variety per session.

- **Session**: 20 questions, weighted-random across 8 question types
- **Types**: note naming, key sig → name, name → key sig, interval visual, note value, term meaning, meaning → term, cadence aural
- **Cadence questions**: aural (play button mandatory before answering)
- **Scoring**: HD ≥85% · Distinction ≥75% · Credit ≥65% · Pass ≥50% · Not Yet Passing <50%
- **Wrong answer review**: shown at end of session with correct answers
- **Retake**: reshuffles new questions on each attempt

---

## How to add a new module

1. Copy header/loading structure from `note-namer.html`
2. Include all 4 CDN `<script>` tags + `<link rel="stylesheet" href="style.css">`
3. Add `#loading-overlay` div
4. Header: `.back-btn` to `index.html`, score display, progress bar
5. `initSampler(() => { /* enable UI */ })` inside `DOMContentLoaded`
6. `new SessionScore('module-key')` — key matches localStorage `cc-{key}`
7. Call `score.onCorrect()` / `score.onWrong()` on each answer
8. Call `trackAnswer(module, concept, isCorrect)` for mastery tracking
9. Call `triggerStarburst(element)` on correct, `addShake(element)` on wrong
10. Add module card to `index.html`
11. Add localStorage key to this CLAUDE.md

---

## Version bumping rule

**Bump `APP_VERSION` in `game.js` with every single commit** — no exceptions.
Format: `"vX.Y · YYYY-MM-DD"`

---

## Known gotchas

- **`Tone.start()` must be called from a user gesture.** `ensureAudio()` does this. Never skip it.
- **`ABCJS.renderAbc()` target div must exist in DOM.** Always call after the element is created.
- **Cloudflare Pages serves from root.** Links must be relative — `href="style.css"` not `/style.css`.
- **localStorage is per-origin.** Scores at `music.vensoai.com` won't appear locally via `file://`. Use `python3 -m http.server` for local dev.
- **Grade 2+ access gate.** Always call `hasFullAccess()` before showing Grade 2/3 content. If false, call `showUpgradeModal()`.
- **SYLLABUS intervals[grade].** Grade 3 uses the same interval list as Grade 2. Use `SYLLABUS.getIntervals(grade)` to get the right list.

---

## Build status (as of v5.3)

| Phase | Status | Files |
|---|---|---|
| Phase 1 — Foundation | ✅ Done | `game.js`, `style.css`, `CLAUDE.md` |
| Phase 2 — Home + Auth | ✅ Done | `index.html`, `i18n.js` |
| Phase 3 — Basic Modules | ✅ Done | `note-namer.html`, `scale-builder.html`, `key-signatures.html`, `note-values.html` |
| Phase 4 — Advanced Modules | ✅ Done | `interval-quiz.html`, `chord-game.html`, `rhythm-trainer.html`, `terms-flashcards.html` |
| Phase 5 — Specialist | ✅ Done | `aural-training.html`, `form-detective.html`, `learn.html` |
| Phase 6 — Mock Exam | ✅ Done | `mock-exam.html` |
| Phase 7 — Polish + Deploy | ✅ Done | All modules v5.3 |
