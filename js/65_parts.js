/* GJ App v4 — V14 parts, V15 accessories. */
'use strict';
Object.assign(C, { ACC_GROUP: { KIT: 'Standard kit item', ACCESSORY: 'Accessory' }, PART_MOVE: { RECEIVED: 'Received', FITTED: 'Fitted', UNDONE: 'Fitting undone', PULLED: 'Pulled', FAULTY: 'Marked faulty', TO_DEALER: 'Sent to dealer', DEALER_CLOSED: 'Dealer return closed', IN_STOCK: 'Back in stock', SOLD: 'Sold', EDITED: 'Edited' } });
Object.assign(T, {
  ptTitle: 'Parts', ptSearch: 'Part ID, serial number or specification', ptEmpty: 'No parts match.', ptSummary: 'In stock by type and specification', ptInStock: 'In stock', ptReorder: 'Reorder level', ptLow: 'Low stock', ptOkStock: 'Enough', ptId: 'Part',
  ptTarget: 'Fitted in', ptReceived: 'Received on', ptSource: 'Source', ptCard: 'Part {id}', ptMoves: 'Movements', ptAddNoPo: 'Add part without PO', ptAddIntro: 'A part added without a purchase order needs approval. The approver enters the rate.',
  ptFit: 'Fit into laptop / job', ptFitTitle: 'Fit part', ptFitCode: 'Part ID or part serial number', ptFitTarget: 'Laptop or job (GJ / RJ)', ptFitted: 'Part fitted. Scan the laptop with the pendrive so the change is recorded.', ptUndo: 'Undo fitting', ptUndone: 'Fitting undone. The part is back in stock.',
  ptFaulty: 'Mark faulty', ptFaultyNote: 'What is wrong with the part', ptToDealer: 'Return to dealer', ptDealerClose: 'Close dealer return', ptOutcome: 'Outcome', ptCreditNote: 'Credit note no.', ptBack: 'Back to stock', ptSell: 'Sell loose part', ptEdit: 'Edit part',
  ptPullTitle: 'Pull part from {id}', ptPullIntro: 'Record a part taken out of a laptop or job. It is added to parts stock.', ptPullFrom: 'Taken from (GJ / RJ)', ptPulled: 'Part {id} added to stock.', ptNoSerial: 'This part has no serial number', ptNotFound: 'No part found for "{code}".',
  acTitle: 'Accessories', acItem: 'Item', acGroup: 'Group', acBalance: 'In stock', acReorder: 'Reorder level', acActive: 'Active', acRate: 'Rate', acEmpty: 'No accessory items yet.', acIssue: 'Issue', acIssueTitle: 'Issue accessory', acQty: 'Quantity', acReason: 'Reason',
  acRef: 'Reference (bill no. or customer; Sale or Stock ID only for an item given with a laptop; job number for a repair)', acPrice: 'Price (each)', acIssued: 'Issued. Balance now {n}.', acWriteOff: 'Request write-off', acWriteOffTitle: 'Accessory write-off', acAdjust: 'Adjust count', acAdjustTitle: 'Count correction',
  acAdjustIntro: 'A correction by the manager needs approval by the owner.', acItemNew: '+ New item', acItemTitle: 'Accessory item', acRecent: 'Recent changes', acRecentNone: 'No changes yet.', acWeekly: 'Weekly count', acBalanceNow: 'Saved. Balance now {n}.', acInactive: 'Not active'
});
const partTypeOpts = () => (L().partTypes && L().partTypes.length ? L().partTypes.map(c => ({ v: c, t: lbl('PART_TYPE', c) })) : opts('PART_TYPE'));

