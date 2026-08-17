/* ============================================================
   Music Maestro — engine/content.js
   Canonical music-theory data. Phase 1.5, 2026-08-17.

   Replaces game.js's SYLLABUS object and the divergent copies found
   duplicating parts of it across the app:
     interval-quiz.html, aural-training.html, chord-game.html,
     note-values.html, note-namer.html, exam-questions.js
   (rhythm-trainer.html's PATTERNS and form-detective.html's QUESTIONS are
   pre-composed exercise items, not derivable facts — SYLLABUS never
   covered them either. They belong in Phase 2/3's engine/items/ item
   banks, not here. Folding them into "canonical facts" would be a
   category error.)

   Every discrepancy found between the copies was resolved deliberately,
   not silently — see the "RESOLVED CONFLICT" comments throughout. Every
   number in here is checked against Tonal.js by tests/theory.test.js
   (Phase 1.6); if that test and this file ever disagree, the test is
   telling the truth and this file has the bug.

   ES module — import { SCALES, ... } from './content.js'. Not yet wired
   into any page (game.js's SYLLABUS is untouched and still what every
   live page reads); that cutover is Phase 3.
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   NOTE NAMES — treble & bass clef staff positions
   Ported from note-namer.html's TREBLE_NOTES/BASS_NOTES, which was
   correctly grade-scoped (unlike exam-questions.js's TREBLE/BASS, which
   is NOT grade-filtered at all — see RESOLVED CONFLICT below).

   RESOLVED CONFLICT: note-namer.html's entries had no `clef` field, which
   is the exact cause of a real bug (note-namer.html:268,279): every
   bass-clef answer was tracked as trackAnswer('note-namer', name+'-'+
   (currentNote.clef||'treble'), ...) — since .clef was always undefined,
   EVERY bass-clef answer was silently recorded as a treble-clef one, and
   bass-clef weakness was invisible to the parent view. Added below.

   RESOLVED CONFLICT: exam-questions.js's TREBLE array (10 notes, C4–E5,
   used for every grade with no filtering) includes C4 unconditionally.
   C4 (middle C) sits on the ledger line BELOW the treble staff and is
   correctly withheld until Grade 2 here ({tone:'C4', minGrade:2,
   ledger:'below'}) — a Grade 1 mock-exam/daily-challenge question could
   therefore ask a Grade 1 student to name a ledger-line note nothing in
   the Grade 1 curriculum has taught them yet. Likewise exam-questions.js's
   BASS array includes B3, which is correctly Grade 2+ here. This file
   fixes the DATA; exam-questions.js itself is not touched until its
   Phase 2/3 replacement, but its generator must not keep drawing from an
   unfiltered pool once it reads from here.
   ──────────────────────────────────────────────────────────── */
export const NOTE_NAMES = {
  treble: [
    // Grade 1: lines and spaces of the treble staff (E4–F5), no ledger lines
    { tone: 'E4', letter: 'E', abc: 'E',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'F4', letter: 'F', abc: 'F',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'G4', letter: 'G', abc: 'G',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'A4', letter: 'A', abc: 'A',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'B4', letter: 'B', abc: 'B',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'C5', letter: 'C', abc: 'c',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'D5', letter: 'D', abc: 'd',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'E5', letter: 'E', abc: 'e',  clef: 'treble', minGrade: 1, ledger: null },
    { tone: 'F5', letter: 'F', abc: 'f',  clef: 'treble', minGrade: 1, ledger: null },
    // Grade 2: extend range + one ledger line each side
    { tone: 'C4', letter: 'C', abc: "C,", clef: 'treble', minGrade: 2, ledger: 'below' }, // middle C
    { tone: 'D4', letter: 'D', abc: "D,", clef: 'treble', minGrade: 2, ledger: 'below' },
    { tone: 'G5', letter: 'G', abc: "g",  clef: 'treble', minGrade: 2, ledger: 'above' },
    { tone: 'A5', letter: 'A', abc: "a",  clef: 'treble', minGrade: 2, ledger: 'above' },
    { tone: 'B5', letter: 'B', abc: "b",  clef: 'treble', minGrade: 2, ledger: 'above' },
    // Grade 3: top ledger lines
    { tone: 'C6', letter: 'C', abc: "c'", clef: 'treble', minGrade: 3, ledger: 'above' },
    { tone: 'D6', letter: 'D', abc: "d'", clef: 'treble', minGrade: 3, ledger: 'above' },
  ],
  bass: [
    // Grade 1: lines and spaces of the bass staff (G2–A3), no ledger lines
    { tone: 'G2', letter: 'G', abc: 'G,', clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'A2', letter: 'A', abc: 'A,', clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'B2', letter: 'B', abc: 'B,', clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'C3', letter: 'C', abc: 'C',  clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'D3', letter: 'D', abc: 'D',  clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'E3', letter: 'E', abc: 'E',  clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'F3', letter: 'F', abc: 'F',  clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'G3', letter: 'G', abc: 'G',  clef: 'bass', minGrade: 1, ledger: null },
    { tone: 'A3', letter: 'A', abc: 'A',  clef: 'bass', minGrade: 1, ledger: null },
    // Grade 2: extend range
    { tone: 'F2', letter: 'F', abc: 'F,', clef: 'bass', minGrade: 2, ledger: null },
    { tone: 'E2', letter: 'E', abc: 'E,', clef: 'bass', minGrade: 2, ledger: null },
    { tone: 'B3', letter: 'B', abc: 'B',  clef: 'bass', minGrade: 2, ledger: null },
    { tone: 'C4', letter: 'C', abc: 'c',  clef: 'bass', minGrade: 2, ledger: 'above' }, // middle C
    { tone: 'D4', letter: 'D', abc: 'd',  clef: 'bass', minGrade: 2, ledger: 'above' },
    // Grade 3: ledger lines
    { tone: 'D2', letter: 'D', abc: 'D,', clef: 'bass', minGrade: 3, ledger: 'below' },
    { tone: 'C2', letter: 'C', abc: 'C,', clef: 'bass', minGrade: 3, ledger: 'below' },
    { tone: 'E4', letter: 'E', abc: 'e',  clef: 'bass', minGrade: 3, ledger: 'above' },
  ],
};

