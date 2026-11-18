/* GJ App v4 — V7 purchase orders, dealers, V8 receive goods, parcels, V9 outside. */
'use strict';
Object.assign(C, { CPU_FAMILY: { 'Intel Core i3': 'Intel Core i3', 'Intel Core i5': 'Intel Core i5', 'Intel Core i7': 'Intel Core i7', 'Intel Core i9': 'Intel Core i9', 'Intel Core Ultra 5': 'Intel Core Ultra 5', 'Intel Core Ultra 7': 'Intel Core Ultra 7',
  'Intel Celeron': 'Intel Celeron', 'Intel Pentium': 'Intel Pentium', 'Intel Xeon': 'Intel Xeon', 'AMD Ryzen 3': 'AMD Ryzen 3', 'AMD Ryzen 5': 'AMD Ryzen 5', 'AMD Ryzen 7': 'AMD Ryzen 7', 'AMD Ryzen 9': 'AMD Ryzen 9', 'AMD A-series': 'AMD A-series',
  'Apple M1': 'Apple M1', 'Apple M2': 'Apple M2', 'Apple M3': 'Apple M3', 'Apple M4': 'Apple M4', Other: 'Other' }, PARCEL_STATUS: { OPEN: 'Open', CLOSED: 'Closed' } });
Object.assign(T, {
  poTitle: 'Purchase orders', poNew: '+ New PO', poOpenOnly: 'Open', poAll: 'All', poShow: 'Show', poNo: 'PO no.', poDate: 'Date', poExpected: 'Expected', poDealer: 'Dealer', poStatus: 'Status', poValue: 'Value', poLines: 'Lines', poEmpty: 'No purchase orders.',
  poCard: 'Purchase order {po}', poNotes: 'Notes', lnNo: 'Line', lnItem: 'Item', lnQty: 'Ordered', lnGood: 'Received good', lnFaulty: 'Faulty', lnRate: 'Rate (per unit)', lnLotTotal: 'Lot total', lnType: 'Line type', lnDesc: 'Description',
  lnCpuFam: 'Processor family', lnCpuGen: 'Generation', gen: '{n} Gen', lnStorage: 'Storage (GB)', lnStorageType: 'Storage type', lnPartType: 'Part type', lnSpec: 'Specification', lnAccItem: 'Accessory item', lnSerials: 'Serial numbers expected (optional, one per line)',
  lnAdd: '+ Add line', lnRemove: 'Remove line', lnEdit: 'Edit line', lnDelete: 'Delete line', lnDeleteAsk: 'Delete line {n} from this purchase order?', lnHint: 'Last purchase rates of this model: {rates}', lnMax: 'A purchase order can have at most 40 lines.',
  poNewTitle: 'New purchase order', poCreate: 'Create PO', poCreated: 'Purchase order {po} created.', poNeedLine: 'Add at least one complete line.', poLineBad: 'Line {n} is incomplete.',
  shTitle: 'Shipments and bills', shAdd: 'Add shipment / bill', shEdit: 'Edit bill', shId: 'Shipment', shBillTotal: 'Bill total', shReceivedOn: 'Received on', shNone: 'No shipment recorded yet. Warranty runs from the receive date until the bill is entered.',
  shStockIds: 'Move these laptops into this shipment (Stock IDs, separated by commas)', shSaved: 'Bill saved. {n} laptops updated.', shWarrantyHint: 'Dealer warranty is counted from the bill date.',
  poLaptops: 'Laptops received', poResult: 'Result', poClose: 'Close PO', poCloseTitle: 'Close {po}', poCloseReason: 'Reason for closing (required when items are short)', poCloseIntro: 'Items not yet received will be recorded as not received.', poClosed: 'Purchase order closed.',
  poReopen: 'Reopen PO', poReopened: 'Purchase order reopened.', lotRates: 'Lot rates', lotTitle: 'Unit rates of lot — line {n}', lotIntro: 'Enter the rate of every unit. The rates must add up to the lot total ({total}).', lotNone: 'No units received on this line yet.',
  dlTitle: 'Dealers and partners', dlAdd: '+ Add dealer / partner', dlName: 'Name', dlCat: 'Supplies', dlPhone: 'Phone', dlAddTitle: 'Add dealer / partner', dlEditTitle: 'Edit dealer / partner', dlRequestNote: 'Your request goes for approval. The dealer appears in lists after it is approved.', dlEmpty: 'No dealers yet.',
  rcTitle: 'Receive goods', rcBanner: 'Laptops that power on are received with the pendrive. Use this screen only for laptops that cannot be scanned, parts, accessories and parcels.',
  rcTabLaptop: 'Laptop that cannot be scanned', rcTabPart: 'Part', rcTabAcc: 'Accessory', rcTabParcel: 'Parcel log', rcSource: 'Receive against', rcNoPo: 'No purchase order', rcReplacement: 'Replacement for a returned laptop', rcLocal: 'Local purchase (no PO)',
  rcLineOpt: '{po} · line {line} · {dealer} · {spec} ({got} of {qty} received)', rcLineExtra: ' — complete, extra unit only', rcReplFor: 'Replacement for (Stock ID)', rcShipment: 'Bill / shipment', rcShipNone: 'Bill not received yet',
  rcSticker: 'New GJ sticker', rcCondition: 'Condition', rcFaultReason: 'Fault reason', rcFaultText: 'What is wrong', rcChecklist: 'Checks done', rcSave: 'Save and next', rcNoLines: 'There is no open purchase order line of this kind. Ask the manager or owner to create a PO, or choose "No purchase order".',
  rcSavedPending: '{id} saved — waiting for approval ({result}).', rcSavedOk: '{id} saved ({result}).', rcCount: '{got} of {qty} received on this line.', rcPartSaved: 'Part {id} saved (serial {serial}).', rcAccSaved: 'Saved. Balance now {n}.',
  rcNoSerial: 'This part has no serial number', rcQty: 'Quantity received', rcOpenLines: 'Open purchase order lines',
  pcTitle: 'Parcel log', pcIntro: 'Log a parcel that arrived but has not been opened yet.', pcBoxes: 'Number of boxes', pcAwb: 'Courier / AWB number', pcCond: 'Condition of the parcel', pcDealerName: 'Sender name (when not in the list)', pcSave: 'Log parcel', pcSaved: 'Parcel logged.',
  pcList: 'Parcels', pcClose: 'Close', pcCloseTitle: 'Close parcel {id}', pcEmpty: 'No parcels logged.', pcBy: 'Logged by', tParcel: 'Parcel log',
  ouTitle: 'Outside', ouOpen: 'Open', ouAll: 'All', ouItem: 'Item', ouReason: 'Reason', ouPartner: 'Sent to', ouWork: 'Work', ouTracking: 'Courier / tracking', ouSentBy: 'Sent by', ouSentAt: 'Sent on', ouDue: 'Due back', ouLate: 'Late', ouOnTime: 'On time',
  ouReturned: 'Returned', ouOutcome: 'Outcome', ouEmpty: 'Nothing is outside at the moment.', ouSend: 'Send outside (no scan)', ouReturn: 'Record return (no scan)', ouClose: 'Close dealer return', ouSettle: 'Dealer returns to settle',
  ouSendTitle: 'Send outside without scan', ouSendIntro: 'Only for a laptop that cannot be scanned, or a customer job that does not start. Everything else is sent out with the pendrive.', ouItemCode: 'Stock ID or job number (GJ / RJ)',
  ouPartnerOther: 'Partner name (when not in the list)', ouStaff: 'Staff member', ouJob: 'Job number (RJ)', ouWorkReq: 'Work to be done', ouTrackHint: 'Required for dealer returns.', ouReceipt: 'Receipt photo (optional)',
  ouReturnTitle: 'Return from outside — {id}', ouWorkDone: 'Work done', ouPaid: 'Vendor\'s total charge for this work (an advance already entered in the cash book is not counted twice)', ouReturnDone: 'Returned. Please check it in Repair.', ouCloseTitle: 'Close dealer return — {id}', ouCost: 'Cost of outside work', ouCredit: 'Credit note no.',
  ouRefund: 'Refund / credit amount', ouReplId: 'Replacement laptop (Stock ID)', ouClosed: 'Dealer return closed.', ouExpected: 'Expected back: lamination 1 day, outside repair 3 days, dealer 7 days. The sender is responsible until it is back.',
  photoAdd: 'Add photo', photoDone: 'Photo uploaded', photoFail: 'The photo could not be read. Try another photo.'
});
HOME_TILES.splice(10, 0, ['parcels', 'tParcel', () => has('parcel')]);

