/* GJ App v4 — D1 laptop card, D2 change status, D3 edit / rate / serial, unscannable-laptop actions, V5 stock list, V6 bulk completion. */
'use strict';
Object.assign(C, { STORAGE_TYPE: { SSD: 'SSD', HDD: 'HDD', EMMC: 'eMMC', ANY: 'Any type' }, HIST_KIND: { SCAN: 'Scan', CHANGE: 'Change', HISTORY: 'Change', MOVE: 'Movement', PART: 'Part', SALE: 'Sale', RETURN: 'Return', APPROVAL: 'Approval', INCIDENT: 'Incident' } });
Object.assign(T, {
  lapTitle: 'Laptop {id}', fId: 'Stock ID', fModel: 'Laptop model', fCpu: 'Processor (generation)', fRamSt: 'RAM / Storage', fTouch: 'Touch', fSerial: 'Serial No.', fStatus: 'Status', fState: 'State', fSection: 'Section',
  fCheckedBy: 'Checked by', fLastScan: 'Last pendrive scan', fScanStatus: 'Scan status', fAge: 'Days in stock', fArrived: 'Arrival date', fCharger: 'Charger', fType: 'Type', fBrand: 'Brand', fModelOnly: 'Model',
  fRam: 'RAM (GB)', fSt1: 'Storage 1 (GB)', fSt1t: 'Storage 1 type', fSt2: 'Storage 2 (GB)', fSt2t: 'Storage 2 type', fSource: 'Source', fScanMode: 'Scan mode', fSeal: 'Seal number', fVerified: 'Verified',
  fWarrantyTill: 'Dealer warranty till', fBatt: 'Battery health', fDisk: 'Disk life', fTag: 'Tag price', fMin: 'Minimum price', fFlags: 'Flags', fNotes: 'Notes', fNote: 'Note', fReason: 'Reason', fChargerW: 'Charger (watts)',
  fDealer: 'Dealer', fPo: 'Purchase order', fShipment: 'Shipment', fBillNo: 'Dealer bill no.', fBillDate: 'Dealer bill date', fRate: 'Purchase rate', fPartsCost: 'Parts cost', fOutCost: 'Outside cost', fWarrantyDays: 'Dealer warranty',
  costBlock: 'Purchase and cost', dealerBlock: 'Dealer and purchase order', healthBlock: 'Health and checks', pct: '{n}%', warrantyNone: 'None', unknownDealer: 'Unknown',
  transitBox: 'In transit: sent by {by} to {to} ({at}). It remains the sender\'s responsibility (Custody / ज़िम्मेदारी) until it is accepted.',
  outsideBox: 'Outside the shop: {reason} — {partner}. Sent by {by}. Due back {due}.', outsideLate: 'Overdue', reserveBox: 'Reserved for {customer} until {till} ({id}).',
  reqBox: 'Sale requested for {customer} at the agreed price of {price}, kept until {till} ({id}).', transitPendrive: 'The receiver accepts it with the GJ Pendrive (Accept handover).', /* R46A-02, R46A-07 */
  pickupBox: 'Sold — awaiting pickup by the customer.', partsFitted: 'Parts fitted / pulled', lastMoves: 'Last movements', openApprovals: 'Requests waiting for approval', saleBlock: 'Sale',
  bStatus: 'Change status', bHandTo: 'Hand over to {to} (no scan)', bAccept: 'Accept handover (no scan)', bCancelHand: 'Cancel handover', bOutside: 'Send outside (no scan)', bOutReturn: 'Return from outside (no scan)',
  bReserve: 'Reserve', bReserveCancel: 'Cancel reservation', bSell: 'Sell', bSaleRequest: 'Request sale', bEdit: 'Edit', bRate: 'Change rate', bSerial: 'Correct serial number', bUnscannable: 'Mark as cannot be scanned',
  bUnseal: 'Remove seal', bWriteOff: 'Write off (बट्टे खाते)', bRebind: 'Motherboard replaced (rebind)', bReassign: 'Move to another PO line', bHistory: 'History', bStickerMissing: 'Sticker missing',
  handPendrive: 'Use the pendrive to hand over, send outside or return this laptop.',
  stTitle: 'Change status — {id}', stNew: 'New status', stText: 'Problem / reason', stUser: 'Used by', stPurpose: 'Purpose', stUntil: 'Until', stHandover: 'A handover to Repair will start automatically. The laptop stays in your name until Repair accepts it.',
  stSaved: 'Status saved.', stSavedHand: 'Status saved. Handover to Repair started.', stNone: 'No status change is available for this laptop.', stUndoPin: 'Undoing a return to the dealer is an override: the owner is alerted.', sgRescanCleared: 'Sighting saved. The rescan flag is cleared; the owner alert lists what was seen.', stReservedFirst: 'This laptop is reserved. Cancel the reservation first (Sales > Reservations), then change its status.',
  edTitle: 'Edit laptop — {id}', edReason: 'Reason for the change', edNothing: 'Nothing was changed.', rateTitle: 'Change purchase rate — {id}', rateNew: 'New purchase rate', serTitle: 'Correct serial number — {id}', serNew: 'Correct serial number',
  unsTitle: 'Cannot be scanned — {id}', unsMode: 'Why it cannot be scanned', unsLock: 'Lock type', unsIntro: 'The request goes for approval. Once approved, the laptop is exempt from the scan cycle but stays in the daily sticker count.',
  woTitle: 'Write off (बट्टे खाते) — {id}', woKind: 'Kind', woReuse: 'The sticker can be used again', woIntro: 'A write-off needs approval. Pull usable parts first when the laptop is used for parts.',
  rbTitle: 'Motherboard replaced — {id}', rbIntro: 'The saved hardware identity is cleared. The next pendrive scan binds the laptop again by its sticker and asks for approval.',
  bReinstate: 'Back in stock (found / repaired)', riTitle: 'Bring {id} back into stock', riIntro: 'For a written-off laptop that came back (stolen and recovered, scrap repaired). The owner approves. It goes to Repair as Under check with a new life; scan it fully with the pendrive before it can be sold.', riDone: 'Back in stock. Scan it with the pendrive in Repair.',
  raTitle: 'Move to another PO line — {id}', raPo: 'PO number', raLine: 'Line number', raShip: 'Shipment ID (optional)',
  smTitle: 'Sticker missing', smIntro: 'Report a laptop whose sticker has fallen off or cannot be read.', smSerial: 'Stock ID or serial number', smSaved: 'Reported to the manager.',
  haTitle: 'Accept handover — {id}', haIntro: 'Check the laptop before accepting. From now it is the responsibility of your section.', hsTitle: 'Hand over to {to} — {id}', hsText: 'Note for the receiver',
  hsDone: 'Sent. It stays in your name until it is accepted.', haDone: 'Accepted.', hcDone: 'Handover cancelled.', unsealDone: 'Seal removed. A pendrive scan is due in this cycle.',
  histTitle: 'History — {id}', hKind: 'Kind', hText: 'Details',
  onTitle: 'Old stock without scan', onIntro: 'Only for a laptop that was already in the shop and cannot be scanned with the pendrive. The entry always needs approval.', onSticker: 'New GJ sticker', onLocation: 'Section',
  cpuHint: 'Example: Intel Core i5-8350U (8th Gen). Type "Not known" when it cannot be read.',
  slTitle: 'Stock list', slSearch: 'Search ID, serial, brand, model…', slStateDefault: 'In stock and waiting', slFlag: 'Flag', slPrint8: 'Print stock sheet (8 columns)', slEmpty: 'No laptops match.',
  buTitle: 'Complete stock records', buProgress: '{n} of {N} complete', buIntro: 'Fill in the missing dealer, arrival date, purchase rate and warranty of migrated laptops. Existing values are not overwritten unless you tick "Replace existing values".',
  bmTab: 'Move to a section', bmIntro: 'Tick the laptops and choose where they now stand. Only laptops in the shop with status Ready, Under check or Needs repair can be moved.', bmFrom: 'Laptops now in', bmTo: 'Move them to', bmStatus: 'Set status to', bmKeep: 'Keep their status', bmAll: 'Tick all', bmSave: 'Move {n} laptop(s)', bmNone: 'Tick at least one laptop.', bmDone: '{ok} moved, {bad} not moved', bmEmpty: 'No laptop here can be moved.',
  buSaveRows: 'Save changed rows', buPaste: 'Paste from Excel', buPasteHint: 'Copy the rows from Excel including the header row: Stock ID, Dealer, Arrival date, Bill no., Bill date, Warranty days, Purchase rate, Charger (optional, may stay empty), Note.',
  buCheck: 'Check pasted rows', buSaveValid: 'Save {n} valid rows', buReplace: 'Replace existing values', buRowOk: 'OK', buRowErr: 'Error', buSavedN: '{ok} rows saved, {bad} rows with errors.', buNoChange: 'No rows were changed.',
  buMissing: 'Missing', buAllDone: 'All stock records are complete.', buBadHeader: 'The first row must be the header row copied from the template.', buResult: 'Result',
  eDealer: 'Dealer not found', eDate: 'Invalid date', eWarranty: 'Use None, 15, 30 or 90', eRate: 'Whole number above 0', eCharger: 'Unknown charger value', eId: 'Invalid Stock ID'
});

