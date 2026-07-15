/* =============================================
   CC Music Game — Shared Utilities (game.js)
   All at global/window scope — no ES modules
   ============================================= */

const APP_VERSION = "v6.0 · 2026-07-15";

/* AMEB Section III context per module page */
const AMEB_PAGE_TAGS = {
  'note-namer':       { section: 'Notes on Staff',       desc: 'Identify notes on treble and bass clef — AMEB Section III' },
  'scale-builder':    { section: 'Scales',               desc: 'Major and harmonic minor scale notes — AMEB Section III' },
  'key-signatures':   { section: 'Key Signatures',       desc: 'Match key signatures to major keys and relative minors — AMEB Section III' },
  'note-values':      { section: 'Note Values',          desc: 'State note and rest values in beats — AMEB Section III' },
  'interval-quiz':    { section: 'Intervals',            desc: 'Grade 1: number only · Grade 2–3: full quality and number — AMEB Section III' },
  'chord-game':       { section: 'Chords and Cadences',  desc: 'Identify triads, inversions and cadence types — AMEB Section III' },
  'rhythm-trainer':   { section: 'Time Signatures',      desc: 'Identify time signatures and duple/triple/compound metre — AMEB Section III' },
  'terms-flashcards': { section: 'Music Terms',          desc: 'Italian and French performance directions — AMEB Section III' },
  'aural-training':   { section: 'Aural Tests',          desc: 'Pitch direction and intervals by ear — AMEB Section III' },
  'form-detective':   { section: 'Musical Form',         desc: 'Binary (AB) and Ternary (ABA) form — AMEB Grade 2–3, Section III' },
  'mock-exam':        { section: 'Mock Examination',     desc: '20 questions across all AMEB Piano Section III topics' },
  'course':           { section: 'Theory Lessons',       desc: 'Structured lessons covering all AMEB Piano 2026 Section III topics — Grades 1–3' },
};

