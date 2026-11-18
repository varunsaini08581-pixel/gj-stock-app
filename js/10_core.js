/* GJ App v4 — core: DOM helpers, formatting, TRANSPORT (the only code that talks to the server), api(). */
'use strict';

/* ================= DOM helpers (all dynamic text goes through textContent) ================= */
const $ = (sel, root) => (root || document).querySelector(sel);
const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
/* h('div', {class:'x', onclick:fn, dataset:{idx:1}}, child, 'text', [more]) */
function h(tag, attrs) {
  const el = document.createElement(tag);
  if (attrs) for (const k of Object.keys(attrs)) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'dataset') for (const d of Object.keys(v)) el.dataset[d] = v[d];
    else if (k.slice(0, 2) === 'on' && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'value') el.value = v;
    else if (k === 'checked' || k === 'disabled' || k === 'hidden' || k === 'selected' || k === 'readOnly' || k === 'multiple') el[k] = !!v;
    else el.setAttribute(k, v === true ? '' : String(v));
  }
  for (let i = 2; i < arguments.length; i++) append(el, arguments[i]);
  return el;
}
function append(el, kid) {
  if (kid == null || kid === false) return;
  if (Array.isArray(kid)) { kid.forEach(k => append(el, k)); return; }
  el.appendChild(kid instanceof Node ? kid : document.createTextNode(String(kid)));
}
function clear(el) { while (el.firstChild) el.removeChild(el.firstChild); return el; }
function show(el, on) { if (el) el.hidden = !on; }
let _uid = 0;
const uid = p => (p || 'f') + (++_uid);

/* ================= formatting ================= */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/* digits (R4chaos-09): the digits before the first "." (paise are not used, "21500.00" stays 21,500), a trailing "." is kept so typing goes on
   ignoring the paise, a leading minus is kept so the server refuses a negative amount instead of the app turning it positive */
const digits = s => { s = String(s == null ? '' : s); const dot = s.indexOf('.'), neg = /^\s*-/.test(s); return (neg ? '-' : '') + (dot >= 0 ? s.slice(0, dot) : s).replace(/\D+/g, '') + (dot >= 0 ? '.' : ''); };
function grp(n) { const d = digits(n); if (!d || d === '-' || d === '.' || d === '-.') return d === '-' ? '-' : ''; const t = d.replace(/\.$/, ''); return (t === '-' ? '-' : Number(t).toLocaleString('en-IN')) + (/\.$/.test(d) ? '.' : ''); }
function money(n) { if (n === '' || n == null || isNaN(Number(n))) return T.notSet; const v = Number(n); return (v < 0 ? '−' : '') + T.rs + Math.abs(v).toLocaleString('en-IN'); }
function fmtDate(s) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(s || '')); return m ? m[3] + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] : (s ? String(s) : T.notSet); }
function fmtDT(s) { const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(s || '')); return m ? m[3] + ' ' + MONTHS[Number(m[2]) - 1] + ' ' + m[1] + ', ' + m[4] + ':' + m[5] : fmtDate(s); }
function todayISO() { const d = new Date(Date.now() + Net.offset()); const p = n => String(n).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function nowISO() { const d = new Date(Date.now() + Net.offset()); const p = n => String(n).padStart(2, '0'); return todayISO() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()) + ':' + p(d.getSeconds()); }
function thisMonth() { return todayISO().slice(0, 7); }
function normMobile(s) { const d = String(s == null ? '' : s).replace(/\D+/g, ''); return d.length > 10 ? d.slice(-10) : d; }
const validMobile = s => /^[6-9]\d{9}$/.test(s);
/* Sticker normalisation: gj42, "GJ 42", GJ-0042 -> GJ-0042; other text upper-cased. */
function normCode(s) { const t = String(s || '').trim().toUpperCase(); const m = /^(GJ|RJ)[\s-]*0*(\d{1,9})$/.exec(t); return m ? m[1] + '-' + m[2].padStart(4, '0') : t; }
function normSticker(s, prefix) { const t = String(s || '').trim().toUpperCase(); const m = /^0*(\d{1,9})$/.exec(t); return m ? prefix + '-' + m[1].padStart(4, '0') : normCode(t); }
const isSticker = s => /^(GJ|RJ)-?\d+$/i.test(String(s || '').trim());
const hex = buf => Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
const sleep = ms => new Promise(r => setTimeout(r, ms));
function cmpVer(a, b) { const x = String(a || '0').split('.').map(Number), y = String(b || '0').split('.').map(Number); for (let i = 0; i < 3; i++) { if ((x[i] || 0) !== (y[i] || 0)) return (x[i] || 0) < (y[i] || 0) ? -1 : 1; } return 0; }

