/* GJ App v4 — shell: routing and history, idle lock overlay, version gate, device registration, login, PIN change. */
'use strict';
Object.assign(T, {
  setupTitle: 'Setup incomplete', setupMsg: 'The server URL is missing in config.js.',
  regTitle: 'Register this device', regIntro: 'You are registering this computer or phone for the first time. It will work only after the owner approves it.',
  regErased: 'This device is not registered (or its saved key was erased by the browser).', regGone: 'This device has been disabled or is no longer recognised. Please register it again.',
  regRejected: 'The request for this device was rejected or removed. You can register again.',
  regIos: 'Add GJ App to the Home Screen first, then register. (Share button → "Add to Home Screen", then open GJ App from the Home Screen.)',
  rescueCode: 'Rescue code (owner only)', rescueHint: 'Shown by rescueAdminDevice() in the script editor, e.g. AB2C-D3EF.',
  devName: 'Device name', devNamePh: 'e.g. Repair Desktop / Sales Counter', yourMobile: 'Your mobile number', yourPinL: 'Your PIN', register: 'Register',
  pendTitle: 'Waiting for approval', pendMsg: 'The request has been sent to the owner. This device will work as soon as it is approved.', pairCode: 'Pairing code (the owner types this code when approving)',
  checkStatus: 'Check status', stillPending: 'Still waiting for approval.', startFail: 'Could not reach the server. This device stays registered. Check the internet connection and try again.',
  loginTitle: 'Sign in', mobile: 'Mobile number', pin: 'PIN', signIn: 'Sign in',
  pinTitle: 'Change my PIN', pinForced: 'Set a new PIN', pinForcedMsg: 'You must set a new PIN before continuing. Do not share it with anyone.',
  pinRules: 'The PIN has 6 digits. Not allowed: the same digit six times (111111), a run such as 123456 or 654321, or parts of your mobile number.',
  pinOld: 'Current PIN', pinNew: 'New PIN', pinNew2: 'Confirm new PIN', pinMismatch: 'The two new PINs do not match.', pinChanged: 'PIN changed.', pinChange: 'Change PIN',
  welcome: 'Welcome, {name}', skip: 'Skip to content',
  listsFail: 'The lists (staff, dealers, partners, kit items) could not be loaded. Check the internet and press "Load the lists again". This form cannot be used until they are loaded.', listsRetry: 'Load the lists again'
});

