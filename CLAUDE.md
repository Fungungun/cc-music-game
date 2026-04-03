# CLAUDE.md — CC's Music Game

Context for Claude Code sessions working on this project.

---

## Project purpose

A web-based music theory learning game for **CC** (real name **Xi**), a child learning piano at **AMEB Grade 2–3** level. The goal is to make AMEB exam preparation fun and interactive. CC plays near an iPad, so the game must work well on tablet (landscape) as well as desktop.

---

## Tech stack

| Tool | Why |
|---|---|
| Pure HTML/CSS/JS | No build step — easy to deploy anywhere, CC's parent can edit it |
| Tone.js | High-quality piano audio using Salamander Grand Piano samples |
| Tonal.js | Music theory helpers (scale notes, interval distances, note transposition) |
| abcjs | Renders sheet music notation from ABC strings |
| Cloudflare Pages | Free static hosting, auto-deploys on git push |

**No npm, no bundlers, no framework.** All scripts are loaded from CDN.

---

## CDN script tags (exact URLs — do not change)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.32/Tone.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/tonal/browser/tonal.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/abcjs/dist/abcjs-basic-min.js"></script>
<script src="game.js"></script>
```

Every HTML page (except index.html, which can optionally omit abcjs) must include all four tags in `<head>`.

---

## File structure

```
index.html            Main menu — 7 module cards + per-module high scores
style.css             Shared styles (colours, buttons, keyboard, flashcard, animations)
game.js               Shared utilities (sampler, score, animations, piano keyboard builder)
note-namer.html       Identify notes on treble/bass clef
scale-builder.html    Build major & harmonic minor scales on on-screen piano
interval-quiz.html    Name diatonic intervals
chord-game.html       Identify triads & cadences
rhythm-tapper.html    Tap along to rhythm patterns
terms-flashcards.html Italian/French terms flashcards with spaced repetition
form-detective.html   Identify Binary/Ternary form, cadence types, time signatures
.gitignore
README.md
CLAUDE.md             (this file)
```

---

## Piano sampler (game.js: initSampler)

```javascript
sampler = new Tone.Sampler({
  urls: {
    "A0":"A0.mp3","C1":"C1.mp3","Ds1":"Ds1.mp3","Fs1":"Fs1.mp3",
    // ... all 30 sample keys listed in game.js ...
    "A7":"A7.mp3","C8":"C8.mp3"
  },
  baseUrl: "https://tonejs.github.io/audio/salamander/",
  onload: function() { samplerReady = true; hideLoadingOverlay(); onReady(); }
}).toDestination();
```

`initSampler(callback)` is called at `DOMContentLoaded` in every game page. It shows `#loading-overlay` while samples fetch, hides it when done, then calls the callback to enable play buttons.

A 15-second fallback timeout hides the overlay even if samples haven't fully loaded.

---

## Audio gotchas

1. **User gesture required**: Browsers block AudioContext until a user interaction. Always call `await Tone.start()` (via `ensureAudio()`) before any `sampler.triggerAttackRelease()`. The `ensureAudio()` helper in game.js does this.

2. **Tone.loaded() vs onload**: game.js uses both `onload` callback and `Tone.loaded().then(...)` to be safe.

3. **Delay before triggering**: Add a small offset (`Tone.now() + 0.05`) to avoid clicks at audio start.

---

## Cloudflare Pages deployment

**GitHub repo**: `cc-music-game` | **Branch**: `main`

**One-time Cloudflare setup** (already done):
1. pages.cloudflare.com → Create a project → Connect to Git → select `cc-music-game`
2. Framework preset: **None** | Build command: _(leave blank)_ | Output directory: `/` (root)
3. Save and Deploy

**Every `git push` to `main` auto-deploys** within ~60 seconds.

Live URL: `https://cc-music-game.pages.dev`

**All file links must be relative** (e.g. `href="style.css"`, `src="game.js"`). Never use absolute filesystem paths. Cloudflare serves from the repo root.

---

## localStorage keys

