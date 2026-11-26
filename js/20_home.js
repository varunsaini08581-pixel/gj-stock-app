/* GJ App v4 — V3 Home, V4 Scan / Search. */
'use strict';
Object.assign(T, {
  homeTitle: 'Home', todo: 'To do', todoNone: 'Nothing is waiting for you right now.', open: 'Open', myActions: 'My last 10 actions', myActionsNone: 'No actions recorded yet.',
  cycleBox: 'Scan cycle', cycleLine: 'Cycle {no} of {of} — {done} of {total} scanned — ends {ends} — responsible: {who}', you: 'you', notAssigned: 'not assigned (manager)', perSection: 'per section, below',
  submitSheet: 'Submit stock sheet',
  tScan: 'Scan / Search', tStock: 'Stock list', tSell: 'Sell', tSales: 'Sales', tReserve: 'Reservations', tExchange: 'Exchanges', tJobs: 'Repair jobs', tParts: 'Parts', tAcc: 'Accessories',
  tReceive: 'Receive goods', tPo: 'Purchase orders', tDealers: 'Dealers and partners', tOutside: 'Outside', tCount: 'Daily count', tCycle: 'Scan cycle', tRota: 'Scan-cycle rota', tApprovals: 'Approvals',
  tAlerts: 'Alerts', tDash: 'Dashboard', tReports: 'Reports', tBulk: 'Complete stock records', tStaff: 'Staff', tDevices: 'Devices', tSettings: 'Settings', tLog: 'Log / History', tPin: 'Change my PIN',
  scanTitle: 'Scan / Search', scanLabel: 'GJ / RJ sticker, serial number or part serial', scanHint: 'Scan with the scanner, or type the code and press Enter.', find: 'Find',
  scanNone: '"{code}" was not found in stock, parts or repair jobs.', scanFreeGj: '{id} is an unused GJ sticker.', scanFreeRj: '{id} is an unused repair (RJ) sticker.', scanVoid: '{id} is a cancelled sticker. It cannot be used again.',
  scanFreeHint: 'Laptops that power on are entered with the pendrive. Use the options below only for a laptop that cannot be scanned.',
  optOldNoScan: 'Enter old stock without scan', optRecvNoScan: 'Receive dealer laptop without scan', optJobNoScan: 'New job without scan'
});

const HOME_TILES = [
  ['scan', 'tScan', () => true], ['stock', 'tStock', () => has('stock.view')], ['sell', 'tSell', () => has('sale.create')], ['sales', 'tSales', () => has('sale.view') || has('sale.confirm') || has('sale.create') || has('sale.request')],
  ['reservations', 'tReserve', () => has('reserve') || has('sale.request')], ['exchanges', 'tExchange', () => has('exchange.entry') || has('exchange.value')], ['jobs', 'tJobs', () => has('job.view') || has('job.status')],
  ['parts', 'tParts', () => has('parts.view') || has('parts')], ['acc', 'tAcc', () => has('acc')], ['receive', 'tReceive', () => has('receive')], ['po', 'tPo', () => has('po')],
  ['dealers', 'tDealers', () => has('dealer.view') || has('po') || has('dealer.add')], ['outside', 'tOutside', () => has('outside')], ['count', 'tCount', () => has('count')], ['cycle', 'tCycle', () => has('scan') || has('sheet.submit')],
  ['rota', 'tRota', () => has('rota')], ['approvals', 'tApprovals', () => has('approve')], ['alerts', 'tAlerts', () => has('dash')], ['dash', 'tDash', () => has('dash')], ['reports', 'tReports', () => has('dash')],
  ['bulk', 'tBulk', () => has('stock.bulk')], ['staff', 'tStaff', () => has('admin.users')], ['devices', 'tDevices', () => has('admin.devices')], ['settings', 'tSettings', () => has('admin.config')],
  ['log', 'tLog', () => has('admin.log')], ['pin', 'tPin', () => true]
];
const TODO_VIEW = { PARTS_COUNT_DUE: 'count', EXEMPT_SIGHT: 'stock', DAY_CLOSE: 'dayclose', ROTA_NOT_SET: 'rota', CYCLE_RESPONSIBLE_ABSENT: 'rota', TODO: '', SCAN_DUE: 'cycle', SPOT_CHECK: 'cycle', HANDOVER_ACCEPT: 'stock', COUNT_TURN: 'count', CYCLE_RESPONSIBLE: 'cycle', SLIPS_NOT_SENT: 'jobs', UNCONFIRMED_SALES: 'sales', APPROVALS: 'approvals', ALERTS: 'alerts', SALE_REQUESTS: 'reservations' };
const TILE_BADGE = { approvals: 'approvals', alerts: 'alerts', sales: 'unconfirmed', jobs: 'slips', stock: 'handovers', reservations: 'saleRequests' };
function fmtDue(s) { const m = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})/.exec(String(s || '')); if (!m) return s || T.notSet; const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])); return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()] + ' ' + m[3] + ' ' + MONTHS[Number(m[2]) - 1] + ', ' + m[4] + ':' + m[5]; }
function cycleLine(c) {
  const who = !c.responsible || !c.responsible.userId ? (c.sections && c.sections.length ? T.perSection : T.notAssigned) : (S.me && c.responsible.userId === S.me.userId ? T.you : c.responsible.name); /* UI-06 */
  const m = /C(\d+)$/.exec(String(c.id || ''));
  return fmt(T.cycleLine, { no: c.no || (m ? m[1] : '?'), of: c.of || 10, done: c.done, total: c.total, ends: fmtDue(c.endsAt), who });
}