/* ================= TRANSPORT =================
   Everything that knows the wire format lives in Net: device key storage (IndexedDB), envelope, HMAC signature,
   time offset, timeout, retry with the same request id. Views call api() only. To point the app at another server,
   change window.GJ_API in config.js; no view code changes. */
const Net = (() => {
  const cfg = Object.assign({ timeoutMs: 40000, retryMs: [1000, 3000, 6000] }, window.GJ_NET || {});
  const url = () => window.GJ_API || '';
  const enc = new TextEncoder();
  let dbP = null, dev, off = 0, online = true;
  const listeners = [];

  function db() {
    if (!dbP) {
      dbP = new Promise((res, rej) => {
        let r; try { r = indexedDB.open('gj-app', 1); } catch (e) { rej(e); return; }
        r.onupgradeneeded = () => { if (!r.result.objectStoreNames.contains('kv')) r.result.createObjectStore('kv'); };
        r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error || new Error('idb')); r.onblocked = () => rej(new Error('idb blocked'));
      });
      dbP.catch(() => { dbP = null; });
    }
    return dbP;
  }
  async function kv(mode, fn) { const d = await db(); return new Promise((res, rej) => { const tx = d.transaction('kv', mode); const rq = fn(tx.objectStore('kv')); tx.oncomplete = () => res(rq && rq.result); tx.onerror = tx.onabort = () => rej(tx.error || new Error('idb')); }); }
  const kvGet = k => kv('readonly', s => s.get(k));
  const kvSet = (k, v) => kv('readwrite', s => s.put(v, k));
  const kvDel = k => kv('readwrite', s => s.delete(k));

  /* Device record {id, key (non-extractable CryptoKey), label}. Read once, kept in memory. Throws when storage is blocked. */
  async function device() { if (dev === undefined) dev = (await kvGet('device')) || null; return dev; }
  async function pendingDevice() { return (await kvGet('pendingDevice')) || null; }
  /* Creates the key and stores it as "unconfirmed" BEFORE the first server call, so a lost reply can be retried with the same id + secret. */
  async function createPending(label) {
    const raw = crypto.getRandomValues(new Uint8Array(32)); const secret = hex(raw);
    const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']); raw.fill(0);
    const rec = { id: crypto.randomUUID(), key, label, secret }; await kvSet('pendingDevice', rec); return rec;
  }
  async function confirmPending() { const p = await pendingDevice(); if (!p) return; dev = { id: p.id, key: p.key, label: p.label }; await kvSet('device', dev); await kvDel('pendingDevice'); try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { /* optional */ } }
  async function dropPending() { await kvDel('pendingDevice'); }
  /* Called ONLY after a successful reply that says REVOKED / REPLACED / UNKNOWN (F400). */
  async function forgetDevice() { dev = null; await kvDel('device'); }

  function setOnline(v) { if (online !== v) { online = v; listeners.forEach(f => { try { f(v); } catch (e) { /* ignore */ } }); } }
  const nonce = () => hex(crypto.getRandomValues(new Uint8Array(12)));

  async function once(action, data, o) {
    const d = o.device || (o.unsigned ? null : await device());
    const p = JSON.stringify({ pv: PROTOCOL_VERSION, a: action, d: o.deviceId || (d ? d.id : ''), k: 'WEB', v: APP_VERSION, ts: Date.now() + off, n: nonce(), rid: o.rid, s: o.session || '', data: data || {} });
    let sig = ''; if (d && d.key && !o.unsigned) sig = hex(await crypto.subtle.sign('HMAC', d.key, enc.encode(p)));
    const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), cfg.timeoutMs);
    try {
      const resp = await fetch(url(), { method: 'POST', body: JSON.stringify({ p, sig }), signal: ac.signal, redirect: 'follow', cache: 'no-store', headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      const j = await resp.json(); if (!j || typeof j.ok !== 'boolean') throw new Error('bad reply');
      return j;
    } finally { clearTimeout(tm); }
  }
  /* Sends one logical request. Never throws; returns the server reply or {ok:false, code:'NET'}. */
  async function send(action, data, o) {
    o = Object.assign({}, o); o.rid = o.rid || crypto.randomUUID();
    let skewDone = false, last = null;
    for (let i = 0; ; i++) {
      let r = null;
      try { r = await once(action, data, o); } catch (e) { r = null; if (e && e.name === 'InvalidStateError') return { ok: false, code: 'STORAGE', msg: T.storageBlocked }; }
      if (r) {
        setOnline(true);
        if (typeof r.serverTime === 'number' && (r.code === 'TS_SKEW' || action === 'sys.time')) off = r.serverTime - Date.now();
        if (!r.ok && r.code === 'TS_SKEW' && !skewDone) { skewDone = true; i--; continue; }
        if (!(r.ok === false && r.code === 'SYS_BUSY')) return r;
        last = r;
      }
      if (i >= cfg.retryMs.length) break;
      await sleep(cfg.retryMs[i]);
    }
    if (last) return last;
    setOnline(false);
    return { ok: false, code: 'NET', msg: T.netFail };
  }
  async function syncTime() { const r = await send('sys.time', {}, { unsigned: true }); return !!(r && r.ok); }
  return { send, syncTime, device, pendingDevice, createPending, confirmPending, dropPending, forgetDevice,
    offset: () => off, isOnline: () => online, onOnline: f => listeners.push(f), setOnline, configured: () => /^(https?:\/\/|\/)/.test(url()) };
})();