/* ================= routing ================= */
const VIEWS = {};
const ROUTE_ALIAS = { alert: 'alerts', approval: 'approvals', job: 'jobs' };
let navDepth = 0;
function parseHash() {
  const s = location.hash.replace(/^#\/?/, ''); const i = s.indexOf('/');
  let view = i < 0 ? s : s.slice(0, i), arg = '';
  if (i >= 0) { try { arg = decodeURIComponent(s.slice(i + 1)); } catch (e) { arg = ''; } }
  view = ROUTE_ALIAS[view] || view || 'home';
  return { view, arg };
}
async function go(view, arg) {
  if (S.dirty && !(await askDiscard())) return;
  S.dirty = false; closeAllModals(); await historyIdle();
  const hash = '#' + view + (arg ? '/' + encodeURIComponent(arg) : '');
  if (location.hash !== hash) { history.pushState({ v: view }, '', hash); navDepth++; }
  renderRoute();
}
function goBack() { if (navDepth > 0) history.back(); else go('home'); }
function renderRoute(keepScroll) {
  if (!S.me || S.forcedPin) return;
  const r = parseHash(); let v = VIEWS[r.view]; if (!v) { r.view = 'home'; r.arg = ''; v = VIEWS.home; }
  if (S.leave) { const f = S.leave; S.leave = null; try { f(); } catch (e) { /* ignore */ } } /* R37B-02: the screen that is left tidies up (an open count is no longer "open on this device") */
  S.route = r; S.tok++; S.dirty = false; S.refresh = null; S.keys = null; S.hold = null; S.typed = false; S.listsWait = false;
  const root = clear($('#view'));
  document.title = v.title ? v.title + ' · ' + T.appName : T.appName;
  if (v.perm && !v.perm()) { root.appendChild(errorCard(T.noPerm)); root.appendChild(btn(T.home, () => go('home'), 'sec')); return; }
  try { v.render(root, r.arg); } catch (e) { console.error(e); root.appendChild(errorCard(T.errUnexpected)); }
  if (!keepScroll) window.scrollTo(0, 0);
  drawFooter();
  /* R31C-07: lists that failed to load are asked again at every screen change; a screen that waits for them is drawn again once they are in */
  if (!S.lists) { const tok = S.tok; ensureLists().then(ok => { if (ok && S.tok === tok && S.listsWait && !S.dirty && !S.typed && !MODALS.length) renderRoute(true); }); }
}
/* R31C-07: meta.lists. A failure is never kept as "empty lists": S.lists stays null, it is asked again, and the forms that need the lists
   (Sell, Receive, the rota and every dialog whose required list is empty) are blocked with "Load the lists again" until it is loaded. */
let listsP = null;
function ensureLists() {
  if (S.lists) return Promise.resolve(true);
  if (!listsP) listsP = api('meta.lists', {}).then(r => { listsP = null; if (r && r.ok) { S.lists = r; return true; } return false; }, () => { listsP = null; return false; });
  return listsP;
}
function needLists(root) {
  if (S.lists) return false;
  S.listsWait = true;
  const b = btn(T.listsRetry, async () => { b.disabled = true; const ok = await ensureLists(); b.disabled = false; if (ok) renderRoute(true); else notify(T.listsFail, 'bad'); }, '', { id: 'listsRetry' });
  root.appendChild(h('div', { class: 'card errcard', role: 'alert', id: 'listsFail' }, h('p', { class: 'errmsg', text: T.listsFail }), b));
  return true;
}
/* R31C-08: typed data on the screen (outside a dialog) - the update reload waits for it */
document.addEventListener('input', e => { const v = $('#view'); if (v && e.target && v.contains(e.target) && !e.target.hasAttribute('data-scanbox')) S.typed = true; }, true);
document.addEventListener('change', e => { const v = $('#view'); if (v && e.target && v.contains(e.target) && !e.target.hasAttribute('data-scanbox')) S.typed = true; }, true);
function viewHead(root, title, actions) {
  const head = h('div', { class: 'vhead' }, S.route.view === 'home' ? null : btn(T.back, goBack, 'ghost back'), h('h1', { text: title }), h('div', { class: 'vactions' }, actions || null));
  root.appendChild(head); return head;
}
window.addEventListener('popstate', () => {
  if (skipPop > 0) { popDone(); return; }
  if (S.locked) { skipPop++; history.forward(); return; }
  const m = topModal(), to = parseHash();
  if (m && (to.view !== S.route.view || to.arg !== S.route.arg)) { closeModal(MODALS[0], 'nav'); S.dirty = false; renderRoute(); return; }   /* a link or typed address while a dialog is open */
  if (m) {
    if (!m.closable) { history.pushState({ modal: MODALS.length }, ''); m.pushed = true; return; }
    if ((m.dirty && m.dirty()) || unsureHeld(m.box)) { history.pushState({ modal: MODALS.length }, ''); m.pushed = true; askDiscard().then(y => { if (y) closeModal(m, false); }); return; }
    closeModal(m, true); return;
  }
  if (S.dirty) { skipPop++; history.forward(); askDiscard().then(y => { if (y) { S.dirty = false; history.back(); } }); return; }
  if (navDepth > 0) navDepth--;
  renderRoute();
});
window.addEventListener('beforeunload', e => { if (S.dirty || unsureHeld() || MODALS.some(m => m.dirty && m.dirty())) { e.preventDefault(); e.returnValue = ''; } });

/* ================= footer, offline banner, version gate ================= */
function drawFooter() {
  const f = $('#foot'); if (!f) return; clear(f);
  const on = Net.isOnline() && navigator.onLine !== false;
  append(f, [h('span', { text: fmt(T.footVersion, { v: APP_VERSION }) }), S.deviceLabel ? h('span', { text: fmt(T.footDevice, { d: S.deviceLabel }) }) : null,
    S.me ? h('span', { text: fmt(T.footUser, { u: S.me.name }) }) : null, h('span', { class: on ? 'conn on' : 'conn off', text: on ? T.footOnline : T.footOffline })]);
  show($('#offline'), !on);
}
Net.onOnline(drawFooter);
window.addEventListener('online', () => { Net.setOnline(true); drawFooter(); });
window.addEventListener('offline', drawFooter);
function showUpdate() {
  if (document.body.classList.contains('stale')) return;
  document.body.classList.add('stale'); $('#app').inert = true; $('#modals').inert = true;
  const u = clear($('#update')); u.hidden = false;
  append(u, h('div', { class: 'overlay-box', role: 'alertdialog', 'aria-modal': 'true', 'aria-label': T.updateTitle }, h('h2', { text: T.updateTitle }), h('p', { text: T.updateMsg }),
    btn(T.updateNow, async e => { e.currentTarget.disabled = true; try { const reg = navigator.serviceWorker && await navigator.serviceWorker.getRegistration(); if (reg) await reg.update(); } catch (x) { /* reload anyway */ } location.reload(); }, '', { 'data-autofocus': '' })));
}
Hooks.update = showUpdate;

/* ================= idle lock (overlay above the current view; drafts are kept) ================= */
let idleTimer = null, lockP = null;
/* R37B-03: the idle lock goes by the WALL CLOCK, not by one timer. A timer does not run while the device sleeps (lid closed, phone screen
   off), so the old single setTimeout woke up unlocked and the first touch re-armed it. lastAct is the time of the last key / touch;
   idleCheck() locks when more than the idle limit has passed. It runs when the timer fires, every 15 seconds, when the page becomes
   visible / gets the focus / is resumed, and BEFORE a key or touch counts as activity - that first touch after a long gap locks the
   screen and is swallowed (it does not press what is under it). */
let lastAct = Date.now();
const idleMs = () => Math.max(0.02, Number(S.idleMin) || 15) * 60000;
function idleCheck() {
  if (!S.me || S.locked) return false;
  const gone = Date.now() - lastAct;
  if (gone < 0) { lastAct = Date.now(); return false; } /* the clock was set back */
  if (gone < idleMs()) return false;
  lockScreen('idle'); return true;
}
function armIdle() {
  clearTimeout(idleTimer); lastAct = Date.now();
  const tick = () => { if (!S.me || S.locked || idleCheck()) return; idleTimer = setTimeout(tick, Math.max(50, idleMs() - (Date.now() - lastAct))); };
  if (S.me && !S.locked) idleTimer = setTimeout(tick, idleMs());
}
['keydown', 'pointerdown', 'input'].forEach(ev => document.addEventListener(ev, e => { if (!S.me || S.locked) return; if (idleCheck()) { if (e.cancelable) e.preventDefault(); e.stopPropagation(); } else armIdle(); }, true));
document.addEventListener('visibilitychange', () => { idleCheck(); });
['focus', 'pageshow', 'resume'].forEach(ev => window.addEventListener(ev, () => { idleCheck(); }));
setInterval(idleCheck, 15000);
function lockScreen(reason) {
  if (lockP) return lockP;
  if (!S.me) return Promise.resolve();
  S.locked = true; clearTimeout(idleTimer); stopCamera();
  const old = S.token; S.token = ''; try { sessionStorage.removeItem('gj.s'); } catch (e) { /* ignore */ }
  if (reason === 'idle' && old) Net.send('auth.logout', {}, { session: old });
  document.body.classList.add('locked'); $('#app').inert = true; $('#modals').inert = true;
  const ov = clear($('#lock')); ov.hidden = false;
  const F = mkForm([{ k: 'pin', l: T.pin, t: 'pin', req: true }]);
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  const b = btn(T.unlock, tryUnlock);
  append(ov, h('div', { class: 'overlay-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': T.lockTitle }, h('h2', { text: T.lockTitle }),
    h('p', { text: reason === 'idle' ? T.lockIdle : T.lockSession }), h('p', { class: 'lock-user', text: fmt(T.lockUser, { name: S.me.name }) }), F.el, err,
    h('div', { class: 'foot-btns' }, btn(T.otherUser, signOutLocal, 'sec'), b)));
  let done, busy = false; lockP = new Promise(r => { done = r; });
  F.f.pin.inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) tryUnlock(); } });
  soon(() => F.f.pin.inp.focus());
  async function tryUnlock() {
    if (busy) return; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    busy = true; b.disabled = true; err.hidden = true;
    const r = await api('auth.login', { mobile: S.mobile, pin: F.val('pin') }, { noSession: true, noLock: true });
    busy = false; b.disabled = false;
    if (!r.ok) { err.textContent = r.msg; err.hidden = false; F.set('pin', ''); F.f.pin.inp.focus(); return; }
    if (!r.me || r.me.userId !== S.me.userId) { signOutLocal(); return; }
    setSession(r);
    S.locked = false; document.body.classList.remove('locked'); ov.hidden = true; clear(ov);
    if (!document.body.classList.contains('stale')) { $('#app').inert = false; $('#modals').inert = false; }
    lockP = null; armIdle(); done();
    try { document.dispatchEvent(new Event('gj:unlock')); } catch (e) { /* ignore */ } /* R37B-04: a screen kept under the lock looks at the date again */
    if (r.mustChangePin) showChangePin(true);
  }
  return lockP;
}
Hooks.lock = lockScreen;
function setSession(r) {
  S.token = r.session; S.me = r.me; if (r.idleMinutes) S.idleMin = r.idleMinutes;
  try { sessionStorage.setItem('gj.s', S.token); sessionStorage.setItem('gj.m', S.mobile); sessionStorage.setItem('gj.i', String(S.idleMin)); } catch (e) { /* session only in memory */ }
}
/* Leaves nothing of the previous user in memory: storage cleared, page reloaded (F404). */
function signOutLocal() { try { sessionStorage.clear(); } catch (e) { /* ignore */ } S.dirty = false; MODALS.forEach(m => { m.dirty = null; }); history.replaceState(null, '', location.pathname + location.search); location.reload(); }
async function logout(b) { if (b) b.disabled = true; const tok = S.token; S.token = ''; if (tok) await Promise.race([Net.send('auth.logout', {}, { session: tok }), sleep(4000)]); signOutLocal(); }