document.addEventListener('DOMContentLoaded', function() {
  var footer = document.createElement('div');
  footer.style.cssText = 'text-align:center;font-size:11px;color:#bbb;padding:12px 0 20px;';
  footer.textContent = APP_VERSION;
  document.body.appendChild(footer);

  /* Auto-inject AMEB context tag on module pages */
  var pageKey = (location.pathname.split('/').pop() || 'index.html').replace('.html', '');
  var tagData = AMEB_PAGE_TAGS[pageKey];
  if (tagData) {
    var mainEl = document.querySelector('.main-content');
    if (mainEl) {
      var tagEl = document.createElement('div');
      tagEl.className = 'ameb-page-tag';
      tagEl.innerHTML =
        '<span class="ameb-tag-label">AMEB Piano 2026</span>' +
        '<span class="ameb-tag-sep">·</span>' +
        '<span class="ameb-tag-section">Section III: ' + tagData.section + '</span>' +
        '<span class="ameb-tag-desc">' + tagData.desc + '</span>' +
        '<a href="syllabus.html" class="ameb-tag-link">Full syllabus</a>';
      mainEl.insertBefore(tagEl, mainEl.firstChild);
    }
  }

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(function(){});
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

/* ============================================================
   SYLLABUS DATA — AMEB Piano 2026, Grades 1–3
   Single source of truth for all curriculum content.
   Modules read from this instead of hardcoding.
   ============================================================ */
const SYLLABUS = {

  /* ---- Scales ---- */
  scales: {
    1: [
      { name:'C major',            key:'C',  type:'major',         notes:['C4','D4','E4','F4','G4','A4','B4','C5'] },
      { name:'G major',            key:'G',  type:'major',         notes:['G3','A3','B3','C4','D4','E4','F#4','G4'] },
      { name:'F major',            key:'F',  type:'major',         notes:['F3','G3','A3','Bb3','C4','D4','E4','F4'] },
      { name:'A harmonic minor',   key:'Am', type:'minor-harmonic', notes:['A3','B3','C4','D4','E4','F4','G#4','A4'] },
      { name:'D harmonic minor',   key:'Dm', type:'minor-harmonic', notes:['D4','E4','F4','G4','A4','Bb4','C#5','D5'] },
      { name:'E harmonic minor',   key:'Em', type:'minor-harmonic', notes:['E4','F#4','G4','A4','B4','C5','D#5','E5'] },
    ],
    2: [
      { name:'C major',            key:'C',  type:'major',         notes:['C4','D4','E4','F4','G4','A4','B4','C5'] },
      { name:'G major',            key:'G',  type:'major',         notes:['G3','A3','B3','C4','D4','E4','F#4','G4'] },
      { name:'F major',            key:'F',  type:'major',         notes:['F3','G3','A3','Bb3','C4','D4','E4','F4'] },
      { name:'D major',            key:'D',  type:'major',         notes:['D4','E4','F#4','G4','A4','B4','C#5','D5'] },
      { name:'A major',            key:'A',  type:'major',         notes:['A3','B3','C#4','D4','E4','F#4','G#4','A4'] },
      { name:'Bb major',           key:'Bb', type:'major',         notes:['Bb3','C4','D4','Eb4','F4','G4','A4','Bb4'] },
      { name:'Eb major',           key:'Eb', type:'major',         notes:['Eb4','F4','G4','Ab4','Bb4','C5','D5','Eb5'] },
      { name:'A harmonic minor',   key:'Am', type:'minor-harmonic', notes:['A3','B3','C4','D4','E4','F4','G#4','A4'] },
      { name:'D harmonic minor',   key:'Dm', type:'minor-harmonic', notes:['D4','E4','F4','G4','A4','Bb4','C#5','D5'] },
      { name:'E harmonic minor',   key:'Em', type:'minor-harmonic', notes:['E4','F#4','G4','A4','B4','C5','D#5','E5'] },
      { name:'G harmonic minor',   key:'Gm', type:'minor-harmonic', notes:['G3','A3','Bb3','C4','D4','Eb4','F#4','G4'] },
      { name:'C harmonic minor',   key:'Cm', type:'minor-harmonic', notes:['C4','D4','Eb4','F4','G4','Ab4','B4','C5'] },
    ],
    3: [
      { name:'C major',            key:'C',  type:'major',         notes:['C4','D4','E4','F4','G4','A4','B4','C5'] },
      { name:'G major',            key:'G',  type:'major',         notes:['G3','A3','B3','C4','D4','E4','F#4','G4'] },
      { name:'F major',            key:'F',  type:'major',         notes:['F3','G3','A3','Bb3','C4','D4','E4','F4'] },
      { name:'D major',            key:'D',  type:'major',         notes:['D4','E4','F#4','G4','A4','B4','C#5','D5'] },
      { name:'A major',            key:'A',  type:'major',         notes:['A3','B3','C#4','D4','E4','F#4','G#4','A4'] },
      { name:'Bb major',           key:'Bb', type:'major',         notes:['Bb3','C4','D4','Eb4','F4','G4','A4','Bb4'] },
      { name:'Eb major',           key:'Eb', type:'major',         notes:['Eb4','F4','G4','Ab4','Bb4','C5','D5','Eb5'] },
      { name:'E major',            key:'E',  type:'major',         notes:['E4','F#4','G#4','A4','B4','C#5','D#5','E5'] },
      { name:'Ab major',           key:'Ab', type:'major',         notes:['Ab3','Bb3','C4','Db4','Eb4','F4','G4','Ab4'] },
      { name:'A harmonic minor',   key:'Am', type:'minor-harmonic', notes:['A3','B3','C4','D4','E4','F4','G#4','A4'] },
      { name:'D harmonic minor',   key:'Dm', type:'minor-harmonic', notes:['D4','E4','F4','G4','A4','Bb4','C#5','D5'] },
      { name:'E harmonic minor',   key:'Em', type:'minor-harmonic', notes:['E4','F#4','G4','A4','B4','C5','D#5','E5'] },
      { name:'G harmonic minor',   key:'Gm', type:'minor-harmonic', notes:['G3','A3','Bb3','C4','D4','Eb4','F#4','G4'] },
      { name:'C harmonic minor',   key:'Cm', type:'minor-harmonic', notes:['C4','D4','Eb4','F4','G4','Ab4','B4','C5'] },
    ]
  },

  /* ---- Key Signatures ---- */
  keySignatures: {
    1: [
      { key:'C major', relativeMinor:'A minor', sharps:0, flats:0, accidentals:[] },
      { key:'G major', relativeMinor:'E minor', sharps:1, flats:0, accidentals:['F#'] },
      { key:'F major', relativeMinor:'D minor', sharps:0, flats:1, accidentals:['Bb'] },
    ],
    2: [
      { key:'C major', relativeMinor:'A minor', sharps:0, flats:0, accidentals:[] },
      { key:'G major', relativeMinor:'E minor', sharps:1, flats:0, accidentals:['F#'] },
      { key:'F major', relativeMinor:'D minor', sharps:0, flats:1, accidentals:['Bb'] },
      { key:'D major', relativeMinor:'B minor', sharps:2, flats:0, accidentals:['F#','C#'] },
      { key:'A major', relativeMinor:'F# minor', sharps:3, flats:0, accidentals:['F#','C#','G#'] },
      { key:'Bb major', relativeMinor:'G minor', sharps:0, flats:2, accidentals:['Bb','Eb'] },
      { key:'Eb major', relativeMinor:'C minor', sharps:0, flats:3, accidentals:['Bb','Eb','Ab'] },
    ],
    3: [
      { key:'C major', relativeMinor:'A minor', sharps:0, flats:0, accidentals:[] },
      { key:'G major', relativeMinor:'E minor', sharps:1, flats:0, accidentals:['F#'] },
      { key:'F major', relativeMinor:'D minor', sharps:0, flats:1, accidentals:['Bb'] },
      { key:'D major', relativeMinor:'B minor', sharps:2, flats:0, accidentals:['F#','C#'] },
      { key:'A major', relativeMinor:'F# minor', sharps:3, flats:0, accidentals:['F#','C#','G#'] },
      { key:'Bb major', relativeMinor:'G minor', sharps:0, flats:2, accidentals:['Bb','Eb'] },
      { key:'Eb major', relativeMinor:'C minor', sharps:0, flats:3, accidentals:['Bb','Eb','Ab'] },
      { key:'E major', relativeMinor:'C# minor', sharps:4, flats:0, accidentals:['F#','C#','G#','D#'] },
      { key:'B major', relativeMinor:'G# minor', sharps:5, flats:0, accidentals:['F#','C#','G#','D#','A#'] },
      { key:'Ab major', relativeMinor:'F minor', sharps:0, flats:4, accidentals:['Bb','Eb','Ab','Db'] },
    ]
  },

  /* ---- Intervals ----
     Grade 1: answer by number only (shortName)
     Grade 2+: answer by full quality + number (name)          */
  intervals: {
    1: [
      { id:'P1', name:'Perfect Unison', shortName:'1st (Unison)', semitones:0,  song:'Same note' },
      { id:'M2', name:'Major 2nd',      shortName:'2nd',          semitones:2,  song:'Happy Birthday' },
      { id:'M3', name:'Major 3rd',      shortName:'3rd',          semitones:4,  song:'When the Saints' },
      { id:'P4', name:'Perfect 4th',    shortName:'4th',          semitones:5,  song:'Here Comes the Bride' },
      { id:'P5', name:'Perfect 5th',    shortName:'5th',          semitones:7,  song:'Star Wars Theme' },
      { id:'P8', name:'Perfect Octave', shortName:'Octave',       semitones:12, song:'Somewhere Over the Rainbow' },
    ],
    2: [
      { id:'P1', name:'Perfect Unison', shortName:'P1', semitones:0,  song:'Same note' },
      { id:'M2', name:'Major 2nd',      shortName:'M2', semitones:2,  song:'Happy Birthday' },
      { id:'m3', name:'Minor 3rd',      shortName:'m3', semitones:3,  song:'Greensleeves' },
      { id:'M3', name:'Major 3rd',      shortName:'M3', semitones:4,  song:'When the Saints' },
      { id:'P4', name:'Perfect 4th',    shortName:'P4', semitones:5,  song:'Here Comes the Bride' },
      { id:'d5', name:'Diminished 5th', shortName:'d5', semitones:6,  song:'The Simpsons Theme' },
      { id:'P5', name:'Perfect 5th',    shortName:'P5', semitones:7,  song:'Star Wars Theme' },
      { id:'m6', name:'Minor 6th',      shortName:'m6', semitones:8,  song:'The Entertainer' },
      { id:'M6', name:'Major 6th',      shortName:'M6', semitones:9,  song:'My Bonnie' },
      { id:'m7', name:'Minor 7th',      shortName:'m7', semitones:10, song:'Somewhere (West Side Story)' },
      { id:'M7', name:'Major 7th',      shortName:'M7', semitones:11, song:'Take On Me' },
      { id:'P8', name:'Perfect Octave', shortName:'P8', semitones:12, song:'Somewhere Over the Rainbow' },
    ]
  },

  /* Root notes available per grade for interval exercises */
  intervalRoots: {
    1: ['C4','G4','F4'],
    2: ['C4','D4','E4','F4','G4','A4'],
    3: ['C4','D4','E4','F4','G4','A4'],
  },

  /* ---- Chords ---- */
  chords: {
    1: {
      triads: [
        { name:'C major', notes:['C4','E4','G4'], type:'major', inversion:'root', key:'C' },
        { name:'G major', notes:['G4','B4','D5'], type:'major', inversion:'root', key:'G' },
        { name:'F major', notes:['F4','A4','C5'], type:'major', inversion:'root', key:'F' },
      ],
      cadences: [
        { name:'Perfect Cadence (V–I)', type:'perfect', key:'C',
          chords:[['G4','B4','D5'],['C4','E4','G4']], label:'in C major' },
        { name:'Plagal Cadence (IV–I)', type:'plagal',  key:'C',
          chords:[['F4','A4','C5'],['C4','E4','G4']], label:'in C major' },
      ]
    },
    2: {
      triads: [
        { name:'C major', notes:['C4','E4','G4'], type:'major', inversion:'root', key:'C' },
        { name:'G major', notes:['G4','B4','D5'], type:'major', inversion:'root', key:'G' },
        { name:'F major', notes:['F4','A4','C5'], type:'major', inversion:'root', key:'F' },
        { name:'D major', notes:['D4','F#4','A4'], type:'major', inversion:'root', key:'D' },
        { name:'A major', notes:['A4','C#5','E5'], type:'major', inversion:'root', key:'A' },
        { name:'A minor', notes:['A4','C5','E5'],  type:'minor', inversion:'root', key:'Am' },
        { name:'D minor', notes:['D4','F4','A4'],  type:'minor', inversion:'root', key:'Dm' },
        { name:'E minor', notes:['E4','G4','B4'],  type:'minor', inversion:'root', key:'Em' },
      ],
      cadences: [
        { name:'Perfect Cadence (V–I)', type:'perfect', key:'C',
          chords:[['G4','B4','D5'],['C4','E4','G4']], label:'in C major' },
        { name:'Plagal Cadence (IV–I)', type:'plagal',  key:'C',
          chords:[['F4','A4','C5'],['C4','E4','G4']], label:'in C major' },
        { name:'Perfect Cadence (V–I)', type:'perfect', key:'G',
          chords:[['D4','F#4','A4'],['G4','B4','D5']], label:'in G major' },
        { name:'Plagal Cadence (IV–I)', type:'plagal',  key:'G',
          chords:[['C4','E4','G4'],['G4','B4','D5']], label:'in G major' },
        { name:'Perfect Cadence (V–I)', type:'perfect', key:'F',
          chords:[['C4','E4','G4'],['F4','A4','C5']], label:'in F major' },
        { name:'Plagal Cadence (IV–I)', type:'plagal',  key:'F',
          chords:[['Bb3','D4','F4'],['F4','A4','C5']], label:'in F major' },
      ]
    },
    3: {
      triads: [
        /* Root position */
        { name:'C major',           notes:['C4','E4','G4'],  type:'major', inversion:'root',  key:'C' },
        { name:'G major',           notes:['G4','B4','D5'],  type:'major', inversion:'root',  key:'G' },
        { name:'F major',           notes:['F4','A4','C5'],  type:'major', inversion:'root',  key:'F' },
        { name:'D major',           notes:['D4','F#4','A4'], type:'major', inversion:'root',  key:'D' },
        { name:'A major',           notes:['A4','C#5','E5'], type:'major', inversion:'root',  key:'A' },
        { name:'A minor',           notes:['A4','C5','E5'],  type:'minor', inversion:'root',  key:'Am' },
        { name:'D minor',           notes:['D4','F4','A4'],  type:'minor', inversion:'root',  key:'Dm' },
        { name:'E minor',           notes:['E4','G4','B4'],  type:'minor', inversion:'root',  key:'Em' },
        /* 1st inversions */
        { name:'C major (1st inv.)', notes:['E4','G4','C5'],  type:'major', inversion:'first', key:'C' },
        { name:'G major (1st inv.)', notes:['B4','D5','G5'],  type:'major', inversion:'first', key:'G' },
        { name:'F major (1st inv.)', notes:['A4','C5','F5'],  type:'major', inversion:'first', key:'F' },
        { name:'A minor (1st inv.)', notes:['C5','E5','A5'],  type:'minor', inversion:'first', key:'Am' },
        { name:'D minor (1st inv.)', notes:['F4','A4','D5'],  type:'minor', inversion:'first', key:'Dm' },
        { name:'E minor (1st inv.)', notes:['G4','B4','E5'],  type:'minor', inversion:'first', key:'Em' },
      ],
      cadences: [
        { name:'Perfect Cadence (V–I)',    type:'perfect',    key:'C',
          chords:[['G4','B4','D5'],['C4','E4','G4']], label:'in C major' },
        { name:'Plagal Cadence (IV–I)',    type:'plagal',     key:'C',
          chords:[['F4','A4','C5'],['C4','E4','G4']], label:'in C major' },
        { name:'Imperfect Cadence (I–V)',  type:'imperfect',  key:'C',
          chords:[['C4','E4','G4'],['G4','B4','D5']], label:'in C major' },
        { name:'Interrupted Cadence (V–VI)',type:'interrupted',key:'C',
          chords:[['G4','B4','D5'],['A4','C5','E5']], label:'in C major' },
        { name:'Perfect Cadence (V–I)',    type:'perfect',    key:'G',
          chords:[['D4','F#4','A4'],['G4','B4','D5']], label:'in G major' },
        { name:'Plagal Cadence (IV–I)',    type:'plagal',     key:'G',
          chords:[['C4','E4','G4'],['G4','B4','D5']], label:'in G major' },
        { name:'Perfect Cadence (V–I)',    type:'perfect',    key:'F',
          chords:[['C4','E4','G4'],['F4','A4','C5']], label:'in F major' },
        { name:'Plagal Cadence (IV–I)',    type:'plagal',     key:'F',
          chords:[['Bb3','D4','F4'],['F4','A4','C5']], label:'in F major' },
      ]
    }
  },

  /* ---- Musical Terms (68 total across grades) ---- */
  terms: {
    1: [
      { id:'adagio',       term:'Adagio',              meaning:'Slow',                                        category:'tempo' },
      { id:'andante',      term:'Andante',             meaning:'Walking pace (moderately slow)',              category:'tempo' },
      { id:'moderato',     term:'Moderato',            meaning:'At a moderate speed',                        category:'tempo' },
      { id:'allegro',      term:'Allegro',             meaning:'Fast and lively',                            category:'tempo' },
      { id:'presto',       term:'Presto',              meaning:'Very fast',                                  category:'tempo' },
      { id:'accelerando',  term:'Accelerando (accel.)', meaning:'Gradually getting faster',                 category:'tempo' },
      { id:'rallentando',  term:'Rallentando (rall.)', meaning:'Gradually getting slower',                  category:'tempo' },
      { id:'ritardando',   term:'Ritardando (rit.)',   meaning:'Gradually getting slower',                  category:'tempo' },
      { id:'ritenuto',     term:'Ritenuto (riten.)',   meaning:'Held back; immediately slower',             category:'tempo' },
      { id:'atempo',       term:'A tempo',             meaning:'Return to the original speed',               category:'tempo' },
      { id:'forte',        term:'Forte (f)',           meaning:'Loud',                                      category:'dynamic' },
      { id:'piano',        term:'Piano (p)',           meaning:'Soft / quiet',                              category:'dynamic' },
      { id:'crescendo',    term:'Crescendo (cresc.)',  meaning:'Gradually getting louder',                  category:'dynamic' },
      { id:'decrescendo',  term:'Decrescendo (decresc.)', meaning:'Gradually getting softer',              category:'dynamic' },
      { id:'diminuendo',   term:'Diminuendo (dim.)',   meaning:'Gradually getting softer',                  category:'dynamic' },
      { id:'legato',       term:'Legato',              meaning:'Smooth and connected',                      category:'articulation' },
      { id:'staccato',     term:'Staccato',            meaning:'Short and detached',                       category:'articulation' },
    ],
    2: [
      { id:'lento',        term:'Lento',               meaning:'Slow',                                      category:'tempo' },
      { id:'largo',        term:'Largo',               meaning:'Broad and very slow',                       category:'tempo' },
      { id:'allegretto',   term:'Allegretto',          meaning:'Fairly fast (slightly slower than Allegro)', category:'tempo' },
      { id:'vivace',       term:'Vivace',              meaning:'Lively and fast',                           category:'tempo' },
      { id:'vivo',         term:'Vivo',                meaning:'Lively',                                    category:'tempo' },
      { id:'allargando',   term:'Allargando (allarg.)', meaning:'Broadening (slower and louder)',           category:'tempo' },
      { id:'piumosso',     term:'Più mosso',           meaning:'More movement (faster)',                    category:'tempo' },
      { id:'menomosso',    term:'Meno mosso',          meaning:'Less movement (slower)',                    category:'tempo' },
      { id:'pianissimo',   term:'Pianissimo (pp)',      meaning:'Very soft / very quiet',                   category:'dynamic' },
      { id:'fortissimo',   term:'Fortissimo (ff)',      meaning:'Very loud',                                category:'dynamic' },
      { id:'mezzopiano',   term:'Mezzo piano (mp)',     meaning:'Moderately soft',                          category:'dynamic' },
      { id:'mezzoforte',   term:'Mezzo forte (mf)',     meaning:'Moderately loud',                         category:'dynamic' },
      { id:'maestoso',     term:'Maestoso',            meaning:'Majestic, stately',                        category:'expression' },
      { id:'sostenuto',    term:'Sostenuto',           meaning:'Sustained',                                category:'expression' },
      { id:'sempre',       term:'Sempre',              meaning:'Always',                                    category:'expression' },
      { id:'poco',         term:'Poco',                meaning:'A little',                                  category:'expression' },
      { id:'molto',        term:'Molto',               meaning:'Much, very',                               category:'expression' },
      { id:'senza',        term:'Senza',               meaning:'Without',                                  category:'expression' },
      { id:'cantabile',    term:'Cantabile',           meaning:'In a singing style',                       category:'expression' },
      { id:'leggiero',     term:'Leggiero',            meaning:'Light, nimble',                            category:'expression' },
      { id:'espressivo',   term:'Espressivo (espress.)', meaning:'With expression',                        category:'expression' },
      { id:'dalsegno',     term:'Dal Segno (D.S.)',    meaning:'Repeat from the sign (𝄋)',                 category:'direction' },
      { id:'dacapo',       term:'Da Capo al Fine (D.C. al Fine)', meaning:'Repeat from the beginning to Fine', category:'direction' },
      { id:'mezzostaccato',term:'Mezzo staccato (portato)', meaning:'Half detached; gently pulsed',        category:'articulation' },
    ],
    3: [
      { id:'largamente',   term:'Largamente',          meaning:'Broadly',                                  category:'tempo' },
      { id:'larghetto',    term:'Larghetto',           meaning:'Fairly slow (not as slow as Largo)',       category:'tempo' },
      { id:'prestissimo',  term:'Prestissimo',         meaning:'As fast as possible',                     category:'tempo' },
      { id:'conmoto',      term:'Con moto',            meaning:'With movement',                            category:'tempo' },
      { id:'calando',      term:'Calando',             meaning:'Getting softer and slower',                category:'tempo' },
      { id:'morendo',      term:'Morendo',             meaning:'Dying away (slower and softer)',           category:'tempo' },
      { id:'fortepiano',   term:'Forte-piano (fp)',    meaning:'Loud then immediately soft',              category:'dynamic' },
      { id:'sforzando',    term:'Sforzando (sfz / sf)', meaning:'Strongly accented',                      category:'dynamic' },
      { id:'agitato',      term:'Agitato',             meaning:'Agitated',                                category:'expression' },
      { id:'animato',      term:'Animato',             meaning:'Animated, lively',                        category:'expression' },
      { id:'tranquillo',   term:'Tranquillo',          meaning:'Calm, quiet',                             category:'expression' },
      { id:'conanima',     term:'Con anima',           meaning:'With soul / feeling',                     category:'expression' },
      { id:'conbrio',      term:'Con brio',            meaning:'With vigour',                             category:'expression' },
      { id:'congrazia',    term:'Con grazia',          meaning:'With grace',                              category:'expression' },
      { id:'conforza',     term:'Con forza',           meaning:'With force',                              category:'expression' },
      { id:'dolce',        term:'Dolce',               meaning:'Sweetly, softly',                         category:'expression' },
      { id:'risoluto',     term:'Risoluto',            meaning:'Boldly, resolutely',                      category:'expression' },
      { id:'benmarcato',   term:'Ben marcato',         meaning:'Well marked, clearly accented',           category:'expression' },
      { id:'subito',       term:'Subito (sub.)',       meaning:'Suddenly',                                category:'expression' },
      { id:'attacca',      term:'Attacca',             meaning:'Continue immediately without a break',    category:'direction' },
      { id:'maindroite',   term:'Main droite (m.d.)',  meaning:'Right hand',                              category:'direction' },
      { id:'maingauche',   term:'Main gauche (m.g.)', meaning:'Left hand',                               category:'direction' },
      { id:'adlibitum',    term:'Ad libitum (ad lib.)', meaning:"At the performer's discretion",         category:'direction' },
      { id:'unacorda',     term:'Una corda (u.c.)',    meaning:'Use the soft pedal (left pedal)',         category:'pedal' },
      { id:'trecorde',     term:'Tre corde (t.c.)',    meaning:'Release the soft pedal',                  category:'pedal' },
      { id:'opus',         term:'Opus (op.)',          meaning:'Work number (e.g. Op. 9)',                category:'notation' },
      { id:'loco',         term:'Loco',                meaning:'Play at written pitch (after 8va)',       category:'notation' },
    ]
  },

  /* ---- Time Signatures ---- */
  timeSignatures: {
    1: [
      { sig:'2/4', beats:2, unit:'crotchet', feel:'simple duple' },
      { sig:'3/4', beats:3, unit:'crotchet', feel:'simple triple' },
      { sig:'4/4', beats:4, unit:'crotchet', feel:'simple quadruple' },
    ],
    2: [
      { sig:'2/4', beats:2, unit:'crotchet',  feel:'simple duple' },
      { sig:'3/4', beats:3, unit:'crotchet',  feel:'simple triple' },
      { sig:'4/4', beats:4, unit:'crotchet',  feel:'simple quadruple' },
      { sig:'6/8', beats:2, unit:'dotted crotchet', feel:'compound duple' },
    ],
    3: [
      { sig:'2/4', beats:2, unit:'crotchet',         feel:'simple duple' },
      { sig:'3/4', beats:3, unit:'crotchet',         feel:'simple triple' },
      { sig:'4/4', beats:4, unit:'crotchet',         feel:'simple quadruple' },
      { sig:'2/2', beats:2, unit:'minim',            feel:'simple duple (cut time)' },
      { sig:'6/8', beats:2, unit:'dotted crotchet',  feel:'compound duple' },
      { sig:'9/8', beats:3, unit:'dotted crotchet',  feel:'compound triple' },
    ]
  },

  /* ---- Note Values (used in note-values.html) ---- */
  noteValues: [
    { id:'semibreve',     name:'Semibreve',       abcDur:4,  beatsIn44:4,   hasRest:true  },
    { id:'minim',         name:'Minim',           abcDur:2,  beatsIn44:2,   hasRest:true  },
    { id:'crotchet',      name:'Crotchet',        abcDur:1,  beatsIn44:1,   hasRest:true  },
    { id:'quaver',        name:'Quaver',          abcDur:0.5,beatsIn44:0.5, hasRest:true  },
    { id:'semiquaver',    name:'Semiquaver',      abcDur:0.25,beatsIn44:0.25,hasRest:true },
    { id:'dotted-minim',  name:'Dotted minim',    abcDur:3,  beatsIn44:3,   hasRest:false },
    { id:'dotted-crotchet',name:'Dotted crotchet',abcDur:1.5,beatsIn44:1.5, hasRest:false },
    { id:'dotted-quaver', name:'Dotted quaver',   abcDur:0.75,beatsIn44:0.75,hasRest:false},
  ],

  /* ---- Helper: get all terms up to and including grade g ---- */
  getAllTermsForGrade: function(g) {
    var out = [];
    for (var gr = 1; gr <= g; gr++) {
      if (this.terms[gr]) out = out.concat(this.terms[gr]);
    }
    return out;
  },

  /* ---- Helper: get Grade 2 intervals (Grade 3 uses same list) ---- */
  getIntervals: function(g) {
    return this.intervals[g <= 1 ? 1 : 2];
  },

  /* ---- Helper: get scales up to and including grade g ---- */
  getScales: function(g) {
    return this.scales[Math.min(g, 3)] || this.scales[3];
  }
};

/* ============ Encouraging Messages ============ */
const CORRECT_MESSAGES = [
  "Correct, {name}.",
  "Well done, {name}.",
  "That's right, {name}.",
  "Exactly — good work, {name}.",
  "Correct.",
  "Well done.",
  "Right answer, {name}.",
  "Good, {name}.",
  "Nicely done, {name}.",
  "Spot on."
];

const WRONG_MESSAGES = [
  "Not quite — try again.",
  "Almost — check the answer below.",
  "Not this time. See the correct answer.",
  "Have another look.",
  "Incorrect — the right answer is shown."
];

let _correctIdx = 0;
let _wrongIdx = 0;

function formatMsg(msg) {
  var name = getPlayerName();
  if (name) return msg.replace(/\{name\}/g, name);
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

  if (overlay) overlay.style.display = 'flex';

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

/* Play an array of [note, durationSeconds] pairs */
async function playNotePairs(pairs) {
  if (!sampler) return;
  await ensureAudio();
  let t = Tone.now() + 0.05;
  pairs.forEach(function(pair) {
    sampler.triggerAttackRelease(pair[0], pair[1], t);
    t += pair[1];
  });
}

/* ============ Player Name ============ */
function getPlayerName() {
  if (typeof mmGetProfile === 'function') {
    var profile = mmGetProfile();
    if (profile && profile.name) return profile.name;
  }
  if (typeof mmGetUser === 'function') {
    var user = mmGetUser();
    if (user && user.email) {
      var stored = localStorage.getItem('player-name');
      if (stored) return stored;
      return user.email.split('@')[0];
    }
  }
  return localStorage.getItem('player-name') || '';
}
function setPlayerName(n) {
  localStorage.setItem('player-name', n.trim().slice(0, 20));
}

/* ============ Access / Grade Gate ============ */
function isUnlocked() {
  return localStorage.getItem('mm-unlocked') === 'true';
}

function hasFullAccess() {
  if (typeof mmHasFullAccess === 'function') return mmHasFullAccess();
  return isUnlocked();
}

var STRIPE_PAYMENT_LINK = 'https://buy.stripe.com/eVq5kE1Kf6rZ2OH78h1ck04';

/* client_reference_id ties the Stripe checkout to the signed-in user so the
   webhook can unlock the right account. Sign-in is required before paying. */
function _paymentUrl() {
  var user = typeof mmGetUser === 'function' ? mmGetUser() : null;
  if (user && user.id) {
    return STRIPE_PAYMENT_LINK + '?client_reference_id=' + encodeURIComponent(user.id);
  }
  return STRIPE_PAYMENT_LINK;
}

function gotoPayment() {
  if (typeof mmIsSignedIn === 'function' && mmIsSignedIn()) {
    window.location.href = _paymentUrl();
  } else {
    if (typeof showAuthModal === 'function') {
      showAuthModal({ allowGuest: false, onSuccess: function() { window.location.href = _paymentUrl(); } });
    }
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
        '<li style="padding:4px 0;">✅ 14 scales + key signatures</li>' +
        '<li style="padding:4px 0;">✅ All 12 intervals with full names</li>' +
        '<li style="padding:4px 0;">✅ Triads, inversions &amp; all cadence types</li>' +
        '<li style="padding:4px 0;">✅ Compound time signatures</li>' +
        '<li style="padding:4px 0;">✅ 68 terms + mock exam (100+ questions)</li>' +
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
  /* Clamp the *effective* grade without persisting: on a fresh page load the
     profile arrives async, so writing back here would wipe a paid user's
     saved grade before their unlock status is known. */
  if (g > 1 && !hasFullAccess()) return 1;
  return Math.min(Math.max(g, 1), 3);
}
function setGrade(g) {
  localStorage.setItem('cc-grade', String(Math.min(Math.max(g, 1), 3)));
}

function buildGradeSelector(containerId, onChange) {
  var container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
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

  /* The profile loads async after page init; when auth state arrives the
     effective grade may change (paid user on a fresh device). Rebuild the
     selector and notify the page so it re-renders at the right grade. */
  if (!container._mmAuthListener) {
    container._mmAuthListener = true;
    var lastGrade = getGrade();
    window.addEventListener('mm-auth-changed', function() {
      buildGradeSelector(containerId, onChange);
      var now = getGrade();
      if (now !== lastGrade) {
        lastGrade = now;
        if (onChange) onChange(now);
      }
    });
  }
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
  void el.offsetWidth;
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

  var lastMidi    = endMidi;
  var lastOctN    = Math.floor(lastMidi / 12) - startOctBase;
  var lastX       = (CHROMA_X[lastMidi % 12] + lastOctN * 7) * W - CHROMA_X[startMidi % 12] * W;
  var lastIsBlack = CHROMA_IS_BLACK[lastMidi % 12];
  var totalWidth  = lastX + (lastIsBlack ? blackWidth : whiteWidth) + 4;

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
   ============================================================ */
function getMasteryData() {
  try { return JSON.parse(localStorage.getItem('mm-mastery') || '{}'); } catch(e) { return {}; }
}
function saveMasteryData(d) {
  try { localStorage.setItem('mm-mastery', JSON.stringify(d)); } catch(e) {}
}

function trackAnswer(module, concept, isCorrect) {
  var d = getMasteryData();
  var key = module + ':' + concept;
  if (!d[key]) d[key] = { correct: 0, wrong: 0, lastSeen: 0 };
  if (isCorrect) d[key].correct++;
  else           d[key].wrong++;
  d[key].lastSeen = Date.now();
  saveMasteryData(d);
  if (typeof mmSyncProgress === 'function') mmSyncProgress(module, concept, isCorrect);
}

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

function getWeakConceptsForModule(module, n) {
  return getWeakConcepts(100).filter(function(r) { return r.module === module; }).slice(0, n || 5);
}

function weightedPickConcept(pool) {
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
   ============================================================ */
function showSessionSummary(opts) {
  opts = opts || {};
  var module   = opts.module || '';
  var correct  = opts.correct || 0;
  var total    = opts.total   || 0;
  var onContinue = opts.onContinue;
  var pct = total > 0 ? Math.round(correct / total * 100) : 0;

  var star = pct >= 90 ? '🌟🌟🌟' : pct >= 70 ? '🌟🌟' : '🌟';
  var headline = pct >= 90 ? 'Outstanding session!' : pct >= 70 ? 'Great work!' : 'Keep practising!';
  var sub = pct >= 90 ? "You're really getting it!" :
            pct >= 70 ? "You're making solid progress." :
            'Every expert was once a beginner.';

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
            '<div style="background:' + barColor + ';width:' + pctW + '%;height:100%;border-radius:6px;"></div>' +
          '</div>' +
        '</div>';
    });
    weakHtml += '</div>';
  }

  var NEXT = {
    'note-namer':      { label:'Scale Builder',   href:'scale-builder.html' },
    'scale-builder':   { label:'Key Signatures',  href:'key-signatures.html' },
    'key-signatures':  { label:'Interval Quiz',   href:'interval-quiz.html' },
    'note-values':     { label:'Rhythm Trainer',  href:'rhythm-trainer.html' },
    'interval-quiz':   { label:'Aural Training',  href:'aural-training.html' },
    'aural-training':  { label:'Chord Game',       href:'chord-game.html' },
    'chord-game':      { label:'Form Detective',  href:'form-detective.html' },
    'rhythm-trainer':  { label:'Note Values',     href:'note-values.html' },
    'terms-flashcards':{ label:'Mock Exam',       href:'mock-exam.html' },
    'form-detective':  { label:'Mock Exam',       href:'mock-exam.html' },
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
          '<div style="background:linear-gradient(90deg,#9b7ee8,#FF8FAB);width:' + pct + '%;height:100%;border-radius:8px;"></div>' +
        '</div>' +
      '</div>' +
      weakHtml + nextHtml +
      '<button onclick="(function(){var m=document.getElementById(\'session-summary-modal\');if(m)m.remove();' + (onContinue ? 'window._summaryOnContinue&&window._summaryOnContinue();' : '') + '})()" style="display:block;width:100%;margin-top:10px;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:13px;font-size:1rem;cursor:pointer;font-weight:700;">Keep practising 🎵</button>' +
      '<a href="index.html" style="display:block;text-align:center;margin-top:10px;color:#aaa;font-size:0.85rem;text-decoration:none;">← Back to home</a>' +
    '</div>';

  if (onContinue) window._summaryOnContinue = onContinue;
  document.body.appendChild(modal);
}

/* ============================================================
   SESSION MILESTONE TRACKER
   ============================================================ */
function attachMilestoneTracker(sessionScore, everyN) {
  everyN = everyN || 10;
  var lastMilestone = 0;
  var orig_update = sessionScore._update.bind(sessionScore);
  sessionScore._update = function() {
    orig_update();
    if (sessionScore.total > 0 && sessionScore.total % everyN === 0 && sessionScore.total !== lastMilestone) {
      lastMilestone = sessionScore.total;
      showSessionSummary({ module: sessionScore.module, correct: sessionScore.correct, total: sessionScore.total });
    }
  };
}

/* ============ i18n shims (if i18n.js not loaded) ============ */
function getCurrentLang() {
  if (typeof _getCurrentLang === 'function') return _getCurrentLang();
  return localStorage.getItem('mm-lang') || 'en';
}
