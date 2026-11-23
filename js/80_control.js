/* GJ App v4 — V19 approvals, V20 alerts and incidents, V21 dashboard. */
'use strict';
Object.assign(C, {
  APPR_INPUT: { rate: 'Purchase rate', dealerId: 'Dealer', billNo: 'Dealer bill no.', billDate: 'Dealer bill date', warrantyDays: 'Dealer warranty', value: 'Exchange / buyback value', payMode: 'Payment mode', payee: 'Paid to', refund: 'Refund amount', refundMode: 'Refund mode', pairCode: 'Pairing code shown on the new device', replaceDeviceId: 'Replace this existing device', tagPrice: 'Tag price', minPrice: 'Minimum price', allowedUsers: 'Users allowed on this device', label: 'Device name', amount: 'Amount received for the laptop', extrasBack: 'Accessories sold on this bill came back', kitBack: 'Free kit items that came back with the laptop - tick each one; an item not ticked is recorded as not returned' },
  REC_FIELD: { id: 'Stock ID', brand: 'Brand', model: 'Model', cpu: 'Processor', ramGb: 'RAM (GB)', storage: 'Storage', serial: 'Serial No.', status: 'Status', state: 'State', location: 'Section', scanMode: 'Scan mode', source: 'Source', charger: 'Charger', sticker: 'Sticker', dealerName: 'Dealer', poNo: 'Purchase order', line: 'PO line', arrivedOn: 'Arrival date', billNo: 'Bill no.', billDate: 'Bill date', warrantyDays: 'Dealer warranty (days)', purchaseRate: 'Purchase rate', rate: 'Rate', price: 'Price', minPrice: 'Minimum price', tagPrice: 'Tag price', customer: 'Customer', mobile: 'Mobile number', reason: 'Reason', note: 'Note', kind: 'Kind', qty: 'Quantity', item: 'Item', battHealth: 'Battery health (%)', diskLife: 'Disk life (%)', unfitCodes: 'Unfit codes', lockCodes: 'Lock codes', label: 'Device name', agent: 'Browser', deviceKind: 'Device kind', requestedBy: 'Requested by', usbSerial: 'USB serial', jobId: 'Job', partner: 'Partner', work: 'Work', seller: 'Seller', idType: 'ID type', idLast4: 'ID last 4 digits', declaration: 'Declaration confirmed', originalBill: 'Original bill', mode: 'Mode', lockCode: 'Lock type', type: 'Type', spec: 'Specification', saleId: 'Sale', refundMax: 'Sale price', fitLevel: 'Fit level', ram: 'RAM modules', disks: 'Disks', battery: 'Battery', screen: 'Screen', activation: 'Windows activation', lastScan: 'Last scan', partsUsed: 'Parts used', text: 'Details' },
  REC_CODE: { status: 'STATUS', state: 'STATE', location: 'LOCATION', scanMode: 'SCAN_MODE', source: 'SOURCE', charger: 'CHARGER', mode: 'SCAN_MODE', lockCode: 'UNFIT', idType: 'ID_TYPE', deviceKind: 'DEVICE_KIND', fitLevel: 'FIT', declaration: 'YN', originalBill: 'YN', activation: 'ACTIVATION' },
  ACTIVATION: { ACTIVATED: 'Activated', KMS: 'Activated by KMS (temporary)', NOT_ACTIVATED: 'Not activated', UNKNOWN: 'Not known', NA: 'Not applicable (macOS)' }
});
/* R46A-05: request details and the hardware table in words - no internal codes, no true / false. Field codes with a known list; any other
   CODE_WITH_UNDERSCORES is looked up in the app's label lists (REC_CODE_ANY, first match), else spelled out. Hardware snapshot keys named. */
Object.assign(C.REC_CODE, { kind: 'WRITEOFF', entry: 'SOURCE', result: 'RECEIPT', touch: 'TOUCH', act: 'ACTIVATION' });
Object.assign(C.REC_FIELD, { b: 'Battery', r: 'RAM modules', d: 'Disks', scr: 'Screen', act: 'Windows activation', touch: 'Touch', present: 'Present', sn: 'Serial No.', design: 'Design capacity (mWh)' });
const REC_CODE_ANY = ['SCAN_MODE', 'WRITEOFF', 'ACC_REASON', 'RECEIPT', 'SOURCE', 'TOUCH', 'UNFIT', 'PROBLEM', 'ZERO_REASON', 'OUT_REASON', 'NOSCAN_REASON', 'APPR_TYPE', 'STATUS', 'LOCATION', 'PAY', 'ACTIVATION', 'HW_DIFF'];
function recCode(group, v, k) {
  const s = String(v);
  if (!group && /serial|^sn$|Sn$|id$|Id$|No$|code$|Code$|hash|Hash|usb|Usb|sticker|label|bill|Bill/.test(k || '')) return s; /* identifiers stay as typed */
  if (group && C[group] && Object.prototype.hasOwnProperty.call(C[group], s)) return C[group][s];
  if (!/^[A-Z][A-Z0-9]*(_[A-Z0-9]+)+$/.test(s)) return group ? lbl(group, s) : s;
  const g = REC_CODE_ANY.find(x => C[x] && Object.prototype.hasOwnProperty.call(C[x], s));
  return g ? C[g][s] : humanCode(s);
}
/* round 32: approving a device asks who may sign in on it - an explicit choice, never "all staff" because a box was left empty */
Object.assign(T, { apAllowScope: 'Who may sign in on this device', apAllowAll: 'All staff', apAllowList: 'Only the people ticked below',
  apAllowNoList: 'The staff list could not be loaded, so nobody can be ticked. Reload the page, or choose "All staff" if that is what you want.' });
