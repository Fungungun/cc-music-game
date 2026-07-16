(function () {
  function clean(value, max) {
    return String(value || '').replace(/[^a-zA-Z0-9._:\/-]/g, '').slice(0, max);
  }
  function acquisition() {
    var params = new URLSearchParams(location.search);
    var incoming = clean(params.get('utm_source') || params.get('ref'), 60);
    var campaign = clean(params.get('utm_campaign'), 60);
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('mm-acquisition')) || {}; } catch (_) {}
    if (incoming) {
      saved = { channel: incoming, experiment: campaign, captured_at: new Date().toISOString() };
      localStorage.setItem('mm-acquisition', JSON.stringify(saved));
    }
    return { channel: saved.channel || 'direct', experiment: saved.experiment || '' };
  }
  function visitorId() {
    var id = localStorage.getItem('mm-visitor-id');
    if (!/^[0-9a-f]{32}$/.test(id || '')) {
      var bytes = new Uint8Array(16); crypto.getRandomValues(bytes);
      id = Array.from(bytes, function (b) { return b.toString(16).padStart(2, '0'); }).join('');
      localStorage.setItem('mm-visitor-id', id);
    }
    return id;
  }
  window.mmTrack = function (eventName, extra) {
    extra = extra || {};
    var source = acquisition();
    var body = {
      event: eventName, visitor_id: visitorId(), page: location.pathname,
      channel: extra.channel || source.channel,
      experiment: extra.experiment || source.experiment
    };
    fetch('/api/events', { method: 'POST', headers: {'Content-Type':'application/json'},
      credentials: 'same-origin', keepalive: true, body: JSON.stringify(body) }).catch(function () {});
  };
  window.mmAttribution = function () {
    var source = acquisition();
    return { visitor_id: visitorId(), channel: source.channel, experiment: source.experiment };
  };
  acquisition();
})();
