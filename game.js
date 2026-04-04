/* =============================================
   Music Maestro — Shared Utilities (game.js)
   All at global/window scope — no ES modules
   ============================================= */

const APP_VERSION = "v2.1 · 2026-04-04";

document.addEventListener('DOMContentLoaded', function() {
  var footer = document.createElement('div');
  footer.style.cssText = 'text-align:center;font-size:11px;color:#bbb;padding:12px 0 20px;';
  footer.textContent = APP_VERSION;
  document.body.appendChild(footer);

  // Register service worker for PWA offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(){});
  }
});

/* ============ Encouraging Messages ============ */
const CORRECT_MESSAGES = [
  "Amazing work, {name}! 🌟",
  "You're a music star, {name}! 🎵",
  "Brilliant, {name}! Keep going! ✨",
  "That's right, {name}! You're so clever! 🎹",
  "Woohoo {name}! Your music teacher would be proud! 🏆",
  "Correct! {name} is on fire today! 🔥",
  "Yes yes yes! You got it, {name}! 🎉",
  "{name} you're amazing at this! 💫",
  "Perfect, {name}! You're going to ace that exam! 🎓",
  "Superstar {name} strikes again! ⭐"
];

const WRONG_MESSAGES = [
  "Almost, {name}! Give it another try 💪",
  "Not quite, {name} — you've got this! 🌈",
  "Oops! Try again, {name}, I believe in you! 🎵",
  "Nearly there, {name}! Have another go 😊",
  "Don't give up, {name}, you're learning! 🌟"
];

let _correctIdx = 0;
let _wrongIdx = 0;

/* Replace {name} with the stored player name, or strip it gracefully */
function formatMsg(msg) {
  var name = getPlayerName();
  if (name) return msg.replace(/\{name\}/g, name);
  // Remove ", {name}" or "{name} " patterns so messages still read naturally
  return msg.replace(/,\s*\{name\}/g, '').replace(/\{name\}\s*/g, '');
}

function randomCorrect() {
  const msgs = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[getCurrentLang()] && TRANSLATIONS[getCurrentLang()].correct)
    ? TRANSLATIONS[getCurrentLang()].correct : CORRECT_MESSAGES;
  const msg = msgs[_correctIdx % msgs.length];
  _correctIdx++;
  return formatMsg(msg);
}

function randomWrong() {
  const msgs = (typeof TRANSLATIONS !== 'undefined' && TRANSLATIONS[getCurrentLang()] && TRANSLATIONS[getCurrentLang()].wrong)
    ? TRANSLATIONS[getCurrentLang()].wrong : WRONG_MESSAGES;
  const msg = msgs[_wrongIdx % msgs.length];
  _wrongIdx++;
  return formatMsg(msg);
}

/* ============ Sampler ============ */
let sampler = null;
let samplerReady = false;

function hideOverlay(overlay) {
  if (overlay) overlay.style.display = 'none';
}

