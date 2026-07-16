/* =============================================
   Music Maestro — Auth Client (auth.js)
   Talks to Cloudflare Pages Functions (/api/*).
   Load BEFORE game.js on every page.
   Public surface (kept identical to the old supabase.js):
     mmIsSignedIn, mmGetUser, mmGetProfile, mmHasFullAccess,
     mmSignIn, mmSignUp, mmSignOut, mmSyncProgress,
     showAuthModal, showAccountMenu, 'mm-auth-changed' event.
   ============================================= */

/* ── Global state ── */
window._mmUser    = null;   // { id, email }
window._mmProfile = null;   // { name, grade, is_unlocked }

function _mmApi(path, method, body) {
  return fetch('/api/' + path, {
    method: method || 'GET',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined,
  }).then(function(resp) {
    return resp.json().then(function(data) {
      return { status: resp.status, data: data };
    });
  }).catch(function() {
    return { status: 0, data: { error: 'Network error — check your connection.' } };
  });
}

function _mmApplyAuth(data) {
  window._mmUser    = data && data.user    ? data.user    : null;
  window._mmProfile = data && data.profile ? data.profile : null;
  if (window._mmProfile) {
    /* Cache for fast access on next load; profile is the source of truth */
    if (window._mmProfile.is_unlocked) {
      localStorage.setItem('mm-unlocked', 'true');
    } else {
      localStorage.removeItem('mm-unlocked');
    }
    if (window._mmProfile.name && !localStorage.getItem('player-name')) {
      localStorage.setItem('player-name', window._mmProfile.name);
    }
  }
  _mmFireAuthEvent();
}

function _mmFireAuthEvent() {
  window.dispatchEvent(new CustomEvent('mm-auth-changed', {
    detail: { user: window._mmUser, profile: window._mmProfile }
  }));
}

/* ── Public API ── */

function mmIsSignedIn() {
  return !!window._mmUser;
}

function mmGetUser() {
  return window._mmUser;
}

function mmGetProfile() {
  return window._mmProfile;
}

/* Access check: server profile is the source of truth once loaded;
   localStorage acts only as a fast cache before /api/auth/me returns. */
function mmHasFullAccess() {
  if (window._mmProfile) return !!window._mmProfile.is_unlocked;
  return localStorage.getItem('mm-unlocked') === 'true';
}

async function mmSignIn(email, password) {
  var r = await _mmApi('auth/signin', 'POST', { email: email, password: password });
  if (r.status !== 200) return { error: { message: r.data.error || 'Sign in failed.' } };
  _mmApplyAuth(r.data);
  return { data: r.data };
}

async function mmSignUp(email, password, name) {
  var attribution = typeof mmAttribution === 'function' ? mmAttribution() : {};
  var r = await _mmApi('auth/signup', 'POST', {
    email: email, password: password, name: name || '',
    visitor_id: attribution.visitor_id || '', channel: attribution.channel || 'direct',
    experiment: attribution.experiment || ''
  });
  if (r.status !== 200) return { error: { message: r.data.error || 'Sign up failed.' } };
  if (name) localStorage.setItem('player-name', String(name).trim().slice(0, 20));
  _mmApplyAuth(r.data);
  return { data: r.data };
}

async function mmSignOut() {
  await _mmApi('auth/signout', 'POST', {});
  window._mmUser = null;
  window._mmProfile = null;
  /* Clear cached values that belong to the signed-in user */
  localStorage.removeItem('mm-unlocked');
  localStorage.removeItem('player-name');
  _mmFireAuthEvent();
}

/* ── Progress sync ── */
/* Fire-and-forget: localStorage is primary, the server copy is backup */
function mmSyncProgress(module, concept, isCorrect) {
  if (!mmIsSignedIn()) return;
  _mmApi('progress', 'POST', { module: module, concept: concept, correct: !!isCorrect });
}