const ordinal = n => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd', 'th', 'th', 'th', 'th', 'th', 'th'][n % 10]);
const genOpts = () => Array.from({ length: 15 }, (x, i) => ({ v: String(i + 1), t: fmt(T.gen, { n: ordinal(i + 1) }) }));
const accItemOpts = () => (L().accItems || []).filter(a => a.active !== 'N' && a.active !== false).map(a => ({ v: a.itemId, t: a.item }));
const accName = id => { const a = (L().accItems || []).find(x => x.itemId === id); return a ? a.item : (id || ''); };
function lineText(l) {
  if (l.text) return l.text;                                   /* server: lineView.text / receive.lines text */
  if (l.spec && typeof l.spec === 'string' && !l.brand && !l.partType) return l.spec;
  if (l.type === 'LAPTOP') return [[l.brand, l.model].filter(Boolean).join(' '), l.cpu, [l.ramGb ? l.ramGb + ' GB' : '', l.storageGb ? l.storageGb + ' GB ' + lbl('STORAGE_TYPE', l.storageType || '') : ''].filter(Boolean).join(' / ')].filter(Boolean).join(' · ');
  if (l.type === 'PART') return [lbl('PART_TYPE', l.partType), l.spec].filter(Boolean).join(' ');
  if (l.type === 'ACCESSORY') return accName(l.itemId) || l.description || '';
  return l.description || lbl('PO_LINE', l.type);
}
function lineFields() {
  const lap = v => v.type === 'LAPTOP', part = v => v.type === 'PART';
  return [{ k: 'type', l: T.lnType, t: 'sel', req: true, o: opts('PO_LINE'), dflt: 'LAPTOP' }, { k: 'brand', l: T.fBrand, t: 'sel', req: true, o: () => L().brands || [], show: lap }, { k: 'model', l: T.fModelOnly, req: true, max: 60, show: lap },
    { k: 'cpuFamily', l: T.lnCpuFam, t: 'sel', req: true, o: opts('CPU_FAMILY'), show: lap }, { k: 'cpuGen', l: T.lnCpuGen, t: 'sel', o: genOpts, show: lap, ph: T.notKnown },
    { k: 'ramGb', l: T.fRam, t: 'sel', req: true, o: () => L().ramGb || [], show: lap }, { k: 'storageGb', l: T.lnStorage, t: 'sel', req: true, o: storageGbOpts, show: lap }, { k: 'storageType', l: T.lnStorageType, t: 'sel', req: true, o: opts('STORAGE_TYPE', ['SSD', 'HDD', 'EMMC', 'ANY']), show: lap, dflt: 'SSD' },
    { k: 'partType', l: T.lnPartType, t: 'sel', req: true, o: () => (L().partTypes && L().partTypes.length ? L().partTypes.map(c => ({ v: c, t: lbl('PART_TYPE', c) })) : opts('PART_TYPE')), show: part }, { k: 'spec', l: T.lnSpec, req: true, max: 60, show: part },
    { k: 'itemId', l: T.lnAccItem, t: 'sel', req: true, o: accItemOpts, show: v => v.type === 'ACCESSORY' }, { k: 'description', l: T.lnDesc, req: true, max: 120, show: v => v.type === 'LOT', wide: true },
    { k: 'qty', l: T.lnQty, t: 'int', req: true, min: 1, maxv: 200 }, { k: 'rate', l: T.lnRate, t: 'money', req: true, min: 1, show: v => v.type !== 'LOT' }, { k: 'lotTotal', l: T.lnLotTotal, t: 'money', req: true, min: 1, show: v => v.type === 'LOT' },
    { k: 'serials', l: T.lnSerials, t: 'area', max: 4000, show: lap }];
}
function lineData(v) {
  const d = Object.assign({}, v);
  if (v.type === 'LAPTOP') { d.cpu = v.cpuFamily + (v.cpuGen ? ' ' + fmt(T.gen, { n: ordinal(Number(v.cpuGen)) }) : ''); d.ramGb = Number(v.ramGb); d.storageGb = Number(v.storageGb); }
  delete d.cpuFamily; delete d.cpuGen;
  if (v.serials) d.serials = String(v.serials).split(/[\n,;]+/).map(s => s.trim().toUpperCase()).filter(Boolean); else delete d.serials;
  return d;
}
function lineInit(l) { const m = /^(.*?)(?:\s+(\d+)(?:st|nd|rd|th)\s+Gen)?$/.exec(l.cpu || ''); return Object.assign({}, l, { cpuFamily: m ? m[1] : l.cpu, cpuGen: m && m[2] ? m[2] : '', serials: (l.serials || []).join('\n') }); }

