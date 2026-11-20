/* GJ App v4 — UI kit: messages, dialogs, forms, loaders, lists, CSV / print, camera. No view-specific code here. */
'use strict';

/* ================= messages ================= */
/* kind 'ok' auto-hides after 4 s; 'bad' stays until dismissed (F401). */
function notify(msg, kind) {
  const box = $('#toasts'); if (!box) return;
  const bad = kind === 'bad';
  $$('.toast', box).forEach(t => { if (t.dataset.kind === (kind || 'ok')) t.remove(); });
  const t = h('div', { class: 'toast ' + (kind || 'ok'), role: bad ? 'alert' : 'status', dataset: { kind: kind || 'ok' } }, h('span', { text: msg }));
  if (bad) t.appendChild(h('button', { type: 'button', class: 'btn sm ghost', 'aria-label': T.dismiss, text: T.dismiss, onclick: () => t.remove() }));
  else setTimeout(() => t.remove(), 4000);
  box.appendChild(t);
}
function spinner(text) { return h('div', { class: 'spin', role: 'status' }, h('span', { class: 'spin-dot', 'aria-hidden': 'true' }), h('span', { text: text || T.loading })); }
function errorCard(msg, retry) {
  return h('div', { class: 'card errcard', role: 'alert' }, h('p', { class: 'errmsg', text: msg || T.netFail }),
    retry ? h('button', { type: 'button', class: 'btn', text: T.retry, onclick: retry }) : null);
}
function note(text, kind) { return h('div', { class: 'note ' + (kind || 'info') }, text); }
function pill(group, code, kind) { return code == null || code === '' ? null : h('span', { class: 'pill ' + (kind || pillKind(code)), text: lbl(group, code) }); }
function pillKind(code) {
  if (/^(READY|OK|ACTIVE|APPROVED|DONE|FOUND|DELIVERED|CLOSED|IN_STOCK|SAME|Y|RESOLVED|RECEIVED_FULL)$/.test(code)) return 'good';
  if (/^(BAD|MISSING|DEALER_RETURN|REVOKED|REJECTED|VOID|FAULTY|CHANGED|NOT_SCANNED|CARRIED_OVER|URGENT|WRITTEN_OFF|CANCELLED|DOWN|ERROR|UNKNOWN_CODE)$/.test(code)) return 'bad';
  if (/^(WARN|PENDING|NEEDS_REPAIR|WAITING_PART|OUTSIDE|PARTIAL|RESERVED|IN_TRANSIT|UNVERIFIED|EXTRA|N|ACK|AT_DEALER|UNFIT|HW_PENDING|OPEN|SEALED_PENDING|DUP)$/.test(code)) return 'warn';
  return 'plain';
}
function kv(pairs) { const dl = h('dl', { class: 'kv' }); pairs.forEach(p => { if (!p || p[1] == null || p[1] === '') return; dl.appendChild(h('dt', { text: p[0] })); dl.appendChild(h('dd', null, p[1])); }); return dl; }
function btn(text, onclick, cls, attrs) { return h('button', Object.assign({ type: 'button', class: 'btn ' + (cls || ''), text, onclick }, attrs || {})); }

/* Runs after the current code, before any user input (a timer here could steal the focus from a fast typist). */
const soon = fn => Promise.resolve().then(fn);

/* ================= dialogs ================= */
const MODALS = [];
let skipPop = 0; const popWaiters = [];
function historyIdle() { return skipPop === 0 ? Promise.resolve() : new Promise(r => popWaiters.push(r)); }
function popDone() { if (skipPop > 0) skipPop--; if (skipPop === 0) popWaiters.splice(0).forEach(r => r()); }
let camStop = null;
function stopCamera() { if (camStop) { try { camStop(); } catch (e) { /* ignore */ } camStop = null; } }