/* ── Auth modal ── */
function showAuthModal(opts) {
  opts = opts || {};
  var onSuccess  = opts.onSuccess;
  var allowGuest = opts.allowGuest !== false;
  var initMode   = opts.mode || 'signin';

  var existing = document.getElementById('mm-auth-modal');
  if (existing) {
    existing.style.display = 'flex';
    window._mmAuthOnSuccess = onSuccess;
    _mmAuthTab(initMode);
    return;
  }

  var modal = document.createElement('div');
  modal.id = 'mm-auth-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.62);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';

  var guestBtn = allowGuest
    ? '<button onclick="_mmAuthGuest()" style="display:block;width:100%;background:none;border:2px solid #ddd;border-radius:14px;padding:12px;font-size:0.93rem;font-weight:600;cursor:pointer;color:#888;margin-bottom:8px;box-sizing:border-box;">Continue without account</button>'
    : '';

  var inputStyle = 'width:100%;box-sizing:border-box;border:2px solid #FFB7C5;border-radius:12px;padding:11px 14px;font-size:1rem;outline:none;font-family:inherit;';

  modal.innerHTML =
    '<div style="background:white;border-radius:24px;padding:32px 28px;max-width:380px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,0.25);">' +

      /* ── Main sign-in / sign-up panel ── */
      '<div id="mm-auth-main">' +
        '<div style="text-align:center;margin-bottom:18px;">' +
          '<div style="font-size:3rem;margin-bottom:6px;">🎹</div>' +
          '<h2 id="mm-auth-title" style="margin:0 0 4px;color:#1a2233;font-size:1.4rem;font-weight:900;">Sign in</h2>' +
          '<p  id="mm-auth-sub"   style="color:#888;font-size:0.87rem;margin:0;">Save your progress across devices</p>' +
        '</div>' +

        /* Tabs */
        '<div style="display:flex;background:#f5f5f5;border-radius:12px;padding:4px;margin-bottom:18px;">' +
          '<button id="mm-tab-signin" onclick="_mmAuthTab(\'signin\')" style="flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:white;color:#333;box-shadow:0 1px 4px rgba(0,0,0,0.08);">Sign in</button>' +
          '<button id="mm-tab-signup" onclick="_mmAuthTab(\'signup\')" style="flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:transparent;color:#aaa;box-shadow:none;">Create account</button>' +
        '</div>' +

        /* Fields */
        '<div id="mm-auth-name-row" style="display:none;margin-bottom:10px;">' +
          '<input id="mm-auth-name" type="text" placeholder="Your name" maxlength="20" style="' + inputStyle + '" />' +
        '</div>' +
        '<div style="margin-bottom:10px;">' +
          '<input id="mm-auth-email" type="email" placeholder="Email address" style="' + inputStyle + '" />' +
        '</div>' +
        '<div id="mm-auth-pass-row" style="margin-bottom:4px;">' +
          '<input id="mm-auth-pass" type="password" placeholder="Password" style="' + inputStyle + '" onkeydown="if(event.key===\'Enter\')_mmAuthSubmit()" />' +
        '</div>' +
        '<div id="mm-auth-forgot-row" style="text-align:right;margin-bottom:14px;">' +
          '<button onclick="_mmAuthShowForgot()" style="background:none;border:none;color:#FF8FAB;font-size:0.82rem;font-weight:700;cursor:pointer;padding:4px 0;font-family:inherit;">Forgot password?</button>' +
        '</div>' +

        '<div id="mm-auth-err" style="display:none;border-radius:10px;padding:10px 14px;font-size:0.87rem;margin-bottom:12px;"></div>' +

        '<button id="mm-auth-btn" onclick="_mmAuthSubmit()" style="display:block;width:100%;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:14px;font-size:1.05rem;font-weight:800;cursor:pointer;margin-bottom:8px;box-sizing:border-box;font-family:inherit;">Sign in 🎵</button>' +
        guestBtn +
        '<button onclick="document.getElementById(\'mm-auth-modal\').style.display=\'none\'" style="display:block;width:100%;background:none;border:none;color:#ccc;cursor:pointer;font-size:0.84rem;padding:4px;font-family:inherit;">✕ Close</button>' +
      '</div>' +

      /* ── Forgot password panel (hidden by default) ── */
      '<div id="mm-auth-forgot-panel" style="display:none;">' +
        '<div style="text-align:center;margin-bottom:20px;">' +
          '<div style="font-size:2.5rem;margin-bottom:8px;">🔑</div>' +
          '<h2 style="margin:0 0 4px;color:#1a2233;font-size:1.3rem;font-weight:900;">Reset password</h2>' +
          '<p style="color:#888;font-size:0.87rem;margin:0;">We\'ll send a reset link to your email</p>' +
        '</div>' +
        '<div style="margin-bottom:16px;">' +
          '<input id="mm-reset-email" type="email" placeholder="Your email address" style="' + inputStyle + '" onkeydown="if(event.key===\'Enter\')_mmAuthSendReset()" />' +
        '</div>' +
        '<div id="mm-reset-msg" style="display:none;border-radius:10px;padding:10px 14px;font-size:0.87rem;margin-bottom:12px;"></div>' +
        '<button id="mm-reset-btn" onclick="_mmAuthSendReset()" style="display:block;width:100%;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:14px;font-size:1.05rem;font-weight:800;cursor:pointer;margin-bottom:10px;box-sizing:border-box;font-family:inherit;">Send reset link 📧</button>' +
        '<button onclick="_mmAuthShowMain()" style="display:block;width:100%;background:none;border:none;color:#aaa;cursor:pointer;font-size:0.85rem;padding:4px;font-family:inherit;">← Back to sign in</button>' +
      '</div>' +

    '</div>';

  document.body.appendChild(modal);
  modal.addEventListener('click', function(e) {
    if (e.target === modal) modal.style.display = 'none';
  });

  window._mmAuthOnSuccess = onSuccess;
  _mmAuthTab(initMode);
}