const ownSection = it => isMgr() || (S.me && S.me.section && S.me.section === it.location);
const unscannable = it => ['NO_POWER', 'NO_OS', 'LOCKED', 'UNSUPPORTED'].indexOf(it.scanMode) >= 0;
const modelText = it => { const b = String(it.brand || ''), m = String(it.model || ''); return b && m.toUpperCase().indexOf(b.toUpperCase()) === 0 ? m : [b, m].filter(Boolean).join(' '); }; /* UI-03: no doubled brand */
const ramSt = it => [it.ramGb ? it.ramGb + ' GB' : '', it.storage || ''].filter(Boolean).join(' / ');
const dealerOpts = extra => (extra || []).concat((L().dealers || []).filter(d => !d.status || d.status === 'APPROVED').map(d => ({ v: d.dealerId, t: d.name })));
const warrantyOpts = () => [{ v: '0', t: T.warrantyNone }].concat(opts('WARRANTY_DAYS'));
function chipList(group, codes, kind) { const d = h('div', { class: 'chips' }); (codes || []).forEach(c => d.appendChild(pill(group, c, kind))); return codes && codes.length ? d : null; }
/* server storage text "512GB SSD + 1TB HDD" -> [{gb, type}] (stock.get returns the text only) */
function parseStorage(text) { return String(text || '').split('+').map(x => /(\d+(?:\.\d+)?)\s*(GB|TB)\s*([A-Za-z]+)?/i.exec(x.trim())).filter(Boolean).map(m => ({ gb: Math.round(Number(m[1]) * (/tb/i.test(m[2]) ? 1000 : 1)), type: (m[3] || 'SSD').toUpperCase() === 'NVME' ? 'SSD' : (m[3] || 'SSD').toUpperCase() })); }
/* meta.lists.storage holds texts like "256GB SSD"; the GB boxes offer the sizes only */
const gbText = gb => (gb >= 1000 && gb % 1000 === 0 ? (gb / 1000) + ' TB' : gb + ' GB');
const storageGbOpts = () => Array.from(new Set((L().storage || []).map(s => (parseStorage(s)[0] || {}).gb || (/^\d+$/.test(String(s)) ? Number(s) : 0)).filter(Boolean))).sort((a, b) => a - b).map(g => ({ v: String(g), t: gbText(g) }));
function specFields(it, o) {
  it = it || {}; o = o || {}; const sp = it.storageParts || parseStorage(it.storage);
  return [{ k: 'type', l: T.fType, t: 'sel', o: opts('TYPE'), req: true, dflt: 'LAPTOP' }, { k: 'brand', l: T.fBrand, t: 'sel', o: () => L().brands || [], req: !!o.req },
    { k: 'model', l: T.fModelOnly, req: !!o.req, max: 60 }, { k: 'cpu', l: T.fCpu, max: 60, hint: T.cpuHint, wide: true },
    { k: 'ramGb', l: T.fRam, t: 'sel', o: () => L().ramGb || [], ph: T.notKnown }, { k: 'st1gb', l: T.fSt1, t: 'sel', o: storageGbOpts, ph: T.notKnown, dflt: sp[0] && String(sp[0].gb) },
    { k: 'st1type', l: T.fSt1t, t: 'sel', o: opts('STORAGE_TYPE', ['SSD', 'HDD', 'EMMC']), dflt: sp[0] && sp[0].type }, { k: 'st2gb', l: T.fSt2, t: 'sel', o: storageGbOpts, ph: T.none, dflt: sp[1] && String(sp[1].gb) },
    { k: 'st2type', l: T.fSt2t, t: 'sel', o: opts('STORAGE_TYPE', ['SSD', 'HDD', 'EMMC']), dflt: sp[1] && sp[1].type }];
}
function storageParts(v) { const a = []; if (v.st1gb) a.push({ gb: Number(v.st1gb), type: v.st1type || 'SSD' }); if (v.st2gb) a.push({ gb: Number(v.st2gb), type: v.st2type || 'HDD' }); return a; }
function stripSpec(v) { const d = Object.assign({}, v); ['st1gb', 'st1type', 'st2gb', 'st2type'].forEach(k => delete d[k]); if (d.ramGb) d.ramGb = Number(d.ramGb); d.storageParts = storageParts(v); return d; }

