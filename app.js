/* GJ App v3 — Genuine Junction stock + repair. Data server pe, yahan sirf screen. */
'use strict';
const API = window.GJ_API;
const S = { me: null, session: '', lists: null, idleT: null, view: 'home', arg: null };
const $ = id => document.getElementById(id);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const has = p => S.me && (S.me.perms.includes('*') || S.me.perms.includes(p));
const isAdmin = () => S.me && S.me.role === 'admin';
const money = n => n === '' || n == null ? '' : '₹' + Number(n).toLocaleString('en-IN');
const pill = s => `<span class="pill p-${esc(String(s).split(' ')[0])}">${esc(s)}</span>`;

/* ------------------------------------------------ device store (IndexedDB, non-extractable key) */
function idb() { return new Promise((res, rej) => { const r = indexedDB.open('gj-app', 1); r.onupgradeneeded = () => r.result.createObjectStore('kv'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); }
async function kvGet(k) { const db = await idb(); return new Promise(res => { const t = db.transaction('kv').objectStore('kv').get(k); t.onsuccess = () => res(t.result); t.onerror = () => res(null); }); }
async function kvSet(k, v) { const db = await idb(); return new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = () => res(); }); }
async function kvDel(k) { const db = await idb(); return new Promise(res => { const t = db.transaction('kv', 'readwrite'); t.objectStore('kv').delete(k); t.oncomplete = () => res(); }); }
const hex = buf => [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');

/* ------------------------------------------------ api */
async function call(a, data, opt = {}) {
  const dev = await kvGet('device');
  const p = JSON.stringify({ a, d: dev ? dev.id : opt.devId || '', ts: Date.now(), n: crypto.randomUUID(), s: S.session, data: data || {} });
  let sig = '';
  if (dev && dev.key) sig = hex(await crypto.subtle.sign('HMAC', dev.key, new TextEncoder().encode(p)));
  let r;
  try {
    const resp = await fetch(API, { method: 'POST', body: JSON.stringify({ p, sig }) });
    r = await resp.json();
  } catch (e) { r = { ok: false, msg: 'Internet / server se connect nahi hua. Dobara try karo.' }; }
  if (!r.ok && !opt.raw) {
    if (r.msg === 'LOGIN') { S.session = ''; S.me = null; toast('Session khatam. Dobara PIN daalo.', 'bad'); showLogin(); throw new Error('login'); }
    if (r.msg === 'DEVICE_PENDING') { showPending(); throw new Error('pending'); }
    if (r.msg === 'DEVICE_REVOKED' || r.msg === 'DEVICE_UNKNOWN' || r.msg === 'DEVICE_BAD_SIG') { await kvDel('device'); showSetup('Ye device band kar diya gaya hai ya pehchana nahi gaya. Dobara register karo.'); throw new Error('device'); }
  }
  bumpIdle();
  return r;
}
function bumpIdle() { clearTimeout(S.idleT); if (S.session) S.idleT = setTimeout(() => { S.session = ''; S.me = null; showLogin('Kaafi der kuch nahi kiya, isliye lock ho gaya.'); }, 14 * 60000); }
function toast(m, cls) { const t = $('toast'); t.textContent = m; t.className = cls || ''; t.style.display = 'block'; clearTimeout(t._h); t._h = setTimeout(() => t.style.display = 'none', 3500); }
function busy(btn, on) { if (!btn) return; btn.disabled = on; if (on) { btn._t = btn.textContent; btn.textContent = 'Ruko…'; } else if (btn._t) btn.textContent = btn._t; }
async function act(btn, a, data, okMsg) {
  busy(btn, true);
  try { const r = await call(a, data); if (!r.ok) { if (r.warn) return r; toast(r.msg || 'Error', 'bad'); return r; } if (okMsg) toast(okMsg, 'ok'); return r; }
  catch (e) { return { ok: false }; } finally { busy(btn, false); }
}
function modal(html) { $('modalBox').innerHTML = html; $('modal').classList.remove('hidden'); }
function closeModal() { $('modal').classList.add('hidden'); }
$('modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
async function confirmWarn(msg) { return window.confirm(msg); }
const V = html => { $('view').innerHTML = html; window.scrollTo(0, 0); };
const val = id => ($(id) ? $(id).value.trim() : '');
async function lists(force) { if (!S.lists || force) { const r = await call('meta.lists'); if (r.ok) S.lists = r; } return S.lists; }
const opts = (arr, sel, ph) => (ph ? `<option value="">${esc(ph)}</option>` : '') + arr.map(x => { const v = typeof x === 'string' ? x : x.v; const t = typeof x === 'string' ? x : x.t; return `<option ${v === sel ? 'selected' : ''} value="${esc(v)}">${esc(t)}</option>`; }).join('');

/* ------------------------------------------------ setup / login */
async function boot() {
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (!API || API.indexOf('http') !== 0) { V('<div class="card"><h1>Setup baaki</h1><p>config.js mein server ka URL nahi hai.</p></div>'); return; }
  const dev = await kvGet('device');
  if (!dev) return showSetup();
  const r = await call('device.status', {}, { raw: true });
  if (r.status === 'Pending') return showPending();
  if (r.status !== 'Approved') { await kvDel('device'); return showSetup('Ye device band hai ya pehchana nahi gaya. Dobara register karo.'); }
  showLogin();
}
function showSetup(msg) {
  $('who').innerHTML = '';
  V(`<div class="card" style="max-width:460px;margin:20px auto">
  <h1>Naya device jodo</h1>
  ${msg ? `<div class="alert bad">${esc(msg)}</div>` : ''}
  <p class="muted">Is computer / phone ko pehli baar jod rahe ho. Varun ke approve karne ke baad hi ye chalega.</p>
  <label>Is device ka naam</label><input id="dl" placeholder="Jaise: Repair Desktop / Sales Counter / Aakash Phone">
  <label>Aapka mobile number</label><input id="dm" inputmode="numeric" maxlength="10">
  <label>Aapka PIN</label><input id="dp" type="password" inputmode="numeric" maxlength="6">
  <div class="btns"><button id="db">Register karo</button></div></div>`);
  $('db').onclick = async () => {
    const label = val('dl'), mobile = val('dm'), pin = val('dp');
    if (label.length < 3) return toast('Device ka naam likho', 'bad');
    busy($('db'), true);
    try {
      const raw = crypto.getRandomValues(new Uint8Array(32));
      const secret = hex(raw);
      const key = await crypto.subtle.importKey('raw', raw, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
      raw.fill(0);
      const id = crypto.randomUUID();
      const r = await call('device.register', { secret, mobile, pin, label, agent: navigator.userAgent }, { raw: true, devId: id });
      if (!r.ok) { toast(r.msg, 'bad'); return; }
      await kvSet('device', { id, key, label });
      try { localStorage.setItem('gj_mobile', mobile); } catch (e) {}
      if (r.status === 'Approved') { toast('Device jud gaya', 'ok'); showLogin(); } else showPending();
    } finally { busy($('db'), false); }
  };
}
function showPending() {
  $('who').innerHTML = '';
  V(`<div class="card" style="max-width:460px;margin:20px auto;text-align:center"><div style="font-size:48px">⏳</div><h1>Approval ka intezaar</h1>
  <p>Varun ke paas request chali gayi hai. Approve hote hi ye device chalega.</p>
  <div class="btns" style="justify-content:center"><button id="pc">Check karo</button></div></div>`);
  $('pc').onclick = async () => { const r = await call('device.status', {}, { raw: true }); if (r.status === 'Approved') showLogin(); else if (r.status === 'Pending') toast('Abhi pending hai'); else { await kvDel('device'); showSetup('Request reject ho gayi.'); } };
}
async function showLogin(msg) {
  $('who').innerHTML = '';
  const dev = await kvGet('device');
  const last = localStorage.getItem('gj_mobile') || '';
  V(`<div class="card" style="max-width:420px;margin:20px auto">
  <h1>Login</h1><p class="muted">${esc(dev ? dev.label : '')}</p>
  ${msg ? `<div class="alert">${esc(msg)}</div>` : ''}
  <label>Mobile number</label><input id="lm" inputmode="numeric" maxlength="10" value="${esc(last)}">
  <label>PIN</label><input id="lp" type="password" inputmode="numeric" maxlength="6">
  <div class="btns"><button id="lb">Login</button></div></div>`);
  (last ? $('lp') : $('lm')).focus();
  const go_ = async () => {
    busy($('lb'), true);
    const r = await call('auth.login', { mobile: val('lm'), pin: val('lp') }, { raw: true });
    busy($('lb'), false);
    if (!r.ok) { if (r.msg === 'DEVICE_PENDING') return showPending(); return toast(r.msg, 'bad'); }
    try { localStorage.setItem('gj_mobile', val('lm')); } catch (e) {}
    S.session = r.session; S.me = r.me; bumpIdle();
    if (r.mustChangePin) return showChangePin(true);
    await lists(true); go('home');
  };
  $('lb').onclick = go_; $('lp').onkeydown = e => { if (e.key === 'Enter') go_(); };
}
function showChangePin(forced) {
  V(`<div class="card" style="max-width:420px;margin:20px auto"><h1>Naya PIN banao</h1>
  ${forced ? '<div class="alert">Pehli baar login hai. Apna khud ka PIN banao (4-6 number). Kisi ko mat batana.</div>' : ''}
  <label>Abhi wala PIN</label><input id="po" type="password" inputmode="numeric" maxlength="6">
  <label>Naya PIN</label><input id="pn" type="password" inputmode="numeric" maxlength="6">
  <label>Naya PIN dobara</label><input id="pn2" type="password" inputmode="numeric" maxlength="6">
  <div class="btns"><button id="pb">PIN badlo</button></div></div>`);
  $('pb').onclick = async () => {
    if (val('pn') !== val('pn2')) return toast('Dono naye PIN alag hain', 'bad');
    const r = await act($('pb'), 'auth.changePin', { old: val('po'), pin: val('pn') }, 'PIN badal gaya');
    if (r.ok) { await lists(true); go('home'); }
  };
}
function header() {
  $('who').innerHTML = S.me ? `${esc(S.me.name)} · ${esc(S.me.role)} <button class="sm sec" onclick="logout()">Logout</button>` : '';
}
async function logout() { try { await call('auth.logout'); } catch (e) {} S.session = ''; S.me = null; showLogin(); }

/* ------------------------------------------------ router */
const VIEWS = {};
function go(v, arg) { if (!S.me) return showLogin(); S.view = v; S.arg = arg; header(); (VIEWS[v] || VIEWS.home)(arg); }
window.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

VIEWS.home = async () => {
  const T = [
    ['scan', '🔎', 'Scan / Dhoondo', true],
    ['count', '📋', 'Roz ki ginti', has('count')],
    ['jobs', '🛠️', 'Repair jobs', has('job.view') || has('job.status')],
    ['newjob', '➕', 'Naya job card', has('job.edit')],
    ['receive', '📦', 'Maal aaya (PO)', has('receive')],
    ['po', '🧾', 'Purchase order', has('po')],
    ['stock', '💻', 'Laptop stock', has('stock.view')],
    ['parts', '🧩', 'Parts', has('parts') || has('stock.view')],
    ['acc', '🎒', 'Accessories', has('acc')],
    ['outside', '🚚', 'Bahar gaye', has('move')],
    ['exchange', '🔁', 'Exchange / Buyback', has('exchange')],
    ['dash', '📊', 'Dashboard', has('dash')],
    ['approvals', '✅', 'Approvals', isAdmin()],
    ['users', '👥', 'Staff + devices', isAdmin()],
    ['settings', '⚙️', 'Settings + log', isAdmin()],
    ['pin', '🔑', 'Mera PIN badlo', true]
  ].filter(t => t[3]);
  V(`<h1>Namaste ${esc(S.me.name)} 👋</h1><div id="hb"></div><div class="tiles">${T.map(t => `<div class="tile" onclick="go('${t[0]}')"><span class="ic">${t[1]}</span>${esc(t[2])}<span class="badge hidden" id="b_${t[0]}"></span></div>`).join('')}</div>`);
  if (has('count')) { const r = await call('count.today'); if (r.ok) { const mine = [r.sales, r.repair].filter(x => x.who === S.me.name && !x.done); if (mine.length) $('hb').innerHTML = `<div class="alert">📋 Aaj closing pe <b>ginti aapki baari</b> hai. Office band hone se pehle "Roz ki ginti" karo.</div>`; } }
  if (isAdmin()) { const r = await call('approvals.list'); if (r.ok && r.items.length) { const b = $('b_approvals'); b.textContent = r.items.length; b.classList.remove('hidden'); } }
};
VIEWS.pin = () => showChangePin(false);
const backBtn = (to = 'home') => `<button class="back noprint" onclick="go('${to}')">← Wapas</button>`;

/* ------------------------------------------------ camera scan (phone) */
async function camScan(target) {
  if (!('BarcodeDetector' in window)) return toast('Is browser mein camera scan nahi chalta. Scanner / type karo.', 'bad');
  modal(`<h2>Camera se scan</h2><video id="cam" playsinline></video><div class="btns"><button class="sec" onclick="stopCam()">Band karo</button></div>`);
  const st = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).catch(() => null);
  if (!st) { closeModal(); return toast('Camera permission nahi mili', 'bad'); }
  const v = $('cam'); v.srcObject = st; await v.play(); window._camSt = st;
  const det = new BarcodeDetector({ formats: ['code_128', 'qr_code', 'code_39', 'ean_13'] });
  const loop = async () => { if (!window._camSt) return; try { const b = await det.detect(v); if (b.length) { const inp = $(target); inp.value = b[0].rawValue; stopCam(); inp.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })); return; } } catch (e) {} requestAnimationFrame(loop); };
  loop();
}
function stopCam() { if (window._camSt) { window._camSt.getTracks().forEach(t => t.stop()); window._camSt = null; } closeModal(); }
const scanInput = (id, ph) => `<div class="scanbox"><input id="${id}" placeholder="${esc(ph || 'Sticker / serial scan karo')}" autocomplete="off">${'BarcodeDetector' in window ? `<button class="sec" onclick="camScan('${id}')">📷</button>` : ''}</div>`;
function onEnter(id, fn) { const i = $(id); if (i) i.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); fn(i.value.trim()); } }; }

