/* GJ App v4 — V16 daily count, V17 scan cycle + Submit stock sheet, V18 scan-cycle rota. */
'use strict';
Object.assign(C, { COUNT_KIND: { DAILY: 'Daily sticker count', ACCESSORY: 'Weekly accessory count', PARTS: 'Monthly parts count' } });
Object.assign(T, {
  ctTitle: 'Daily count', ctIntro: 'At closing, scan the sticker of every laptop in your section. The app does not show what is expected while you scan; the differences (Discrepancy / फ़र्क) are shown after you finish.',
  ctTurn: 'Today\'s turn', ctNobody: 'Not set', ctStart: 'Start count', ctResume: 'Resume count', ctDone: 'Closed today', ctStartedBy: 'Started by', ctClosedBy: 'Closed by', ctSwap: 'Change today\'s counter', ctSwapTitle: 'Change today\'s counter — {section}', ctSwapUser: 'Counted today by',
  ctAccessory: 'Weekly accessory count', ctAccessoryDue: 'The weekly accessory count is due.', ctParts: 'Monthly parts count', ctOther: 'Other counts',
  ctScanTitle: '{section} — {kind}', ctScanned: 'scanned', ctScanBox: 'Scan the sticker on every laptop', ctScanPartBox: 'Scan the serial number of every part in stock', ctLast: 'Last scans', ctQueued: 'Sending…', ctRetry: 'Retry', ctNotSaved: 'Not saved — {msg}', ctWaiting: '{n} scans waiting to be sent',
  ctReveal: 'All scanned — show differences', ctRevealAsk: 'Show the differences now? Do this only after every laptop in the section has been scanned. Scans made afterwards are marked as late.', ctRevealYes: 'Show differences',
  ctSealTitle: 'Seal number — {id}', ctSealIntro: 'This laptop is packed and sealed (सील बंद). Type the number printed on its seal.', ctResultTitle: '{section} — count result', ctMissing: 'Missing — select a reason for each', ctMissingNone: 'All laptops accounted for.',
  ctReason: 'Reason', ctExtra: 'Extra (should not be in this section)', ctExtraHint: 'Move these to the correct section with a handover.', ctUnknown: 'Unknown codes scanned', ctNoSticker: 'Laptops in this section without a sticker', ctBackToScan: 'Go back and scan more',
  ctClose: 'Close count', ctClosed: 'Count closed.', ctSummary: 'Expected {expected} · Found {found} · Missing {missing} · Extra {extra}', ctReasonNeeded: 'Choose a reason for {id}.', ctInfo: 'Details', ctAccIntro: 'Count every item and type the quantity you counted. The recorded balance is not shown.',
  ctWhichTitle: 'Stock laptop or repair job?', ctWhichIntro: 'The number you typed is both {gj} (stock laptop) and {rj} (customer repair job). Which sticker is on the laptop in front of you?', ctWhichStock: 'Stock laptop {id}', ctWhichJob: 'Repair job {id}',
  ctAccNotCounted: 'Not counted yet — enter the quantity (0 if none):',
  ctAccQty: 'Quantity counted', ctAccSave: 'Save quantities and show differences', ctAccNeed: 'Enter a quantity for every item.', ctDiffNone: 'No differences.',
  cyTitle: 'Scan cycle', cyNotOnly: 'Show only laptops not scanned', cySpot: 'Spot check — scan within 2 hours', cyShelf: 'Status', cyState: 'Scan status', cyLastAt: 'Last scan', cyLastBy: 'Scanned by', cyEmpty: 'No laptops in this section.', cyDoneOf: '{done} of {total} scanned ({pct}%)',
  cyMonth: 'Cycles of the month', cyCycle: 'Cycle', cyDates: 'Dates', cyEnds: 'Ends', cySales: 'Sales — responsible', cyRepair: 'Repair — responsible', cySubmitted: 'Submitted', cySubmittedEarly: 'Submitted early (incomplete) - final sheet at cycle end', cyNotSubmitted: 'Not submitted', cySubSales: 'Sales sheet', cySubRepair: 'Repair sheet',
  ssTitle: 'Submit stock sheet', ssIntro: 'The owner receives the full stock sheet of the section by e-mail. Submit it at the end of each scan cycle.', ssSection: 'Section', ssAck: 'I have seen that {k} laptops are not scanned in this cycle', ssAllScanned: 'All {n} laptops of this cycle are scanned.',
  ssSubmit: 'Submit stock sheet', ssSent: 'Stock sheet sent to the owner: {n} laptops, {k} not scanned.', ssQueued: 'Saved. The e-mail will follow.',
  rtTitle: 'Scan-cycle rota', rtMonth: 'Month', rtIntro: 'Choose who is responsible for each 3-day scan cycle. A cycle without a person falls to the manager. Past cycles cannot be changed.', rtUnassigned: 'Not assigned (manager)', rtWhole: 'Whole month to one person',
  rtSplit: 'Split equally (3-3-4)', rtPeople: 'People (in order)', rtApply: 'Apply', rtSave: 'Save rota', rtSaved: 'Rota saved.', rtNoChange: 'No changes to save.', rtPast: 'Ended', rtPickOne: 'Choose one person.', rtPickSome: 'Tick at least one person.', rtHelper: 'Quick fill — {section}'
});
let audioCtx = null;
function beep(bad) { try { audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)(); const o = audioCtx.createOscillator(), g = audioCtx.createGain(); o.type = 'square'; o.frequency.value = bad ? 220 : 880; g.gain.value = 0.08; o.connect(g); g.connect(audioCtx.destination); o.start(); o.stop(audioCtx.currentTime + (bad ? 0.35 : 0.06)); } catch (e) { /* sound is optional */ } }
const canCount = sec => isMgr() || (S.me && S.me.section === sec);

