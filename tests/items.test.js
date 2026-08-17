/* Phase 2.6 — generates 500 seeded items per type (across grades 1-3) and
   checks every invariant the plan requires: the answer is present in
   choices exactly once, all 4 choices are distinct (for choice4 items),
   every ABC string parses cleanly under the real vendored abcjs, every
   note referenced resolves in the real vendored Tonal, no choice4 item's
   prompt text leaks its own answer, and distractors never include the
   correct answer. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { ITEM_TYPES, buildItem } from '../engine/items.js';
import { createRng } from '../engine/rng.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

function loadVendored(relPath) {
  const context = { console };
  vm.createContext(context);
  vm.runInContext(fs.readFileSync(path.join(root, relPath), 'utf8'), context);
  return context;
}
globalThis.Tonal = loadVendored('vendor/tonal/tonal.min.js').Tonal;
const ABCJS = loadVendored('vendor/abcjs/abcjs-basic-min.js').ABCJS;

function abcParsesCleanly(abcStr) {
  const result = ABCJS.parseOnly(abcStr);
  const warnings = result[0] && result[0].warnings;
  return !warnings || warnings.length === 0;
}

const N = 500;
const GRADES = [1, 2, 3];

for (const typeId of Object.keys(ITEM_TYPES)) {
  test(`${typeId}: ${N} seeded items satisfy every item invariant`, () => {
    const rng = createRng(1337 + typeId.length); // distinct-but-deterministic seed per type
    let generated = 0;
    for (let i = 0; i < N; i++) {
      const grade = GRADES[i % 3];
      const item = buildItem(typeId, { grade }, rng);
      if (!item) continue; // a type is allowed to occasionally decline a params combo
      generated++;

      assert.equal(item.type, typeId, `${typeId} #${i}: item.type mismatch`);
      assert.ok(item.answer != null && item.answer !== '', `${typeId} #${i}: missing answer`);
      assert.ok(item.concept, `${typeId} #${i}: missing concept id`);
      assert.ok(item.prompt, `${typeId} #${i}: missing prompt text`);

      if (item.promptAbc) {
        assert.ok(abcParsesCleanly(item.promptAbc),
          `${typeId} #${i}: promptAbc does not parse cleanly:\n${item.promptAbc}`);
      }

      if (item.promptAudio && item.promptAudio.chords) {
        for (const chord of item.promptAudio.chords) {
          for (const note of chord) {
            assert.ok(!globalThis.Tonal.Note.get(note).empty, `${typeId} #${i}: promptAudio note "${note}" is not a valid Tonal note`);
          }
        }
      }

      if (item.inputMode === 'choice4') {
        assert.equal(item.choices.length, 4, `${typeId} #${i}: choice4 item has ${item.choices.length} choices, not 4`);
        const distinctChoices = new Set(item.choices);
        assert.equal(distinctChoices.size, 4, `${typeId} #${i}: choice4 item has duplicate choices: ${item.choices.join(', ')}`);
        const answerCount = item.choices.filter((c) => c === item.answer).length;
        assert.equal(answerCount, 1, `${typeId} #${i}: answer "${item.answer}" appears ${answerCount} times in choices`);
        // Distractors (every choice except the answer) never include the
        // correct answer under a different guise — already implied by
        // answerCount===1 and distinctChoices.size===4, but check the
        // literal invariant the plan calls out explicitly too.
        const distractorChoices = item.choices.filter((c) => c !== item.answer);
        assert.ok(!distractorChoices.includes(item.answer), `${typeId} #${i}: a distractor equals the answer`);
        // The prompt shouldn't hand the child the answer in its own
        // question text. Scoped to choice4 only — choice2 items like
        // tone-semitone necessarily name both possible answers as part
        // of asking the question ("...a tone or a semitone?"), which is
        // not a leak, it's the nature of a binary-choice question.
        assert.ok(!item.prompt.includes(item.answer),
          `${typeId} #${i}: prompt text leaks the answer "${item.answer}": "${item.prompt}"`);
      }

      if (item.inputMode === 'choice2') {
        assert.equal(item.choices.length, 2, `${typeId} #${i}: choice2 item has ${item.choices.length} choices, not 2`);
        assert.ok(item.choices.includes(item.answer), `${typeId} #${i}: answer not among choice2 options`);
      }
    }
    assert.ok(generated >= N * 0.9, `${typeId}: only generated ${generated}/${N} items (too many null results)`);
  });
}

test('every item id is unique across a large mixed-type batch (no collision in the id scheme)', () => {
  const rng = createRng(42);
  const ids = new Set();
  let total = 0;
  for (const typeId of Object.keys(ITEM_TYPES)) {
    for (let i = 0; i < 50; i++) {
      const item = buildItem(typeId, { grade: 1 + (i % 3) }, rng);
      if (!item) continue;
      total++;
      assert.ok(!ids.has(item.id), `duplicate item id: ${item.id}`);
      ids.add(item.id);
    }
  }
  assert.ok(total > 0);
});

test('a seeded rng makes a full session reproducible (same seed -> identical item sequence)', () => {
  const typeId = 'note-name';
  const seqA = [];
  const seqB = [];
  const rngA = createRng(2026);
  const rngB = createRng(2026);
  for (let i = 0; i < 20; i++) seqA.push(buildItem(typeId, { grade: 2 }, rngA).answer);
  for (let i = 0; i < 20; i++) seqB.push(buildItem(typeId, { grade: 2 }, rngB).answer);
  assert.deepEqual(seqA, seqB);
});

test('assembleChoices throws rather than silently shipping fewer than 4 options', async () => {
  const { assembleChoices } = await import('../engine/items/_shared.js');
  assert.throws(() => assembleChoices('X', ['Y', 'Z']), /need 3 distinct distractors/);
});
