/* Phase 2.2 — engine/notation.js. Verifies the ported functions produce
   byte-identical output to the known-correct hand-typed ABC strings they
   replace, and that the new chordAbc()/cadenceAbc() generators correctly
   produce the E-minor triad the G-major Interrupted cadence's hand-typed
   ABC got wrong (see engine/content.js CADENCES RESOLVED CONFLICT #4). */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

// engine/notation.js reads Tonal from globalThis, matching how the browser
// exposes it via a classic <script> tag (window === globalThis there).
const tonalContext = {};
vm.createContext(tonalContext);
vm.runInContext(fs.readFileSync(path.join(root, 'vendor/tonal/tonal.min.js'), 'utf8'), tonalContext);
globalThis.Tonal = tonalContext.Tonal;

const N = await import('../engine/notation.js');

test('toneToAbc matches known-correct conversions for every octave/accidental case game.js relied on', () => {
  assert.equal(N.toneToAbc('C4'), 'c');
  assert.equal(N.toneToAbc('D5'), "d'");
  assert.equal(N.toneToAbc('C6'), "c''");
  assert.equal(N.toneToAbc('C3'), 'C');
  assert.equal(N.toneToAbc('C2'), 'C,');
  assert.equal(N.toneToAbc('F#4'), '^f');
  assert.equal(N.toneToAbc('Bb3'), '_B');
  assert.equal(N.toneToAbc('G#4'), '^g');
});

test('abcSingleNote matches the format every practice module currently hand-builds', () => {
  assert.equal(N.abcSingleNote('c', 'treble'), 'X:1\nT:\nM:4/4\nL:1/4\nK:C\nc4|]');
  assert.equal(N.abcSingleNote('C,', 'bass'), 'X:1\nT:\nM:4/4\nL:1/4\nK:C clef=bass\nC,4|]');
});

test('chordAbc reproduces every root-position triad ABC string exactly as chord-game.html hand-typed it', () => {
  assert.equal(N.chordAbc(['C4', 'E4', 'G4']), '[ceg]4');
  assert.equal(N.chordAbc(['G4', 'B4', 'D5']), "[gbd']4");
  assert.equal(N.chordAbc(['F4', 'A4', 'C5']), "[fac']4");
  assert.equal(N.chordAbc(['D4', 'F#4', 'A4']), '[d^fa]4');
  assert.equal(N.chordAbc(['A4', 'C5', 'E5']), "[ac'e']4");
});

test('cadenceAbc reproduces every correctly-hand-typed cadence string exactly', () => {
  assert.equal(
    N.cadenceAbc([['G4', 'B4', 'D5'], ['C4', 'E4', 'G4']]),
    "X:1\nT:\nM:4/4\nL:1/4\nK:C\n[gbd']2 [ceg]2|]",
  );
  assert.equal(
    N.cadenceAbc([['F4', 'A4', 'C5'], ['C4', 'E4', 'G4']]),
    "X:1\nT:\nM:4/4\nL:1/4\nK:C\n[fac']2 [ceg]2|]",
  );
});

test('cadenceAbc generates the CORRECT G-major Interrupted cadence — the exact case chord-game.html got wrong by hand', () => {
  const got = N.cadenceAbc([['D4', 'F#4', 'A4'], ['E4', 'G4', 'B4']]);
  // The buggy hand-typed original was "[d^fa]2 [eBG']2|]" — [eBG'] decodes
  // to E4+B3+G5, not the close E-minor triad the note data actually says.
  // A derived ABC can never make that mistake: it IS the note data.
  assert.equal(got, 'X:1\nT:\nM:4/4\nL:1/4\nK:C\n[d^fa]2 [egb]2|]');
  assert.notEqual(got.split('\n').pop(), "[d^fa]2 [eBG']2|]", 'must not reproduce the known-buggy string');
});

test('chordAbc respects a custom duration', () => {
  assert.equal(N.chordAbc(['C4', 'E4', 'G4'], { duration: 2 }), '[ceg]2');
});

test('cadenceAbc respects a custom per-chord duration', () => {
  const got = N.cadenceAbc([['C4', 'E4', 'G4'], ['G4', 'B4', 'D5']], { perChordDuration: 4 });
  assert.equal(got, "X:1\nT:\nM:4/4\nL:1/4\nK:C\n[ceg]4 [gbd']4|]");
});