/* ---------- D1 laptop card (opens over the current view, so list state is kept) ---------- */
function openLaptop(id) {
  const m = openModal({ title: fmt(T.lapTitle, { id }), full: true });
  m.reload = load(m.body, 'stock.get', { id }, (r, box) => drawLaptop(box, r, m));
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
  return m;
}
function drawLaptop(box, r, m) {
  const it = r.item, cost = has('cost.view');
  m.titleEl.textContent = fmt(T.lapTitle, { id: it.id }) + ' — ' + modelText(it);
  const head = h('div', { class: 'chips' }, pill('STATE', it.state), it.state === 'ACTIVE' || it.state === 'PENDING' ? pill('STATUS', it.status) : null, pill('LOCATION', it.location, 'plain'), it.verified === 'N' ? pill('VERIFIED', 'N') : null);
  (it.flags || []).forEach(f => head.appendChild(pill('FLAG', f, f === 'MISSING' || f === 'UNFIT' ? 'bad' : 'warn')));
  box.appendChild(head);
  if (it.transit) box.appendChild(note(fmt(T.transitBox, { by: userName(it.transit.by), to: lbl('SECTION', it.transit.to), at: fmtDT(it.transit.at) }) + (unscannable(it) ? '' : ' ' + T.transitPendrive), 'warn')); /* R46A-07: a laptop that scans is accepted with the pendrive - said where the to-do leads */
  if (it.outside) box.appendChild(note([fmt(T.outsideBox, { reason: lbl('OUT_REASON', it.outside.reason), partner: it.outside.partner || T.notSet, by: userName(it.outside.by), due: fmtDT(it.outside.dueAt) }), it.outside.late === 'Y' || it.outside.late === true ? h('b', { text: ' ' + T.outsideLate }) : null], it.outside.late === 'Y' || it.outside.late === true ? 'bad' : 'warn'));
  if (it.reserve) box.appendChild(note(it.reserve.kind === 'SALE_REQUEST' && Number(it.reserve.price) > 0 ? fmt(T.reqBox, { customer: it.reserve.customer, price: money(it.reserve.price), till: fmtDate(it.reserve.expiresAt), id: it.reserve.id }) : fmt(T.reserveBox, { customer: it.reserve.customer, till: fmtDate(it.reserve.expiresAt), id: it.reserve.id }), 'warn')); /* R46A-02 */
  if ((it.flags || []).indexOf('AWAITING_PICKUP') >= 0 || (it.flags || []).indexOf('PICKUP_PENDING') >= 0) box.appendChild(note(T.pickupBox, 'warn'));
  const wl = it.warrantyDaysLeft;
  const left = h('div', { class: 'card' }, kv([[T.fModel, modelText(it)], [T.fType, lbl('TYPE', it.type)], [T.fCpu, it.cpu], [T.fRamSt, ramSt(it)], [T.fTouch, lbl('TOUCH', it.touch)], [T.fSerial, it.serial], [T.fCharger, lbl('CHARGER', it.charger)],
    [T.fSource, lbl('SOURCE', it.source)], [T.fArrived, it.arrivedOn ? fmtDate(it.arrivedOn) : ''], [T.fAge, it.ageDays == null ? '' : String(it.ageDays)],
    [T.fWarrantyTill, it.warrantyTill ? fmtDate(it.warrantyTill) + (wl == null ? '' : ' — ' + (wl < 0 ? T.expired : fmt(T.daysLeft, { n: wl }))) : (it.warrantyUnknown === 'Y' ? T.warrantyUnknown : '')],
    [T.fTag, it.tagPrice != null && it.tagPrice !== '' ? money(it.tagPrice) : ''], [T.fMin, it.minPrice != null && it.minPrice !== '' ? money(it.minPrice) : '']]));
  const right = h('div', { class: 'card' }, h('h3', { text: T.healthBlock }), kv([[T.fScanMode, lbl('SCAN_MODE', it.scanMode)], [T.fSeal, it.sealNo], [T.fVerified, lbl('VERIFIED', it.verified)],
    [T.fLastScan, it.lastPendriveScan ? fmtDT(it.lastPendriveScan) + (it.lastPendriveBy ? ' — ' + userName(it.lastPendriveBy) : '') : T.never], [T.fScanStatus, pill('CYCLE_STATE', it.scanCycleState)],
    [T.fBatt, it.battHealth == null || it.battHealth === '' ? '' : fmt(T.pct, { n: it.battHealth })], [T.fDisk, it.diskLife == null || it.diskLife === '' ? '' : fmt(T.pct, { n: it.diskLife })], ['', pill('FIT', it.fitLevel)],
    ['', chipList('UNFIT', it.unfitCodes, 'bad')], ['', chipList('UNFIT', it.lockCodes, 'bad')]]));
  box.appendChild(h('div', { class: 'cols2' }, left, right));
  if (cost && (it.purchaseRate != null || it.dealerName || it.poNo)) box.appendChild(h('div', { class: 'card costblock' }, h('h3', { text: T.costBlock }), kv([[T.fDealer, it.dealerName], [T.fPo, it.poNo], [T.fShipment, it.shipmentId], [T.fBillNo, it.billNo],
    [T.fBillDate, it.billDate ? fmtDate(it.billDate) : ''], [T.fRate, it.purchaseRate != null && it.purchaseRate !== '' ? money(it.purchaseRate) : T.notSet], [T.fPartsCost, it.partsCost ? money(it.partsCost) : ''], [T.fOutCost, it.outsideCost ? money(it.outsideCost) : '']])));
  /* SPEC 2.3: repair sees the dealer / PO of laptops in Repair (no rates); the server sends these fields only then */
  else if (!cost && (it.dealerName || it.poNo)) box.appendChild(h('div', { class: 'card dealerblock' }, h('h3', { text: T.dealerBlock }), kv([[T.fDealer, it.dealerName], [T.fPo, it.poNo], [T.fShipment, it.shipmentId]])));
  if (r.sale) { const s = r.sale; box.appendChild(h('div', { class: 'card' }, h('h3', { text: T.saleBlock }), kv([[T.cDate, fmtDate(s.saleDate)], [T.fBillNo2, s.billNo], [T.fCustomer, s.customer], [T.fMobile, s.mobile], [T.fPrice, s.price != null ? money(s.price) : ''], [T.fCustWarranty, s.warrantyTill ? fmtDate(s.warrantyTill) : ''], [T.fSalesperson, s.salesperson || s.salespersonName || userName(s.salespersonId)]]))); }
  /* actions by permission and state */
  const A = h('div', { class: 'btns', id: 'lapActions' }); const active = it.state === 'ACTIVE', inShop = it.location === 'SALES' || it.location === 'REPAIR', mine = ownSection(it);
  const add = (text, fn, cls) => A.appendChild(btn(text, fn, cls || 'sec'));
  if (has('stock.status') && active && inShop && !it.transit && mine) add(T.bStatus, () => statusDialog(it), '');
  if (has('handover') && active) {
    if (it.transit) {
      const sender = (it.transit.byId || it.transit.by) === S.me.userId;
      if (unscannable(it) && !sender && (isMgr() || S.me.section === it.transit.to)) add(T.bAccept, () => acceptDialog(it), '');
      if (sender || isMgr()) add(T.bCancelHand, e => runAction(e.currentTarget, 'handover.cancel', { id: it.id }, { ok: T.hcDone }));
    } else if (inShop && mine && unscannable(it)) { const to = it.location === 'SALES' ? 'REPAIR' : 'SALES'; add(fmt(T.bHandTo, { to: lbl('SECTION', to) }), () => sendDialog(it, to)); }
  }
  if (has('outside') && active && unscannable(it)) {
    if (!it.outside && !it.transit && inShop && mine) add(T.bOutside, () => outsideSendDialog(it.id, { dealerId: it.dealerId }));
    const om = it.outside ? (it.outside.moveId || ((r.moves || []).find(x => x.kind === 'OUTSIDE' && x.moveId && !x.closedAt && !x.outcome) || {}).moveId) : '';
    if (om && (isMgr() || role() === 'REPAIR')) add(T.bOutReturn, () => outsideReturnDialog({ moveId: om, itemId: it.id }));
  }
  /* owner 26 Nov: quick fix - a small fix by a technician without a handover */
  const qf = r.qfix;
  if (!qf && has('qfix.ask') && active && it.location === 'SALES' && (it.status === 'READY' || it.status === 'RESERVED') && !it.transit && mine) add(T.bQfix, () => qfixAskDialog(it));
  if (qf) { box.insertBefore(note(qfixText(qf), 'warn'), box.children[1] || null); qfixButtons(qf).forEach(b => A.appendChild(b)); }
  if (has('reserve') && active && it.status === 'READY' && it.location === 'SALES' && !it.reserve) add(T.bReserve, () => reserveDialog(it));
  if (has('reserve') && it.reserve) add(T.bReserveCancel, () => reserveCancelDialog(it.reserve.id, it.reserve.advance, it.reserve.byId, it.reserve.advanceMode)); /* R46A-01 */
  if (has('sale.create') && active && (it.location === 'SALES' || (it.outside && it.outside.reason === 'ON_APPROVAL')) && !it.transit) add(T.bSell, () => { m.close(); if (it.reserve) sellFrom({ stockId: it.id, customer: it.reserve.customer, kind: it.reserve.kind, price: it.reserve.price, byId: it.reserve.byId }); go('sell', it.id); }, ''); /* R46A-02 */
  if (!has('sale.create') && has('sale.request') && active && it.status === 'READY' && it.location === 'SALES') add(T.bSaleRequest, () => saleRequestDialog(it), '');
  if (has('stock.edit') && it.state !== 'VOID' && (isMgr() || (it.verified === 'N' && it.location === 'REPAIR'))) add(T.bEdit, () => editDialog(it));
  if (has('stock.rate')) add(T.bRate, () => actionDialog({ title: fmt(T.rateTitle, { id: it.id }), action: 'stock.rateEdit', fields: [{ k: 'rate', l: T.rateNew, t: 'money', req: true, min: 1, dflt: it.purchaseRate }, { k: 'reason', l: T.fReason, req: true, max: 200, wide: true }], build: v => ({ id: it.id, rate: v.rate, reason: v.reason }) }));
  if (has('stock.serial')) add(T.bSerial, () => actionDialog({ title: fmt(T.serTitle, { id: it.id }), action: 'stock.serialEdit', fields: [{ k: 'serial', l: T.serNew, t: 'code', cam: false, req: true, max: 40, noSticker: true, dflt: it.serial }, { k: 'reason', l: T.fReason, req: true, max: 200 }], build: v => ({ id: it.id, serial: v.serial, reason: v.reason }) }));
  if (has('stock.unscannable') && active && it.scanMode === 'PENDRIVE' && mine) add(T.bUnscannable, () => actionDialog({ title: fmt(T.unsTitle, { id: it.id }), intro: T.unsIntro, action: 'stock.markUnscannable',
    fields: [{ k: 'mode', l: T.unsMode, t: 'sel', req: true, o: opts('SCAN_MODE', ['NO_POWER', 'NO_OS', 'LOCKED', 'UNSUPPORTED']) }, { k: 'lockCode', l: T.unsLock, t: 'sel', o: opts('UNFIT', ['LOCK_BIOS', 'LOCK_DISK', 'LOCK_ACTIVATION', 'LOCK_MDM', 'LOCK_BITLOCKER']), req: true, show: v => v.mode === 'LOCKED' }, { k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => Object.assign({ id: it.id }, v) }));
  if (has('approve') && active && unscannable(it)) add(T.bSight, () => actionDialog({ title: fmt(T.sgTitle, { id: it.id }), intro: T.sgIntro, action: 'stock.sight', pin: true, submit: T.bSight,
    fields: [{ k: 'RAM', l: T.sgRam, t: 'check' }, { k: 'DISK', l: T.sgDisk, t: 'check' }, { k: 'SCREEN', l: T.sgScreen, t: 'check' }, { k: 'BATTERY', l: T.sgBattery, t: 'check' }, { k: 'note', l: T.sgNote, t: 'area', max: 200, wide: true }],
    build: v => ({ id: it.id, present: { RAM: v.RAM === 'Y' ? 'Y' : 'N', DISK: v.DISK === 'Y' ? 'Y' : 'N', SCREEN: v.SCREEN === 'Y' ? 'Y' : 'N', BATTERY: v.BATTERY === 'Y' ? 'Y' : 'N' }, note: v.note, pin: v.pin }), ok: r => ((r.missing || []).length ? T.sgMissing : (r.rescanCleared === 'Y' ? T.sgRescanCleared : T.sgDone)) }));
  if (it.scanMode === 'SEALED' && active && mine) add(T.bUnseal, e => runAction(e.currentTarget, 'stock.unseal', { id: it.id }, { ok: T.unsealDone }));
  if (has('stock.writeoff') && (active || it.state === 'PENDING') && mine) add(T.bWriteOff, () => actionDialog({ title: fmt(T.woTitle, { id: it.id }), intro: T.woIntro, action: 'stock.writeOff', pin: true, danger: true, submit: T.bWriteOff,
    fields: [{ k: 'kind', l: T.woKind, t: 'sel', req: true, o: opts('WRITEOFF') }, { k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => Object.assign({ id: it.id }, v) })); /* round 1 B5 (R1A-14): no "sticker reusable" option */
  if (has('stock.rebind') && active) add(T.bRebind, () => actionDialog({ title: fmt(T.rbTitle, { id: it.id }), intro: T.rbIntro, action: 'stock.rebind', fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ id: it.id, reason: v.reason }) }));
  if (has('po') && (it.source === 'PURCHASE' || it.source === 'REPLACEMENT') && (it.state === 'ACTIVE' || it.state === 'PENDING')) add(T.bReassign, () => actionDialog({ title: fmt(T.raTitle, { id: it.id }), action: 'stock.reassignPO',
    fields: [{ k: 'poNo', l: T.raPo, t: 'code', cam: false, req: true, dflt: it.poNo }, { k: 'line', l: T.raLine, t: 'int', req: true, min: 1 }, { k: 'shipmentId', l: T.raShip }], build: v => Object.assign({ id: it.id }, v) }));
  if (has('stock.reinstate') && it.state === 'WRITTEN_OFF') add(T.bReinstate, () => actionDialog({ title: fmt(T.riTitle, { id: it.id }), intro: T.riIntro, action: 'stock.reinstate', fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ id: it.id, reason: v.reason }), ok: r => (r.approvalId ? T.sentForApproval : T.riDone) }));
  add(T.bHistory, () => historyDialog(it.id));
  add(T.bStickerMissing, () => stickerMissingDialog(it.id));
  box.appendChild(A);
  if (active && !unscannable(it) && (has('handover') || has('outside'))) box.appendChild(h('p', { class: 'hint pendrive-hint', text: T.handPendrive }));
  if ((r.approvals || []).length) { box.appendChild(h('h3', { text: T.openApprovals })); box.appendChild(simpleTable([{ k: 'id', l: T.cRef, main: true }, { k: 'type', l: T.cType, fmt: v => lbl('APPR_TYPE', v) }, { k: 'by', l: T.cBy, fmt: userName }, { k: 'at', l: T.cAt, fmt: fmtDT }], r.approvals, has('approve') ? { onRow: a => { closeAllModals(); go('approvals', a.id); } } : {})); }
  box.appendChild(h('h3', { text: T.partsFitted }));
  box.appendChild(simpleTable([{ k: 'partId', l: T.cRef, main: true }, { k: 'type', l: T.cType, fmt: v => lbl('PART_TYPE', v) }, { k: 'spec', l: T.cSpec }, { k: 'serial', l: T.fSerial }, { k: 'status', l: T.fStatus, el: p => pill('PART_STATUS', p.status) }], r.parts || []));
  box.appendChild(h('h3', { text: T.lastMoves }));
  box.appendChild(simpleTable([{ k: 'sentAt', l: T.cAt, v: x => x.sentAt || x.at || '', fmt: fmtDT }, { k: 'kind', l: T.cType, fmt: v => lbl('MOVE_KIND', v) }, { k: 'from', l: T.cFrom, v: x => lbl('LOCATION', x.from) }, { k: 'to', l: T.cTo, v: x => x.partner || lbl('LOCATION', x.to) }, { k: 'sentBy', l: T.cBy, v: x => userName(x.sentBy || x.by) }, { k: 'acceptedBy', l: T.cAcceptedBy, fmt: userName }], r.moves || []));
  if ((it.notes || []).length) { box.appendChild(h('h3', { text: T.fNotes })); const ul = h('ul', { class: 'notes' }); it.notes.forEach(n => ul.appendChild(h('li', { text: typeof n === 'string' ? n : [n.at ? fmtDT(n.at) : '', n.by ? userName(n.by) : '', n.text].filter(Boolean).join(' — ') }))); box.appendChild(ul); }
}
Object.assign(T, { cType: 'Type', cSpec: 'Specification', cFrom: 'From', cTo: 'To', cAcceptedBy: 'Accepted by', cDate: 'Date', fBillNo2: 'Bill no.', fCustomer: 'Customer name', fMobile: 'Mobile number', fPrice: 'Price', fCustWarranty: 'Customer warranty till', fSalesperson: 'Salesperson' });

