/* =============================================
   CC Music Game — i18n (Multilingual Support)
   English + Simplified Chinese + Spanish
   ============================================= */

window.TRANSLATIONS = {
  en: {
    // Nav
    'back': '←',
    'lang-toggle': '中文',
    'score-label': 'Score',
    'streak-label': 'Streak',
    'skip': 'Skip →',

    // Index
    'app-title': 'Music Maestro',
    'app-tagline': 'AMEB Piano exam prep — Grades 1, 2 & 3',
    'overall-progress': 'Overall Progress',
    'grade-selector-label': 'Your Grade',
    'grade-3': 'Grade 3',
    'free-label': 'Free',
    'paid-label': 'Paid',

    // Module names
    'mod-note-namer':       ' Note Namer',
    'mod-scale-builder':    ' Scale Builder',
    'mod-key-signatures':   ' Key Signatures',
    'mod-note-values':      '♩ Note Values',
    'mod-interval-quiz':    ' Interval Quiz',
    'mod-chord-game':       ' Chord Game',
    'mod-rhythm-trainer':   ' Rhythm Trainer',
    'mod-terms-flashcards': ' Terms Flashcards',
    'mod-aural-training':   ' Aural Training',
    'mod-form-detective':   ' Form Detective',
    'mod-learn':            ' Theory Guide',
    'mod-mock-exam':        ' Mock Exam',
    'mod-daily-challenge':  ' Daily Challenge',

    // Module descriptions
    'desc-note-namer':       'Identify notes on treble & bass clef staves',
    'desc-scale-builder':    'Build major & harmonic minor scales on piano',
    'desc-key-signatures':   'How many sharps or flats? Which key?',
    'desc-note-values':      'Note & rest values in any time signature',
    'desc-interval-quiz':    'Name intervals — visual & aural modes',
    'desc-chord-game':       'Triads, inversions & all cadence types',
    'desc-rhythm-trainer':   'Tap rhythms & identify time signatures',
    'desc-terms-flashcards': 'Italian & French terms with spaced repetition',
    'desc-aural-training':   'Hear and identify pitches, intervals & phrases',
    'desc-form-detective':   'Binary, Ternary, cadences & time signatures',
    'desc-learn':            'Full theory reference — every topic, every grade',
    'desc-mock-exam':        'Timed 20-question exam sessions, Grade 1–3',
    'desc-daily-challenge':  '5 mixed questions a day — build your streak!',

    // How to play intros
    'how-note-namer':       'A note appears on the staff. Look carefully at where it sits on lines and spaces, then tap the correct letter name (C D E F G A B). You can toggle between treble and bass clef!',
    'how-scale-builder':    'A scale name appears at the top. Tap the notes on the piano keyboard in order, from the lowest note up to the highest. Each correct note lights green!',
    'how-key-signatures':   'A key signature will be shown on the staff. Count the sharps or flats and choose the correct major key name. Or answer the reverse: given a key, identify its signature!',
    'how-note-values':      'A note or rest symbol appears. Answer how many beats it is worth in the given time signature. Remember: dotted notes add half their value!',
    'how-interval-quiz':    'Two notes are shown on the staff. Count the distance and choose the correct interval name. Grade 1: answer by number (2nd, 3rd…). Grade 2–3: include the quality (Major 2nd, Perfect 4th…).',
    'how-chord-game':       'A chord appears on the staff. Identify whether it is major or minor, and whether it is root position or first inversion. In Cadence mode, listen and name the cadence type.',
    'how-rhythm-trainer':   'A rhythm pattern is displayed. Press Start, listen to the count-in, then tap the TAP button (or spacebar) in time. You can also identify the time signature of patterns!',
    'how-terms-flashcards': 'A music term appears on the front of the card. Try to remember its meaning, then tap the card to see the answer. Rate yourself — the harder ones will come back sooner!',
    'how-aural-training':   'Listen to a piano note or interval and identify what you hear — no staff shown. Grade 1: higher or lower? Grade 2–3: name the interval by number and quality.',
    'how-form-detective':   'Listen to a short piece and answer questions about its form (Binary AB or Ternary ABA), cadence type, or time signature.',
    'how-mock-exam':        'A timed 20-question session drawn from a bank of 60–100 questions per grade. Covers all AMEB theory topics. Score 80%+ for High Distinction!',

    // Common buttons
    'how-to-play': '? How to Play',
    'hide-intro': 'Hide',
    'new-note': 'New Note ↩',
    'show-me': ' Show Me',
    'try-another': 'New Scale ',
    'play-scale': '▶ Play Scale',
    'play-notes': '▶ Play Notes',
    'play': '▶ Play',
    'start': '▶ Start',
    'next-pattern': 'Next Pattern',
    'try-again': ' Try Again',
    'flip-hint': ' Tap to flip',
    'got-it': 'Got it',
    'not-sure': 'Not sure',
    'reset-progress': ' Reset Progress',
    'next-question': 'Next',
    'start-exam': '▶ Start Exam',
    'next-exam': ' New Session',
    'submit': 'Submit Answer',
    'treble-clef': 'Treble Clef',
    'bass-clef': 'Bass Clef',
    'harmonic': 'Harmonic (together)',
    'melodic': 'Melodic (one by one)',
    'chord-id': ' Chords',
    'cadence-game': ' Cadences',
    'all-grades': 'All Grades',
    'grade-1': 'Grade 1',
    'grade-2': 'Grade 2',
    'all-questions': 'All Topics',
    'form-q': 'Form (AB/ABA)',
    'cadence-q': 'Cadences',
    'timesig-q': 'Time Signatures',
    'mastered': 'mastered',
    'card-of': 'Card',
    'of': 'of',

    // Loading
    'loading': 'Loading piano sounds… ',
    'tap-skip': '(tap here to skip)',

    // Mock exam
    'test-title': ' Mock Exam',
    'test-grade': 'Grade',
    'test-question': 'Question',
    'test-of': 'of',
    'test-score': 'Your score:',
    'test-hd': ' High Distinction! Outstanding!',
    'test-hon': ' Honours! Well done!',
    'test-credit': ' Credit! Good work!',
    'test-pass': ' Satisfactory — keep practising!',

    // Correct messages
    correct: [
      "Amazing work, {name}! ",
      "You're a music star, {name}! ",
      "Brilliant, {name}. Keep going.",
      "That's right, {name}! You're so clever! ",
      "Woohoo {name}! Your music teacher would be proud! ",
      "Correct! {name} is on fire today! ",
      "Yes yes yes! You got it, {name}! ",
      "{name} you're amazing at this! ",
      "Perfect, {name}! You're going to ace that AMEB exam! ",
      "Excellent work, {name}."
    ],
    wrong: [
      "Almost, {name}! Give it another try ",
      "Not quite, {name} — you've got this! ",
      "Oops! Try again, {name}, I believe in you! ",
      "Nearly there, {name}! Have another go ",
      "Don't give up, {name}, you're learning! "
    ]
  },

  zh: {
    // Nav
    'back': '←',
    'lang-toggle': 'Español',
    'score-label': '得分',
    'streak-label': '连续',
    'skip': '跳过 →',

    // Index
    'app-title': '音乐大师',
    'app-tagline': 'AMEB钢琴考试备考 — 第1、2、3级',
    'overall-progress': '总体进度',
    'grade-selector-label': '你的级别',
    'grade-3': '三级',
    'free-label': '免费',
    'paid-label': '付费',

    // Module names
    'mod-note-namer':       ' 音符认读',
    'mod-scale-builder':    ' 音阶构建',
    'mod-key-signatures':   ' 调号',
    'mod-note-values':      '♩ 音符时值',
    'mod-interval-quiz':    ' 音程测验',
    'mod-chord-game':       ' 和弦游戏',
    'mod-rhythm-trainer':   ' 节奏训练',
    'mod-terms-flashcards': ' 术语闪卡',
    'mod-aural-training':   ' 听觉训练',
    'mod-form-detective':   ' 曲式侦探',
    'mod-learn':            ' 乐理指南',
    'mod-mock-exam':        ' 模拟考试',
    'mod-daily-challenge':  ' 每日挑战',

    // Module descriptions
    'desc-note-namer':       '认读高音谱表和低音谱表上的音符',
    'desc-scale-builder':    '在钢琴上构建大调和和声小调音阶',
    'desc-key-signatures':   '几个升号或降号？是哪个调？',
    'desc-note-values':      '各种拍号中的音符和休止符时值',
    'desc-interval-quiz':    '命名音程 — 视觉和听觉两种模式',
    'desc-chord-game':       '三和弦、转位和所有终止式类型',
    'desc-rhythm-trainer':   '拍打节奏并识别拍号',
    'desc-terms-flashcards': '使用间隔重复法学习意大利语和法语术语',
    'desc-aural-training':   '听辨音高、音程和旋律短句',
    'desc-form-detective':   '二段式、三段式、终止式和拍号',
    'desc-learn':            '完整乐理参考 — 每个主题、每个级别',
    'desc-mock-exam':        '每次20题模拟考试，第1–3级',
    'desc-daily-challenge':  '每天5道混合题 — 保持连续打卡！',

    // How to play intros
    'how-note-namer':       '五线谱上会出现一个音符。仔细看它在线条和间隔上的位置，然后点击正确的音符名称（C D E F G A B）。可以切换高音谱号和低音谱号！',
    'how-scale-builder':    '顶部会显示音阶名称。按从低到高的顺序点击钢琴键盘上的正确音符，每个正确音符会亮起绿色！',
    'how-key-signatures':   '五线谱上会显示一个调号。数出升号或降号的数量，选择正确的大调名称。也可以反向练习：给出调名，识别对应的调号！',
    'how-note-values':      '会显示一个音符或休止符。回答在给定拍号中它值几拍。记住：附点音符的时值再加上本身的一半！',
    'how-interval-quiz':    '五线谱上显示两个音符。数出距离并选择正确的音程名称。第1级：按数字回答（二度、三度…）；第2–3级：包括性质（大二度、纯四度…）。',
    'how-chord-game':       '五线谱上显示一个和弦。判断它是大调还是小调，是原位还是第一转位。在终止式模式中，听音后说出终止式类型。',
    'how-rhythm-trainer':   '显示一个节奏型。按"开始"，听预备拍，然后随节奏点击TAP按钮（或空格键）。也可以识别节奏型的拍号！',
    'how-terms-flashcards': '卡片正面显示一个音乐术语。试着想出含义，然后点击卡片翻转查看答案。根据掌握程度评分——越难的会越快再次出现！',
    'how-aural-training':   '听一个钢琴音符或音程，然后判断你听到的内容——不看五线谱。第1级：高了还是低了？第2–3级：按数字和性质命名音程。',
    'how-form-detective':   '聆听短曲，回答关于曲式（二段式AB或三段式ABA）、终止式类型或拍号的问题。',
    'how-mock-exam':        '每次从60–100题题库中随机抽取20题的限时考试。涵盖所有AMEB乐理考试主题。得分80%以上即为优秀！',

    // Common buttons
    'how-to-play': '? 游戏说明',
    'hide-intro': '隐藏',
    'new-note': '新音符 ↩',
    'show-me': ' 给我看',
    'try-another': '新音阶 ',
    'play-scale': '▶ 播放音阶',
    'play-notes': '▶ 播放音符',
    'play': '▶ 播放',
    'start': '▶ 开始',
    'next-pattern': '下一个节奏',
    'try-again': ' 再试一次',
    'flip-hint': ' 点击翻转',
    'got-it': '我会了',
    'not-sure': '不确定',
    'reset-progress': ' 重置进度',
    'next-question': '下一题',
    'start-exam': '▶ 开始考试',
    'next-exam': ' 新考试',
    'submit': '提交答案',
    'treble-clef': '高音谱号',
    'bass-clef': '低音谱号',
    'harmonic': '和声（同时）',
    'melodic': '旋律（依次）',
    'chord-id': ' 和弦',
    'cadence-game': ' 终止式',
    'all-grades': '全部级别',
    'grade-1': '一级',
    'grade-2': '二级',
    'grade-3': '三级',
    'all-questions': '全部主题',
    'form-q': '曲式（AB/ABA）',
    'cadence-q': '终止式',
    'timesig-q': '拍号',
    'mastered': '已掌握',
    'card-of': '第',
    'of': '张，共',

    // Loading
    'loading': '加载钢琴音色中… ',
    'tap-skip': '（点击此处跳过）',

    // Mock exam
    'test-title': ' 模拟考试',
    'test-grade': '级别',
    'test-question': '第',
    'test-of': '题，共',
    'test-score': '你的得分：',
    'test-hd': ' 优秀！满分成绩！',
    'test-hon': ' 荣誉！干得好！',
    'test-credit': ' 良好！',
    'test-pass': ' 合格 — 继续练习！',

    // Correct messages
    correct: [
      "太棒了，{name}！",
      "你是音乐明星，{name}！",
      "太好了，{name}！继续加油！",
      "答对了，{name}！你真聪明！",
      "哇哦{name}！你的音乐老师会为你骄傲的！",
      "正确！{name}今天状态超好！",
      "对对对！你答对了，{name}！",
      "{name}你太厉害了！",
      "完美，{name}！你一定能通过AMEB考试！",
      "{name}，做得很好！"
    ],
    wrong: [
      "差一点，{name}！再试一次",
      "不太对，{name}——你可以的！",
      "哎呀！再试试，{name}，我相信你！",
      "快到了，{name}！再来一次",
      "不要放弃，{name}，你在进步！"
    ]
  },

  es: {
    // Nav
    'back': '←',
    'lang-toggle': 'English',
    'score-label': 'Puntos',
    'streak-label': 'Racha',
    'skip': 'Saltar →',

    // Index
    'app-title': 'Music Maestro',
    'app-tagline': 'Preparación examen AMEB Piano — Grados 1, 2 y 3',
    'overall-progress': 'Progreso general',
    'grade-selector-label': 'Tu grado',
    'grade-3': 'Grado 3',
    'free-label': 'Gratis',
    'paid-label': 'Pago',

    // Module names
    'mod-note-namer':       ' Nombra la nota',
    'mod-scale-builder':    ' Construye la escala',
    'mod-key-signatures':   ' Armaduras',
    'mod-note-values':      '♩ Figuras y silencios',
    'mod-interval-quiz':    ' Quiz de intervalos',
    'mod-chord-game':       ' Juego de acordes',
    'mod-rhythm-trainer':   ' Entrenador de ritmo',
    'mod-terms-flashcards': ' Flashcards de términos',
    'mod-aural-training':   ' Entrenamiento auditivo',
    'mod-form-detective':   ' Detective de forma',
    'mod-learn':            ' Guía de teoría',
    'mod-mock-exam':        ' Examen de práctica',
    'mod-daily-challenge':  ' Reto diario',

    // Module descriptions
    'desc-note-namer':       'Identifica notas en clave de sol y clave de fa',
    'desc-scale-builder':    'Construye escalas mayores y menores armónicas en el piano',
    'desc-key-signatures':   '¿Cuántos sostenidos o bemoles? ¿Qué tonalidad?',
    'desc-note-values':      'Valores de notas y silencios en cualquier compás',
    'desc-interval-quiz':    'Nombra intervalos — modos visual y auditivo',
    'desc-chord-game':       'Tríadas, inversiones y todos los tipos de cadencia',
    'desc-rhythm-trainer':   'Marca ritmos e identifica compases',
    'desc-terms-flashcards': 'Términos italianos y franceses con repetición espaciada',
    'desc-aural-training':   'Escucha e identifica alturas, intervalos y frases',
    'desc-form-detective':   'Forma binaria, ternaria, cadencias y compases',
    'desc-learn':            'Referencia de teoría completa — cada tema, cada grado',
    'desc-mock-exam':        'Sesiones de 20 preguntas, Grados 1–3',
    'desc-daily-challenge':  '5 preguntas mixtas al día — ¡mantén tu racha!',

    // How to play intros
    'how-note-namer':       '¡Aparece una nota en el pentagrama! Mira bien su posición en las líneas y espacios, y toca el nombre correcto (C D E F G A B). ¡Puedes cambiar entre clave de sol y clave de fa!',
    'how-scale-builder':    'Aparece el nombre de una escala. Toca las notas en el teclado del piano en orden de más baja a más alta. ¡Cada nota correcta se ilumina en verde!',
    'how-key-signatures':   'Se muestra una armadura en el pentagrama. Cuenta los sostenidos o bemoles y elige el nombre correcto de la tonalidad mayor. ¡También puedes practicar al revés!',
    'how-note-values':      'Aparece una figura o silencio. Responde cuántos tiempos vale en el compás indicado. ¡Recuerda: las figuras con puntillo valen la mitad más!',
    'how-interval-quiz':    'Se muestran dos notas en el pentagrama. Cuenta la distancia y elige el nombre correcto. Grado 1: responde por número (2ª, 3ª…). Grado 2–3: incluye la calidad (2ª mayor, 4ª justa…).',
    'how-chord-game':       'Aparece un acorde en el pentagrama. Identifica si es mayor o menor y si está en posición fundamental o primera inversión. ¡En el modo Cadencia, escucha e identifica el tipo de cadencia!',
    'how-rhythm-trainer':   'Se muestra un patrón rítmico. Presiona Iniciar, escucha el tiempo de entrada y toca el botón TAP (o barra espaciadora) al compás. ¡También puedes identificar el compás de los patrones!',
    'how-terms-flashcards': 'Aparece un término musical en la tarjeta. Intenta recordar su significado y toca para ver la respuesta. ¡Valórate tú mismo: los más difíciles volverán antes!',
    'how-aural-training':   'Escucha una nota o intervalo del piano e identifica lo que oyes, sin ver el pentagrama. Grado 1: ¿más alto o más bajo? Grado 2–3: nombra el intervalo por número y calidad.',
    'how-form-detective':   'Escucha una pieza corta y responde sobre su forma (Binaria AB o Ternaria ABA), el tipo de cadencia o el compás.',
    'how-mock-exam':        'Una sesión cronometrada de 20 preguntas de un banco de 60–100 preguntas por grado. Cubre todos los temas de teoría AMEB. ¡Saca un 80%+ para conseguir la máxima distinción!',

    // Common buttons
    'how-to-play': '? Cómo jugar',
    'hide-intro': 'Ocultar',
    'new-note': 'Nueva nota ↩',
    'show-me': ' Muéstrame',
    'try-another': 'Nueva escala ',
    'play-scale': '▶ Tocar escala',
    'play-notes': '▶ Tocar notas',
    'play': '▶ Reproducir',
    'start': '▶ Iniciar',
    'next-pattern': 'Siguiente patrón',
    'try-again': ' Intentar de nuevo',
    'flip-hint': ' Toca para girar',
    'got-it': '¡Lo sé!',
    'not-sure': 'No estoy seguro',
    'reset-progress': ' Reiniciar progreso',
    'next-question': 'Siguiente',
    'start-exam': '▶ Iniciar examen',
    'next-exam': ' Nueva sesión',
    'submit': 'Enviar respuesta',
    'treble-clef': 'Clave de sol',
    'bass-clef': 'Clave de fa',
    'harmonic': 'Armónico (juntas)',
    'melodic': 'Melódico (una por una)',
    'chord-id': ' Acordes',
    'cadence-game': ' Cadencias',
    'all-grades': 'Todos los grados',
    'grade-1': 'Grado 1',
    'grade-2': 'Grado 2',
    'grade-3': 'Grado 3',
    'all-questions': 'Todos los temas',
    'form-q': 'Forma (AB/ABA)',
    'cadence-q': 'Cadencias',
    'timesig-q': 'Compases',
    'mastered': 'dominado',
    'card-of': 'Tarjeta',
    'of': 'de',

    // Loading
    'loading': 'Cargando sonidos del piano… ',
    'tap-skip': '(toca aquí para saltar)',

    // Mock exam
    'test-title': ' Examen de práctica',
    'test-grade': 'Grado',
    'test-question': 'Pregunta',
    'test-of': 'de',
    'test-score': 'Tu puntuación:',
    'test-hd': ' ¡Sobresaliente! ¡Extraordinario!',
    'test-hon': ' ¡Notable! ¡Bien hecho!',
    'test-credit': ' ¡Bien! ¡Buen trabajo!',
    'test-pass': ' Aprobado — ¡sigue practicando!',

    // Correct messages
    correct: [
      "¡Increíble, {name}! ",
      "¡Eres una estrella musical, {name}! ",
      "Brillante, {name}. Sigue así.",
      "¡Correcto, {name}! ¡Eres muy listo! ",
      "¡Viva {name}! ¡Tu profesor de música estaría orgulloso! ",
      "¡Correcto! ¡{name} está en racha hoy! ",
      "¡Sí sí sí! ¡Lo conseguiste, {name}! ",
      "¡{name}, eres increíble en esto! ",
      "¡Perfecto, {name}! ¡Vas a aprobar ese examen AMEB! ",
      "Excelente trabajo, {name}."
    ],
    wrong: [
      "¡Casi, {name}! Inténtalo de nuevo ",
      "No del todo, {name} — ¡tú puedes! ",
      "¡Ups! Inténtalo de nuevo, {name}, ¡creo en ti! ",
      "¡Casi lo tienes, {name}! Prueba otra vez ",
      "¡No te rindas, {name}, estás aprendiendo! "
    ]
  }
};