VIEWS.count = {
  title: T.ctTitle, perm: () => has('count'),
  render(root, arg) {
    /* R37B-02: a count that was open on this screen when the page was reloaded (F5, an update, a crash of the browser) opens again on
       its scan screen, with the scans that were still waiting to be sent - nothing typed by the scanner goes to a start page */
    const kept = countKept(); if (kept) { countScreen(root, kept); return; }
    viewHead(root, T.ctTitle); root.appendChild(h('p', { class: 'intro', text: T.ctIntro }));
    const startKind = async (b, section, kind) => { const r = await runAction(b, 'count.start', kind === 'DAILY' ? { section } : { section, kind }, { ok: false, refresh: false }); if (r.ok) countScreen(clear($('#view')), { countId: r.countId, section, kind, scanned: r.scanned || 0, items: r.items }); };
    S.refresh = load(root, 'count.today', {}, (r, box) => {
      (r.sections || []).forEach(s => {
        const closed = s.status === 'CLOSED';
        box.appendChild(h('div', { class: 'card countsec', dataset: { section: s.section } }, h('div', { class: 'sect' }, h('h2', { text: lbl('SECTION', s.section) }), pill('COUNT_STATUS', s.status || 'NOT_STARTED', closed ? 'good' : (s.status === 'OPEN' ? 'warn' : 'plain'))),
          kv([[T.ctTurn, s.turn && s.turn.name ? s.turn.name : T.ctNobody], [T.ctStartedBy, userName(s.startedBy)], [T.ctClosedBy, userName(s.closedBy)]]),
          h('div', { class: 'btns' }, !closed && canCount(s.section) ? btn(s.status === 'OPEN' ? T.ctResume : T.ctStart, e => startKind(e.currentTarget, s.section, 'DAILY'), '', { 'data-start': s.section }) : null,
            has('rota') ? btn(T.ctSwap, () => actionDialog({ title: fmt(T.ctSwapTitle, { section: lbl('SECTION', s.section) }), action: 'rota.swap', fields: [{ k: 'userId', l: T.ctSwapUser, t: 'sel', req: true, o: () => userOpts(u => u.section === s.section) }], build: v => ({ section: s.section, date: todayISO(), userId: v.userId }) }), 'sec') : null)));
      });
      const sec = S.me.section || 'SALES';
      box.appendChild(h('div', { class: 'card' }, h('h2', { text: T.ctOther }), yes(r.accessoryDue) ? note(T.ctAccessoryDue, 'warn') : null, h('div', { class: 'btns' }, btn(T.ctAccessory, e => startKind(e.currentTarget, sec, 'ACCESSORY'), 'sec', { id: 'ctAccessory' }),
        isMgr() || role() === 'REPAIR' ? btn(T.ctParts, e => startKind(e.currentTarget, 'REPAIR', 'PARTS'), 'sec', { id: 'ctParts' }) : null, has('dash') ? btn(T.rpCountHist, () => go('reports', 'countHistory'), 'sec') : null)));
      if (arg === 'ACCESSORY') { const b = $('#ctAccessory', box); if (b) b.focus(); }
    });
  }
};
/* R37B-02: the open count of this screen is remembered for this tab (sessionStorage: gone at sign-out and when the tab is closed) - the
   count ID, what the screen showed and the scans not yet saved. countKept() returns it after a reload for the same person and day. */