VIEWS.po = {
  title: T.poTitle, perm: () => has('po'),
  render(root, arg) {
    viewHead(root, T.poTitle, [btn(T.poNew, () => newPoDialog(), '', { id: 'poNew' }), btn(T.tDealers, () => go('dealers'), 'sec')]);
    const lv = listView(root, { action: 'po.list', name: 'Purchase_orders', title: T.poTitle, empty: T.poEmpty, onRow: r => openPo(r.poNo),
      filters: [{ k: 'open', l: T.poShow, t: 'sel', req: true, o: [{ v: 'Y', t: T.poOpenOnly }, { v: 'N', t: T.poAll }], dflt: 'Y' }, { k: 'dealerId', l: T.poDealer, t: 'sel', o: () => dealerOpts(), ph: T.all }],
      cols: [{ k: 'poNo', l: T.poNo, main: true }, { k: 'dealer', l: T.poDealer, main: true }, { k: 'date', l: T.poDate, fmt: fmtDate }, { k: 'expectedDate', l: T.poExpected, fmt: v => (v ? fmtDate(v) : '') },
        { k: 'status', l: T.poStatus, v: r => lbl('PO_STATUS', r.status), el: r => pill('PO_STATUS', r.status) }, { k: 'lines', l: T.poLines, v: r => (r.lines || []).map(lineText).join('; ') }, { k: 'value', l: T.poValue, num: true, fmt: v => (v == null || v === '' ? '' : money(v)), csv: r => r.value }] });
    S.refresh = lv.reload;
    if (arg) openPo(arg);
  }
};
function openPo(poNo) {
  const m = openModal({ title: fmt(T.poCard, { po: poNo }), full: true });
  m.reload = load(m.body, 'po.get', { poNo }, (r, box) => {
    const po = r.po || {}, lines = r.lines || [], closed = po.status === 'CLOSED';
    /* server: shipments {id,...}; laptops are stockView (poLine, purchaseRate); receipt result comes from receipts[] */
    const ships = (r.shipments || []).map(s => Object.assign({ shipmentId: s.shipmentId || s.id }, s));
    const resOf = {}; (r.receipts || []).forEach(x => { if (x.itemId && x.qty !== '0' && x.result !== 'FAULTY_LATER') resOf[x.itemId] = x.result; });
    const laptops = (r.laptops || []).map(x => Object.assign({ line: x.poLine, rate: x.purchaseRate, result: resOf[x.id] || '' }, x));
    box.appendChild(h('div', { class: 'card' }, kv([[T.poDealer, po.dealer || po.dealerName], [T.poDate, fmtDate(po.date)], [T.poExpected, po.expectedDate ? fmtDate(po.expectedDate) : ''], [T.poStatus, pill('PO_STATUS', po.status)], [T.poValue, po.value != null ? money(po.value) : ''], [T.poNotes, po.notes]])));
    box.appendChild(h('div', { class: 'sect' }, h('h3', { text: T.poLines }), closed ? null : btn(T.lnAdd, () => actionDialog({ title: T.lnAdd, wide: true, action: 'po.lineSave', fields: lineFields(), build: v => ({ poNo, fields: lineData(v) }) }), 'sec sm')));
    box.appendChild(simpleTable([{ k: 'line', l: T.lnNo, main: true }, { k: 'item', l: T.lnItem, main: true, v: lineText }, { k: 'qty', l: T.lnQty, num: true }, { k: 'receivedGood', l: T.lnGood, num: true }, { k: 'receivedFaulty', l: T.lnFaulty, num: true },
      { k: 'rate', l: T.lnRate, num: true, v: l => (l.type === 'LOT' ? l.lotTotal : l.rate), fmt: v => (v == null || v === '' ? '' : money(v)) },
      { k: 'act', l: '', act: true, el: l => (closed ? null : [btn(T.lnEdit, null, 'sec sm', { 'data-act': 'edit' }), l.type === 'LOT' ? btn(T.lotRates, null, 'sec sm', { 'data-act': 'lot' }) : null, !(l.receivedGood > 0 || l.receivedFaulty > 0) ? btn(T.lnDelete, null, 'sec sm', { 'data-act': 'del' }) : null]) }], lines,
    { onAct: async (act, l, b) => {
      if (act === 'edit') actionDialog({ title: T.lnEdit + ' ' + l.line, wide: true, action: 'po.lineSave', fields: lineFields(), init: lineInit(l), build: v => ({ poNo, line: l.line, fields: lineData(v) }) });
      else if (act === 'del') { if (await confirmBox(fmt(T.lnDeleteAsk, { n: l.line }), { danger: true, yes: T.lnDelete })) runAction(b, 'po.lineDelete', { poNo, line: l.line }); }
      else if (act === 'lot') lotRatesDialog(poNo, l, laptops.filter(x => x.line === l.line));
    } }));
    box.appendChild(h('div', { class: 'sect' }, h('h3', { text: T.shTitle }), closed ? null : btn(T.shAdd, () => shipmentDialog(poNo, null), 'sec sm')));
    box.appendChild(simpleTable([{ k: 'shipmentId', l: T.shId, main: true }, { k: 'billNo', l: T.fBillNo }, { k: 'billDate', l: T.fBillDate, fmt: v => (v ? fmtDate(v) : '') }, { k: 'warrantyDays', l: T.fWarrantyDays, fmt: v => (v ? lbl('WARRANTY_DAYS', v) : '') },
      { k: 'billTotal', l: T.shBillTotal, num: true, fmt: v => (v == null || v === '' ? '' : money(v)) }, { k: 'receivedOn', l: T.shReceivedOn, fmt: v => (v ? fmtDate(v) : '') }, { k: 'act', l: '', act: true, el: () => btn(T.shEdit, null, 'sec sm', { 'data-act': 'edit' }) }], ships, { empty: T.shNone, onAct: (a, s) => shipmentDialog(poNo, s) }));
    box.appendChild(h('h3', { text: T.poLaptops }));
    box.appendChild(simpleTable([{ k: 'id', l: T.fId, main: true }, { k: 'line', l: T.lnNo }, { k: 'model', l: T.fModel }, { k: 'serial', l: T.fSerial }, { k: 'result', l: T.poResult, el: x => pill('RECEIPT', x.result, x.result === 'OK' ? 'good' : 'warn') }, { k: 'shipmentId', l: T.shId },
      { k: 'rate', l: T.fRate, num: true, fmt: v => (v == null || v === '' ? '' : money(v)) }], laptops, { onRow: x => openLaptop(x.id) }));
    box.appendChild(h('div', { class: 'btns' }, closed || po.status === 'RECEIVED' ? btn(T.poReopen, e => runAction(e.currentTarget, 'po.reopen', { poNo }, { ok: T.poReopened }), 'sec') : null,
      closed ? null : btn(T.poClose, () => actionDialog({ title: fmt(T.poCloseTitle, { po: poNo }), intro: T.poCloseIntro, action: 'po.close', danger: true, submit: T.poClose, fields: [{ k: 'reason', l: T.poCloseReason, t: 'area', max: 200 }], build: v => Object.assign({ poNo }, v), ok: T.poClosed }), 'sec')));
  });
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
}
function shipmentDialog(poNo, s) {
  return actionDialog({ title: s ? T.shEdit : T.shAdd, intro: T.shWarrantyHint, action: 'po.shipmentSave', init: s ? Object.assign({}, s, { warrantyDays: s.warrantyDays ? String(s.warrantyDays) : '' }) : {},
    fields: [{ k: 'billNo', l: T.fBillNo, req: true, max: 40 }, { k: 'billDate', l: T.fBillDate, t: 'date', req: true, maxToday: true }, { k: 'warrantyDays', l: T.fWarrantyDays, t: 'sel', req: true, placeholder: true, o: opts('WARRANTY_DAYS') },
      { k: 'billTotal', l: T.shBillTotal, t: 'money' }, { k: 'stockIds', l: T.shStockIds, wide: true, max: 600 }, { k: 'notes', l: T.poNotes, t: 'area', max: 300 }],
    build: v => { const d = Object.assign({ poNo }, v); if (s && s.shipmentId) d.shipmentId = s.shipmentId; d.warrantyDays = Number(v.warrantyDays); if (v.stockIds) d.stockIds = v.stockIds.split(/[\s,;]+/).filter(Boolean).map(x => normSticker(x, 'GJ')); return d; },
    ok: r => fmt(T.shSaved, { n: r.updated || 0 }) });
}
function lotRatesDialog(poNo, line, units) {
  if (!units.length) { notify(T.lotNone, 'bad'); return; }
  return actionDialog({ title: fmt(T.lotTitle, { n: line.line }), intro: fmt(T.lotIntro, { total: money(line.lotTotal) }), action: 'po.lotRates',
    fields: units.map(u => ({ k: u.id, l: u.id + ' — ' + (u.model || ''), t: 'money', req: true, min: 1, dflt: u.rate })), build: v => ({ poNo, line: line.line, rates: units.map(u => ({ id: u.id, rate: v[u.id] })) }) });
}
function newPoDialog() {
  const head = mkForm([{ k: 'dealerId', l: T.poDealer, t: 'sel', req: true, o: () => dealerOpts() }, { k: 'expectedDate', l: T.poExpected, t: 'date' }, { k: 'notes', l: T.poNotes, t: 'area', max: 300 }]);
  const linesEl = h('div', { class: 'lines', id: 'poLines' }), rows = [], err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  const m = openModal({ title: T.poNewTitle, full: true, dirty: () => head.dirty || rows.some(r => r.F.dirty) });
  let hintSeq = 0;
  function addLine() {
    if (rows.length >= 40) { notify(T.lnMax, 'bad'); return; }
    const hint = h('div', { class: 'hint ratehint' });
    const F = mkForm(lineFields(), {}, { onChange: async f => {
      const v = f.all(); if (v.type !== 'LAPTOP' || !v.brand || !v.model) { hint.textContent = ''; return; }
      const key = v.brand + '|' + v.model; if (row.hintKey === key) return; row.hintKey = key; const my = ++hintSeq;
      const r = await api('po.rateHint', { brand: v.brand, model: v.model }, { noLock: true });        /* optional helper; silently skipped when the server has no such action */
      if (my !== hintSeq || !hint.isConnected) return;
      hint.textContent = r.ok && (r.rates || []).length ? fmt(T.lnHint, { rates: r.rates.map(x => money(x.rate != null ? x.rate : x)).join(', ') }) : '';
    } });
    const row = { F, el: null, hintKey: '' };
    const title = h('span');
    row.el = h('div', { class: 'linerow' }, h('div', { class: 'linehead' }, title, btn(T.lnRemove, () => { rows.splice(rows.indexOf(row), 1); row.el.remove(); renum(); }, 'sec sm')), F.el, hint);
    row.title = title; rows.push(row); linesEl.appendChild(row.el); renum();
  }
  function renum() { rows.forEach((r, i) => { r.title.textContent = T.lnNo + ' ' + (i + 1); }); }
  const save = btn(T.poCreate, async () => {
    if (save.dataset.busy) return; err.hidden = true;
    const bad = head.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    if (!rows.length) { err.textContent = T.poNeedLine; err.hidden = false; return; }
    for (let i = 0; i < rows.length; i++) { const e = rows[i].F.check(); if (e) { err.textContent = fmt(T.poLineBad, { n: i + 1 }) + ' ' + e; err.hidden = false; return; } }
    const data = Object.assign(head.get(), { lines: rows.map(r => lineData(r.F.get())) });
    save.dataset.busy = '1'; save.disabled = true;
    const r = await callConfirmed('po.create', data);
    delete save.dataset.busy; save.disabled = false;
    if (r.cancelled) return;
    if (!r.ok) { err.textContent = r.msg; err.hidden = false; return; }
    head.dirty = false; rows.forEach(x => { x.F.dirty = false; }); m.close(); notify(fmt(T.poCreated, { po: r.poNo }), 'ok'); refresh();
  }, '', { id: 'poSave' });
  append(m.body, [head.el, h('div', { class: 'sect' }, h('h3', { text: T.poLines }), btn(T.lnAdd, addLine, 'sec sm', { id: 'poAddLine' })), linesEl]);
  append(m.foot, [err, h('div', { class: 'foot-btns' }, btn(T.cancel, () => m.requestClose(), 'sec'), save)]);
  addLine();
  return m;
}