VIEWS.home = {
  title: T.homeTitle,
  render(root) {
    root.appendChild(h('h1', { class: 'welcome', text: fmt(T.welcome, { name: S.me.name }) }));
    const banners = h('div'), todoBox = h('div'), tiles = h('div', { class: 'tiles' }), acts = h('div');
    append(root, [banners, todoBox, h('h2', { text: T.appName }), tiles, acts]);
    const badges = {};
    const drawTiles = () => { clear(tiles); HOME_TILES.forEach(t => { if (!t[2]()) return; const n = badges[TILE_BADGE[t[0]]];
      tiles.appendChild(h('button', { type: 'button', class: 'tile', dataset: { view: t[0] } }, h('span', { text: T[t[1]] }), n ? h('span', { class: 'badge', text: String(n) }) : null)); }); };
    tiles.addEventListener('click', e => { const b = e.target.closest('.tile'); if (b) go(b.dataset.view); });
    drawTiles();
    load(todoBox, 'home.summary', {}, (r, box) => {
      (r.banners || []).forEach(b => banners.appendChild(h('div', { class: 'note ' + (b.level === 'BAD' ? 'bad' : 'warn'), role: 'status', text: b.msg || lbl('BANNER', b.code) })));
      Object.assign(badges, r.counts || {}); drawTiles();
      const card = h('div', { class: 'card' }, h('h2', { text: T.todo }));
      if (r.cycle && r.cycle.id) {
        const c = r.cycle;
        card.appendChild(h('div', { class: 'cyclebox' }, h('p', { class: 'cycle-line', text: cycleLine(c) }), h('progress', { max: Math.max(1, c.total || 0), value: c.done || 0, 'aria-label': T.cycleBox }),
          h('div', { class: 'btns' }, btn(T.tCycle, () => go('cycle'), 'sec'), has('sheet.submit') ? btn(T.submitSheet, () => submitSheetDialog(), '', { id: 'homeSubmitSheet' }) : null)));
      }
      const items = (r.todo || []).filter(t => t && (t.code || t.kind)).map(t => Object.assign({ kind: t.code || t.kind }, t));   /* server: todo[].code */
      if (items.length) { const ul = h('ul', { class: 'todo' }); items.forEach(t => ul.appendChild(h('li', { dataset: { todo: t.kind } }, h('span', { text: t.text || fmt(lbl('TODO', t.kind), Object.assign({}, t, { n: t.n == null ? '' : t.n, sectionText: t.section ? lbl('SECTION', t.section) : '' })) }), TODO_VIEW[t.kind] ? btn(T.open, () => go(TODO_VIEW[t.kind], t.kind === 'HANDOVER_ACCEPT' ? 'transit' : ''), 'sec sm') : null))); card.appendChild(ul); }
      else if (!(r.cycle && r.cycle.id)) card.appendChild(h('p', { class: 'empty', text: T.todoNone }));
      box.appendChild(card);
      /* owner 26 Nov: quick fixes - the technician takes / finishes them here, the salesperson sees his own */
      if ((r.qfix || []).length) {
        const qc = h('div', { class: 'card', id: 'homeQfix' }, h('h2', { text: T.qfHome }));
        r.qfix.forEach(q => qc.appendChild(h('div', { class: 'qfix-row' }, h('p', {}, h('b', { text: q.stockId + ' ' + (q.model || '') }), h('br'), h('span', { text: qfixText(q) })),
          h('div', { class: 'btns' }, [btn(T.qfOpen, () => openLaptop(q.stockId), 'sec')].concat(qfixButtons(q))))));
        box.appendChild(qc);
      }
      const ac = h('div', { class: 'card' }, h('h2', { text: T.myActions }));
      ac.appendChild(simpleTable([{ k: 'at', l: T.cAt, v: a => a.at || a.time || '', fmt: fmtDT }, { k: 'text', l: T.cAction, v: a => a.text || humanAction(a.action) }, { k: 'ref', l: T.cRef, main: true }], r.myActions || [], { empty: T.myActionsNone }));
      acts.appendChild(ac);
    });
  }
};
Object.assign(T, { cAt: 'Date / time', cAction: 'Action', cRef: 'Reference', cBy: 'By' });