/* openModal({title, body, wide, full, closable, dirty, onClose, reload}) -> m. Closes only by X / Cancel / Esc / Back. */
function openModal(o) {
  const m = Object.assign({ closable: true }, o);
  m.prevFocus = document.activeElement;
  m.scope = 'm' + crypto.randomUUID().slice(0, 8); /* P1 (2.G): the nonce of this dialog - part of the request ID of its saves (api / ridScope) */
  m.titleEl = h('h2', { class: 'modal-title', id: uid('mt'), text: o.title || '' });
  m.body = h('div', { class: 'modal-body' }); m.foot = h('div', { class: 'modal-foot' });
  m.x = h('button', { type: 'button', class: 'btn ghost modal-x', 'aria-label': T.close, text: '✕', onclick: () => m.requestClose() });
  m.box = h('div', { class: 'modal-box' + (o.wide ? ' wide' : '') + (o.full ? ' full' : ''), role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': m.titleEl.id, tabindex: '-1' },
    h('div', { class: 'modal-head' }, m.titleEl, m.closable ? m.x : null), m.body, m.foot);
  m.el = h('div', { class: 'modal' }, m.box);
  m.close = () => closeModal(m, false);
  m.requestClose = async () => { if (!m.closable) return; if (((m.dirty && m.dirty()) || unsureHeld(m.box)) && !(await askDiscard())) return; closeModal(m, false); }; /* R37B-01: a locked entry asks before it is left */
  m.box.addEventListener('keydown', e => {
    if (e.key === 'Escape') { e.stopPropagation(); m.requestClose(); return; }
    if (e.key !== 'Tab') return;
    const f = $$('button,input,select,textarea,a[href],[tabindex="0"]', m.box).filter(x => !x.disabled && !x.hidden && x.offsetParent !== null);
    if (!f.length) { e.preventDefault(); return; }
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  if (o.body) append(m.body, o.body);
  MODALS.forEach(x => { x.el.inert = true; });
  $('#modals').appendChild(m.el); MODALS.push(m);
  document.body.classList.add('has-modal');
  /* The history entry is added only when no earlier history.back() is still pending, otherwise the browser would drop it. */
  historyIdle().then(() => { if (MODALS.indexOf(m) >= 0 && !m.pushed) { history.pushState({ modal: MODALS.length }, ''); m.pushed = true; } });
  soon(() => { if (!m.el.isConnected) return; const f = $('[data-autofocus]', m.box) || (o.focusFirst ? $('input:not([type=checkbox]):not(:disabled),select:not(:disabled),textarea', m.body) : null) || m.box; try { f.focus(); } catch (e) { /* ignore */ } });
  return m;
}
function closeModal(m, viaPop) {
  const i = MODALS.indexOf(m); if (i < 0) return;
  const gone = MODALS.splice(i);
  gone.forEach(x => { x.el.remove(); if (x.onClose) { try { x.onClose(); } catch (e) { /* ignore */ } } });
  stopCamera();
  if (MODALS.length) MODALS[MODALS.length - 1].el.inert = false; else document.body.classList.remove('has-modal');
  let backs = viaPop === 'nav' ? 0 : gone.filter(x => x.pushed).length - (viaPop ? 1 : 0);
  if (backs > 0) { skipPop++; history.go(-backs); }
  const sb = $('[data-scanbox]', MODALS.length ? MODALS[MODALS.length - 1].box : $('#view'));
  const tgt = sb || (m.prevFocus && m.prevFocus.isConnected ? m.prevFocus : null);
  if (tgt) { try { tgt.focus(); } catch (e) { /* ignore */ } }
}
function closeAllModals() { if (MODALS.length) closeModal(MODALS[0], false); }
function topModal() { return MODALS[MODALS.length - 1] || null; }

/* In-app confirm with clearly named buttons (never window.confirm). Resolves true / false. */
/* pinPrompt (fix round 5): asks the signed-in person for the PIN; resolves with the PIN or '' when cancelled */
function pinPrompt(text) {
  return new Promise(res => {
    let done = false; const F = mkForm([{ k: 'pin', l: T.yourPin, t: 'pin', req: true, wide: true }]);
    const m = openModal({ title: T.pinAskTitle, onClose: () => { if (!done) res(''); }, focusFirst: true });
    m.box.classList.add('confirm'); m.box.id = 'pinPrompt';
    append(m.body, [h('p', { class: 'intro', text: text || T.pinAskIntro }), F.el]);
    const go = () => { if (F.check()) return; done = true; const p = F.get().pin; m.close(); res(p); };
    F.el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); go(); } });
    append(m.foot, [btn(T.cancel, () => { done = true; m.close(); res(''); }, 'sec'), btn(T.continue_, go, '', { id: 'pinPromptOk' })]);
  });
}
function confirmBox(msg, o) {
  o = o || {};
  return new Promise(res => {
    let answered = false;
    const m = openModal({ title: o.title || T.confirmTitle, onClose: () => { if (!answered) res(false); } });
    m.box.classList.add('confirm');
    append(m.body, typeof msg === 'string' ? h('p', { class: 'confirm-msg', text: msg }) : msg);
    append(m.foot, [btn(o.no || T.cancel, () => { answered = true; m.close(); res(false); }, 'sec'),
      btn(o.yes || T.continue_, () => { answered = true; m.close(); res(true); }, o.danger ? 'bad' : '', { 'data-autofocus': '' })]);
  });
}
/* R37B-01: leaving a form whose entry may already be saved says so (not the plain "discard?") */
const askDiscard = () => (unsureHeld() ? confirmBox(T.unsureLeaveMsg, { title: T.unsureLeaveTitle, yes: T.unsureLeaveYes, no: T.unsureStay, danger: true }) : confirmBox(T.discardMsg, { title: T.discardTitle, yes: T.discard, no: T.keepEditing, danger: true }));

/* ================= R37B-01: the form is LOCKED after an unsure answer =================
   After NET / SYS_BUSY / SYS_ERROR / STORAGE ("it may already be saved") the entry may be on the Sheet under the request ID of that
   attempt. The request ID is made from the data, so one edited box used to give a NEW ID and the entry was saved twice. Now (as on the
   pendrive, R33C-07) every box of the form is locked, the button sends EXACTLY the same entry again under the SAME request ID (the
   server answers with the stored result), and "Start a new entry" - after a warning - is the only way to open the boxes; it takes a
   new request ID. A definite answer (saved, refused) opens the form again.
   U = unsureGuard(errEl, roots): errEl = the message box of the form (the notice is placed after it), roots = element(s) / function
   whose inputs and buttons are locked. U.run(send, keep): send = () => the reply of the save, keep = the pressed button (stays usable). */
