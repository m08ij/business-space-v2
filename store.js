/* =========================================================
   Store — localStorage + Supabase sync layer
   ========================================================= */
(function (global) {
  'use strict';

  const LS_KEY = 'biz_dev_v1';
  const LS_SETTINGS = 'biz_dev_settings_v1';

  /* Collections */
  const COLLECTIONS = [
    'ideas', 'projects', 'tasks', 'deals',
    'swot', 'pestel', 'okrs',
    'sdg', 'esg', 'p5', 'meddic',
    'risks', 'milestones', 'files', 'notes', 'kpis'
  ];

  /* Default state */
  function defaultState() {
    const s = { meta: { created: Date.now(), updated: Date.now() } };
    COLLECTIONS.forEach(c => s[c] = []);
    return s;
  }

  /* Runtime */
  let data = defaultState();
  let settings = {
    lang: 'ar', theme: 'light',
    supabaseUrl: '', supabaseKey: '',
    user: null
  };
  let supa = null;
  let listeners = new Set();
  let syncState = 'local'; // local | syncing | synced | error | offline

  /* ---------- persistence ---------- */
  function load() {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        data = Object.assign(defaultState(), parsed);
      }
    } catch (e) { console.warn('load failed', e); }

    try {
      const sraw = localStorage.getItem(LS_SETTINGS);
      if (sraw) settings = Object.assign(settings, JSON.parse(sraw));
    } catch (e) { console.warn('settings load failed', e); }
  }

  function persist() {
    data.meta.updated = Date.now();
    try { localStorage.setItem(LS_KEY, JSON.stringify(data)); }
    catch (e) { console.warn('persist failed', e); }
    emit();
  }

  function persistSettings() {
    try { localStorage.setItem(LS_SETTINGS, JSON.stringify(settings)); }
    catch (e) { console.warn('settings persist failed', e); }
  }

  /* ---------- listeners ---------- */
  function emit() { listeners.forEach(fn => { try { fn(); } catch (_) {} }); }
  function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }

  /* ---------- ID helpers ---------- */
  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  /* ---------- CRUD ---------- */
  function list(col, filter) {
    const arr = data[col] || [];
    return filter ? arr.filter(filter) : arr.slice();
  }

  function get(col, id) {
    return (data[col] || []).find(x => x.id === id) || null;
  }

  function create(col, item) {
    const now = Date.now();
    const record = Object.assign({
      id: uid(),
      created_at: now,
      updated_at: now
    }, item);
    if (!data[col]) data[col] = [];
    data[col].unshift(record);
    persist();
    pushRemote(col, record);
    return record;
  }

  function update(col, id, patch) {
    const arr = data[col] || [];
    const i = arr.findIndex(x => x.id === id);
    if (i < 0) return null;
    arr[i] = Object.assign({}, arr[i], patch, { updated_at: Date.now() });
    persist();
    pushRemote(col, arr[i]);
    return arr[i];
  }

  function remove(col, id) {
    const arr = data[col] || [];
    const i = arr.findIndex(x => x.id === id);
    if (i < 0) return false;
    const [removed] = arr.splice(i, 1);
    persist();
    deleteRemote(col, removed.id);
    return true;
  }

  function archive(col, id, archived) {
    return update(col, id, { archived: archived !== false });
  }

  /* ---------- Settings ---------- */
  function getSettings() { return Object.assign({}, settings); }

  function setSettings(patch) {
    settings = Object.assign(settings, patch);
    persistSettings();
    emit();
    if ('supabaseUrl' in patch || 'supabaseKey' in patch) initSupabase();
  }

  /* ---------- Supabase ---------- */
  function initSupabase() {
    if (!settings.supabaseUrl || !settings.supabaseKey) {
      supa = null;
      return false;
    }
    if (!global.supabase || !global.supabase.createClient) {
      console.warn('Supabase library not loaded');
      return false;
    }
    try {
      supa = global.supabase.createClient(settings.supabaseUrl, settings.supabaseKey);
      return true;
    } catch (e) {
      console.warn('Supabase init failed', e);
      supa = null;
      return false;
    }
  }

  async function signIn(email, password) {
    if (!supa && !initSupabase()) throw new Error('Supabase not configured');
    const { data: res, error } = await supa.auth.signInWithPassword({ email, password });
    if (error) throw error;
    settings.user = res.user;
    persistSettings();
    emit();
    return res.user;
  }

  async function signUp(email, password) {
    if (!supa && !initSupabase()) throw new Error('Supabase not configured');
    const { data: res, error } = await supa.auth.signUp({ email, password });
    if (error) throw error;
    settings.user = res.user;
    persistSettings();
    emit();
    return res.user;
  }

  async function signOut() {
    if (supa) { try { await supa.auth.signOut(); } catch (_) {} }
    settings.user = null;
    persistSettings();
    emit();
  }

  async function pushRemote(col, row) {
    if (!supa || !settings.user) return;
    try {
      setSyncState('syncing');
      const payload = Object.assign({}, row, { user_id: settings.user.id });
      await supa.from(col).upsert(payload, { onConflict: 'id' });
      setSyncState('synced');
    } catch (e) {
      console.warn('push failed', col, e);
      setSyncState('error');
    }
  }

  async function deleteRemote(col, id) {
    if (!supa || !settings.user) return;
    try {
      await supa.from(col).delete().eq('id', id);
    } catch (e) { console.warn('delete remote failed', e); }
  }

  async function pullRemote() {
    if (!supa || !settings.user) throw new Error('Not signed in');
    setSyncState('syncing');
    try {
      for (const col of COLLECTIONS) {
        const { data: rows, error } = await supa.from(col).select('*');
        if (error) throw error;
        if (Array.isArray(rows)) {
          const map = new Map(data[col].map(x => [x.id, x]));
          rows.forEach(r => {
            const local = map.get(r.id);
            if (!local || (r.updated_at || 0) > (local.updated_at || 0)) {
              map.set(r.id, r);
            }
          });
          data[col] = Array.from(map.values());
        }
      }
      persist();
      setSyncState('synced');
      return true;
    } catch (e) {
      console.warn('pull failed', e);
      setSyncState('error');
      throw e;
    }
  }

  async function syncNow() {
    if (!supa) initSupabase();
    if (!supa || !settings.user) throw new Error('Not configured');
    return pullRemote();
  }

  function setSyncState(s) {
    syncState = s;
    emit();
    updateSyncChip();
  }

  function getSyncState() { return syncState; }

  /* ---------- Sync chip visual ---------- */
  function updateSyncChip() {
    const dot = document.getElementById('syncDot');
    const label = document.getElementById('syncLabel');
    if (!dot || !label) return;
    dot.className = 'dot';
    let key = 'msg_local_mode';
    switch (syncState) {
      case 'syncing': dot.classList.add('syncing'); key = 'msg_syncing'; break;
      case 'synced':  dot.classList.add('online');  key = 'msg_synced';  break;
      case 'error':   dot.classList.add('error');   key = 'msg_sync_error'; break;
      case 'offline': dot.classList.add('offline'); key = 'msg_offline'; break;
      default:
        if (!navigator.onLine) { dot.classList.add('offline'); key = 'msg_offline'; }
        break;
    }
    label.textContent = global.I18n ? I18n.t(key) : key;
  }

  /* ---------- Export / Import / Reset ---------- */
  function exportData() {
    return JSON.stringify({ version: 1, exported_at: Date.now(), data }, null, 2);
  }

  function importData(json) {
    const parsed = typeof json === 'string' ? JSON.parse(json) : json;
    const payload = parsed.data || parsed;
    data = Object.assign(defaultState(), payload);
    persist();
    return true;
  }

  function resetData() {
    data = defaultState();
    persist();
  }

  /* ---------- Online / offline ---------- */
  global.addEventListener('online', () => {
    setSyncState(supa && settings.user ? 'synced' : 'local');
  });
  global.addEventListener('offline', () => setSyncState('offline'));

  /* ---------- Init ---------- */
  load();
  initSupabase();

  global.Store = {
    COLLECTIONS,
    list, get, create, update, remove, archive,
    getSettings, setSettings,
    subscribe, uid,
    signIn, signUp, signOut,
    syncNow, setSyncState, getSyncState,
    exportData, importData, resetData,
    updateSyncChip
  };
})(window);