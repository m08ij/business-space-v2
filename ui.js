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

  /* ---------- DOM helpers ---------- */
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

    // focus first input
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

  /* ---------- Status/priority label maps ---------- */
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
    progressClass, statusLabel, statusTone, prioLabel, T
  };
})(window);