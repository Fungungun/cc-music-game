/* Music Maestro — engine/render/choice4.js
   DOM renderer for choice4 (and choice2) items. Phase 3.3, 2026-08-18.

   This is the first of the render/*.js layer deliberately deferred at
   the end of the previous session — built now with a real page
   (lesson.html) and a real CDP-driven browser test around it, not blind.
   Chosen first because it covers the most item types (11 of 17): every
   *-to-name/name-to-*, interval-id, triad-id, cadence-id, scale-id,
   scale-degree, term-meaning/term-name, value-to-beats/beats-to-value,
   time-signature-id, complete-the-bar, plus tone-semitone's choice2
   variant.

   Deliberately DOES NOT decide "is this correct" — that stays the
   caller's job (compare the clicked value to item.answer, then call
   engine/session.js's answerCurrent()). This module only renders and
   reports back what was clicked, via a plain callback, so it has no
   opinion about scoring, sessions, or the scheduler and is trivially
   testable in isolation. */

import { renderAbc } from '../notation.js';

const MIN_TOUCH_TARGET_PX = 44;

/* Renders `item` into `container` (an existing DOM element, cleared
   first) and calls `onAnswer(chosenValue)` exactly once, on the first
   click/keyboard-activation of any choice button. Does not disable the
   buttons or show correct/incorrect state itself — call
   showResult(container, item, given) separately once the caller has
   decided the outcome, so a caller can inject a delay (e.g. for a sound
   effect) between "answered" and "showing the result" if it wants to. */
export function renderChoice4(container, item, onAnswer) {
  container.innerHTML = '';
  container.setAttribute('role', 'group');
  container.setAttribute('aria-label', item.prompt);

  if (item.promptAbc) {
    const staffId = `mm-staff-${Math.random().toString(36).slice(2)}`;
    const staffDiv = document.createElement('div');
    staffDiv.id = staffId;
    staffDiv.className = 'mm-choice4-staff';
    container.appendChild(staffDiv);
    // renderAbc needs the div in the DOM first, which it now is.
    renderAbc(staffId, item.promptAbc, { scale: 2.5, staffwidth: 260 });
  }

  const promptEl = document.createElement('p');
  promptEl.className = 'mm-choice4-prompt';
  promptEl.textContent = item.prompt;
  container.appendChild(promptEl);

  const grid = document.createElement('div');
  grid.className = 'mm-choice4-grid';
  grid.setAttribute('role', 'radiogroup');
  container.appendChild(grid);

  let answered = false;
  for (const choice of item.choices) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mm-choice4-btn';
    btn.textContent = choice;
    btn.setAttribute('role', 'radio');
    btn.setAttribute('aria-checked', 'false');
    btn.style.minHeight = `${MIN_TOUCH_TARGET_PX}px`;
    btn.style.minWidth = `${MIN_TOUCH_TARGET_PX}px`;
    btn.dataset.value = choice;
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      onAnswer(choice);
    });
    grid.appendChild(btn);
  }

  const feedback = document.createElement('div');
  feedback.className = 'mm-choice4-feedback';
  feedback.setAttribute('aria-live', 'polite');
  feedback.setAttribute('role', 'status');
  container.appendChild(feedback);

  return { grid, feedback };
}

/* Applies correct/incorrect visual + screen-reader state after the
   caller has decided the outcome. Marks the chosen button and, if wrong,
   also marks the actually-correct one, so the learner sees both — the
   same pattern the old app's answer-btn correct-ans/wrong-ans classes
   used, kept because it's a sound, proven UX choice, not because it's
   old. Disables all buttons so a second click can't change the answer. */
export function showChoice4Result(container, item, given, explanation) {
  const grid = container.querySelector('.mm-choice4-grid');
  const feedback = container.querySelector('.mm-choice4-feedback');
  const correct = given === item.answer;

  for (const btn of grid.querySelectorAll('.mm-choice4-btn')) {
    btn.disabled = true;
    if (btn.dataset.value === item.answer) {
      btn.classList.add('mm-choice4-correct');
      btn.setAttribute('aria-checked', String(btn.dataset.value === given));
    }
    if (btn.dataset.value === given && !correct) {
      btn.classList.add('mm-choice4-wrong');
    }
  }

  feedback.textContent = explanation;
  feedback.classList.add(correct ? 'mm-choice4-feedback-correct' : 'mm-choice4-feedback-wrong');
  return correct;
}