const UNSURE = [];
function unsureHeld(el) { return UNSURE.some(u => u.held && u.bar && u.bar.isConnected && (!el || el.contains(u.bar))); }
function unsureGuard(err, roots) {
  const U = { held: false, bar: null, fn: null, rids: {}, els: [] };
  const rootList = () => [].concat(typeof roots === 'function' ? roots() : (roots || [])).filter(Boolean);
  function lock(keep) {
    if (!U.held) {
      U.held = true;
      U.bar = h('div', { class: 'note warn unsure-bar', role: 'status' }, h('p', { text: T.unsureLocked }), btn(T.unsureNew, startNew, 'sec sm', { 'data-unsure-new': '' }));
      if (err && err.parentNode) err.parentNode.insertBefore(U.bar, err.nextSibling); else rootList()[0].appendChild(U.bar);
      const v = $('#view'); if (v && v.contains(U.bar)) S.dirty = true; /* leaving the screen asks first */
      if (UNSURE.indexOf(U) < 0) UNSURE.push(U);
      for (let i = UNSURE.length - 1; i >= 0; i--) if (UNSURE[i] !== U && !(UNSURE[i].bar && UNSURE[i].bar.isConnected)) UNSURE.splice(i, 1);
    }
    rootList().forEach(root => $$('input,select,textarea,button', root).forEach(e => { if (e.disabled || e === keep || U.bar.contains(e)) return; e.disabled = true; e.dataset.unsureLock = '1'; U.els.push(e); }));
  }
  function unlock() {
    U.els.forEach(e => { e.disabled = false; delete e.dataset.unsureLock; }); U.els = [];
    if (U.bar) U.bar.remove(); U.bar = null; U.held = false; U.fn = null; U.rids = {};
    const i = UNSURE.indexOf(U); if (i >= 0) UNSURE.splice(i, 1);
  }
  async function startNew() {
    if (!U.held || !(await confirmBox(T.unsureNewAsk, { title: T.unsureNewTitle, yes: T.unsureNewYes, no: T.no, danger: true }))) return;
    ridForget(Object.keys(U.rids)); unlock(); if (err) err.hidden = true;
  }
  U.run = async (fn, keep) => {
    if (!U.held) U.fn = fn; /* while locked: the entry of the first attempt is sent again, never a new one */
    else Object.keys(U.rids).forEach(k => ridPin(k, U.rids[k]));
    const mine = []; RidWatch.list = mine;
    let r; try { r = await U.fn(); } finally { if (RidWatch.list === mine) RidWatch.list = null; }
    if (r && !r.ok && !r.cancelled && r.code && RID_OPEN[r.code]) { mine.forEach(k => { const x = RIDS.get(k); if (x) U.rids[k] = x.rid; }); lock(keep); }
    else if (U.held && (!r || r.cancelled)) Object.keys(U.rids).forEach(k => ridPin(k, U.rids[k])); /* a question answered "No": still locked, same ID */
    else if (U.held) unlock();
    return r;
  };
  return U;
}

/* ================= forms ================= */
/* Field: {k, l, t, o, req, ph, hint, max, show(v), wide, len, cam, onEnter, sticker, ro}
   t: text | area | int | money | date | month | time | email | sel | mobile | pin | digits | check | code | multi | static */