function initSampler(onReady) {
  const overlay = document.getElementById('loading-overlay');

  let readyCalled = false;
  function finish() {
    if (readyCalled) return;
    readyCalled = true;
    samplerReady = true;
    hideOverlay(overlay);
    if (typeof onReady === 'function') onReady();
  }

  // Create sampler immediately — no tap required.
  // ensureAudio() (called before every triggerAttackRelease) resumes the
  // AudioContext on the first real user gesture (Play button, answer tap etc.).
  if (overlay) {
    overlay.style.display = 'flex';
  }

  try {
    var base = "https://tonejs.github.io/audio/salamander/";
    sampler = new Tone.Sampler({
      urls: {
        "A0":base+"A0.mp3",  "C1":base+"C1.mp3",  "Eb1":base+"Ds1.mp3", "Gb1":base+"Fs1.mp3",
        "A1":base+"A1.mp3",  "C2":base+"C2.mp3",  "Eb2":base+"Ds2.mp3", "Gb2":base+"Fs2.mp3",
        "A2":base+"A2.mp3",  "C3":base+"C3.mp3",  "Eb3":base+"Ds3.mp3", "Gb3":base+"Fs3.mp3",
        "A3":base+"A3.mp3",  "C4":base+"C4.mp3",  "Eb4":base+"Ds4.mp3", "Gb4":base+"Fs4.mp3",
        "A4":base+"A4.mp3",  "C5":base+"C5.mp3",  "Eb5":base+"Ds5.mp3", "Gb5":base+"Fs5.mp3",
        "A5":base+"A5.mp3",  "C6":base+"C6.mp3",  "Eb6":base+"Ds6.mp3", "Gb6":base+"Fs6.mp3",
        "A6":base+"A6.mp3",  "C7":base+"C7.mp3",  "Eb7":base+"Ds7.mp3", "Gb7":base+"Fs7.mp3",
        "A7":base+"A7.mp3",  "C8":base+"C8.mp3"
      },
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

/* ============ Exam Board ============ */
var EXAM_BOARDS = {
  ameb:  { label: 'AMEB',  name: 'AMEB Theory of Music',          region: 'Australia/NZ' },
  abrsm: { label: 'ABRSM', name: 'ABRSM Music Theory',            region: 'UK / International', soon: true },
  rcm:   { label: 'RCM',   name: 'Royal Conservatory of Music',   region: 'Canada/US',          soon: true },
  trinity:{ label: 'Trinity', name: 'Trinity College London',     region: 'UK / International', soon: true }
};

function getExamBoard() {
  return localStorage.getItem('mm-exam-board') || 'ameb';
}
function setExamBoard(b) {
  localStorage.setItem('mm-exam-board', b);
}
function getExamBoardLabel() {
  var b = EXAM_BOARDS[getExamBoard()];
  return b ? b.label : 'AMEB';
}

/* ============ Player Name ============ */
function getPlayerName() {
  return localStorage.getItem('player-name') || '';
}
function setPlayerName(n) {
  localStorage.setItem('player-name', n.trim().slice(0, 20));
}

/* ============ Trial / Access ============ */
var TRIAL_DAYS = 30;

function startTrialIfNeeded() {
  if (!localStorage.getItem('mm-trial-start')) {
    localStorage.setItem('mm-trial-start', String(Date.now()));
  }
}

function getTrialDaysLeft() {
  startTrialIfNeeded();
  var start = parseInt(localStorage.getItem('mm-trial-start'));
  var elapsed = (Date.now() - start) / (1000 * 60 * 60 * 24);
  return Math.max(0, Math.ceil(TRIAL_DAYS - elapsed));
}

function isTrialActive() {
  return getTrialDaysLeft() > 0;
}

function isUnlocked() {
  return localStorage.getItem('mm-unlocked') === 'true';
}

function hasFullAccess() {
  return isUnlocked() || isTrialActive();
}

function showUpgradeModal() {
  var existing = document.getElementById('upgrade-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  var daysLeft = getTrialDaysLeft();
  var msg = daysLeft > 0
    ? 'You have <strong>' + daysLeft + ' days</strong> left in your free trial.'
    : 'Your 30-day free trial has ended.';

  var modal = document.createElement('div');
  modal.id = 'upgrade-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
  modal.innerHTML =
    '<div style="background:white;border-radius:24px;padding:32px 28px;max-width:380px;width:100%;text-align:center;box-shadow:0 12px 40px rgba(0,0,0,0.25);">' +
      '<div style="font-size:3rem;margin-bottom:10px;">🔒</div>' +
      '<h2 style="margin:0 0 8px;color:#333;font-size:1.4rem;">Grade 2 &amp; 3 Content</h2>' +
      '<p style="color:#666;margin-bottom:6px;">' + msg + '</p>' +
      '<p style="color:#888;font-size:0.9rem;margin-bottom:20px;">Full access unlock is coming soon!<br>Enter your email to be notified.</p>' +
      '<input type="email" id="upgrade-email" placeholder="your@email.com" style="width:100%;box-sizing:border-box;border:2px solid #FFB7C5;border-radius:12px;padding:11px 14px;font-size:1rem;margin-bottom:12px;outline:none;" />' +
      '<button onclick="saveUpgradeEmail()" style="background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:13px 24px;font-size:1rem;cursor:pointer;width:100%;margin-bottom:10px;font-weight:600;">Notify me 🎵</button>' +
      '<button onclick="document.getElementById(\'upgrade-modal\').style.display=\'none\'" style="background:none;border:none;color:#aaa;cursor:pointer;font-size:0.9rem;">Continue with Grade 1</button>' +
    '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });
}

function saveUpgradeEmail() {
  var input = document.getElementById('upgrade-email');
  var email = input ? input.value.trim() : '';
  if (!email || !email.includes('@')) {
    if (input) input.style.borderColor = '#FF6B6B';
    return;
  }
  var list = JSON.parse(localStorage.getItem('mm-notify-list') || '[]');
  if (list.indexOf(email) === -1) list.push(email);
  localStorage.setItem('mm-notify-list', JSON.stringify(list));
  var modal = document.getElementById('upgrade-modal');
  if (modal) modal.querySelector('div').innerHTML =
    '<div style="font-size:3rem;margin-bottom:10px;">🎉</div>' +
    '<h2 style="margin:0 0 10px;color:#333;">You\'re on the list!</h2>' +
    '<p style="color:#666;margin-bottom:20px;">We\'ll notify you as soon as full access is available.</p>' +
    '<button onclick="document.getElementById(\'upgrade-modal\').style.display=\'none\'" style="background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:13px 24px;font-size:1rem;cursor:pointer;font-weight:600;">Continue with Grade 1 🎵</button>';
}

/* ============ Grade System ============ */
function getGrade() {
  var g = parseInt(localStorage.getItem('cc-grade') || '1');
  if (g > 1 && !hasFullAccess()) { setGrade(1); return 1; }
  return g;
}
function setGrade(g) {
  localStorage.setItem('cc-grade', String(g));
}
function buildGradeSelector(containerId, onChange) {
  var container = document.getElementById(containerId);
  if (!container) return;
  [1, 2, 3].forEach(function(g) {
    var locked = g > 1 && !hasFullAccess();
    var btn = document.createElement('button');
    btn.className = 'mode-btn' + (g === getGrade() ? ' active' : '') + (locked ? ' locked' : '');
    btn.textContent = (locked ? '🔒 ' : '') + 'Grade ' + g;
    btn.onclick = function() {
      if (locked) { showUpgradeModal(); return; }
      setGrade(g);
      container.querySelectorAll('.mode-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      if (onChange) onChange(g);
    };
    container.appendChild(btn);
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
