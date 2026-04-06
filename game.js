/* =============================================
   Music Maestro — Shared Utilities (game.js)
   All at global/window scope — no ES modules
   ============================================= */

const APP_VERSION = "v3.9 · 2026-04-06";

document.addEventListener('DOMContentLoaded', function() {
  var footer = document.createElement('div');
  footer.style.cssText = 'text-align:center;font-size:11px;color:#bbb;padding:12px 0 20px;';
  footer.textContent = APP_VERSION;
  document.body.appendChild(footer);

  // Register service worker for PWA offline support
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(){});

    // Self-heal: if an old broken SW is causing navigation errors,
    // unregister all SWs and reload once to get a clean state.
    navigator.serviceWorker.getRegistrations().then(function(regs) {
      regs.forEach(function(reg) {
        if (reg.active && reg.active.scriptURL && !reg.active.scriptURL.includes('/sw.js')) {
          reg.unregister();
          location.reload();
        }
      });
    }).catch(function(){});
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
  /* Prefer Supabase profile name → localStorage → email username → empty */
  if (typeof mmGetProfile === 'function') {
    var profile = mmGetProfile();
    if (profile && profile.name) return profile.name;
  }
  if (typeof mmGetUser === 'function') {
    var user = mmGetUser();
    if (user && user.email) {
      var stored = localStorage.getItem('player-name');
      if (stored) return stored;
      /* Derive from email if nothing stored */
      return user.email.split('@')[0];
    }
  }
  return localStorage.getItem('player-name') || '';
}
function setPlayerName(n) {
  localStorage.setItem('player-name', n.trim().slice(0, 20));
}

/* ============ Access ============ */
function isUnlocked() {
  return localStorage.getItem('mm-unlocked') === 'true';
}

function hasFullAccess() {
  /* Prefer Supabase profile if available, fall back to localStorage cache */
  if (typeof mmHasFullAccess === 'function') return mmHasFullAccess();
  return isUnlocked();
}

/* ── Stripe ── */
var STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/eVq5kE1Kf6rZ2OH78h1ck04';

/* Gate payment behind sign-in. Call this from any "Unlock" button. */
function gotoPayment() {
  if (typeof mmIsSignedIn === 'function' && mmIsSignedIn()) {
    window.location.href = STRIPE_PAYMENT_LINK;
  } else {
    /* Always require sign-in before payment */
    if (typeof showAuthModal === 'function') {
      showAuthModal({
        allowGuest: false,
        onSuccess: function() { window.location.href = STRIPE_PAYMENT_LINK; }
      });
    }
    /* If auth modal unavailable, do nothing — never redirect to payment unauthenticated */
  }
}

function showUpgradeModal() {
  var existing = document.getElementById('upgrade-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  var modal = document.createElement('div');
  modal.id = 'upgrade-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease;';
  modal.innerHTML =
    '<div style="background:white;border-radius:24px;padding:32px 28px;max-width:380px;width:100%;text-align:center;box-shadow:0 16px 48px rgba(0,0,0,0.25);">' +
      '<div style="font-size:3rem;margin-bottom:10px;">🎹</div>' +
      '<h2 style="margin:0 0 6px;color:#333;font-size:1.45rem;">Unlock Grade 2 &amp; 3</h2>' +
      '<p style="color:#777;font-size:0.92rem;margin:0 0 18px;line-height:1.5;">All modules · All exam content · Yours forever</p>' +
      '<ul style="text-align:left;padding:0 0 0 4px;margin:0 0 20px;list-style:none;font-size:0.9rem;color:#555;">' +
        '<li style="padding:4px 0;">✅ Intervals, cadences &amp; inversions</li>' +
        '<li style="padding:4px 0;">✅ Compound time signatures</li>' +
        '<li style="padding:4px 0;">✅ All 12 practice modules unlocked</li>' +
        '<li style="padding:4px 0;">✅ Full exam practice tests</li>' +
        '<li style="padding:4px 0;">✅ Bilingual English &amp; Chinese</li>' +
      '</ul>' +
      '<button onclick="document.getElementById(\'upgrade-modal\').style.display=\'none\';gotoPayment();" style="display:block;width:100%;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border-radius:16px;padding:16px;font-size:1.1rem;font-weight:800;border:none;cursor:pointer;margin-bottom:8px;box-shadow:0 4px 16px rgba(255,143,171,0.35);">Unlock Full Access — $14.99 AUD 🚀</button>' +
      '<p style="font-size:0.75rem;color:#bbb;margin:0 0 14px;">One-time payment · Secure checkout via Stripe</p>' +
      '<button onclick="document.getElementById(\'upgrade-modal\').style.display=\'none\'" style="background:none;border:none;color:#bbb;cursor:pointer;font-size:0.88rem;text-decoration:underline;">Continue with Grade 1 (free)</button>' +
    '</div>';
  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });
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