function _mmAuthTab(mode) {
  window._mmAuthMode = mode;
  var isSignup = mode === 'signup';

  var active   = 'flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:white;color:#333;box-shadow:0 1px 4px rgba(0,0,0,0.08);font-family:inherit;';
  var inactive = 'flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:transparent;color:#aaa;box-shadow:none;font-family:inherit;';

  var siBtn = document.getElementById('mm-tab-signin');
  var suBtn = document.getElementById('mm-tab-signup');
  if (siBtn) siBtn.style.cssText = isSignup ? inactive : active;
  if (suBtn) suBtn.style.cssText = isSignup ? active   : inactive;

  var nameRow   = document.getElementById('mm-auth-name-row');
  var forgotRow = document.getElementById('mm-auth-forgot-row');
  if (nameRow)   nameRow.style.display   = isSignup ? 'block' : 'none';
  if (forgotRow) forgotRow.style.display = isSignup ? 'none'  : 'block';

  var title = document.getElementById('mm-auth-title');
  var sub   = document.getElementById('mm-auth-sub');
  var btn   = document.getElementById('mm-auth-btn');
  if (title) title.textContent = isSignup ? 'Create account' : 'Sign in';
  if (sub)   sub.textContent   = isSignup ? 'Free · Sync progress across devices' : 'Save your progress across devices';
  if (btn)   btn.textContent   = isSignup ? 'Create account 🎹' : 'Sign in 🎵';

  var errEl = document.getElementById('mm-auth-err');
  if (errEl) errEl.style.display = 'none';
}

function _mmAuthError(msg) {
  var el = document.getElementById('mm-auth-err');
  if (!el) return;
  el.textContent = msg;
  el.style.cssText = 'display:block;background:#FFF0F0;border:1px solid #FFCDD2;border-radius:10px;padding:10px 14px;font-size:0.87rem;color:#C62828;margin-bottom:12px;';
}