/* R37B-02: "is a count open in another window of this device?" - asked over a BroadcastChannel before a new version is activated.
   A window with an open count answers at once; no answer within 400 ms = no count. (No storage is used; a browser without
   BroadcastChannel only knows its own window.) */
const COUNT_BC = (() => { try { return typeof BroadcastChannel === 'function' ? new BroadcastChannel('gj-app-count') : null; } catch (e) { return null; } })();
let countSeen = 0, countAsk = 0;
if (COUNT_BC) COUNT_BC.onmessage = e => { const m = e && e.data; if (!m || typeof m !== 'object') return; if (m.t === 'COUNT?' && S.countOpen) COUNT_BC.postMessage({ t: 'COUNT!', n: m.n }); else if (m.t === 'COUNT!' && m.n === countAsk) countSeen = m.n; };
async function countElsewhere() {
  if (!COUNT_BC) return false;
  const n = ++countAsk + Math.random(); countAsk = n;
  try { COUNT_BC.postMessage({ t: 'COUNT?', n }); } catch (e) { return false; }
  await sleep(400);
  return countSeen === n;
}

/* ================= start-up ================= */
function stage(nodes) { document.body.classList.remove('authed'); const v = clear($('#view')); const c = h('div', { class: 'card stage' }); append(c, nodes); v.appendChild(c); drawFooter(); return c; }
function fatal(msg) { stage([h('h1', { text: T.appName }), h('p', { class: 'errmsg', text: msg })]); }
async function boot() {
  if (!window.crypto || !crypto.subtle || !crypto.randomUUID || !window.indexedDB || !window.fetch || !window.AbortController || !window.TextEncoder) { fatal(T.browserOld); return; }
  if ('serviceWorker' in navigator) {
    let had = !!navigator.serviceWorker.controller, waitingReg = null, bar = null, wantReload = false;
    /* R4ops-14: a new version never takes over an open form. It is applied when the page is idle (no dialog, nothing unsaved), or at once with
       "Reload now" on a small bar; only CLIENT_OUTDATED from the server (Hooks.update) shows the blocking update screen. */
    /* R31C-08: idle = no dialog, nothing unsaved (S.dirty), nothing typed on the screen (S.typed), no screen that holds work (S.hold: the
       count while scans are waiting to be sent, the count result). Otherwise only the "Reload now" bar is shown. */
    const idle = () => !S.dirty && !S.typed && !MODALS.length && !(S.hold && S.hold()) && !S.countOpen && !unsureHeld();
    /* R37B-02: the new version is never activated while a count is open - on this screen (S.countOpen, S.hold) or in another window
       of this device (countElsewhere asks the other windows). "Reload now" is refused with a clear message for the same reason. */
    let applying = false;
    const apply = async forced => {
      if (applying || !(waitingReg && waitingReg.waiting)) return; applying = true;
      try {
        if (S.countOpen || await countElsewhere()) { if (forced) { wantReload = false; notify(T.updateCountOpen, 'warn'); } return; }
        if (!forced && !idle()) return; /* something was started while the other windows were asked */
        if (waitingReg && waitingReg.waiting) waitingReg.waiting.postMessage({ t: 'SKIP_WAITING', v: APP_VERSION }); /* R33C-01: the object form - the new worker ignores the plain string of a 4.0.4 page */
      } finally { applying = false; }
    };
    /* R37B-06: the bar is placed by the class "update-bar" of the stylesheet - the page's CSP (style-src 'self') refuses an inline style,
       so the old bar sat below the end of the page where nobody saw it */
    const showBar = onReload => { if (bar) return; bar = h('div', { class: 'toast warn update-bar', role: 'status', id: 'updateBar' }, h('span', { text: T.updateReady }), btn(T.updateReload, onReload, 'ghost')); document.body.appendChild(bar); };
    const offer = reg => {
      if (!reg.waiting || !navigator.serviceWorker.controller) return;
      waitingReg = reg; if (idle()) { apply(false); return; }
      showBar(() => { wantReload = true; if (waitingReg && waitingReg.waiting) apply(true); else reloadIfNoCount(); });
    };
    const reloadIfNoCount = async () => { if (S.countOpen || await countElsewhere()) { wantReload = false; notify(T.updateCountOpen, 'warn'); return; } location.reload(); };
    navigator.serviceWorker.register('sw.js').then(reg => {
      offer(reg);
      reg.addEventListener('updatefound', () => { const w = reg.installing; if (w) w.addEventListener('statechange', () => { if (w.state === 'installed') offer(reg); }); });
      setInterval(() => { if (waitingReg && waitingReg.waiting && idle()) apply(false); if (changed && idle()) location.reload(); }, 20000);
    }).catch(() => {});
    /* another tab may activate the new version: this page reloads only when it is idle (the old screen keeps working until then) */
    let changed = false;
    const t0 = Date.now(); /* a version change while the page is still starting up reloads later (never a reload in the middle of loading) */
    navigator.serviceWorker.addEventListener('controllerchange', () => { if (had) { if (wantReload || (idle() && Date.now() - t0 > 8000)) location.reload(); else if (idle()) changed = true; else { changed = true; showBar(reloadIfNoCount); } } had = true; });
  }
  if (!Net.configured()) { stage([h('h1', { text: T.setupTitle }), h('p', { text: T.setupMsg })]); return; }
  let dev; try { dev = await Net.device(); } catch (e) { fatal(T.storageBlocked); return; }
  if (!dev) { let p = null; try { p = await Net.pendingDevice(); } catch (e) { /* none */ } if (p) { resumePending(p); return; } showRegister(T.regErased); return; }
  S.deviceLabel = dev.label || '';
  checkDevice();
}
/* Start-up device check. A failed call NEVER deletes the key: it shows Retry (F400). */
async function checkDevice() {
  stage(spinner());
  await Net.syncTime();
  const r = await api('device.status', {}, { noSession: true, raw: true });
  if (document.body.classList.contains('stale')) return;
  if (!r.ok) { stage([h('h1', { text: T.appName }), errorCard(r.code === 'NET' || !r.msg ? T.startFail : r.msg, checkDevice)]); return; }
  if (r.status === 'APPROVED') { if (r.label) S.deviceLabel = r.label; startSession(); return; }
  if (r.status === 'PENDING') { showPending(r.pairCode); return; }
  if (r.status === 'REVOKED' || r.status === 'REPLACED' || r.status === 'UNKNOWN') { await Net.forgetDevice(); showRegister(T.regGone); return; }
  stage([h('h1', { text: T.appName }), errorCard(T.startFail, checkDevice)]);
}
Hooks.pending = () => { if (!S.locked) { S.me = null; showPending(''); } };
Hooks.deviceGone = async () => {
  const r = await api('device.status', {}, { noSession: true, raw: true });
  if (r.ok && (r.status === 'REVOKED' || r.status === 'REPLACED' || r.status === 'UNKNOWN')) { await Net.forgetDevice(); signOutLocal(); }
};
async function resumePending(p) {
  stage(spinner());
  const r = await api('device.status', {}, { noSession: true, raw: true, device: p });
  if (r.ok && (r.status === 'APPROVED' || r.status === 'PENDING')) { await Net.confirmPending(); S.deviceLabel = p.label; if (r.status === 'APPROVED') startSession(); else showPending(r.pairCode); return; }
  showRegister(T.regErased, p);
}
function showRegister(msg, pending) {
  const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(navigator.standalone || (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches));
  if (ios) { stage([h('h1', { text: T.regTitle }), note(T.regIos, 'warn')]); return; }
  /* RV48-01: the owner's one-time rescue code - the field is shown only after the server asked for it (REG_RESCUE_CODE) */
  let askRescue = false;
  const F = mkForm([{ k: 'label', l: T.devName, ph: T.devNamePh, req: true, max: 40, wide: true }, { k: 'mobile', l: T.yourMobile, t: 'mobile', req: true }, { k: 'pin', l: T.yourPinL, t: 'pin', req: true }, { k: 'rescue', l: T.rescueCode, max: 12, wide: true, hint: T.rescueHint, show: () => askRescue }], pending ? { label: pending.label } : {});
  F.sync();
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true }); const b = btn(T.register, submit);
  stage([h('h1', { text: T.regTitle }), msg ? note(msg, 'warn') : null, h('p', { class: 'intro', text: T.regIntro }), F.el, err, h('div', { class: 'foot-btns' }, b)]);
  let busy = false;
  F.el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); if (!e.repeat) submit(); } });
  async function submit() {
    if (busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    busy = true; b.disabled = true; const v = F.get();
    try {
      if (!pending || pending.label !== v.label) pending = await Net.createPending(v.label);
      const r = await api('device.register', { deviceId: pending.id, secret: pending.secret, label: v.label, kind: 'WEB', agent: navigator.userAgent.slice(0, 160), mobile: v.mobile, pin: v.pin, rescue: v.rescue, version: APP_VERSION }, { unsigned: true, noSession: true, deviceId: pending.id, raw: true });
      if (!r.ok) { err.textContent = r.msg || T.netFail; err.hidden = false; if (r.code === 'REG_RESCUE_CODE' && !askRescue) { askRescue = true; F.sync(); soon(() => F.f.rescue.inp.focus()); } return; }
      await Net.confirmPending(); S.deviceLabel = v.label;
      if (r.status === 'APPROVED') { await Net.syncTime(); startSession(); } else showPending(r.pairCode);
    } catch (e) { console.error(e); err.textContent = T.storageBlocked; err.hidden = false; } finally { busy = false; b.disabled = false; }
  }
}
function showPending(pairCode) {
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true }), codeEl = h('div', { class: 'paircode', text: pairCode || '' });
  const b = btn(T.checkStatus, async () => {
    b.disabled = true; err.hidden = true;
    const r = await api('device.status', {}, { noSession: true, raw: true });
    b.disabled = false;
    if (!r.ok) { err.textContent = r.code === 'NET' || !r.msg ? T.startFail : r.msg; err.hidden = false; return; }
    if (r.status === 'APPROVED') { startSession(); return; }
    if (r.status === 'PENDING') { if (r.pairCode) codeEl.textContent = r.pairCode; notify(T.stillPending, 'ok'); return; }
    await Net.forgetDevice(); showRegister(T.regRejected);
  }, '', { id: 'checkStatus' });
  stage([h('h1', { text: T.pendTitle }), h('p', { text: T.pendMsg }), h('p', { class: 'muted', text: T.pairCode }), codeEl, err, h('div', { class: 'foot-btns' }, b)]);
}
async function startSession() {
  let tok = ''; try { tok = sessionStorage.getItem('gj.s') || ''; S.mobile = sessionStorage.getItem('gj.m') || ''; S.idleMin = Number(sessionStorage.getItem('gj.i')) || 15; } catch (e) { /* none */ }
  if (!tok) { showLogin(); return; }
  stage(spinner()); S.token = tok;
  const r = await api('auth.me', {}, { noLock: true, raw: true });
  if (r.ok && r.me) { S.me = r.me; enterApp(); return; }
  S.token = '';
  if (r.code === 'NET') { stage([h('h1', { text: T.appName }), errorCard(T.startFail, startSession)]); return; }
  try { sessionStorage.removeItem('gj.s'); } catch (e) { /* ignore */ }
  showLogin(r.code === 'AUTH_SESSION' ? '' : r.msg);
}
function showLogin(msg) {
  S.me = null; S.token = '';
  const F = mkForm([{ k: 'mobile', l: T.mobile, t: 'mobile', req: true, wide: true }, { k: 'pin', l: T.pin, t: 'pin', req: true, wide: true }]);
  const err = h('div', { class: 'errbox', role: 'alert', hidden: !msg, text: msg || '' }); const b = btn(T.signIn, submit, '', { id: 'loginBtn' });
  stage([h('h1', { text: T.loginTitle }), F.el, err, h('div', { class: 'foot-btns' }, b)]);
  let busy = false;
  /* Holding Enter must send one request only (F410). */
  F.el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); if (!e.repeat && !busy) submit(); } });
  soon(() => F.f.mobile.inp.focus());
  async function submit() {
    if (busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    busy = true; b.disabled = true; const v = F.get();
    const r = await api('auth.login', { mobile: v.mobile, pin: v.pin }, { noSession: true, noLock: true });
    busy = false; b.disabled = false;
    if (document.body.classList.contains('stale')) return;
    if (!r.ok) { err.textContent = r.msg; err.hidden = false; F.set('pin', ''); return; }
    S.mobile = v.mobile; setSession(r); if (r.lists) S.lists = r.lists;
    if (r.mustChangePin) showChangePin(true); else enterApp();
  }
}
async function enterApp() {
  document.body.classList.add('authed');
  const who = clear($('#who'));
  append(who, [h('span', { class: 'who-name', text: S.me.name + ' · ' + lbl('ROLE', S.me.role) }), btn(T.logout, e => logout(e.currentTarget), 'sm ghost light', { id: 'logoutBtn' })]);
  armIdle();
  if (!S.lists) {
    clear($('#view')).appendChild(spinner());
    let ok = await ensureLists(); if (!ok) { await sleep(1500); ok = await ensureLists(); }   /* R31C-07: asked again, never kept empty */
    if (!ok) notify(T.listsFail, 'bad');
  }
  renderRoute();
}
Hooks.forcePin = () => showChangePin(true);

