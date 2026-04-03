/* =============================================
   CC's Music Game — Shared Utilities (game.js)
   All at global/window scope — no ES modules
   ============================================= */

/* ============ Encouraging Messages ============ */
const CORRECT_MESSAGES = [
  "Amazing work, CC! 🌟",
  "You're a music star, CC! 🎵",
  "Brilliant, CC! Keep going! ✨",
  "That's right, CC! You're so clever! 🎹",
  "Woohoo CC! Your piano teacher would be proud! 🏆",
  "Correct! CC is on fire today! 🔥",
  "Yes yes yes! You got it CC! 🎉",
  "CC you're amazing at this! 💫",
  "Perfect, CC! You're going to ace your AMEB exam! 🎓",
  "Superstar CC strikes again! ⭐"
];

const WRONG_MESSAGES = [
  "Almost CC! Give it another try 💪",
  "Not quite, CC — you've got this! 🌈",
  "Oops! Try again CC, I believe in you! 🎵",
  "Nearly there CC! Have another go 😊",
  "Don't give up CC, you're learning! 🌟"
];

let _correctIdx = 0;
let _wrongIdx = 0;

function randomCorrect() {
  const msgs = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[getCurrentLang()] && TRANSLATIONS[getCurrentLang()].correct)
    ? TRANSLATIONS[getCurrentLang()].correct : CORRECT_MESSAGES;
  const msg = msgs[_correctIdx % msgs.length];
  _correctIdx++;
  return msg;
}

function randomWrong() {
  const msgs = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[getCurrentLang()] && TRANSLATIONS[getCurrentLang()].wrong)
    ? TRANSLATIONS[getCurrentLang()].wrong : WRONG_MESSAGES;
  const msg = msgs[_wrongIdx % msgs.length];
  _wrongIdx++;
  return msg;
}

/* ============ Sampler ============ */
let sampler = null;
let samplerReady = false;

function hideOverlay(overlay) {
  if (overlay) overlay.style.display = 'none';
}

function initSampler(onReady) {
  const overlay = document.getElementById('loading-overlay');

  // Guard: only call onReady once
  let readyCalled = false;
  function finish() {
    if (readyCalled) return;
    readyCalled = true;
    samplerReady = true;
    hideOverlay(overlay);
    if (typeof onReady === 'function') onReady();
  }

  // Overlay: tap/click to dismiss immediately (user escape hatch)
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.style.cursor = 'pointer';
    // Add tap-to-skip hint
    const hint = document.createElement('p');
    hint.textContent = '(tap here to skip)';
    hint.style.cssText = 'font-size:14px;color:#888;margin-top:8px;';
    overlay.appendChild(hint);
    overlay.addEventListener('click', finish, { once: true });
  }

  try {
    sampler = new Tone.Sampler({
      urls: {
        "A0":"A0.mp3",  "C1":"C1.mp3",  "Eb1":"Ds1.mp3", "Gb1":"Fs1.mp3",
        "A1":"A1.mp3",  "C2":"C2.mp3",  "Eb2":"Ds2.mp3", "Gb2":"Fs2.mp3",
        "A2":"A2.mp3",  "C3":"C3.mp3",  "Eb3":"Ds3.mp3", "Gb3":"Fs3.mp3",
        "A3":"A3.mp3",  "C4":"C4.mp3",  "Eb4":"Ds4.mp3", "Gb4":"Fs4.mp3",
        "A4":"A4.mp3",  "C5":"C5.mp3",  "Eb5":"Ds5.mp3", "Gb5":"Fs5.mp3",
        "A5":"A5.mp3",  "C6":"C6.mp3",  "Eb6":"Ds6.mp3", "Gb6":"Fs6.mp3",
        "A6":"A6.mp3",  "C7":"C7.mp3",  "Eb7":"Ds7.mp3", "Gb7":"Fs7.mp3",
        "A7":"A7.mp3",  "C8":"C8.mp3"
      },
      baseUrl: "https://tonejs.github.io/audio/salamander/",
      onload: finish,
      onerror: finish
    }).toDestination();
  } catch(e) {
    console.error("Sampler creation failed:", e);
    finish();
    return;
  }

  // Hard fallback: unblock after 5 seconds no matter what
  setTimeout(finish, 5000);
}

async function ensureAudio() {
  await Tone.start();
}

async function playNote(note, duration) {
  if (!sampler) return;
  duration = duration || "2n";
  await ensureAudio();
  sampler.triggerAttackRelease(note, duration, Tone.now() + 0.05);
}

async function playChord(notes, duration) {
  if (!sampler) return;
  duration = duration || "2n";
  await ensureAudio();
  const now = Tone.now() + 0.05;
  notes.forEach(function(n) {
    sampler.triggerAttackRelease(n, duration, now);
  });
}

