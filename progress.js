(function () {
  var LABELS = {
    'note-namer':'Note reading', 'scale-builder':'Scales',
    'key-signatures':'Key signatures', 'note-values':'Note and rest values',
    'interval-quiz':'Intervals', 'chord-game':'Chords and cadences',
    'rhythm-trainer':'Rhythm and time', 'terms-flashcards':'Musical terms',
    'aural-training':'Aural training', 'form-detective':'Musical form',
    'mock-exam':'Mixed review', 'daily-challenge':'Daily review'
  };

  function labelFor(module) { return LABELS[module] || module.replace(/-/g, ' '); }
  function quality(accuracy, total) {
    if (total < 5) return 'Early sample';
    if (accuracy >= 80) return 'Secure in recent practice';
    if (accuracy >= 60) return 'Developing';
    return 'Needs review';
  }
  function summarize(mastery) {
    var byModule = {}, totalCorrect = 0, totalWrong = 0, lastSeen = 0;
    Object.keys(mastery || {}).forEach(function (key) {
      var split = key.indexOf(':');
      if (split < 1) return;
      var module = key.slice(0, split), concept = key.slice(split + 1), value = mastery[key] || {};
      var correct = Math.max(0, Number(value.correct) || 0);
      var wrong = Math.max(0, Number(value.wrong) || 0);
      var seen = Math.max(0, Number(value.lastSeen) || 0);
      if (!byModule[module]) byModule[module] = { module:module, correct:0, wrong:0, lastSeen:0 };
      byModule[module].correct += correct; byModule[module].wrong += wrong;
      byModule[module].lastSeen = Math.max(byModule[module].lastSeen, seen);
      totalCorrect += correct; totalWrong += wrong; lastSeen = Math.max(lastSeen, seen);
    });
    var modules = Object.keys(byModule).map(function (key) {
      var row = byModule[key], total = row.correct + row.wrong;
      row.total = total; row.accuracy = total ? Math.round(row.correct / total * 100) : 0;
      row.label = labelFor(row.module); row.quality = quality(row.accuracy, total); return row;
    }).filter(function (row) { return row.total > 0; }).sort(function (a,b) { return a.label.localeCompare(b.label); });

    var focus = Object.keys(mastery || {}).map(function (key) {
      var split = key.indexOf(':'); if (split < 1) return null;
      var value = mastery[key] || {}, correct = Math.max(0, Number(value.correct) || 0), wrong = Math.max(0, Number(value.wrong) || 0), total = correct + wrong;
      if (total < 3) return null;
      var module = key.slice(0, split);
      return { module:module, moduleLabel:labelFor(module), concept:key.slice(split + 1), total:total, accuracy:Math.round(correct / total * 100) };
    }).filter(Boolean).filter(function (row) { return row.accuracy < 80; }).sort(function (a,b) { return a.accuracy - b.accuracy || b.total - a.total; }).slice(0,5);

    var total = totalCorrect + totalWrong;
    return { total:total, accuracy:total ? Math.round(totalCorrect / total * 100) : null, lastSeen:lastSeen, modules:modules, focus:focus };
  }
  function recentLabel(timestamp, now) {
    if (!timestamp) return 'Not yet';
    var then = new Date(timestamp), today = new Date(now || Date.now());
    if (then.toDateString() === today.toDateString()) return 'Today';
    var yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    if (then.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return then.toLocaleDateString('en-AU', { day:'numeric', month:'short' });
  }
  function appendText(parent, className, text) {
    var node = document.createElement('div'); node.className = className; node.textContent = text; parent.appendChild(node); return node;
  }
  function renderModule(row) {
    var item = document.createElement('div'); item.className = 'module-row';
    var name = document.createElement('div'); name.className = 'module-name';
    var link = document.createElement('a'); link.href = row.module + '.html'; link.textContent = row.label; name.appendChild(link);
    appendText(name, 'module-sample', row.total + (row.total === 1 ? ' answer' : ' answers'));
    var meter = document.createElement('div'); meter.className = 'module-accuracy';
    var track = document.createElement('div'); track.className = 'accuracy-track'; track.setAttribute('role','img'); track.setAttribute('aria-label', row.accuracy + ' percent accuracy');
    var fill = document.createElement('div'); fill.className = 'accuracy-fill'; fill.style.width = row.accuracy + '%'; track.appendChild(fill); meter.appendChild(track);
    appendText(meter, 'accuracy-label', row.quality);
    appendText(item, 'accuracy-value', row.accuracy + '%'); item.insertBefore(meter, item.lastChild); item.insertBefore(name, item.firstChild);
    return item;
  }
  function summaryText(summary, streak) {
    var lines = ['Music Maestro practice record', 'Answers: ' + summary.total, 'Overall accuracy: ' + (summary.accuracy === null ? 'not available' : summary.accuracy + '%'), 'Current day streak: ' + streak];
    summary.modules.forEach(function (row) { lines.push(row.label + ': ' + row.accuracy + '% from ' + row.total + ' answers — ' + row.quality); });
    if (summary.focus.length) { lines.push('Next lesson focus: ' + summary.focus.map(function (row) { return row.concept + ' (' + row.moduleLabel + ')'; }).join('; ')); }
    lines.push('Practice data from this device; not an exam prediction.');
    return lines.join('\n');
  }
  function fallbackCopy(text) {
    var field = document.createElement('textarea');
    field.value = text; field.setAttribute('readonly', ''); field.style.position = 'fixed'; field.style.opacity = '0';
    document.body.appendChild(field); field.select();
    var copied = false; try { copied = document.execCommand('copy'); } catch (_) {}
    document.body.removeChild(field); return copied;
  }

  window.mmProgress = { summarize:summarize, recentLabel:recentLabel, quality:quality, summaryText:summaryText };
  document.addEventListener('DOMContentLoaded', function () {
    var mastery = {}; try { mastery = JSON.parse(localStorage.getItem('mm-mastery')) || {}; } catch (_) {}
    var summary = summarize(mastery), streakData = typeof getDayStreak === 'function' ? getDayStreak() : {days:0}, streak = Number(streakData.days) || 0;
    document.getElementById('stat-streak').textContent = streak;
    document.getElementById('stat-answered').textContent = summary.total;
    document.getElementById('stat-accuracy').textContent = summary.accuracy === null ? '–' : summary.accuracy + '%';
    document.getElementById('stat-recent').textContent = recentLabel(summary.lastSeen);
    if (!summary.modules.length) document.getElementById('empty-state').hidden = false;
    else {
      document.getElementById('record-content').hidden = false;
      var modules = document.getElementById('modules-section'); summary.modules.forEach(function (row) { modules.appendChild(renderModule(row)); });
      if (summary.focus.length) {
        document.getElementById('focus-section').hidden = false; var focus = document.getElementById('focus-items');
        summary.focus.forEach(function (row) {
          var item = document.createElement('div'); item.className = 'focus-item';
          var name = appendText(item, 'focus-name', row.concept); appendText(name, 'focus-context', row.moduleLabel + ' · ' + row.total + ' answers'); appendText(item, 'focus-score', row.accuracy + '%'); focus.appendChild(item);
        });
      }
    }
    document.getElementById('copy-summary').addEventListener('click', function () {
      var button = this, text = summaryText(summary, streak);
      var operation = navigator.clipboard && navigator.clipboard.writeText ? navigator.clipboard.writeText(text) : Promise.reject();
      function confirmCopy() { button.textContent = 'Copied'; setTimeout(function () { button.textContent = 'Copy summary'; }, 2200); }
      operation.then(confirmCopy).catch(function () { if (fallbackCopy(text)) confirmCopy(); else button.textContent = 'Select and copy unavailable'; });
    });
  });
})();