function mkForm(fields, init, fo) {
  init = init || {}; fo = fo || {};
  const F = { el: h('div', { class: 'form' + (fo.cls ? ' ' + fo.cls : '') }), f: {}, dirty: false };
  const first = {};
  function optList(fd) { let o = typeof fd.o === 'function' ? fd.o() : (fd.o || []); return o.map(x => (typeof x === 'object' ? { v: String(x.v), t: x.t } : { v: String(x), t: String(x) })); }
  function fillSelect(sel, fd, cur) {
    clear(sel); const o = optList(fd);
    if (!fd.req || cur === '' || cur == null || fd.placeholder) sel.appendChild(h('option', { value: '', text: fd.ph || T.select }));
    if (cur != null && cur !== '' && !o.some(x => x.v === String(cur))) o.unshift({ v: String(cur), t: String(cur) });
    o.forEach(x => sel.appendChild(h('option', { value: x.v, text: x.t })));
    sel.value = cur == null ? '' : String(cur);
  }
  fields.forEach(fd => {
    if (!fd) return;
    const id = uid('i'), cur = init[fd.k] != null ? init[fd.k] : fd.dflt;
    let inp, wrap = h('div', { class: 'fld' + (fd.wide || fd.t === 'area' || fd.t === 'multi' || fd.t === 'static' ? ' wide' : '') + (fd.t === 'check' ? ' chk' : ''), dataset: { k: fd.k } });
    const label = h('label', { for: id }, fd.l, fd.req ? h('span', { class: 'req', 'aria-hidden': 'true', text: ' *' }) : null);
    const common = { id, 'aria-required': fd.req ? 'true' : null, placeholder: fd.ph && fd.t !== 'sel' ? fd.ph : null, autocomplete: 'off' };
    switch (fd.t) {
      case 'area': inp = h('textarea', Object.assign(common, { rows: 3, maxlength: fd.max || 300 })); inp.value = cur || ''; break;
      case 'sel': inp = h('select', common); fillSelect(inp, fd, cur); break;
      case 'check': inp = h('input', Object.assign(common, { type: 'checkbox' })); inp.checked = cur === true || cur === 'Y'; break;
      case 'date': inp = h('input', Object.assign(common, { type: 'date' })); inp.value = cur || ''; if (fd.maxToday) inp.max = todayISO(); break;
      case 'month': inp = h('input', Object.assign(common, { type: 'month' })); inp.value = cur || ''; break;
      case 'time': inp = h('input', Object.assign(common, { type: 'time' })); inp.value = cur || ''; break;
      case 'email': inp = h('input', Object.assign(common, { type: 'email', maxlength: 120 })); inp.value = cur || ''; break;
      case 'int': case 'money': inp = h('input', Object.assign(common, { type: 'text', inputmode: 'numeric', class: 'num' })); inp.value = cur == null || cur === '' ? '' : (fd.t === 'money' ? grp(cur) : digits(cur));
        inp.addEventListener('input', () => { const d = digits(inp.value).slice(0, 9); inp.value = fd.t === 'money' ? grp(d) : d; }); break;
      case 'mobile': inp = h('input', Object.assign(common, { type: 'text', inputmode: 'numeric', name: 'gj-contact-' + id, class: 'num' })); inp.value = cur || '';
        /* R32C-02: normMobile removes only non-digits and a +91 / 91 / 0 in front (a pasted "+91 98173 41229" shows 9817341229); it never
           cuts a number, so one digit too many stays visible with the "10-digit mobile" hint */
        inp.addEventListener('input', () => { const m = normMobile(inp.value); if (m !== inp.value) inp.value = m; const bad = inp.value !== '' && !validMobile(inp.value); wrap.classList.toggle('invalid', bad); hintEl.textContent = bad ? T.mobileHint : (fd.hint || ''); }); break;
      case 'pin': case 'digits': inp = h('input', Object.assign(common, { type: 'text', inputmode: 'numeric', name: 'gj-code-' + id, class: 'num' + (fd.t === 'pin' ? ' pin' : ''), maxlength: fd.len || 6, autocomplete: 'off', 'data-lpignore': 'true', 'data-1p-ignore': 'true' }));
        inp.value = cur || ''; inp.addEventListener('input', () => { inp.value = String(inp.value).replace(/\D+/g, '').slice(0, fd.len || 6); }); break;
      case 'multi': inp = h('div', { class: 'multi', id, role: 'group', 'aria-label': fd.l }); optList(fd).forEach(x => { const cid = uid('c');
        inp.appendChild(h('label', { class: 'tick', for: cid }, h('input', { type: 'checkbox', id: cid, value: x.v, checked: Array.isArray(cur) && cur.map(String).indexOf(x.v) >= 0 }), h('span', { text: x.t }))); }); break;
      case 'static': inp = h('div', { class: 'static', id }); append(inp, cur == null ? '' : cur); break;
      default: inp = h('input', Object.assign(common, { type: 'text', maxlength: fd.max || 60 })); inp.value = cur == null ? '' : cur;
        if (fd.t === 'code') { inp.classList.add('code'); inp.setAttribute('autocapitalize', 'characters'); inp.setAttribute('spellcheck', 'false'); }
    }
    if (fd.ro) inp.disabled = true;
    const hintEl = h('div', { class: 'hint', id: id + 'h', text: fd.hint || '' });
    if (fd.t === 'check') { wrap.appendChild(h('label', { class: 'tick', for: id }, inp, h('span', null, fd.l))); wrap.appendChild(hintEl); }
    else if (fd.t === 'code' && fd.cam !== false) { wrap.appendChild(label); wrap.appendChild(h('div', { class: 'codebox' }, inp, btn(T.camera, () => cameraScan(v => { inp.value = v; inp.dispatchEvent(new Event('input', { bubbles: true })); if (fd.onEnter) fd.onEnter(v); }), 'sec sm cam', { 'aria-label': T.camera }))); wrap.appendChild(hintEl); }
    else { wrap.appendChild(label); wrap.appendChild(inp); wrap.appendChild(hintEl); }
    if (fd.onEnter && inp.tagName === 'INPUT') inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.repeat) { e.preventDefault(); e.stopPropagation(); fd.onEnter(F.val(fd.k)); } });
    F.f[fd.k] = { fd, inp, wrap, hintEl };
    F.el.appendChild(wrap);
  });
  F.val = k => {
    const x = F.f[k]; if (!x) return undefined; const fd = x.fd, inp = x.inp;
    switch (fd.t) {
      case 'check': return inp.checked ? 'Y' : 'N';
      case 'int': case 'money': { const d = digits(inp.value).replace(/\.$/, ''); return d === '' || d === '-' ? undefined : Number(d); }
      case 'multi': return $$('input:checked', inp).map(c => c.value);
      case 'static': return undefined;
      case 'mobile': { const v = normMobile(inp.value); return v === '' ? undefined : v; }
      case 'code': { const v = fd.sticker ? normSticker(inp.value, fd.sticker) : normCode(inp.value); return v === '' ? undefined : v; }
      default: { const v = String(inp.value || '').trim(); return v === '' ? undefined : v; }
    }
  };
  F.visible = k => !F.f[k].wrap.hidden;
  F.get = () => { const v = {}; Object.keys(F.f).forEach(k => { if (F.visible(k)) { const x = F.val(k); if (x !== undefined) v[k] = x; } }); return v; };
  F.all = () => { const v = {}; Object.keys(F.f).forEach(k => { const x = F.val(k); if (x !== undefined) v[k] = x; }); return v; };
  F.sync = () => { const v = F.all(); Object.keys(F.f).forEach(k => { const fd = F.f[k].fd; if (fd.show) F.f[k].wrap.hidden = !fd.show(v); }); };
  F.set = (k, val) => { const x = F.f[k]; if (!x) return; if (x.fd.t === 'check') x.inp.checked = val === true || val === 'Y'; else if (x.fd.t === 'sel') fillSelect(x.inp, x.fd, val); else if (x.fd.t === 'money') x.inp.value = grp(val); else if (x.fd.t === 'static') { clear(x.inp); append(x.inp, val); } else x.inp.value = val == null ? '' : val; F.sync(); };
  F.setOpts = (k, o) => { const x = F.f[k]; x.fd.o = o; fillSelect(x.inp, x.fd, x.inp.value); };
  F.clearErr = () => Object.keys(F.f).forEach(k => { const x = F.f[k]; x.wrap.classList.remove('invalid'); x.inp.removeAttribute('aria-invalid'); if (x.fd.t !== 'mobile') x.hintEl.textContent = x.fd.hint || ''; });
  F.mark = (k, msg) => { const x = F.f[k]; if (!x) return false; x.wrap.classList.add('invalid'); x.inp.setAttribute('aria-invalid', 'true'); if (msg) x.hintEl.textContent = msg; if (!x.wrap.hidden && x.inp.focus) { try { x.inp.focus(); } catch (e) { /* ignore */ } } return true; };
  /* Client-side checks; returns '' or the first message. */
  F.check = () => {
    F.clearErr();
    for (const k of Object.keys(F.f)) {
      const x = F.f[k], fd = x.fd; if (!F.visible(k) || fd.ro) continue; const v = F.val(k);
      const empty = v === undefined || (fd.t === 'check' && fd.req && v !== 'Y') || (fd.t === 'multi' && fd.req && !v.length);
      if (fd.req && empty) { const msg = fmt(T.required, { field: fd.l }); F.mark(k, msg); return msg; }
      if (v === undefined) continue;
      if (fd.t === 'mobile' && !validMobile(v)) { F.mark(k, T.mobileHint); return T.mobileHint; }
      if (fd.t === 'pin' && v.length !== (fd.len || 6)) { F.mark(k, T.pinHint); return T.pinHint; }
      if (fd.t === 'digits' && fd.len && v.length !== fd.len) { const msg = fmt(T.invalid, { field: fd.l }); F.mark(k, msg); return msg; }
      if ((fd.t === 'int' || fd.t === 'money') && ((fd.min != null && v < fd.min) || (fd.maxv != null && v > fd.maxv))) { const msg = fmt(T.invalid, { field: fd.l }); F.mark(k, msg); return msg; }
      if (fd.noSticker && isSticker(v)) { const msg = T.serialIsSticker; F.mark(k, msg); return msg; }
    }
    return '';
  };
  F.changed = () => { const now = F.all(), out = {}; Object.keys(F.f).forEach(k => { if (F.f[k].fd.t === 'static') return; const a = now[k], b = first[k]; if (JSON.stringify(a === undefined ? null : a) !== JSON.stringify(b === undefined ? null : b)) out[k] = a === undefined ? '' : a; }); return out; };
  F.reset = () => { fields.forEach(fd => { if (fd && fd.t !== 'static') F.set(fd.k, fd.keep ? F.val(fd.k) : (init[fd.k] != null ? init[fd.k] : fd.dflt)); }); F.dirty = false; F.clearErr(); };
  F.el.addEventListener('input', () => { F.dirty = true; F.sync(); if (fo.onChange) fo.onChange(F); });
  F.el.addEventListener('change', () => { F.dirty = true; F.sync(); if (fo.onChange) fo.onChange(F); });
  F.sync(); Object.assign(first, F.all());
  return F;
}
Object.assign(T, { serialIsSticker: 'A sticker number was entered as the serial number.',
  /* R37B-01 */
  unsureLocked: 'This entry may already be saved, so the boxes are locked. Press the button again to send exactly the same entry: if it was saved, it is not saved twice. To enter something different, first check whether this entry was saved, then choose "Start a new entry".',
  unsureNew: 'Start a new entry', unsureNewTitle: 'Start a new entry?', unsureNewAsk: 'The entry you sent may already be saved. Do this only after you have checked that it was NOT saved - otherwise it is saved twice.', unsureNewYes: 'Yes, start a new entry',
  unsureLeaveTitle: 'Leave this entry?', unsureLeaveMsg: 'The entry you sent may already be saved. Before you type it again, check whether it was saved - otherwise it is saved twice. Leave this screen?', unsureLeaveYes: 'Leave', unsureStay: 'Stay here',
  /* R37B-02 */
  updateCountOpen: 'A count is open on this device. The new version starts after the count is closed or left.',
  /* R37B-04 */
  seDateToday: 'Sale date set to today ({date}).', seDateAskTitle: 'Check the sale date', seDateAsk: 'The sale date is {date}, but today is {today}. Use today\'s date?', seDateUseToday: 'Yes, use today', seDateKeep: 'No, keep {date}',
  /* R37B-05 */
  cfVerFormat: 'Enter the version as three numbers, for example 4.0.6.', cfVerAheadApp: 'This GJ App is version {have}. A minimum above it would lock this app out. Update the app first, then raise the limit.', cfVerAheadPd: 'The newest GJ Pendrive version known is {have} (the newest that an approved pendrive has reported). A minimum above it would lock every pendrive out. Update the pendrives first.',
  /* R37B-08 */
  apBulkList: 'These requests will be approved:', apBulkHidden: 'Only requests that are shown in the list now are approved.' });