Object.assign(T, {
  apTitle: 'Approvals', apEmpty: 'Nothing is waiting for approval.', apId: 'Request', apType: 'Type', apRef: 'Reference', apSummary: 'Summary', apBy: 'Requested by', apAge: 'Waiting (working hours)', apDown: 'Downgrade', apDownHint: 'Shows a downgrade — open it individually',
  apPendriveCheck: 'Compare the pairing code and the USB serial with the screen of the pendrive in front of you.', apOwn: 'Waiting for the owner', apOwnerOnly: 'Only the owner can decide', apSelect: 'Select', apApproveSel: 'Approve selected', apSelNone: 'Tick the requests to approve.', apSelOld: 'Select all old stock', apSelOldDone: '{n} old-stock entries selected. Press "Approve selected" and enter your PIN once.', apBulkTitle: 'Approve {n} selected requests', apBulkDone: '{ok} approved, {bad} not approved.',
  apCard: 'Request {id}', apRecord: 'Record', apDiff: 'Differences', apDiffItem: 'Item', apDiffDir: 'Direction', apDiffFrom: 'Before', apDiffTo: 'Now', apSnap: 'Hardware: last accepted and this scan', apSnapField: 'Field', apLatest: 'Last accepted', apCandidate: 'This scan',
  apPhotos: 'Photos', apPhotoMissing: 'Photo missing', apPhotoOk: 'Photo on file', apRates: 'Reference rates of this model', apAvg: 'Average purchase rate', apLast: 'Last purchase rate', apInputs: 'To be filled in by the approver', apOutcome: 'What happens to the laptop',
  apNote: 'Note (required when rejecting)', apApprove: 'Approve', apReject: 'Reject', apDecide: 'Decide', apNoteNeeded: 'Enter a note explaining the rejection.', apApproved: 'Approved.', apRejected: 'Rejected.', apDecided: 'Decision saved.', apStatus: 'Status', apNoReplace: 'New device (do not replace)',
  alTitle: 'Alerts', alTabAlerts: 'Alerts', alTabIncidents: 'Incidents', alUnread: '{n} unread', alEmpty: 'No alerts.', alId: 'Alert', alSubject: 'Subject', alSeverity: 'Severity', alSeen: 'Last seen', alCount: 'Times', alToday: 'Today only', alMine: 'Mine only', alType: 'Type code',
  alCard: 'Alert {id}', alAck: 'Acknowledge', alAckAll: 'Acknowledge all of this type', alAckAllAsk: 'Acknowledge every open alert of the type {type}?', alAckedAll: '{n} alerts acknowledged.', alNetAdd: 'This is a shop network', alNetAddTitle: 'Add the shop network', alNetAddIntro: 'Scans made on this network will count for the scan rules. Add it only if it is a network of the shop (new router, second access point).', alNetAdded: 'Network added. Scan the laptops again on it.', alNetAsked: 'The owner has been asked to add this network.', alAckNote: 'Note', alAcked: 'Alert acknowledged.', alOpenItem: 'Open {ref}', alNotFound: 'Alert {id} was not found. It may be resolved already.', alAckBy: 'Acknowledged by',
  inEmpty: 'No incidents.', inId: 'Incident', inResolve: 'Resolve', inResolveTitle: 'Resolve incident {id}', inResolved: 'Incident resolved.', inOpenOnly: 'Open',
  dsTitle: 'Dashboard', dsSales: 'Sales', dsRepair: 'Repair', dsTransit: 'In transit', dsOutside: 'Outside', dsPending: 'Awaiting approval', dsDealerReturn: 'Rejected — to return', dsPickup: 'Awaiting pickup', dsExpected: 'Laptops physically expected: {n}',
  apExchange: 'Exchange entry', apRequest: 'Request details',
  dsAlerts: 'Open alerts', dsCycle: 'Current scan cycle', dsCounts: 'Counts today', dsApprovals: 'Pending approvals', dsUnconfirmed: 'Unconfirmed sales', dsNoCounts: 'No count started today.', dsSection: 'Section'
});

const STOCK_OUTCOME_TYPES = ['PO_MISMATCH', 'PO_EXTRA', 'SERIAL_NOT_ON_PO', 'UNFIT_ACCEPT'];
function recValue(k, v) {
  if (v == null || v === '') return '';
  if (v === true || v === false) return lbl('YN', v ? 'Y' : 'N'); /* R46A-05 */
  if (Array.isArray(v)) return v.map(x => (typeof x === 'object' ? Object.keys(x).map(y => x[y]).join(' ') : (/Codes$/.test(k) ? lbl('UNFIT', x) : recCode('', x)))).join(', ');
  if (typeof v === 'object') return Object.keys(v).map(y => (C.REC_FIELD[y] || humanCode(y)) + ': ' + recValue(y, v[y])).join('; ');
  if (C.REC_CODE[k]) return recCode(C.REC_CODE[k], v);
  if (/(Rate|rate|price|Price|value|Value|refundMax|advance)$/.test(k) && /^\d+$/.test(String(v))) return money(v);
  if (/(On|Date|Till)$/.test(k) && /^\d{4}-\d{2}-\d{2}/.test(String(v))) return fmtDT(v);
  if (/By$/.test(k)) return userName(v);
  return recCode('', v, k); /* R46A-05 */
}
const isMine = v => !!S.me && (v === S.me.userId || v === S.me.name);   /* server sends user NAMES in by / sentBy */
/* approvals.get adapter: the server puts inputs / outcomes / record / refRates / photos / replaceable on the approval, the raw request data in details */
function apprDetails(a) {
  const det = a.details || {}, d = {};
  d.record = a.record ? (({ id, brand, model, cpu, ramGb, storage, serial, status, state, location, source, dealerName, poNo, purchaseRate, arrivedOn, warrantyTill, battHealth, diskLife, fitLevel, unfitCodes, lockCodes }) => ({ id, brand, model, cpu, ramGb, storage, serial, status, state, location, source, dealerName, poNo, purchaseRate, arrivedOn, warrantyTill, battHealth, diskLife, fitLevel, unfitCodes, lockCodes }))(a.record) : (a.device || a.exchange || (det.record || null));
  if (a.exchange && a.record) d.exchange = a.exchange;
  const pdHw = det.hw && typeof det.hw === 'object' && !Array.isArray(det.hw) ? det.hw : null;
  d.request = Object.keys(det).filter(k => ['candidate', 'latest', 'diffs', 'differences', 'inputs', 'outcomes', 'sale', 'f', 'exitSnap', 'fit', 'ids', 'snap', 'lastSnapshot'].indexOf(k) < 0 && typeof det[k] !== 'object').reduce((o, k) => { o[k] = det[k]; return o; }, {});
  d.differences = det.differences || (det.diffs || []).map(x => ({ code: x.code, dir: x.dir, from: x.from != null ? x.from : '', to: x.to != null ? x.to : (x.text || '') }));
  if (pdHw) ['usb', 'vol', 'bus', 'os', 'usbVendor', 'usbProduct', 'exeHash', 'agent'].forEach(k => { if (pdHw[k] != null && pdHw[k] !== '') d.request['pendrive' + k.charAt(0).toUpperCase() + k.slice(1)] = k === 'exeHash' ? String(pdHw[k]).slice(0, 12) : pdHw[k]; });
  if (a.type === 'DEVICE' && (det.kind === 'PENDRIVE' || pdHw)) d.pendriveCheck = true;
  d.candidate = det.candidate; d.latest = det.latest;
  d.inputs = a.inputs || det.inputs || []; d.values = a.values || det.values || {}; d.outcomes = a.outcomes && a.outcomes.length ? a.outcomes : det.outcomes;
  if (a.photos && !Array.isArray(a.photos)) d.photos = [{ kind: 'ID_PHOTO', fileId: a.photos.id }, { kind: 'SELLER_PHOTO', fileId: a.photos.seller }]; else if (a.photos) d.photos = a.photos;
  if (a.refRates || det.referenceRates) { const x = a.refRates || det.referenceRates; d.referenceRates = { avg: x.avg != null ? x.avg : x.avgRate, last: x.last != null ? x.last : x.lastRate }; }
  d.replaceable = a.replaceable || det.replaceable || [];
  d.kit = Array.isArray(a.kit) ? a.kit : []; d.extras = Array.isArray(a.extras) ? a.extras : undefined; /* R63A-06: the free kit of a customer return (tick boxes); the paid accessories are named in their question */
  return d;
}
const recPairs = o => Object.keys(o || {}).map(k => [C.REC_FIELD[k] || humanCode(k.replace(/([a-z])([A-Z])/g, '$1_$2').toUpperCase()), recValue(k, o[k])]);