function _mmAuthShowForgot() {
  var main   = document.getElementById('mm-auth-main');
  var forgot = document.getElementById('mm-auth-forgot-panel');
  if (main)   main.style.display   = 'none';
  if (forgot) forgot.style.display = 'block';
  var emailInput = document.getElementById('mm-auth-email');
  var resetInput = document.getElementById('mm-reset-email');
  if (resetInput && emailInput) resetInput.value = emailInput.value;
  var msg = document.getElementById('mm-reset-msg');
  if (msg) msg.style.display = 'none';
}

function _mmAuthShowMain() {
  var main   = document.getElementById('mm-auth-main');
  var forgot = document.getElementById('mm-auth-forgot-panel');
  if (main)   main.style.display   = 'block';
  if (forgot) forgot.style.display = 'none';
}

async function _mmAuthSendReset() {
  var email = (document.getElementById('mm-reset-email') || {}).value || '';
  var btn   = document.getElementById('mm-reset-btn');
  var msg   = document.getElementById('mm-reset-msg');

  function show(text, isError) {
    if (!msg) return;
    msg.textContent = text;
    msg.style.cssText = isError
      ? 'display:block;background:#FFF0F0;border:1px solid #FFCDD2;border-radius:10px;padding:10px 14px;font-size:0.87rem;color:#C62828;margin-bottom:12px;'
      : 'display:block;background:#F0FFF4;border:1px solid #A5D6A7;border-radius:10px;padding:10px 14px;font-size:0.87rem;color:#2E7D32;margin-bottom:12px;';
  }

  if (!email) { show('Please enter your email address.', true); return; }
  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  if (msg) msg.style.display = 'none';

  var r = await _mmApi('auth/reset-request', 'POST', { email: email });

  if (btn) { btn.disabled = false; btn.textContent = 'Send reset link 📧'; }

  if (r.status !== 200) {
    show(r.data.error || 'Something went wrong. Try again.', true);
  } else {
    show('✅ Reset link sent! Check your inbox (and spam folder).', false);
    if (btn) btn.style.display = 'none';
  }
}

async function _mmAuthSubmit() {
  var mode  = window._mmAuthMode || 'signin';
  var email = (document.getElementById('mm-auth-email') || {}).value || '';
  var pass  = (document.getElementById('mm-auth-pass')  || {}).value || '';
  var name  = (document.getElementById('mm-auth-name')  || {}).value || '';
  var btn   = document.getElementById('mm-auth-btn');

  if (!email || !pass) { _mmAuthError('Please enter your email and password.'); return; }
  if (mode === 'signup' && !name) { _mmAuthError('Please enter your name.'); return; }

  if (btn) { btn.disabled = true; btn.textContent = '...'; }
  var errEl = document.getElementById('mm-auth-err');
  if (errEl) errEl.style.display = 'none';

  var result = mode === 'signup'
    ? await mmSignUp(email, pass, name)
    : await mmSignIn(email, pass);

  if (btn) btn.disabled = false;

  if (result.error) {
    _mmAuthError(result.error.message || 'Something went wrong. Please try again.');
    if (btn) btn.textContent = mode === 'signup' ? 'Create account 🎹' : 'Sign in 🎵';
    return;
  }

  /* Success — close modal */
  var modal = document.getElementById('mm-auth-modal');
  if (modal) modal.remove();
  if (typeof window._mmAuthOnSuccess === 'function') window._mmAuthOnSuccess();
}

function _mmAuthGuest() {
  var modal = document.getElementById('mm-auth-modal');
  if (modal) modal.remove();
}

