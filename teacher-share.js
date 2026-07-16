(function () {
  var choices = {
    'note-reading': { path: 'note-namer', grade: '1', label: 'Grade 1 note reading' },
    'note-values': { path: 'note-values', grade: '1', label: 'Grade 1 note and rest values' },
    'key-signatures': { path: 'key-signatures', grade: '1', label: 'Grade 1 key signatures' },
    'aural-training': { path: 'aural-training', grade: '1', label: 'Grade 1 aural practice' },
    'daily-review': { path: 'daily-challenge', grade: '1', label: 'Grade 1 mixed daily review' },
    'grade2-diagnostic': { path: 'ameb-grade-2-piano-theory-practice', label: 'Free Grade 2 readiness diagnostic' },
    'general-knowledge': { path: 'ameb-piano-general-knowledge-questions', label: 'Free general-knowledge question sheet' },
    'weekly-checklist': { path: 'ameb-practice-checklist', label: 'Free weekly practice checklist' },
    'note-values-sheet': { path: 'ameb-grade-1-note-values-practice', label: 'Free Grade 1 note-values sheet' }
  };

  function build(key, origin) {
    var item = choices[key] || choices['note-reading'];
    var url = new URL(item.path, (origin || location.origin) + '/');
    if (item.grade) url.searchParams.set('grade', item.grade);
    url.searchParams.set('utm_source', 'teacher-share');
    url.searchParams.set('utm_medium', 'referral');
    url.searchParams.set('utm_campaign', 'practice-link');
    url.searchParams.set('utm_content', key);
    return {
      label: item.label,
      url: url.toString(),
      message: 'For this week, please try ' + item.label + ':\n' + url.toString() +
        '\n\nMusic Maestro is an independent practice resource. Follow the current syllabus and the priorities set in lessons.'
    };
  }

  window.mmTeacherShare = { choices: choices, build: build };

  document.addEventListener('DOMContentLoaded', function () {
    var select = document.getElementById('share-resource');
    var output = document.getElementById('share-url');
    var copy = document.getElementById('copy-practice-link');
    var share = document.getElementById('share-practice-link');
    if (!select || !output || !copy || !share) return;

    function current() {
      var result = build(select.value);
      output.value = result.url;
      return result;
    }
    function mark(button, label) {
      var previous = button.textContent;
      button.textContent = label;
      setTimeout(function () { button.textContent = previous; }, 2200);
    }
    function track(key) {
      if (typeof window.mmTrack === 'function') {
        window.mmTrack('resource_share', { channel: 'teacher-share', experiment: 'practice-link:' + key });
      }
    }
    function fallbackCopy(text) {
      var area = document.createElement('textarea');
      area.value = text; area.setAttribute('readonly', '');
      area.style.position = 'fixed'; area.style.opacity = '0';
      document.body.appendChild(area); area.select();
      var copied = document.execCommand('copy');
      document.body.removeChild(area);
      return copied;
    }

    select.addEventListener('change', current);
    copy.addEventListener('click', function () {
      var result = current();
      var operation = navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(result.message).then(function () { return true; })
        : Promise.resolve(fallbackCopy(result.message));
      operation.then(function (copied) {
        if (!copied) throw new Error('copy failed');
        mark(copy, 'Copied'); track(select.value);
      }).catch(function () { mark(copy, 'Select and copy the link'); output.select(); });
    });

    if (!navigator.share) share.hidden = true;
    share.addEventListener('click', function () {
      var result = current();
      navigator.share({ title: result.label, text: result.message }).then(function () {
        track(select.value);
      }).catch(function () {});
    });
    current();
  });
})();