| Key | Module | Contents |
|---|---|---|
| `cc-note-namer` | Note Namer | `{ highScore, streak }` |
| `cc-scale-builder` | Scale Builder | `{ highScore, streak }` |
| `cc-interval-quiz` | Interval Quiz | `{ highScore, streak }` |
| `cc-chord-game` | Chord Game | `{ highScore, streak }` |
| `cc-rhythm-tapper` | Rhythm Tapper | `{ highScore, streak }` |
| `cc-terms-flashcards` | Flashcards | `{ highScore, streak }` |
| `cc-form-detective` | Form Detective | `{ highScore, streak }` |
| `cc-terms-srs` | Flashcards SRS | `{ [termId]: { nextDue, interval, reps } }` |

`getModuleData(module)` and `saveModuleData(module, data)` in game.js handle all reads/writes.

localStorage is per-origin — works fine at `cc-music-game.pages.dev` but not across different domains.

---

## Design rules

**Colours (CSS variables in style.css):**
- Pink: `#FFB7C5` / darker `#FF8FAB`
- Yellow: `#FFF3B0` / darker `#FFE066`
- Mint: `#C7F2E3` / darker `#7FD9B5`
- Lavender: `#E0D4F7` / darker `#B09FE0`
- Coral: `#FFD4A3` / darker `#FFA858`
- Sky blue: `#D4EEFF` / darker `#80C4F0`
- Purple: `#F0D4FF` / darker `#D090F0`
- Correct: `#4CAF50` | Wrong: `#FF6B6B`

**Module accent colours (header backgrounds):**
1. Note Namer → Pink gradient (`#FF8FAB` → `#FFB7C5`)
2. Scale Builder → Mint gradient (`#2E8B6E` → `#C7F2E3`)
3. Interval Quiz → Lavender gradient (`#7B52C9` → `#E0D4F7`)
4. Chord Game → Yellow gradient (`#B8860B` → `#FFF3B0`)
5. Rhythm Tapper → Coral gradient (`#E07B20` → `#FFD4A3`)
6. Terms Flashcards → Sky gradient (`#5B9BD5` → `#D4EEFF`)
7. Form Detective → Purple gradient (`#8B2FC9` → `#F0D4FF`)

**Typography:** minimum 18px throughout; `font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`

**Buttons:** large, rounded (`border-radius: 20px`), hover lift effect, `min 14px padding`

**Emoji:** used liberally — 🎹 🎵 🎶 🌟 ⭐ on buttons and headings

---

## Encouraging messages (in game.js)

**Correct — rotate randomly:**
- "Amazing work, CC! 🌟"
- "You're a music star, CC! 🎵"
- "Brilliant, CC! Keep going! ✨"
- "That's right, CC! You're so clever! 🎹"
- "Woohoo CC! Your piano teacher would be proud! 🏆"
- "Correct! CC is on fire today! 🔥"
- "Yes yes yes! You got it CC! 🎉"
- "CC you're amazing at this! 💫"
- "Perfect, CC! You're going to ace your AMEB exam! 🎓"
- "Superstar CC strikes again! ⭐"

**Wrong — gentle, never discouraging:**
- "Almost CC! Give it another try 💪"
- "Not quite, CC — you've got this! 🌈"
- "Oops! Try again CC, I believe in you! 🎵"
- "Nearly there CC! Have another go 😊"
- "Don't give up CC, you're learning! 🌟"

---

## AMEB curriculum scope

### Keys covered
**Major scales:** C, G, F, D, A, E, B♭, E♭, A♭  
**Harmonic minor:** A, E, D, G, C

### Intervals (interval-quiz.html)
P1, M2, m3, M3, P4, d5/A4, P5, m6, M6, m7, M7, P8  
Root notes: C4, D4, E4, F4, G4, A4

### Chords (chord-game.html)
- Major triads root position: C, G, F, D, A
- Minor triads root position: A, D, E
- Major triads 1st inversion: C, G, F
- Cadences: Perfect (V→I) and Plagal (IV→I) in C, G, F major

### Time signatures (rhythm-tapper.html, form-detective.html)
2/4, 3/4, 4/4, 2/2, 6/8, 9/8 (simple duple, triple, quadruple; compound duple, triple)