/* ============================================================
   CONCEPT MASTERY TRACKING
   Tracks per-concept accuracy across all modules.
   Key format: "module:concept"  e.g. "interval-quiz:P5"
   ============================================================ */
function getMasteryData() {
  try { return JSON.parse(localStorage.getItem('mm-mastery') || '{}'); } catch(e) { return {}; }
}
function saveMasteryData(d) {
  try { localStorage.setItem('mm-mastery', JSON.stringify(d)); } catch(e) {}
}

function trackAnswer(module, concept, isCorrect) {
  /* localStorage — primary, synchronous */
  var d = getMasteryData();
  var key = module + ':' + concept;
  if (!d[key]) d[key] = { correct: 0, wrong: 0, lastSeen: 0 };
  if (isCorrect) d[key].correct++;
  else           d[key].wrong++;
  d[key].lastSeen = Date.now();
  saveMasteryData(d);
  /* Supabase — secondary, fire-and-forget (only if signed in) */
  if (typeof mmSyncProgress === 'function') mmSyncProgress(module, concept, isCorrect);
}

/* Returns [{key, module, concept, accuracy, total}] sorted worst first */
function getWeakConcepts(n) {
  var d = getMasteryData();
  var rows = Object.keys(d).map(function(k) {
    var v = d[k];
    var total = v.correct + v.wrong;
    var parts = k.split(':');
    return { key: k, module: parts[0], concept: parts.slice(1).join(':'),
             accuracy: total > 0 ? v.correct / total : 0, total: total };
  }).filter(function(r) { return r.total >= 3; });
  rows.sort(function(a, b) { return a.accuracy - b.accuracy; });
  return rows.slice(0, n || 5);
}

/* Returns concepts for a specific module, sorted worst first */
function getWeakConceptsForModule(module, n) {
  return getWeakConcepts(100).filter(function(r) { return r.module === module; }).slice(0, n || 5);
}

/* Weighted random pick — weaker concepts appear more often */
function weightedPickConcept(pool) {
  // pool: [{concept, accuracy, ...}] or any array
  // Each item gets weight = 1 + (1 - accuracy) * 3 so weak items are ~4x more likely
  var weights = pool.map(function(p) { return 1 + (1 - (p.accuracy || 0.5)) * 3; });
  var total = weights.reduce(function(a, b) { return a + b; }, 0);
  var r = Math.random() * total;
  var acc = 0;
  for (var i = 0; i < pool.length; i++) {
    acc += weights[i];
    if (r <= acc) return pool[i];
  }
  return pool[pool.length - 1];
}

/* ============================================================
   SESSION SUMMARY MODAL
   Call showSessionSummary({module, correct, total, onContinue})
   after a practice run. Shows accuracy, weak spots, next step.
   ============================================================ */