/* ---------- D2 change status ---------- */
function statusTargets(it) {
  if (Array.isArray(it.allowedStatus)) return it.allowedStatus;
  const s = it.status, rep = role() === 'REPAIR', t = [];
  if ((s === 'UNDER_CHECK' || s === 'NEEDS_REPAIR') && (isMgr() || (rep && it.location === 'REPAIR'))) t.push('READY');
  if (s === 'READY' || s === 'SHOP_USE') t.push('NEEDS_REPAIR'); /* round 1 B5 (R1B-15): a reserved laptop - cancel the reservation first */
  if (s === 'DEALER_RETURN' && isMgr()) t.push('UNDER_CHECK'); /* round 1 B5 (R1B-05): undo a mistaken return to dealer (checked again before Ready) */
  if (s !== 'DEALER_RETURN' && s !== 'RESERVED' && (isMgr() || rep) && (it.source === 'PURCHASE' || it.source === 'REPLACEMENT')) t.push('DEALER_RETURN');
  if (isAdmin() && s === 'READY') t.push('SHOP_USE'); /* owner 26 Nov: shop use is the owner's alone */
  if (isAdmin() && s === 'SHOP_USE') t.push('READY');
  if (isMgr() && s !== 'MISSING') t.push('MISSING');
  return t;
}
function statusDialog(it) {
  const targets = statusTargets(it);
  if (!targets.length) { notify(it.status === 'RESERVED' ? T.stReservedFirst : T.stNone, 'bad'); return; }
  const needText = v => v.status === 'NEEDS_REPAIR' || v.status === 'DEALER_RETURN';
  const undoDr = v => it.status === 'DEALER_RETURN' && v.status === 'UNDER_CHECK';
  const hand = note(T.stHandover, 'warn'); hand.hidden = true;
  const m = actionDialog({ title: fmt(T.stTitle, { id: it.id }), action: 'stock.setStatus', disableUntilChanged: true,
    fields: [{ k: 'cur', l: T.fStatus, t: 'static', dflt: lbl('STATUS', it.status) }, { k: 'status', l: T.stNew, t: 'sel', req: true, placeholder: true, o: opts('STATUS', targets) },
      { k: 'text', l: T.stText, t: 'area', max: 200, req: true, show: needText }, { k: 'userId', l: T.stUser + ' (optional)', t: 'sel', o: () => userOpts(), show: v => v.status === 'SHOP_USE' },
      { k: 'purpose', l: T.stPurpose, req: true, show: v => v.status === 'SHOP_USE' }, { k: 'until', l: T.stUntil + ' (optional)', t: 'date', show: v => v.status === 'SHOP_USE' },
      { k: 'pin', l: T.yourPin, t: 'pin', req: true, show: undoDr, hint: T.stUndoPin }],
    build: v => { const d = { id: it.id, status: v.status }; if (v.text) d.text = v.text; if (undoDr(v)) d.pin = v.pin; /* review F2: undoing a return to dealer is an override */ if (v.status === 'SHOP_USE') d.shopUse = { userId: v.userId, purpose: v.purpose, until: v.until }; return d; },
    ok: r => (r.approvalId ? T.sentForApproval : (r.handoverStarted === 'Y' || r.handoverStarted === true ? T.stSavedHand : T.stSaved)),
    extra: (body, F) => { body.appendChild(hand); F.el.addEventListener('change', () => { hand.hidden = !(it.location === 'SALES' && needText(F.all())); }); } });
  return m;
}
function sendDialog(it, to) { return actionDialog({ title: fmt(T.hsTitle, { to: lbl('SECTION', to), id: it.id }), action: 'handover.sendNoScan', fields: [{ k: 'text', l: T.hsText, t: 'area', max: 200 }], build: v => Object.assign({ id: it.id, to }, v), ok: T.hsDone }); }
function acceptDialog(it) {
  const ck = ['CHARGER', 'SCREEN', 'KEYBOARD', 'BODY'];
  return actionDialog({ title: fmt(T.haTitle, { id: it.id }), intro: T.haIntro, action: 'handover.acceptNoScan', submit: T.bAccept,
    fields: ck.map(c => ({ k: c, l: lbl('CHECK', c), t: 'sel', req: true, o: opts('CHECK_RESULT', ['OK', 'ISSUE']) })).concat(it.sealNo ? [{ k: 'sealNo', l: T.fSeal, req: true }] : []),
    build: v => { const d = { id: it.id, checklist: {} }; ck.forEach(c => { d.checklist[c] = v[c]; }); if (v.sealNo) d.sealNo = v.sealNo; return d; }, ok: T.haDone });
}

