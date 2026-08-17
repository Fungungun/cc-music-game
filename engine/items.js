/* Music Maestro — engine/items.js
   Item factory + registry. Phase 2.1, 2026-08-17.

   Ties the 14 item type modules in engine/items/*.js together. Each type
   module owns WHAT the question is (generate) and WHAT plausible wrong
   answers to offer (distractors); this file owns ASSEMBLY (shuffling
   choices, enforcing the 4-option minimum, wiring explain/speak) so that
   logic exists exactly once instead of being reimplemented per type. */
import { assembleChoices } from './items/_shared.js';

import noteName from './items/note-name.js';
import noteFind from './items/note-find.js';
import notePlay from './items/note-play.js';
import toneSemitone from './items/tone-semitone.js';
import scaleDegree from './items/scale-degree.js';
import valueToBeats from './items/value-to-beats.js';
import beatsToValue from './items/beats-to-value.js';
import completeTheBar from './items/complete-the-bar.js';
import timeSignatureId from './items/time-signature-id.js';
import keySigToName from './items/key-sig-to-name.js';
import nameToKeySig from './items/name-to-key-sig.js';
import intervalId from './items/interval-id.js';
import triadId from './items/triad-id.js';
import cadenceId from './items/cadence-id.js';

export const ITEM_TYPES = {
  'note-name': noteName,
  'note-find': noteFind,
  'note-play': notePlay,
  'tone-semitone': toneSemitone,
  'scale-degree': scaleDegree,
  'value-to-beats': valueToBeats,
  'beats-to-value': beatsToValue,
  'complete-the-bar': completeTheBar,
  'time-signature-id': timeSignatureId,
  'key-sig-to-name': keySigToName,
  'name-to-key-sig': nameToKeySig,
  'interval-id': intervalId,
  'triad-id': triadId,
  'cadence-id': cadenceId,
};

const MCQ_MODES = new Set(['choice4']);

/* Builds one fully-assembled Item: calls the type's generate(), then (for
   MCQ items) its distractors() and assembles the final shuffled choices.
   Returns null if generate() returns null (a type can decline to produce
   an item for a given params combination — complete-the-bar does this
   for a params shape with no valid note-value pair, though in practice
   none currently occurs for grades 1-3). Retries once with the same
   params if generate() returns null and `retry` is not explicitly
   disabled, since a null usually means "try a different random draw",
   not "this params shape can never work". */
export function buildItem(typeId, params, rng, retry = true) {
  const type = ITEM_TYPES[typeId];
  if (!type) throw new Error(`buildItem: unknown item type "${typeId}"`);
  const item = type.generate(params || {}, rng);
  if (!item) {
    if (retry) return buildItem(typeId, params, rng, false);
    return null;
  }
  item.id = `${typeId}:${item.concept}:${Math.floor((rng ? rng() : Math.random()) * 1e9)}`;

  if (item.choices) {
    // tone-semitone-style items already fix their own choices (choice2)
    // and don't go through distractor assembly.
    return item;
  }
  if (MCQ_MODES.has(item.inputMode)) {
    const distractors = type.distractors(item, 3, rng);
    item.choices = assembleChoices(item.answer, distractors, rng);
  } else {
    item.choices = null;
  }
  return item;
}

export function explainItem(typeId, item, given) {
  const type = ITEM_TYPES[typeId];
  if (!type) throw new Error(`explainItem: unknown item type "${typeId}"`);
  return type.explain(item, given);
}

export function speakItem(typeId, item) {
  const type = ITEM_TYPES[typeId];
  if (!type) throw new Error(`speakItem: unknown item type "${typeId}"`);
  return type.speak(item);
}
