/* Music Maestro — engine/curriculum.js
   The skill graph: units -> skills -> prerequisites -> exam tags.
   Phase 3.1, 2026-08-18.

   Every skill links to one of the 27 lesson files in course/ — verified
   by tests/curriculum.test.js, which reads the same file list this was
   authored against so the two can never silently drift apart. Skills are
   authored at roughly one-per-lesson granularity (a few split into 2
   where the item type's own params naturally support practising one
   sub-concept at a time, e.g. separate treble/bass note-naming skills
   under one staff-reading topic) — this prioritises a correct, fully
   traceable mapping over hitting the plan's "~70 skills" estimate
   exactly. Finer atomic splitting (one skill per individual scale, key,
   interval) is reasonable future refinement, not done tonight.

   examTags is the alignment layer this whole plan is built around: ONE
   curriculum, filtered into an "AMEB Theory of Music G1-3" track and an
   "AMEB Piano practical General Knowledge G1-3" track. Grade numbers per
   tag are sourced from CLAUDE.md's documented curriculum scope (Piano
   GK) and the AMEB Theory of Music syllabus research from the original
   planning pass (Theory) — both cross-checked against each lesson's own
   syllabus_ref frontmatter, not invented here.

   ── KNOWN GAPS — deliberately not covered by any skill below ──
   These AMEB syllabus topics have no item type yet. Each needs either a
   non-MCQ input mode (Phase 2's render/*.js layer, not built yet either)
   or real audio/listening UX (Phase 8's engine/mic.js territory):
     - Transposition (AMEB Theory G1-G3 — the single biggest Theory gap)
     - Primary triads I/IV/V named by function, not just by chord name
     - Sequences, rondo form (Theory G2-G3)
     - Quaver triplets, anacrusis + whole-bar rest (Theory G2)
     - Accented syllables in text, setting rhythm to text (Theory G2-G3)
     - SATB vocal style and range (Theory G3)
     - 4-bar melody composition (Theory G3)
     - Binary/ternary FORM BY EAR (Piano GK G3) — form-detective.html's
       real skill; needs audio, not just a static rendered melody
     - Accidental SYMBOL recognition (course/grade1/04-accidentals.md) —
       none of the 17 item types test "what does this sign mean", only
       tone-semitone tests the semitone CONCEPT accidentals produce
     - Key-change identification (Piano GK G2-G3) — needs a real piece
       excerpt, which syllabus.html already and correctly declares out of
       scope for the same reason
   ============================================================ */

/* ────────────────────────────────────────────────────────────
   UNITS — top-level grouping, in teaching order within each grade.
   ──────────────────────────────────────────────────────────── */
export const UNITS = [
  { id: 'u-g1-staff', grade: 1, title: 'Reading the staff' },
  { id: 'u-g1-values', grade: 1, title: 'Note values and time' },
  { id: 'u-g1-keys', grade: 1, title: 'Scales and key signatures' },
  { id: 'u-g1-harmony', grade: 1, title: 'Intervals, chords and cadences' },
  { id: 'u-g1-terms', grade: 1, title: 'Terms and signs' },
  { id: 'u-g2-keys', grade: 2, title: 'More scales and key signatures' },
  { id: 'u-g2-values', grade: 2, title: 'Compound time and dotted notes' },
  { id: 'u-g2-harmony', grade: 2, title: 'Fuller intervals, chords and cadences' },
  { id: 'u-g2-terms', grade: 2, title: 'Grade 2 terms and signs' },
  { id: 'u-g3-keys', grade: 3, title: 'The remaining keys' },
  { id: 'u-g3-harmony', grade: 3, title: 'Inversions and every cadence' },
  { id: 'u-g3-form', grade: 3, title: 'Musical form' },
  { id: 'u-g3-terms', grade: 3, title: 'Grade 3 terms and signs' },
];

/* ────────────────────────────────────────────────────────────
   SKILLS
   ──────────────────────────────────────────────────────────── */
