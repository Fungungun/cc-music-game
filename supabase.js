/* =============================================
   Music Maestro — Supabase Client (supabase.js)
   Must be loaded AFTER the Supabase CDN script
   and BEFORE game.js on every page.
   ============================================= */

var MM_SUPABASE_URL = 'https://esdkipxtmfuecubjjcoa.supabase.co';
var MM_SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVzZGtpcHh0bWZ1ZWN1YmpqY29hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODc4MDQsImV4cCI6MjA5MDk2MzgwNH0.vgBd3Wx_c16ra-kryT7Y7q0QpFE_Nf96jcqy3p8_Kl4';

/* ── Global state ── */
window._mmDb      = null;   // Supabase client
window._mmSession = null;   // Current auth session
window._mmProfile = null;   // Cached profiles row

/* ── Init (called once SDK is ready) ── */
function _mmInitClient() {
  if (window._mmDb) return;
  try {
    window._mmDb = window.supabase.createClient(MM_SUPABASE_URL, MM_SUPABASE_KEY);
  } catch(e) {
    console.warn('Music Maestro: Supabase client init failed', e);
    return;
  }

  /* Listen for auth state changes (sign in, sign out, token refresh) */
  window._mmDb.auth.onAuthStateChange(function(event, session) {
    window._mmSession = session;
    if (session) {
      _mmLoadProfile(session.user.id);
    } else {
      window._mmProfile = null;
      _mmFireAuthEvent();
    }
  });

  /* Restore existing session (e.g. page reload) */
  window._mmDb.auth.getSession().then(function(r) {
    var session = r && r.data && r.data.session;
    if (session) {
      window._mmSession = session;
      _mmLoadProfile(session.user.id);
    } else {
      _mmFireAuthEvent(); // no session — still fire so UI can initialise
    }
  }).catch(function() { _mmFireAuthEvent(); });
}

function _mmLoadProfile(userId) {
  if (!window._mmDb) return;
  window._mmDb
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    .then(function(r) {
      if (r && r.data) {
        window._mmProfile = r.data;
        /* Sync unlock status to localStorage for fast access on next load */
        if (r.data.is_unlocked) {
          localStorage.setItem('mm-unlocked', 'true');
        }
        /* Sync name if not already set locally */
        if (r.data.name && !localStorage.getItem('player-name')) {
          localStorage.setItem('player-name', r.data.name);
        }
      }
      _mmFireAuthEvent();
    })
    .catch(function() { _mmFireAuthEvent(); });
}

function _mmFireAuthEvent() {
  window.dispatchEvent(new CustomEvent('mm-auth-changed', {
    detail: {
      user:    window._mmSession && window._mmSession.user,
      profile: window._mmProfile
    }
  }));
}

/* ── Public API ── */

function mmIsSignedIn() {
  return !!(window._mmSession && window._mmSession.user);
}

function mmGetUser() {
  return window._mmSession && window._mmSession.user;
}

function mmGetProfile() {
  return window._mmProfile;
}

/* Source-of-truth access check: Supabase profile OR localStorage cache */
function mmHasFullAccess() {
  if (window._mmProfile && window._mmProfile.is_unlocked) return true;
  return localStorage.getItem('mm-unlocked') === 'true';
}

async function mmSignIn(email, password) {
  if (!window._mmDb) return { error: { message: 'Not connected' } };
  return await window._mmDb.auth.signInWithPassword({ email: email, password: password });
}

async function mmSignUp(email, password, name) {
  if (!window._mmDb) return { error: { message: 'Not connected' } };
  return await window._mmDb.auth.signUp({
    email: email,
    password: password,
    options: { data: { name: name || '' } }
  });
}

async function mmSignOut() {
  if (!window._mmDb) return;
  await window._mmDb.auth.signOut();
  window._mmSession = null;
  window._mmProfile = null;
}