async function playMelodic(notes, duration, bpm) {
  if (!sampler) return;
  duration = duration || "4n";
  bpm = bpm || 120;
  await ensureAudio();
  const delay = 60 / bpm;
  let t = Tone.now() + 0.05;
  notes.forEach(function(n) {
    sampler.triggerAttackRelease(n, duration, t);
    t += delay;
  });
}

async function playScale(notes, bpm) {
  bpm = bpm || 100;
  const ascending = notes.slice();
  const descending = notes.slice().reverse();
  await playMelodic(ascending.concat(descending), "4n", bpm);
}

/* Play an array of [note, durationSeconds] pairs (used in form-detective) */
async function playNotePairs(pairs) {
  if (!sampler) return;
  await ensureAudio();
  let t = Tone.now() + 0.05;
  pairs.forEach(function(pair) {
    const note = pair[0];
    const dur  = pair[1];
    sampler.triggerAttackRelease(note, dur, t);
    t += dur;
  });
}

/* ============ localStorage ============ */
function getModuleData(module) {
  try {
    return JSON.parse(localStorage.getItem('cc-' + module)) || { highScore: 0, streak: 0 };
  } catch(e) {
    return { highScore: 0, streak: 0 };
  }
}

function saveModuleData(module, data) {
  try {
    localStorage.setItem('cc-' + module, JSON.stringify(data));
  } catch(e) {}
}

/* ============ SessionScore ============ */
class SessionScore {
  constructor(module) {
    this.module = module;
    this.correct = 0;
    this.total = 0;
    this.streak = 0;
    this.bestStreak = 0;
  }

  onCorrect() {
    this.correct++;
    this.total++;
    this.streak++;
    this.bestStreak = Math.max(this.bestStreak, this.streak);
    this._update();
  }

  onWrong() {
    this.total++;
    this.streak = 0;
    this._update();
  }

  _update() {
    const el = document.getElementById('score-correct');
    const st = document.getElementById('score-streak');
    if (el) el.textContent = this.correct + '/' + this.total;
    if (st) st.textContent = '🔥 ' + this.streak;
    updateProgressBar(this.correct, this.total || 1);
    const data = getModuleData(this.module);
    if (this.correct > (data.highScore || 0)) data.highScore = this.correct;
    data.streak = this.bestStreak;
    saveModuleData(this.module, data);
  }
}

function updateProgressBar(current, total) {
  const fill = document.getElementById('progress-fill');
  const label = document.getElementById('progress-label');
  if (fill) fill.style.width = (Math.min(current / (total || 1), 1) * 100) + '%';
  if (label) label.textContent = current + ' / ' + total;
}

/* ============ Animations ============ */
function triggerStarburst(anchorEl) {
  const rect = anchorEl.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const emojis = ['⭐','🌟','✨','💫','🎵','🎉','🎹','🎶'];
  for (let i = 0; i < 7; i++) {
    const el = document.createElement('div');
    el.className = 'starburst';
    el.textContent = emojis[i % emojis.length];
    const angle = (i / 7) * Math.PI * 2;
    const dist = 55 + Math.random() * 45;
    el.style.left = (cx + Math.cos(angle) * dist - 20) + 'px';
    el.style.top  = (cy + Math.sin(angle) * dist - 20) + 'px';
    el.style.animationDelay = (i * 0.06) + 's';
    el.style.fontSize = (28 + Math.random() * 16) + 'px';
    document.body.appendChild(el);
    el.addEventListener('animationend', function() { el.remove(); });
  }
}

function addShake(el) {
  el.classList.remove('shake');
  void el.offsetWidth; // reflow
  el.classList.add('shake');
  el.addEventListener('animationend', function() {
    el.classList.remove('shake');
  }, { once: true });
}

/* ============ ABC Notation Helpers ============ */
function toneToAbc(noteName) {
  var note = Tonal.Note.get(noteName);
  if (!note || note.oct === undefined || note.empty) return 'c';
  var letter = note.letter;
  var acc    = note.acc;
  var oct    = note.oct;

  var abcAcc = '';
  if      (acc === '##') abcAcc = '^^';
  else if (acc === '#')  abcAcc = '^';
  else if (acc === 'bb') abcAcc = '__';
  else if (acc === 'b')  abcAcc = '_';

  var abcNote;
  if      (oct >= 5) abcNote = letter.toLowerCase() + "'".repeat(oct - 4);
  else if (oct === 4) abcNote = letter.toLowerCase();
  else if (oct === 3) abcNote = letter.toUpperCase();
  else if (oct === 2) abcNote = letter.toUpperCase() + ',';
  else                abcNote = letter.toUpperCase() + ',,';

  return abcAcc + abcNote;
}