/* ================= api(): one entry point for every view =================
   Returns the reply object (never throws). Handles: version gate, session end (lock overlay then one retry),
   device state, forced PIN change. Views show r.msg; they use r.code only for behaviour. */
const S = { me: null, token: '', mobile: '', lists: null, idleMin: 15, locked: false, route: { view: '', arg: '' }, tok: 0, dirty: false, deviceLabel: '' };
const Hooks = { lock: null, update: null, pending: null, deviceGone: null, forcePin: null };

/* fix round 5 (R5access-03): actions that hand out owner-level power are sent with the PIN of the signed-in person - asked in a small dialog */
const PIN_FIRST = { 'admin.userSave': 1, 'admin.deviceSave': 1, 'admin.pinReset': 1, 'admin.unlock': 1, 'admin.networkAdd': 1, 'alerts.ackType': 1 }; /* fix round 7 (R7sec-09) */
let _pinMemo = null; /* one PIN entry serves the requests of the next 20 seconds (bulk revoke, a confirm round-trip) */
async function api(action, data, o) {
  o = o || {};
  if (PIN_FIRST[action] && !(data && data.pin !== undefined) && typeof pinPrompt === 'function') {
    let pin = _pinMemo && Date.now() - _pinMemo.at < 20000 ? _pinMemo.pin : await pinPrompt();
    if (!pin) return { ok: false, cancelled: true, code: 'CANCELLED', msg: T.pinCancelled };
    _pinMemo = { pin, at: Date.now() }; data = Object.assign({}, data || {}, { pin });
    const r0 = await api(action, data, o); if (!r0.ok && r0.code === 'AUTH_PIN_WRONG') _pinMemo = null; return r0;
  }
  const rid = o.rid || crypto.randomUUID();
  let r = await Net.send(action, data, { rid, session: o.noSession ? '' : S.token, unsigned: o.unsigned, device: o.device, deviceId: o.deviceId });
  if (r.minApp && cmpVer(APP_VERSION, r.minApp) < 0 || r.code === 'CLIENT_OUTDATED') { if (Hooks.update) Hooks.update(); return r; }
  if (r.ok || o.raw) return r;
  if (!r.msg) r.msg = fmt(T.errGeneric, { code: r.code || '?' });
  if (r.code === 'AUTH_SESSION' && S.me && !o.noLock && Hooks.lock) {
    await Hooks.lock('session');
    r = await Net.send(action, data, { rid, session: S.token });
    if (!r.ok && !r.msg) r.msg = fmt(T.errGeneric, { code: r.code || '?' });
    return r;
  }
  if (r.code === 'DEVICE_PENDING' && Hooks.pending && !o.noDevice) { Hooks.pending(); return r; }
  if ((r.code === 'DEVICE_REVOKED' || r.code === 'DEVICE_UNKNOWN') && Hooks.deviceGone && !o.noDevice) { Hooks.deviceGone(); return r; }
  if (r.code === 'AUTH_PIN_CHANGE' && Hooks.forcePin && !o.noLock) { Hooks.forcePin(); return r; }
  return r;
}
const has = p => !!(S.me && Array.isArray(S.me.perms) && S.me.perms.indexOf(p) >= 0);
const role = () => (S.me ? S.me.role : '');
const isAdmin = () => role() === 'ADMIN';
const isMgr = () => role() === 'ADMIN' || role() === 'MANAGER';
/* Lists from meta.lists (always an object, so views never crash when it failed to load). */
function L() { return S.lists || { brands: [], ramGb: [], storage: [], partTypes: [], specs: {}, problems: [], outsideReasons: [], custWarrantyDays: [], kit: [], accItems: [], users: [], partners: [], dealers: [], config: {} }; }
const userName = id => { const u = (L().users || []).find(x => x.userId === id); return u ? u.name : (id || ''); };
const userOpts = filter => (L().users || []).filter(u => !filter || filter(u)).map(u => ({ v: u.userId, t: u.name + ' (' + lbl('ROLE', u.role) + ')' }));
