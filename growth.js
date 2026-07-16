(function () {
  function clean(value, max) {
    return String(value || '').replace(/[^a-zA-Z0-9._:\/-]/g, '').slice(0, max);
  }
  function referralChannel() {
    if (!document.referrer) return '';
    try {
      var host = new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, '');
      if (!host || host === location.hostname.toLowerCase().replace(/^www\./, '')) return '';
      if (host === 'github.com') return 'github';
      if (host === 'reddit.com' || host.endsWith('.reddit.com')) return 'reddit';
      if (host === 'google.com' || host.startsWith('google.') || host.endsWith('.google.com') || host === 'bing.com' || host.endsWith('.bing.com') || host === 'duckduckgo.com') return 'organic-search';
      return clean('referral:' + host, 60);
    } catch (_) { return ''; }
  }
  function acquisition() {
    var params = new URLSearchParams(location.search);
    var campaignSource = clean(params.get('utm_source'), 60);
    var internalRef = clean(params.get('ref'), 60);
    var campaign = clean(params.get('utm_campaign'), 60);
    var content = clean(params.get('utm_content'), 60);
    var experiment = [campaign, content].filter(Boolean).join(':').slice(0, 60);
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem('mm-acquisition')) || {}; } catch (_) {}
    var incoming = campaignSource || (!saved.channel ? (internalRef || referralChannel()) : '');
    if (incoming) {
      saved = { channel: incoming, experiment: experiment, captured_at: new Date().toISOString() };
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
      event: eventName, visitor_id: visitorId(), page: extra.page || location.pathname,
      channel: source.channel !== 'direct' ? source.channel : (extra.channel || source.channel),
      experiment: source.experiment || extra.experiment || ''
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