/* ── Progress sync ── */
/* Fire-and-forget: localStorage is primary, Supabase is backup */
function mmSyncProgress(module, concept, isCorrect) {
  if (!window._mmDb || !window._mmSession) return;
  var userId = window._mmSession.user.id;

  /* Try update first, then insert */
  window._mmDb
    .from('progress')
    .select('id, correct, wrong')
    .eq('user_id', userId)
    .eq('module', module)
    .eq('concept', concept)
    .single()
    .then(function(r) {
      if (r && r.data) {
        window._mmDb
          .from('progress')
          .update({
            correct:   r.data.correct + (isCorrect ? 1 : 0),
            wrong:     r.data.wrong   + (isCorrect ? 0 : 1),
            last_seen: new Date().toISOString()
          })
          .eq('id', r.data.id)
          .then(function() {});
      } else {
        window._mmDb
          .from('progress')
          .insert({
            user_id: userId,
            module:  module,
            concept: concept,
            correct: isCorrect ? 1 : 0,
            wrong:   isCorrect ? 0 : 1
          })
          .then(function() {});
      }
    })
    .catch(function() {});
}

/* ── Mark profile as paid/unlocked (called from unlocked.html) ── */
async function mmMarkUnlocked() {
  if (!window._mmDb || !window._mmSession) return false;
  var userId = window._mmSession.user.id;
  var r = await window._mmDb
    .from('profiles')
    .update({ is_unlocked: true })
    .eq('id', userId);
  if (!r.error) {
    if (window._mmProfile) window._mmProfile.is_unlocked = true;
    localStorage.setItem('mm-unlocked', 'true');
    return true;
  }
  return false;
}

/* ── Auth modal ── */
function showAuthModal(opts) {
  opts = opts || {};
  var onSuccess  = opts.onSuccess;
  var allowGuest = opts.allowGuest !== false;
  var initMode   = opts.mode || 'signin';

  var existing = document.getElementById('mm-auth-modal');
  if (existing) { existing.style.display = 'flex'; return; }

  var modal = document.createElement('div');
  modal.id = 'mm-auth-modal';
  modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.62);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;';

  var guestBtn = allowGuest
    ? '<button onclick="_mmAuthGuest()" style="display:block;width:100%;background:none;border:2px solid #ddd;border-radius:14px;padding:12px;font-size:0.93rem;font-weight:600;cursor:pointer;color:#888;margin-bottom:8px;box-sizing:border-box;">Continue without account</button>'
    : '';

  modal.innerHTML =
    '<div style="background:white;border-radius:24px;padding:32px 28px;max-width:380px;width:100%;box-shadow:0 16px 48px rgba(0,0,0,0.25);">' +
      '<div style="text-align:center;margin-bottom:18px;">' +
        '<div style="font-size:3rem;margin-bottom:6px;">🎹</div>' +
        '<h2 id="mm-auth-title" style="margin:0 0 4px;color:#333;font-size:1.4rem;">Sign in</h2>' +
        '<p  id="mm-auth-sub"   style="color:#888;font-size:0.87rem;margin:0;">Save your progress across devices</p>' +
      '</div>' +

      /* Tabs */
      '<div style="display:flex;background:#f5f5f5;border-radius:12px;padding:4px;margin-bottom:18px;">' +
        '<button id="mm-tab-signin" onclick="_mmAuthTab(\'signin\')" style="flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:white;color:#333;box-shadow:0 1px 4px rgba(0,0,0,0.08);">Sign in</button>' +
        '<button id="mm-tab-signup" onclick="_mmAuthTab(\'signup\')" style="flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:transparent;color:#aaa;box-shadow:none;">Create account</button>' +
      '</div>' +

      /* Fields */
      '<div id="mm-auth-name-row" style="display:none;margin-bottom:10px;">' +
        '<input id="mm-auth-name" type="text" placeholder="Your name" maxlength="20" style="width:100%;box-sizing:border-box;border:2px solid #FFB7C5;border-radius:12px;padding:11px 14px;font-size:1rem;outline:none;" />' +
      '</div>' +
      '<div style="margin-bottom:10px;">' +
        '<input id="mm-auth-email" type="email" placeholder="Email address" style="width:100%;box-sizing:border-box;border:2px solid #FFB7C5;border-radius:12px;padding:11px 14px;font-size:1rem;outline:none;" />' +
      '</div>' +
      '<div style="margin-bottom:16px;">' +
        '<input id="mm-auth-pass" type="password" placeholder="Password" style="width:100%;box-sizing:border-box;border:2px solid #FFB7C5;border-radius:12px;padding:11px 14px;font-size:1rem;outline:none;" onkeydown="if(event.key===\'Enter\')_mmAuthSubmit()" />' +
      '</div>' +

      '<div id="mm-auth-err" style="display:none;background:#FFF0F0;border:1px solid #FFCDD2;border-radius:10px;padding:10px 14px;font-size:0.87rem;color:#C62828;margin-bottom:12px;"></div>' +

      '<button id="mm-auth-btn" onclick="_mmAuthSubmit()" style="display:block;width:100%;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border:none;border-radius:14px;padding:14px;font-size:1.05rem;font-weight:800;cursor:pointer;margin-bottom:8px;box-sizing:border-box;">Sign in 🎵</button>' +
      guestBtn +
      '<button onclick="document.getElementById(\'mm-auth-modal\').style.display=\'none\'" style="display:block;width:100%;background:none;border:none;color:#ccc;cursor:pointer;font-size:0.84rem;padding:4px;">✕ Close</button>' +
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

  var active   = 'flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:white;color:#333;box-shadow:0 1px 4px rgba(0,0,0,0.08);';
  var inactive = 'flex:1;padding:8px;border:none;border-radius:10px;font-size:0.9rem;font-weight:700;cursor:pointer;background:transparent;color:#aaa;box-shadow:none;';

  var siBtn = document.getElementById('mm-tab-signin');
  var suBtn = document.getElementById('mm-tab-signup');
  if (siBtn) siBtn.style.cssText = isSignup ? inactive : active;
  if (suBtn) suBtn.style.cssText = isSignup ? active   : inactive;

  var nameRow = document.getElementById('mm-auth-name-row');
  if (nameRow) nameRow.style.display = isSignup ? 'block' : 'none';

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
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