function showSessionSummary(opts) {
  opts = opts || {};
  var module   = opts.module || '';
  var correct  = opts.correct || 0;
  var total    = opts.total   || 0;
  var onContinue = opts.onContinue;
  var pct = total > 0 ? Math.round(correct / total * 100) : 0;

  var star = pct >= 90 ? '🌟🌟🌟' : pct >= 70 ? '🌟🌟' : '🌟';
  var headline = pct >= 90 ? 'Outstanding session!' :
                 pct >= 70 ? 'Great work!' : 'Keep practising!';
  var sub = pct >= 90 ? 'You\'re really getting it!' :
            pct >= 70 ? 'You\'re making solid progress.' :
            'Every expert was once a beginner.';

  /* Weak concepts for this module */
  var weak = getWeakConceptsForModule(module, 3);
  var weakHtml = '';
  if (weak.length) {
    weakHtml = '<div style="margin:16px 0 8px;text-align:left;">' +
      '<div style="font-size:0.78rem;font-weight:700;color:#aaa;letter-spacing:0.05em;margin-bottom:8px;">NEEDS WORK</div>';
    weak.forEach(function(w) {
      var pctW = Math.round(w.accuracy * 100);
      var barColor = pctW >= 70 ? '#4CAF50' : pctW >= 40 ? '#FFB74D' : '#FF6B6B';
      weakHtml +=
        '<div style="margin-bottom:8px;">' +
          '<div style="display:flex;justify-content:space-between;font-size:0.85rem;color:#555;margin-bottom:3px;">' +
            '<span>' + w.concept + '</span><span>' + pctW + '%</span>' +
          '</div>' +
          '<div style="background:#f0f0f0;border-radius:6px;height:7px;">' +
            '<div style="background:' + barColor + ';width:' + pctW + '%;height:100%;border-radius:6px;transition:width 0.6s;"></div>' +
          '</div>' +
        '</div>';
    });
    weakHtml += '</div>';
  }

  /* Module link map for "what to practice next" */
  var NEXT = {
    'note-namer':      { label: 'Interval Quiz',    href: '/interval-quiz' },
    'interval-quiz':   { label: 'Aural Training',   href: '/aural-training' },
    'aural-training':  { label: 'Chord Game',        href: '/chord-game' },
    'scale-builder':   { label: 'Interval Quiz',    href: '/interval-quiz' },
    'chord-game':      { label: 'Form Detective',   href: '/form-detective' },
    'rhythm-tapper':   { label: 'Barline Quiz',     href: '/barline-quiz' },
    'terms-flashcards':{ label: 'Daily Challenge',  href: '/daily-challenge' },
    'barline-quiz':    { label: 'Rhythm Tapper',    href: '/rhythm-tapper' },
    'form-detective':  { label: 'Mock Test',        href: '/mock-test' },
    'aural-training':  { label: 'Interval Quiz',    href: '/interval-quiz' }
  };
  var next = NEXT[module];
  var nextHtml = next
    ? '<a href="' + next.href + '" style="display:block;margin-top:4px;background:#f5f0ff;color:#7B52C9;border-radius:12px;padding:11px 16px;text-decoration:none;font-weight:700;font-size:0.9rem;">Next up: ' + next.label + ' →</a>'
    : '';

  var existing = document.getElementById('session-summary-modal');
  if (existing) existing.remove();

  var modal = document.createElement('div');
  modal.id = 'session-summary-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;animation:fadeIn 0.2s ease;';
  modal.innerHTML =
    '<div style="background:white;border-radius:24px;padding:28px 24px;max-width:360px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,0.2);">' +
      '<div style="text-align:center;margin-bottom:4px;font-size:2rem;">' + star + '</div>' +
      '<h2 style="text-align:center;margin:0 0 4px;color:#333;font-size:1.4rem;">' + headline + '</h2>' +
      '<p style="text-align:center;color:#888;font-size:0.9rem;margin:0 0 14px;">' + sub + '</p>' +
      '<div style="background:linear-gradient(135deg,#f5f0ff,#fff0f5);border-radius:16px;padding:14px 16px;text-align:center;margin-bottom:12px;">' +
        '<span style="font-size:2rem;font-weight:900;color:#7B52C9;">' + correct + '</span>' +
        '<span style="color:#aaa;font-size:1rem;"> / ' + total + ' correct</span>' +
        '<div style="background:#e8e0ff;border-radius:8px;height:10px;margin-top:10px;">' +
          '<div style="background:linear-gradient(90deg,#9b7ee8,#FF8FAB);width:' + pct + '%;height:100%;border-radius:8px;transition:width 0.8s;"></div>' +
        '</div>' +
      '</div>' +
      weakHtml +
      nextHtml +
      '<button onclick="(function(){var m=document.getElementById(\'session-summary-modal\');if(m)m.remove();' + (onContinue ? 'window._summaryOnContinue&&window._summaryOnContinue();' : '') + '})()" style="display:block;width:100%;margin-top:10px;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:13px;font-size:1rem;cursor:pointer;font-weight:700;">Keep practising 🎵</button>' +
      '<a href="/" style="display:block;text-align:center;margin-top:10px;color:#aaa;font-size:0.85rem;text-decoration:none;">← Back to home</a>' +
    '</div>';

  if (onContinue) window._summaryOnContinue = onContinue;
  document.body.appendChild(modal);
}

/* ============================================================
   SESSION MILESTONE TRACKER
   Attach to a SessionScore to auto-show summary every N questions
   ============================================================ */
function attachMilestoneTracker(sessionScore, everyN) {
  everyN = everyN || 10;
  var lastMilestone = 0;
  var orig_update = sessionScore._update.bind(sessionScore);
  sessionScore._update = function() {
    orig_update();
    if (sessionScore.total > 0 && sessionScore.total % everyN === 0 && sessionScore.total !== lastMilestone) {
      lastMilestone = sessionScore.total;
      showSessionSummary({
        module: sessionScore.module,
        correct: sessionScore.correct,
        total: sessionScore.total
      });
    }
  };
}
