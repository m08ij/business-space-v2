/* =========================================================
   App — router, theme, language, bootstrap
   ========================================================= */

/* =========================================================
   SUPABASE CONFIGURATION
   Publishable key only — never use the secret key here.
   ========================================================= */
const SUPABASE_CONFIG = {
  url: 'https://cqgkpbaaiahximxpjews.supabase.co',
  publishableKey: 'sb_publishable_cC1Urngf05g4syObroyqBw_9Zb64b3b'
};
/* ========================================================= */

(function (global) {
  'use strict';

  const view = document.getElementById('view');
  const menuBtn = document.getElementById('menuBtn');
  const sidebar = document.getElementById('sidebar');
  const scrim = document.getElementById('scrim');
  const langBtn = document.getElementById('langBtn');
  const langLabel = document.getElementById('langLabel');
  const themeBtn = document.getElementById('themeBtn');

  /* ---------- Router ---------- */
  function parseHash() {
    const h = (location.hash || '#/dashboard').replace(/^#\/?/, '');
    const [path, ...rest] = h.split('/');
    return { path: path || 'dashboard', args: rest };
  }

  function navigate() {
    const { path, args } = parseHash();
    let node;

    switch (path) {
      case 'dashboard': node = Views.dashboard(); break;
      case 'ideas':     node = Views.ideas();     break;
      case 'projects':  node = args[0] ? Views.projectDetail(args[0]) : Views.projects(); break;
      case 'tasks':     node = Views.tasks();     break;
      case 'strategy':  node = Views.strategy();  break;
      case 'impact':    node = Views.impact();    break;
      case 'sales':     node = Views.sales();     break;
      case 'meddic':    node = Views.meddic();    break;
      case 'reports':   node = Views.reports();   break;
      case 'settings':  node = Views.settings();  break;
      default:          node = Views.dashboard();
    }

    view.innerHTML = '';
    view.appendChild(node);
    view.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'instant' });

    updateActiveNav(path);
    updateBadges();
    I18n.apply(view);
    closeSidebar();
  }

  function updateActiveNav(path) {
    document.querySelectorAll('.nav-item').forEach(a => {
      a.classList.toggle('active', a.dataset.route === path);
    });
  }

  function updateBadges() {
    const ideas = Store.list('ideas').filter(i => !i.archived && i.status !== 'approved').length;
    const projects = Store.list('projects').filter(p => !p.archived && p.status === 'active').length;
    const tasks = Store.list('tasks').filter(t => t.status !== 'done').length;
    const deals = Store.list('deals').filter(d => d.stage !== 'won' && d.stage !== 'lost').length;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v || ''; };
    set('badgeIdeas', ideas);
    set('badgeProjects', projects);
    set('badgeTasks', tasks);
    set('badgeDeals', deals);
  }

  /* ---------- Sidebar (mobile) ---------- */
  function openSidebar() { sidebar.classList.add('open'); scrim.classList.add('show'); }
  function closeSidebar() { sidebar.classList.remove('open'); scrim.classList.remove('show'); }
  menuBtn.addEventListener('click', openSidebar);
  scrim.addEventListener('click', closeSidebar);
  sidebar.addEventListener('click', (e) => { if (e.target.closest('.nav-item')) closeSidebar(); });

  /* ---------- Theme ---------- */
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
    Store.setSettings({ theme: t });
  }
  themeBtn.addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme');
    setTheme(cur === 'dark' ? 'light' : 'dark');
  });

  /* ---------- Language ---------- */
  function setLang(lang) {
    I18n.setLang(lang);
    Store.setSettings({ lang });
    langLabel.textContent = lang === 'ar' ? 'EN' : 'ع';
    I18n.apply(document);
    Store.updateSyncChip();
    navigate();
    updateBadges();
  }
  langBtn.addEventListener('click', () => {
    setLang(I18n.getLang() === 'ar' ? 'en' : 'ar');
  });

  /* ---------- Authentication ---------- */
  const loginScreen = document.getElementById('loginScreen');
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const loginError = document.getElementById('loginError');
  const loginSubmit = document.getElementById('loginSubmit');
  const guestBtn = document.getElementById('guestBtn');
  let authMode = 'signin';

  function showLogin() {
    loginScreen.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function hideLogin() {
    loginScreen.classList.add('hidden');
    document.body.style.overflow = '';
  }

  function setAuthMode(mode) {
    authMode = mode;
    document.querySelectorAll('.login-tab').forEach(t => {
      t.classList.toggle('active', t.dataset.mode === mode);
    });
    loginSubmit.querySelector('span').textContent = mode === 'signin'
      ? I18n.t('sign_in')
      : I18n.t('sign_up');
    loginPassword.setAttribute('autocomplete', mode === 'signin' ? 'current-password' : 'new-password');
    loginError.textContent = '';
  }

  function checkAuthState() {
    const s = Store.getSettings();
    if (s.guestMode || (s.user && s.supabaseUrl && s.supabaseKey)) {
      hideLogin();
    } else {
      showLogin();
    }
  }

  function bindAuthUI() {
    document.querySelectorAll('.login-tab').forEach(tab => {
      tab.addEventListener('click', () => setAuthMode(tab.dataset.mode));
    });

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.textContent = '';
      const email = loginEmail.value.trim();
      const password = loginPassword.value;
      if (!email) { loginError.textContent = I18n.t('msg_invalid_email'); return; }
      if (password.length < 6) { loginError.textContent = I18n.t('password_too_short'); return; }

      loginSubmit.disabled = true;
      const originalText = loginSubmit.querySelector('span').textContent;
      loginSubmit.querySelector('span').textContent = I18n.t('loading');

      try {
        if (authMode === 'signin') {
          await Store.signIn(email, password);
        } else {
          await Store.signUp(email, password);
        }
        UI.toast(I18n.t('msg_login_success'), 'success');
        hideLogin();
        navigate();
        updateBadges();
      } catch (err) {
        loginError.textContent = err.message || I18n.t('msg_error');
      } finally {
        loginSubmit.disabled = false;
        loginSubmit.querySelector('span').textContent = originalText;
      }
    });

    guestBtn.addEventListener('click', () => {
      Store.setSettings({ guestMode: true, user: null });
      hideLogin();
      navigate();
      updateBadges();
    });

    document.getElementById('openSettingsFromLogin').addEventListener('click', () => {
      hideLogin();
      location.hash = '#/settings';
    });
  }

  /* ---------- Boot ---------- */
  function boot() {
    const s = Store.getSettings();
    setTheme(s.theme || 'light');
    I18n.setLang(s.lang || 'ar');
    langLabel.textContent = (s.lang || 'ar') === 'ar' ? 'EN' : 'ع';
    I18n.apply(document);

    /* Auto-configure Supabase if keys are provided in config */
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.url !== 'YOUR_SUPABASE_PROJECT_URL_HERE') {
      Store.setSettings({
        supabaseUrl: SUPABASE_CONFIG.url,
        supabaseKey: SUPABASE_CONFIG.publishableKey
      });
    }

    Views.setRender(navigate);
    Store.subscribe(updateBadges);

    window.addEventListener('hashchange', navigate);

    /* Bind auth UI handlers */
    bindAuthUI();

    /* Decide whether to show login or app */
    checkAuthState();

    navigate();
    Store.updateSyncChip();
    updateBadges();

    /* Service worker */
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => {
          console.warn('SW registration failed', err);
        });
      });
    }
  }

  global.App = { setLang, setTheme, navigate };

  document.addEventListener('DOMContentLoaded', boot);
})(window);