VIEWS.parts = {
  title: T.ptTitle, perm: () => has('parts.view') || has('parts'),
  render(root) {
    viewHead(root, T.ptTitle, [has('parts') ? btn(T.jbFit, () => fitPartDialog(''), '', { id: 'partFit' }) : null, has('parts') ? btn(T.jbPull, () => pullPartDialog(''), 'sec') : null,
      has('receive') || has('parts.manage') ? btn(T.ptAddNoPo, addNoPoDialog, 'sec', { id: 'partAdd' }) : null]);   /* decision D1 */
    const sumBox = h('div', { class: 'card' }); root.appendChild(sumBox);
    const lv = listView(root, { action: 'parts.list', name: 'Parts', title: T.ptTitle, searchPh: T.ptSearch, empty: T.ptEmpty, onRow: p => openPart(p.partId),
      filters: [{ k: 'status', l: T.fStatus, t: 'sel', o: opts('PART_STATUS'), ph: T.all, dflt: 'IN_STOCK' }, { k: 'type', l: T.cType, t: 'sel', o: partTypeOpts, ph: T.all }], filterInit: { status: 'IN_STOCK' },
      onData: r => { clear(sumBox); sumBox.appendChild(h('h2', { text: T.ptSummary })); sumBox.appendChild(simpleTable([{ k: 'type', l: T.cType, main: true, v: s => lbl('PART_TYPE', s.type) }, { k: 'spec', l: T.cSpec, main: true }, { k: 'inStock', l: T.ptInStock, num: true }, { k: 'reorder', l: T.ptReorder, num: true },
        { k: 'flag', l: T.fStatus, el: s => (s.reorder != null && s.reorder !== '' && Number(s.inStock) <= Number(s.reorder) ? h('span', { class: 'pill bad', text: T.ptLow }) : h('span', { class: 'pill good', text: T.ptOkStock })) }], r.summary || [])); },
      cols: [{ k: 'partId', l: T.ptId, main: true }, { k: 'type', l: T.cType, v: p => lbl('PART_TYPE', p.type) }, { k: 'spec', l: T.cSpec, main: true }, { k: 'serial', l: T.fSerial }, { k: 'status', l: T.fStatus, v: p => lbl('PART_STATUS', p.status), el: p => pill('PART_STATUS', p.status) }, { k: 'target', l: T.ptTarget },
        { k: 'receivedOn', l: T.ptReceived, v: p => p.receivedOn || p.addedAt || '', fmt: v => (v ? fmtDate(v) : '') }, { k: 'dealerName', l: T.fDealer, hide: () => !has('cost.view') }, { k: 'rate', l: T.acRate, num: true, fmt: v => (v == null || v === '' ? '' : money(v)), csv: p => p.rate, hide: () => !has('cost.view') }] });
    S.refresh = lv.reload;
  }
};
function addNoPoDialog() {
  return actionDialog({ title: T.ptAddNoPo, intro: T.ptAddIntro, action: 'receive.part',
    fields: [{ k: 'dealerId', l: T.fDealer, t: 'sel', req: true, o: () => dealerOpts() }, { k: 'type', l: T.lnPartType, t: 'sel', req: true, o: partTypeOpts }, { k: 'spec', l: T.lnSpec, req: true, max: 60 }, { k: 'serial', l: T.fSerial, t: 'code', max: 40, noSticker: true, show: v => v.noSerial !== 'Y' },
      { k: 'noSerial', l: T.ptNoSerial, t: 'check' }, { k: 'note', l: T.fNote, t: 'area', max: 300 }], validate: v => (v.noSerial !== 'Y' && !v.serial ? fmt(T.required, { field: T.fSerial }) : ''),
    build: v => { const d = Object.assign({}, v); if (v.noSerial !== 'Y') delete d.noSerial; return d; }, ok: r => fmt(T.rcPartSaved, { id: r.partId, serial: r.serial }) + (r.approvalId ? ' ' + T.sentForApproval : '') });
}
/* Fit: the part is found by ID or serial first (scanner + Enter works in both boxes). */
function fitPartDialog(target, partCode) {
  return actionDialog({ title: T.ptFitTitle, init: { target, code: partCode || '' }, submit: T.jbFit,
    fields: [{ k: 'code', l: T.ptFitCode, t: 'code', req: true, max: 40, ro: !!partCode }, { k: 'target', l: T.ptFitTarget, t: 'code', req: true, ro: !!target }],
    run: async d => { const g = await api('parts.get', { code: d.code }); if (!g.ok) return g; if (!g.part) return { ok: false, msg: fmt(T.ptNotFound, { code: d.code }), field: 'code' }; return callConfirmed('parts.fit', { partId: g.part.partId, target: d.target }); }, ok: T.ptFitted });
}
function pullPartDialog(target) {
  return actionDialog({ title: fmt(T.ptPullTitle, { id: target || '…' }), intro: T.ptPullIntro, action: 'parts.pull', init: { target },
    fields: [{ k: 'target', l: T.ptPullFrom, t: 'code', req: true, ro: !!target }, { k: 'type', l: T.lnPartType, t: 'sel', req: true, o: partTypeOpts }, { k: 'spec', l: T.lnSpec, req: true, max: 60 }, { k: 'serial', l: T.fSerial, t: 'code', max: 40, noSticker: true, show: v => v.noSerial !== 'Y' },
      { k: 'noSerial', l: T.ptNoSerial, t: 'check' }, { k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], validate: v => (v.noSerial !== 'Y' && !v.serial ? fmt(T.required, { field: T.fSerial }) : ''),
    build: v => { const d = Object.assign({}, v); if (v.noSerial !== 'Y') delete d.noSerial; return d; }, ok: r => fmt(T.ptPulled, { id: r.partId }) });
}
function openPart(code) {
  const m = openModal({ title: fmt(T.ptCard, { id: code }), wide: true });
  m.reload = load(m.body, 'parts.get', { code }, (r, box) => {
    const p = r.part || {}, st = p.status, mg = has('parts.manage'), can = has('parts');
    m.titleEl.textContent = fmt(T.ptCard, { id: p.partId || code });
    box.appendChild(h('div', { class: 'chips' }, pill('PART_STATUS', st)));
    box.appendChild(h('div', { class: 'card' }, kv([[T.cType, lbl('PART_TYPE', p.type)], [T.cSpec, p.spec], [T.fSerial, p.serial], [T.ptTarget, p.target], [T.ptReceived, p.receivedOn || p.addedAt ? fmtDate(p.receivedOn || p.addedAt) : ''], [T.ptSource, p.source], [T.fDealer, p.dealerName], [T.fPo, p.poNo], [T.acRate, p.rate != null && p.rate !== '' ? money(p.rate) : '']])));
    const A = h('div', { class: 'btns', id: 'partActions' }), id = p.partId;
    const dlg = (text, o, cls) => A.appendChild(btn(text, () => actionDialog(o), cls || 'sec'));
    if (can && st === 'IN_STOCK') A.appendChild(btn(T.ptFit, () => fitPartDialog('', id), ''));
    if (can && st === 'FITTED') dlg(T.ptUndo, { title: T.ptUndo, action: 'parts.undoFit', fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ partId: id, reason: v.reason }), ok: T.ptUndone });
    if (can && (st === 'IN_STOCK' || st === 'FITTED')) dlg(T.ptFaulty, { title: T.ptFaulty, action: 'parts.markFaulty', fields: [{ k: 'note', l: T.ptFaultyNote, t: 'area', req: true, max: 300 }], build: v => ({ partId: id, note: v.note }) });
    if (mg && st === 'FAULTY') dlg(T.ptToDealer, { title: T.ptToDealer, action: 'parts.toDealer', fields: [{ k: 'tracking', l: T.ouTracking, req: true, max: 60 }], build: v => ({ partId: id, tracking: v.tracking }) });
    if (mg && st === 'FAULTY') dlg(T.ptScrap, { title: T.ptScrap, intro: T.ptScrapIntro, action: 'parts.scrap', pin: true, danger: true, fields: [{ k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], build: v => ({ partId: id, note: v.note, pin: v.pin }) });
    if (mg && st === 'AT_DEALER') dlg(T.ptDealerClose, { title: T.ptDealerClose, action: 'parts.dealerClose', fields: [{ k: 'outcome', l: T.ptOutcome, t: 'sel', req: true, o: opts('PART_CLOSE') }, { k: 'creditNote', l: T.ptCreditNote, max: 40, show: v => v.outcome === 'CREDITED' }], build: v => Object.assign({ partId: id }, v) });
    if (mg && (st === 'FAULTY' || st === 'FITTED')) dlg(T.ptBack, { title: T.ptBack, action: 'parts.markInStock', fields: [{ k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], build: v => ({ partId: id, note: v.note }) });
    if ((has('parts.sell') || mg) && st === 'IN_STOCK') dlg(T.ptSell, { title: T.ptSell, action: 'parts.sell', fields: [{ k: 'billNo', l: T.seBill, req: true, max: 40 }, { k: 'price', l: T.fPrice, t: 'money', req: true, min: 1 }, { k: 'payMode', l: T.sePay, t: 'sel', req: true, placeholder: true, o: payOpts1 }], build: v => Object.assign({ partId: id }, v) });
    if (mg) dlg(T.ptEdit, { title: T.ptEdit, action: 'parts.edit', init: p, fields: [{ k: 'type', l: T.lnPartType, t: 'sel', o: partTypeOpts }, { k: 'spec', l: T.lnSpec, max: 60 }, { k: 'serial', l: T.fSerial, t: 'code', cam: false, max: 40, noSticker: true }, { k: 'rate', l: T.acRate, t: 'money' }, { k: 'dealerId', l: T.fDealer, t: 'sel', o: () => dealerOpts() }],
      build: (v, F) => { const ch = F.changed(); if (!Object.keys(ch).length) { notify(T.edNothing, 'ok'); return null; } return Object.assign({ partId: id }, ch); } });
    box.appendChild(A);
    box.appendChild(h('h3', { text: T.ptMoves }));
    box.appendChild(simpleTable([{ k: 'at', l: T.cAt, v: x => x.at || x.time || '', fmt: fmtDT }, { k: 'kind', l: T.cAction, v: x => lbl('PART_MOVE', x.action || x.kind || x.event) }, { k: 'target', l: T.ptTarget, main: true }, { k: 'by', l: T.cBy, fmt: userName }, { k: 'note', l: T.fNote }], r.moves || []));
  });
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
  return m;
}

/* ---------- V15 accessories ---------- */
VIEWS.acc = {
  title: T.acTitle, perm: () => has('acc'),
  render(root) {
    const mg = has('acc.manage'), cost = has('cost.view');
    const itemSel = () => ({ k: 'itemId', l: T.acItem, t: 'sel', req: true, o: accItemOpts });
    const balOk = r => (r.approvalId ? T.sentForApproval : fmt(T.acBalanceNow, { n: r.balance }));
    viewHead(root, T.acTitle, [
      btn(T.acIssue, () => actionDialog({ title: T.acIssueTitle, action: 'acc.issue', fields: [itemSel(), { k: 'qty', l: T.acQty, t: 'int', req: true, min: 1, maxv: 50, dflt: 1 }, { k: 'reason', l: T.acReason, t: 'sel', req: true, o: opts('ACC_REASON', ['SOLD', 'WITH_LAPTOP', 'USED_IN_REPAIR']) },
        { k: 'ref', l: T.acRef, t: 'code', cam: false, req: true, max: 40, wide: true }, { k: 'price', l: T.acPrice, t: 'money', req: true, min: 1, show: v => v.reason === 'SOLD' }, { k: 'payMode', l: T.sePay, t: 'sel', req: true, o: payOpts, show: v => v.reason === 'SOLD' }], ok: r => fmt(T.acIssued, { n: r.balance }), after: reloadLists }), '', { id: 'accIssue' }),
      btn(T.acWriteOff, () => actionDialog({ title: T.acWriteOffTitle, action: 'acc.writeOff', fields: [itemSel(), { k: 'qty', l: T.acQty, t: 'int', req: true, min: 1, maxv: 500 }, { k: 'reason', l: T.acReason, t: 'sel', req: true, o: opts('ACC_REASON', ['DAMAGED', 'SHOP_USE']) }, { k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], ok: balOk }), 'sec', { id: 'accWriteOff' }),
      mg ? btn(T.acAdjust, () => actionDialog({ title: T.acAdjustTitle, intro: isAdmin() ? '' : T.acAdjustIntro, action: 'acc.adjust', fields: [itemSel(), { k: 'qty', l: T.acQty, t: 'int', req: true, min: 1, maxv: 9999 }, { k: 'reason', l: T.acReason, t: 'sel', req: true, o: opts('ACC_REASON', ['OPENING', 'ADJUST_PLUS', 'ADJUST_MINUS']) }, { k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], ok: balOk }), 'sec', { id: 'accAdjust' }) : null,
      mg ? btn(T.acItemNew, () => itemDialog(null), 'sec', { id: 'accItemNew' }) : null, has('count') ? btn(T.acWeekly, () => go('count', 'ACCESSORY'), 'sec') : null]);
    function itemDialog(it) { return actionDialog({ title: T.acItemTitle, action: 'acc.itemSave', init: it ? Object.assign({}, it, { reorderLevel: it.reorder, active: it.active === 'N' || it.active === false ? 'N' : 'Y' }) : { active: 'Y' },
      fields: [{ k: 'item', l: T.acItem, req: true, max: 60 }, { k: 'group', l: T.acGroup, t: 'sel', req: true, o: opts('ACC_GROUP'), dflt: 'KIT' }, { k: 'reorderLevel', l: T.acReorder, t: 'int', maxv: 9999 }, { k: 'rate', l: T.acRate, t: 'money' }, { k: 'active', l: T.acActive, t: 'check' }], build: v => Object.assign(it ? { itemId: it.itemId } : {}, v), after: reloadLists }); }
    const cols = [{ k: 'item', l: T.acItem, main: true }, { k: 'group', l: T.acGroup }, { k: 'balance', l: T.acBalance, num: true }, { k: 'reorder', l: T.acReorder, num: true },
      { k: 'flag', l: T.fStatus, v: a => (a.active === 'N' || a.active === false ? T.acInactive : (a.reorder != null && a.reorder !== '' && Number(a.balance) <= Number(a.reorder) ? T.ptLow : T.ptOkStock)), el: a => (a.active === 'N' || a.active === false ? h('span', { class: 'pill plain', text: T.acInactive }) : (a.reorder != null && a.reorder !== '' && Number(a.balance) <= Number(a.reorder) ? h('span', { class: 'pill bad', text: T.ptLow }) : h('span', { class: 'pill good', text: T.ptOkStock }))) },
      cost ? { k: 'rate', l: T.acRate, num: true, fmt: v => (v == null || v === '' ? '' : money(v)), csv: a => a.rate } : null].filter(Boolean);
    const rcols = [{ k: 'at', l: T.cAt, v: x => x.at || x.time || '', fmt: fmtDT }, { k: 'item', l: T.acItem, main: true, v: x => x.item || accName(x.itemId) }, { k: 'qty', l: T.acQty, num: true }, { k: 'reason', l: T.acReason, v: x => lbl('ACC_REASON', x.reason) }, { k: 'ref', l: T.cRef }, { k: 'by', l: T.cBy, v: x => userName(x.by) }];
    S.refresh = load(root, 'acc.list', {}, (r, box) => {
      box.appendChild(tools('Accessories', T.acTitle, cols, async () => r.items || []));
      box.appendChild(simpleTable(cols, r.items || [], { empty: T.acEmpty, onRow: mg ? itemDialog : null }));
      box.appendChild(h('h2', { text: T.acRecent })); box.appendChild(simpleTable(rcols, r.recent || [], { empty: T.acRecentNone }));
    });
  }
};
