/* Music Maestro — engine/notation.js
   ABC notation helpers. Phase 2.2, 2026-08-17.

   Ported from game.js (toneToAbc, abcSingleNote, renderAbc) plus new
   chord/cadence ABC generators that did not exist before.

   Why the new generators exist: Phase 1.5's engine/content.js found a
   real bug in chord-game.html — a cadence's `chords` array (the note data
   actually used for playback and answer-checking) and its `abc` string
   (a second, independently hand-typed representation used only for
   rendering) had silently drifted apart. The G-major Interrupted
   cadence's ABC "[eBG']2" decodes to E4+B3+G5, not the E4/G4/B4 close
   triad its own chords array claimed. Two hand-typed representations of
   the same fact WILL drift eventually; the fix is to have only one
   representation (the `notes`/`chords` arrays in content.js) and DERIVE
   the ABC from it, which is what chordAbc()/cadenceAbc() do below. This
   makes that bug class structurally impossible — the ABC can never
   disagree with the notes it renders, because it IS the notes.

   Reads Tonal/ABCJS from globalThis (not `window` or `import`) so this
   module works identically in the browser (vendor/tonal/tonal.min.js and
   vendor/abcjs/abcjs-basic-min.js are classic <script> tags that set
   window globals — window === globalThis there) and in Node tests (which
   set globalThis.Tonal by running the vendored bundle in a vm context —
   see tests/theory.test.js for the established pattern). */

/* ────────────────────────────────────────────────────────────
   toneToAbc — ported verbatim from game.js:805-826
   ──────────────────────────────────────────────────────────── */
export function toneToAbc(noteName) {
  var Tonal = globalThis.Tonal;
  var note = Tonal.Note.get(noteName);
  if (!note || note.oct === undefined || note.empty) return 'c';
  var letter = note.letter;
  var acc = note.acc;
  var oct = note.oct;

  var abcAcc = '';
  if (acc === '##') abcAcc = '^^';
  else if (acc === '#') abcAcc = '^';
  else if (acc === 'bb') abcAcc = '__';
  else if (acc === 'b') abcAcc = '_';

  var abcNote;
  if (oct >= 5) abcNote = letter.toLowerCase() + "'".repeat(oct - 4);
  else if (oct === 4) abcNote = letter.toLowerCase();
  else if (oct === 3) abcNote = letter.toUpperCase();
  else if (oct === 2) abcNote = letter.toUpperCase() + ',';
  else abcNote = letter.toUpperCase() + ',,';

  return abcAcc + abcNote;
}

/* ────────────────────────────────────────────────────────────
   abcSingleNote — ported verbatim from game.js:828-832
   ──────────────────────────────────────────────────────────── */
export function abcSingleNote(abcNote, clef) {
  clef = clef || 'treble';
  var clefStr = clef === 'bass' ? ' clef=bass' : '';
  return 'X:1\nT:\nM:4/4\nL:1/4\nK:C' + clefStr + '\n' + abcNote + '4|]';
}

/* ────────────────────────────────────────────────────────────
   renderAbc — ported verbatim from game.js:834-846
   ──────────────────────────────────────────────────────────── */
export function renderAbc(divId, abcStr, extraOpts) {
  var el = document.getElementById(divId);
  if (!el) return;
  extraOpts = extraOpts || {};
  globalThis.ABCJS.renderAbc(divId, abcStr, Object.assign({
    scale: 2.2,
    staffwidth: 200,
    paddingtop: 15,
    paddingbottom: 10,
    paddingleft: 10,
    paddingright: 10,
  }, extraOpts));
}

/* ────────────────────────────────────────────────────────────
   chordAbc — NEW. Derives an ABC chord bracket from a notes array, e.g.
   chordAbc(['C4','E4','G4'], {duration:4}) -> '[ceg]4'
   matching the exact convention chord-game.html's hand-typed strings
   used (L:1/4, bracket of bare ABC note letters, trailing duration
   multiplier — no octave markers repeated inside the bracket beyond
   what toneToAbc already encodes per note).
   ──────────────────────────────────────────────────────────── */
export function chordAbc(notes, opts) {
  opts = opts || {};
  var duration = opts.duration != null ? opts.duration : 4;
  return '[' + notes.map(toneToAbc).join('') + ']' + duration;
}

/* ────────────────────────────────────────────────────────────
   cadenceAbc — NEW. Derives a full playable 2-chord cadence ABC string
   from a `chords: [[...],[...]]` pair, e.g.
   cadenceAbc([['G4','B4','D5'],['C4','E4','G4']])
     -> 'X:1\nT:\nM:4/4\nL:1/4\nK:C\n[gbd\']2 [ceg]2|]'
   matching the exact convention chord-game.html's hand-typed cadence
   strings used (each chord held for 2 quarter-note beats, one bar total).
   ──────────────────────────────────────────────────────────── */
export function cadenceAbc(chords, opts) {
  opts = opts || {};
  var perChordDuration = opts.perChordDuration != null ? opts.perChordDuration : 2;
  var body = chords.map((c) => chordAbc(c, { duration: perChordDuration })).join(' ');
  return 'X:1\nT:\nM:4/4\nL:1/4\nK:C\n' + body + '|]';
}