function countKeep(c, unsent) { try { sessionStorage.setItem('gj.count', JSON.stringify({ u: S.me.userId, day: todayISO(), c: { countId: c.countId, section: c.section, kind: c.kind, scanned: c.scanned || 0, items: c.items }, unsent: unsent || [] })); } catch (e) { /* kept in memory only */ } }
function countDrop() { try { sessionStorage.removeItem('gj.count'); } catch (e) { /* ignore */ } }
function countKept() {
  let k = null; try { k = JSON.parse(sessionStorage.getItem('gj.count') || 'null'); } catch (e) { k = null; }
  if (!k || !k.c || !k.c.countId || !S.me || k.u !== S.me.userId || k.day !== todayISO()) { if (k) countDrop(); return null; }
  return Object.assign({}, k.c, { unsent: Array.isArray(k.unsent) ? k.unsent : [] });
}
function countScreen(root, c) {
  S.refresh = null; S.dirty = false;
  /* R37B-02: while a count is open on this screen (scan screen, accessory count, result) no new app version is activated and the page
     is never reloaded - also between two scans, when nothing is waiting to be sent. S.leave runs when the screen is left. */
  S.countOpen = true; S.hold = () => true; S.leave = () => { S.countOpen = false; countDrop(); };
  countKeep(c, c.unsent);
  const title = fmt(T.ctScanTitle, { section: lbl('SECTION', c.section), kind: lbl('COUNT_KIND', c.kind) });
  /* R32C-03: Back asks when scans are not saved (failed and waiting for Retry, or still being sent) */
  let unsent = () => 0;
  root.appendChild(h('div', { class: 'vhead' }, btn(T.back, async () => { const n = unsent(); if (n && !(await confirmBox(fmt(T.ctUnsentLeave, { n }), { yes: T.ctLeaveYes, danger: true }))) return; S.dirty = false; renderRoute(); }, 'ghost back'), h('h1', { text: title })));
  if (c.kind === 'ACCESSORY') { accCount(root, c); return; }
  const big = h('div', { class: 'big', id: 'ctCounter', text: String(c.scanned) }), inp = h('input', { type: 'text', class: 'code', id: 'ctInput', 'data-scanbox': '', 'aria-label': c.kind === 'PARTS' ? T.ctScanPartBox : T.ctScanBox, placeholder: c.kind === 'PARTS' ? T.ctScanPartBox : T.ctScanBox, autocomplete: 'off', maxlength: 40 });
  const log = h('ul', { class: 'scanlog', id: 'ctLog', 'aria-live': 'polite' }), waitEl = h('p', { class: 'hint', id: 'ctWaiting' });
  const queue = [], shown = []; let running = false, lastKey = 0, fast = 0, slow = 0;
  /* R31C-08: scans waiting to be sent live only in this page - no update reload until they are sent. R32C-03: the same for a scan that
     failed and waits for Retry (it is shown in red only on this page); S.dirty is set while there is one, so Back, F5 and leaving ask */
  const failed = () => shown.filter(x => x.state === 'bad' && x.retry).length;
  unsent = () => shown.filter(x => x.state === 'wait' || (x.state === 'bad' && x.retry)).length;
  /* R37B-02: S.hold stays "true" for the whole count (set at the top of countScreen) */
  const keep = () => countKeep(Object.assign({}, c, { scanned: Number(big.textContent) || 0 }), shown.filter(x => x.state === 'wait' || (x.state === 'bad' && x.retry)).map(x => ({ code: x.code, input: x.input, sealNo: x.sealNo })));
  function draw() {
    clear(log);
    shown.slice(-8).reverse().forEach(x => {
      const li = h('li', { class: x.state === 'bad' ? 'bad' : (x.state === 'wait' ? 'wait' : '') }, h('span', { text: x.code }));
      if (x.state === 'wait') li.appendChild(h('span', { text: T.ctQueued }));
      else if (x.state === 'bad' && x.retry) li.appendChild(h('span', null, fmt(T.ctNotSaved, { msg: x.msg || '' }) + ' ', btn(T.ctRetry, () => { x.state = 'wait'; x.msg = ''; queue.push(x); draw(); pump(); }, 'sm sec')));
      else li.appendChild(h('span', { text: x.msg || lbl('COUNT_RESULT', x.result) }));
      log.appendChild(li);
    });
    const n = queue.length; waitEl.textContent = n ? fmt(T.ctWaiting, { n }) : '';
    if (root.isConnected) { S.dirty = unsent() > 0; keep(); }
  }
  /* Scans are sent strictly one after another; a failed scan stays visible in red with Retry and never blocks the next ones. */
  async function pump() {
    if (running) return; running = true;
    while (queue.length) {
      const x = queue[0]; let data = { countId: c.countId, code: x.code, input: x.input }; if (x.sealNo) data.sealNo = x.sealNo;
      let r = await api('count.scan', data);
      /* round 1 B2 (R1B-04): a bare number in the Repair count that is both a GJ and an RJ sticker - the counter says which one */
      if (!r.ok && r.code === 'COUNT_AMBIGUOUS' && r.gj && r.rj && root.isConnected) { const pick = await askPrefix(r.gj, r.rj); if (pick) { x.code = pick; data.code = pick; r = await api('count.scan', data); } }
      if (!r.ok && r.code === 'SEAL_REQUIRED' && root.isConnected) { const seal = await askSeal(x.code); if (seal) { x.sealNo = seal; data.sealNo = seal; r = await api('count.scan', data); } }
      queue.shift();
      if (!root.isConnected) break;
      if (r.ok) { if (r.item && /^(GJ|RJ)-\d+$/.test(r.item)) x.code = r.item; x.result = r.result; x.state = r.result === 'UNKNOWN' ? 'bad' : 'ok'; x.retry = false; if (typeof r.scanned === 'number') big.textContent = String(r.scanned); beep(r.result === 'UNKNOWN'); }
      else { x.state = 'bad'; x.msg = r.msg; x.retry = r.code !== 'SEAL_WRONG' && r.code !== 'COUNT_NOT_OPEN'; beep(true); }
      draw();
    }
    running = false;
  }
  function askPrefix(gj, rj) { return new Promise(res => { let done = false; const m = openModal({ title: T.ctWhichTitle, onClose: () => { if (!done) res(''); } }); append(m.body, h('p', { text: fmt(T.ctWhichIntro, { gj, rj }) })); const pick = v => { done = true; m.close(); res(v); }; append(m.foot, h('div', { class: 'foot-btns' }, btn(T.cancel, () => pick(''), 'sec'), btn(fmt(T.ctWhichStock, { id: gj }), () => pick(gj), 'sec'), btn(fmt(T.ctWhichJob, { id: rj }), () => pick(rj), ''))); }); }
  function askSeal(id) { return new Promise(res => { let done = false; const m = actionDialog({ title: fmt(T.ctSealTitle, { id }), intro: T.ctSealIntro, fields: [{ k: 'sealNo', l: T.fSeal, req: true, max: 40 }], run: async d => { done = true; res(d.sealNo); return { ok: true }; }, ok: () => '', refresh: false }); m.onClose = () => { if (!done) res(''); }; }); }
  function submit(mode) {
    const code = c.kind === 'PARTS' ? normCode(inp.value) : (c.section === 'REPAIR' && /^\s*\d{1,7}\s*$/.test(inp.value) ? inp.value.trim() : normSticker(inp.value, c.section === 'REPAIR' && /^RJ/i.test(inp.value) ? 'RJ' : 'GJ')); inp.value = '';
    if (!code) return;
    const x = { code, input: mode || (fast > slow ? 'SCANNER' : 'TYPED'), state: 'wait' }; fast = 0; slow = 0;
    queue.push(x); shown.push(x); draw(); pump();
  }
  inp.addEventListener('keydown', e => { const now = Date.now(); if (e.key.length === 1) { if (now - lastKey < 60) fast++; else slow++; } lastKey = now; if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) submit(); } });
  /* Global key capture: scanner input is never lost when the focus is elsewhere on this screen (F328). */
  S.keys = e => {
    if (MODALS.length || S.locked || e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target, tag = t && t.tagName;
    if (t === inp || tag === 'INPUT' || tag === 'SELECT' || tag === 'TEXTAREA') return;
    if (e.key === 'Enter') { if (inp.value) { e.preventDefault(); if (!e.repeat) submit(); } return; }
    if (e.key.length === 1) { e.preventDefault(); const now = Date.now(); if (now - lastKey < 60) fast++; else slow++; lastKey = now; inp.value += e.key; inp.focus(); }
  };
  const reveal = btn(T.ctReveal, async () => {
    if (!(await confirmBox(T.ctRevealAsk, { yes: T.ctRevealYes }))) return;
    reveal.disabled = true; while (running || queue.length) await sleep(150);
    const nf = failed(); if (nf && !(await confirmBox(fmt(T.ctUnsentReveal, { n: nf }), { yes: T.ctRevealYes, danger: true }))) { reveal.disabled = false; return; }
    const r = await api('count.reveal', { countId: c.countId }); reveal.disabled = false;
    if (!r.ok) { notify(r.msg, 'bad'); return; }
    S.keys = null; S.dirty = false; countResult(clear(root), c, r);
  }, 'sec', { id: 'ctReveal' });
  append(root, [h('div', { class: 'card' }, big, h('p', { class: 'muted num-label', text: T.ctScanned }), h('div', { class: 'scanbox' }, inp, btn(T.camera, () => cameraScan(v => { inp.value = v; submit('CAMERA'); }), 'sec')), waitEl), h('h2', { text: T.ctLast }), log, h('div', { class: 'btns' }, reveal)]);
  /* R37B-02: scans that were not saved when the page was reloaded are sent again (a scan that did reach the server answers "already scanned") */
  (c.unsent || []).forEach(u => { if (u && u.code) { const x = { code: String(u.code), input: u.input || 'TYPED', state: 'wait' }; if (u.sealNo) x.sealNo = String(u.sealNo); queue.push(x); shown.push(x); } }); c.unsent = null;
  draw(); soon(() => inp.focus()); if (queue.length) pump();
}
document.addEventListener('keydown', e => { if (S.keys) S.keys(e); });
function countResult(root, c, r) {
  root.appendChild(h('div', { class: 'vhead' }, h('h1', { text: fmt(T.ctResultTitle, { section: lbl('SECTION', c.section) }) })));
  const missing = r.missing || [], extra = r.extra || [], unknown = r.unknown || [], selects = {};
  const card = h('div', { class: 'card', id: 'ctResult' }); root.appendChild(card);
  /* R31C-08: the count result (a reason for every missing laptop, the PIN) is work in progress: no update reload while it is on screen, and
     leaving it after something was chosen or typed asks first */
  S.hold = () => true; card.addEventListener('input', () => { S.dirty = true; }); card.addEventListener('change', () => { S.dirty = true; });
  card.appendChild(h('h2', { text: T.ctMissing }));
  if (!missing.length) card.appendChild(note(T.ctMissingNone, 'ok'));
  else card.appendChild(simpleTable([{ k: 'id', l: T.cRef, main: true }, { k: 'info', l: T.ctInfo, main: true }, { k: 'reason', l: T.ctReason, el: x => { const s = h('select', { 'aria-label': T.ctReason + ' ' + x.id }); s.appendChild(h('option', { value: '', text: T.select })); opts('MISSING_REASON').forEach(o => s.appendChild(h('option', { value: o.v, text: o.t }))); selects[x.id] = s; return s; } }], missing));
  if (extra.length) { card.appendChild(h('h2', { text: T.ctExtra })); card.appendChild(h('p', { class: 'hint', text: T.ctExtraHint })); card.appendChild(simpleTable([{ k: 'id', l: T.cRef, main: true }, { k: 'info', l: T.ctInfo }], extra)); }
  if (unknown.length) { card.appendChild(h('h2', { text: T.ctUnknown })); card.appendChild(h('p', { text: unknown.map(u => (typeof u === 'string' ? u : u.code || u.id)).join(', ') })); }
  const notCounted = c.kind === 'ACCESSORY' && Array.isArray(r.notCounted) ? r.notCounted : [], ncIn = {};
  if (notCounted.length) { card.appendChild(h('h2', { text: T.ctAccNotCounted })); card.appendChild(simpleTable([{ k: 'item', l: T.acItem, main: true }, { k: 'qty', l: T.ctAccQty, el: a => { const i = h('input', { type: 'text', inputmode: 'numeric', class: 'num', 'aria-label': T.ctAccQty + ' ' + a.item, autocomplete: 'off', maxlength: 5 }); i.addEventListener('input', () => { i.value = digits(i.value); }); ncIn[a.itemId] = i; return i; } }], notCounted)); }
  const F = mkForm([c.kind === 'DAILY' ? { k: 'noSticker', l: T.ctNoSticker, t: 'int', req: true, maxv: 500 } : null, { k: 'pin', l: T.yourPin, t: 'pin', req: true }].filter(Boolean));
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  const b = btn(T.ctClose, async () => {
    if (b.dataset.busy) return; err.hidden = true; const reasons = {};
    for (const x of missing) { const v = selects[x.id] ? selects[x.id].value : ''; if (!v) { err.textContent = fmt(T.ctReasonNeeded, { id: x.id }); err.hidden = false; selects[x.id].focus(); return; } reasons[x.id] = v; }
    if (notCounted.some(a => ncIn[a.itemId].value === '')) { err.textContent = T.ctAccNeed; err.hidden = false; return; }
    const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    const v = F.get(); b.dataset.busy = '1'; b.disabled = true;
    /* R37B-01: after an unsure answer the reasons, quantities and the PIN box are locked and the same close is sent again */
    /* RV38-04: the retry of a locked form goes on where the first attempt stopped (ncAt = the quantities already saved for sure): after a
       lost reply of the close ONLY the close is sent again, under its kept request ID - the quantity lines are not sent to the count the
       server has already closed ("count closed" used to hide the saved result) */
    let ncAt = 0;
    const x = await U.run(async () => {
      for (; ncAt < notCounted.length; ncAt++) { const a = notCounted[ncAt], q = await api('count.scan', { countId: c.countId, code: a.itemId, itemId: a.itemId, qty: Number(ncIn[a.itemId].value), input: 'TYPED' }); if (!q.ok) return Object.assign({}, q, { msg: a.item + ': ' + q.msg }); }
      return api('count.close', { countId: c.countId, reasons, noSticker: v.noSticker || 0, pin: v.pin });
    }, b); delete b.dataset.busy; b.disabled = false;
    if (!x.ok) { if (x.code === 'AUTH_PIN_WRONG') F.mark('pin', ''); err.textContent = x.msg; err.hidden = false; return; }
    const s = x.summary || {}; notify(T.ctClosed + ' ' + fmt(T.ctSummary, { expected: s.expected == null ? '–' : s.expected, found: s.found == null ? '–' : s.found, missing: s.missing == null ? missing.length : s.missing, extra: s.extra == null ? extra.length : s.extra }), 'ok');
    renderRoute();
  }, '', { id: 'ctClose' });
  const U = unsureGuard(err, () => [card]); /* R37B-01 */
  append(card, [F.el, err, h('div', { class: 'btns' }, c.kind === 'ACCESSORY' ? null : btn(T.ctBackToScan, () => countScreen(clear(root), c), 'sec'), b)]);
}
function accCount(root, c) {
  /* round 1 B2 (R1A-03 / R1B-07): the items this count expects come from the server (count.start), not from the list loaded at sign-in */
  const items = (Array.isArray(c.items) ? c.items : (L().accItems || [])).filter(a => a.active !== 'N' && a.active !== false), inputs = {};
  root.appendChild(h('p', { class: 'intro', text: T.ctAccIntro }));
  const table = simpleTable([{ k: 'item', l: T.acItem, main: true }, { k: 'group', l: T.acGroup }, { k: 'qty', l: T.ctAccQty, el: a => { const i = h('input', { type: 'text', inputmode: 'numeric', class: 'num', 'aria-label': T.ctAccQty + ' ' + a.item, autocomplete: 'off', maxlength: 5 }); i.addEventListener('input', () => { i.value = digits(i.value); }); inputs[a.itemId] = i; return i; } }], items, { empty: T.acEmpty });
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  const b = btn(T.ctAccSave, async () => {
    if (b.dataset.busy) return; err.hidden = true;
    if (items.some(a => inputs[a.itemId].value === '')) { err.textContent = T.ctAccNeed; err.hidden = false; return; }
    b.dataset.busy = '1'; b.disabled = true;
    /* R37B-01: after an unsure answer the quantities are locked and the same numbers are sent again */
    /* RV38-04: as in countResult - a retry of the locked form sends only what is not saved for sure (after a lost reply of the reveal: the reveal alone) */
    let itAt = 0;
    const r = await U.run(async () => {
      for (; itAt < items.length; itAt++) { const a = items[itAt], q = await api('count.scan', { countId: c.countId, code: a.itemId, itemId: a.itemId, qty: Number(inputs[a.itemId].value), input: 'TYPED' }); if (!q.ok) return Object.assign({}, q, { msg: a.item + ': ' + q.msg }); }
      return api('count.reveal', { countId: c.countId });
    }, b); delete b.dataset.busy; b.disabled = false;
    if (!r.ok) { err.textContent = r.msg; err.hidden = false; return; }
    countResult(clear(root), c, r);
  }, '', { id: 'ctAccSave' });
  const U = unsureGuard(err, () => [table]); /* R37B-01 */
  append(root, [table, err, h('div', { class: 'btns' }, b)]);
}

