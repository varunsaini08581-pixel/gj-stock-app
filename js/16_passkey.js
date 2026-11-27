/* GJ App - Fingerprint (owner 27 Nov): the owner and the manager can use the phone's fingerprint instead of typing the PIN - to sign in, to
   open the idle lock and in every "Your PIN" box - so the staff around them never see the PIN typed. It is a passkey of the GJ App: the phone
   keeps its key behind its own fingerprint / screen lock, the server checks every use. The PIN always keeps working. */
'use strict';
Object.assign(T, {
  tFp: 'Fingerprint sign-in', fpTitle: 'Fingerprint sign-in',
  fpIntro: 'Use this phone\'s fingerprint instead of typing your PIN: to sign in, to open the lock and in every "Your PIN" box. Your PIN keeps working as well.',
  fpOnHere: 'Fingerprint sign-in is ON on this device.', fpOffHere: 'Fingerprint sign-in is OFF on this device.',
  fpTurnOn: 'Turn on fingerprint', fpTurnOff: 'Turn off fingerprint', fpPinToTurnOn: 'Type your PIN once to turn on the fingerprint on this device.',
  fpTurnedOn: 'Fingerprint sign-in is on. Next time, tap "Sign in with fingerprint".', fpTurnedOff: 'Fingerprint sign-in is off on this device.',
  fpNoDevice: 'This phone or browser has no fingerprint / screen lock that the GJ App can use. Set a fingerprint in the phone\'s settings and open the GJ App in Chrome.',
  fpOnlyMgr: 'Fingerprint sign-in is for the owner and the manager.',
  fpSignIn: 'Sign in with fingerprint', fpSignInAs: 'Sign in with fingerprint — {name}', fpUnlock: 'Unlock with fingerprint', fpUse: 'Use fingerprint',
  fpUsed: 'Fingerprint confirmed', fpCancelled: 'Fingerprint was cancelled. Try again, or type your PIN.', fpFailed: 'The fingerprint did not work. Try again, or type your PIN.',
  fpGone: 'Fingerprint sign-in is no longer on for you on this device (PIN reset or turned off). Sign in with your PIN and turn it on again.',
  fpOrPin: 'or sign in with mobile number and PIN', fpExpired: 'The fingerprint was taken more than 2 minutes ago. Tap "Use fingerprint" again.', fpLastUsed: 'Last used: {when}'
});

const PK = (() => {
  const KEY = 'gj.pk', held = {}; let seq = 0;
  const b64u = buf => { const u = new Uint8Array(buf); let s = ''; for (let i = 0; i < u.length; i++) s += String.fromCharCode(u[i]); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const unb64u = s => { s = String(s).replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  function local() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); return o && o.credId && o.userId ? o : null; } catch (e) { return null; } }
  function keep(o) { try { if (o) localStorage.setItem(KEY, JSON.stringify(o)); else localStorage.removeItem(KEY); } catch (e) { /* private mode */ } }
  const supported = () => !!(window.PublicKeyCredential && navigator.credentials && typeof navigator.credentials.get === 'function' && window.isSecureContext);
  async function platformOk() { try { return supported() && await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); } catch (e) { return false; } }
  const roleOk = me => !!me && (me.role === 'ADMIN' || me.role === 'MANAGER');
  /* the fingerprint of the person signed in, on this device */
  const mine = () => { const l = local(); return l && S.me && l.userId === S.me.userId && roleOk(S.me) && supported() ? l : null; };
  async function challenge() {
    const r = await api('passkey.challenge', {}, { noSession: true, noLock: true, raw: true });
    if (!r.ok) throw r; if (!r.available) throw { ok: false, code: 'PASSKEY_NO_SUPPORT', msg: r.msg || T.fpFailed }; return r;
  }
  const errOf = e => (e && e.ok === false ? e : { ok: false, code: e && e.name === 'NotAllowedError' ? 'CANCELLED' : 'PASSKEY_LOCAL', cancelled: !!(e && e.name === 'NotAllowedError'), msg: e && e.name === 'NotAllowedError' ? T.fpCancelled : T.fpFailed });
  /* one fingerprint: { a: assertion, until } */
  async function assertion(l) {
    const c = await challenge();
    const cred = await navigator.credentials.get({ publicKey: { challenge: unb64u(c.challenge), rpId: location.hostname, allowCredentials: [{ type: 'public-key', id: unb64u(l.credId) }], userVerification: 'required', timeout: 60000 } });
    if (!cred || !cred.response) throw { name: 'NotAllowedError' };
    return { a: { id: l.credId, cd: b64u(cred.response.clientDataJSON), ad: b64u(cred.response.authenticatorData), sig: b64u(cred.response.signature) }, until: Date.now() + Math.max(10000, Math.min(150000, (Number(c.leftMs) || 120000) - 15000)) };
  }
  /* a "Your PIN" box filled by the fingerprint carries a token; api() swaps it for the fingerprint (the same one for the resends of that entry) */
  function hold(x) { const t = 'FP#' + (++seq) + '#' + Date.now(); held[t] = x; return t; }
  function take(t) { const x = held[t]; if (!x) return null; if (Date.now() > x.until) { delete held[t]; return null; } return x.a; }
  const isToken = v => typeof v === 'string' && /^FP#\d+#\d+$/.test(v);
  /* fills a PIN box: returns the token or '' (message shown by the caller) */
  async function forBox() { const l = mine(); if (!l) return ''; const x = await assertion(l); return hold(x); }
  async function signIn(l) {
    let x; try { x = await assertion(l); } catch (e) { return errOf(e); }
    const r = await api('auth.login', { mobile: l.mobile, passkey: x.a }, { noSession: true, noLock: true });
    if (!r.ok && (r.code === 'PASSKEY_OFF' || r.code === 'PASSKEY_ROLE')) { keep(null); r.msg = T.fpGone; }
    return r;
  }
  async function turnOn(pin) {
    if (!(await platformOk())) return { ok: false, msg: T.fpNoDevice };
    let c; try { c = await challenge(); } catch (e) { return errOf(e); }
    const uid = new TextEncoder().encode(S.me.userId);
    let cred;
    try {
      cred = await navigator.credentials.create({ publicKey: { challenge: unb64u(c.challenge), rp: { id: location.hostname, name: 'GJ App' }, user: { id: uid, name: S.mobile || S.me.userId, displayName: S.me.name },
        pubKeyCredParams: [{ type: 'public-key', alg: -7 }], authenticatorSelection: { authenticatorAttachment: 'platform', userVerification: 'required', residentKey: 'discouraged' }, attestation: 'none', timeout: 60000 } });
    } catch (e) { return errOf(e); }
    const spki = cred && cred.response && typeof cred.response.getPublicKey === 'function' ? cred.response.getPublicKey() : null;
    if (!spki) return { ok: false, msg: T.fpNoDevice };
    const id = b64u(cred.rawId);
    const r = await api('passkey.add', { pin, id, cd: b64u(cred.response.clientDataJSON), pk: b64u(spki) });
    if (r.ok) keep({ credId: id, userId: S.me.userId, mobile: S.mobile, name: S.me.name, at: Date.now() });
    return r;
  }
  async function turnOff() { const r = await api('passkey.off', {}); if (r.ok) keep(null); return r; }
  return { local, mine, supported, platformOk, roleOk, signIn, turnOn, turnOff, forBox, take, isToken, forget: () => keep(null) };
})();