/* Sends an action and walks the user through CONFIRM_* questions (the server names the key; the app never guesses). */
/* R4chaos-10 / P1 (2.G): the request ID is the one api() keeps for this action + data in this dialog (ridFor): after an answer that leaves
   it open whether the save reached the Sheet (NET, SYS_BUSY, SYS_ERROR - in ANY round, also a confirm round) pressing Save again with the
   same data re-uses it, so the server answers the stored result of an entry that did reach it instead of saving it twice. A definite answer
   (saved, refused, cancelled) forgets it. Confirm rounds use rid + '-c', the PIN round rid + '-p', as before. */
async function callConfirmed(action, data) {
  const rk = ridKey(action, data, ridScope());
  let rid = ridFor(rk), d = data, r = null;
  try { r = await confirmLoop(action, d, rid); return r; } finally { ridSettle(rk, r); }
}
async function confirmLoop(action, data, rid) {
  let d = data;
  for (let i = 0; i < 6; i++) {
    const r = await api(action, d, { rid });
    /* review F3: an owner override needs the PIN again - ask for it and send the same request again (once) */
    if (!r.ok && r.code === 'OVERRIDE_PIN_NEEDED' && !(d && d.pin) && typeof pinPrompt === 'function') {
      const pin = await pinPrompt(r.msg || T.pinAskIntro);
      if (!pin) return { ok: false, cancelled: true, code: 'CANCELLED', msg: T.pinCancelled };
      d = Object.assign({}, d, { pin }); rid += '-p'; continue;
    }
    if (r.ok || !r.confirm) return r;
    if (!(await confirmBox(r.msg, { yes: T.yes, no: T.no }))) return { ok: false, cancelled: true };
    d = Object.assign({}, d, { confirm: (d.confirm || []).concat([r.confirm]) }); rid += '-c';
  }
  return { ok: false, msg: T.errUnexpected };
}
/* Guarded button action: disabled while running, errors persistent. Returns the reply. */
async function runAction(b, action, data, o) {
  o = o || {};
  if (b && b.dataset.busy) return { ok: false, cancelled: true };
  if (b) { b.dataset.busy = '1'; b.disabled = true; }
  try {
    const r = await callConfirmed(action, data);
    if (r.cancelled) return r;
    if (!r.ok) { notify(r.msg, 'bad'); return r; }
    if (o.ok !== false) notify(typeof o.ok === 'function' ? o.ok(r) : (o.ok || T.saved), r.approvalId ? 'warn' : 'ok');
    if (o.refresh !== false) refresh();
    return r;
  } finally { if (b) { delete b.dataset.busy; b.disabled = false; } }
}
/* Standard action dialog: form + persistent error box + guarded Save (+ PIN box for actions marked PIN). */
function actionDialog(c) {
  const fields = (c.fields || []).slice();
  if (c.pin) fields.push({ k: 'pin', l: T.yourPin, t: 'pin', req: true });
  const F = mkForm(fields, c.init);
  const m = openModal({ title: c.title, wide: c.wide, dirty: () => F.dirty, focusFirst: true });
  const errBox = h('div', { class: 'errbox', role: 'alert', hidden: true });
  const U = unsureGuard(errBox, () => [m.body]); /* R37B-01 */
  const save = btn(c.submit || T.save, submit, c.danger ? 'bad' : '');
  if (c.intro) append(m.body, typeof c.intro === 'string' ? h('p', { class: 'intro', text: c.intro }) : c.intro);
  if (c.warn) append(m.body, note(c.warn, 'warn'));
  /* R31C-07: a dialog whose REQUIRED drop-down is empty because the lists failed to load cannot be saved; "Load the lists again" opens it
     again with what was typed */
  const optList = fd => { try { const o = typeof fd.o === 'function' ? fd.o({}) : fd.o; return Array.isArray(o) ? o : []; } catch (e) { return []; } };
  /* round 32: also an optional list box marked needList (device "Users allowed"): saved empty it would mean "all staff" */
  const listGap = !S.lists && fields.some(fd => fd && (fd.req || fd.needList) && (fd.t === 'sel' || fd.t === 'multi') && !optList(fd).length);
  if (listGap) {
    const rb = btn(T.listsRetry, async () => { rb.disabled = true; const ok = await ensureLists(); rb.disabled = false; if (!ok) { notify(T.listsFail, 'bad'); return; } const keep = F.all(); fields.forEach(fd => { if (fd && fd.t === 'multi' && !optList(fd).length) delete keep[fd.k]; }); F.dirty = false; m.close(); actionDialog(Object.assign({}, c, { init: Object.assign({}, c.init || {}, keep) })); }, 'sec', { id: 'dlgListsRetry' });
    m.body.appendChild(h('div', { class: 'note bad', role: 'alert', id: 'dlgListsFail' }, h('p', { text: T.listsFail }), rb));
  }
  m.body.appendChild(F.el);
  if (c.extra) c.extra(m.body, F, m);
  append(m.foot, [errBox, h('div', { class: 'foot-btns' }, btn(T.cancel, () => m.requestClose(), 'sec'), save)]);
  if (c.disableUntilChanged) { save.disabled = true; F.el.addEventListener('input', upd); F.el.addEventListener('change', upd); }
  function upd() { save.disabled = !Object.keys(F.changed()).length; }
  function fail(msg) { errBox.textContent = msg; errBox.hidden = false; }
  let busy = false;
  async function submit() {
    if (busy) return; errBox.hidden = true;
    const v = F.get(); let data = null;
    if (!U.held) { /* R37B-01: a locked form is not checked or built again - U.run resends the entry of the first attempt */
      if (listGap && !S.lists) { fail(T.listsFail); return; }
      const bad = F.check(); if (bad) { fail(bad); return; }
      if (c.validate) { const msg = c.validate(v, F); if (msg) { fail(msg); return; } }
      data = c.build ? c.build(v, F) : v; if (!data) return;
      if (c.pin && data.pin === undefined) data.pin = v.pin;
    }
    busy = true; save.disabled = true; const old = save.textContent; save.textContent = T.wait;
    let r; try { r = await U.run(() => (c.run ? c.run(data, v) : callConfirmed(c.action, data)), save); } finally { busy = false; save.disabled = false; save.textContent = old; }
    if (r.cancelled) return;
    if (!r.ok) { F.clearErr(); if (r.field) F.mark(r.field, ''); fail(r.msg); if ((c.pin || F.f.pin) && r.code === 'AUTH_PIN_WRONG') F.mark('pin', ''); return; }
    F.dirty = false; m.close();
    const msg = typeof c.ok === 'function' ? c.ok(r, v) : (c.ok || (r.approvalId ? T.sentForApproval : T.saved));
    if (msg) notify(msg, r.approvalId ? 'warn' : 'ok');
    if (r.serialPlaceholder === 'Y' && r.msg) notify(r.msg, 'warn'); /* round 1 B4 (R1A-13): a placeholder serial was stored as no serial */
    if (c.after) c.after(r, v);
    if (c.refresh !== false) refresh();
  }
  m.body.addEventListener('keydown', e => { if (e.key !== 'Enter' || e.target.tagName !== 'INPUT' || e.target.type === 'checkbox') return; e.preventDefault(); if (e.repeat || busy) return; submit(); });
  m.F = F; m.fail = fail;
  return m;
}