async function _mmAuthSubmit() {
  var mode  = window._mmAuthMode || 'signin';
  var email = (document.getElementById('mm-auth-email') || {}).value || '';
  var pass  = (document.getElementById('mm-auth-pass')  || {}).value || '';
  var name  = (document.getElementById('mm-auth-name')  || {}).value || '';
  var btn   = document.getElementById('mm-auth-btn');
  var errEl = document.getElementById('mm-auth-err');

  if (!email || !pass) { _mmAuthError('Please enter your email and password.'); return; }
  if (mode === 'signup' && !name) { _mmAuthError('Please enter your name.'); return; }

  if (btn) { btn.disabled = true; btn.textContent = '...'; }
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

  /* Sign-up with email confirmation */
  if (mode === 'signup' && result.data && result.data.user && !result.data.session) {
    if (btn) btn.textContent = 'Create account 🎹';
    _mmAuthError('✅ Check your email to confirm your account, then sign in here.');
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
      '<a href="https://buy.stripe.com/eVq5kE1Kf6rZ2OH78h1ck04" style="display:block;margin-top:10px;background:linear-gradient(90deg,#FF8FAB,#FFB74D);color:white;border-radius:10px;padding:8px 12px;text-decoration:none;font-size:0.88rem;font-weight:800;text-align:center;">Unlock Grade 2 &amp; 3 →</a>'
    ) +
    '<button onclick="mmSignOut().then(function(){location.reload();})" style="display:block;width:100%;margin-top:10px;background:none;border:1px solid #eee;border-radius:10px;padding:8px;font-size:0.85rem;color:#999;cursor:pointer;">Sign out</button>' +
    '<button onclick="document.getElementById(\'mm-account-menu\').remove()" style="display:block;width:100%;margin-top:4px;background:none;border:none;color:#ccc;font-size:0.8rem;cursor:pointer;">✕ Close</button>';
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

/* ── Bootstrap ── */
(function() {
  function tryInit() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
      _mmInitClient();
    } else {
      setTimeout(tryInit, 80);
    }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInit);
  } else {
    tryInit();
  }
})();