### Music terms (terms-flashcards.html)
All Grade 1 + 2 + 3 terms — see the `ALL_TERMS` array in `terms-flashcards.html` for the complete list (66 terms total).

---

## ABC notation quick reference

| Scientific pitch | ABC notation |
|---|---|
| C2 | `C,` |
| C3 | `C` (uppercase, no comma) |
| C4 (middle C) | `c` (lowercase) |
| C5 | `c'` |
| C6 | `c''` |
| F#4 | `^f` |
| Bb4 | `_b` |
| Chord C4-E4-G4 | `[ceg]` |
| Whole note (L:1/4) | `c4` |
| Bass clef | `K:C clef=bass` |

The `toneToAbc(noteName)` function in game.js converts Tone.js note names (e.g. `"F#4"`) to ABC notation characters (e.g. `"^f"`).

The `renderAbc(divId, abcStr, extraOpts)` wrapper calls `ABCJS.renderAbc` with consistent default options (scale 2.2, etc.).

**The target div must exist in the DOM before calling renderAbc.** Always call it inside `DOMContentLoaded` or after the element is created.

---

## Piano keyboard (game.js: buildKeyboard)

`buildKeyboard(containerId, options)` creates a CSS piano keyboard inside `document.getElementById(containerId)`. Options:

```javascript
{
  startMidi: 48,   // C3 = MIDI 48
  endMidi: 84,     // C6 = MIDI 84
  onKeyClick: function(toneNote, midiNum, element) {},
  whiteWidth: 36,  // px
  blackWidth: 22,
  whiteHeight: 120,
  blackHeight: 75,
}
```

Helper functions:
- `highlightPianoKeys(noteNames, className)` — adds CSS class to matching keys (by `data-note`)
- `clearPianoHighlights()` — removes `active`, `correct`, `wrong-key`, `scale-hint` from all keys

CSS classes for key states: `.active` (mint), `.correct` (green), `.wrong-key` (red), `.scale-hint` (mint, lighter)

The keyboard container must have `overflow-x: auto` (class `.keyboard-scroll`) for small screens.

---

## How to add a new module

1. Create `module-name.html` copying the header/progress/loading structure from an existing module
2. Include all 4 CDN `<script>` tags + `<link rel="stylesheet" href="style.css">`
3. Add `#loading-overlay` div
4. Add header with `.back-btn` → `index.html`, score display, and progress bar elements
5. Call `initSampler(() => { /* enable UI */ })` in `DOMContentLoaded`
6. Create a `new SessionScore('module-name')` instance
7. Call `score.onCorrect()` / `score.onWrong()` on each answer
8. Call `triggerStarburst(element)` on correct answers
9. Call `addShake(element)` on wrong answers
10. Add the module card to `index.html` (`.module-card` with link + icon + description)
11. Add the localStorage key to this CLAUDE.md

---

## How to redeploy

```bash
# In /Users/a55/Documents/music_game/
git add .
git commit -m "describe what you changed"
git push
```

Cloudflare Pages auto-deploys within ~60 seconds. No other steps needed.

---

## Known gotchas

- **`Tone.start()` must be called from a user gesture.** The `ensureAudio()` helper does this. Never call `sampler.triggerAttackRelease()` without first calling `await ensureAudio()`.
- **`ABCJS.renderAbc()` target div must exist in DOM.** If the div is conditionally rendered, always call renderAbc after the div is in the DOM (e.g. inside a function called after state changes, not at script parse time).
- **Cloudflare Pages serves from root.** All links must be relative — `href="style.css"` not `href="/style.css"` or absolute paths.
- **localStorage is per-origin.** Scores saved at `cc-music-game.pages.dev` won't appear if you open the files locally via `file://`. Use a local HTTP server (e.g. `python3 -m http.server`) for local development.
- **Tone.js `onload` vs `Tone.loaded()`.** Use both (as game.js does) for reliability — some browser environments handle one better than the other.
- **iPad Safari AudioContext.** The user must tap something before any sound plays. The loading overlay acts as the first interaction barrier on most pages.
