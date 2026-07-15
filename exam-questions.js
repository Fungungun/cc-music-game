/* ============================================================
   Music Maestro — Shared exam question generators
   Used by mock-exam.html and daily-challenge.html.
   Load AFTER game.js (needs SYLLABUS, toneToAbc) and Tonal.
   ============================================================ */

/* ── Utility ─────────────────────────────────── */
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function shuffle(arr) { return arr.slice().sort(function() { return Math.random() - 0.5; }); }
function pickN(arr, n) { return shuffle(arr).slice(0, n); }
function without(val, arr) { return arr.filter(function(v) { return v !== val; }); }
function choices4(correct, pool, n) {
  n = n || 3;
  var wrongs = pickN(without(correct, pool), n);
  return shuffle([correct].concat(wrongs));
}
function toTonalIv(id) { return id.slice(1) + id[0]; }

/* ── Note name data ───────────────────────────── */
var TREBLE = [
  {note:'C4',abc:'c',   L:'C'}, {note:'D4',abc:'d',   L:'D'},
  {note:'E4',abc:'e',   L:'E'}, {note:'F4',abc:'f',   L:'F'},
  {note:'G4',abc:'g',   L:'G'}, {note:'A4',abc:'a',   L:'A'},
  {note:'B4',abc:'b',   L:'B'}, {note:'C5',abc:"c'",  L:'C'},
  {note:'D5',abc:"d'",  L:'D'}, {note:'E5',abc:"e'",  L:'E'},
];
var BASS = [
  {note:'G2',abc:'G,', L:'G'}, {note:'A2',abc:'A,', L:'A'},
  {note:'B2',abc:'B,', L:'B'}, {note:'C3',abc:'C',  L:'C'},
  {note:'D3',abc:'D',  L:'D'}, {note:'E3',abc:'E',  L:'E'},
  {note:'F3',abc:'F',  L:'F'}, {note:'G3',abc:'G',  L:'G'},
  {note:'A3',abc:'A',  L:'A'}, {note:'B3',abc:'B',  L:'B'},
];
var LETTERS = ['A','B','C','D','E','F','G'];

/* ── Question generators ─────────────────────── */

function genNoteNaming() {
  var clef = Math.random() < 0.5 ? 'treble' : 'bass';
  var set  = clef === 'treble' ? TREBLE : BASS;
  var n    = pick(set);
  var key  = clef === 'bass' ? 'K:C clef=bass\n' : 'K:C\n';
  var abc  = 'X:1\nT:\nM:4/4\nL:1/4\n' + key + n.abc + '4|]';
  return {
    chip:'Note Naming',
    text:'What is the name of this note?',
    abcStr:abc,
    answer:n.L,
    choices:choices4(n.L, LETTERS),
    explanation:'The note is <strong>' + n.L + '</strong> — shown in the ' + clef + ' clef.',
    concept:'note-' + n.L,
  };
}

function genKeySig(grade) {
  var pool = SYLLABUS.keySignatures[Math.min(grade, 3)];
  var ks   = pick(pool);
  var sigTxt = ks.sharps > 0 ? ks.sharps + ' sharp' + (ks.sharps > 1 ? 's' : '') :
               ks.flats  > 0 ? ks.flats  + ' flat'  + (ks.flats  > 1 ? 's' : '') :
               'no sharps or flats';
  var allKeys = SYLLABUS.keySignatures[3].map(function(k){ return k.key; });
  return {
    chip:'Key Signatures',
    text:'Which major key has <strong>' + sigTxt + '</strong>?',
    answer:ks.key,
    choices:choices4(ks.key, allKeys),
    explanation:'<strong>' + ks.key + '</strong> has ' + sigTxt + '. Relative minor: ' + ks.relativeMinor + '.',
    concept:'key-' + ks.key,
  };
}