VIEWS.approvals = {
  title: T.apTitle, perm: () => has('approve'),
  render(root, arg) {
    const picked = {};
    const bulkOk = r => yes(r.canDecide) && ((!yes(r.hasDown) && (r.type === 'HW_FIRST' || r.type === 'IDENTITY')) || r.type === 'OLD_STOCK'); /* fix round 6 (R6week-02): old stock in the batch */
    /* one PIN for the whole selection; the server takes 100 rows per request, so a long selection is sent in parts */
    const runBulk = async data => {
      const all = []; let last = { ok: true };
      for (let i = 0; i < data.ids.length; i += 100) {
        last = await callConfirmed('approvals.decideMany', { ids: data.ids.slice(i, i + 100), note: data.note, pin: data.pin });
        if (!last.ok) { if (!all.length) return last; break; }
        (last.results || []).forEach(x => all.push(x));
      }
      return { ok: true, results: all, stopped: last.ok ? '' : last.msg };
    };
    /* R37B-08: "Approve selected" acts only on requests that are in the list NOW (the rows loaded under the current filter) and are
       ticked; ticks are emptied whenever the filter changes, and the dialog names every request that will be approved */
    const clearPicked = () => { Object.keys(picked).forEach(k => delete picked[k]); root.querySelectorAll('input[data-pick]').forEach(c => { c.checked = false; }); };
    const bulk = btn(T.apApproveSel, () => {
      const rows = lv.rows().filter(r => picked[r.id] && bulkOk(r) && !(r.status && r.status !== 'PENDING')), ids = rows.map(r => r.id); if (!ids.length) { notify(T.apSelNone, 'bad'); return; }
      const listEl = h('div', { id: 'apBulkList' }, h('p', { class: 'intro', text: T.apBulkList }), h('ul', { class: 'bulk-list' }, rows.map(r => h('li', { dataset: { id: r.id }, text: [r.id, lbl('APPR_TYPE', r.type), r.ref, r.summary].filter(Boolean).join(' — ') }))), h('p', { class: 'hint', text: T.apBulkHidden }));
      actionDialog({ title: fmt(T.apBulkTitle, { n: ids.length }), intro: listEl, action: 'approvals.decideMany', pin: true, submit: T.apApprove, fields: [{ k: 'note', l: T.alAckNote, t: 'area', max: 300 }], build: v => Object.assign({ ids: ids }, v), run: runBulk,
        ok: r => { const res = r.results || []; const ok = res.filter(x => yes(x.ok)).length; return fmt(T.apBulkDone, { ok, bad: res.length - ok }) + (r.stopped ? ' ' + r.stopped : ''); } });
    }, 'sec', { id: 'apBulk' });
    /* "Select all old stock": every old-stock entry this person may decide, also the ones not on the visible page */
    const allOld = btn(T.apSelOld, async () => {
      /* R37B-08: the list itself is switched to "Pending / Old stock" and loaded completely, so every ticked entry is on the screen */
      const b = allOld; if (b.dataset.busy) return; b.dataset.busy = '1'; b.disabled = true; let ids = [];
      try {
        if (lv.filters) { lv.filters.set('status', 'PENDING'); lv.filters.set('type', 'OLD_STOCK'); }
        clearPicked(); await lv.reload(); await lv.allRows();
        if (lv.rows().length < lv.total()) return; /* a page failed to load: said by the list, nothing ticked */
        ids = lv.rows().filter(x => x.type === 'OLD_STOCK' && yes(x.canDecide) && !(x.status && x.status !== 'PENDING')).map(x => x.id); ids.forEach(id => { picked[id] = true; });
        root.querySelectorAll('input[data-pick]').forEach(c => { if (picked[c.dataset.pick]) c.checked = true; });
      } finally { delete b.dataset.busy; b.disabled = false; }
      notify(fmt(T.apSelOldDone, { n: ids.length }), ids.length ? 'ok' : 'warn');
    }, 'sec', { id: 'apSelOld' });
    viewHead(root, T.apTitle, [allOld, bulk]);
    const lv = listView(root, { action: 'approvals.list', name: 'Approvals', title: T.apTitle, empty: T.apEmpty, search: false, onRow: r => openApproval(r.id),
      filters: [{ k: 'status', l: T.apStatus, t: 'sel', req: true, o: opts('APPR_STATUS'), dflt: 'PENDING' }, { k: 'type', l: T.apType, t: 'sel', o: opts('APPR_TYPE'), ph: T.all }],
      cols: [{ k: 'sel', l: T.apSelect, act: true, noCsv: true, el: r => (r.status && r.status !== 'PENDING' ? null : (bulkOk(r) ? h('label', { class: 'tick' }, h('input', { type: 'checkbox', 'aria-label': T.apSelect + ' ' + r.id, checked: !!picked[r.id], dataset: { pick: r.id } })) : (yes(r.hasDown) ? h('span', { class: 'pill bad', title: T.apDownHint, text: T.apDown }) : null))) },
        { k: 'id', l: T.apId, main: true }, { k: 'type', l: T.apType, main: true, v: r => lbl('APPR_TYPE', r.type) }, { k: 'ref', l: T.apRef }, { k: 'summary', l: T.apSummary }, { k: 'by', l: T.apBy, v: r => userName(r.by) }, { k: 'at', l: T.cAt, fmt: fmtDT },
        { k: 'ageWorkingHours', l: T.apAge, num: true }, { k: 'can', l: T.apStatus, v: r => (r.status && r.status !== 'PENDING' ? lbl('APPR_STATUS', r.status) : (yes(r.canDecide) ? lbl('APPR_STATUS', 'PENDING') : (isMine(r.by) ? T.apOwn : T.apOwnerOnly))),
          el: r => (r.status && r.status !== 'PENDING' ? pill('APPR_STATUS', r.status) : (yes(r.canDecide) ? pill('APPR_STATUS', 'PENDING') : h('span', { class: 'pill plain own-wait', text: isMine(r.by) ? T.apOwn : T.apOwnerOnly }))) }] });
    root.addEventListener('change', e => { const c = e.target.closest('input[data-pick]'); if (c) picked[c.dataset.pick] = c.checked; });
    if (lv.filters) lv.filters.el.addEventListener('change', clearPicked); /* R37B-08: another filter = another list; ticks that leave the screen are dropped */
    S.refresh = () => { Object.keys(picked).forEach(k => delete picked[k]); return lv.reload(); };
    if (arg) openApproval(arg);
  }
};
function openApproval(id) {
  const m = openModal({ title: fmt(T.apCard, { id }), full: true });
  m.reload = load(m.body, 'approvals.get', { id }, (r, box) => {
    const a = r.approval || {}, d = r.details ? r.details : apprDetails(a), pending = !a.status || a.status === 'PENDING', can = pending && yes(a.canDecide);
    m.titleEl.textContent = fmt(T.apCard, { id: a.id || id }) + ' — ' + lbl('APPR_TYPE', a.type);
    box.appendChild(h('div', { class: 'chips' }, pill('APPR_STATUS', a.status || 'PENDING'), yes(a.hasDown) ? h('span', { class: 'pill bad', text: T.apDown }) : null));
    box.appendChild(h('div', { class: 'card' }, kv([[T.apRef, a.ref], [T.apSummary, a.summary], [T.apBy, userName(a.by)], [T.cAt, fmtDT(a.at)], a.decidedBy ? [T.cBy, userName(a.decidedBy)] : null, (a.note || a.decisionNote) ? [T.fNote, a.note || a.decisionNote] : null])));
    if (d.record && Object.keys(d.record).length) box.appendChild(h('div', { class: 'card' }, h('h3', { text: T.apRecord }), kv(recPairs(d.record))));
    if (d.exchange) box.appendChild(h('div', { class: 'card' }, h('h3', { text: T.apExchange }), kv(recPairs(d.exchange))));
    if (d.pendriveCheck) box.appendChild(note(T.apPendriveCheck, 'warn'));
    if (d.request && Object.keys(d.request).length) box.appendChild(h('div', { class: 'card', id: 'apRequest' }, h('h3', { text: T.apRequest }), kv(recPairs(d.request))));
    if ((d.differences || []).length) { box.appendChild(h('h3', { text: T.apDiff })); box.appendChild(simpleTable([{ k: 'code', l: T.apDiffItem, main: true, v: x => lbl('HW_DIFF', x.code) }, { k: 'dir', l: T.apDiffDir, el: x => h('span', { class: x.dir === 'DOWN' ? 'pill bad diff-down' : (x.dir === 'UP' ? 'pill good diff-up' : 'pill plain'), text: lbl('DIR', x.dir) }) }, { k: 'from', l: T.apDiffFrom }, { k: 'to', l: T.apDiffTo }], d.differences)); }
    if (d.candidate || d.latest) { const keys = Array.from(new Set(Object.keys(d.latest || {}).concat(Object.keys(d.candidate || {}))));
      box.appendChild(h('h3', { text: T.apSnap })); box.appendChild(simpleTable([{ k: 'f', l: T.apSnapField, main: true }, { k: 'a', l: T.apLatest }, { k: 'b', l: T.apCandidate }], keys.map(k => ({ f: C.REC_FIELD[k] || humanCode(k), a: recValue(k, (d.latest || {})[k]), b: recValue(k, (d.candidate || {})[k]) })))); }
    if (d.photos) { const ph = h('div', { class: 'card' }, h('h3', { text: T.apPhotos })); (d.photos || []).forEach(p => { const have = !!(p.fileId || p.dataUrl); ph.appendChild(h('p', null, h('b', { text: lbl('PHOTO', p.kind) + ': ' }), h('span', { class: 'pill ' + (have ? 'good' : 'bad'), text: have ? T.apPhotoOk : T.apPhotoMissing })));
      if (p.dataUrl && /^data:image\/(jpeg|png);base64,/.test(p.dataUrl)) ph.appendChild(h('img', { class: 'thumb', src: p.dataUrl, alt: lbl('PHOTO', p.kind) })); }); box.appendChild(ph); }
    if (d.referenceRates) box.appendChild(h('div', { class: 'card' }, h('h3', { text: T.apRates }), kv([[T.apAvg, d.referenceRates.avg != null ? money(d.referenceRates.avg) : ''], [T.apLast, d.referenceRates.last != null ? money(d.referenceRates.last) : '']])));
    if (!pending) return;
    /* CASH-OFF (4.0.4): a cash link / cash-received request while the cash day close is switched off - only dismissed (owner) */
    if (yes(a.cashOff)) { box.appendChild(note(T.apCashOff, 'warn')); if (!can) { box.appendChild(note(T.apOwnerOnly, 'warn')); return; }
      /* 4.0.5 (RVM-08): a "cash handed to the owner" request asks whether the cash came - the answer is kept with the dismissal; "No" leaves the owner a note */
      const askRcv = a.type === 'CASH_RECEIVED';
      const F0 = mkForm((askRcv ? [{ k: 'received', l: T.apCashRecvQ, t: 'sel', req: true, placeholder: true, wide: true, o: [{ v: 'YES', t: T.apCashRecvYes }, { v: 'NO', t: T.apCashRecvNo }, { v: 'UNSURE', t: T.apCashRecvUnsure }] }] : []).concat([{ k: 'note', l: T.apNote, t: 'area', max: 300 }, { k: 'pin', l: T.yourPin, t: 'pin', req: true }])), err0 = h('div', { class: 'errbox', role: 'alert', hidden: true }); let busy0 = false; const U0 = unsureGuard(err0, () => [F0.el]); /* R37B-01 */
      const dismiss = async b => { if (busy0) return; err0.hidden = true; F0.clearErr(); const bad = F0.check(); if (bad) { err0.textContent = bad; err0.hidden = false; return; } const v = F0.get(), data = { id: a.id || id, decision: 'REJECT', pin: v.pin }; if (v.note) data.note = v.note; if (askRcv) data.received = v.received;
        busy0 = true; b.disabled = true; const x = await U0.run(() => callConfirmed('approvals.decide', data), b); /* R37B-01 */ busy0 = false; b.disabled = false; if (x.cancelled) return;
        if (!x.ok) { if (x.code === 'AUTH_PIN_WRONG') F0.mark('pin', ''); err0.textContent = x.msg; err0.hidden = false; return; }
        m.close(); notify(x.msg || T.apDismissed, 'ok'); refresh(); reloadLists(); };
      box.appendChild(h('div', { class: 'card', id: 'apDecide' }, F0.el, err0, h('div', { class: 'btns' }, btn(T.apDismiss, e => dismiss(e.currentTarget), 'sec', { id: 'apDismiss' }))));
      return; }
    if (!can) { box.appendChild(note(isMine(a.by) ? T.apOwn : T.apOwnerOnly, 'warn')); box.appendChild(h('div', { class: 'btns' }, btn(T.apApprove, null, '', { disabled: true }), btn(T.apReject, null, 'sec', { disabled: true }))); return; }
    const needOutcome = (d.outcomes && d.outcomes.length) || STOCK_OUTCOME_TYPES.indexOf(a.type) >= 0, outcomes = d.outcomes && d.outcomes.length ? d.outcomes : ['ACCEPT', 'RETURN_TO_DEALER', 'VOID'];
    const inputs = (d.inputs || []).map(x => (typeof x === 'string' ? { name: x, required: true } : x)), init = d.values || {};
    const inF = x => { const l = x.label || lbl('APPR_INPUT', x.name), req = x.required !== false && x.required !== 'N', base = { k: x.name, l, req };
      if (needOutcome && x.name !== 'pairCode') base.show = v => !v.outcome || v.outcome === 'ACCEPT';
      switch (x.name) {
        case 'rate': case 'value': case 'refund': case 'tagPrice': case 'minPrice': case 'amount': return Object.assign(base, { t: 'money', min: x.name === 'refund' ? 0 : 1 });
        case 'dealerId': return Object.assign(base, { t: 'sel', o: () => dealerOpts() }); case 'billDate': return Object.assign(base, { t: 'date', maxToday: true });
        case 'warrantyDays': return Object.assign(base, { t: 'sel', o: warrantyOpts }); case 'payMode': case 'refundMode': return Object.assign(base, { t: 'sel', o: payOpts1 });
        /* R63A-06 (round 63): one "came back" tick box per free kit item, none ticked; only the ticked items go back into stock */
        case 'kitBack': return Object.assign(base, { t: 'multi', req: false, o: (Array.isArray(d.kit) ? d.kit : []).map(k => ({ v: k.itemId, t: (k.item || k.itemId) + (Number(k.qty) > 1 ? ' x' + k.qty : '') })) });
        case 'extrasBack': return Object.assign(base, { t: 'sel', wide: true, l: Array.isArray(d.extras) && d.extras.length ? l + ': ' + d.extras.map(e => e.item + (Number(e.qty) > 1 ? ' x' + e.qty : '')).join(', ') : l, o: [{ v: 'Y', t: T.yes }, { v: 'N', t: T.no }] }); /* R54A-04 */
        case 'pairCode': return Object.assign(base, { t: 'code', cam: false, max: 6 }); case 'replaceDeviceId': return Object.assign(base, { t: 'sel', req: false, ph: T.apNoReplace, o: (d.replaceable || []).map(v => ({ v: v.deviceId, t: v.label })) });
        /* round 32: "Users allowed" comes with a required choice: all staff, or only the people ticked (then at least one is required) */
        case 'allowedUsers': return [{ k: 'allowScope', l: T.apAllowScope, t: 'sel', req: true, placeholder: true, wide: true, o: [{ v: 'ALL', t: T.apAllowAll }, { v: 'LIST', t: T.apAllowList }] },
          Object.assign(base, { t: 'multi', req: true, o: () => userOpts(), show: v => v.allowScope === 'LIST' })]; default: return Object.assign(base, { max: 60 });
      } };
    const F = mkForm((needOutcome ? [{ k: 'outcome', l: T.apOutcome, t: 'sel', req: true, placeholder: true, o: opts('OUTCOME', outcomes), wide: true }] : []).concat([].concat.apply([], inputs.map(inF)), [{ k: 'note', l: T.apNote, t: 'area', max: 300 }, { k: 'pin', l: T.yourPin, t: 'pin', req: true }]), init);
    const err = h('div', { class: 'errbox', role: 'alert', hidden: true }); let busy = false;
    const U = unsureGuard(err, () => [err.parentNode]); /* R37B-01 */
    async function decide(decision, b) {
      if (busy) return; err.hidden = true; F.clearErr(); const v = F.get();
      if (decision === 'REJECT') { if (!v.note) { F.mark('note', ''); err.textContent = T.apNoteNeeded; err.hidden = false; return; } if (!v.pin || v.pin.length !== 6) { F.mark('pin', ''); err.textContent = T.pinHint; err.hidden = false; return; } }
      else { if (F.f.allowScope && v.allowScope === 'LIST' && !userOpts().length) { F.mark('allowScope', ''); err.textContent = T.apAllowNoList; err.hidden = false; return; }
        const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; } }
      const data = { id: a.id || id, decision, pin: v.pin }; if (v.note) data.note = v.note;
      data.scanCount = a.scanCount == null || a.scanCount === '' ? '1' : String(a.scanCount); /* R51A-03 / -04: the version of the card shown - the server refuses (APPR_CHANGED) when it was scanned again since */
      if (needOutcome) { data.outcome = v.outcome; data.decision = v.outcome === 'ACCEPT' ? 'APPROVE' : 'REJECT'; if (data.decision === 'REJECT' && !v.note) { F.mark('note', ''); err.textContent = T.apNoteNeeded; err.hidden = false; return; } }
      if (data.decision === 'APPROVE') { const inp = {}; inputs.forEach(x => { if (v[x.name] !== undefined && !(Array.isArray(v[x.name]) && !v[x.name].length)) inp[x.name] = x.name === 'warrantyDays' ? Number(v[x.name]) : v[x.name]; }); if (F.f.allowScope) { if (v.allowScope === 'ALL') inp.allowedUsers = 'ALL'; else delete inp.allowedUsers; if (v.allowScope === 'LIST') inp.allowedUsers = v.allowedUsers || []; } if (F.f.kitBack && Array.isArray(d.kit) && d.kit.length) inp.kitBack = Array.isArray(v.kitBack) ? v.kitBack : []; /* R63A-06: a list - none ticked = no kit came back; round 69 (RV69-01): only when the server sent the kit list (an older server books all kit back) */ if (Object.keys(inp).length) data.inputs = inp; }
      busy = true; b.disabled = true; const x = await U.run(() => callConfirmed('approvals.decide', data), b); /* R37B-01: the boxes and the other button are locked after an unsure answer; the same decision is sent again */ busy = false; b.disabled = false;
      if (x.cancelled) return;
      if (!x.ok) { if (x.field) F.mark(x.field, ''); if (x.code === 'AUTH_PIN_WRONG') F.mark('pin', ''); if (x.code === 'PAIR_CODE_WRONG') F.mark('pairCode', ''); err.textContent = x.msg; err.hidden = false; return; }
      m.close(); notify(x.stale === 'Y' ? x.msg : (needOutcome ? T.apDecided : (decision === 'APPROVE' ? T.apApproved : T.apRejected)), x.stale === 'Y' ? 'warn' : 'ok'); refresh(); reloadLists();
    }
    box.appendChild(h('div', { class: 'card', id: 'apDecide' }, h('h3', { text: inputs.length ? T.apInputs : T.apDecide }), F.el, err, h('div', { class: 'btns' },
      needOutcome ? btn(T.apDecide, e => decide('APPROVE', e.currentTarget), '', { id: 'apDecideBtn' }) : [btn(T.apApprove, e => decide('APPROVE', e.currentTarget), 'good', { id: 'apApprove' }), btn(T.apReject, e => decide('REJECT', e.currentTarget), 'bad', { id: 'apReject' })])));
  });
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
  return m;
}