/* ---------- V17 scan cycle ---------- */
const respName = x => (!x ? '' : (typeof x === 'string' ? userName(x) : (x.name || userName(x.userId))));
VIEWS.cycle = {
  title: T.cyTitle, perm: () => has('scan') || has('sheet.submit'),
  render(root) {
    viewHead(root, T.cyTitle, [has('sheet.submit') ? btn(T.submitSheet, () => submitSheetDialog(section), '', { id: 'cySubmit' }) : null, has('rota') ? btn(T.tRota, () => go('rota'), 'sec') : null]);
    let section = isMgr() ? 'SALES' : (S.me.section || ''), onlyNot = false;
    const tabs = h('div', { class: 'tabs', role: 'tablist' }), body = h('div'), month = h('div');
    if (isMgr()) ['SALES', 'REPAIR'].forEach(s => tabs.appendChild(h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': s === section ? 'true' : 'false', text: lbl('SECTION', s), onclick: e => { section = s; $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', t === e.currentTarget ? 'true' : 'false')); draw(); } })));
    append(root, [tabs, body, h('h2', { text: T.cyMonth }), month]);
    const cols = [{ k: 'id', l: T.fId, main: true }, { k: 'model', l: T.fModel, main: true }, { k: 'spot', l: '', v: r => (yes(r.spot) ? T.cySpot : ''), el: r => (yes(r.spot) ? h('span', { class: 'pill bad', text: T.cySpot }) : null) }, { k: 'status', l: T.cyShelf, v: r => lbl('STATUS', r.status) },
      { k: 'state', l: T.cyState, v: r => lbl('CYCLE_STATE', r.state), el: r => pill('CYCLE_STATE', r.state) }, { k: 'lastScanAt', l: T.cyLastAt, fmt: v => (v ? fmtDT(v) : T.never) }, { k: 'lastScanBy', l: T.cyLastBy, v: r => userName(r.lastScanBy) }];
    function draw() {
      clear(body);
      S.refresh = load(body, 'scan.due', isMgr() ? { section } : {}, (r, box) => {
        const c = r.cycle || {}, total = r.total || 0, done = r.done || 0;
        const card = h('div', { class: 'card' }, h('p', { class: 'cycle-line', text: cycleLine(Object.assign({}, c, { done, total })) }), h('progress', { max: Math.max(1, total), value: done, 'aria-label': T.cyTitle }), h('p', { id: 'cyDone', text: fmt(T.cyDoneOf, { done, total, pct: total ? Math.round(done * 100 / total) : 100 }) }));
        box.appendChild(card);
        const tbl = h('div'); const all = (r.rows || []).slice().sort((a, b) => (yes(b.spot) ? 1 : 0) - (yes(a.spot) ? 1 : 0) || (a.state === 'DONE' ? 1 : 0) - (b.state === 'DONE' ? 1 : 0));
        const rowsNow = () => (onlyNot ? all.filter(x => x.state === 'NOT_SCANNED' || x.state === 'CARRIED_OVER' || x.state === 'SEALED_PENDING' || yes(x.spot)) : all);
        const tick = mkForm([{ k: 'only', l: T.cyNotOnly, t: 'check', dflt: onlyNot ? 'Y' : 'N' }]);
        tick.el.addEventListener('change', () => { onlyNot = tick.val('only') === 'Y'; paint(); });
        const paint = () => { clear(tbl); tbl.appendChild(simpleTable(cols, rowsNow(), { empty: T.cyEmpty, onRow: x => openLaptop(x.id) })); };
        append(box, [h('div', { class: 'listbar' }, tick.el, tools('Scan_cycle_' + (c.id || ''), T.cyTitle, cols, async () => rowsNow())), tbl]); paint();
      });
    }
    draw();
    load(month, 'rota.cycleGet', { month: thisMonth() }, (r, box) => {
      const sub = (x, k) => (x.submitted && yes(x.submitted[k]) ? T.cySubmitted : (x.submitted && x.submitted[k] === 'EARLY' ? T.cySubmittedEarly : T.cyNotSubmitted));
      box.appendChild(simpleTable([{ k: 'cycle', l: T.cyCycle, main: true }, { k: 'dates', l: T.cyDates, v: x => fmtDate(x.from) + ' – ' + fmtDate(x.to) }, { k: 'endsAt', l: T.cyEnds, fmt: fmtDue }, { k: 'sales', l: T.cySales, v: x => respName(x.sales) || T.rtUnassigned }, { k: 'subS', l: T.cySubSales, v: x => sub(x, 'sales') },
        { k: 'repair', l: T.cyRepair, v: x => respName(x.repair) || T.rtUnassigned }, { k: 'subR', l: T.cySubRepair, v: x => sub(x, 'repair') }], r.cycles || []));
    });
  }
};
/* Submit stock sheet (ack tick when laptops are not scanned, PIN). */
function submitSheetDialog(section) {
  const staff = !isMgr(); section = staff ? S.me.section : (section || 'ALL');
  const F = mkForm([{ k: 'section', l: T.ssSection, t: 'sel', req: true, ro: staff, o: opts('SECTION', staff ? [section] : ['SALES', 'REPAIR', 'ALL']), dflt: section }, { k: 'ack', l: fmt(T.ssAck, { k: '…' }), t: 'check' }, { k: 'pin', l: T.yourPin, t: 'pin', req: true }]);
  const m = openModal({ title: T.ssTitle, dirty: () => F.dirty }), info = h('div'), err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  let k = 0, seq = 0;
  async function count() {
    const my = ++seq, sec = F.val('section'); clear(info).appendChild(spinner()); F.f.ack.wrap.hidden = true;
    const one = async s => { const r = await api('scan.due', staff ? {} : { section: s }); return r.ok ? { total: r.total || 0, done: r.done || 0, n: (r.rows || []).filter(x => x.state === 'NOT_SCANNED' || x.state === 'CARRIED_OVER').length } : null; };
    const parts = await Promise.all((sec === 'ALL' ? ['SALES', 'REPAIR'] : [sec]).map(one));
    if (my !== seq || !info.isConnected) return; clear(info);
    if (parts.some(p => !p)) { info.appendChild(note(T.netFail, 'bad')); k = -1; F.f.ack.wrap.hidden = false; $('span', F.f.ack.wrap).textContent = fmt(T.ssAck, { k: '?' }); return; }
    k = parts.reduce((a, p) => a + p.n, 0); const total = parts.reduce((a, p) => a + p.total, 0);
    if (k > 0) { F.f.ack.wrap.hidden = false; $('.tick span', F.f.ack.wrap).textContent = fmt(T.ssAck, { k }); } else info.appendChild(note(fmt(T.ssAllScanned, { n: total }), 'ok'));
  }
  F.f.section.inp.addEventListener('change', count);
  const b = btn(T.ssSubmit, async () => {
    if (b.dataset.busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    const ack = !F.f.ack.wrap.hidden && F.val('ack') === 'Y';
    if (k !== 0 && !ack) { F.f.ack.wrap.hidden = false; F.mark('ack', ''); err.textContent = T.ssAckNeeded; err.hidden = false; return; }
    b.dataset.busy = '1'; b.disabled = true; const sd = { section: F.val('section'), ackNotScanned: ack ? 'Y' : 'N', pin: F.val('pin') };
    const r = await U.run(() => api('sheet.submit', sd), b); /* R37B-01 */ delete b.dataset.busy; b.disabled = false;
    if (!r.ok) { if (r.code === 'SHEET_ACK_REQUIRED') { F.f.ack.wrap.hidden = false; F.mark('ack', ''); } if (r.code === 'AUTH_PIN_WRONG') F.mark('pin', ''); err.textContent = r.msg; err.hidden = false; return; }
    F.dirty = false; m.close(); notify(r.incomplete === 'Y' && r.msg ? r.msg : (yes(r.sent) ? fmt(T.ssSent, { n: r.laptops == null ? '–' : r.laptops, k: r.notScanned == null ? '–' : r.notScanned }) : T.ssQueued), r.incomplete === 'Y' ? 'warn' : 'ok'); refresh();
  }, '', { id: 'ssSubmit' });
  const U = unsureGuard(err, () => [F.el]); /* R37B-01 */
  append(m.body, [h('p', { class: 'intro', text: T.ssIntro }), F.el, info]);
  append(m.foot, [err, h('div', { class: 'foot-btns' }, btn(T.cancel, () => m.requestClose(), 'sec'), b)]);
  count();
  return m;
}
/* R32C-03: scans that failed and wait for Retry are unsaved work */
Object.assign(T, { ctUnsentLeave: '{n} scans are not saved yet (the red rows, or still sending). If you leave this screen they are lost and those laptops may show as Missing. Press Retry first. Leave anyway?', ctLeaveYes: 'Leave without them',
  ctUnsentReveal: '{n} scans were not saved (the red rows). Press Retry on each of them first - otherwise those laptops may show as Missing. Show the differences anyway?' });
Object.assign(T, { ssAckNeeded: 'Confirm that you have seen the laptops that are not scanned.', rpCountHist: 'Count history' });

/* ---------- V18 scan-cycle rota ---------- */
VIEWS.rota = {
  title: T.rtTitle, perm: () => has('rota'),
  render(root) {
    viewHead(root, T.rtTitle); if (needLists(root)) return; root.appendChild(h('p', { class: 'intro', text: T.rtIntro }));
    const mF = mkForm([{ k: 'month', l: T.rtMonth, t: 'month', req: true, dflt: thisMonth() }], {}, { cls: 'filters' }), body = h('div');
    append(root, [mF.el, body]);
    const secUsers = s => (L().users || []).filter(u => u.section === s);
    function draw() {
      clear(body); const month = mF.val('month') || thisMonth();
      S.refresh = load(body, 'rota.cycleGet', { month }, (r, box) => {
        const cycles = r.cycles || [], sel = { SALES: {}, REPAIR: {} }, nowS = nowISO();
        const past = c => yes(c.past) || c.ended === true || (!!c.endsAt && String(c.endsAt) < nowS);
        const cur = (c, s) => { const x = s === 'SALES' ? c.sales : c.repair; return !x ? '' : (typeof x === 'string' ? x : x.userId || ''); };
        const mkSel = (c, s) => { const el = h('select', { 'aria-label': fmt(T.rtHelper, { section: lbl('SECTION', s) }) + ' ' + c.cycle, disabled: past(c), dataset: { cycle: c.cycle, section: s } }); el.appendChild(h('option', { value: '', text: T.rtUnassigned }));
          const v = cur(c, s); secUsers(s).forEach(u => el.appendChild(h('option', { value: u.userId, text: u.name }))); if (v && !secUsers(s).some(u => u.userId === v)) el.appendChild(h('option', { value: v, text: userName(v) })); el.value = v; el.addEventListener('change', () => { S.dirty = true; }); sel[s][c.cycle] = el; return el; };
        const grid = simpleTable([{ k: 'cycle', l: T.cyCycle, main: true, v: c => c.cycle + (past(c) ? ' — ' + T.rtPast : '') }, { k: 'dates', l: T.cyDates, v: c => fmtDate(c.from) + ' – ' + fmtDate(c.to) }, { k: 'sales', l: T.cySales, el: c => mkSel(c, 'SALES') }, { k: 'repair', l: T.cyRepair, el: c => mkSel(c, 'REPAIR') }], cycles);
        grid.classList.add('rota-grid'); grid.id = 'rotaGrid';
        const helper = s => {
          const F = mkForm([{ k: 'one', l: T.rtWhole, t: 'sel', o: () => secUsers(s).map(u => ({ v: u.userId, t: u.name })) }, { k: 'many', l: T.rtPeople, t: 'multi', o: () => secUsers(s).map(u => ({ v: u.userId, t: u.name })) }]);
          const future = () => cycles.filter(c => !past(c));
          const fill = ids => { const f = future(), n = f.length, per = Math.floor(n / ids.length); f.forEach((c, i) => { const idx = Math.min(ids.length - 1, per ? Math.floor(i / per) : i); sel[s][c.cycle].value = ids[idx]; }); S.dirty = true; };
          return h('div', { class: 'card', dataset: { helper: s } }, h('h3', { text: fmt(T.rtHelper, { section: lbl('SECTION', s) }) }), F.el, h('div', { class: 'btns' },
            btn(T.rtWhole, () => { const v = F.val('one'); if (!v) { notify(T.rtPickOne, 'bad'); return; } fill([v]); }, 'sec', { 'data-whole': s }), btn(T.rtSplit, () => { const v = F.val('many'); if (!v.length) { notify(T.rtPickSome, 'bad'); return; } fill(v); }, 'sec', { 'data-split': s })));
        };
        const save = btn(T.rtSave, async () => {
          const assignments = []; cycles.forEach(c => ['SALES', 'REPAIR'].forEach(s => { if (!past(c) && sel[s][c.cycle].value !== cur(c, s)) assignments.push({ cycle: c.cycle, section: s, userId: sel[s][c.cycle].value }); }));
          if (!assignments.length) { notify(T.rtNoChange, 'ok'); return; }
          const x = await runAction(save, 'rota.cycleSet', { month, assignments }, { ok: T.rtSaved, refresh: false }); if (x.ok) { S.dirty = false; draw(); }
        }, '', { id: 'rotaSave' });
        append(box, [h('div', { class: 'cols2' }, helper('SALES'), helper('REPAIR')), grid, h('div', { class: 'btns' }, save)]);
      });
    }
    mF.el.addEventListener('change', draw); draw();
  }
};
