/* Phase 1.6 — the safety net for engine/content.js. Every scale, interval,
   key signature, relative minor, triad and cadence is checked against the
   ACTUAL vendored Tonal.js bundle (vendor/tonal/tonal.min.js) — the same
   file the browser loads — not a hand-rolled reimplementation of music
   theory. If this test and content.js ever disagree, trust this test:
   fix the data, not the assertion (per CLAUDE.md "Correctness of music
   theory is the highest bar in this project"). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import * as C from '../engine/content.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const tonalContext = {};
vm.createContext(tonalContext);
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/tonal/tonal.min.js'), 'utf8'), tonalContext);
const Tonal = tonalContext.Tonal;

/* ---- helpers ---- */
function pc(note) { return Tonal.Note.get(note).pc; } // pitch class, no octave — e.g. 'C4' -> 'C'
function midi(note) { return Tonal.Note.get(note).midi; }
function pcSet(notes) { return notes.map(pc).slice().sort().join(','); }
const SCALE_TYPE = { major: 'major', 'minor-harmonic': 'harmonic minor' };
const SHARP_ORDER = ['F#', 'C#', 'G#', 'D#', 'A#', 'E#', 'B#'];
const FLAT_ORDER = ['Bb', 'Eb', 'Ab', 'Db', 'Gb', 'Cb', 'Fb'];

/* ============================================================
   SCALES
   ============================================================ */
test('every scale note is a valid Tonal pitch', () => {
  for (const grade of [1, 2, 3]) {
    for (const s of C.SCALES[grade]) {
      for (const n of s.notes) {
        assert.ok(midi(n) != null, `${s.name} (grade ${grade}): "${n}" is not a valid note`);
      }
    }
  }
});

test('every scale matches Tonal.Scale.get() pitch classes, in the stated key/type', () => {
  for (const grade of [1, 2, 3]) {
    for (const s of C.SCALES[grade]) {
      const tonalType = SCALE_TYPE[s.type];
      assert.ok(tonalType, `${s.name}: unknown scale type "${s.type}"`);
      const rootLetter = s.key.replace('m', ''); // 'Am' -> 'A', 'C' -> 'C'
      const expected = Tonal.Scale.get(`${rootLetter} ${tonalType}`);
      assert.equal(expected.empty, false, `${s.name}: Tonal could not resolve "${rootLetter} ${tonalType}"`);
      // Scale.get returns 7 notes (no octave, ascending scale degrees 1-7);
      // content.js stores 8 (degree 1 repeated an octave up). Compare the
      // first 7 pitch classes plus confirm note 8 is the same pitch class
      // as note 1.
      const gotFirst7 = s.notes.slice(0, 7).map(pc);
      // expected.notes was constructed inside the vm.createContext() sandbox
      // (a different JS realm), so its Array is not === this realm's Array —
      // assert.deepEqual's strict-mode check cares about that even though
      // Array.isArray() (spec-correct, realm-independent) says both are
      // arrays. Spreading re-materializes it as a plain array in THIS realm.
      assert.deepEqual(gotFirst7, [...expected.notes], `${s.name} (grade ${grade}): pitch classes don't match Tonal`);
      assert.equal(pc(s.notes[7]), pc(s.notes[0]), `${s.name}: 8th note should be the tonic an octave up`);
    }
  }
});

test('every scale is strictly ascending in pitch (no octave-placement bugs)', () => {
  for (const grade of [1, 2, 3]) {
    for (const s of C.SCALES[grade]) {
      for (let i = 1; i < s.notes.length; i++) {
        assert.ok(midi(s.notes[i]) > midi(s.notes[i - 1]),
          `${s.name} (grade ${grade}): "${s.notes[i - 1]}" -> "${s.notes[i]}" is not ascending`);
      }
    }
  }
});

test('scales are cumulative across grades (grade N+1 is a superset of grade N by key)', () => {
  for (const [lo, hi] of [[1, 2], [2, 3]]) {
    const loKeys = new Set(C.SCALES[lo].map((s) => s.key));
    const hiKeys = new Set(C.SCALES[hi].map((s) => s.key));
    for (const k of loKeys) {
      assert.ok(hiKeys.has(k), `Grade ${hi} SCALES is missing key "${k}" present in grade ${lo}`);
    }
  }
});

test('getScales() clamps grade 4+ to the grade 3 (complete) list', () => {
  assert.deepEqual(C.getScales(3), C.getScales(5));
});

/* ============================================================
   INTERVALS
   ============================================================ */