VIEWS.scan = {
  title: T.scanTitle,
  render(root, arg) {
    viewHead(root, T.scanTitle);
    const inp = h('input', { type: 'text', id: 'scanInput', class: 'code', 'data-scanbox': '', 'aria-label': T.scanLabel, placeholder: T.scanLabel, autocomplete: 'off', autocapitalize: 'characters', spellcheck: 'false', maxlength: 40 });
    const out = h('div', { class: 'scan-out', 'aria-live': 'polite' });
    let seq = 0;
    const run = async () => {
      const code = normCode(inp.value); if (!code) return;
      const my = ++seq; inp.value = ''; clear(out).appendChild(spinner());
      const r = await api('scan.lookup', { code });
      if (my !== seq || !out.isConnected) return;               /* a newer scan was made: drop this answer */
      clear(out);
      if (!r.ok) { out.appendChild(errorCard(r.msg, () => { inp.value = code; run(); })); return; }
      const id = (r.item && (r.item.id || r.item.partId)) || r.id || code;
      const card = h('div', { class: 'card' });
      switch (r.kind) {
        case 'STOCK': case 'SOLD': card.appendChild(h('p', null, h('b', { text: id + ' ' }), pill('LOOKUP', r.kind, 'plain'))); card.appendChild(btn(T.open, () => openLaptop(id), 'sec')); openLaptop(id); break;
        case 'JOB': card.appendChild(h('p', null, h('b', { text: id + ' ' }), pill('LOOKUP', r.kind, 'plain'))); card.appendChild(btn(T.open, () => openJob(id), 'sec')); openJob(id); break;
        case 'PART': card.appendChild(h('p', null, h('b', { text: id + ' ' }), pill('LOOKUP', r.kind, 'plain'))); card.appendChild(btn(T.open, () => openPart(id), 'sec')); openPart(id); break;
        case 'FREE_GJ': card.appendChild(h('p', { class: 'scan-msg', text: fmt(T.scanFreeGj, { id }) })); card.appendChild(note(T.scanFreeHint));
          card.appendChild(h('div', { class: 'btns' }, has('stock.oldEntry') ? btn(T.optOldNoScan, () => oldNoScanDialog(id), 'sec') : null, has('receive') ? btn(T.optRecvNoScan, () => go('receive', 'laptop:' + id), 'sec') : null)); break;
        case 'FREE_RJ': card.appendChild(h('p', { class: 'scan-msg', text: fmt(T.scanFreeRj, { id }) })); card.appendChild(note(T.scanFreeHint));
          card.appendChild(h('div', { class: 'btns' }, has('job.create') ? btn(T.optJobNoScan, () => jobNoScanDialog(id), 'sec') : null)); break;
        case 'VOID_STICKER': card.appendChild(note(fmt(T.scanVoid, { id }), 'bad')); break;
        default: card.appendChild(h('p', { class: 'scan-msg', text: fmt(T.scanNone, { code }) }));
      }
      out.appendChild(card);
    };
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) run(); } });
    append(root, [h('div', { class: 'card' }, h('div', { class: 'scanbox' }, inp, btn(T.find, run), btn(T.camera, () => cameraScan(v => { inp.value = v; run(); }), 'sec')), h('p', { class: 'hint', text: T.scanHint })), out]);
    soon(() => inp.focus());
    if (arg) { inp.value = arg; run(); }
  }
};