/* the PIN box: a "Use fingerprint" button next to it (owner / manager with the fingerprint on this device) */
function fpBoxButton(F, k) {
  if (!PK.mine()) return null;
  const x = F.f[k]; if (!x) return null;
  const b = btn(T.fpUse, async () => {
    b.disabled = true; let tok = '';
    try { tok = await PK.forBox(); } catch (e) { const m = e && e.ok === false ? e.msg : (e && e.name === 'NotAllowedError' ? T.fpCancelled : T.fpFailed); x.hintEl.textContent = m || T.fpFailed; x.wrap.classList.add('invalid'); }
    b.disabled = false;
    if (tok) { x.inp.value = ''; x.inp.dataset.fp = tok; x.inp.placeholder = '✓ ' + T.fpUsed; x.wrap.classList.add('fp-ok'); x.wrap.classList.remove('invalid'); x.hintEl.textContent = T.fpUsed; if (F.onFp) F.onFp(); }
  }, 'sec sm fpbtn', { 'aria-label': T.fpUse });
  return b;
}

/* V: Fingerprint sign-in (settings of this device, owner / manager) */
VIEWS.fp = {
  title: T.fpTitle, perm: () => PK.roleOk(S.me),
  async render(root) {
    viewHead(root, T.fpTitle);
    const card = h('div', { class: 'card' }); root.appendChild(card);
    append(card, [h('p', { class: 'intro', text: T.fpIntro }), spinner()]);
    const [st, dev] = await Promise.all([api('passkey.state', {}), PK.platformOk()]);
    clear(card); card.appendChild(h('p', { class: 'intro', text: T.fpIntro }));
    if (!st.ok) { card.appendChild(errorCard(st.msg)); return; }
    if (!st.allowed) { card.appendChild(note(T.fpOnlyMgr, 'warn')); return; }
    const on = st.on.length > 0 && !!PK.mine();
    if (st.on.length && !PK.mine()) PK.forget();
    if (!st.on.length && PK.mine()) PK.forget();
    card.appendChild(note(on ? T.fpOnHere : T.fpOffHere, on ? 'ok' : ''));
    if (on && st.on[0].lastUsed) card.appendChild(h('p', { class: 'muted', text: fmt(T.fpLastUsed, { when: fmtDate(st.on[0].lastUsed) }) }));
    if (!dev && !on) { card.appendChild(note(T.fpNoDevice, 'warn')); return; }
    const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
    if (on) {
      const b = btn(T.fpTurnOff, async () => { b.disabled = true; const r = await PK.turnOff(); b.disabled = false; if (!r.ok) { err.textContent = r.msg; err.hidden = false; return; } notify(T.fpTurnedOff, 'ok'); renderRoute(); }, 'sec', { id: 'fpOff' });
      append(card, [err, h('div', { class: 'btns' }, b)]);
    } else {
      const F = mkForm([{ k: 'pin', l: T.yourPin, t: 'pin', req: true, wide: true, hint: T.fpPinToTurnOn, noFp: true }]);
      const b = btn(T.fpTurnOn, async () => {
        err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
        b.disabled = true; const r = await PK.turnOn(F.val('pin')); b.disabled = false; F.set('pin', '');
        if (!r.ok) { if (r.cancelled) return; err.textContent = r.msg || T.fpFailed; err.hidden = false; return; }
        notify(T.fpTurnedOn, 'ok'); renderRoute();
      }, '', { id: 'fpOn' });
      append(card, [F.el, err, h('div', { class: 'btns' }, b)]);
    }
  }
};