/* V27 Change my PIN (also the forced change after first login / reset). */
function showChangePin(forced) {
  const F = mkForm([{ k: 'oldPin', l: T.pinOld, t: 'pin', req: true, wide: true }, { k: 'newPin', l: T.pinNew, t: 'pin', req: true, wide: true }, { k: 'newPin2', l: T.pinNew2, t: 'pin', req: true, wide: true }]);
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true }); const b = btn(T.pinChange, submit);
  const nodes = [h('h1', { text: forced ? T.pinForced : T.pinTitle }), forced ? note(T.pinForcedMsg, 'warn') : null, h('p', { class: 'intro', text: T.pinRules }), F.el, err,
    h('div', { class: 'foot-btns' }, forced ? btn(T.logout, e => logout(e.currentTarget), 'sec') : btn(T.back, goBack, 'sec'), b)];
  let busy = false; S.forcedPin = !!forced;
  if (forced) { closeAllModals(); stage(nodes); } else { const c = h('div', { class: 'card stage' }); append(c, nodes); $('#view').appendChild(c); }
  F.el.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); if (!e.repeat) submit(); } });
  async function submit() {
    if (busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    const v = F.get(); if (v.newPin !== v.newPin2) { F.mark('newPin2', ''); err.textContent = T.pinMismatch; err.hidden = false; return; }
    busy = true; b.disabled = true;
    const r = await api('auth.changePin', { oldPin: v.oldPin, newPin: v.newPin }, { noLock: forced });
    busy = false; b.disabled = false;
    if (!r.ok) { if (r.field) F.mark(r.field, ''); err.textContent = r.msg; err.hidden = false; return; }
    notify(T.pinChanged, 'ok'); S.forcedPin = false;
    if (forced) enterApp(); else go('home');
  }
}
VIEWS.pin = { title: T.pinTitle, render: () => { showChangePin(false); } };

window.addEventListener('error', e => { if (e && e.message && !/ResizeObserver/.test(e.message)) notify(T.errUnexpected, 'bad'); });
window.addEventListener('unhandledrejection', () => notify(T.errUnexpected, 'bad'));