/* ================= loading ================= */
/* load(root, action, data, cb): spinner -> cb(reply, box), or an error card with "Try again". Returns the reload function. */
function load(root, action, data, cb) {
  const box = h('div', { class: 'loadbox' }); root.appendChild(box);
  let seq = 0;
  const run = async () => {
    const my = ++seq; clear(box); box.appendChild(spinner());
    const r = await api(action, typeof data === 'function' ? data() : data);
    if (!box.isConnected || my !== seq) return;
    clear(box);
    if (!r.ok) { box.appendChild(errorCard(r.msg, run)); return; }
    try { await cb(r, box); } catch (e) { console.error(e); clear(box); box.appendChild(errorCard(T.errUnexpected, run)); }
  };
  run();
  return run;
}
/* Re-reads what is on screen after an action: open cards first, then the view underneath. */
function refresh() { MODALS.forEach(m => { if (m.reload) m.reload(); }); if (S.refresh) S.refresh(); else if (typeof renderRoute === 'function') renderRoute(true); }

/* ================= tables, CSV, print ================= */
function cellText(c, row) { const v = c.v ? c.v(row) : row[c.k]; return v == null ? '' : v; }
function buildTable(cols, rows, o) {
  o = o || {};
  const table = h('table', { class: 'tbl' + (o.cards === false ? '' : ' cards') });
  const trh = h('tr');
  cols.forEach((c, i) => { const th = h('th', { scope: 'col', class: c.num ? 'num' : '' });
    if (o.onSort && c.sort !== false && !c.act) th.appendChild(h('button', { type: 'button', class: 'thbtn', dataset: { col: i }, 'aria-label': fmt(T.sortBy, { col: c.l }), text: c.l + (o.sortCol === i ? (o.sortDir > 0 ? ' ▲' : ' ▼') : '') })); else th.textContent = c.l; trh.appendChild(th); });
  table.appendChild(h('thead', null, trh));
  const tb = h('tbody'), anyCard = cols.some(c => c.card);
  rows.forEach((row, idx) => {
    const tr = h('tr', { dataset: { idx }, class: o.onRow ? 'click' : '', tabindex: o.onRow ? '0' : null });
    cols.forEach(c => { const td = h('td', { class: (c.num ? 'num ' : '') + (c.main ? 'main ' : '') + (c.act ? 'act' : '') + (anyCard && !c.card && !c.main && !c.act ? ' nocard' : ''), 'data-label': c.l }); append(td, c.el ? c.el(row, idx) : (c.fmt ? c.fmt(cellText(c, row), row) : String(cellText(c, row)))); tr.appendChild(td); });
    tb.appendChild(tr);
  });
  table.appendChild(tb);
  if (o.foot) { const tf = h('tfoot'); const tr = h('tr'); cols.forEach(c => tr.appendChild(h('td', { class: c.num ? 'num' : '', 'data-label': c.l, text: o.foot[c.k] == null ? '' : (c.fmt ? c.fmt(o.foot[c.k]) : String(o.foot[c.k])) }))); tf.appendChild(tr); table.appendChild(tf); }
  const pick = e => { const tr = e.target.closest('tr[data-idx]'); return tr ? { row: rows[Number(tr.dataset.idx)], idx: Number(tr.dataset.idx) } : null; };
  tb.addEventListener('click', e => { const p = pick(e); if (!p) return; const a = e.target.closest('[data-act]'); if (a) { if (o.onAct) o.onAct(a.dataset.act, p.row, a, p.idx); return; } if (e.target.closest('input,select,a,button,label')) return; if (o.onRow) o.onRow(p.row, p.idx); });
  tb.addEventListener('keydown', e => { if (e.key !== 'Enter' || e.repeat || e.target.tagName !== 'TR') return; const p = pick(e); if (p && o.onRow) o.onRow(p.row, p.idx); });
  if (o.onSort) table.tHead.addEventListener('click', e => { const b = e.target.closest('.thbtn'); if (b) o.onSort(Number(b.dataset.col)); });
  return h('div', { class: 'tblwrap' }, table);
}
function simpleTable(cols, rows, o) { o = o || {}; return rows && rows.length ? buildTable(cols, rows, o) : h('p', { class: 'empty', text: o.empty || T.noRows }); }
function csvCell(v) { let s = v == null ? '' : String(v); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return /[",\r\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function downloadCsv(name, cols, rows) {
  const cc = cols.filter(c => !c.act && !c.noCsv);
  /* UI-09 / UI-05: every column has a header; no Devanagari gloss in a CSV header (Excel on the counter PC) */
  const head = c => String(c.csvL || c.l || humanCode(String(c.k || '').replace(/([a-z])([A-Z])/g, '$1_$2'))).replace(/\s*\([^)]*[\u0900-\u097F][^)]*\)/g, '');
  const lines = [cc.map(c => csvCell(head(c))).join(',')].concat(rows.map(r => cc.map(c => csvCell(c.csv ? c.csv(r) : cellText(c, r))).join(',')));
  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'GJ_' + name + '_' + todayISO() + '.csv' });
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  api('report.exported', { report: name, rows: rows.length }, { noLock: true });
}
/* Prints through the hidden same-page print area (no pop-ups). */
function printNode(title, node) {
  const p = clear($('#print'));
  p.appendChild(h('div', { class: 'print-head', text: T.shop + ' – ' + title + ' – ' + fmtDate(todayISO()) + ' – ' + fmt(T.printedBy, { user: S.me ? S.me.name : '' }) }));
  p.appendChild(node);
  document.body.classList.add('printing');
  const done = () => { document.body.classList.remove('printing'); clear(p); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}
function printTable(title, cols, rows) { printNode(title, buildTable(cols.filter(c => !c.act), rows, { cards: false })); }
function tools(name, title, cols, getRows) {
  return h('div', { class: 'tools' },
    btn(T.csv, async e => { const b = e.currentTarget; b.disabled = true; try { downloadCsv(name, cols, await getRows()); } finally { b.disabled = false; } }, 'sec sm', { 'data-tool': 'csv' }),
    btn(T.print, async e => { const b = e.currentTarget; b.disabled = true; try { printTable(title, cols, await getRows()); } finally { b.disabled = false; } }, 'sec sm', { 'data-tool': 'print' }));
}

/* listView: search + filters + sortable headers + "Showing X of Y" + Load more + CSV + Print. No silent caps. */
function listView(root, c) {
  const st = { q: '', rows: [], total: 0, sortCol: -1, sortDir: 1, seq: 0, busy: false };
  const limit = c.limit || 100;
  const cols = c.cols.filter(x => x && !(x.hide && x.hide()));
  const F = c.filters && c.filters.length ? mkForm(c.filters, c.filterInit || {}, { cls: 'filters' }) : null;
  const qIn = c.search === false ? null : h('input', { type: 'search', class: 'q', placeholder: c.searchPh || T.search, 'aria-label': T.search, autocomplete: 'off', maxlength: 60 });
  const info = h('div', { class: 'list-info', 'aria-live': 'polite' }), body = h('div', { class: 'list-body' }), more = btn(T.loadMore, () => fetchPage(false), 'sec', { hidden: true });
  const filt = F ? h('details', { class: 'filt' }, h('summary', { text: T.filters }), F.el) : null; if (filt) filt.open = window.innerWidth > 640;
  const bar = h('div', { class: 'listbar' }, qIn, filt, tools(c.name, c.title || c.name, cols, allRows));
  append(root, [bar, info, body, h('div', { class: 'more' }, more)]);
  const params = () => { const p = Object.assign({}, c.params ? c.params() : {}, F ? F.get() : {}, st.q ? { q: st.q } : {}); return c.map ? c.map(p) : p; };
  async function fetchPage(reset) {
    const my = ++st.seq; if (reset) { st.rows = []; st.total = 0; clear(body).appendChild(spinner()); info.textContent = ''; more.hidden = true; }
    more.disabled = true;
    const r = await api(c.action, Object.assign(params(), { offset: st.rows.length, limit }));
    more.disabled = false;
    if (my !== st.seq || !body.isConnected) return false;
    if (!r.ok) { if (reset) { clear(body).appendChild(errorCard(r.msg, () => fetchPage(true))); } else notify(r.msg, 'bad'); return false; }
    const got = (r[c.rowsKey || 'rows'] || []).map(c.mapRow || (x => x));
    st.rows = st.rows.concat(got); st.total = typeof r.total === 'number' ? r.total : st.rows.length;
    if (!got.length) st.total = st.rows.length;
    st.last = r; if (reset && c.onData) c.onData(r);
    draw(); return true;
  }
  /* every page; a page that fails leaves the list incomplete - that is said out loud (round 1 B2, R1B-11) */
  async function allRows() { while (st.rows.length < st.total) { if (!(await fetchPage(false))) break; } if (st.rows.length < st.total) notify(fmt(T.listPartial, { x: st.rows.length.toLocaleString('en-IN'), y: st.total.toLocaleString('en-IN') }), 'bad'); return st.rows; }
  function sortRows() {
    if (st.sortCol < 0) return; const col = cols[st.sortCol];
    const key = r => { const v = col.sv ? col.sv(r) : cellText(col, r); return typeof v === 'number' ? v : String(v).toLowerCase(); };
    st.rows.sort((a, b) => { const x = key(a), y = key(b); return (x < y ? -1 : x > y ? 1 : 0) * st.sortDir; });
  }
  function draw() {
    sortRows(); clear(body);
    info.textContent = st.rows.length ? fmt(T.showing, { x: st.rows.length.toLocaleString('en-IN'), y: st.total.toLocaleString('en-IN') }) : '';
    more.hidden = st.rows.length >= st.total;
    if (!st.rows.length) { body.appendChild(h('p', { class: 'empty', text: c.empty || T.noRows })); return; }
    body.appendChild(buildTable(cols, st.rows, { onRow: c.onRow, onAct: c.onAct, sortCol: st.sortCol, sortDir: st.sortDir,
      onSort: async i => { if (st.sortCol === i) st.sortDir = -st.sortDir; else { st.sortCol = i; st.sortDir = 1; } await allRows(); draw(); } }));
  }
  let deb = null;
  if (qIn) { qIn.addEventListener('input', () => { clearTimeout(deb); deb = setTimeout(() => { st.q = qIn.value.trim(); fetchPage(true); }, 450); });
    qIn.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.repeat) { clearTimeout(deb); st.q = qIn.value.trim(); fetchPage(true); } }); }
  if (F) F.el.addEventListener('change', () => fetchPage(true));
  fetchPage(true);
  return { reload: () => { const keep = window.scrollY; return fetchPage(true).then(() => window.scrollTo(0, keep)); }, rows: () => st.rows, allRows, total: () => st.total, last: () => st.last, filters: F };
}

