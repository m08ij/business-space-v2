/* =========================================================
   UI — toasts, modals, confirm, helpers
   ========================================================= */
(function (global) {
  'use strict';

  const T = (k, f) => global.I18n ? I18n.t(k, f) : (f || k);

  /* ---------- Escape HTML ---------- */
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  /* ---------- DOM helpers (must come BEFORE countryMultiSelect) ---------- */
  function el(tag, attrs, children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (v == null || v === false) return;
        if (k === 'class') node.className = v;
        else if (k === 'html') node.innerHTML = v;
        else if (k === 'text') node.textContent = v;
        else if (k.startsWith('on') && typeof v === 'function') {
          node.addEventListener(k.slice(2).toLowerCase(), v);
        } else if (k === 'dataset') {
          Object.assign(node.dataset, v);
        } else node.setAttribute(k, v);
      });
    }
    if (children != null) {
      (Array.isArray(children) ? children : [children]).forEach(c => {
        if (c == null || c === false) return;
        node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
      });
    }
    return node;
  }

  const qs  = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  /* ---------- Country Multi-Select ---------- */
  const COUNTRIES = [
    { code: 'JO', name_ar: 'الأردن', name_en: 'Jordan', flag: '🇯🇴' },
    { code: 'SA', name_ar: 'السعودية', name_en: 'Saudi Arabia', flag: '🇸🇦' },
    { code: 'AE', name_ar: 'الإمارات', name_en: 'UAE', flag: '🇦🇪' },
    { code: 'EG', name_ar: 'مصر', name_en: 'Egypt', flag: '🇪🇬' },
    { code: 'QA', name_ar: 'قطر', name_en: 'Qatar', flag: '🇶🇦' },
    { code: 'KW', name_ar: 'الكويت', name_en: 'Kuwait', flag: '🇰🇼' },
    { code: 'BH', name_ar: 'البحرين', name_en: 'Bahrain', flag: '🇧🇭' },
    { code: 'OM', name_ar: 'عمان', name_en: 'Oman', flag: '🇴🇲' },
    { code: 'LB', name_ar: 'لبنان', name_en: 'Lebanon', flag: '🇱🇧' },
    { code: 'IQ', name_ar: 'العراق', name_en: 'Iraq', flag: '🇮🇶' },
    { code: 'SY', name_ar: 'سوريا', name_en: 'Syria', flag: '🇸🇾' },
    { code: 'PS', name_ar: 'فلسطين', name_en: 'Palestine', flag: '🇵🇸' },
    { code: 'MA', name_ar: 'المغرب', name_en: 'Morocco', flag: '🇲🇦' },
    { code: 'DZ', name_ar: 'الجزائر', name_en: 'Algeria', flag: '🇩🇿' },
    { code: 'TN', name_ar: 'تونس', name_en: 'Tunisia', flag: '🇹🇳' },
    { code: 'LY', name_ar: 'ليبيا', name_en: 'Libya', flag: '🇱🇾' },
    { code: 'SD', name_ar: 'السودان', name_en: 'Sudan', flag: '🇸🇩' },
    { code: 'YE', name_ar: 'اليمن', name_en: 'Yemen', flag: '🇾🇪' },
    { code: 'TR', name_ar: 'تركيا', name_en: 'Turkey', flag: '🇹🇷' },
    { code: 'US', name_ar: 'أمريكا', name_en: 'USA', flag: '🇺🇸' },
    { code: 'GB', name_ar: 'بريطانيا', name_en: 'UK', flag: '🇬🇧' },
    { code: 'DE', name_ar: 'ألمانيا', name_en: 'Germany', flag: '🇩🇪' },
    { code: 'FR', name_ar: 'فرنسا', name_en: 'France', flag: '🇫🇷' },
    { code: 'IN', name_ar: 'الهند', name_en: 'India', flag: '🇮🇳' },
    { code: 'CN', name_ar: 'الصين', name_en: 'China', flag: '🇨🇳' },
    { code: 'JP', name_ar: 'اليابان', name_en: 'Japan', flag: '🇯🇵' }
  ];

  function countryName(c) {
    const lang = global.I18n ? I18n.getLang() : 'ar';
    return lang === 'ar' ? c.name_ar : c.name_en;
  }

  function countryMultiSelect(selected) {
    const selectedSet = new Set(Array.isArray(selected) ? selected : []);
    const wrap = el('div', { class: 'country-select' });
    const chips = el('div', { class: 'country-chips' });
    const input = el('input', {
      class: 'input country-search',
      placeholder: (global.I18n ? I18n.t('search_countries') : 'Search countries…'),
      type: 'text'
    });
    const dropdown = el('div', { class: 'country-dropdown hidden' });
    const hidden = el('input', { type: 'hidden', name: 'countries', value: Array.from(selectedSet).join(',') });

    function renderChips() {
      chips.innerHTML = '';
      if (!selectedSet.size) {
        chips.appendChild(el('span', {
          class: 'country-empty',
          text: (global.I18n ? I18n.t('no_countries') : 'No countries selected')
        }));
        return;
      }
      Array.from(selectedSet).forEach(code => {
        const c = COUNTRIES.find(x => x.code === code);
        if (!c) return;
        chips.appendChild(el('span', { class: 'country-chip' }, [
          el('span', { text: c.flag + ' ' + countryName(c) }),
          el('button', {
            type: 'button',
            class: 'country-chip-x',
            onclick: () => {
              selectedSet.delete(code);
              hidden.value = Array.from(selectedSet).join(',');
              renderChips();
              renderDropdown(input.value);
            }
          }, ['×'])
        ]));
      });
    }

    function renderDropdown(query) {
      dropdown.innerHTML = '';
      const q = (query || '').toLowerCase().trim();
      const filtered = COUNTRIES.filter(c => {
        if (!q) return true;
        return c.name_ar.includes(q) ||
               c.name_en.toLowerCase().includes(q) ||
               c.code.toLowerCase().includes(q);
      });
      if (!filtered.length) {
        dropdown.appendChild(el('div', { class: 'country-opt muted', text: (global.I18n ? I18n.t('no_data') : 'No data') }));
        return;
      }
      filtered.forEach(c => {
        const isSel = selectedSet.has(c.code);
        dropdown.appendChild(el('button', {
          type: 'button',
          class: 'country-opt' + (isSel ? ' selected' : ''),
          onclick: () => {
            if (isSel) selectedSet.delete(c.code);
            else selectedSet.add(c.code);
            hidden.value = Array.from(selectedSet).join(',');
            renderChips();
            renderDropdown(input.value);
            input.focus();
          }
        }, [
          el('span', { class: 'country-flag', text: c.flag }),
          el('span', { class: 'country-name', text: countryName(c) }),
          el('span', { class: 'country-code muted text-xs', text: c.code }),
          isSel ? el('span', { class: 'country-check', text: '✓' }) : null
        ].filter(Boolean)));
      });
    }

    input.addEventListener('focus', () => {
      dropdown.classList.remove('hidden');
      renderDropdown(input.value);
    });
    input.addEventListener('input', () => renderDropdown(input.value));
    input.addEventListener('blur', () => {
      setTimeout(() => dropdown.classList.add('hidden'), 180);
    });

    wrap.appendChild(hidden);
    wrap.appendChild(chips);
    wrap.appendChild(input);
    wrap.appendChild(dropdown);
    renderChips();

    return wrap;
  }

  /* ---------- Formatting ---------- */
  function fmtDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d)) return '—';
    const lang = global.I18n ? I18n.getLang() : 'ar';
    return d.toLocaleDateString(lang === 'ar' ? 'ar-JO' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  }

  function fmtDateTime(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    if (isNaN(d)) return '—';
    const lang = global.I18n ? I18n.getLang() : 'ar';
    return d.toLocaleString(lang === 'ar' ? 'ar-JO' : 'en-GB', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }

  function fmtMoney(n, currency) {
    const num = Number(n) || 0;
    const lang = global.I18n ? I18n.getLang() : 'ar';
    try {
      return new Intl.NumberFormat(lang === 'ar' ? 'ar-JO' : 'en-US', {
        style: 'currency',
        currency: currency || 'USD',
        maximumFractionDigits: 0
      }).format(num);
    } catch (_) {
      return num.toLocaleString() + ' ' + (currency || 'USD');
    }
  }

  function fmtNum(n) {
    return (Number(n) || 0).toLocaleString();
  }

  function fmtPct(n) {
    return Math.round(Number(n) || 0) + '%';
  }

  function relTime(ts) {
    if (!ts) return '—';
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return T('today');
    if (mins < 60) return mins + ' ' + T('minutes');
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return hrs + ' ' + T('hours');
    const days = Math.floor(hrs / 24);
    if (days < 30) return days + ' ' + T('days');
    return fmtDate(ts);
  }

  function daysBetween(a, b) {
    return Math.round((new Date(b) - new Date(a)) / 86400000);
  }

  function todayISO() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
  }

  function initials(name) {
    if (!name) return '?';
    return String(name).trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  /* ---------- Toast ---------- */
  function toast(msg, kind) {
    const root = document.getElementById('toastRoot');
    if (!root) return;
    const icons = {
      success: '<svg viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>',
      error:   '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/></svg>',
      warn:    '<svg viewBox="0 0 24 24"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg>',
      info:    '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>'
    };
    const node = el('div', { class: 'toast ' + (kind || 'info') }, [
      el('span', { html: icons[kind] || icons.info }),
      el('span', { class: 'msg', text: msg })
    ]);
    root.appendChild(node);
    setTimeout(() => {
      node.classList.add('closing');
      setTimeout(() => node.remove(), 240);
    }, 3200);
  }

  /* ---------- Modal ---------- */
  let activeModal = null;

  function openModal(opts) {
    const { title, body, footer, wide, narrow, onClose } = opts || {};
    const tpl = document.getElementById('tpl-modal');
    const node = tpl.content.firstElementChild.cloneNode(true);
    const backdrop = node;
    const modal = qs('.modal', node);

    if (wide) modal.classList.add('wide');
    if (narrow) modal.classList.add('narrow');

    qs('.modal-title', node).textContent = title || '';
    const bodyEl = qs('.modal-body', node);
    const footEl = qs('.modal-foot', node);

    if (typeof body === 'string') bodyEl.innerHTML = body;
    else if (body instanceof Node) bodyEl.appendChild(body);

    if (footer) {
      if (typeof footer === 'string') footEl.innerHTML = footer;
      else if (footer instanceof Node) footEl.appendChild(footer);
    } else {
      footEl.remove();
    }

    qs('[data-close]', node).addEventListener('click', closeModal);
    backdrop.addEventListener('mousedown', (e) => {
      if (e.target === backdrop) closeModal();
    });

    const escHandler = (e) => { if (e.key === 'Escape') closeModal(); };
    document.addEventListener('keydown', escHandler);

    document.getElementById('modalRoot').appendChild(node);
    activeModal = { node, onClose, escHandler };

    setTimeout(() => {
      const first = bodyEl.querySelector('input, select, textarea, button');
      if (first) first.focus();
    }, 40);

    return node;
  }

  function closeModal() {
    if (!activeModal) return;
    const { node, onClose, escHandler } = activeModal;
    document.removeEventListener('keydown', escHandler);
    node.classList.add('closing');
    setTimeout(() => {
      node.remove();
      if (onClose) onClose();
    }, 220);
    activeModal = null;
  }

  /* ---------- Confirm ---------- */
  function confirmDialog(opts) {
    return new Promise(resolve => {
      const { title, message, confirmText, cancelText, danger } = opts || {};
      const body = el('div', { class: 'col', style: 'gap:14px' }, [
        el('p', { class: 'text-2', text: message || T('confirm_delete_body') })
      ]);
      const footer = el('div', { class: 'row', style: 'width:100%' }, [
        el('div', { class: 'spacer' }),
        el('button', {
          class: 'btn btn-ghost',
          text: cancelText || T('cancel'),
          onclick: () => { closeModal(); resolve(false); }
        }),
        el('button', {
          class: 'btn ' + (danger ? 'btn-danger' : 'btn-primary'),
          text: confirmText || T('confirm'),
          onclick: () => { closeModal(); resolve(true); }
        })
      ]);
      openModal({
        title: title || T('confirm_delete_title'),
        body, footer, narrow: true,
        onClose: () => resolve(false)
      });
    });
  }

  /* ---------- Progress class helper ---------- */
  function progressClass(pct) {
    if (pct >= 80) return 'success';
    if (pct >= 40) return '';
    if (pct >= 15) return 'warn';
    return 'danger';
  }

  /* ---------- Status / priority label maps ---------- */
  const STATUS_LABEL = {
    idea: 'status_idea', planning: 'status_planning', active: 'status_active',
    on_hold: 'status_on_hold', completed: 'status_completed',
    cancelled: 'status_cancelled', archived: 'status_archived',
    draft: 'status_draft', review: 'status_review',
    approved: 'status_approved', rejected: 'status_rejected',
    todo: 'status_todo', in_progress: 'status_in_progress',
    done: 'status_done', blocked: 'status_blocked'
  };

  const STATUS_TONE = {
    idea: 'info', planning: 'info', active: 'success', on_hold: 'warn',
    completed: 'primary', cancelled: 'danger', archived: 'muted',
    draft: 'muted', review: 'warn', approved: 'success', rejected: 'danger',
    todo: 'muted', in_progress: 'info', done: 'success', blocked: 'danger'
  };

  function statusLabel(s) { return T(STATUS_LABEL[s] || s); }
  function statusTone(s) { return STATUS_TONE[s] || 'muted'; }

  const PRIO_LABEL = { low: 'low', medium: 'medium', high: 'high', critical: 'critical' };
  function prioLabel(p) { return T(PRIO_LABEL[p] || p); }

  /* ---------- Export ---------- */
  global.UI = {
    esc, el, qs, qsa,
    fmtDate, fmtDateTime, fmtMoney, fmtNum, fmtPct, relTime, daysBetween, todayISO, initials,
    toast, openModal, closeModal, confirmDialog,
    progressClass, statusLabel, statusTone, prioLabel, T,
    countryMultiSelect, COUNTRIES
  };
})(window);