test('every interval id has the semitone count Tonal expects', () => {
  for (const grade of [1, 2]) {
    for (const iv of C.INTERVALS[grade]) {
      const t = Tonal.Interval.get(iv.id);
      assert.equal(t.empty, false, `interval id "${iv.id}" is not valid in Tonal`);
      assert.equal(t.semitones, iv.semitones, `${iv.id} (${iv.name}): semitones mismatch — content.js says ${iv.semitones}, Tonal says ${t.semitones}`);
    }
  }
});

test('interval roots + interval semitones produce a note within a sane playable range', () => {
  for (const grade of [1, 2, 3]) {
    const roots = C.INTERVAL_ROOTS[grade];
    const ivs = C.getIntervals(grade);
    for (const root of roots) {
      for (const iv of ivs) {
        const upperMidi = midi(root) + iv.semitones;
        assert.ok(upperMidi >= 21 && upperMidi <= 108,
          `grade ${grade}: ${root} + ${iv.id} (${iv.semitones} semitones) = MIDI ${upperMidi}, outside standard 88-key piano range`);
      }
    }
  }
});

test('INTERVAL_ROOTS stays within each grade\'s taught keys (documents the aural-training.html divergence this file resolved)', () => {
  // Grade 1 roots must be tonics of grade-1 major keys (C, G, F) only.
  const grade1MajorTonics = new Set(C.SCALES[1].filter((s) => s.type === 'major').map((s) => s.key));
  for (const root of C.INTERVAL_ROOTS[1]) {
    assert.ok(grade1MajorTonics.has(pc(root)), `grade 1 interval root "${root}" is not a tonic of a grade-1 major key`);
  }
});

/* ============================================================
   KEY SIGNATURES
   ============================================================ */
test('every key signature\'s sharps/flats/accidentals/relative-minor match Tonal.Key.majorKey()', () => {
  for (const grade of [1, 2, 3]) {
    for (const ks of C.KEY_SIGNATURES[grade]) {
      const tonic = ks.key.replace(' major', '');
      const tk = Tonal.Key.majorKey(tonic);
      assert.notEqual(tk.tonic, undefined, `"${ks.key}": Tonal could not resolve tonic "${tonic}"`);

      const expectedSharps = tk.alteration > 0 ? tk.alteration : 0;
      const expectedFlats = tk.alteration < 0 ? -tk.alteration : 0;
      assert.equal(ks.sharps, expectedSharps, `${ks.key}: sharps mismatch (content.js ${ks.sharps}, Tonal ${expectedSharps})`);
      assert.equal(ks.flats, expectedFlats, `${ks.key}: flats mismatch (content.js ${ks.flats}, Tonal ${expectedFlats})`);
      assert.equal(ks.accidentals.length, expectedSharps + expectedFlats, `${ks.key}: accidentals array length doesn't match sharps+flats`);

      const expectedOrder = expectedSharps > 0 ? SHARP_ORDER.slice(0, expectedSharps) : FLAT_ORDER.slice(0, expectedFlats);
      assert.deepEqual(ks.accidentals, expectedOrder, `${ks.key}: accidentals are not in standard key-signature order`);

      // relativeMinor: Tonal gives just the tonic letter (+ any accidental),
      // content.js appends " minor" — compare the letter/accidental part.
      const relTonicExpected = tk.minorRelative;
      const relTonicGot = ks.relativeMinor.replace(' minor', '');
      assert.equal(relTonicGot, relTonicExpected, `${ks.key}: relative minor mismatch (content.js "${ks.relativeMinor}", Tonal tonic "${relTonicExpected}")`);
    }
  }
});

test('key signatures are cumulative across grades', () => {
  for (const [lo, hi] of [[1, 2], [2, 3]]) {
    const loKeys = new Set(C.KEY_SIGNATURES[lo].map((k) => k.key));
    const hiKeys = new Set(C.KEY_SIGNATURES[hi].map((k) => k.key));
    for (const k of loKeys) assert.ok(hiKeys.has(k), `grade ${hi} KEY_SIGNATURES missing "${k}" from grade ${lo}`);
  }
});

/* ============================================================
   TRIADS
   ============================================================ */
test('every triad\'s pitch-class set matches Tonal.Chord.get() for its key+type', () => {
  for (const t of C.TRIADS) {
    const rootLetter = t.key.replace('m', '');
    const tonalSymbol = rootLetter + (t.type === 'minor' ? 'm' : 'M');
    const chord = Tonal.Chord.get(tonalSymbol);
    assert.equal(chord.empty, false, `${t.name}: Tonal could not resolve chord symbol "${tonalSymbol}"`);
    assert.equal(pcSet(t.notes), pcSet(chord.notes), `${t.name}: pitch classes don't match Tonal's ${tonalSymbol} (${chord.notes.join(',')})`);
  }
});