/* ================= camera scanning ================= */
function cameraScan(cb) {
  const hasDetector = 'BarcodeDetector' in window, hasFallback = !!(window.GJDecoder && window.GJDecoder.decode);
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || (!hasDetector && !hasFallback)) { notify(T.cameraUnsupported, 'bad'); return; }
  const video = h('video', { class: 'cam', playsinline: '', muted: '' });
  const m = openModal({ title: T.camera, body: [video, h('p', { class: 'hint', text: T.cameraHint })] });
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
  let stream = null, live = true, timer = null;
  camStop = () => { live = false; clearTimeout(timer); if (stream) stream.getTracks().forEach(t => t.stop()); stream = null; };
  navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(s => {
    if (!live) { s.getTracks().forEach(t => t.stop()); return; }
    stream = s; video.srcObject = s; video.play().catch(() => {});
    const det = hasDetector ? new window.BarcodeDetector() : null; const cv = document.createElement('canvas');
    const tick = async () => {
      if (!live) return; let code = '';
      try {
        if (det) { const r = await det.detect(video); if (r && r.length) code = r[0].rawValue; }
        else if (video.videoWidth) { cv.width = video.videoWidth; cv.height = video.videoHeight; const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(video, 0, 0); code = window.GJDecoder.decode(g.getImageData(0, 0, cv.width, cv.height)) || ''; }
      } catch (e) { /* keep trying */ }
      if (code && live) { m.close(); cb(String(code).trim()); return; }
      timer = setTimeout(tick, 250);
    };
    tick();
  }).catch(() => { if (m.el.isConnected) m.close(); notify(T.cameraDenied, 'bad'); });
}