function abcSingleNote(abcNote, clef) {
  clef = clef || 'treble';
  var clefStr = clef === 'bass' ? ' clef=bass' : '';
  return 'X:1\nT:\nM:4/4\nL:1/4\nK:C' + clefStr + '\n' + abcNote + '4|]';
}

function renderAbc(divId, abcStr, extraOpts) {
  var el = document.getElementById(divId);
  if (!el) return;
  extraOpts = extraOpts || {};
  ABCJS.renderAbc(divId, abcStr, Object.assign({
    scale: 2.2,
    staffwidth: 200,
    paddingtop: 15,
    paddingbottom: 10,
    paddingleft: 10,
    paddingright: 10
  }, extraOpts));
}

/* ============ Piano Keyboard ============ */
const CHROMA_X = [0, 0.55, 1, 1.65, 2, 3, 3.6, 4, 4.55, 5, 5.6, 6];
const CHROMA_IS_BLACK = [false,true,false,true,false,false,true,false,true,false,true,false];
const NOTE_NAMES_CHROMA = ['C','Cs','D','Ds','E','F','Fs','G','Gs','A','As','B'];

function buildKeyboard(containerId, options) {
  options = options || {};
  var startMidi   = options.startMidi   !== undefined ? options.startMidi   : 48;
  var endMidi     = options.endMidi     !== undefined ? options.endMidi     : 84;
  var onKeyClick  = options.onKeyClick  || function() {};
  var whiteWidth  = options.whiteWidth  !== undefined ? options.whiteWidth  : 36;
  var blackWidth  = options.blackWidth  !== undefined ? options.blackWidth  : 22;
  var whiteHeight = options.whiteHeight !== undefined ? options.whiteHeight : 120;
  var blackHeight = options.blackHeight !== undefined ? options.blackHeight : 75;

  var container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = '';

  var gap = 2;
  var W = whiteWidth + gap;
  var startOctBase = Math.floor(startMidi / 12);

  var whites = [];
  var blacks = [];

  for (var midi = startMidi; midi <= endMidi; midi++) {
    var chroma  = midi % 12;
    var octave  = Math.floor(midi / 12) - 1;
    var noteSym = NOTE_NAMES_CHROMA[chroma];
    var toneNote = noteSym.replace('s','#') + octave;
    var isBlack  = CHROMA_IS_BLACK[chroma];

    var octN = Math.floor(midi / 12) - startOctBase;
    var x = (CHROMA_X[chroma] + octN * 7) * W - CHROMA_X[startMidi % 12] * W;

    var el = document.createElement('div');
    el.className = 'piano-key ' + (isBlack ? 'black' : 'white');
    el.dataset.note = toneNote;
    el.dataset.midi = midi;
    el.style.cssText = 'position:absolute;left:' + x + 'px;top:0;' +
      'width:' + (isBlack ? blackWidth : whiteWidth) + 'px;' +
      'height:' + (isBlack ? blackHeight : whiteHeight) + 'px;' +
      'z-index:' + (isBlack ? 2 : 1) + ';';

    (function(tn, m, elem) {
      elem.addEventListener('click', function(e) {
        e.stopPropagation();
        onKeyClick(tn, m, elem);
      });
    })(toneNote, midi, el);

    if (isBlack) blacks.push(el);
    else         whites.push(el);
  }

  var wrap = document.createElement('div');
  wrap.className = 'piano-inner';

  var lastMidi   = endMidi;
  var lastOctN   = Math.floor(lastMidi / 12) - startOctBase;
  var lastX      = (CHROMA_X[lastMidi % 12] + lastOctN * 7) * W - CHROMA_X[startMidi % 12] * W;
  var lastIsBlack = CHROMA_IS_BLACK[lastMidi % 12];
  var totalWidth = lastX + (lastIsBlack ? blackWidth : whiteWidth) + 4;

  wrap.style.cssText = 'position:relative;width:' + totalWidth + 'px;height:' + (whiteHeight + 10) + 'px;display:inline-block;';
  whites.forEach(function(el) { wrap.appendChild(el); });
  blacks.forEach(function(el) { wrap.appendChild(el); });
  container.appendChild(wrap);
  return wrap;
}

function highlightPianoKeys(noteNames, className) {
  document.querySelectorAll('.piano-key.' + className).forEach(function(k) {
    k.classList.remove(className);
  });
  noteNames.forEach(function(n) {
    var k = document.querySelector('.piano-key[data-note="' + n + '"]');
    if (k) k.classList.add(className);
  });
}

function clearPianoHighlights() {
  document.querySelectorAll('.piano-key').forEach(function(k) {
    k.classList.remove('active','correct','wrong-key','scale-hint');
  });
}