function genKeySigReverse(grade) {
  var pool = SYLLABUS.keySignatures[Math.min(grade, 3)];
  var ks   = pick(pool);
  function sigLabel(k) {
    if (k.sharps > 0) return k.sharps + ' sharp' + (k.sharps > 1 ? 's' : '');
    if (k.flats  > 0) return k.flats  + ' flat'  + (k.flats  > 1 ? 's' : '');
    return 'no sharps or flats';
  }
  var correct  = sigLabel(ks);
  var allSigs  = SYLLABUS.keySignatures[3].map(sigLabel);
  return {
    chip:'Key Signatures',
    text:'How many sharps or flats does <strong>' + ks.key + '</strong> have?',
    answer:correct,
    choices:choices4(correct, allSigs),
    explanation:'<strong>' + ks.key + '</strong> has ' + correct + '.',
    concept:'key-rev-' + ks.key,
  };
}

function genInterval(grade) {
  var ivs  = SYLLABUS.getIntervals(grade);
  var iv   = pick(ivs);
  var root = pick(SYLLABUS.intervalRoots[Math.min(grade, 3)]);
  var upper;
  try {
    upper = Tonal.Note.transpose(root, toTonalIv(iv.id));
    if (!upper || Tonal.Note.get(upper).empty) upper = Tonal.Note.fromMidi(Tonal.Note.midi(root) + iv.semitones);
  } catch(e) {
    upper = Tonal.Note.fromMidi(Tonal.Note.midi(root) + iv.semitones);
  }
  var abc1 = toneToAbc(root);
  var abc2 = toneToAbc(upper);
  var abc  = 'X:1\nT:\nM:4/4\nL:1/4\nK:C\n[' + abc1 + abc2 + ']4|]';
  var label = grade === 1 ? iv.shortName : iv.name;
  var allLabels = ivs.map(function(i){ return grade === 1 ? i.shortName : i.name; });
  return {
    chip:'Intervals',
    text: grade === 1 ? 'Name the interval (number only)' : 'Name this interval',
    abcStr:abc,
    answer:label,
    choices:choices4(label, allLabels),
    explanation:'This is a <strong>' + iv.name + '</strong> (' + iv.semitones + ' semitones). ' + (iv.song ? '🎵 Think: ' + iv.song : ''),
    concept:'interval-' + iv.id,
  };
}

function genNoteValue(grade) {
  var vals = SYLLABUS.noteValues.slice();
  if (grade < 2) vals = vals.filter(function(v){ return v.id.indexOf('dotted') < 0; });
  if (grade < 3) vals = vals.filter(function(v){ return v.id !== 'dotted-quaver'; });
  var nv = pick(vals);
  function label(v) {
    if (v.beatsIn44 === 4)   return '4 beats';
    if (v.beatsIn44 === 3)   return '3 beats';
    if (v.beatsIn44 === 2)   return '2 beats';
    if (v.beatsIn44 === 1.5) return '1½ beats';
    if (v.beatsIn44 === 1)   return '1 beat';
    if (v.beatsIn44 === 0.75)return '¾ beat';
    if (v.beatsIn44 === 0.5) return '½ beat';
    if (v.beatsIn44 === 0.25)return '¼ beat';
    return v.beatsIn44 + ' beats';
  }
  var correct = label(nv);
  var allLabels = vals.map(label);
  return {
    chip:'Note Values',
    text:'How many beats does a <strong>' + nv.name + '</strong> get in 4/4 time?',
    answer:correct,
    choices:choices4(correct, allLabels),
    explanation:'A <strong>' + nv.name + '</strong> gets <strong>' + correct + '</strong> in 4/4 time.',
    concept:'value-' + nv.id,
  };
}

function genTermMeaning(grade) {
  var terms = SYLLABUS.getAllTermsForGrade(grade);
  var t = pick(terms);
  var allMeanings = terms.map(function(x){ return x.meaning; });
  return {
    chip:'Music Terms',
    text:'What does <strong>' + t.term + '</strong> mean?',
    answer:t.meaning,
    choices:choices4(t.meaning, allMeanings),
    explanation:'<strong>' + t.term + '</strong> means: <em>' + t.meaning + '</em>.',
    concept:'term-' + t.id,
  };
}