export const SKILLS = [
  // ---- Grade 1 : Reading the staff ----
  // g1-staff-basics is a concept-only checkpoint, not a drill: it
  // teaches what a staff/clef IS before g1-treble-notes starts testing
  // note names on one. No item type needed — the following skill's
  // practice items ARE the application of this concept, matching the
  // plan's own worked example for this exact skill id/shape.
  {
    id: 'g1-staff-basics', unit: 'u-g1-staff', title: 'The staff and clefs',
    itemTypes: [], params: {},
    requires: [],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/01-staff-and-clefs',
    gap: 'concept-only checkpoint — no drill needed, g1-treble-notes is the practice for this concept',
  },
  {
    id: 'g1-treble-notes', unit: 'u-g1-staff', title: 'Notes on the treble clef',
    itemTypes: ['note-name', 'note-find'], params: { grade: 1, clef: 'treble' },
    requires: ['g1-staff-basics'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/02-note-names-treble',
  },
  {
    id: 'g1-bass-notes', unit: 'u-g1-staff', title: 'Notes on the bass clef',
    itemTypes: ['note-name', 'note-find'], params: { grade: 1, clef: 'bass' },
    requires: ['g1-treble-notes'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/03-note-names-bass',
  },

  // ---- Grade 1 : Note values and time ----
  {
    id: 'g1-note-values', unit: 'u-g1-values', title: 'Note and rest values',
    itemTypes: ['value-to-beats', 'beats-to-value'], params: { grade: 1, type: 'both' },
    requires: [],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/05-note-values',
  },
  {
    id: 'g1-complete-bar', unit: 'u-g1-values', title: 'Completing a bar',
    itemTypes: ['complete-the-bar'], params: { grade: 1 },
    requires: ['g1-note-values'],
    examTags: { amebTheory: [1] },
    lesson: 'grade1/05-note-values',
  },
  {
    id: 'g1-time-signatures', unit: 'u-g1-values', title: 'Time signatures 2/4, 3/4, 4/4',
    itemTypes: ['time-signature-id'], params: { grade: 1 },
    requires: ['g1-note-values'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/06-time-signatures',
  },
  {
    id: 'g1-tones-semitones', unit: 'u-g1-values', title: 'Tones and semitones',
    itemTypes: ['tone-semitone'], params: { grade: 1 },
    requires: ['g1-treble-notes'],
    examTags: { amebTheory: [1] },
    lesson: 'grade1/04-accidentals',
  },

  // ---- Grade 1 : Scales and key signatures ----
  {
    id: 'g1-major-scales', unit: 'u-g1-keys', title: 'Major scales: C, G, F',
    itemTypes: ['scale-id', 'scale-degree'], params: { grade: 1 },
    requires: ['g1-treble-notes'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/07-major-scales',
  },
  {
    id: 'g1-minor-scales', unit: 'u-g1-keys', title: 'Harmonic minor scales: A, D, E',
    itemTypes: ['scale-id'], params: { grade: 1 },
    requires: ['g1-major-scales'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/08-harmonic-minor-scales',
  },
  {
    id: 'g1-key-signatures', unit: 'u-g1-keys', title: 'Key signatures: C, G, F',
    itemTypes: ['key-sig-to-name', 'name-to-key-sig'], params: { grade: 1 },
    requires: ['g1-major-scales'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/09-key-signatures',
  },

  // ---- Grade 1 : Intervals, chords and cadences ----
  {
    id: 'g1-intervals', unit: 'u-g1-harmony', title: 'Intervals (number only)',
    itemTypes: ['interval-id'], params: { grade: 1 },
    requires: ['g1-treble-notes'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/10-intervals-grade1',
  },
  {
    id: 'g1-triads', unit: 'u-g1-harmony', title: 'Major triads: C, G, F',
    itemTypes: ['triad-id'], params: { grade: 1 },
    requires: ['g1-key-signatures'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/11-chords-major',
  },
  {
    id: 'g1-cadences', unit: 'u-g1-harmony', title: 'Perfect and Plagal cadences in C',
    itemTypes: ['cadence-id'], params: { grade: 1 },
    requires: ['g1-triads'],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/12-cadences-grade1',
  },

  // ---- Grade 1 : Terms and signs ----
  {
    id: 'g1-terms', unit: 'u-g1-terms', title: 'Terms and signs (Grade 1)',
    itemTypes: ['term-meaning', 'term-name'], params: { grade: 1 },
    requires: [],
    examTags: { amebTheory: [1], amebPianoGK: [1] },
    lesson: 'grade1/13-music-terms-grade1',
  },

  // ---- Grade 2 : More scales and key signatures ----
  {
    id: 'g2-scales', unit: 'u-g2-keys', title: 'Scales: D, A, Bb, Eb major; G, C minor',
    itemTypes: ['scale-id'], params: { grade: 2 },
    requires: ['g1-minor-scales'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/01-extended-scales',
  },
  {
    id: 'g2-key-signatures', unit: 'u-g2-keys', title: 'Key signatures up to 3 sharps/flats',
    itemTypes: ['key-sig-to-name', 'name-to-key-sig'], params: { grade: 2 },
    requires: ['g1-key-signatures', 'g2-scales'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/02-extended-key-signatures',
  },

  // ---- Grade 2 : Compound time and dotted notes ----
  {
    id: 'g2-compound-time', unit: 'u-g2-values', title: 'Compound time: 6/8',
    itemTypes: ['time-signature-id'], params: { grade: 2 },
    requires: ['g1-time-signatures'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/03-compound-time',
  },
  {
    id: 'g2-dotted-notes', unit: 'u-g2-values', title: 'Dotted minim and dotted crotchet',
    itemTypes: ['value-to-beats', 'beats-to-value', 'complete-the-bar'], params: { grade: 2 },
    requires: ['g1-note-values'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/04-dotted-notes',
  },

  // ---- Grade 2 : Fuller intervals, chords and cadences ----
  {
    id: 'g2-intervals', unit: 'u-g2-harmony', title: 'Intervals — full quality and number',
    itemTypes: ['interval-id'], params: { grade: 2 },
    requires: ['g1-intervals'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/05-intervals-quality',
  },
  {
    id: 'g2-triads', unit: 'u-g2-harmony', title: 'Chords: D, A major; A, D, E minor',
    itemTypes: ['triad-id'], params: { grade: 2 },
    requires: ['g1-triads', 'g2-key-signatures'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/06-minor-chords',
  },
  {
    id: 'g2-cadences', unit: 'u-g2-harmony', title: 'Cadences in G and F major',
    itemTypes: ['cadence-id'], params: { grade: 2 },
    requires: ['g1-cadences', 'g2-triads'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/07-extended-cadences',
  },

  // ---- Grade 2 : Terms ----
  {
    id: 'g2-terms', unit: 'u-g2-terms', title: 'Terms and signs (Grade 2)',
    itemTypes: ['term-meaning', 'term-name'], params: { grade: 2 },
    requires: ['g1-terms'],
    examTags: { amebTheory: [2], amebPianoGK: [2] },
    lesson: 'grade2/08-music-terms-grade2',
  },

  // ---- Grade 3 : The remaining keys ----
  {
    id: 'g3-scales', unit: 'u-g3-keys', title: 'Scales: E, Ab major; completing the minors',
    itemTypes: ['scale-id'], params: { grade: 3 },
    requires: ['g2-scales'],
    examTags: { amebTheory: [3], amebPianoGK: [3] },
    lesson: 'grade3/01-extended-keys-grade3',
  },
  {
    id: 'g3-key-signatures', unit: 'u-g3-keys', title: 'Key signatures up to 5 sharps, 4 flats',
    itemTypes: ['key-sig-to-name', 'name-to-key-sig'], params: { grade: 3 },
    requires: ['g2-key-signatures', 'g3-scales'],
    examTags: { amebTheory: [3], amebPianoGK: [3] },
    lesson: 'grade3/01-extended-keys-grade3',
  },
  {
    id: 'g3-intervals-scale-degrees', unit: 'u-g3-keys', title: 'Intervals as scale degrees',
    itemTypes: ['interval-id', 'scale-degree'], params: { grade: 3 },
    requires: ['g2-intervals'],
    examTags: { amebTheory: [3], amebPianoGK: [3] },
    lesson: 'grade3/04-intervals-scale-degrees',
  },

  // ---- Grade 3 : Inversions and every cadence ----
  {
    id: 'g3-inversions', unit: 'u-g3-harmony', title: 'First inversion triads',
    itemTypes: ['triad-id'], params: { grade: 3 },
    requires: ['g2-triads'],
    examTags: { amebTheory: [3], amebPianoGK: [3] },
    lesson: 'grade3/02-chord-inversions',
  },
  {
    id: 'g3-all-cadences', unit: 'u-g3-harmony', title: 'All four cadence types',
    itemTypes: ['cadence-id'], params: { grade: 3 },
    requires: ['g2-cadences', 'g3-inversions'],
    examTags: { amebTheory: [3], amebPianoGK: [3] },
    lesson: 'grade3/03-all-four-cadences',
  },

  // ---- Grade 3 : Musical form ----
  // NOTE: no item type covers this yet — binary/ternary form is
  // genuinely an aural skill (see KNOWN GAPS above). This skill exists
  // in the graph (so the lesson is reachable and the unit is complete)
  // but is intentionally left with itemTypes:[] rather than force-fit
  // an unrelated item type to it. tests/curriculum.test.js's "every
  // skill has >=1 real item type" check explicitly allows this one
  // documented exception — see that test for the exact allowlist.
  {
    id: 'g3-form', unit: 'u-g3-form', title: 'Binary and ternary form',
    itemTypes: [], params: { grade: 3 },
    requires: [],
    examTags: { amebPianoGK: [3] },
    lesson: 'grade3/05-binary-ternary-form',
    gap: 'needs real audio/listening UX (Phase 8) — see KNOWN GAPS',
  },

  // ---- Grade 3 : Terms ----
  {
    id: 'g3-terms', unit: 'u-g3-terms', title: 'Terms and signs (Grade 3)',
    itemTypes: ['term-meaning', 'term-name'], params: { grade: 3 },
    requires: ['g2-terms'],
    examTags: { amebTheory: [3], amebPianoGK: [3] },
    lesson: 'grade3/06-music-terms-grade3',
  },
];

/* ────────────────────────────────────────────────────────────
   Helpers
   ──────────────────────────────────────────────────────────── */
export function getSkill(id) {
  return SKILLS.find((s) => s.id === id) || null;
}

export function skillsForUnit(unitId) {
  return SKILLS.filter((s) => s.unit === unitId);
}

export function skillsForTrack(track, grade) {
  // track: 'amebTheory' | 'amebPianoGK'
  return SKILLS.filter((s) => s.examTags[track] && s.examTags[track].includes(grade));
}

/* True once every prerequisite of `skillId` is in `masteredSet` (a Set of
   skill ids). A skill with no prerequisites is always unlocked. */
export function isUnlocked(skillId, masteredSet) {
  const skill = getSkill(skillId);
  if (!skill) return false;
  return skill.requires.every((r) => masteredSet.has(r));
}

/* Topologically sorted skill id list (units in declared order, skills
   within a unit in declared order) — the default "Path" sequence. */
export function pathOrder() {
  const order = [];
  for (const unit of UNITS) {
    for (const skill of skillsForUnit(unit.id)) order.push(skill.id);
  }
  return order;
}