/* ── getCurrentLang ── */
window.getCurrentLang = window._getCurrentLang = function() {
  return localStorage.getItem('mm-lang') || localStorage.getItem('cc-lang') || 'en';
};

/* ── t() shortcut ── */
window.t = function(key) {
  var lang = getCurrentLang();
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) ||
         (TRANSLATIONS.en  && TRANSLATIONS.en[key])  || key;
};

/* ── applyTranslations ── */
window.applyTranslations = function() {
  var lang = getCurrentLang();
  document.querySelectorAll('[data-i18n]').forEach(function(el) {
    var key = el.getAttribute('data-i18n');
    var val = t(key);
    if (el.tagName === 'INPUT' && el.type !== 'button') el.placeholder = val;
    else el.textContent = val;
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  var langMap = { zh: 'zh-CN', es: 'es', en: 'en' };
  document.documentElement.lang = langMap[lang] || 'en';
  var sel = document.getElementById('lang-select');
  if (sel) sel.value = lang;
  var btn = document.getElementById('lang-toggle-btn');
  if (btn) btn.textContent = t('lang-toggle');
};

/* ── setLanguage ── */
window.setLanguage = function(lang) {
  localStorage.setItem('mm-lang', lang);
  localStorage.setItem('cc-lang', lang); // backward compat
  applyTranslations();
};

/* ── toggleLanguage (cycles en → zh → es → en) ── */
window.toggleLanguage = function() {
  var cycle = { en: 'zh', zh: 'es', es: 'en' };
  setLanguage(cycle[getCurrentLang()] || 'en');
};

/* Apply on load */
document.addEventListener('DOMContentLoaded', applyTranslations);