function genTermReverse(grade) {
  var terms = SYLLABUS.getAllTermsForGrade(grade);
  var t = pick(terms);
  var allTermNames = terms.map(function(x){ return x.term; });
  return {
    chip:'Music Terms',
    text:'Which term means: <em>"' + t.meaning + '"</em>?',
    answer:t.term,
    choices:choices4(t.term, allTermNames),
    explanation:'"' + t.meaning + '" is <strong>' + t.term + '</strong>.',
    concept:'term-rev-' + t.id,
  };
}

function genRelativeMinor(grade) {
  var pool = SYLLABUS.keySignatures[Math.min(grade, 3)];
  var ks   = pick(pool);
  var allMinors = SYLLABUS.keySignatures[3].map(function(k){ return k.relativeMinor; });
  return {
    chip:'Key Signatures',
    text:'What is the relative minor of <strong>' + ks.key + '</strong>?',
    answer:ks.relativeMinor,
    choices:choices4(ks.relativeMinor, allMinors),
    explanation:'The relative minor of <strong>' + ks.key + '</strong> is <strong>' + ks.relativeMinor + '</strong>.',
    concept:'relminor-' + ks.key,
  };
}

function genCadence(grade) {
  var cadences = SYLLABUS.chords[Math.min(grade, 3)].cadences;
  var c = pick(cadences);
  /* Unique cadence names for this grade */
  var seen = {}, allNames = [];
  cadences.forEach(function(cd) { if (!seen[cd.name]) { seen[cd.name]=true; allNames.push(cd.name); } });
  var choices = choices4(c.name, allNames, Math.min(3, allNames.length - 1));
  return {
    chip:'Cadences',
    text:'Listen and identify the cadence type (' + c.label + ')',
    aural:true,
    answer:c.name,
    choices:choices,
    explanation:'This is a <strong>' + c.name + '</strong>.',
    concept:'cadence-' + c.type + '-' + c.key,
    playChords:c.chords,
  };
}

/* ── Question type weights ────────────────────── */
var Q_TYPES = [
  { fn: genNoteNaming,    wt: 4, minGrade: 1 },
  { fn: genKeySig,          wt: 3, minGrade: 1, usesGrade: true },
  { fn: genKeySigReverse,   wt: 2, minGrade: 1, usesGrade: true },
  { fn: genRelativeMinor,   wt: 2, minGrade: 1, usesGrade: true },
  { fn: genInterval,      wt: 4, minGrade: 1, usesGrade: true },
  { fn: genNoteValue,     wt: 3, minGrade: 1, usesGrade: true },
  { fn: genTermMeaning,   wt: 3, minGrade: 1, usesGrade: true },
  { fn: genTermReverse,   wt: 2, minGrade: 1, usesGrade: true },
  { fn: genCadence,       wt: 2, minGrade: 1, usesGrade: true },
];

function buildPool(grade, count) {
  var pool = [];
  var maxAttempts = count * 15;
  var attempts = 0;
  while (pool.length < count && attempts < maxAttempts) {
    attempts++;
    var validTypes = Q_TYPES.filter(function(t){ return grade >= t.minGrade; });
    var total = validTypes.reduce(function(s,t){ return s+t.wt; }, 0);
    var r = Math.random() * total;
    var cum = 0;
    var chosen = validTypes[validTypes.length-1];
    for (var i=0; i<validTypes.length; i++) {
      cum += validTypes[i].wt;
      if (r < cum) { chosen = validTypes[i]; break; }
    }
    try {
      var q = chosen.usesGrade ? chosen.fn(grade) : chosen.fn();
      if (q) pool.push(q);
    } catch(e) { /* skip */ }
  }
  return pool.slice(0, count);
}