/* ---------- D3 edit laptop (only changed fields are sent) ---------- */
function editDialog(it) {
  const mgr = isMgr();
  const fields = specFields(it).concat([{ k: 'touch', l: T.fTouch, t: 'sel', o: opts('TOUCH') }, { k: 'charger', l: T.fCharger, t: 'sel', o: opts('CHARGER') }, { k: 'chargerWatt', l: T.fChargerW, t: 'int', maxv: 400 }, { k: 'sealNo', l: T.fSeal, max: 40 }],
    mgr ? [{ k: 'dealerId', l: T.fDealer, t: 'sel', o: () => dealerOpts() }, { k: 'arrivedOn', l: T.fArrived, t: 'date', maxToday: true }, { k: 'billNo', l: T.fBillNo, max: 40 }, { k: 'billDate', l: T.fBillDate, t: 'date', maxToday: true },
      { k: 'warrantyDays', l: T.fWarrantyDays, t: 'sel', o: warrantyOpts }, { k: 'tagPrice', l: T.fTag, t: 'money' }, { k: 'minPrice', l: T.fMin, t: 'money' }] : [],
    [{ k: 'note', l: T.fNote, t: 'area', max: 300 }, { k: 'reason', l: T.edReason, t: 'area', max: 200, req: it.state === 'SOLD', show: () => it.state === 'SOLD' }]);
  const init = Object.assign({}, it, { warrantyDays: it.warrantyDays == null ? '' : String(it.warrantyDays), note: '' });
  return actionDialog({ title: fmt(T.edTitle, { id: it.id }), wide: true, action: 'stock.edit', fields, init,
    build: (v, F) => {
      const ch = F.changed(), f = {}; let st = false;
      Object.keys(ch).forEach(k => { if (k === 'reason') return; if (/^st[12]/.test(k)) { st = true; return; } f[k] = (k === 'ramGb' || k === 'warrantyDays') && ch[k] !== '' ? Number(ch[k]) : ch[k]; });
      if (st) f.storageParts = storageParts(F.all());
      if (!Object.keys(f).length) { F.dirty = false; notify(T.edNothing, 'ok'); return null; }
      const d = { id: it.id, fields: f }; if (v.reason) d.reason = v.reason; return d;
    } });
}
function stickerMissingDialog(id) { return actionDialog({ title: T.smTitle, intro: T.smIntro, action: 'stock.stickerMissing', fields: [{ k: 'code', l: T.smSerial, t: 'code', req: true, dflt: id }, { k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], build: v => (isSticker(v.code) ? { id: normCode(v.code), note: v.note } : { serial: v.code, note: v.note }), ok: T.smSaved, refresh: false }); }
function historyDialog(id) {
  const m = openModal({ title: fmt(T.histTitle, { id }), wide: true });
  const cols = [{ k: 'at', l: T.cAt, fmt: fmtDT }, { k: 'kind', l: T.hKind, v: e => lbl('HIST_KIND', e.kind) }, { k: 'by', l: T.cBy, v: e => userName(e.by) }, { k: 'text', l: T.hText, main: true }];
  load(m.body, 'stock.history', { id }, (r, box) => { box.appendChild(tools('Laptop_history_' + id, fmt(T.histTitle, { id }), cols, async () => r.events || [])); box.appendChild(simpleTable(cols, r.events || [])); });
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
}
/* Old stock that cannot be scanned (always approval NO_SCAN_ENTRY). */
function oldNoScanDialog(sticker) {
  const fields = [{ k: 'sticker', l: T.onSticker, t: 'code', sticker: 'GJ', req: true, dflt: sticker }].concat(specFields({}, { req: true }), [{ k: 'serial', l: T.fSerial, t: 'code', cam: false, max: 40, noSticker: true },
    { k: 'reason', l: T.unsMode, t: 'sel', req: true, o: opts('SCAN_MODE', ['NO_POWER', 'NO_OS', 'LOCKED', 'UNSUPPORTED']) }, { k: 'lockCode', l: T.unsLock, t: 'sel', req: true, o: opts('UNFIT', ['LOCK_BIOS', 'LOCK_DISK', 'LOCK_ACTIVATION', 'LOCK_MDM', 'LOCK_BITLOCKER']), show: v => v.reason === 'LOCKED' },
    { k: 'dealerId', l: T.fDealer, t: 'sel', req: true, o: () => dealerOpts([{ v: 'D-000', t: T.unknownDealer }]).filter((x, i, a) => a.findIndex(y => y.v === x.v) === i) }, { k: 'arrivedOn', l: T.fArrived, t: 'date', req: true, maxToday: true }, { k: 'billNo', l: T.fBillNo, max: 40 }, { k: 'billDate', l: T.fBillDate, t: 'date', maxToday: true },
    { k: 'warrantyDays', l: T.fWarrantyDays, t: 'sel', o: warrantyOpts }, has('stock.rate') ? { k: 'rate', l: T.fRate, t: 'money', min: 1 } : null,
    { k: 'status', l: T.fStatus, t: 'sel', req: true, o: opts('STATUS', ['READY', 'UNDER_CHECK', 'NEEDS_REPAIR']) }, { k: 'location', l: T.onLocation, t: 'sel', req: true, o: opts('SECTION', ['SALES', 'REPAIR']), dflt: S.me.section || '' },
    /* owner 26 Nov: no charger question - chargers are loose stock */ { k: 'note', l: T.fNote, t: 'area', max: 300 }]);
  return actionDialog({ title: T.onTitle, intro: T.onIntro, wide: true, action: 'stock.oldNoScan', fields, build: v => { const d = stripSpec(v); if (d.warrantyDays != null && d.warrantyDays !== '') d.warrantyDays = Number(d.warrantyDays); else delete d.warrantyDays; return d; } });   /* blank = not known */
}

/* ---------- V5 stock list ---------- */
const STOCK_COLS = () => [{ k: 'id', l: T.fId, main: true }, { k: 'model', l: T.fModel, main: true, v: modelText }, { k: 'cpu', l: T.fCpu }, { k: 'ramSt', l: T.fRamSt, v: ramSt }, { k: 'touch', l: T.fTouch, v: r => lbl('TOUCH', r.touch) },
  { k: 'serial', l: T.fSerial }, { k: 'status', l: T.fStatus, card: true, v: r => lbl('STATUS', r.status), el: r => pill('STATUS', r.status) }, { k: 'lastPendriveBy', l: T.fCheckedBy, v: r => userName(r.lastPendriveBy) }];
VIEWS.stock = {
  title: T.slTitle, perm: () => has('stock.view'),
  render(root, arg) {
    const base = STOCK_COLS();
    const cols = base.concat([{ k: 'scanCycleState', l: T.fScanStatus, v: r => lbl('CYCLE_STATE', r.scanCycleState), el: r => pill('CYCLE_STATE', r.scanCycleState) }, { k: 'location', l: T.fSection, card: true, v: r => lbl('LOCATION', r.location) },
      { k: 'state', l: T.fState, card: true, v: r => lbl('STATE', r.state), el: r => pill('STATE', r.state) }, { k: 'flags', l: T.fFlags, card: true, v: r => (r.flags || []).map(f => lbl('FLAG', f)).join('; '), el: r => chipList('FLAG', r.flags, 'warn') },
      { k: 'ageDays', l: T.fAge, num: true }, { k: 'purchaseRate', l: T.fRate, num: true, fmt: v => (v === '' || v == null ? '' : money(v)), csv: r => (r.purchaseRate == null ? '' : r.purchaseRate), hide: () => !has('cost.view') }]);
    let lv;
    viewHead(root, T.slTitle, [btn(T.slPrint8, async e => { const b8 = e.currentTarget; b8.disabled = true; const rows = await lv.allRows(); b8.disabled = false; printTable(rows.length < lv.total() ? T.slTitle + ' — ' + fmt(T.showing, { x: rows.length, y: lv.total() }) : T.slTitle, base.concat([{ k: 'scanCycleState', l: T.fScanStatus, v: r => lbl('CYCLE_STATE', r.scanCycleState) }]), rows); }, 'sec sm')]);
    lv = listView(root, { action: 'stock.list', name: 'Stock_list', title: T.slTitle, cols, searchPh: T.slSearch, empty: T.slEmpty, onRow: r => openLaptop(r.id),
      filterInit: arg === 'transit' ? { flag: 'IN_TRANSIT' } : {},
      filters: [{ k: 'state', l: T.fState, t: 'sel', o: opts('STATE'), ph: T.slStateDefault }, { k: 'status', l: T.fStatus, t: 'sel', o: opts('STATUS'), ph: T.all }, { k: 'location', l: T.fSection, t: 'sel', o: opts('LOCATION', ['SALES', 'REPAIR', 'OUTSIDE']), ph: T.all },
        { k: 'flag', l: T.slFlag, t: 'sel', o: opts('FLAG', ['IN_TRANSIT', 'UNVERIFIED', 'UNFIT', 'HW_PENDING', 'PENDING', 'NOT_SCANNED', 'MISSING', 'RESERVED', 'EXEMPT']), ph: T.all }, { k: 'brand', l: T.fBrand, t: 'sel', o: () => L().brands || [], ph: T.all },
        has('cost.view') ? { k: 'dealerId', l: T.fDealer, t: 'sel', o: () => dealerOpts(), ph: T.all } : null].filter(Boolean),
      map: p => { if (p.flag) { p.flags = [p.flag]; delete p.flag; } return p; } });
    S.refresh = lv.reload;
    if (arg && arg !== 'transit') openLaptop(normCode(arg));
  }
};

/* ---------- V6 complete stock records ---------- */
function parseDateFlexible(s) {
  s = String(s || '').trim(); let m = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(s), y, mo, d;
  if (m) { y = +m[1]; mo = +m[2]; d = +m[3]; } else { m = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/.exec(s); if (!m) return null; d = +m[1]; mo = +m[2]; y = +m[3]; }
  const dt = new Date(y, mo - 1, d); if (dt.getFullYear() !== y || dt.getMonth() !== mo - 1 || dt.getDate() !== d) return null;
  const iso = y + '-' + String(mo).padStart(2, '0') + '-' + String(d).padStart(2, '0'); return iso > todayISO() ? null : iso;
}
function parseBulkTsv(text) {
  const lines = String(text || '').replace(/\r/g, '').split('\n').filter(l => l.trim() !== '');
  if (!lines.length || !/stock\s*id/i.test(lines[0])) return { error: T.buBadHeader, rows: [] };
  const dealers = L().dealers || [];
  const rows = lines.slice(1).map(line => {
    const c = line.split('\t').map(x => x.trim()); const row = { cells: c, err: {}, data: {} };
    const id = normSticker(c[0], 'GJ'); if (/^GJ-\d{4,}$/.test(id)) row.data.id = id; else row.err[0] = T.eId;
    if (c[1]) { const d = dealers.find(x => String(x.name).toLowerCase() === c[1].toLowerCase()); if (d) row.data.dealerId = d.dealerId; else row.err[1] = T.eDealer; }
    if (c[2]) { const d = parseDateFlexible(c[2]); if (d) row.data.arrivedOn = d; else row.err[2] = T.eDate; }
    if (c[3]) row.data.billNo = c[3].slice(0, 40);
    if (c[4]) { const d = parseDateFlexible(c[4]); if (d) row.data.billDate = d; else row.err[4] = T.eDate; }
    if (c[5]) { const w = /^none$/i.test(c[5]) ? 0 : Number(c[5]); if ([0, 15, 30, 90].indexOf(w) >= 0) row.data.warrantyDays = w; else row.err[5] = T.eWarranty; }
    /* R32C-05: the rate is read like every other money box (pendrive moneyOf): Rs / INR / ₹, spaces and commas are removed, ".00" paise are
       accepted ("21,500.00" from an Accounting / Number cell = 21500); other paise, letters or a second "." are refused */
    if (c[6]) { const n = c[6].replace(/^(rs\.?|inr|₹)\s*/i, '').replace(/[,₹\s]/g, ''), m = /^(\d+)(?:\.(0*))?$/.exec(n); if (m && Number(m[1]) > 0) row.data.rate = Number(m[1]); else row.err[6] = T.eRate; }
    if (c[7]) { const k = c[7].toUpperCase(); const code = Object.keys(C.CHARGER).find(x => x === k || C.CHARGER[x].toUpperCase() === k || C.CHARGER[x].toUpperCase().split(' ')[0] === k) || (/^(NO|NIL)$/.test(k) ? 'NONE' : ''); if (code) row.data.charger = code; else row.err[7] = T.eCharger; }
    if (c[8]) row.data.note = c[8].slice(0, 300);
    row.ok = !Object.keys(row.err).length && Object.keys(row.data).length > 1;
    return row;
  });
  return { rows };
}
VIEWS.bulk = {
  title: T.buTitle, perm: () => has('stock.bulk'),
  render(root) {
    viewHead(root, T.buTitle);
    root.appendChild(h('p', { class: 'intro', text: T.buIntro }));
    const prog = h('div', { class: 'card' }), tabs = h('div', { class: 'tabs', role: 'tablist' }), pane = h('div');
    const replace = mkForm([{ k: 'replace', l: T.buReplace, t: 'check' }]);
    append(root, [prog, replace.el, tabs, pane]);
    const HEAD = [T.fId, T.fDealer, T.fArrived, T.fBillNo, T.fBillDate, T.fWarrantyDays, T.fRate, T.fCharger, T.fNote];
    async function send(rows, b) {
      if (!rows.length) { notify(T.buNoChange, 'ok'); return null; }
      b.disabled = true; let ok = 0, bad = 0; const results = [];
      /* REVP1-10: a part the server finds too large to save safely in one go (SAVE_TOO_LARGE - nothing of it was saved) is sent again in
         halves, down to one laptop: an everyday bulk edit is never refused because of long notes */
      for (let i = 0; i < rows.length;) {
        let n = Math.min(100, rows.length - i), r;
        for (;;) { r = await api('stock.bulkEdit', { rows: rows.slice(i, i + n), replace: replace.val('replace') }); if (r && !r.ok && r.code === 'SAVE_TOO_LARGE' && n > 1) { n = Math.ceil(n / 2); continue; } break; }
        if (!r.ok) { notify(r.msg, 'bad'); b.disabled = false; return null; }
        (r.results || []).forEach(x => { results.push(x); if (x.ok === true || x.ok === 'Y') ok++; else bad++; });
        i += n;
      }
      b.disabled = false; notify(fmt(T.buSavedN, { ok, bad }), bad ? 'warn' : 'ok'); return results;
    }
    const tabInline = () => {
      clear(pane); const edits = {};
      const cols = [{ k: 'id', l: T.fId, main: true }, { k: 'model', l: T.fModel, main: true }, { k: 'missing', l: T.buMissing, v: r => (r.missing || []).map(m => ({ dealer: T.fDealer, arrivedOn: T.fArrived, rate: T.fRate, warrantyDays: T.fWarrantyDays, charger: T.fCharger })[m] || m).join(', ') },
        { k: 'dealerId', l: T.fDealer, el: r => cellInput(r, 'dealerId', 'sel', dealerOpts()) }, { k: 'arrivedOn', l: T.fArrived, el: r => cellInput(r, 'arrivedOn', 'date') }, { k: 'billNo', l: T.fBillNo, el: r => cellInput(r, 'billNo', 'text') },
        { k: 'billDate', l: T.fBillDate, el: r => cellInput(r, 'billDate', 'date') }, { k: 'warrantyDays', l: T.fWarrantyDays, el: r => cellInput(r, 'warrantyDays', 'sel', warrantyOpts()) },
        { k: 'rate', l: T.fRate, el: r => cellInput(r, 'rate', 'num') }]; /* owner 26 Nov: no charger column - chargers are counted as accessories */
      function cellInput(r, k, type, o) {
        const cur = r[k] == null ? '' : String(r[k]); let el;
        if (type === 'sel') { el = h('select', { 'aria-label': k }); el.appendChild(h('option', { value: '', text: T.select })); o.forEach(x => el.appendChild(h('option', { value: x.v, text: x.t }))); el.value = cur; }
        else el = h('input', { type: type === 'date' ? 'date' : 'text', inputmode: type === 'num' ? 'numeric' : null, 'aria-label': k, value: cur, maxlength: 40 });
        el.dataset.k = k; el.dataset.id = r.id;
        el.addEventListener('change', () => { let v = el.value.trim(); if (type === 'num') { v = digits(v); el.value = v; } edits[r.id] = edits[r.id] || { id: r.id }; if (v === cur) delete edits[r.id][k]; else edits[r.id][k] = (k === 'rate' || k === 'warrantyDays') && v !== '' ? Number(v) : v; S.dirty = true; });
        return el;
      }
      const saveB = btn(T.buSaveRows, async () => { const rows = Object.keys(edits).map(k => edits[k]).filter(x => Object.keys(x).length > 1); const res = await send(rows, saveB); if (res) { S.dirty = false; refresh(); } });
      const lv = listView(pane, { action: 'stock.incomplete', name: 'Incomplete_stock', title: T.buTitle, cols, search: false, empty: T.buAllDone, limit: 100,
        onData: r => { clear(prog); const done = Number(r.complete) || 0, N = done + (Number(r.total) || 0); append(prog, [h('b', { id: 'buProgress', text: fmt(T.buProgress, { n: done, N }) }), h('progress', { max: Math.max(1, N), value: done, 'aria-label': T.buTitle })]); } });
      pane.appendChild(h('div', { class: 'btns' }, saveB)); S.refresh = lv.reload;
    };
    const tabPaste = () => {
      clear(pane); S.refresh = null;
      const ta = h('textarea', { id: 'buPasteBox', rows: 8, 'aria-label': T.buPaste, maxlength: 200000, spellcheck: 'false' }), out = h('div');
      const check = btn(T.buCheck, () => {
        clear(out); const p = parseBulkTsv(ta.value);
        if (p.error) { out.appendChild(note(p.error, 'bad')); return; }
        const valid = p.rows.filter(r => r.ok);
        const table = h('table', { class: 'tbl', id: 'buPreview' }); table.appendChild(h('thead', null, h('tr', null, HEAD.concat([T.buResult]).map(x => h('th', { scope: 'col', text: x })))));
        const tb = h('tbody'); p.rows.forEach(r => { const tr = h('tr', { class: r.ok ? '' : 'rowbad' }); HEAD.forEach((x, i) => tr.appendChild(h('td', { class: r.err[i] ? 'cellbad' : '', text: (r.cells[i] || '') + (r.err[i] ? ' — ' + r.err[i] : '') }))); tr.appendChild(h('td', { class: r.ok ? 'cellok' : 'cellbad', text: r.ok ? T.buRowOk : T.buRowErr })); tb.appendChild(tr); });
        table.appendChild(tb); out.appendChild(h('div', { class: 'tblwrap' }, table));
        if (valid.length) { const sb = btn(fmt(T.buSaveValid, { n: valid.length }), async () => {
          const res = await send(valid.map(r => r.data), sb); if (!res) return;
          const bad = res.filter(x => !(x.ok === true || x.ok === 'Y'));
          clear(out); if (bad.length) out.appendChild(simpleTable([{ k: 'id', l: T.fId, main: true }, { k: 'msg', l: T.buResult, v: x => x.msg || x.code || '' }, { k: 'field', l: T.cField }], bad)); else { ta.value = ''; }
          load(clear(prog), 'stock.incomplete', { offset: 0, limit: 1 }, r => { const done = Number(r.complete) || 0, N = done + (Number(r.total) || 0); append(clear(prog), [h('b', { id: 'buProgress', text: fmt(T.buProgress, { n: done, N }) })]); });
        }, '', { id: 'buSaveValid' }); out.appendChild(h('div', { class: 'btns' }, sb)); }
      }, 'sec', { id: 'buCheck' });
      append(pane, [h('p', { class: 'hint', text: T.buPasteHint }), ta, h('div', { class: 'btns' }, check), out]);
    };
    const mk = (text, fn, on) => h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': on ? 'true' : 'false', text, onclick: e => { $$('.tab', tabs).forEach(t => t.setAttribute('aria-selected', 'false')); e.currentTarget.setAttribute('aria-selected', 'true'); fn(); } });
    /* owner 25 Nov: many laptops to another section / status at once (stock.bulkMove) */
    const tabMove = () => {
      clear(pane); clear(prog);
      const f = mkForm([{ k: 'from', l: T.bmFrom, t: 'sel', o: [{ v: 'REPAIR', t: lbl('LOCATION', 'REPAIR') }, { v: 'SALES', t: lbl('LOCATION', 'SALES') }].concat(isAdmin() ? [{ v: 'HOME', t: lbl('LOCATION', 'HOME') }] : []) },
        { k: 'to', l: T.bmTo, t: 'sel', o: [{ v: 'SALES', t: lbl('LOCATION', 'SALES') }, { v: 'REPAIR', t: lbl('LOCATION', 'REPAIR') }].concat(isAdmin() ? [{ v: 'HOME', t: lbl('LOCATION', 'HOME') }] : []) },
        { k: 'status', l: T.bmStatus, t: 'sel', o: [{ v: 'READY', t: lbl('STATUS', 'READY') }, { v: '', t: T.bmKeep }, { v: 'UNDER_CHECK', t: lbl('STATUS', 'UNDER_CHECK') }, { v: 'NEEDS_REPAIR', t: lbl('STATUS', 'NEEDS_REPAIR') }] }], { from: 'REPAIR', to: 'SALES', status: 'READY' }, { onChange: F => { if (F.val('from') !== lastFrom) { lastFrom = F.val('from'); fill(); } } });
      let lastFrom = 'REPAIR';
      const list = h('div', { id: 'bmList' }), out = h('div', { id: 'bmOut' }), picked = new Set();
      const saveB = btn(fmt(T.bmSave, { n: 0 }), async () => {
        if (!picked.size) { notify(T.bmNone, 'warn'); return; }
        saveB.disabled = true; const ids = [...picked], res = []; let ok = 0, bad = 0;
        for (let i = 0; i < ids.length; i += 100) {
          const r = await api('stock.bulkMove', { ids: ids.slice(i, i + 100), to: f.val('to'), status: f.val('status') });
          if (!r.ok) { notify(r.msg, 'bad'); saveB.disabled = false; return; }
          (r.results || []).forEach(x => { res.push(x); if (x.ok) ok++; else bad++; });
        }
        saveB.disabled = false; notify(fmt(T.bmDone, { ok, bad }), bad ? 'warn' : 'ok');
        clear(out); const bads = res.filter(x => !x.ok); if (bads.length) out.appendChild(simpleTable([{ k: 'id', l: T.fId, main: true }, { k: 'msg', l: T.buResult }], bads));
        fill();
      }, '', { id: 'bmSave' });
      const count = () => { saveB.textContent = fmt(T.bmSave, { n: picked.size }); };
      async function fill() {
        clear(list); picked.clear(); count();
        const r = await api('stock.list', { location: f.val('from'), limit: 500 }); if (!r.ok) { list.appendChild(h('p', { class: 'bad', text: r.msg })); return; }
        const rows = (r.rows || []).filter(x => ['READY', 'UNDER_CHECK', 'NEEDS_REPAIR'].indexOf(x.status) >= 0 && !x.transit);
        if (!rows.length) { list.appendChild(h('p', { class: 'muted', text: T.bmEmpty })); return; }
        const boxes = rows.map(x => { const cb = h('input', { type: 'checkbox', 'aria-label': x.id, onchange: e => { if (e.target.checked) picked.add(x.id); else picked.delete(x.id); count(); } });
          return { cb, el: h('label', { class: 'chk' }, cb, h('span', { text: ' ' + x.id + ' - ' + [x.brand, x.model].filter(Boolean).join(' ') + ' (' + lbl('STATUS', x.status) + ')' })) }; });
        const all = h('label', { class: 'chk' }, h('input', { type: 'checkbox', id: 'bmAll', onchange: e => { boxes.forEach(b => { b.cb.checked = e.target.checked; if (e.target.checked) picked.add(b.cb.getAttribute('aria-label')); else picked.delete(b.cb.getAttribute('aria-label')); }); count(); } }), h('b', { text: ' ' + T.bmAll }));
        append(list, [all].concat(boxes.map(b => h('div', null, b.el))));
      }
      append(pane, [h('p', { class: 'hint', text: T.bmIntro }), f.el, list, h('div', { class: 'btns' }, saveB), out]); fill();
    };
    append(tabs, [mk(T.buTitle, tabInline, true), mk(T.buPaste, tabPaste, false), mk(T.bmTab, tabMove, false)]);
    tabInline();
  }
};
Object.assign(T, { cField: 'Field' });

/* ---------- quick fix (owner 26 Nov) ---------- */
Object.assign(C, { QF_WORK: { HINGE: 'Hinge tightening', SCREWS: 'Screws / small fitting', CLEAN: 'Cleaning', KEYBOARD: 'Keyboard key', OTHER: 'Other (describe)' },
  QF_STATUS: { OPEN: 'Waiting for the technician', TAKEN: 'With the technician', DONE: 'Done', CANCELLED: 'Cancelled' } });
Object.assign(T, { bQfix: 'Quick fix', qfTitle: 'Quick fix — {id}', qfIntro: 'A small fix while the customer waits (hinge, screws, cleaning, a key). The laptop stays in Sales; the technician takes it, fixes it and marks it done. It cannot be sold until the fix is done and the laptop is scanned with the pendrive. Changing a part (RAM, SSD, battery …) is not a quick fix — use Parts.',
  qfWork: 'What needs to be done', qfNote: 'Details', qfTo: 'Technician', qfAsked: 'Quick fix asked. {name} has been told.', qfBox: 'Quick fix: {work} — asked by {by} at {at}. {state}', qfWith: 'With {name} since {at}.', qfWaiting: 'Waiting for {name}.',
  bQfTake: 'Take it', bQfDone: 'Fix done', bQfCancel: 'Cancel quick fix', qfTaken: 'Taken. Mark it done when the fix is finished.', qfDoneTitle: 'Quick fix done — {id}', qfDoneNote: 'What was done (optional)',
  qfDone: 'Done. The salesperson has been told — scan the laptop with the pendrive before the sale.', qfCancelTitle: 'Cancel quick fix — {id}', qfCancelled: 'Quick fix cancelled.', qfHome: 'Quick fixes', qfNone: 'No quick fixes.', qfOpen: 'Open laptop' });
function qfixText(q) {
  const work = lbl('QF_WORK', q.work) + (q.note ? ' (' + q.note + ')' : '');
  const state = q.status === 'TAKEN' ? fmt(T.qfWith, { name: q.takenByName, at: fmtDT(q.takenAt) }) : q.status === 'OPEN' ? fmt(T.qfWaiting, { name: q.assignedName }) : lbl('QF_STATUS', q.status);
  return fmt(T.qfBox, { work, by: q.askedByName, at: fmtDT(q.askedAt), state });
}
function qfixButtons(q) {
  const out = [], me = S.me && S.me.userId, live = q.status === 'OPEN' || q.status === 'TAKEN';
  if (!live) return out;
  if (has('qfix.do') && q.status === 'OPEN') out.push(btn(T.bQfTake, e => runAction(e.currentTarget, 'qfix.take', { fixId: q.fixId }, { ok: T.qfTaken }), ''));
  if (has('qfix.do') && (q.status === 'OPEN' || q.takenBy === me || isMgr())) out.push(btn(T.bQfDone, () => actionDialog({ title: fmt(T.qfDoneTitle, { id: q.stockId }), action: 'qfix.done', submit: T.bQfDone,
    fields: [{ k: 'note', l: T.qfDoneNote, t: 'area', max: 200, wide: true }], build: v => ({ fixId: q.fixId, note: v.note }), ok: T.qfDone }), q.status === 'TAKEN' ? '' : 'sec'));
  if (has('qfix.ask') && (q.askedBy === me || isMgr())) out.push(btn(T.bQfCancel, () => actionDialog({ title: fmt(T.qfCancelTitle, { id: q.stockId }), action: 'qfix.cancel', submit: T.bQfCancel,
    fields: [{ k: 'reason', l: T.fReason, max: 200, wide: true }], build: v => ({ fixId: q.fixId, reason: v.reason }), ok: T.qfCancelled }), 'sec'));
  return out;
}
function qfixAskDialog(it) {
  const techs = (L().technicians || []).map(u => ({ v: u.userId, t: u.name }));
  return actionDialog({ title: fmt(T.qfTitle, { id: it.id }), intro: T.qfIntro, action: 'qfix.ask', submit: T.bQfix,
    fields: [{ k: 'work', l: T.qfWork, t: 'sel', req: true, o: opts('QF_WORK') }, { k: 'note', l: T.qfNote, max: 200, wide: true },
      { k: 'to', l: T.qfTo, t: 'sel', req: true, o: techs }],
    build: v => ({ id: it.id, work: v.work, note: v.note, to: v.to }), ok: r => fmt(T.qfAsked, { name: (r.fix && r.fix.assignedName) || '' }) });
}