/* ── Account dropdown (shown when signed in) ── */
function showAccountMenu(anchorEl) {
  var existing = document.getElementById('mm-account-menu');
  if (existing) { existing.remove(); return; }

  var user    = mmGetUser();
  var profile = mmGetProfile();
  if (!user) return;

  var email   = user.email || '';
  var name    = (profile && profile.name) || localStorage.getItem('player-name') || '';
  var unlocked = profile && profile.is_unlocked;

  var menu = document.createElement('div');
  menu.id = 'mm-account-menu';
  var rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: 0, bottom: 40 };
  menu.style.cssText = 'position:fixed;top:' + (rect.bottom + 8) + 'px;right:16px;background:white;border-radius:16px;box-shadow:0 8px 32px rgba(0,0,0,0.18);padding:16px;min-width:200px;z-index:5000;';
  menu.innerHTML =
    '<div style="font-weight:700;color:#333;margin-bottom:2px;">' + (name || '🎹 Music Maestro') + '</div>' +
    '<div style="font-size:0.8rem;color:#aaa;margin-bottom:12px;">' + email + '</div>' +
    '<div style="font-size:0.85rem;padding:6px 0;border-top:1px solid #f0f0f0;color:' + (unlocked ? '#4CAF50' : '#FF8FAB') + ';font-weight:700;">' +
      (unlocked ? '✅ Full access unlocked' : '🔒 Grade 1 (free)') +
    '</div>' +
    (unlocked ? '' :
      '<button onclick="document.getElementById(\'mm-account-menu\').remove();if(typeof gotoPayment===\'function\')gotoPayment();" style="display:block;width:100%;margin-top:10px;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:10px;padding:8px 12px;font-size:0.88rem;font-weight:800;cursor:pointer;box-sizing:border-box;">Unlock Grade 2 &amp; 3 →</button>'
    ) +
    '<button onclick="document.getElementById(\'mm-account-menu\').remove();_mmChangePassword();" style="display:block;width:100%;margin-top:10px;background:none;border:1px solid #eee;border-radius:10px;padding:8px;font-size:0.85rem;color:#666;cursor:pointer;font-family:inherit;">🔑 Change password</button>' +
    '<button onclick="mmSignOut().then(function(){location.reload();})" style="display:block;width:100%;margin-top:6px;background:none;border:1px solid #eee;border-radius:10px;padding:8px;font-size:0.85rem;color:#999;cursor:pointer;font-family:inherit;">Sign out</button>' +
    '<button onclick="document.getElementById(\'mm-account-menu\').remove()" style="display:block;width:100%;margin-top:4px;background:none;border:none;color:#ccc;font-size:0.8rem;cursor:pointer;font-family:inherit;">✕ Close</button>';
  document.body.appendChild(menu);

  /* Close on outside click */
  setTimeout(function() {
    document.addEventListener('click', function closeMenu(e) {
      var m = document.getElementById('mm-account-menu');
      if (m && !m.contains(e.target) && e.target !== anchorEl) {
        m.remove();
        document.removeEventListener('click', closeMenu);
      }
    });
  }, 10);
}

/* ── Change password (sends reset email to signed-in user) ── */
async function _mmChangePassword() {
  var user = mmGetUser();
  if (!user || !user.email) return;

  var r = await _mmApi('auth/reset-request', 'POST', { email: user.email });
  if (r.status !== 200) {
    alert('Could not send reset email: ' + (r.data.error || 'unknown error'));
  } else {
    alert('📧 Password reset link sent to ' + user.email + '\n\nCheck your inbox and follow the link to set a new password.');
  }
}

/* ── Bootstrap: restore session from the HttpOnly cookie ── */
(function() {
  _mmApi('auth/me', 'GET').then(function(r) {
    if (r.status === 200 && r.data && r.data.user) {
      _mmApplyAuth(r.data);
    } else {
      /* Not signed in: fire so UI can initialise. Keep the localStorage
         unlock cache — it may belong to a guest purchase flow — but only
         a signed-in profile can (re)assert it. */
      _mmFireAuthEvent();
    }
  });
})();