export function getNoteNames(clef, grade) {
  return NOTE_NAMES[clef].filter((n) => n.minGrade <= grade);
}

/* ────────────────────────────────────────────────────────────
   SCALES — ported verbatim from game.js SYLLABUS.scales (no divergent
   copy exists elsewhere; scale-builder.html already reads SYLLABUS
   directly). Cumulative per grade, as in the original.
   ──────────────────────────────────────────────────────────── */
export const SCALES = {
  1: [
    { name: 'C major',          key: 'C',  type: 'major',          notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
    { name: 'G major',          key: 'G',  type: 'major',          notes: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'] },
    { name: 'F major',          key: 'F',  type: 'major',          notes: ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'] },
    { name: 'A harmonic minor', key: 'Am', type: 'minor-harmonic', notes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4'] },
    { name: 'D harmonic minor', key: 'Dm', type: 'minor-harmonic', notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C#5', 'D5'] },
    { name: 'E harmonic minor', key: 'Em', type: 'minor-harmonic', notes: ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D#5', 'E5'] },
  ],
  2: [
    { name: 'C major',          key: 'C',  type: 'major',          notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
    { name: 'G major',          key: 'G',  type: 'major',          notes: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'] },
    { name: 'F major',          key: 'F',  type: 'major',          notes: ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'] },
    { name: 'D major',          key: 'D',  type: 'major',          notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'] },
    { name: 'A major',          key: 'A',  type: 'major',          notes: ['A3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G#4', 'A4'] },
    { name: 'Bb major',         key: 'Bb', type: 'major',          notes: ['Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4'] },
    { name: 'Eb major',         key: 'Eb', type: 'major',          notes: ['Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'D5', 'Eb5'] },
    { name: 'A harmonic minor', key: 'Am', type: 'minor-harmonic', notes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4'] },
    { name: 'D harmonic minor', key: 'Dm', type: 'minor-harmonic', notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C#5', 'D5'] },
    { name: 'E harmonic minor', key: 'Em', type: 'minor-harmonic', notes: ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D#5', 'E5'] },
    { name: 'G harmonic minor', key: 'Gm', type: 'minor-harmonic', notes: ['G3', 'A3', 'Bb3', 'C4', 'D4', 'Eb4', 'F#4', 'G4'] },
    { name: 'C harmonic minor', key: 'Cm', type: 'minor-harmonic', notes: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5'] },
  ],
  3: [
    { name: 'C major',          key: 'C',  type: 'major',          notes: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'] },
    { name: 'G major',          key: 'G',  type: 'major',          notes: ['G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F#4', 'G4'] },
    { name: 'F major',          key: 'F',  type: 'major',          notes: ['F3', 'G3', 'A3', 'Bb3', 'C4', 'D4', 'E4', 'F4'] },
    { name: 'D major',          key: 'D',  type: 'major',          notes: ['D4', 'E4', 'F#4', 'G4', 'A4', 'B4', 'C#5', 'D5'] },
    { name: 'A major',          key: 'A',  type: 'major',          notes: ['A3', 'B3', 'C#4', 'D4', 'E4', 'F#4', 'G#4', 'A4'] },
    { name: 'Bb major',         key: 'Bb', type: 'major',          notes: ['Bb3', 'C4', 'D4', 'Eb4', 'F4', 'G4', 'A4', 'Bb4'] },
    { name: 'Eb major',         key: 'Eb', type: 'major',          notes: ['Eb4', 'F4', 'G4', 'Ab4', 'Bb4', 'C5', 'D5', 'Eb5'] },
    { name: 'E major',          key: 'E',  type: 'major',          notes: ['E4', 'F#4', 'G#4', 'A4', 'B4', 'C#5', 'D#5', 'E5'] },
    { name: 'Ab major',         key: 'Ab', type: 'major',          notes: ['Ab3', 'Bb3', 'C4', 'Db4', 'Eb4', 'F4', 'G4', 'Ab4'] },
    { name: 'A harmonic minor', key: 'Am', type: 'minor-harmonic', notes: ['A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G#4', 'A4'] },
    { name: 'D harmonic minor', key: 'Dm', type: 'minor-harmonic', notes: ['D4', 'E4', 'F4', 'G4', 'A4', 'Bb4', 'C#5', 'D5'] },
    { name: 'E harmonic minor', key: 'Em', type: 'minor-harmonic', notes: ['E4', 'F#4', 'G4', 'A4', 'B4', 'C5', 'D#5', 'E5'] },
    { name: 'G harmonic minor', key: 'Gm', type: 'minor-harmonic', notes: ['G3', 'A3', 'Bb3', 'C4', 'D4', 'Eb4', 'F#4', 'G4'] },
    { name: 'C harmonic minor', key: 'Cm', type: 'minor-harmonic', notes: ['C4', 'D4', 'Eb4', 'F4', 'G4', 'Ab4', 'B4', 'C5'] },
  ],
};

export function getScales(grade) {
  return SCALES[Math.min(grade, 3)] || SCALES[3];
}

/* ────────────────────────────────────────────────────────────
   KEY SIGNATURES — ported verbatim from SYLLABUS.keySignatures. No
   divergent copy found (key-signatures.html reads SYLLABUS directly);
   its distractor-pool bug (a Grade 1 student can be offered Grade-3-only
   relative minors as wrong answers) is a Phase 2 item-generator concern,
   not a data problem — the data itself is correct.
   ──────────────────────────────────────────────────────────── */
export const KEY_SIGNATURES = {
  1: [
    { key: 'C major', relativeMinor: 'A minor', sharps: 0, flats: 0, accidentals: [] },
    { key: 'G major', relativeMinor: 'E minor', sharps: 1, flats: 0, accidentals: ['F#'] },
    { key: 'F major', relativeMinor: 'D minor', sharps: 0, flats: 1, accidentals: ['Bb'] },
  ],
  2: [
    { key: 'C major', relativeMinor: 'A minor', sharps: 0, flats: 0, accidentals: [] },
    { key: 'G major', relativeMinor: 'E minor', sharps: 1, flats: 0, accidentals: ['F#'] },
    { key: 'F major', relativeMinor: 'D minor', sharps: 0, flats: 1, accidentals: ['Bb'] },
    { key: 'D major', relativeMinor: 'B minor', sharps: 2, flats: 0, accidentals: ['F#', 'C#'] },
    { key: 'A major', relativeMinor: 'F# minor', sharps: 3, flats: 0, accidentals: ['F#', 'C#', 'G#'] },
    { key: 'Bb major', relativeMinor: 'G minor', sharps: 0, flats: 2, accidentals: ['Bb', 'Eb'] },
    { key: 'Eb major', relativeMinor: 'C minor', sharps: 0, flats: 3, accidentals: ['Bb', 'Eb', 'Ab'] },
  ],
  3: [
    { key: 'C major', relativeMinor: 'A minor', sharps: 0, flats: 0, accidentals: [] },
    { key: 'G major', relativeMinor: 'E minor', sharps: 1, flats: 0, accidentals: ['F#'] },
    { key: 'F major', relativeMinor: 'D minor', sharps: 0, flats: 1, accidentals: ['Bb'] },
    { key: 'D major', relativeMinor: 'B minor', sharps: 2, flats: 0, accidentals: ['F#', 'C#'] },
    { key: 'A major', relativeMinor: 'F# minor', sharps: 3, flats: 0, accidentals: ['F#', 'C#', 'G#'] },
    { key: 'Bb major', relativeMinor: 'G minor', sharps: 0, flats: 2, accidentals: ['Bb', 'Eb'] },
    { key: 'Eb major', relativeMinor: 'C minor', sharps: 0, flats: 3, accidentals: ['Bb', 'Eb', 'Ab'] },
    { key: 'E major', relativeMinor: 'C# minor', sharps: 4, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#'] },
    { key: 'B major', relativeMinor: 'G# minor', sharps: 5, flats: 0, accidentals: ['F#', 'C#', 'G#', 'D#', 'A#'] },
    { key: 'Ab major', relativeMinor: 'F minor', sharps: 0, flats: 4, accidentals: ['Bb', 'Eb', 'Ab', 'Db'] },
  ],
};

/* ────────────────────────────────────────────────────────────
   INTERVALS — semitone/name data ported from SYLLABUS.intervals, which
   already agreed with interval-quiz.html and aural-training.html (all
   three had identical name/semitone tables).

   RESOLVED CONFLICT — interval roots: three DIFFERENT root-note pools
   existed for the same exercise:
     SYLLABUS.intervalRoots:      1:[C4,G4,F4] (3)         2/3:[C4,D4,E4,F4,G4,A4] (6)
     interval-quiz.html:          matches SYLLABUS exactly
     aural-training.html:         1:[C4,E4,G4,F4] (4)      2:[C4,D4,E4,F4,G4,A4,B4] (7)
   aural-training's pool includes E4 as a Grade-1 root and B4 as a Grade-2
   root; neither is justified by the taught curriculum (E major isn't
   introduced until Grade 3; B is not a diatonic root of any Grade 1–2 key
   signature taught here). SYLLABUS/interval-quiz's narrower pool is kept
   as canonical — it stays inside the keys actually taught at each grade.
   aural-training.html is the one with the bug, not this file.
   ──────────────────────────────────────────────────────────── */
export const INTERVALS = {
  1: [
    { id: 'P1', name: 'Perfect Unison', shortName: '1st (Unison)', semitones: 0, song: 'Same note' },
    { id: 'M2', name: 'Major 2nd', shortName: '2nd', semitones: 2, song: 'Happy Birthday' },
    { id: 'M3', name: 'Major 3rd', shortName: '3rd', semitones: 4, song: 'When the Saints' },
    { id: 'P4', name: 'Perfect 4th', shortName: '4th', semitones: 5, song: 'Here Comes the Bride' },
    { id: 'P5', name: 'Perfect 5th', shortName: '5th', semitones: 7, song: 'Star Wars Theme' },
    { id: 'P8', name: 'Perfect Octave', shortName: 'Octave', semitones: 12, song: 'Somewhere Over the Rainbow' },
  ],
  2: [
    { id: 'P1', name: 'Perfect Unison', shortName: 'P1', semitones: 0, song: 'Same note' },
    { id: 'M2', name: 'Major 2nd', shortName: 'M2', semitones: 2, song: 'Happy Birthday' },
    { id: 'm3', name: 'Minor 3rd', shortName: 'm3', semitones: 3, song: 'Greensleeves' },
    { id: 'M3', name: 'Major 3rd', shortName: 'M3', semitones: 4, song: 'When the Saints' },
    { id: 'P4', name: 'Perfect 4th', shortName: 'P4', semitones: 5, song: 'Here Comes the Bride' },
    { id: 'd5', name: 'Diminished 5th', shortName: 'd5', semitones: 6, song: 'The Simpsons Theme' },
    { id: 'P5', name: 'Perfect 5th', shortName: 'P5', semitones: 7, song: 'Star Wars Theme' },
    { id: 'm6', name: 'Minor 6th', shortName: 'm6', semitones: 8, song: 'The Entertainer' },
    { id: 'M6', name: 'Major 6th', shortName: 'M6', semitones: 9, song: 'My Bonnie' },
    { id: 'm7', name: 'Minor 7th', shortName: 'm7', semitones: 10, song: 'Somewhere (West Side Story)' },
    { id: 'M7', name: 'Major 7th', shortName: 'M7', semitones: 11, song: 'Take On Me' },
    { id: 'P8', name: 'Perfect Octave', shortName: 'P8', semitones: 12, song: 'Somewhere Over the Rainbow' },
  ],
};

export const INTERVAL_ROOTS = {
  1: ['C4', 'G4', 'F4'],
  2: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
  3: ['C4', 'D4', 'E4', 'F4', 'G4', 'A4'],
};

export function getIntervals(grade) {
  return INTERVALS[grade <= 1 ? 1 : 2];
}

/* ────────────────────────────────────────────────────────────
   CHORDS & CADENCES

   Triads: ported from SYLLABUS.chords[grade].triads, converted to a flat
   list with minGrade (no divergence in the actual note data vs
   chord-game.html's CHORDS — both agree on every {key, quality, inv}
   triple's notes).

   Cadences — RESOLVED CONFLICTS, three of them:

   1. Coverage: chord-game.html's CADENCES (12 entries: Perfect/Plagal in
      C, G, F + Imperfect/Interrupted in C, G) is a strict superset of
      SYLLABUS.chords[3].cadences (8 entries: Perfect/Plagal in C, G, F +
      Imperfect/Interrupted in C ONLY). Kept the fuller chord-game.html
      coverage.

   2. Duplicate-draw-rate bug: chord-game.html carried BOTH `perf-C1`
      (grade:1) and `perf-C` (grade:2) as separate entries with identical
      chords/desc, so its own pool filter `c.grade <= getGrade()` matched
      both from Grade 2 onward — the C-major perfect cadence was drawn at
      roughly twice the rate of the G/F ones. Same for `plag-C1`/`plag-C`.
      Fixed here by using ONE entry per (type, key) with a single
      minGrade, matching how every other cadence in the list already
      worked.

   3. Octave-voicing conflict, F major Plagal (IV→I): SYLLABUS used
      chords:[[Bb3,D4,F4],[F4,A4,C5]] (IV chord sits just below the I
      chord — smooth voice leading). chord-game.html used
      [[Bb4,D5,F5],[F4,A4,C5]] (IV chord sits mostly ABOVE the I chord —
      an awkward, un-cadence-like leap). Kept SYLLABUS's octave-3 voicing;
      it is the musically sensible one and consistent with how every
      other cadence in both sources is voiced (upper structure resolving
      down or staying close to the tonic chord, not leaping up first).

   4. Malformed ABC, G major Interrupted (V→vi): chord-game.html's data
      claimed chords:[[D4,F#4,A4],[E4,G4,B4]] (correct: V is D major, vi
      is E minor — textbook AMEB theory) but its hand-authored ABC string
      was `[d^fa]2 [eBG']2` — decoding the second chord: e=E4, B=B3
      (uppercase = octave 3, NOT the octave-4 E/G it should match), G'=G5
      (prime = +1 octave). That renders/sounds as E4+B3+G5, not the close
      E-minor triad the note data says. This is exactly why ABC strings
      are NOT hand-carried in this file at all — cadence/chord ABC will
      be generated programmatically from the `chords` note arrays by
      Phase 2's engine/notation.js, which makes this class of bug
      structurally impossible (the ABC can never disagree with the notes
      it's meant to represent, because it's derived from them).
   ──────────────────────────────────────────────────────────── */
export const TRIADS = [
  { name: 'C major', notes: ['C4', 'E4', 'G4'], type: 'major', inversion: 'root', key: 'C', minGrade: 1 },
  { name: 'G major', notes: ['G4', 'B4', 'D5'], type: 'major', inversion: 'root', key: 'G', minGrade: 1 },
  { name: 'F major', notes: ['F4', 'A4', 'C5'], type: 'major', inversion: 'root', key: 'F', minGrade: 1 },
  { name: 'D major', notes: ['D4', 'F#4', 'A4'], type: 'major', inversion: 'root', key: 'D', minGrade: 2 },
  { name: 'A major', notes: ['A4', 'C#5', 'E5'], type: 'major', inversion: 'root', key: 'A', minGrade: 2 },
  { name: 'A minor', notes: ['A4', 'C5', 'E5'], type: 'minor', inversion: 'root', key: 'Am', minGrade: 2 },
  { name: 'D minor', notes: ['D4', 'F4', 'A4'], type: 'minor', inversion: 'root', key: 'Dm', minGrade: 2 },
  { name: 'E minor', notes: ['E4', 'G4', 'B4'], type: 'minor', inversion: 'root', key: 'Em', minGrade: 2 },
  { name: 'C major (1st inv.)', notes: ['E4', 'G4', 'C5'], type: 'major', inversion: 'first', key: 'C', minGrade: 3 },
  { name: 'G major (1st inv.)', notes: ['B4', 'D5', 'G5'], type: 'major', inversion: 'first', key: 'G', minGrade: 3 },
  { name: 'F major (1st inv.)', notes: ['A4', 'C5', 'F5'], type: 'major', inversion: 'first', key: 'F', minGrade: 3 },
  { name: 'A minor (1st inv.)', notes: ['C5', 'E5', 'A5'], type: 'minor', inversion: 'first', key: 'Am', minGrade: 3 },
  { name: 'D minor (1st inv.)', notes: ['F4', 'A4', 'D5'], type: 'minor', inversion: 'first', key: 'Dm', minGrade: 3 },
  { name: 'E minor (1st inv.)', notes: ['G4', 'B4', 'E5'], type: 'minor', inversion: 'first', key: 'Em', minGrade: 3 },
];

export const CADENCES = [
  { name: 'Perfect Cadence (V–I)', type: 'perfect', key: 'C', minGrade: 1, label: 'in C major',
    chords: [['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']] },
  { name: 'Plagal Cadence (IV–I)', type: 'plagal', key: 'C', minGrade: 1, label: 'in C major',
    chords: [['F4', 'A4', 'C5'], ['C4', 'E4', 'G4']] },
  { name: 'Perfect Cadence (V–I)', type: 'perfect', key: 'G', minGrade: 2, label: 'in G major',
    chords: [['D4', 'F#4', 'A4'], ['G4', 'B4', 'D5']] },
  { name: 'Plagal Cadence (IV–I)', type: 'plagal', key: 'G', minGrade: 2, label: 'in G major',
    chords: [['C4', 'E4', 'G4'], ['G4', 'B4', 'D5']] },
  { name: 'Perfect Cadence (V–I)', type: 'perfect', key: 'F', minGrade: 2, label: 'in F major',
    chords: [['C4', 'E4', 'G4'], ['F4', 'A4', 'C5']] },
  { name: 'Plagal Cadence (IV–I)', type: 'plagal', key: 'F', minGrade: 2, label: 'in F major',
    chords: [['Bb3', 'D4', 'F4'], ['F4', 'A4', 'C5']] },
  { name: 'Imperfect Cadence (I–V)', type: 'imperfect', key: 'C', minGrade: 3, label: 'in C major',
    chords: [['C4', 'E4', 'G4'], ['G4', 'B4', 'D5']] },
  { name: 'Imperfect Cadence (I–V)', type: 'imperfect', key: 'G', minGrade: 3, label: 'in G major',
    chords: [['G4', 'B4', 'D5'], ['D4', 'F#4', 'A4']] },
  { name: 'Interrupted Cadence (V–VI)', type: 'interrupted', key: 'C', minGrade: 3, label: 'in C major',
    chords: [['G4', 'B4', 'D5'], ['A4', 'C5', 'E5']] },
  { name: 'Interrupted Cadence (V–VI)', type: 'interrupted', key: 'G', minGrade: 3, label: 'in G major',
    chords: [['D4', 'F#4', 'A4'], ['E4', 'G4', 'B4']] },
];

export function getTriads(grade) {
  return TRIADS.filter((t) => t.minGrade <= grade);
}
export function getCadences(grade) {
  return CADENCES.filter((c) => c.minGrade <= grade);
}

/* ────────────────────────────────────────────────────────────
   TERMS — ported verbatim from SYLLABUS.terms (68 total; introduced-per-
   grade, not cumulative — use getAllTermsForGrade). No divergent copy
   exists; terms-flashcards.html already reads SYLLABUS directly.
   ──────────────────────────────────────────────────────────── */
export const TERMS = {
  1: [
    { id: 'adagio', term: 'Adagio', meaning: 'Slow', category: 'tempo' },
    { id: 'andante', term: 'Andante', meaning: 'Walking pace (moderately slow)', category: 'tempo' },
    { id: 'moderato', term: 'Moderato', meaning: 'At a moderate speed', category: 'tempo' },
    { id: 'allegro', term: 'Allegro', meaning: 'Fast and lively', category: 'tempo' },
    { id: 'presto', term: 'Presto', meaning: 'Very fast', category: 'tempo' },
    { id: 'accelerando', term: 'Accelerando (accel.)', meaning: 'Gradually getting faster', category: 'tempo' },
    { id: 'rallentando', term: 'Rallentando (rall.)', meaning: 'Gradually getting slower', category: 'tempo' },
    { id: 'ritardando', term: 'Ritardando (rit.)', meaning: 'Gradually getting slower', category: 'tempo' },
    { id: 'ritenuto', term: 'Ritenuto (riten.)', meaning: 'Held back; immediately slower', category: 'tempo' },
    { id: 'atempo', term: 'A tempo', meaning: 'Return to the original speed', category: 'tempo' },
    { id: 'forte', term: 'Forte (f)', meaning: 'Loud', category: 'dynamic' },
    { id: 'piano', term: 'Piano (p)', meaning: 'Soft / quiet', category: 'dynamic' },
    { id: 'crescendo', term: 'Crescendo (cresc.)', meaning: 'Gradually getting louder', category: 'dynamic' },
    { id: 'decrescendo', term: 'Decrescendo (decresc.)', meaning: 'Gradually getting softer', category: 'dynamic' },
    { id: 'diminuendo', term: 'Diminuendo (dim.)', meaning: 'Gradually getting softer', category: 'dynamic' },
    { id: 'legato', term: 'Legato', meaning: 'Smooth and connected', category: 'articulation' },
    { id: 'staccato', term: 'Staccato', meaning: 'Short and detached', category: 'articulation' },
  ],
  2: [
    { id: 'lento', term: 'Lento', meaning: 'Slow', category: 'tempo' },
    { id: 'largo', term: 'Largo', meaning: 'Broad and very slow', category: 'tempo' },
    { id: 'allegretto', term: 'Allegretto', meaning: 'Fairly fast (slightly slower than Allegro)', category: 'tempo' },
    { id: 'vivace', term: 'Vivace', meaning: 'Lively and fast', category: 'tempo' },
    { id: 'vivo', term: 'Vivo', meaning: 'Lively', category: 'tempo' },
    { id: 'allargando', term: 'Allargando (allarg.)', meaning: 'Broadening (slower and louder)', category: 'tempo' },
    { id: 'piumosso', term: 'Più mosso', meaning: 'More movement (faster)', category: 'tempo' },
    { id: 'menomosso', term: 'Meno mosso', meaning: 'Less movement (slower)', category: 'tempo' },
    { id: 'pianissimo', term: 'Pianissimo (pp)', meaning: 'Very soft / very quiet', category: 'dynamic' },
    { id: 'fortissimo', term: 'Fortissimo (ff)', meaning: 'Very loud', category: 'dynamic' },
    { id: 'mezzopiano', term: 'Mezzo piano (mp)', meaning: 'Moderately soft', category: 'dynamic' },
    { id: 'mezzoforte', term: 'Mezzo forte (mf)', meaning: 'Moderately loud', category: 'dynamic' },
    { id: 'maestoso', term: 'Maestoso', meaning: 'Majestic, stately', category: 'expression' },
    { id: 'sostenuto', term: 'Sostenuto', meaning: 'Sustained', category: 'expression' },
    { id: 'sempre', term: 'Sempre', meaning: 'Always', category: 'expression' },
    { id: 'poco', term: 'Poco', meaning: 'A little', category: 'expression' },
    { id: 'molto', term: 'Molto', meaning: 'Much, very', category: 'expression' },
    { id: 'senza', term: 'Senza', meaning: 'Without', category: 'expression' },
    { id: 'cantabile', term: 'Cantabile', meaning: 'In a singing style', category: 'expression' },
    { id: 'leggiero', term: 'Leggiero', meaning: 'Light, nimble', category: 'expression' },
    { id: 'espressivo', term: 'Espressivo (espress.)', meaning: 'With expression', category: 'expression' },
    { id: 'dalsegno', term: 'Dal Segno (D.S.)', meaning: 'Repeat from the sign (𝄋)', category: 'direction' },
    { id: 'dacapo', term: 'Da Capo al Fine (D.C. al Fine)', meaning: 'Repeat from the beginning to Fine', category: 'direction' },
    { id: 'mezzostaccato', term: 'Mezzo staccato (portato)', meaning: 'Half detached; gently pulsed', category: 'articulation' },
  ],
  3: [
    { id: 'largamente', term: 'Largamente', meaning: 'Broadly', category: 'tempo' },
    { id: 'larghetto', term: 'Larghetto', meaning: 'Fairly slow (not as slow as Largo)', category: 'tempo' },
    { id: 'prestissimo', term: 'Prestissimo', meaning: 'As fast as possible', category: 'tempo' },
    { id: 'conmoto', term: 'Con moto', meaning: 'With movement', category: 'tempo' },
    { id: 'calando', term: 'Calando', meaning: 'Getting softer and slower', category: 'tempo' },
    { id: 'morendo', term: 'Morendo', meaning: 'Dying away (slower and softer)', category: 'tempo' },
    { id: 'fortepiano', term: 'Forte-piano (fp)', meaning: 'Loud then immediately soft', category: 'dynamic' },
    { id: 'sforzando', term: 'Sforzando (sfz / sf)', meaning: 'Strongly accented', category: 'dynamic' },
    { id: 'agitato', term: 'Agitato', meaning: 'Agitated', category: 'expression' },
    { id: 'animato', term: 'Animato', meaning: 'Animated, lively', category: 'expression' },
    { id: 'tranquillo', term: 'Tranquillo', meaning: 'Calm, quiet', category: 'expression' },
    { id: 'conanima', term: 'Con anima', meaning: 'With soul / feeling', category: 'expression' },
    { id: 'conbrio', term: 'Con brio', meaning: 'With vigour', category: 'expression' },
    { id: 'congrazia', term: 'Con grazia', meaning: 'With grace', category: 'expression' },
    { id: 'conforza', term: 'Con forza', meaning: 'With force', category: 'expression' },
    { id: 'dolce', term: 'Dolce', meaning: 'Sweetly, softly', category: 'expression' },
    { id: 'risoluto', term: 'Risoluto', meaning: 'Boldly, resolutely', category: 'expression' },
    { id: 'benmarcato', term: 'Ben marcato', meaning: 'Well marked, clearly accented', category: 'expression' },
    { id: 'subito', term: 'Subito (sub.)', meaning: 'Suddenly', category: 'expression' },
    { id: 'attacca', term: 'Attacca', meaning: 'Continue immediately without a break', category: 'direction' },
    { id: 'maindroite', term: 'Main droite (m.d.)', meaning: 'Right hand', category: 'direction' },
    { id: 'maingauche', term: 'Main gauche (m.g.)', meaning: 'Left hand', category: 'direction' },
    { id: 'adlibitum', term: 'Ad libitum (ad lib.)', meaning: "At the performer's discretion", category: 'direction' },
    { id: 'unacorda', term: 'Una corda (u.c.)', meaning: 'Use the soft pedal (left pedal)', category: 'pedal' },
    { id: 'trecorde', term: 'Tre corde (t.c.)', meaning: 'Release the soft pedal', category: 'pedal' },
    { id: 'opus', term: 'Opus (op.)', meaning: 'Work number (e.g. Op. 9)', category: 'notation' },
    { id: 'loco', term: 'Loco', meaning: 'Play at written pitch (after 8va)', category: 'notation' },
  ],
};

export function getAllTermsForGrade(grade) {
  var out = [];
  for (var g = 1; g <= grade; g++) {
    if (TERMS[g]) out = out.concat(TERMS[g]);
  }
  return out;
}

/* ────────────────────────────────────────────────────────────
   TIME SIGNATURES — ported verbatim from SYLLABUS.timeSignatures. This
   data is currently DEAD (SYLLABUS.timeSignatures has zero consumers
   anywhere in the app, and rhythm-trainer.html — despite being tagged in
   game.js's AMEB_PAGE_TAGS as "Identify time signatures and duple/
   triple/compound metre" — contains no identification questions at all,
   only a tap-along accuracy test). Kept and ported so Phase 3's
   curriculum can finally build the time-signature-id item type this data
   was always meant to power.
   ──────────────────────────────────────────────────────────── */
export const TIME_SIGNATURES = {
  1: [
    { sig: '2/4', beats: 2, unit: 'crotchet', feel: 'simple duple' },
    { sig: '3/4', beats: 3, unit: 'crotchet', feel: 'simple triple' },
    { sig: '4/4', beats: 4, unit: 'crotchet', feel: 'simple quadruple' },
  ],
  2: [
    { sig: '2/4', beats: 2, unit: 'crotchet', feel: 'simple duple' },
    { sig: '3/4', beats: 3, unit: 'crotchet', feel: 'simple triple' },
    { sig: '4/4', beats: 4, unit: 'crotchet', feel: 'simple quadruple' },
    { sig: '6/8', beats: 2, unit: 'dotted crotchet', feel: 'compound duple' },
  ],
  3: [
    { sig: '2/4', beats: 2, unit: 'crotchet', feel: 'simple duple' },
    { sig: '3/4', beats: 3, unit: 'crotchet', feel: 'simple triple' },
    { sig: '4/4', beats: 4, unit: 'crotchet', feel: 'simple quadruple' },
    { sig: '2/2', beats: 2, unit: 'minim', feel: 'simple duple (cut time)' },
    { sig: '6/8', beats: 2, unit: 'dotted crotchet', feel: 'compound duple' },
    { sig: '9/8', beats: 3, unit: 'dotted crotchet', feel: 'compound triple' },
  ],
};

/* ────────────────────────────────────────────────────────────
   NOTE VALUES

   RESOLVED CONFLICT: SYLLABUS.noteValues had 8 ungraded entries (notes
   only, no rests). note-values.html's NOTE_DATA had 12 entries — the
   same 8 note values PLUS 4 matching rests, each with a minGrade and a
   human-readable description SYLLABUS's version lacked. Cross-checked
   every beatsIn44 value between the two sources: all 8 agree exactly.
   Kept note-values.html's richer structure as canonical.

   `abc` here follows note-values.html's own convention: L:1/8 duration
   letters (B8 = semibreve, B2 = crotchet, B/2 = semiquaver, z* = rests),
   NOT the toneToAbc()/L:1/4 convention used by NOTE_NAMES and CHORDS
   above. Keeping each domain's own established ABC convention rather
   than forcing one convention to fit both was a deliberate choice — item
   generators pick the L: value for their own rendering.
   ──────────────────────────────────────────────────────────── */
export const NOTE_VALUES = [
  { id: 'semibreve', name: 'Semibreve', abc: 'B8', beatsIn44: 4, fractional: false, isNote: true, minGrade: 1,
    description: 'A whole note — lasts the whole bar in 4/4 time' },
  { id: 'semibreve-rest', name: 'Semibreve rest', abc: 'z8', beatsIn44: 4, fractional: false, isNote: false, minGrade: 1,
    description: 'Whole bar rest — also used for a whole bar in any time sig' },
  { id: 'minim', name: 'Minim', abc: 'B4', beatsIn44: 2, fractional: false, isNote: true, minGrade: 1,
    description: 'A half note — worth 2 crotchet beats' },
  { id: 'minim-rest', name: 'Minim rest', abc: 'z4', beatsIn44: 2, fractional: false, isNote: false, minGrade: 1,
    description: 'Half note rest — worth 2 beats' },
  { id: 'crotchet', name: 'Crotchet', abc: 'B2', beatsIn44: 1, fractional: false, isNote: true, minGrade: 1,
    description: 'A quarter note — the basic beat unit in simple time' },
  { id: 'crotchet-rest', name: 'Crotchet rest', abc: 'z2', beatsIn44: 1, fractional: false, isNote: false, minGrade: 1,
    description: 'Quarter note rest — one beat of silence' },
  { id: 'quaver', name: 'Quaver', abc: 'B', beatsIn44: 0.5, fractional: true, isNote: true, minGrade: 1,
    description: 'An eighth note — worth half a crotchet' },
  { id: 'quaver-rest', name: 'Quaver rest', abc: 'z', beatsIn44: 0.5, fractional: true, isNote: false, minGrade: 1,
    description: 'Eighth rest — half a beat of silence' },
  { id: 'semiquaver', name: 'Semiquaver', abc: 'B/2', beatsIn44: 0.25, fractional: true, isNote: true, minGrade: 1,
    description: 'A sixteenth note — worth a quarter of a crotchet' },
  { id: 'dotted-minim', name: 'Dotted minim', abc: 'B6', beatsIn44: 3, fractional: false, isNote: true, minGrade: 2,
    description: 'Dotted half note — worth 3 beats (2 + 1)' },
  { id: 'dotted-crotchet', name: 'Dotted crotchet', abc: 'B3', beatsIn44: 1.5, fractional: true, isNote: true, minGrade: 2,
    description: 'Dotted quarter note — worth 1½ beats (1 + ½)' },
  { id: 'dotted-quaver', name: 'Dotted quaver', abc: 'B3/2', beatsIn44: 0.75, fractional: true, isNote: true, minGrade: 3,
    description: 'Dotted eighth note — worth ¾ of a beat' },
];

export function getNoteValues(grade, type) {
  return NOTE_VALUES.filter((n) => {
    if (n.minGrade > grade) return false;
    if (type === 'notes') return n.isNote;
    if (type === 'rests') return !n.isNote;
    return true; // type === 'both' or omitted
  });
}