/* ------------------------------------------------ scan / lookup */
VIEWS.scan = () => {
  V(`${backBtn()}<h1>Scan / Dhoondo</h1><div class="card">${scanInput('sc', 'GJ / RJ sticker ya serial number')}<p class="muted" style="margin:8px 0 0">Scanner se scan karo ya type karke Enter dabao.</p></div><div id="sr"></div>`);
  $('sc').focus(); onEnter('sc', lookup);
};
async function lookup(code) {
  if (!code) return;
  const r = await call('scan.lookup', { code });
  const out = $('sr'); if (!out) return;
  $('sc').value = ''; $('sc').focus();
  if (!r.ok) return;
  if (r.kind === 'stock') out.innerHTML = stockCard(r.item);
  else if (r.kind === 'job') { if (r.job.log) go('job', r.job.id); else out.innerHTML = `<div class="card"><h2>${esc(r.job.id)}</h2>${pill(r.job.status)}</div>`; }
  else if (r.kind === 'part') out.innerHTML = partCard(r.part);
  else if (r.kind === 'gj-free') out.innerHTML = `<div class="card"><h2>${esc(r.id)} khaali sticker hai</h2><p>Ye sticker kisi laptop pe nahi laga.</p><div class="btns">${has('exchange') ? `<button onclick="go('exchange','${esc(r.id)}')">Exchange / buyback laptop pe lagao</button>` : ''}${has('stock.edit') ? `<button class="sec" onclick="go('addold','${esc(r.id)}')">Purana laptop (system mein nahi tha)</button>` : ''}${has('receive') ? `<button class="sec" onclick="go('receive')">PO se maal receive</button>` : ''}</div></div>`;
  else if (r.kind === 'rj-free') out.innerHTML = `<div class="card"><h2>${esc(r.id)} khaali repair sticker</h2>${has('job.edit') ? `<div class="btns"><button onclick="go('newjob','${esc(r.id)}')">Is sticker se naya job card</button></div>` : ''}</div>`;
  else out.innerHTML = `<div class="card"><h2>Kuch nahi mila</h2><p class="muted">"${esc(code)}" na stock mein hai, na parts mein, na repair mein.</p></div>`;
}
function stockCard(it) {
  const w = it.warrantyDays !== undefined ? `${esc(it.warrantyTill)} (${it.warrantyDays >= 0 ? it.warrantyDays + ' din baaki' : 'khatam'})` : '-';
  const actions = [];
  if (it.state === 'Active') {
    if (it.location !== 'Outside') {
      actions.push(`<button onclick="statusDlg('${it.id}','${esc(it.location)}')">Status / haath-badlaav</button>`);
      if (has('move')) actions.push(`<button class="sec" onclick="outDlg('${it.id}')">Bahar bhejo</button>`);
      if (has('stock.sold')) actions.push(`<button class="ok" onclick="soldDlg('${it.id}')">Sold mark</button>`);
    } else if (has('move')) actions.push(`<button onclick="moveIn('${it.id}')">Bahar se wapas aaya</button>`);
    if (has('stock.edit')) actions.push(`<button class="sec" onclick="editDlg('${it.id}')">Edit</button>`);
  } else if (it.state === 'Sold' && isAdmin()) actions.push(`<button class="warn" onclick="unsellDlg('${it.id}')">Wapas aaya (return)</button>`);
  return `<div class="card"><h2>${esc(it.id)} · ${esc(it.brand)} ${esc(it.model)}</h2>
  <div style="margin-bottom:8px">${pill(it.state)} ${pill(it.location)} ${pill(it.status)}</div>
  <div class="kv"><b>Serial</b><span>${esc(it.serial)}</span><b>Processor</b><span>${esc(it.cpu)}</span><b>RAM / Storage</b><span>${esc(it.ram)} · ${esc(it.storage)} · ${esc(it.touch)}</span>
  <b>Source</b><span>${esc(it.source)}${it.dealer ? ' · ' + esc(it.dealer) : ''}</span><b>Dealer warranty</b><span>${w}</span>
  ${it.rate !== undefined ? `<b>Kharid</b><span>${money(it.rate)} ${it.po ? '· ' + esc(it.po) : ''} ${it.dealerBill ? '· bill ' + esc(it.dealerBill) : ''}</span>` : ''}
  ${it.soldBill ? `<b>Sold</b><span>${esc(it.soldBill)} · ${esc(it.soldDate)}</span>` : ''}
  ${it.transitTo ? `<b>Raaste mein</b><span style="color:var(--warn)">${esc(it.transitBy)} ne ${esc(it.transitTo)} ko bheja (${esc(it.transitAt)}). Accept hone tak ${esc(it.transitBy)} ke naam.</span>` : ''}
  <b>Pendrive scan</b><span>${esc(it.lastPendrive || 'kabhi nahi')}${it.battery ? ' · battery ' + esc(it.battery) : ''}${it.verified === 'N' ? ' · <b style="color:var(--bad)">verify nahi hua</b>' : ''}${it.hwPending ? ' · <b style="color:var(--bad)">part badla, approval pending</b>' : ''}</span>
  <b>Sticker ginti</b><span>${esc(it.lastScan || '-')}</span>${it.notes ? `<b>Note</b><span>${esc(it.notes)}</span>` : ''}</div>
  <div class="btns">${actions.join('')}</div></div>`;
}
function partCard(p) {
  return `<div class="card"><h2>${esc(p.id)} · ${esc(p.type)} ${esc(p.spec)}</h2>${pill(p.status)}<div class="kv" style="margin-top:8px"><b>Serial</b><span>${esc(p.serial)}</span><b>Dealer</b><span>${esc(p.dealer)}</span>${p.rate !== undefined ? `<b>Kharid</b><span>${money(p.rate)}</span>` : ''}${p.usedIn ? `<b>Laga</b><span>${esc(p.usedIn)} · ${esc(p.usedBy)} · ${esc(p.usedAt)}</span>` : ''}${p.notes ? `<b>Note</b><span>${esc(p.notes)}</span>` : ''}</div>
  ${has('parts') && p.status === 'In Stock' ? `<div class="btns"><button onclick="usePartDlg('${esc(p.serial)}')">Laptop / job mein lagao</button><button class="bad" onclick="partMark('${esc(p.serial)}','Faulty')">Kharab</button><button class="sec" onclick="partMark('${esc(p.serial)}','Returned to Dealer')">Dealer ko wapas</button></div>` : ''}</div>`;
}
async function statusDlg(id, loc) {
  const L = await lists();
  modal(`<h2>${id}: status / haath-badlaav</h2>
  <label>Naya status</label><select id="ns">${opts(L.status, '', 'Chuno')}</select>
  <label>Laptop kahan rahega</label><select id="nl">${opts(['Sales', 'Repair'], loc === 'Repair' ? 'Repair' : 'Sales')}</select>
  <label>Problem / note (Back to Repair pe zaroori)</label><input id="ni">
  <p class="muted">Sales ↔ Repair: aap "bhejte" ho, lene wala apni pendrive se accept karega. Tab tak laptop aapke naam rahega.</p>
  <div class="btns"><button id="nb">Save</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('nb').onclick = async () => { const r = await act($('nb'), 'stock.status', { id, status: val('ns'), location: val('nl'), issue: val('ni') }, 'Save ho gaya'); if (r.ok) { closeModal(); refreshLookup(id); } };
}
async function outDlg(id) {
  const L = await lists();
  const partners = L.dealers.map(d => d.name);
  modal(`<h2>${id}: bahar bhejo</h2><label>Kyun</label><select id="or">${opts(L.moveReasons, '', 'Chuno')}</select>
  <label>Kiske paas</label><select id="op">${opts(partners, '', 'Chuno')}</select>
  <label>Courier / tracking no. ya le jaane wale ka naam (dealer wapsi mein zaroori)</label><input id="ot">
  <p class="muted">Wapas aane ka time: lamination 1 din, bahar repair 3 din, dealer 7 din. Zimmedari bhejne wale ki.</p>
  <div class="btns"><button id="ob">Bahar bhejo</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('ob').onclick = async () => { const r = await act($('ob'), 'move.out', { id, reason: val('or'), partner: val('op'), tracking: val('ot') }, 'Record ho gaya'); if (r.ok) { closeModal(); refreshLookup(id); } };
}
async function moveIn(id) { const r = await act(null, 'move.in', { id }, 'Wapas aa gaya, repair mein check karo'); if (r.ok) { refreshLookup(id); if (S.view === 'outside') go('outside'); } }
function soldDlg(id) {
  modal(`<h2>${id}: Sold</h2><label>Bill number (myBillBook / Zoho)</label><input id="sb">
  <label>Is bill mein exchange / purana laptop liya? Value ₹ (nahi liya toh khaali)</label><input id="sxv" inputmode="numeric">
  <label>Customer ka naam (exchange ho toh)</label><input id="sxc">
  <p class="muted">Exchange likha toh wo laptop pendrive se stock mein chadhana padega, tab tak dashboard pe laal rahega.</p>
  <div class="btns"><button class="ok" id="sbb">Sold mark karo</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('sb').focus();
  $('sbb').onclick = async () => { const r = await act($('sbb'), 'stock.sold', { id, bill: val('sb'), exchange: val('sxv') ? { value: val('sxv'), customer: val('sxc') } : null }, 'Sold ho gaya'); if (r.ok) { closeModal(); refreshLookup(id); } };
}
function unsellDlg(id) {
  modal(`<h2>${id}: wapas aaya</h2><label>Wajah</label><input id="ur" placeholder="Customer return / galti se sold">
  <div class="btns"><button class="warn" id="ub">Stock mein wapas</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('ub').onclick = async () => { const r = await act($('ub'), 'stock.unsell', { id, reason: val('ur') }, 'Wapas stock mein (repair check)'); if (r.ok) { closeModal(); refreshLookup(id); } };
}
async function editDlg(id) {
  const L = await lists(); const r = await call('scan.lookup', { code: id }); if (!r.ok || r.kind !== 'stock') return; const it = r.item;
  modal(`<h2>${id}: edit</h2>${laptopFields(L, it)}${it.rate !== undefined ? `<label>Kharid rate</label><input id="f_rate" value="${esc(it.rate)}" inputmode="numeric">` : ''}
  <label>Note</label><input id="f_notes" value="${esc(it.notes)}"><div class="btns"><button id="eb">Save</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('eb').onclick = async () => { const d = Object.assign({ id, notes: val('f_notes') }, readLaptop()); if ($('f_rate')) d.rate = val('f_rate'); delete d.serial; const x = await act($('eb'), 'stock.edit', d, 'Save'); if (x.ok) { closeModal(); refreshLookup(id); } };
}
function refreshLookup(id) { if ($('sr')) lookup(id); else if (S.view === 'stock') go('stock'); }
function laptopFields(L, it = {}) {
  return `<div class="row"><div><label>Brand</label><select id="f_brand">${opts(L.brands, it.brand, 'Chuno')}</select></div><div><label>Model (series + model)</label><input id="f_model" value="${esc(it.model || '')}" placeholder="Latitude 5490"></div></div>
  <label>Processor (generation ke saath)</label><input id="f_cpu" value="${esc(it.cpu || '')}" placeholder="Intel Core i5-8350U (8th Gen)">
  <div class="row3"><div><label>RAM</label><select id="f_ram">${opts(L.ram, it.ram, 'Chuno')}</select></div><div><label>Storage</label><select id="f_storage">${opts(L.storage, it.storage, 'Chuno')}</select></div><div><label>Touch</label><select id="f_touch">${opts(['Non-touch', 'Touch'], it.touch || 'Non-touch')}</select></div></div>`;
}
const readLaptop = () => ({ brand: val('f_brand'), model: val('f_model'), cpu: val('f_cpu'), ram: val('f_ram'), storage: val('f_storage'), touch: val('f_touch'), serial: val('f_serial') });
async function withWarn(btn, a, d, okMsg) {
  let r = await act(btn, a, d, okMsg);
  while (r && r.warn) {
    if (!(await confirmWarn(r.warn))) return r;
    if (/serial/i.test(r.warn)) d.confirmSerial = true; else d.confirmExtra = true;
    r = await act(btn, a, d, okMsg);
  }
  return r;
}

/* ------------------------------------------------ stock list */
VIEWS.stock = async () => {
  V(`${backBtn()}<h1>Laptop stock</h1><div class="card row3"><div><label>Dhoondo</label><input id="sq" placeholder="model / serial / GJ"></div><div><label>Jagah</label><select id="sl">${opts(['', 'Sales', 'Repair', 'Outside'].map(x => ({ v: x, t: x || 'Sab' })))}</select></div><div><label>State</label><select id="ss">${opts([{ v: '', t: 'Stock mein' }, { v: 'Sold', t: 'Sold' }])}</select></div></div><div id="sl_out" class="muted">Load…</div>`);
  const load = async () => {
    const r = await call('stock.list', { q: val('sq'), location: val('sl'), state: val('ss') }); if (!r.ok) return;
    const cost = r.items.length && r.items[0].rate !== undefined;
    $('sl_out').innerHTML = `<p class="muted">${r.items.length} laptop</p><div class="tablewrap"><table><tr><th>ID</th><th>Laptop</th><th>RAM/SSD</th><th>Jagah</th><th>Status</th><th>Warranty</th>${cost ? '<th>Kharid</th>' : ''}</tr>${r.items.map(i => `<tr class="click" onclick="go('scan');setTimeout(()=>lookup('${i.id}'),50)"><td><b>${esc(i.id)}</b></td><td>${esc(i.brand)} ${esc(i.model)}<br><span class="muted">${esc(i.cpu)}</span></td><td>${esc(i.ram)} · ${esc(i.storage)}</td><td>${pill(i.location)}</td><td>${esc(i.status)}</td><td>${i.warrantyDays !== undefined ? (i.warrantyDays >= 0 ? i.warrantyDays + 'd' : 'khatam') : '-'}</td>${cost ? `<td>${money(i.rate)}</td>` : ''}</tr>`).join('')}</table></div>`;
  };
  ['sq', 'sl', 'ss'].forEach(i => $(i).onchange = load); onEnter('sq', load); load();
};
VIEWS.addold = async (sticker) => {
  const L = await lists();
  V(`${backBtn('scan')}<h1>Purana laptop jodo</h1><div class="card"><div class="alert">Sirf un laptops ke liye jo pehle se shop mein the par system mein nahi aaye.</div>
  <label>GJ sticker</label><input id="f_sticker" value="${esc(sticker || '')}"><label>Serial number</label><input id="f_serial">${laptopFields(L)}
  <div class="row"><div><label>Jagah</label><select id="f_loc">${opts(['Sales', 'Repair'])}</select></div><div><label>Status</label><select id="f_status">${opts(L.status, 'Ready')}</select></div></div>
  ${has('stock.cost') ? '<label>Kharid rate (pata ho toh)</label><input id="f_rate" inputmode="numeric">' : ''}
  <div class="btns"><button id="ab">Save</button></div></div>`);
  $('ab').onclick = async () => { const d = Object.assign(readLaptop(), { sticker: val('f_sticker'), location: val('f_loc'), status: val('f_status'), rate: val('f_rate') }); const r = await withWarn($('ab'), 'stock.addOld', d, 'Laptop jud gaya'); if (r.ok) go('scan'); };
};

/* ------------------------------------------------ purchase orders */
VIEWS.po = async () => {
  V(`${backBtn()}<h1>Purchase orders</h1><div class="btns" style="margin-top:0"><button onclick="go('newpo')">+ Naya PO</button><label style="display:flex;align-items:center;gap:6px;margin:0"><input type="checkbox" id="pall" style="width:auto"> Purane bhi dikhao</label></div><div id="po_out" style="margin-top:12px">Load…</div>`);
  const load = async () => { const r = await call('po.list', { all: $('pall').checked }); if (!r.ok) return; $('po_out').innerHTML = r.pos.length ? r.pos.map(poCard).join('') : '<p class="muted">Koi khula PO nahi.</p>'; };
  $('pall').onchange = load; load();
};
function poCard(p) {
  return `<div class="card"><div class="line" style="border:0;padding:0"><h2 style="margin:0">${esc(p.po)} · ${esc(p.dealer)}</h2>${pill(p.status)}</div>
  <p class="muted" style="margin:4px 0 8px">${esc(p.date)} · ${esc(p.by)} · Bill ${esc(p.bill || '—')} ${p.billDate ? '(' + esc(p.billDate) + ')' : ''} · Warranty ${esc(p.warranty || 0)} mahine</p>
  ${p.lines.map(l => `<div class="line"><span>${esc(l.type)} · ${esc(l.desc)}${l.rate !== undefined ? ' · ' + money(l.rate) : ''}</span><b>${l.received}/${l.qty}</b></div>`).join('')}
  ${has('po') && p.status !== 'Closed' ? `<div class="btns"><button class="sm sec" onclick="poEdit('${p.po}')">Bill / warranty update</button><button class="sm bad" onclick="poClose('${p.po}')">PO band karo</button></div>` : ''}</div>`;
}
function poEdit(po) {
  modal(`<h2>${po}</h2><label>Dealer bill number</label><input id="pe_b"><label>Bill date (dd-mm-yyyy)</label><input id="pe_d" placeholder="14-11-2026"><label>Dealer warranty (mahine)</label><input id="pe_w" type="number">
  <div class="btns"><button id="pe_s">Save</button><button class="sec" onclick="closeModal()">Cancel</button></div><p class="muted">Warranty bill ki date se gini jaati hai. Bill update ke baad aane wale laptops pe lagegi.</p>`);
  $('pe_s').onclick = async () => { const d = { po }; if (val('pe_b')) d.bill = val('pe_b'); if (val('pe_d')) d.billDate = val('pe_d'); if (val('pe_w')) d.warranty = val('pe_w'); const r = await act($('pe_s'), 'po.update', d, 'Save'); if (r.ok) { closeModal(); go('po'); } };
}
async function poClose(po) { if (!confirm(po + ' band karna hai? Jo nahi aaya woh nahi aayega.')) return; const r = await act(null, 'po.update', { po, close: true }, 'PO band'); if (r.ok) go('po'); }
VIEWS.newpo = async () => {
  const L = await lists();
  V(`${backBtn('po')}<h1>Naya purchase order</h1><div class="card">
  <label>Dealer</label><div class="scanbox"><select id="p_dealer">${opts(L.dealers.map(d => ({ v: d.name, t: d.name + ' · ' + d.cat })), '', 'Chuno')}</select><button class="sec" onclick="dealerDlg()">+ Other</button></div>
  <div class="row3"><div><label>Dealer bill no. (baad mein bhi)</label><input id="p_bill"></div><div><label>Bill date</label><input id="p_bd" placeholder="dd-mm-yyyy"></div><div><label>Dealer warranty (mahine)</label><select id="p_w">${opts(['0', '1', '3', '6', '12'], '1')}</select></div></div>
  <h2>Items</h2><div id="p_lines"></div><button class="sec sm" onclick="addLine()">+ Item</button>
  <label>Note</label><input id="p_notes"><div class="btns"><button id="p_save">PO banao</button></div></div>`);
  addLine();
  $('p_save').onclick = async () => {
    const lines = [...document.querySelectorAll('.pl')].map(x => ({ type: x.querySelector('.t').value, desc: x.querySelector('.d').value.trim(), qty: x.querySelector('.q').value, rate: x.querySelector('.r').value }));
    const r = await act($('p_save'), 'po.create', { dealer: val('p_dealer'), bill: val('p_bill'), billDate: val('p_bd'), warranty: val('p_w'), notes: val('p_notes'), lines }, 'PO ban gaya');
    if (r.ok) go('po');
  };
};
function addLine() { const d = document.createElement('div'); d.className = 'pl card'; d.innerHTML = `<div class="row"><div><label>Type</label><select class="t">${opts(['Laptop', 'Part', 'Accessory'])}</select></div><div><label>Kya (model + spec)</label><input class="d" placeholder="Dell Latitude 5490 i5 8th 8/256"></div></div><div class="row"><div><label>Kitne</label><input class="q" type="number" value="1" min="1"></div><div><label>Rate (ek ka)</label><input class="r" inputmode="numeric"></div></div>`; $('p_lines').appendChild(d); }
async function dealerDlg() {
  modal(`<h2>Naya dealer</h2><label>Naam</label><input id="dn"><label>Kya deta hai</label><select id="dc">${opts(['Laptops', 'Parts', 'RAM', 'Accessories', 'Lamination / Small Repair', 'Motherboard Repair'])}</select>
  <div class="btns"><button id="dbb">Jodo</button><button class="sec" onclick="closeModal()">Cancel</button></div><p class="muted">Varun ke approve karne ke baad list mein aayega.</p>`);
  $('dbb').onclick = async () => { const r = await act($('dbb'), 'dealer.add', { name: val('dn'), cat: val('dc') }); if (r.ok) { toast(r.pending ? 'Approval ke liye gaya' : 'Dealer jud gaya', 'ok'); closeModal(); await lists(true); if (S.view === 'newpo') { const s = $('p_dealer'); if (s && !r.pending) s.innerHTML = opts(S.lists.dealers.map(d => ({ v: d.name, t: d.name + ' · ' + d.cat })), val('dn')); } } };
}

/* ------------------------------------------------ receive */
VIEWS.receive = async () => {
  V(`${backBtn()}<h1>Maal aaya: PO se milao</h1><div id="rv">Load…</div>`);
  const r = await call('po.list', {}); if (!r.ok) return;
  if (!r.pos.length) return $('rv').innerHTML = '<div class="card">Koi khula PO nahi hai. Varun / Aakash se PO banwao, phir maal receive karo.</div>';
  $('rv').innerHTML = r.pos.map(p => `<div class="card"><h2>${esc(p.po)} · ${esc(p.dealer)}</h2>${p.lines.map(l => `<div class="line"><span>${esc(l.type)} · ${esc(l.desc)}</span><span><b>${l.received}/${l.qty}</b> <button class="sm" onclick='recvLine(${JSON.stringify({ po: p.po, line: l.line, type: l.type, desc: l.desc })})'>Receive</button></span></div>`).join('')}</div>`).join('');
};
async function recvLine(x) {
  const L = await lists();
  const brand = L.brands.find(b => x.desc.toUpperCase().indexOf(b.toUpperCase()) === 0) || '';
  if (x.type === 'Laptop') {
    V(`${backBtn('receive')}<h1>${esc(x.po)} · laptop receive</h1><div class="card"><div class="alert ok">PO mein: <b>${esc(x.desc)}</b></div>
    <label>1. GJ sticker laptop pe lagao aur scan karo</label>${scanInput('f_sticker', 'GJ sticker')}
    <label>2. Laptop ka serial scan karo</label>${scanInput('f_serial', 'Serial number')}
    ${laptopFields(L, { brand, model: x.desc.replace(brand, '').trim() })}
    <label>PO se farak hai? (jaise PO mein 8GB likha, aaya 4GB) — warna khaali</label><input id="f_mm">
    <div class="btns"><button id="rb">Save + agla</button></div></div><div id="rlog"></div>`);
    $('f_sticker').focus(); onEnter('f_sticker', () => $('f_serial').focus()); onEnter('f_serial', () => $('f_cpu').focus());
    $('rb').onclick = async () => {
      const d = Object.assign(readLaptop(), { po: x.po, line: x.line, sticker: val('f_sticker'), mismatch: val('f_mm') });
      const r = await withWarn($('rb'), 'receive.laptop', d, '');
      if (r.ok) { toast(r.id + ' save · ' + r.result, r.result === 'OK' ? 'ok' : 'bad'); $('rlog').insertAdjacentHTML('afterbegin', `<div class="line"><b>${r.id}</b><span>${esc(d.serial)} · ${r.result}</span></div>`); ['f_sticker', 'f_serial', 'f_mm'].forEach(i => $(i).value = ''); $('f_sticker').focus(); }
    };
  } else if (x.type === 'Part') {
    V(`${backBtn('receive')}<h1>${esc(x.po)} · part receive</h1><div class="card"><div class="alert ok">PO mein: <b>${esc(x.desc)}</b></div>${partFields(L)}
    <div class="btns"><button id="rb">Save + agla</button></div></div><div id="rlog"></div>`);
    bindPartType(L);
    $('rb').onclick = async () => { const d = { po: x.po, line: x.line, type: val('pt'), spec: val('ps'), serial: val('pser') }; const r = await act($('rb'), 'receive.part', d, ''); if (r.ok) { toast(r.id + ' save', 'ok'); $('rlog').insertAdjacentHTML('afterbegin', `<div class="line"><b>${r.id}</b><span>${esc(d.type)} ${esc(d.spec)} · ${esc(d.serial)}</span></div>`); $('pser').value = ''; $('pser').focus(); } };
  } else {
    V(`${backBtn('receive')}<h1>${esc(x.po)} · accessories receive</h1><div class="card"><div class="alert ok">PO mein: <b>${esc(x.desc)}</b></div>
    <label>Item</label><select id="ai">${opts(L.acc.map(a => a.item), '', 'Chuno')}</select><label>Kitne aaye</label><input id="aq" type="number" min="1">
    <div class="btns"><button id="rb">Save</button></div></div>`);
    $('rb').onclick = async () => { const r = await act($('rb'), 'receive.acc', { po: x.po, line: x.line, item: val('ai'), qty: val('aq') }, 'Save'); if (r.ok) go('receive'); };
  }
}
function partFields(L) {
  return `<div class="row"><div><label>Part type</label><select id="pt">${opts(L.partTypes, '', 'Chuno')}</select></div><div><label>Spec</label><select id="ps"><option value="">Pehle type chuno</option></select></div></div>
  <label>Part ka serial (scan)</label>${scanInput('pser', 'Part serial')}`;
}
function bindPartType(L) {
  const m = { RAM: L.ramSpecs, SSD: L.ssdSpecs, HDD: L.hddSpecs, Charger: L.chargerSpecs };
  $('pt').onchange = () => { $('ps').innerHTML = opts(m[val('pt')] || [], '', 'Chuno'); };
}

/* ------------------------------------------------ parts */
VIEWS.parts = async () => {
  const L = await lists();
  V(`${backBtn()}<h1>Parts (serial ke saath)</h1>
  ${has('parts') ? `<div class="card"><h2>Part lagao / dhoondo</h2>${scanInput('pq', 'Part ka serial scan karo')}</div>` : ''}
  ${S.me.role === 'admin' || S.me.role === 'manager' ? `<div class="card"><h2>Bina PO ka part jodo (sirf Varun / Aakash)</h2>${partFields(L)}<div class="row"><div><label>Dealer</label><select id="pd">${opts(L.dealers.map(d => d.name), '', 'Chuno')}</select></div><div><label>Rate</label><input id="pr" inputmode="numeric"></div></div><div class="btns"><button id="pa">Jodo</button></div></div>` : ''}
  <div id="pout">Load…</div>`);
  if ($('pt')) bindPartType(L);
  if ($('pq')) onEnter('pq', async c => { const r = await call('scan.lookup', { code: c }); $('pq').value = ''; if (r.kind === 'part') modal(partCard(r.part) + '<div class="btns"><button class="sec" onclick="closeModal()">Band</button></div>'); else toast('Ye serial parts mein nahi hai', 'bad'); });
  if ($('pa')) $('pa').onclick = async () => { const r = await act($('pa'), 'receive.part', { type: val('pt'), spec: val('ps'), serial: val('pser'), dealer: val('pd'), rate: val('pr') }, 'Part jud gaya'); if (r.ok) go('parts'); };
  const r = await call('parts.list', { status: 'In Stock' }); if (!r.ok) return;
  const sum = Object.entries(r.summary).sort();
  $('pout').innerHTML = `<h2>Stock mein (${r.parts.length})</h2><div class="stat">${sum.map(([k, n]) => `<div><b>${n}</b><span>${esc(k)}</span></div>`).join('') || '<p class="muted">Koi part nahi</p>'}</div>
  <h2>List</h2><div class="tablewrap"><table><tr><th>ID</th><th>Part</th><th>Serial</th><th>Dealer</th></tr>${r.parts.map(p => `<tr class="click" onclick='modal(partCard(${JSON.stringify(p)})+"<div class=btns><button class=sec onclick=closeModal()>Band</button></div>")'><td>${esc(p.id)}</td><td>${esc(p.type)} ${esc(p.spec)}</td><td>${esc(p.serial)}</td><td>${esc(p.dealer)}</td></tr>`).join('')}</table></div>`;
};
function usePartDlg(serial) {
  modal(`<h2>Part lagao</h2><p>${esc(serial)}</p><label>Kis laptop / job mein (GJ ya RJ scan)</label><input id="ut"><div class="btns"><button id="ub2">Lagao</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('ut').focus();
  $('ub2').onclick = async () => { const r = await act($('ub2'), 'parts.use', { serial, target: val('ut') }, 'Part laga diya'); if (r.ok) { closeModal(); if (S.view === 'job') go('job', S.arg); else if (S.view === 'parts') go('parts'); } };
}
async function partMark(serial, status) { const note = prompt('Note (kya hua)?') || ''; const r = await act(null, 'parts.mark', { serial, status, note }, 'Save'); if (r.ok) { closeModal(); if (S.view === 'parts') go('parts'); } }

/* ------------------------------------------------ accessories */
VIEWS.acc = async () => {
  const L = await lists();
  const reasons = ['Laptop ke saath diya', 'Repair mein laga', 'Kharab', 'Shop use'].concat(isAdmin() ? ['Opening stock', 'Ginti sudhaar (+)', 'Ginti sudhaar (-)'] : []);
  V(`${backBtn()}<h1>Accessories (ginti)</h1><div class="card"><h2>Nikalo / jodo</h2><div class="row3"><div><label>Item</label><select id="ai">${opts(L.acc.map(a => a.item), '', 'Chuno')}</select></div><div><label>Kitne</label><input id="aq" type="number" min="1" value="1"></div><div><label>Wajah</label><select id="ar">${opts(reasons)}</select></div></div>
  <label>Bill / GJ / RJ (agar ho)</label><input id="aref"><div class="btns"><button id="ab">Save</button></div>${isAdmin() ? '<p class="muted">Shuru ki ginti: wajah mein "Opening stock" chuno.</p>' : ''}</div><div id="aout">Load…</div>`);
  $('ab').onclick = async () => { const r = await act($('ab'), 'acc.move', { item: val('ai'), qty: val('aq'), reason: val('ar'), ref: val('aref') }, 'Save'); if (r.ok) go('acc'); };
  const r = await call('acc.list'); if (!r.ok) return;
  $('aout').innerHTML = `<div class="stat">${r.items.map(i => `<div><b style="color:${i.qty <= 2 ? 'var(--bad)' : 'var(--navy)'}">${i.qty}</b><span>${esc(i.item)}</span></div>`).join('')}</div>
  <h2>Abhi ke badlaav</h2><div class="tablewrap"><table><tr><th>Time</th><th>Item</th><th>Qty</th><th>Wajah</th><th>Kaun</th></tr>${r.recent.map(l => `<tr><td>${esc(l.time)}</td><td>${esc(l.item)}</td><td>${l.qty > 0 ? '+' : ''}${l.qty}</td><td>${esc(l.reason)} ${esc(l.ref)}</td><td>${esc(l.by)}</td></tr>`).join('')}</table></div>`;
};

/* ------------------------------------------------ repair jobs */
VIEWS.jobs = async () => {
  V(`${backBtn()}<h1>Repair jobs</h1><div class="card row"><div><label>Dhoondo</label><input id="jq" placeholder="RJ / naam / mobile / model"></div><div><label>Status</label><select id="js">${opts([{ v: 'open', t: 'Khule' }, { v: 'Ready', t: 'Ready' }, { v: 'Delivered', t: 'Delivered' }, { v: 'all', t: 'Sab' }])}</select></div></div>${has('job.edit') ? '<div class="btns" style="margin-top:0"><button onclick="go(\'newjob\')">+ Naya job card</button></div>' : ''}<div id="jout" style="margin-top:12px">Load…</div>`);
  const load = async () => {
    const r = await call('job.list', { status: val('js'), q: val('jq') }); if (!r.ok) return;
    $('jout').innerHTML = `<div class="tablewrap"><table><tr><th>Job</th><th>Customer</th><th>Laptop / problem</th><th>Status</th><th>Din</th><th>Tech</th></tr>${r.jobs.map(j => `<tr class="click" onclick="go('job','${j.id}')"><td><b>${esc(j.id)}</b><br><span class="muted">${esc(j.created)}</span></td><td>${esc(j.customer)}<br><span class="muted">${esc(j.mobile)}</span></td><td>${esc(j.model)}<br><span class="muted">${esc(j.problem)}</span></td><td>${pill(j.status)}</td><td style="color:${j.days > 3 && j.status !== 'Ready' && j.status !== 'Delivered' ? 'var(--bad)' : ''}">${j.days}</td><td>${esc(j.tech)}</td></tr>`).join('')}</table></div>`;
  };
  $('js').onchange = load; onEnter('jq', load); load();
};
VIEWS.newjob = async (sticker) => {
  const L = await lists();
  const techs = L.users.filter(u => u.role === 'repair').map(u => u.name);
  V(`${backBtn('jobs')}<h1>Naya job card</h1><div class="card">
  <label>1. RJ sticker customer ke laptop pe lagao aur scan karo</label>${scanInput('j_st', 'RJ sticker')}
  <div class="row"><div><label>Customer ka naam</label><input id="j_c"></div><div><label>Mobile</label><input id="j_m" inputmode="numeric" maxlength="10"></div></div>
  <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="j_wa" checked style="width:auto"> Customer ke paas WhatsApp hai</label>
  <div class="row3"><div><label>Brand</label><select id="j_b">${opts(L.brands, '', 'Chuno')}</select></div><div><label>Model</label><input id="j_mo"></div><div><label>Serial (scan)</label><input id="j_se"></div></div>
  <div class="row"><div><label>Problem</label><select id="j_p">${opts(L.problems, '', 'Chuno')}</select></div><div><label>Estimate ₹</label><input id="j_e" inputmode="numeric"></div></div>
  <label>Problem detail</label><input id="j_pd" placeholder="Customer ne kya bataya">
  <div class="row"><div><label>Saath mein kya aaya</label><input id="j_rw" placeholder="Charger, bag…"></div><div><label>Haalat (scratch / toota)</label><input id="j_co"></div></div>
  <label>Technician</label><select id="j_t">${opts(techs, S.me.name)}</select>
  <div class="btns"><button id="j_save">Job card banao</button></div></div>`);
  if (sticker) $('j_st').value = sticker;
  $('j_st').focus(); onEnter('j_st', () => $('j_c').focus());
  $('j_save').onclick = async () => {
    const d = { sticker: val('j_st'), customer: val('j_c'), mobile: val('j_m'), wa: $('j_wa').checked, brand: val('j_b'), model: val('j_mo'), serial: val('j_se'), problem: [val('j_p'), val('j_pd')].filter(Boolean).join(' - '), estimate: val('j_e'), receivedWith: val('j_rw'), condition: val('j_co'), tech: val('j_t') };
    const r = await act($('j_save'), 'job.create', d, 'Job card ban gaya');
    if (r.ok) { go('job', r.job.id); setTimeout(() => sendSlip(r.job, 'new'), 300); }
  };
};
VIEWS.job = async (id) => {
  V(`${backBtn('jobs')}<div id="jv">Load…</div>`);
  const r = await call('job.get', { id }); if (!r.ok) return;
  const j = r.job; window._job = j;
  const full = !!j.log;
  if (!full) return $('jv').innerHTML = `<div class="card"><h1>${esc(j.id)}</h1>${pill(j.status)}<div class="kv" style="margin-top:10px"><b>Customer</b><span>${esc(j.customer)}</span><b>Laptop</b><span>${esc(j.model)}</span><b>Problem</b><span>${esc(j.problem)}</span><b>Estimate</b><span>${money(j.estimate)}</span><b>Technician</b><span>${esc(j.tech)}</span><b>Ready</b><span>${esc(j.readyAt || '-')}</span></div></div>`;
  const open = ['Delivered', 'Cancelled'].indexOf(j.status) < 0;
  const L = await lists(); const techs = L.users.filter(u => u.role === 'repair').map(u => u.name);
  $('jv').innerHTML = `<div class="card"><div class="line" style="border:0;padding:0"><h1 style="margin:0">${esc(j.id)}</h1>${pill(j.status)}</div>
  ${j.comebackOf ? `<div class="alert bad">COMEBACK: ${esc(j.comebackOf)} ke 3 din ke andar wapas aaya</div>` : ''}
  <div class="kv" style="margin-top:10px"><b>Customer</b><span>${esc(j.customer)} · ${esc(j.mobile)} ${j.wa === 'N' ? '(WhatsApp nahi)' : ''}</span><b>Laptop</b><span>${esc(j.brand)} ${esc(j.model)} · ${esc(j.serial || '-')}</span><b>Problem</b><span>${esc(j.problem)}</span>
  <b>Saath mein</b><span>${esc(j.receivedWith || '-')}</span><b>Haalat</b><span>${esc(j.condition || '-')}</span><b>Estimate</b><span>${money(j.estimate) || '-'}</span><b>Final</b><span>${money(j.finalAmount) || '-'}</span>
  <b>Technician</b><span>${esc(j.tech)}</span><b>Pickup PIN</b><span><b>${esc(j.pin || '')}</b></span><b>Parts lage</b><span>${j.parts.map(esc).join('<br>') || '-'}</span>
  ${j.deliveredAt ? `<b>Diya</b><span>${esc(j.deliveredAt)} · ${esc(j.deliveredBy)} · bill ${esc(j.bill)}</span>` : ''}</div>
  <div class="btns">${j.wa !== 'N' ? `<button onclick="sendSlip(window._job,'new')">📲 WhatsApp slip</button>` : ''}<button class="sec" onclick="printSlip(window._job)">🖨️ Slip print</button>
  ${open && j.status === 'Ready' && j.wa !== 'N' ? `<button class="ok" onclick="sendSlip(window._job,'ready')">📲 "Ready hai" message</button>` : ''}</div></div>
  ${open && has('job.edit') ? `<div class="card"><h2>Update</h2><div class="row3"><div><label>Status</label><select id="u_s">${opts(['', 'In Progress', 'Waiting Part', 'Ready', 'Cancelled'].map(x => ({ v: x, t: x || '(same)' })))}</select></div><div><label>Final amount ₹</label><input id="u_f" inputmode="numeric" value="${esc(j.finalAmount)}"></div><div><label>Technician</label><select id="u_t">${opts(techs, j.tech)}</select></div></div>
  <label>Note</label><input id="u_n"><div class="btns"><button id="u_b">Save</button><button class="sec" onclick="usePartDlgJob('${j.id}')">🧩 Part lagao</button>${has('move') && j.status !== 'Outside' ? `<button class="sec" onclick="outDlg('${j.id}')">🚚 Bahar bhejo</button>` : ''}${j.status === 'Outside' ? `<button class="sec" onclick="moveIn('${j.id}');setTimeout(()=>go('job','${j.id}'),800)">Bahar se wapas</button>` : ''}</div></div>` : ''}
  ${open && j.status === 'Ready' ? `<div class="card"><h2>Customer ko do</h2><div class="row"><div><label>Customer ka PIN</label><input id="d_p" inputmode="numeric" maxlength="4"></div><div><label>Bill no.</label><input id="d_b"></div></div>
  <div class="btns"><button class="ok" id="d_go">PIN se do</button>${S.me.role === 'admin' || S.me.role === 'manager' ? `<button class="warn" onclick="deliverId('${j.id}')">PIN nahi hai (ID proof)</button>` : ''}</div></div>` : ''}
  <div class="card"><h2>History</h2>${j.log.map(l => `<div class="line"><span>${esc(l.event)} ${l.details ? '· ' + esc(l.details) : ''}</span><span class="muted">${esc(l.by)} · ${esc(l.time)}</span></div>`).join('')}</div>`;
  if ($('u_b')) $('u_b').onclick = async () => { const d = { id: j.id, finalAmount: val('u_f'), notes: val('u_n') }; if (val('u_s')) d.status = val('u_s'); if (val('u_t') !== j.tech) d.tech = val('u_t'); const x = await act($('u_b'), 'job.update', d, 'Save'); if (x.ok) { if (d.status === 'Ready' && j.wa !== 'N') { go('job', j.id); setTimeout(() => sendSlip(x.job, 'ready'), 400); } else go('job', j.id); } };
  if ($('d_go')) $('d_go').onclick = async () => { const x = await act($('d_go'), 'job.deliver', { id: j.id, pin: val('d_p'), bill: val('d_b') }, 'Laptop customer ko de diya'); if (x.ok) go('job', j.id); };
};
function usePartDlgJob(jobId) {
  modal(`<h2>${jobId} mein part lagao</h2><label>Part ka serial scan karo</label><input id="ups"><div class="btns"><button id="upb">Lagao</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('ups').focus();
  $('upb').onclick = async () => { const r = await act($('upb'), 'parts.use', { serial: val('ups'), target: jobId }, 'Part laga diya'); if (r.ok) { closeModal(); go('job', jobId); } };
  onEnter('ups', () => $('upb').click());
}
function deliverId(id) {
  modal(`<h2>${id}: bina PIN ke</h2><div class="alert bad">Sirf tab jab customer ka phone kho gaya / PIN yaad nahi. ID dekh ke hi do.</div><label>ID proof (Aadhaar ke aakhri 4 / DL no.)</label><input id="di"><label>Bill no.</label><input id="dbn">
  <div class="btns"><button class="warn" id="dib">Do</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('dib').onclick = async () => { const r = await act($('dib'), 'job.deliver', { id, idProof: val('di'), bill: val('dbn') }, 'Diya'); if (r.ok) { closeModal(); go('job', id); } };
}
function slipText(j, kind) {
  const ph = window.GJ_SHOP_PHONE;
  if (kind === 'ready') return `Namaste ${j.customer} ji,\n\nAapka laptop *${j.brand} ${j.model}* (Job *${j.id}*) *ready* hai. ✅\nAmount: *₹${j.finalAmount || j.estimate || ''}*\n\nLaptop lene aate waqt apna *Pickup PIN* batayein (job slip mein hai).\nTiming: Mon–Sat 9:30 AM – 8 PM, Sunday 12–5 PM.\n\n– Genuine Junction, Hisar\n${ph}`;
  return `*Genuine Junction · Repair Slip*\n\nJob No: *${j.id}*\nDate: ${j.created}\nNaam: ${j.customer}\nLaptop: ${j.brand} ${j.model}${j.serial ? '\nSerial: ' + j.serial : ''}\nProblem: ${j.problem}${j.receivedWith ? '\nSaath mein: ' + j.receivedWith : ''}${j.condition ? '\nHaalat: ' + j.condition : ''}${j.estimate ? '\nEstimate: ₹' + j.estimate + ' (andaaza, check ke baad final)' : ''}\n\n🔐 *Pickup PIN: ${j.pin}*\nLaptop lene ke time ye PIN batana zaroori hai. Kisi aur ko mat batayein.\n\nRepair ke baad 3 din ki checking warranty. Status ke liye: ${ph}\n– Genuine Junction, Hisar`;
}
function sendSlip(j, kind) {
  if (!j || !j.mobile) return;
  const url = 'https://wa.me/91' + j.mobile + '?text=' + encodeURIComponent(slipText(j, kind));
  window.open(url, '_blank');
}
function printSlip(j) {
  const w = window.open('', '_blank', 'width=420,height=640');
  w.document.write(`<html><head><title>${esc(j.id)}</title><style>body{font-family:Arial;padding:14px;max-width:360px}h2{margin:0}td{padding:3px 4px;vertical-align:top;font-size:14px}.pin{font-size:26px;font-weight:800;border:2px dashed #000;text-align:center;padding:6px;margin:10px 0}</style></head><body>
  <h2>Genuine Junction</h2><div>Repair Slip · Hisar · ${esc(window.GJ_SHOP_PHONE)}</div><hr>
  <table><tr><td>Job</td><td><b>${esc(j.id)}</b></td></tr><tr><td>Date</td><td>${esc(j.created)}</td></tr><tr><td>Naam</td><td>${esc(j.customer)} (${esc(j.mobile)})</td></tr><tr><td>Laptop</td><td>${esc(j.brand)} ${esc(j.model)} ${esc(j.serial || '')}</td></tr><tr><td>Problem</td><td>${esc(j.problem)}</td></tr><tr><td>Saath</td><td>${esc(j.receivedWith || '-')}</td></tr><tr><td>Estimate</td><td>${j.estimate ? '₹' + esc(j.estimate) : '-'}</td></tr></table>
  <div class="pin">PIN: ${esc(j.pin)}</div><div style="font-size:12px">Laptop lene ke time ye slip / PIN zaroori hai. Repair ke baad 3 din ki checking warranty.</div>
  <script>window.print()<\/script></body></html>`);
  w.document.close();
}

/* ------------------------------------------------ outside */
VIEWS.outside = async () => {
  V(`${backBtn()}<h1>Bahar gaye laptop</h1><div class="card"><h2>Bahar bhejo</h2>${scanInput('oq', 'GJ / RJ sticker')}</div><div id="oout">Load…</div>`);
  onEnter('oq', c => { $('oq').value = ''; outDlg(c); });
  const r = await call('move.outside'); if (!r.ok) return;
  $('oout').innerHTML = r.items.length ? `<div class="tablewrap"><table><tr><th>ID</th><th>Kiske paas</th><th>Kyun</th><th>Kab gaya</th><th>Wapas kab</th><th></th></tr>${r.items.map(i => `<tr><td><b>${esc(i.id)}</b></td><td>${esc(i.partner)}</td><td>${esc(i.reason)}</td><td>${esc(i.since)}</td><td style="color:${i.late ? 'var(--bad)' : ''}">${esc(i.expected)}${i.late ? ' (late)' : ''}</td><td><button class="sm" onclick="moveIn('${i.id}')">Wapas aaya</button></td></tr>`).join('')}</table></div>` : '<p class="muted">Abhi kuch bahar nahi hai.</p>';
};

/* ------------------------------------------------ exchange */
VIEWS.exchange = async (sticker) => {
  const L = await lists();
  V(`${backBtn()}<h1>Exchange / Buyback / Return</h1><div class="card"><div class="alert">Customer se aaya laptop. Value hi iski kharid keemat banegi. ₹${L.exchangeLimit.toLocaleString('en-IN')} se upar Varun approve karenge.</div>
  <div class="row"><div><label>Kya hai</label><select id="x_k">${opts(['Exchange', 'Buyback', 'Customer Return'])}</select></div><div><label>Kis bill ke saath</label><input id="x_b"></div></div>
  <div class="row"><div><label>Customer naam</label><input id="x_c"></div><div><label>Exchange / kharid value ₹</label><input id="x_v" inputmode="numeric"></div></div>
  <label>Naya GJ sticker lagao aur scan karo</label>${scanInput('f_sticker', 'GJ sticker')}<label>Serial</label><input id="f_serial">${laptopFields(L)}
  <div class="btns"><button id="x_s">Save</button></div></div>`);
  if (sticker) $('f_sticker').value = sticker;
  $('x_s').onclick = async () => { const d = Object.assign(readLaptop(), { kind: val('x_k'), bill: val('x_b'), customer: val('x_c'), value: val('x_v'), sticker: val('f_sticker') }); const r = await withWarn($('x_s'), 'exchange.add', d, ''); if (r.ok) { toast(r.id + ' stock mein (repair check)' + (r.needsApproval ? ' · Varun ka approval baaki' : ''), 'ok'); go('scan'); setTimeout(() => lookup(r.id), 100); } };
};

/* ------------------------------------------------ daily blind count */
VIEWS.count = async () => {
  const t = await call('count.today'); if (!t.ok) return;
  const can = sec => has('dash') || S.me.role === (sec === 'Repair' ? 'repair' : 'sales');
  V(`${backBtn()}<h1>Roz ki ginti</h1><div class="card"><p>Closing pe section ka <b>har</b> laptop scan karo. Scan ke time app nahi batayega kya hona chahiye. Khatam karne ke baad farak dikhega.</p>
  <div class="line"><span><b>Sales</b> · aaj baari: ${esc(t.sales.who || '-')}</span>${t.sales.done ? `<span class="pill p-Ready">Ho gayi · ${esc(t.sales.done)}</span>` : can('Sales') ? `<button onclick="countRun('Sales')">Shuru karo</button>` : ''}</div>
  <div class="line"><span><b>Repair</b> · aaj baari: ${esc(t.repair.who || '-')}</span>${t.repair.done ? `<span class="pill p-Ready">Ho gayi · ${esc(t.repair.done)}</span>` : can('Repair') ? `<button onclick="countRun('Repair')">Shuru karo</button>` : ''}</div></div>`);
};
async function countRun(section) {
  const r = await call('count.start', { section }); if (!r.ok) return;
  const id = r.id; let n = r.scanned || 0;
  V(`${backBtn('count')}<h1>${section} ginti</h1><div class="card"><div class="big" id="cn">${n}</div><p class="muted center" style="padding:0">scan hue</p>${scanInput('cs', 'Har laptop ka sticker scan karo')}<div id="clast" class="muted" style="margin-top:8px"></div>
  <div class="btns"><button class="ok" id="cf">Sab scan ho gaye: farak dikhao</button></div></div>`);
  $('cs').focus();
  onEnter('cs', async code => {
    $('cs').value = '';
    const x = await call('count.scan', { id, code }); if (!x.ok) { toast(x.msg, 'bad'); return; }
    if (x.dup) { $('clast').textContent = x.code + ' pehle hi scan ho chuka'; return; }
    n = x.n; $('cn').textContent = n; $('clast').textContent = '✓ ' + x.code; $('cs').focus();
  });
  $('cf').onclick = async () => {
    const f = await act($('cf'), 'count.finish', { id }); if (!f.ok) return;
    const reasons = ['Repair section mein', 'Sales section mein', 'Bahar gaya (record mein nahi)', 'Bik gaya (Sold mark baaki)', 'Customer le gaya', 'Nahi mil raha'];
    V(`${backBtn('count')}<h1>${section} ginti ka nateeja</h1><div class="stat"><div><b>${f.expected}</b><span>Hone chahiye</span></div><div><b>${f.scanned}</b><span>Scan hue</span></div><div><b style="color:var(--bad)">${f.missing.length}</b><span>Missing</span></div><div><b style="color:var(--warn)">${f.extra.length}</b><span>Extra</span></div></div>
    ${f.missing.length ? `<div class="card"><h2>Missing: har ek ki wajah chuno</h2>${f.missing.map(m => `<div class="line"><span><b>${esc(m.id)}</b> ${esc(m.info)}</span><select data-id="${esc(m.id)}" class="mr" style="max-width:260px">${opts(reasons, '', 'Wajah chuno')}</select></div>`).join('')}<div class="btns"><button class="sec" onclick="countRun('${section}')">Wapas jaake dhoondo / scan karo</button></div></div>` : '<div class="alert ok">Sab mil gaye 👍</div>'}
    ${f.extra.length ? `<div class="card"><h2>Extra (is section mein nahi hone chahiye the)</h2>${f.extra.map(x => `<div class="line"><b>${esc(x.id)}</b><span>${esc(x.info)}</span></div>`).join('')}<p class="muted">Inhe sahi jagah karo (Scan → Status / haath-badlaav).</p></div>` : ''}
    <div class="btns"><button id="cc">Ginti band karo</button></div>`);
    $('cc').onclick = async () => { const rs = {}; document.querySelectorAll('.mr').forEach(s => rs[s.dataset.id] = s.value); const x = await act($('cc'), 'count.close', { id, reasons: rs }, 'Ginti save ho gayi'); if (x.ok) go('count'); };
  };
}

/* ------------------------------------------------ dashboard */
VIEWS.dash = async () => {
  V(`${backBtn()}<h1>Dashboard</h1><div id="dout">Load…</div>`);
  const r = await call('dash.summary'); if (!r.ok) return; const s = r.s;
  $('dout').innerHTML = `<div class="stat"><div><b>${s.sales}</b><span>Sales mein</span></div><div><b>${s.repair}</b><span>Repair mein</span></div><div><b>${s.outside}</b><span>Bahar</span></div><div><b>${s.soldToday}</b><span>Aaj bike</span></div><div><b>${s.soldMonth}</b><span>Is mahine bike</span></div>${s.value !== undefined ? `<div><b>${money(Math.round(s.value))}</b><span>Stock ki kharid keemat</span></div>` : ''}<div><b>${s.jobs.open}</b><span>Khule repair jobs</span></div><div><b style="color:var(--bad)">${s.jobs.late}</b><span>3 din se zyada</span></div><div><b>${s.jobs.ready}</b><span>Ready, customer nahi aaya</span></div></div>
  ${s.flags && s.flags.length ? `<h2 style="color:var(--bad)">Flags (${s.flags.length})</h2><div class="card">${s.flags.map(f => `<div class="line"><span>${esc(f.text)}</span><span class="muted">${esc(f.who)}</span></div>`).join('')}</div>` : '<h2>Flags</h2><p class="muted">Koi flag nahi.</p>'}
  ${s.outsideByPartner && s.outsideByPartner.length ? `<h2>Kiske paas kitne laptop</h2><div class="card">${s.outsideByPartner.map(p => `<div class="line"><span><b>${esc(p.partner)}</b>: ${p.items.map(i => esc(i.id) + ' (' + esc(i.reason) + ', ' + esc(i.by) + ')').join(', ')}</span><span><b>${p.count}</b></span></div>`).join('')}</div>` : ''}
  <h2>Aaj ki ginti</h2><div class="card"><div class="line"><span>Sales (${esc(s.count.sales.who)})</span><span>${s.count.sales.done ? '✅ ' + esc(s.count.sales.done) : '⏳ baaki'}</span></div><div class="line"><span>Repair (${esc(s.count.repair.who)})</span><span>${s.count.repair.done ? '✅ ' + esc(s.count.repair.done) : '⏳ baaki'}</span></div></div>
  ${s.warranty.length ? `<h2>Dealer warranty khatam hone wali</h2><div class="card">${s.warranty.map(w => `<div class="line"><span><b>${esc(w.id)}</b> ${esc(w.model)}</span><span style="color:${w.daysLeft < 0 ? 'var(--bad)' : 'var(--warn)'}">${w.daysLeft < 0 ? 'khatam' : w.daysLeft + ' din'}</span></div>`).join('')}</div>` : ''}
  ${s.aged.length ? `<h2>Bahut din se pade laptop</h2><div class="card">${s.aged.map(a => `<div class="line"><span><b>${esc(a.id)}</b> ${esc(a.model)} · ${esc(a.loc)}</span><span>${a.days} din</span></div>`).join('')}</div>` : ''}
  ${s.outsideItems.length ? `<h2>Bahar gaye</h2><div class="card">${s.outsideItems.map(o => `<div class="line"><span><b>${esc(o.id)}</b> ${esc(o.partner)}</span><span style="color:${o.late ? 'var(--bad)' : ''}">${esc(o.expected)}</span></div>`).join('')}</div>` : ''}
  <h2>Parts stock</h2><div class="stat">${Object.entries(s.parts).map(([k, n]) => `<div><b>${n}</b><span>${esc(k)}</span></div>`).join('') || '<p class="muted">-</p>'}</div>
  <h2>Accessories</h2><div class="stat">${s.acc.map(a => `<div><b style="color:${a.qty <= 2 ? 'var(--bad)' : ''}">${a.qty}</b><span>${esc(a.item)}</span></div>`).join('')}</div>
  <h2>Dealer scorecard</h2><div class="card"><div id="dsout">Load…</div></div>
  <h2>Repair report (mahina)</h2><div class="card"><div class="scanbox"><input id="rm" placeholder="MM-yyyy" value=""><button onclick="repRep()">Dikhao</button></div><div id="rrout"></div></div>`;
  repRep(); dealerRep();
};
async function dealerRep() {
  const r = await call('report.dealers'); if (!r.ok) return;
  $('dsout').innerHTML = r.rows.length ? `<div class="tablewrap"><table><tr><th>Mahina</th><th>Dealer</th><th>Kharide</th><th>Kharab aaye</th><th>%</th><th>Galat maal</th><th>Wapas bheje</th><th>Abhi dealer ke paas</th></tr>${r.rows.map(x => `<tr><td>${esc(x.month)}</td><td>${esc(x.dealer)}</td><td>${x.bought}</td><td>${x.faulty}</td><td style="color:${x.faultyPct >= 20 ? 'var(--bad)' : ''}">${x.faultyPct}%</td><td>${x.mismatch}</td><td>${x.returned}</td><td>${x.atDealer}</td></tr>`).join('')}</table></div>` : '<p class="muted">Abhi data nahi. PO se maal aane lagega toh yahan dikhega.</p>';
}
async function repRep() {
  const r = await call('report.repair', { month: val('rm') || undefined }); if (!r.ok) return;
  $('rrout').innerHTML = `<p class="muted">${esc(r.month)}</p><div class="tablewrap"><table><tr><th>Technician</th><th>Jobs</th><th>Same day</th><th>3 din+</th><th>Comeback</th><th>Amount</th>${r.rows[0] && r.rows[0].parts !== undefined ? '<th>Parts cost</th>' : ''}</tr>${r.rows.map(x => `<tr><td>${esc(x.tech)}</td><td>${x.jobs}</td><td>${x.sameDay}</td><td>${x.over3}</td><td>${x.comebacks}</td><td>${money(x.amount)}</td>${x.parts !== undefined ? `<td>${money(x.parts)}</td>` : ''}</tr>`).join('')}</table></div>`;
}

/* ------------------------------------------------ admin */
VIEWS.approvals = async () => {
  V(`${backBtn()}<h1>Approvals</h1><div id="apo">Load…</div>`);
  const r = await call('approvals.list'); if (!r.ok) return;
  const L = await lists(true);
  $('apo').innerHTML = r.items.length ? r.items.map(a => `<div class="card"><h2>${esc(a.type)}: ${esc(a.ref)}</h2><p>${esc(a.details)}<br><span class="muted">${esc(a.by)} · ${esc(a.at)}</span></p>
  ${a.type === 'Device' ? `<label>Device ka naam</label><input id="lab_${a.id}" value="${esc(String(a.details).split(' (')[0])}"><label>Kaun-kaun is device pe login kar sake (comma se)</label><input id="usr_${a.id}" value="${esc(a.by)}"><p class="muted">Staff: ${esc(L.users.map(u => u.name).join(', '))}</p>` : ''}
  <div class="btns"><button class="ok" onclick="decide('${a.id}',true)">Approve</button><button class="bad" onclick="decide('${a.id}',false)">Reject</button></div></div>`).join('') : '<p class="muted">Kuch pending nahi.</p>';
};
async function decide(id, approve) { const d = { id, approve }; if ($('usr_' + id)) { d.users = val('usr_' + id); d.label = val('lab_' + id); } const r = await act(null, 'approvals.decide', d, approve ? 'Approve' : 'Reject'); if (r.ok) { await lists(true); go('approvals'); } }
VIEWS.users = async () => {
  V(`${backBtn()}<h1>Staff + devices</h1><div class="btns" style="margin-top:0"><button onclick="userDlg()">+ Naya staff</button></div><div id="uo">Load…</div>`);
  const r = await call('admin.users'); if (!r.ok) return; window._U = r;
  $('uo').innerHTML = `<h2>Staff</h2><div class="tablewrap"><table><tr><th>Naam</th><th>Mobile</th><th>Role</th><th>Extra</th><th>Haal</th><th></th></tr>${r.users.map((u, i) => `<tr><td>${esc(u.name)}</td><td>${esc(u.mobile)}</td><td>${esc(u.role)}</td><td>${esc(u.extra)}</td><td>${u.active === 'Y' ? (u.locked === 'Y' ? pill('Locked') : pill('Approved')) : pill('Revoked')}</td><td><button class="sm sec" onclick="userDlg(${i})">Edit</button></td></tr>`).join('')}</table></div>
  <h2>Devices</h2><div class="tablewrap"><table><tr><th>Device</th><th>Haal</th><th>Kaun chala sakta hai</th><th>Last</th><th></th></tr>${r.devices.map((d, i) => `<tr><td>${esc(d.label)}</td><td>${pill(d.status)}</td><td>${esc(d.users)}</td><td>${esc(d.lastUser)} · ${esc(d.lastSeen)}</td><td>${d.status === 'Approved' ? `<button class="sm sec" onclick="devDlg(${i})">Edit</button>` : ''}</td></tr>`).join('')}</table></div>`;
};
function userDlg(i) {
  const u = i === undefined ? {} : window._U.users[i];
  modal(`<h2>${u.name ? esc(u.name) : 'Naya staff'}</h2><label>Naam</label><input id="un" value="${esc(u.name || '')}" ${u.name ? 'readonly' : ''}><label>Mobile</label><input id="um" value="${esc(u.mobile || '')}" inputmode="numeric" maxlength="10">
  <label>Role</label><select id="ur">${opts([{ v: 'sales', t: 'Sales' }, { v: 'repair', t: 'Repair' }, { v: 'manager', t: 'Manager (Aakash)' }, { v: 'admin', t: 'Admin' }], u.role || 'sales')}</select>
  <label>Extra permission (jaise Harsh ke liye: job.status)</label><input id="ue" value="${esc(u.extra || '')}">
  ${u.name ? `<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="ua" style="width:auto" ${u.active === 'Y' ? 'checked' : ''}> Active (hatao toh login + devices band)</label><label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="up" style="width:auto"> PIN reset karo (naya temporary PIN)</label>${u.locked === 'Y' ? '<label style="display:flex;gap:8px;align-items:center"><input type="checkbox" id="uu" style="width:auto" checked> Unlock</label>' : ''}` : ''}
  <div class="btns"><button id="us">Save</button><button class="sec" onclick="closeModal()">Cancel</button></div><div id="upin"></div>`);
  $('us').onclick = async () => {
    const d = { name: val('un'), mobile: val('um'), role: val('ur'), extra: val('ue') };
    if ($('ua')) d.active = $('ua').checked; if ($('up') && $('up').checked) d.resetPin = true; if ($('uu') && $('uu').checked) d.unlock = true;
    const r = await act($('us'), 'admin.userSave', d, 'Save');
    if (r.ok) { if (r.tempPin) { $('upin').innerHTML = `<div class="alert ok">Temporary PIN: <b style="font-size:22px">${r.tempPin}</b><br>Ye staff ko khud batao. Pehli login pe woh naya PIN banayega.</div>`; $('us').disabled = true; setTimeout(() => go('users'), 30000); } else { closeModal(); go('users'); } }
  };
}
function devDlg(i) {
  const d = window._U.devices[i];
  modal(`<h2>${esc(d.label)}</h2><label>Naam</label><input id="dvl" value="${esc(d.label)}"><label>Kaun chala sakta hai (comma se)</label><input id="dvu" value="${esc(d.users)}">
  <div class="btns"><button id="dvs">Save</button><button class="bad" id="dvr">Device band karo</button><button class="sec" onclick="closeModal()">Cancel</button></div>`);
  $('dvs').onclick = async () => { const r = await act($('dvs'), 'admin.deviceSave', { id: d.id, label: val('dvl'), users: val('dvu') }, 'Save'); if (r.ok) { closeModal(); go('users'); } };
  $('dvr').onclick = async () => { if (!confirm('Ye device hamesha ke liye band? Dobara register karna padega.')) return; const r = await act($('dvr'), 'admin.deviceSave', { id: d.id, revoke: true }, 'Band'); if (r.ok) { closeModal(); go('users'); } };
}
VIEWS.settings = async () => {
  V(`${backBtn()}<h1>Settings + log</h1><div id="so">Load…</div>`);
  const r = await call('admin.config', {}); if (!r.ok) return;
  const lg = await call('admin.log');
  $('so').innerHTML = `<div class="card">${Object.entries(r.config).map(([k, v]) => `<div class="line"><span><b>${esc(k)}</b><br><span class="muted">${esc(v || '-')}</span></span><button class="sm sec" onclick="cfgEdit('${esc(k)}','${esc(v)}')">Badlo</button></div>`).join('')}</div>
  <h2>Log (aakhri 200)</h2><div class="tablewrap"><table><tr><th>Time</th><th>Kaun</th><th>Kya</th><th>Ref</th><th>Detail</th></tr>${(lg.items || []).map(l => `<tr><td>${esc(l.time)}</td><td>${esc(l.user)}</td><td>${esc(l.action)}</td><td>${esc(l.ref)}</td><td>${esc(l.details)}</td></tr>`).join('')}</table></div>`;
};
async function cfgEdit(key, cur) { const v = prompt(key, cur); if (v === null) return; const r = await act(null, 'admin.config', { set: { key, value: v } }, 'Save'); if (r.ok) go('settings'); }

boot();
