(function () {
  function answerMessage(value) {
    if (value === '3') return { correct:true, text:'Correct. A minim is worth 2 beats; the dot adds half of that value, making 3 beats.' };
    return { correct:false, text:'Not quite. Start with the minim’s 2 beats, then add half of its value.' };
  }

  window.mmLandingDemo = { answerMessage:answerMessage };

  window.addEventListener('DOMContentLoaded', function () {
    if (typeof window.mmTrack === 'function') window.mmTrack('landing_visit');
    var buttons = document.querySelectorAll('.sample-option');
    var result = document.getElementById('sample-result');
    var next = document.getElementById('sample-next');
    if (!buttons.length || !result || !next) return;
    var started = false, completed = false;

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        if (!started && typeof window.mmTrack === 'function') {
          window.mmTrack('practice_start', { page:'/landing', experiment:'inline-note-values-sample' }); started = true;
        }
        buttons.forEach(function (item) { item.setAttribute('aria-pressed', item === button ? 'true' : 'false'); });
        var answer = answerMessage(button.getAttribute('data-answer'));
        result.textContent = answer.text;
        if (answer.correct) {
          next.classList.add('visible');
          if (!completed && typeof window.mmTrack === 'function') {
            window.mmTrack('practice_complete', { page:'/landing', experiment:'inline-note-values-sample' }); completed = true;
          }
        } else {
          next.classList.remove('visible');
        }
      });
    });
  });
})();