/* ---------- dealers and partners ---------- */
VIEWS.dealers = {
  title: T.dlTitle, perm: () => has('dealer.view') || has('po') || has('dealer.add'),
  render(root) {
    const fields = () => [{ k: 'name', l: T.dlName, req: true, max: 60 }, { k: 'category', l: T.dlCat, t: 'sel', req: true, o: opts('DEALER_CAT') }, { k: 'phone', l: T.dlPhone, t: 'mobile' }, { k: 'notes', l: T.poNotes, t: 'area', max: 300 }];
    viewHead(root, T.dlTitle, [has('dealer.add') ? btn(T.dlAdd, () => actionDialog({ title: T.dlAddTitle, intro: isAdmin() ? '' : T.dlRequestNote, action: 'dealer.add', fields: fields(), after: reloadLists }), '', { id: 'dealerAdd' }) : null]);
    const lv = listView(root, { action: 'dealer.list', name: 'Dealers', title: T.dlTitle, empty: T.dlEmpty, search: false,
      onRow: has('po') ? d => actionDialog({ title: T.dlEditTitle, action: 'dealer.save', init: d, changedOnly: true, after: reloadLists,
        fields: fields().concat(isAdmin() ? [{ k: 'status', l: T.fStatus, t: 'sel', o: opts('DEALER_STATUS') }] : []), build: (v, F) => Object.assign({ dealerId: d.dealerId }, F.changed()) }) : null,
      cols: [{ k: 'name', l: T.dlName, main: true }, { k: 'category', l: T.dlCat, v: d => lbl('DEALER_CAT', d.category) }, { k: 'phone', l: T.dlPhone }, { k: 'status', l: T.fStatus, v: d => lbl('DEALER_STATUS', d.status), el: d => pill('DEALER_STATUS', d.status) }, { k: 'notes', l: T.poNotes }] });
    S.refresh = lv.reload;
  }
};
async function reloadLists() { const r = await api('meta.lists', {}); if (r.ok) S.lists = r; }