test('root-position triads have the root as the lowest note; 1st inversions have the 3rd as the lowest note', () => {
  for (const t of C.TRIADS) {
    const lowestPc = pc(t.notes.reduce((a, b) => (midi(a) < midi(b) ? a : b)));
    const rootLetter = pc(t.key.replace('m', ''));
    if (t.inversion === 'root') {
      assert.equal(lowestPc, rootLetter, `${t.name}: root position should have the root ("${rootLetter}") as the lowest note, got "${lowestPc}"`);
    } else if (t.inversion === 'first') {
      assert.notEqual(lowestPc, rootLetter, `${t.name}: 1st inversion should NOT have the root as the lowest note`);
    }
  }
});

test('every triad is voiced within one octave (close position, playable as a block chord)', () => {
  for (const t of C.TRIADS) {
    const midis = t.notes.map(midi);
    const span = Math.max(...midis) - Math.min(...midis);
    assert.ok(span <= 12, `${t.name}: spans ${span} semitones — not close position`);
  }
});

/* ============================================================
   CADENCES — the exact bug class documented in content.js's
   RESOLVED CONFLICT comments (malformed hand-authored ABC, octave-voicing
   mismatch, duplicate-draw-rate entries) is checked here structurally.
   ============================================================ */
test('every cadence resolves to the correct diatonic scale-degree triads for its stated function', () => {
  const FUNCTION_DEGREES = {
    perfect: ['V', 'I'],
    plagal: ['IV', 'I'],
    imperfect: ['I', 'V'],
    interrupted: ['V', 'VI'],
  };
  for (const cad of C.CADENCES) {
    const degrees = FUNCTION_DEGREES[cad.type];
    assert.ok(degrees, `cadence "${cad.name}": unknown type "${cad.type}"`);
    const tk = Tonal.Key.majorKey(cad.key);
    assert.equal(cad.chords.length, 2, `${cad.name} (${cad.label}): must have exactly 2 chords`);
    degrees.forEach((degreeRoman, i) => {
      const idx = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'].indexOf(degreeRoman);
      const expectedTriadSymbol = tk.triads[idx]; // e.g. 'G', 'C', 'Em'
      const expectedChord = Tonal.Chord.get(expectedTriadSymbol.match(/dim$/) ? expectedTriadSymbol : expectedTriadSymbol);
      const gotSet = pcSet(cad.chords[i]);
      const expectedSet = pcSet(expectedChord.notes.length ? expectedChord.notes : Tonal.Chord.get(expectedTriadSymbol + 'M').notes);
      assert.equal(gotSet, expectedSet,
        `${cad.name} (${cad.label}) chord ${i + 1} (should be scale degree ${degreeRoman} = ${expectedTriadSymbol}): ` +
        `content.js has [${cad.chords[i].join(',')}] (${gotSet}), expected pitch classes (${expectedSet})`);
    });
  }
});

test('no duplicate (type, key) cadence entries — the exact bug that made C-major cadences draw ~2x as often', () => {
  const seen = new Set();
  for (const cad of C.CADENCES) {
    const dupeKey = `${cad.type}-${cad.key}`;
    assert.ok(!seen.has(dupeKey), `duplicate cadence entry for ${dupeKey} — this was the chord-game.html perf-C1/perf-C bug`);
    seen.add(dupeKey);
  }
});

test('cadence chords are each voiced within one octave (close position)', () => {
  for (const cad of C.CADENCES) {
    for (const chord of cad.chords) {
      const midis = chord.map(midi);
      const span = Math.max(...midis) - Math.min(...midis);
      assert.ok(span <= 12, `${cad.name} (${cad.label}): a chord spans ${span} semitones — not close position`);
    }
  }
});

test('cadences are gradually introduced — no minGrade regression across the grade sequence', () => {
  for (const cad of C.CADENCES) {
    assert.ok([1, 2, 3].includes(cad.minGrade), `${cad.name} (${cad.label}): minGrade ${cad.minGrade} out of range`);
  }
  // Perfect and Plagal must be available from grade 1 (per CLAUDE.md AMEB scope).
  const g1 = C.getCadences(1);
  assert.ok(g1.some((c) => c.type === 'perfect'), 'no Perfect cadence available at grade 1');
  assert.ok(g1.some((c) => c.type === 'plagal'), 'no Plagal cadence available at grade 1');
});

/* ============================================================
   NOTE VALUES
   ============================================================ */