/* ---------- V20 alerts and incidents ---------- */
function openRef(ref) { const s = String(ref || ''); if (/^GJ-/.test(s)) openLaptop(s); else if (/^RJ-/.test(s)) openJob(s); else if (/^AP-/.test(s) && has('approve')) openApproval(s); else if (/^PO-/.test(s) && has('po')) openPo(s); else if (/^PT-/.test(s)) openPart(s); else return false; return true; }
const canOpenRef = ref => /^(GJ|RJ|AP|PO|PT)-/.test(String(ref || ''));
VIEWS.alerts = {
  title: T.alTitle, perm: () => has('dash'),
  render(root, arg) {
    const unread = h('span', { class: 'pill warn', id: 'alUnread', hidden: true });
    viewHead(root, T.alTitle, [unread]);
    const tabs = h('div', { class: 'tabs', role: 'tablist' }), pane = h('div'); append(root, [tabs, pane]);
    const tabAlerts = () => {
      clear(pane);
      const lv = listView(pane, { action: 'alerts.list', name: 'Alerts', title: T.alTitle, empty: T.alEmpty, search: false, onRow: a => alertDialog(a),
        filters: [{ k: 'status', l: T.apStatus, t: 'sel', o: opts('ALERT_STATUS'), ph: T.all, dflt: 'OPEN' }, { k: 'type', l: T.alType, t: 'code', cam: false, max: 30 }, { k: 'today', l: T.alToday, t: 'check' }, { k: 'mine', l: T.alMine, t: 'check' }], filterInit: { status: 'OPEN' },
        map: p => { if (p.today === 'Y') { p.from = todayISO(); p.to = todayISO(); } delete p.today; if (p.mine !== 'Y') delete p.mine; return p; },
        onData: r => { unread.hidden = !(r.unread > 0); unread.textContent = fmt(T.alUnread, { n: r.unread || 0 }); },
        cols: [{ k: 'alertId', l: T.alId, main: true }, { k: 'severity', l: T.alSeverity, v: a => lbl('SEVERITY', a.severity), el: a => pill('SEVERITY', a.severity, a.severity === 'URGENT' ? 'bad' : (a.severity === 'INFO' ? 'plain' : 'warn')) }, { k: 'type', l: T.apType }, { k: 'subject', l: T.alSubject, main: true, v: a => a.subject || a.text || '' },
          { k: 'ref', l: T.apRef }, { k: 'at', l: T.cAt, v: a => a.at || a.firstSeen || '', fmt: fmtDT }, { k: 'lastSeen', l: T.alSeen, fmt: v => (v ? fmtDT(v) : '') }, { k: 'count', l: T.alCount, num: true }, { k: 'status', l: T.apStatus, v: a => lbl('ALERT_STATUS', a.status), el: a => pill('ALERT_STATUS', a.status, a.status === 'OPEN' ? 'warn' : 'good') }] });
      S.refresh = lv.reload;
      if (arg) { const want = arg; arg = ''; (async () => { const r = await api('alerts.list', { alertId: want, offset: 0, limit: 500 }); const a = r.ok ? (r.rows || []).find(x => x.alertId === want) : null; if (a) alertDialog(a); else notify(r.ok ? fmt(T.alNotFound, { id: want }) : r.msg, 'bad'); })(); }
    };
    const tabInc = () => {
      clear(pane);
      const lv = listView(pane, { action: 'incidents.list', name: 'Incidents', title: T.alTabIncidents, empty: T.inEmpty, search: false,
        filters: [{ k: 'status', l: T.apStatus, t: 'sel', o: [{ v: 'OPEN', t: T.inOpenOnly }, { v: 'RESOLVED', t: lbl('ALERT_STATUS', 'RESOLVED') }], ph: T.all, dflt: 'OPEN' }], filterInit: { status: 'OPEN' },
        onAct: (x, i) => actionDialog({ title: fmt(T.inResolveTitle, { id: i.incidentId }), action: 'incidents.resolve', submit: T.inResolve, fields: [{ k: 'note', l: T.fNote, t: 'area', req: true, max: 300 }], build: v => ({ incidentId: i.incidentId, note: v.note }), ok: T.inResolved }),
        onRow: i => { openRef(i.ref); },
        cols: [{ k: 'incidentId', l: T.inId, main: true }, { k: 'type', l: T.apType, main: true, v: i => lbl('INCIDENT', i.type) }, { k: 'ref', l: T.apRef }, { k: 'text', l: T.hText, v: i => i.text || i.details || '' }, { k: 'at', l: T.cAt, v: i => i.at || i.time || '', fmt: fmtDT }, { k: 'by', l: T.cBy, v: i => userName(i.by || i.responsible) },
          { k: 'status', l: T.apStatus, v: i => lbl('ALERT_STATUS', i.status), el: i => pill('ALERT_STATUS', i.status, i.status === 'OPEN' ? 'warn' : 'good') }, { k: 'act', l: '', act: true, el: i => (i.status === 'OPEN' ? btn(T.inResolve, null, 'sec sm', { 'data-act': 'res' }) : null) }] });
      S.refresh = lv.reload;
    };
    [[T.alTabAlerts, tabAlerts], [T.alTabIncidents, tabInc]].forEach((t, i) => tabs.appendChild(h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': i ? 'false' : 'true', text: t[0], onclick: e => { $$('.tab', tabs).forEach(x => x.setAttribute('aria-selected', x === e.currentTarget ? 'true' : 'false')); t[1](); } })));
    tabAlerts();
  }
};
function alertDialog(a) {
  const m = openModal({ title: fmt(T.alCard, { id: a.alertId }) });
  m.body.appendChild(h('div', { class: 'chips' }, pill('SEVERITY', a.severity, a.severity === 'URGENT' ? 'bad' : 'warn'), pill('ALERT_STATUS', a.status, a.status === 'OPEN' ? 'warn' : 'good')));
  m.body.appendChild(kv([[T.alSubject, a.subject || a.text], [T.apType, a.type], [T.apRef, a.ref], [T.cAt, fmtDT(a.at || a.firstSeen)], [T.alSeen, a.lastSeen ? fmtDT(a.lastSeen) : ''], [T.alCount, a.count != null ? String(a.count) : ''], [T.alAckBy, userName(a.ackBy)], [T.fNote, a.ackNote]].concat(Array.isArray(a.fields) ? a.fields.map(f => [f.label, f.text]) : (a.fields && typeof a.fields === 'object' ? recPairs(a.fields) : []))));
  if (canOpenRef(a.ref)) m.body.appendChild(h('div', { class: 'btns' }, btn(fmt(T.alOpenItem, { ref: a.ref }), () => { m.close(); openRef(a.ref); }, 'sec')));
  /* fix round 6 (R6diff-11): a scan from an unknown network - the owner adds the network here, the manager asks the owner */
  const netF = a.type === 'SCAN_OFFSITE' && Array.isArray(a.fields) ? a.fields.find(f => f.label === 'Network' && /^[A-Za-z0-9]{8,80}$/.test(String(f.text))) : null;
  if (netF && has('admin.networkAdd') && a.status !== 'RESOLVED') m.body.appendChild(h('div', { class: 'btns' }, btn(T.alNetAdd, async e => {
    const b = e.currentTarget; if (b.dataset.busy) return; if (!(await confirmBox(T.alNetAddIntro, { title: T.alNetAddTitle, yes: T.alNetAdd, no: T.cancel }))) return;
    b.dataset.busy = '1'; b.disabled = true; const r = await callConfirmed('admin.networkAdd', { hash: String(netF.text) }); delete b.dataset.busy; b.disabled = false; /* the PIN is asked by api() (PIN_FIRST) */
    if (r.cancelled) return; if (!r.ok) { notify(r.msg, 'bad'); return; } m.close(); notify(yes(r.requested) ? T.alNetAsked : T.alNetAdded, yes(r.requested) ? 'warn' : 'ok'); refresh(); }, 'sec', { id: 'alNetAdd' })));
  let F = null; const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  if (a.status === 'OPEN') { F = mkForm([{ k: 'note', l: T.alAckNote, t: 'area', max: 300 }]); m.body.appendChild(F.el); }
  append(m.foot, [err, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec'), F ? btn(T.alAck, async e => { const b = e.currentTarget; if (b.dataset.busy) return; b.dataset.busy = '1'; b.disabled = true; const r = await api('alerts.ack', Object.assign({ alertId: a.alertId }, F.get())); delete b.dataset.busy; b.disabled = false;
    if (!r.ok) { err.textContent = r.msg; err.hidden = false; return; } m.close(); notify(T.alAcked, 'ok'); refresh(); }, '', { id: 'alAck' }) : null,
    /* fix round 6 (R6week-03): the owner clears all open alerts of one type in one step */
    F && role() === 'ADMIN' ? btn(T.alAckAll, async e => { const b = e.currentTarget; if (b.dataset.busy) return; if (!(await confirmBox(fmt(T.alAckAllAsk, { type: a.type }), { yes: T.alAckAll, no: T.cancel }))) return; b.dataset.busy = '1'; b.disabled = true; const r = await api('alerts.ackType', Object.assign({ type: a.type }, F.get())); delete b.dataset.busy; b.disabled = false;
      if (!r.ok) { err.textContent = r.msg; err.hidden = false; return; } m.close(); notify(fmt(T.alAckedAll, { n: r.acknowledged || 0 }), 'ok'); refresh(); }, 'sec', { id: 'alAckAll' }) : null)]);
}