/* ---------- photo upload (resized in the browser to stay under 300 KB) ---------- */
function compressImage(file) {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file), img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url); let w = img.naturalWidth, hh = img.naturalHeight, q = 0.8, side = 1280, out = '';
      for (let i = 0; i < 6; i++) {
        const k = Math.min(1, side / Math.max(w, hh)); const cv = document.createElement('canvas'); cv.width = Math.round(w * k); cv.height = Math.round(hh * k);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height); out = cv.toDataURL('image/jpeg', q).split(',')[1] || '';
        if (out.length * 0.75 <= 290000) break; side = Math.round(side * 0.75); q = Math.max(0.5, q - 0.08);
      }
      if (out && out.length * 0.75 <= 300000) res(out); else rej(new Error('too large'));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('read')); };
    img.src = url;
  });
}
/* A button that picks / takes a photo and uploads it. onDone(fileId). */
function photoButton(label, kind, refFn, onDone) {
  const state = h('span', { class: 'hint' }), input = h('input', { type: 'file', accept: 'image/*', hidden: true, 'aria-label': label });
  const b = btn(label || T.photoAdd, () => input.click(), 'sec sm');
  input.addEventListener('change', async () => {
    const f = input.files && input.files[0]; if (!f) return; b.disabled = true; state.textContent = T.wait;
    try { const dataB64 = await compressImage(f); const r = await api('file.upload', { kind, ref: refFn ? refFn() : '', mime: 'image/jpeg', dataB64 });
      if (r.ok) { state.textContent = T.photoDone; onDone(r.fileId); } else { state.textContent = ''; notify(r.msg, 'bad'); } }
    catch (e) { state.textContent = ''; notify(T.photoFail, 'bad'); }
    b.disabled = false; input.value = '';
  });
  return h('div', { class: 'photo' }, b, input, ' ', state);
}