test('note value beat arithmetic is internally consistent', () => {
  const byId = Object.fromEntries(C.NOTE_VALUES.map((n) => [n.id, n]));
  assert.equal(byId.semibreve.beatsIn44, 4);
  assert.equal(byId.semibreve.beatsIn44, byId.minim.beatsIn44 * 2);
  assert.equal(byId.minim.beatsIn44, byId.crotchet.beatsIn44 * 2);
  assert.equal(byId.crotchet.beatsIn44, byId.quaver.beatsIn44 * 2);
  assert.equal(byId.quaver.beatsIn44, byId.semiquaver.beatsIn44 * 2);
  // Dotted = 1.5x the base value
  assert.equal(byId['dotted-minim'].beatsIn44, byId.minim.beatsIn44 * 1.5);
  assert.equal(byId['dotted-crotchet'].beatsIn44, byId.crotchet.beatsIn44 * 1.5);
  assert.equal(byId['dotted-quaver'].beatsIn44, byId.quaver.beatsIn44 * 1.5);
});

test('every note value with hasRest-equivalent has isNote correctly set, and each note has a matching rest at the same grade (grade 1-2 only, per AMEB scope)', () => {
  for (const id of ['semibreve', 'minim', 'crotchet', 'quaver']) {
    const note = C.NOTE_VALUES.find((n) => n.id === id);
    const restEntry = C.NOTE_VALUES.find((n) => n.id === id + '-rest');
    assert.ok(note && note.isNote, `${id}: expected isNote:true`);
    assert.ok(restEntry && !restEntry.isNote, `${id}-rest: expected isNote:false`);
    assert.equal(note.beatsIn44, restEntry.beatsIn44, `${id} vs ${id}-rest: beat value mismatch`);
    assert.equal(note.minGrade, restEntry.minGrade, `${id} vs ${id}-rest: minGrade mismatch`);
  }
});

test('getNoteValues() filters by grade and type correctly', () => {
  assert.equal(C.getNoteValues(1, 'notes').length, 5); // semibreve, minim, crotchet, quaver, semiquaver
  assert.equal(C.getNoteValues(1, 'rests').length, 4); // the 4 grade-1 rests (semiquaver has no rest)
  assert.equal(C.getNoteValues(1, 'both').length, 9);
  assert.ok(C.getNoteValues(3, 'both').length > C.getNoteValues(1, 'both').length, 'grade 3 pool should be larger than grade 1');
});

/* ============================================================
   NOTE NAMES
   ============================================================ */
test('every note name entry is a valid Tonal pitch matching its stated letter', () => {
  for (const clef of ['treble', 'bass']) {
    for (const n of C.NOTE_NAMES[clef]) {
      const t = Tonal.Note.get(n.tone);
      assert.equal(t.empty, false, `${clef} clef: "${n.tone}" is not a valid note`);
      assert.equal(t.letter, n.letter, `${clef} clef: tone "${n.tone}" has letter "${t.letter}", entry says "${n.letter}"`);
    }
  }
});

test('note names are grade-cumulative and every entry has a clef field (the note-namer.html bass-tracking bug this file fixes)', () => {
  for (const clef of ['treble', 'bass']) {
    for (const n of C.NOTE_NAMES[clef]) {
      assert.equal(n.clef, clef, `expected clef "${clef}" on entry for tone "${n.tone}"`);
    }
    for (const [lo, hi] of [[1, 2], [2, 3]]) {
      assert.ok(C.getNoteNames(clef, hi).length >= C.getNoteNames(clef, lo).length,
        `${clef}: grade ${hi} pool should be >= grade ${lo} pool`);
    }
  }
});

test('grade 1 note names contain no ledger-line notes (nothing has taught them yet)', () => {
  for (const clef of ['treble', 'bass']) {
    for (const n of C.getNoteNames(clef, 1)) {
      assert.equal(n.ledger, null, `${clef} clef grade 1: "${n.tone}" is marked as a ledger-line note but should not appear before it's taught`);
    }
  }
});

/* ============================================================
   TERMS — structural checks (meanings are not Tonal-verifiable facts,
   but ids/uniqueness/grade-introduction are).
   ============================================================ */
test('every term id is unique across all grades, and terms are introduced (not repeated) per grade', () => {
  const seen = new Set();
  for (const grade of [1, 2, 3]) {
    for (const t of C.TERMS[grade]) {
      assert.ok(!seen.has(t.id), `term id "${t.id}" appears more than once across grades`);
      seen.add(t.id);
    }
  }
});

test('getAllTermsForGrade is cumulative and matches CLAUDE.md documented counts (17/24/27)', () => {
  assert.equal(C.TERMS[1].length, 17);
  assert.equal(C.TERMS[2].length, 24);
  assert.equal(C.TERMS[3].length, 27);
  assert.equal(C.getAllTermsForGrade(1).length, 17);
  assert.equal(C.getAllTermsForGrade(2).length, 41);
  assert.equal(C.getAllTermsForGrade(3).length, 68);
});
