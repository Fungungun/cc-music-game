(function () {
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
    var params = new URLSearchParams(location.search);
    var body = {
      event: eventName, visitor_id: visitorId(), page: location.pathname,
      channel: extra.channel || params.get('utm_source') || params.get('ref') || 'direct',
      experiment: extra.experiment || params.get('utm_campaign') || ''
    };
    fetch('/api/events', { method: 'POST', headers: {'Content-Type':'application/json'},
      credentials: 'same-origin', keepalive: true, body: JSON.stringify(body) }).catch(function () {});
  };
})();