/* ---------- V8 receive goods ---------- */
VIEWS.receive = {
  title: T.rcTitle, perm: () => has('receive'),
  render(root, arg) {
    viewHead(root, T.rcTitle);
    root.appendChild(note(T.rcBanner));
    const tabs = h('div', { class: 'tabs', role: 'tablist' }), msg = h('div', { id: 'rcMsg', 'aria-live': 'polite' }), pane = h('div'), linesBox = h('div');
    append(root, [tabs, msg, pane, linesBox]);
    let lines = [], current = 'LAPTOP', preSticker = /^laptop:/.test(arg || '') ? arg.slice(7) : '';
    const lineOpt = l => ({ v: l.poNo + '#' + l.line, t: fmt(T.rcLineOpt, { po: l.poNo, line: l.line, dealer: l.dealerName || '', spec: lineText(l), got: l.receivedGood || 0, qty: l.qty }) + (l.complete === 'Y' || l.complete === true ? T.rcLineExtra : '') });
    const srcOpts = (type, extra) => lines.filter(l => l.type === type || (type === 'LAPTOP' && l.type === 'LOT')).map(lineOpt).concat(extra);
    const findLine = v => lines.find(l => l.poNo + '#' + l.line === v);
    const srcData = v => { const l = findLine(v.source); return l ? { poNo: l.poNo, line: l.line } : {}; };
    const said = (text, kind, line) => { clear(msg); msg.appendChild(note([text, line ? h('div', { class: 'rc-count', text: fmt(T.rcCount, { got: line.receivedGood || 0, qty: line.qty }) }) : null], kind)); };
    async function reloadLines() { const r = await api('receive.lines', {}); if (r.ok) { lines = r.lines || []; drawLines(); } else { clear(linesBox).appendChild(errorCard(r.msg, reloadLines)); } return r.ok; }
    function drawLines() { clear(linesBox); linesBox.appendChild(h('h2', { text: T.rcOpenLines })); linesBox.appendChild(simpleTable([{ k: 'poNo', l: T.poNo, main: true }, { k: 'line', l: T.lnNo }, { k: 'dealerName', l: T.poDealer }, { k: 'type', l: T.lnType, v: l => lbl('PO_LINE', l.type) }, { k: 'spec', l: T.lnItem, main: true, v: l => lineText(l) }, { k: 'qty', l: T.lnQty, num: true }, { k: 'receivedGood', l: T.lnGood, num: true }], lines, { empty: T.rcNoLines })); }
    function formPane(fields, init, submit) {
      clear(pane); const F = mkForm(fields, init), err = h('div', { class: 'errbox', role: 'alert', hidden: true });
      const b = btn(T.rcSave, async () => {
        if (b.dataset.busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
        b.dataset.busy = '1'; b.disabled = true; const v = F.get(); const r = await submit(v);
        delete b.dataset.busy; b.disabled = false;
        if (!r || r.cancelled) return;
        if (!r.ok) { F.clearErr(); if (r.field) F.mark(r.field, ''); err.textContent = r.msg; err.hidden = false; return; }
        S.dirty = false; const key = v.source; await reloadLines(); r.done(findLine(key)); draw();
      }, '', { id: 'rcSave' });
      F.el.addEventListener('input', () => { S.dirty = true; });
      append(pane, h('div', { class: 'card' }, F.el, err, h('div', { class: 'btns' }, b)));
      return F;
    }
    const ckCodes = ['SCREEN', 'KEYBOARD', 'PORTS', 'HINGE', 'SPEAKER', 'CAMERA', 'WIFI', 'BIOS_OPENS'];
    const PANES = {
      LAPTOP: () => {
        const F = formPane([{ k: 'source', l: T.rcSource, t: 'sel', req: true, wide: true, placeholder: true, o: () => srcOpts('LAPTOP', [{ v: 'NO_PO', t: T.rcNoPo }, { v: 'REPL', t: T.rcReplacement }]) },
          { k: 'dealerId', l: T.fDealer, t: 'sel', req: true, o: () => dealerOpts(), show: v => v.source === 'NO_PO' }, { k: 'replacementFor', l: T.rcReplFor, t: 'code', sticker: 'GJ', cam: false, req: true, show: v => v.source === 'REPL' },
          { k: 'shipmentId', l: T.rcShipment, t: 'sel', o: [], ph: T.rcShipNone, show: v => !!findLine(v.source) }, { k: 'sticker', l: T.rcSticker, t: 'code', sticker: 'GJ', req: true }].concat(specFields({}, { req: true }),
          [{ k: 'serial', l: T.fSerial, t: 'code', max: 40, noSticker: true }, { k: 'reason', l: T.unsMode, t: 'sel', req: true, o: opts('SCAN_MODE', ['NO_POWER', 'NO_OS', 'LOCKED', 'UNSUPPORTED']) },
            { k: 'lockCode', l: T.unsLock, t: 'sel', req: true, o: opts('UNFIT', ['LOCK_BIOS', 'LOCK_DISK', 'LOCK_ACTIVATION', 'LOCK_MDM', 'LOCK_BITLOCKER']), show: v => v.reason === 'LOCKED' },
            { k: 'condition', l: T.rcCondition, t: 'sel', req: true, o: opts('CONDITION') }, { k: 'faultReason', l: T.rcFaultReason, t: 'sel', req: true, o: opts('FAULT'), show: v => v.condition === 'FAULTY' }, { k: 'faultText', l: T.rcFaultText, req: true, max: 200, show: v => v.condition === 'FAULTY' },
            { k: 'charger', l: T.fCharger, t: 'sel', req: true, o: opts('CHARGER', ['ORIGINAL', 'COMPATIBLE', 'NONE']) }], ckCodes.map(c => ({ k: 'ck_' + c, l: lbl('CHECK', c), t: 'sel', req: true, o: opts('CHECK_RESULT', ['OK', 'FAIL', 'NOT_CHECKED']), dflt: 'NOT_CHECKED' })),
          [{ k: 'note', l: T.fNote, t: 'area', max: 300 }]), { sticker: preSticker }, async v => {
          const d = Object.assign(stripSpec(v), srcData(v)); delete d.source; d.checklist = {}; ckCodes.forEach(c => { d.checklist[c] = v['ck_' + c]; delete d['ck_' + c]; });
          const r = await callConfirmed('receive.laptopNoScan', d);
          if (r.ok && r.serialPlaceholder === 'Y' && r.msg) notify(r.msg, 'warn'); /* round 1 B4 (R1A-13) */
          if (r.ok) r.done = line => said(fmt(r.approvalId ? T.rcSavedPending : T.rcSavedOk, { id: r.id, result: lbl('RECEIPT', r.result) }), r.approvalId ? 'warn' : 'ok', line);
          return r;
        });
        preSticker = '';
        F.f.source.inp.addEventListener('change', () => { const l = findLine(F.val('source')); F.setOpts('shipmentId', l ? (l.shipments || []).map(s => ({ v: s.id, t: [s.billNo, s.billDate ? fmtDate(s.billDate) : ''].filter(Boolean).join(' · ') })) : []); });
      },
      PART: () => {
        const F = formPane([{ k: 'source', l: T.rcSource, t: 'sel', req: true, wide: true, placeholder: true, o: () => srcOpts('PART', [{ v: 'NO_PO', t: T.rcNoPo }]) }, { k: 'dealerId', l: T.fDealer, t: 'sel', req: true, o: () => dealerOpts(), show: v => v.source === 'NO_PO' },
          { k: 'type', l: T.lnPartType, t: 'sel', req: true, o: () => (L().partTypes && L().partTypes.length ? L().partTypes.map(c => ({ v: c, t: lbl('PART_TYPE', c) })) : opts('PART_TYPE')) },
          { k: 'specSel', l: T.lnSpec, t: 'sel', req: true, o: [], show: v => !!((L().specs || {})[v.type] || []).length }, { k: 'specTxt', l: T.lnSpec, req: true, max: 60, show: v => !((L().specs || {})[v.type] || []).length },
          { k: 'serial', l: T.fSerial, t: 'code', max: 40, noSticker: true, show: v => v.noSerial !== 'Y' }, { k: 'noSerial', l: T.rcNoSerial, t: 'check' }, { k: 'note', l: T.fNote, t: 'area', max: 300 }], {}, async v => {
          if (v.noSerial !== 'Y' && !v.serial) return { ok: false, msg: fmt(T.required, { field: T.fSerial }), field: 'serial' };
          const d = Object.assign({ type: v.type, spec: v.specSel || v.specTxt, note: v.note }, srcData(v)); if (v.source === 'NO_PO') d.dealerId = v.dealerId; if (v.noSerial === 'Y') d.noSerial = 'Y'; else d.serial = v.serial;
          const r = await callConfirmed('receive.part', d);
          if (r.ok) r.done = line => said(fmt(T.rcPartSaved, { id: r.partId, serial: r.serial }) + (r.approvalId ? ' ' + T.sentForApproval : ''), r.approvalId ? 'warn' : 'ok', line);
          return r;
        });
        F.f.type.inp.addEventListener('change', () => { F.setOpts('specSel', (L().specs || {})[F.val('type')] || []); F.sync(); });
      },
      ACCESSORY: () => formPane([{ k: 'source', l: T.rcSource, t: 'sel', req: true, wide: true, placeholder: true, o: () => srcOpts('ACCESSORY', [{ v: 'NO_PO', t: T.rcLocal }]) }, { k: 'itemId', l: T.lnAccItem, t: 'sel', req: true, o: accItemOpts },
        { k: 'qty', l: T.rcQty, t: 'int', req: true, min: 1, maxv: 500 }, { k: 'billNo', l: T.fBillNo2, req: true, max: 40, show: v => v.source === 'NO_PO' }], {}, async v => {
        const d = Object.assign({ itemId: v.itemId, qty: v.qty }, srcData(v)); if (v.billNo) d.billNo = v.billNo;
        const r = await callConfirmed('acc.receive', d);
        if (r.ok) r.done = line => said(fmt(T.rcAccSaved, { n: r.balance }) + (r.approvalId ? ' ' + T.sentForApproval : ''), r.approvalId ? 'warn' : 'ok', line);
        return r;
      }),
      PARCEL: () => { clear(pane); parcelPane(pane); }
    };
    function draw() { PANES[current](); show(linesBox, current !== 'PARCEL'); }
    [['LAPTOP', T.rcTabLaptop], ['PART', T.rcTabPart], ['ACCESSORY', T.rcTabAcc], ['PARCEL', T.rcTabParcel]].forEach((t, i) => tabs.appendChild(h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': i === 0 ? 'true' : 'false', text: t[1], dataset: { tab: t[0] },
      onclick: async e => { if (S.dirty && !(await askDiscard())) return; S.dirty = false; current = t[0]; $$('.tab', tabs).forEach(x => x.setAttribute('aria-selected', x === e.currentTarget ? 'true' : 'false')); clear(msg); draw(); } })));
    pane.appendChild(spinner());
    reloadLines().then(() => { if (pane.isConnected) draw(); });
  }
};
function parcelPane(root) {
  const F = mkForm([{ k: 'dealerId', l: T.fDealer, t: 'sel', o: () => dealerOpts() }, { k: 'dealerName', l: T.pcDealerName, max: 60, show: v => !v.dealerId }, { k: 'boxes', l: T.pcBoxes, t: 'int', req: true, min: 1, maxv: 99, dflt: 1 }, { k: 'awb', l: T.pcAwb, max: 40 },
    { k: 'condition', l: T.pcCond, req: true, max: 200, wide: true }, { k: 'note', l: T.fNote, t: 'area', max: 300 }]);
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true }), listBox = h('div');
  const b = btn(T.pcSave, async () => {
    if (b.dataset.busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    b.dataset.busy = '1'; b.disabled = true; const r = await api('parcel.log', F.get()); delete b.dataset.busy; b.disabled = false;
    if (!r.ok) { err.textContent = r.msg; err.hidden = false; return; }
    notify(T.pcSaved, 'ok'); F.reset(); S.dirty = false; reload();
  }, '', { id: 'parcelSave' });
  append(root, [h('div', { class: 'card' }, h('p', { class: 'intro', text: T.pcIntro }), F.el, err, h('div', { class: 'btns' }, b)), h('h2', { text: T.pcList }), listBox]);
  const reload = load(listBox, 'parcel.list', {}, (r, box) => {
    box.appendChild(simpleTable([{ k: 'parcelId', l: T.cRef, main: true }, { k: 'dealerName', l: T.fDealer, main: true }, { k: 'boxes', l: T.pcBoxes, num: true }, { k: 'awb', l: T.pcAwb }, { k: 'condition', l: T.pcCond }, { k: 'at', l: T.cAt, fmt: fmtDT }, { k: 'by', l: T.pcBy, fmt: userName },
      { k: 'status', l: T.fStatus, el: p => pill('PARCEL_STATUS', p.status) }, { k: 'act', l: '', act: true, el: p => (isMgr() && p.status === 'OPEN' ? btn(T.pcClose, null, 'sec sm', { 'data-act': 'close' }) : null) }], r.rows || [],
    { empty: T.pcEmpty, onAct: (a, p) => actionDialog({ title: fmt(T.pcCloseTitle, { id: p.parcelId }), action: 'parcel.close', fields: [{ k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], build: v => ({ parcelId: p.parcelId, note: v.note }), refresh: false, after: reload }) }));
  });
}
VIEWS.parcels = { title: T.pcTitle, perm: () => has('parcel'), render(root) { viewHead(root, T.pcTitle); parcelPane(root); } };

/* ---------- V9 outside ---------- */
const DEALER_OUT = ['DEALER_RETURN', 'DEALER_REPLACEMENT'];
const isLate = m => m.late === 'Y' || m.late === true;
const isReturned = m => m.returned === 'Y' || m.returned === true || (typeof m.returned === 'string' && m.returned.length > 1);
VIEWS.outside = {
  title: T.ouTitle, perm: () => has('outside'),
  render(root) {
    viewHead(root, T.ouTitle, [btn(T.ouSend, () => outsideSendDialog('', {}), '', { id: 'ouSend' }), has('outside.close') ? btn(T.ouSettle, () => go('reports', 'dealerReturns'), 'sec') : null]);
    root.appendChild(h('p', { class: 'hint', text: T.ouExpected }));
    const canReturn = isMgr() || role() === 'REPAIR';
    const lv = listView(root, { action: 'outside.list', name: 'Outside', title: T.ouTitle, empty: T.ouEmpty, search: false,
      filters: [{ k: 'open', l: T.poShow, t: 'sel', req: true, o: [{ v: 'Y', t: T.ouOpen }, { v: 'N', t: T.ouAll }], dflt: 'Y' }],
      onRow: r => (/^RJ/.test(r.itemId) ? (has('job.view') || has('job.status') ? openJob(r.itemId) : null) : openLaptop(r.itemId)),
      onAct: (a, r) => { if (a === 'ret') outsideReturnDialog(r); else if (a === 'close') outsideCloseDialog(r); },
      cols: [{ k: 'itemId', l: T.ouItem, main: true }, { k: 'reason', l: T.ouReason, v: r => lbl('OUT_REASON', r.reason) }, { k: 'partner', l: T.ouPartner, main: true }, { k: 'work', l: T.ouWork }, { k: 'tracking', l: T.ouTracking }, { k: 'sentBy', l: T.ouSentBy, v: r => userName(r.sentBy) },
        { k: 'sentAt', l: T.ouSentAt, fmt: fmtDT }, { k: 'dueAt', l: T.ouDue, fmt: fmtDT }, { k: 'late', l: T.ouLate, v: r => (isLate(r) ? T.ouLate : T.ouOnTime), el: r => h('span', { class: 'pill ' + (isLate(r) ? 'bad' : 'good'), text: isLate(r) ? T.ouLate : T.ouOnTime }) },
        { k: 'returned', l: T.ouReturned, v: r => (isReturned(r) ? T.yes : T.no) }, { k: 'outcome', l: T.ouOutcome, v: r => lbl('MOVE_OUTCOME', r.outcome) },
        { k: 'act', l: '', act: true, el: r => [canReturn && !isReturned(r) && !r.outcome && (/^RJ-/.test(r.itemId) || (r.scanMode && r.scanMode !== 'PENDRIVE')) ? btn(T.ouReturn, null, 'sec sm', { 'data-act': 'ret' }) : null, has('outside.close') && DEALER_OUT.indexOf(r.reason) >= 0 && !r.outcome ? btn(T.ouClose, null, 'sec sm', { 'data-act': 'close' }) : null] }] });
    S.refresh = lv.reload;
  }
};
function outsideSendDialog(itemId, o) {
  o = o || {}; let fileId = '';
  const reasons = (L().outsideReasons || []).length ? L().outsideReasons.map(r => ({ v: r.code, t: lbl('OUT_REASON', r.code) + (r.days ? ' — ' + (r.days === 1 ? T.day1 : fmt(T.days, { n: r.days })) : '') })) : opts('OUT_REASON');
  const partners = () => (L().partners || []).map(p => ({ dealerId: p.dealerId || p.id, name: p.name, category: p.category || 'SERVICE' }));   /* server: partners {id,name} = SERVICE partners */
  const partnerOpts = v => partners().concat((L().dealers || []).filter(d => !partners().some(p => p.dealerId === d.dealerId))).filter(p => (DEALER_OUT.indexOf(v) >= 0 ? p.category !== 'SERVICE' : true)).map(p => ({ v: p.dealerId, t: p.name }));
  const noPartner = v => v.reason === 'WITH_STAFF' || v.reason === 'STANDBY_CUSTOMER';
  const m = actionDialog({ title: T.ouSendTitle, intro: T.ouSendIntro, action: 'outside.sendNoScan', pin: true, wide: true, init: { itemId, partnerId: o.dealerId || '' },
    fields: [{ k: 'itemId', l: T.ouItemCode, t: 'code', req: true, ro: !!itemId }, { k: 'reason', l: T.ouReason, t: 'sel', req: true, o: reasons },
      { k: 'partnerId', l: T.ouPartner, t: 'sel', o: () => partnerOpts(''), show: v => !noPartner(v) }, { k: 'partnerName', l: T.ouPartnerOther, max: 60, show: v => !noPartner(v) && !v.partnerId },
      { k: 'userId', l: T.ouStaff, t: 'sel', req: true, o: () => userOpts(), show: v => v.reason === 'WITH_STAFF' }, { k: 'jobId', l: T.ouJob, t: 'code', sticker: 'RJ', cam: false, req: true, show: v => v.reason === 'STANDBY_CUSTOMER' },
      { k: 'work', l: T.ouWorkReq, t: 'area', req: true, max: 200 }, { k: 'tracking', l: T.ouTracking, max: 60, hint: T.ouTrackHint, wide: true }],
    validate: v => (DEALER_OUT.indexOf(v.reason) >= 0 && !v.tracking ? fmt(T.required, { field: T.ouTracking }) : (!noPartner(v) && !v.partnerId && !v.partnerName ? fmt(T.required, { field: T.ouPartner }) : '')),
    build: v => { const d = Object.assign({}, v); if (fileId) d.receiptFileId = fileId; return d; },
    extra: (body, F) => body.appendChild(h('div', { class: 'fld' }, h('span', { class: 'lbl', text: T.ouReceipt }), photoButton(T.photoAdd, 'COURIER_RECEIPT', () => normCode(F.val('itemId') || '') || 'NONE', id => { fileId = id; }))) });
  return m;
}
function outsideReturnDialog(mv) { return actionDialog({ title: fmt(T.ouReturnTitle, { id: mv.itemId }), action: 'outside.returnNoScan', fields: [{ k: 'workDone', l: T.ouWorkDone, t: 'area', max: 200 }, { k: 'amountPaid', l: T.ouPaid, t: 'money' }], build: v => Object.assign({ moveId: mv.moveId }, v), ok: T.ouReturnDone }); }
function outsideCloseDialog(mv) {
  return actionDialog({ title: fmt(T.ouCloseTitle, { id: mv.itemId }), action: 'outside.close', submit: T.ouClose,
    fields: [{ k: 'outcome', l: T.ouOutcome, t: 'sel', req: true, o: opts('MOVE_OUTCOME', ['SAME_UNIT', 'REPLACEMENT', 'REFUND_CREDIT', 'WRITTEN_OFF']) }, { k: 'cost', l: T.ouCost, t: 'money' },
      { k: 'replacementId', l: T.ouReplId, t: 'code', sticker: 'GJ', cam: false, req: true, show: v => v.outcome === 'REPLACEMENT' }, { k: 'refund', l: T.ouRefund, t: 'money', req: true, show: v => v.outcome === 'REFUND_CREDIT' },
      { k: 'creditNote', l: T.ouCredit, max: 40, show: v => v.outcome === 'REFUND_CREDIT' }, { k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], build: v => Object.assign({ moveId: mv.moveId }, v), ok: r => (r.approvalId ? (r.msg || T.sentForApproval) : T.ouClosed) });
}