/* ---------- V21 dashboard ---------- */
VIEWS.dash = {
  title: T.dsTitle, perm: () => has('dash'),
  render(root) {
    viewHead(root, T.dsTitle, [btn(T.tReports, () => go('reports'), 'sec'), btn(T.tAlerts, () => go('alerts'), 'sec')]);
    S.refresh = load(root, 'dash.summary', {}, (r, box) => {
      const t = r.tiles || {}, keys = [['sales', T.dsSales], ['repair', T.dsRepair], ['inTransit', T.dsTransit], ['outside', T.dsOutside], ['pending', T.dsPending], ['rejected', T.dsDealerReturn], ['awaitingPickup', T.dsPickup]];
      const st = h('div', { class: 'stat', id: 'dashTiles' }); let sum = 0;
      keys.forEach(k => { const n = Number(t[k[0]]) || 0; sum += n; st.appendChild(h('div', null, h('b', { text: String(n) }), h('span', { text: k[1] }))); });
      append(box, [st, h('p', { class: 'dash-expected', id: 'dashExpected' }, h('b', { text: fmt(T.dsExpected, { n: r.expected != null ? r.expected : (t.total != null ? t.total : sum) }) }))]);
      const al = r.alerts || {}; const c = Object.assign({}, r.cycle || {}); if (c.done == null && Array.isArray(c.sections)) { c.done = c.sections.reduce((x, s) => x + (s.done || 0), 0); c.total = c.sections.reduce((x, s) => x + (s.total || 0), 0); c.responsible = c.responsible || null; }
      const cy = h('div', { class: 'card' }, h('h2', { text: T.dsCycle }));
      if (c.id) { cy.appendChild(h('p', { text: cycleLine(c) })); cy.appendChild(h('progress', { max: Math.max(1, c.total || 0), value: c.done || 0, 'aria-label': T.dsCycle })); (c.sections || []).forEach(s => cy.appendChild(h('p', { text: lbl('SECTION', s.section) + ': ' + fmt(T.cyDoneOf, { done: s.done, total: s.total, pct: s.total ? Math.round(s.done * 100 / s.total) : 100 }) + ' — ' + (respName(s.responsible) || T.rtUnassigned) }))); }
      cy.appendChild(btn(T.tCycle, () => go('cycle'), 'sec'));
      append(box, [h('div', { class: 'cols2' },
        h('div', { class: 'card' }, h('h2', { text: T.dsAlerts }), h('div', { class: 'chips' }, ['URGENT', 'NORMAL', 'INFO'].map(s => h('span', { class: 'pill ' + (s === 'URGENT' ? 'bad' : (s === 'NORMAL' ? 'warn' : 'plain')), text: lbl('SEVERITY', s) + ': ' + (Number(al[s]) || 0) }))), h('div', { class: 'btns' }, btn(T.tAlerts, () => go('alerts'), 'sec'))),
        h('div', { class: 'card' }, h('h2', { text: T.dsApprovals }), h('p', { class: 'big', id: 'dashApprovals', text: String(r.pendingApprovals || 0) }), h('p', null, T.dsUnconfirmed + ': ', h('b', { text: String(r.unconfirmedSales || 0) })), h('div', { class: 'btns' }, btn(T.tApprovals, () => go('approvals'), 'sec'), btn(T.tSales, () => go('sales'), 'sec')))), cy,
      h('div', { class: 'card' }, h('h2', { text: T.dsCounts }), simpleTable([{ k: 'section', l: T.dsSection, main: true, v: x => lbl('SECTION', x.section) }, { k: 'status', l: T.apStatus, el: x => pill('COUNT_STATUS', x.status || 'NOT_STARTED', 'plain') }, { k: 'by', l: T.cBy, v: x => userName(x.by || x.closedBy || x.startedBy) || (x.turn && x.turn.name) || '' },
        { k: 'expected', l: lbl('COUNT_RESULT', 'FOUND') + ' / ' + T.rpExpected, v: x => (x.expected != null && x.expected !== '' ? (x.found || 0) + ' / ' + x.expected : '') }, { k: 'missing', l: lbl('COUNT_RESULT', 'MISSING'), num: true }], r.counts || [], { empty: T.dsNoCounts }))]);
    });
  }
};
Object.assign(T, { rpExpected: 'Expected' });
