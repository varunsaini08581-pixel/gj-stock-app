/* GJ App v4 — V10 sell, V11 sales, D4 reservations and sale requests, V12 exchanges. */
'use strict';
Object.assign(C, { SALE_WARN: { BELOW_COST: 'Sold below cost', LOW_PROFIT: 'Low profit', SCAN_OLD: 'Last scan older than 24 hours', ON_HOLD: 'Hold overridden', BILL_DUPLICATE: 'Bill number used before', BILL_PENDING: 'Bill number pending', NOT_COSTED: 'Cost not known', PRICE_HIGH: 'Price unusually high', RESERVED_OTHER: 'Was reserved for another customer', ADVANCE_SET_OFF: 'Advance of an ended reservation set off' },
  RESERVE_KIND: { RESERVE: 'Reservation', REQUEST: 'Sale request' }, PHOTO: { EX_ID: 'Seller ID photo', EX_SELLER: 'Seller photo', ID_PHOTO: 'Seller ID photo', SELLER_PHOTO: 'Seller photo' } });
Object.assign(C.SALE_WARN, { SALE_SCAN_OLD: 'Last scan older than 24 hours (overridden)', SALE_BELOW_MIN: 'Below the minimum price', BELOW_MIN: 'Below the minimum price', COST_UNKNOWN: 'Purchase cost not recorded', BELOW_COST: 'Sold below cost', BILL_PENDING: 'Bill number pending', PRICE_UNUSUAL: 'Price far from the usual price (a zero too many or too few?) - the manager and the owner were told at once; check the bill' }); /* RVR22-04 */
Object.assign(C.RESERVE_KIND, { RESERVATION: 'Reservation', SALE_REQUEST: 'Sale request' });
const isMe = v => !!S.me && (v === S.me.userId || v === S.me.name);   /* server views carry user NAMES (sentBy, enteredBy, by ...) */
Object.assign(T, {
  seTitle: 'Sell', seScan: 'Scan or type the GJ sticker of each laptop on this bill', seAdd: 'Add laptop', seNone: 'No laptop added yet.', seDup: '{id} is already on this bill.', seMax: 'One bill can have at most 20 laptops.',
  sePrice: 'Price of THIS laptop (full price before exchange)', seCost: 'Cost', seBill: 'Bill no.', seBillPending: 'Bill pending (enter within one working day)', seDate: 'Sale date', seWarranty: 'Customer warranty', seWarrantyDays: '{n} days', seWarrantyNone: 'No warranty',
  sePay: 'Payment mode', seSplit: 'Split — {mode}', seSplitBad: 'The split amounts must add up to the total ({total}).', seKit: 'Kit given with the laptop', seExtras: 'Extra accessories sold', seExtraAdd: '+ Add accessory', seExQty: 'Qty', seExPrice: 'Price (each)',
  seExchange: 'Exchange laptop taken on this bill', seExCustomer: 'Name of the person giving the exchange laptop', seExNote: 'The exchange laptop must then be entered with the pendrive. A value agreed now is confirmed on approval; otherwise the manager or owner enters the value on approval.', seExValue: 'Value agreed for the old laptop (Rs)', seExValueHint: 'This value is taken off the amount to collect now and is confirmed on approval. Leave it empty if the value is not agreed yet.', seCollectNow: 'Amount to collect now: {amount}', saCorrectRefund: 'Difference returned by', saCorrectMoney: 'Money for the price difference', saMoneyNone: 'Nothing changed hands now - the bill was typed wrong', saMoneyMode: 'Paid / given back now by {mode}',
  sePickup: 'Customer collects later', seReplFor: 'Replacement for (Stock ID, optional)', seOverride: 'Override reason (manager / owner: hold, old scan or repeated bill number)', seTotal: 'Total: {total}', rsSettle: 'Settle advance', rsSettleTitle: 'Advance of reservation {id}', rsSettleIntro: 'The reservation is closed but its advance of {advance} ({customer}) is not settled. Record the refund, or that the advance is kept.', rsForfeit: 'The advance is kept (forfeited)', rsSettled: 'Advance settled.', saBalance: 'Balance due: {amount} by {date}.', saCollect: 'Record payment', saCollectTitle: 'Payment received — {id}', saCollectAmount: 'Amount received', saCollected: 'Payment recorded.', seReceived: 'Amount received now (manager / owner)', seReceivedHint: 'Leave empty when the customer pays the full amount. A smaller amount records a balance due.', seDueDate: 'Balance due by', seSave: 'Record sale',
  seNeedBill: 'Enter the bill number or tick "Bill pending".', seNeedPrice: 'Enter the price of {id}.', seDoneTitle: 'Sale recorded', seUnconfirmed: 'This sale is waiting for confirmation by the manager or owner.', seWarnings: 'Notes on this sale',
  seSlip: 'Sale slip', seWhatsApp: 'Send on WhatsApp', seNew: 'New sale', slipThanks: 'Thank you for buying from Genuine Junction.', slipLap: '{model} — Serial {serial} — {spec}', slipPrice: 'Price: {price}', slipWarranty: 'Warranty till: {date}', slipKit: 'Kit: {kit}', slipBill: 'Bill no.: {bill}', slipPhone: 'Shop phone: {phone}',
  saTitle: 'Sales', saFrom: 'From', saTo: 'To', saUnconfirmed: 'Only unconfirmed', saEmpty: 'No sales in this period.', saId: 'Sale', saEntered: 'Entered by', saConfirmed: 'Confirmed', saConfirmedBy: 'Confirmed by', saExchange: 'Exchange', saProfit: 'Profit', saOwnToday: 'You see your own sales of today.',
  saCard: 'Sale {id}', saConfirm: 'Confirm sale', saCorrect: 'Correct sale', saVoid: 'Cancel sale (entry mistake)', saHanded: 'Handed over to customer', saVoidRefund: 'Money given back (if the customer had paid)', saVoidRefundHint: 'Leave empty for an entry mistake (no money moved). The amount is shown under refunds in the day close.', /* RV55-01 (round 56): money paid above the laptops still on a bill, asked when the server names it */ saOverLabel: 'Money paid above the laptops still on this bill ({amount})', saOverKept: 'The shop keeps the extra {amount}', saOverNotPaid: 'It was an entry mistake - this money was never received', saOverNeed: 'Choose what happened to the extra {amount}.', saVoidIntro: 'The laptop returns to stock with the status it had before. For a laptop that the customer brings back, record a customer return with the pendrive instead.',
  saExtrasBack: 'Accessories sold on this bill ({items})', saExtrasBackY: 'They came back with the laptop', saExtrasBackN: 'The customer keeps them', /* R54A-04 */
  saReturnNs: 'Customer return without scan', saReturnNsTitle: 'Customer return without scan — {id}', saReturnNsIntro: 'For a sold laptop that comes back and cannot be scanned (does not power on, no operating system, locked). The owner or another manager approves; the laptop then goes to Repair as Needs repair.', saReturnNsMode: 'Why it cannot be scanned', saRefund: 'Refund', saRefundMode: 'Refund mode', saReturnNsOk: 'Customer return sent for approval.',
  saCorrectTitle: 'Correct sale {id}', saVoidTitle: 'Cancel sale {id}', saConfirmedOk: 'Sale confirmed.', saVoided: 'Sale cancelled. The laptop is back in stock.', saHandedOk: 'Recorded as handed over.', saPickup: 'Awaiting pickup', saCostWarn: 'Cost-side notes',
  rsTitle: 'Reserve — {id}', rsAdvance: 'Advance received', rsAdvMode: 'Advance payment mode', rsExpires: 'Reserved until', rsDone: 'Reserved. Receipt {id}.', rsCancelTitle: 'Cancel reservation {id}', rsCancelFull: 'Give the customer back the full advance of {advance}. Only the manager or the owner can keep an advance.', rsRefund: 'Advance refunded', rsRefundMode: 'Refund mode', rsCancelled: 'Reservation cancelled.',
  rsList: 'Reservations', rsEmpty: 'No reservations.', rsId: 'Receipt', rsKind: 'Kind', rsReceipt: 'Reservation receipt', rsReceiptText: 'Reservation receipt {id}\n{model} ({stock})\nCustomer: {customer} — {mobile}\nAdvance: {advance}\nReserved until: {till}', rsCancel: 'Cancel reservation', rsSell: 'Sell',
  seSentApproval: 'The price is below the minimum price. The sale was sent to the manager for approval; nothing is sold yet.',
  rqTitle: 'Request sale — {id}', rqIntro: 'Sales are recorded by the manager or owner. This request keeps the laptop for your customer and informs the manager. The laptop stays in stock until the sale is recorded.', rqPrice: 'Agreed price', rqDone: 'Sale request sent to the manager.',
  exTitle: 'Exchanges and buybacks', exBanner: 'Exchange and buyback laptops are entered with the pendrive. Every entry needs approval by the manager or owner, who also enters the value. Upload the seller\'s ID photo and the seller\'s photo here.',
  exId: 'Entry', exKind: 'Kind', exSeller: 'Seller / customer', exIdProof: 'ID proof', exValue: 'Value', exPhotos: 'Photos', exPhotoMissing: 'Photo missing', exPhotoOk: 'On file', exEmpty: 'No exchange entries.', exEdit: 'Edit entry', exCancel: 'Cancel entry',
  exCancelTitle: 'Cancel exchange entry {id}', exUpId: 'Upload seller ID photo', exUpSeller: 'Upload seller photo', exCard: 'Exchange entry {id}', exHold: 'On hold until'
});
/* R46A-01: an advance is never refunded by the person who took it; R46A-02: the agreed price of a sale request; R46A-03: the whole bill on the slip */
Object.assign(T, { rsOwnAdvance: 'The manager records the refund of an advance you took. Ask the manager or the owner to cancel this reservation and give the advance of {advance} back to the customer.',
  rsOwnAdvanceSettle: 'The manager records the refund of an advance you took. Ask the manager or the owner to settle the advance of {advance}.',
  slipExtra: '{item} x {qty}: {price}', slipTotal: 'Bill total: {total}', slipAdvance: 'Advance paid earlier: {amount}', slipExchangeVal: 'Value of the exchange laptop: {amount}', slipPaidNow: 'Paid now: {amount}', slipBalance: 'Balance due: {amount}', slipBalanceBy: 'Balance due: {amount} by {date}' });

const payOpts = () => opts('PAY', ['CASH', 'UPI', 'CARD', 'BANK', 'MIXED']); /* R31C-05: the server's PAY_MODE (Sell, Deliver); "Set off on the bill" is only a day-report label */
const payOpts1 = () => opts('PAY', ['CASH', 'UPI', 'CARD', 'BANK']); /* fix round 5: advances, refunds, parts, accessories, quick service - one mode */
const custWarrantyOpts = () => (L().custWarrantyDays && L().custWarrantyDays.length ? L().custWarrantyDays : [0, 7, 15, 30, 90, 180, 365]).map(n => ({ v: String(n), t: Number(n) === 0 ? T.seWarrantyNone : fmt(T.seWarrantyDays, { n }) }));
function addDays(iso, n) { const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || ''); if (!m) return ''; const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + Number(n)); const p = x => String(x).padStart(2, '0'); return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate()); }
function waLink(mobile, text) { return 'https://wa.me/91' + normMobile(mobile) + '?text=' + encodeURIComponent(text); }
/* Shows a slip with Print (same-page print area) and a real WhatsApp link the user taps. */
function slipDialog(title, text, mobile, extra) {
  const m = openModal({ title });
  if (extra) append(m.body, extra);
  m.body.appendChild(h('div', { class: 'slip', id: 'slipText', text }));
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.print, () => printNode(title, h('div', { class: 'slip', text })), 'sec'),
    mobile && validMobile(normMobile(mobile)) ? h('a', { class: 'btn good', id: 'waLink', target: '_blank', rel: 'noopener noreferrer', href: waLink(mobile, text), text: T.seWhatsApp }) : null, btn(T.close, () => m.close(), 'sec')));
  return m;
}

VIEWS.sell = {
  title: T.seTitle, perm: () => has('sale.create'),
  render(root, arg) {
    viewHead(root, T.seTitle);
    if (needLists(root)) return;   /* R31C-07: never a sale without its kit / salesperson because the lists failed to load */
    /* R46A-02: "Sell" on a reservation / sale request carries its customer and mobile, and for a sale request also the agreed price and the
       staff member who asked (the salesperson of the sale). Taken once, only for the laptop it was set for. */
    const pre = S.sellPre && arg && S.sellPre.stockId === normSticker(arg, 'GJ') ? S.sellPre : null; S.sellPre = null;
    const preInit = pre ? { customer: pre.customer || '', mobile: pre.mobile || '' } : undefined;
    if (pre && pre.byId && userOpts(u => u.role !== 'REPAIR').some(o => o.v === pre.byId)) preInit.salespersonId = pre.byId;
    const cost = has('cost.view'), mgr = isMgr(), items = [], extras = [];
    const scan = h('input', { type: 'text', class: 'code', id: 'sellScan', 'data-scanbox': '', 'aria-label': T.seScan, placeholder: T.seScan, autocomplete: 'off', maxlength: 20 });
    const rowsBox = h('div', { id: 'sellRows' }), totalEl = h('p', { class: 'sell-total' }), err = h('div', { class: 'errbox', role: 'alert', hidden: true }), extrasBox = h('div', { class: 'lines' });
    let seq = 0;
    async function addItem(code, prePrice) {
      const id = normSticker(code, 'GJ'); if (!id) return;
      if (items.some(x => x.it.id === id)) { notify(fmt(T.seDup, { id }), 'bad'); return; }
      if (items.length >= 20) { notify(T.seMax, 'bad'); return; }
      const my = ++seq; scan.value = ''; scan.disabled = true;
      const r = await api('stock.get', { id }); scan.disabled = false; scan.focus();
      if (my !== seq || !rowsBox.isConnected) return;
      if (!r.ok) { notify(r.msg, 'bad'); return; }
      const price = h('input', { type: 'text', inputmode: 'numeric', class: 'num', 'aria-label': T.sePrice + ' ' + id, autocomplete: 'off' });
      price.addEventListener('input', () => { price.value = grp(digits(price.value).slice(0, 8)); S.dirty = true; drawTotal(); });
      if (Number(prePrice) > 0) price.value = grp(String(prePrice)); /* R46A-02: the agreed price of the sale request */
      items.push({ it: r.item, price }); S.dirty = true; drawRows();
      soon(() => price.focus());
    }
    function drawTotal() { totalEl.textContent = fmt(T.seTotal, { total: money(total()) }); }
    const total = () => items.reduce((a, x) => a + Number(digits(x.price.value) || 0), 0) + extras.reduce((a, e) => a + (Number(e.F.val('qty')) || 0) * (Number(e.F.val('price')) || 0), 0);
    function drawRows() {
      clear(rowsBox);
      rowsBox.appendChild(simpleTable([{ k: 'id', l: T.fId, main: true, v: x => x.it.id }, { k: 'model', l: T.fModel, main: true, v: x => modelText(x.it) }, { k: 'spec', l: T.fRamSt, v: x => ramSt(x.it) }, { k: 'tag', l: T.fTag, num: true, v: x => (x.it.tagPrice ? money(x.it.tagPrice) : '') },
        { k: 'min', l: T.fMin, num: true, v: x => (x.it.minPrice ? money(x.it.minPrice) : '') }, cost ? { k: 'cost', l: T.seCost, num: true, v: x => (x.it.purchaseRate ? money(Number(x.it.purchaseRate) + Number(x.it.partsCost || 0) + Number(x.it.outsideCost || 0)) : '') } : null,
        { k: 'price', l: T.sePrice, el: x => x.price }, { k: 'act', l: '', act: true, el: () => btn(T.remove, null, 'sec sm', { 'data-act': 'rm' }) }].filter(Boolean), items, { empty: T.seNone, onAct: (a, x, b, idx) => { items.splice(idx, 1); drawRows(); } }));
      drawTotal();
    }
    scan.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); if (!e.repeat) addItem(scan.value); } });
    const F = mkForm([{ k: 'billNo', l: T.seBill, max: 40, show: v => v.billPending !== 'Y' }, { k: 'billPending', l: T.seBillPending, t: 'check' }, { k: 'saleDate', l: T.seDate, t: 'date', req: true, maxToday: true, dflt: todayISO(), ro: !mgr },
      { k: 'customer', l: T.fCustomer, req: true, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile', req: true }, { k: 'warrantyDays', l: T.seWarranty, t: 'sel', req: true, placeholder: true, o: custWarrantyOpts },
      { k: 'salespersonId', l: T.fSalesperson, t: 'sel', req: true, o: () => userOpts(u => u.role !== 'REPAIR'), dflt: S.me.userId }, { k: 'payMode', l: T.sePay, t: 'sel', req: true, placeholder: true, o: payOpts },
      { k: 'splitCASH', l: fmt(T.seSplit, { mode: lbl('PAY', 'CASH') }), t: 'money', show: v => v.payMode === 'MIXED' }, { k: 'splitUPI', l: fmt(T.seSplit, { mode: lbl('PAY', 'UPI') }), t: 'money', show: v => v.payMode === 'MIXED' },
      { k: 'splitCARD', l: fmt(T.seSplit, { mode: lbl('PAY', 'CARD') }), t: 'money', show: v => v.payMode === 'MIXED' }, { k: 'splitBANK', l: fmt(T.seSplit, { mode: lbl('PAY', 'BANK') }), t: 'money', show: v => v.payMode === 'MIXED' },
      mgr ? { k: 'amountReceived', l: T.seReceived, t: 'money', hint: T.seReceivedHint } : null, mgr ? { k: 'dueDate', l: T.seDueDate, t: 'date', show: v => v.amountReceived != null && v.amountReceived !== '' } : null,
      { k: 'kit', l: T.seKit, t: 'multi', o: () => (L().kit || []).map(k => (typeof k === 'object' ? { v: k.itemId, t: k.item || accName(k.itemId) } : { v: k, t: accName(k) })), dflt: (L().kit || []).map(k => (typeof k === 'object' ? k.itemId : k)) },
      { k: 'exchange', l: T.seExchange, t: 'check' }, { k: 'exCustomer', l: T.seExCustomer, max: 60, show: v => v.exchange === 'Y', hint: T.seExNote }, has('exchange.value') ? { k: 'exValue', l: T.seExValue, t: 'money', min: 1, show: v => v.exchange === 'Y', hint: T.seExValueHint } : null, { k: 'pickupLater', l: T.sePickup, t: 'check' },
      { k: 'replacementFor', l: T.seReplFor, t: 'code', sticker: 'GJ', cam: false }, mgr ? { k: 'overrideReason', l: T.seOverride, max: 200, wide: true } : null, { k: 'pin', l: T.yourPin, t: 'pin', req: true }].filter(Boolean), preInit);
    F.el.addEventListener('input', () => { S.dirty = true; });
    /* R37B-04: "Sale date" was filled once, when the screen was drawn - a Sell screen left open overnight (the lock keeps the screen) booked
       the next morning's sale on yesterday. dateDay = the day on which the box was last set (by the screen or by the person). When the
       day has changed (server time): a box the person never touched is set to today and says so; a date the person chose is asked about
       at Save ("Use today's date?"). Checked when the screen is unlocked, shown again or focused, once a minute, and always at Save. */
    const dateInp = F.f.saleDate.inp; let dateDay = todayISO(), dateTouched = false;
    const dateTouch = () => { dateTouched = true; dateDay = todayISO(); };
    dateInp.addEventListener('input', dateTouch); dateInp.addEventListener('change', dateTouch);
    function freshDate(quiet) {
      if (!F.el.isConnected) return false; const t = todayISO(); dateInp.max = t;
      if (t === dateDay || U.held) return true; /* a locked entry is resent exactly as it was */
      if (dateTouched && F.val('saleDate') !== t) return true; /* chosen by the person: asked at Save */
      const was = F.val('saleDate'); F.set('saleDate', t); dateDay = t; dateTouched = false;
      if (was !== t && !quiet) notify(fmt(T.seDateToday, { date: fmtDate(t) }), 'warn');
      return true;
    }
    const dateEv = () => { if (!freshDate()) { document.removeEventListener('gj:unlock', dateEv); document.removeEventListener('visibilitychange', dateEv); window.removeEventListener('focus', dateEv); clearInterval(dateTick); } };
    document.addEventListener('gj:unlock', dateEv); document.addEventListener('visibilitychange', dateEv); window.addEventListener('focus', dateEv); const dateTick = setInterval(dateEv, 60000);
    function addExtra() { const e = { F: mkForm([{ k: 'itemId', l: T.lnAccItem, t: 'sel', req: true, o: accItemOpts }, { k: 'qty', l: T.seExQty, t: 'int', req: true, min: 1, maxv: 50, dflt: 1 }, { k: 'price', l: T.seExPrice, t: 'money', req: true, min: 0 }], {}, { onChange: drawTotal }) };
      e.el = h('div', { class: 'linerow' }, e.F.el, btn(T.remove, () => { extras.splice(extras.indexOf(e), 1); e.el.remove(); drawTotal(); }, 'sec sm')); extras.push(e); extrasBox.appendChild(e.el); }
    const save = btn(T.seSave, async () => {
      if (save.dataset.busy) return; err.hidden = true;
      const fail = msg => { err.textContent = msg; err.hidden = false; };
      /* R37B-04: never a sale silently booked on a day that is over */
      if (!U.held) { freshDate(); const t = todayISO(), sd = F.val('saleDate');
        if (dateTouched && dateDay !== t && sd && sd !== t) { save.dataset.busy = '1'; const useToday = await confirmBox(fmt(T.seDateAsk, { date: fmtDate(sd), today: fmtDate(t) }), { title: T.seDateAskTitle, yes: T.seDateUseToday, no: fmt(T.seDateKeep, { date: fmtDate(sd) }) }); delete save.dataset.busy; if (!root.isConnected) return; dateDay = todayISO(); if (useToday) { F.set('saleDate', dateDay); dateTouched = false; } } }
      if (!items.length) { fail(T.seNone); scan.focus(); return; }
      for (const x of items) { if (!(Number(digits(x.price.value)) > 0)) { fail(fmt(T.seNeedPrice, { id: x.it.id })); x.price.focus(); return; } }
      const bad = F.check(); if (bad) { fail(bad); return; }
      for (const e of extras) { const b2 = e.F.check(); if (b2) { fail(b2); return; } }
      const v = F.get(); if (v.billPending !== 'Y' && !v.billNo) { F.mark('billNo', ''); fail(T.seNeedBill); return; }
      const d = { items: items.map(x => ({ id: x.it.id, price: Number(digits(x.price.value)) })), saleDate: v.saleDate, customer: v.customer, mobile: v.mobile, warrantyDays: Number(v.warrantyDays), salespersonId: v.salespersonId, payMode: v.payMode,
        kit: (v.kit || []).map(itemId => ({ itemId })), extras: extras.map(e => e.F.get()), pin: v.pin };
      if (v.billPending === 'Y') d.billPending = 'Y'; else d.billNo = v.billNo;
      if (v.payMode === 'MIXED') { d.paySplit = {}; ['CASH', 'UPI', 'CARD', 'BANK'].forEach(k => { if (v['split' + k]) d.paySplit[k] = v['split' + k]; }); const sum = Object.keys(d.paySplit).reduce((a, k) => a + d.paySplit[k], 0); if (v.amountReceived != null && v.amountReceived !== '' && sum !== Number(v.amountReceived)) { fail(fmt(T.seSplitBad, { total: money(v.amountReceived) })); return; } } /* fix round 4: the server checks the split against the amount paid now (advance / balance due taken off) */
      if (v.amountReceived != null && v.amountReceived !== '') { d.amountReceived = Number(v.amountReceived); if (v.dueDate) d.dueDate = v.dueDate; }
      if (v.exchange === 'Y') { d.exchange = { taken: 'Y', customer: v.exCustomer || v.customer }; if (v.exValue != null && v.exValue !== '' && Number(v.exValue) > 0) d.exchange.value = Number(v.exValue); } /* round 8: the value agreed at the counter is part of the bill's payment on the sale day */
      d.askSetOff = 'Y'; /* round 8: an advance of an ended reservation of this customer is shown before the bill is saved */
      if (v.pickupLater === 'Y') d.pickupLater = 'Y'; if (v.replacementFor) d.replacementFor = v.replacementFor; if (v.overrideReason) d.overrideReason = v.overrideReason;
      save.dataset.busy = '1'; save.disabled = true;
      const r = await U.run(() => callConfirmed('sale.create', d), save); /* R37B-01: after an unsure answer the whole Sell form is locked and this sends the same sale again */
      delete save.dataset.busy; save.disabled = false;
      if (r.cancelled) return;
      if (!r.ok) { F.clearErr(); if (r.field) F.mark(r.field, ''); if (r.code === 'AUTH_PIN_WRONG') F.mark('pin', ''); fail(r.approvalId ? r.msg + ' ' + T.sentForApproval : r.msg); return; }
      S.dirty = false;
      if (r.approvalId && !(r.saleIds || []).length) { notify(T.seSentApproval, 'warn'); renderRoute(); return; }   /* below the minimum price: request sent for approval, nothing sold */
      const till = addDays(v.saleDate, Number(v.warrantyDays)), kitNames = (v.kit || []).map(accName).join(', ');
      /* R46A-03: the slip lists the accessories sold on the bill and the bill's money (total, advance and exchange value set off, paid now,
         balance due) - it used to show the laptop price only */
      const exLines = d.extras.map(e => fmt(T.slipExtra, { item: accName(e.itemId), qty: e.qty, price: money((Number(e.qty) || 0) * (Number(e.price) || 0)) }));
      const billTot = r.saleTotal != null ? Number(r.saleTotal) : (r.billTotal != null ? Number(r.billTotal) : total()), advUsed = Number(r.advanceUsed) || 0;
      const exVal = Number(r.exchangeValue) || (d.exchange && Number(d.exchange.value)) || 0, bal = Number(r.balanceDue) || 0;
      const moneyLines = [fmt(T.slipTotal, { total: money(billTot) }), advUsed > 0 ? fmt(T.slipAdvance, { amount: money(advUsed) }) : '', exVal > 0 ? fmt(T.slipExchangeVal, { amount: money(exVal) }) : '',
        (advUsed > 0 || exVal > 0 || bal > 0) && r.collectNow != null ? fmt(T.slipPaidNow, { amount: money(r.collectNow) }) : '', bal > 0 ? (d.dueDate ? fmt(T.slipBalanceBy, { amount: money(bal), date: fmtDate(d.dueDate) }) : fmt(T.slipBalance, { amount: money(bal) })) : ''];
      const lines = [T.shop, v.customer + ' — ' + v.mobile].concat(items.map(x => fmt(T.slipLap, { model: modelText(x.it), serial: x.it.serial || T.notSet, spec: ramSt(x.it) }) + '\n' + fmt(T.slipPrice, { price: money(digits(x.price.value)) })), exLines, moneyLines,
        [Number(v.warrantyDays) > 0 ? fmt(T.slipWarranty, { date: fmtDate(till) }) : '', kitNames ? fmt(T.slipKit, { kit: kitNames }) : '', d.billNo ? fmt(T.slipBill, { bill: d.billNo }) : '', L().config && L().config.shopPhone ? fmt(T.slipPhone, { phone: L().config.shopPhone }) : '', T.slipThanks]).filter(Boolean);
      const extra = [note((r.saleIds || []).join(', ') + ' — ' + T.saved, 'ok'), r.advanceNote ? note(r.advanceNote, 'warn') : null, (Number(r.exchangeValue) > 0 || Number(r.advanceUsed) > 0) && r.collectNow != null ? note(fmt(T.seCollectNow, { amount: money(r.collectNow) }), 'warn') : null, r.confirmed === 'N' || r.confirmed === false ? note(T.seUnconfirmed, 'warn') : null,
        (r.warnings || []).length ? h('div', null, h('h3', { text: T.seWarnings }), chipList('SALE_WARN', r.warnings, 'warn')) : null];
      const m = slipDialog(T.seDoneTitle, lines.join('\n'), v.mobile, extra); m.onClose = () => renderRoute();
    }, '', { id: 'sellSave' });
    const U = unsureGuard(err, () => $$('.card', root)); /* R37B-01 */
    append(root, [h('div', { class: 'card' }, h('div', { class: 'scanbox' }, scan, btn(T.seAdd, () => addItem(scan.value), 'sec'), btn(T.camera, () => cameraScan(addItem), 'sec')), rowsBox, totalEl),
      h('div', { class: 'card' }, F.el, h('div', { class: 'sect' }, h('h3', { text: T.seExtras }), btn(T.seExtraAdd, addExtra, 'sec sm')), extrasBox, err, h('div', { class: 'btns' }, save))]);
    drawRows(); if (arg) addItem(arg, pre && pre.price); else soon(() => scan.focus());
  }
};

/* ---------- V11 sales ---------- */
VIEWS.sales = {
  title: T.saTitle, perm: () => has('sale.view') || has('sale.confirm') || has('sale.create') || has('sale.request'),
  render(root) {
    viewHead(root, T.saTitle, [has('sale.create') ? btn(T.seNew, () => go('sell')) : null]);
    const staff = !isMgr(); if (staff) root.appendChild(note(T.saOwnToday));
    const lv = listView(root, { action: 'sale.list', name: 'Sales_register', title: T.saTitle, empty: T.saEmpty, onRow: r => saleDialog(r), search: !staff,
      filters: staff ? [] : [{ k: 'from', l: T.saFrom, t: 'date', dflt: thisMonth() + '-01' }, { k: 'to', l: T.saTo, t: 'date', dflt: todayISO() }, { k: 'unconfirmed', l: T.saUnconfirmed, t: 'check' }],
      filterInit: {}, map: p => { if (p.unconfirmed !== 'Y') delete p.unconfirmed; return p; },
      cols: [{ k: 'saleDate', l: T.seDate, fmt: fmtDate }, { k: 'billNo', l: T.seBill, v: r => r.billNo || (r.billPending === 'Y' ? T.seBillPending : '') }, { k: 'stockId', l: T.fId, main: true }, { k: 'model', l: T.fModel, main: true }, { k: 'serial', l: T.fSerial }, { k: 'customer', l: T.fCustomer },
        { k: 'mobile', l: T.fMobile }, { k: 'price', l: T.fPrice, num: true, fmt: money, csv: r => r.price }, { k: 'payMode', l: T.sePay, v: r => lbl('PAY', r.payMode) }, { k: 'warrantyTill', l: T.fCustWarranty, fmt: v => (v ? fmtDate(v) : '') },
        { k: 'salesperson', l: T.fSalesperson, v: r => r.salesperson || r.salespersonName || userName(r.salespersonId) }, { k: 'enteredBy', l: T.saEntered, v: r => userName(r.enteredBy) },
        { k: 'confirmed', l: T.saConfirmed, v: r => lbl('YN', r.confirmed), el: r => h('span', { class: 'pill ' + (r.confirmed === 'Y' ? 'good' : 'warn'), text: lbl('YN', r.confirmed) }) }, { k: 'exchangeId', l: T.saExchange },
        { k: 'status', l: T.fStatus, v: r => lbl('SALE_STATUS', r.status) + (r.pickupPending === 'Y' ? ' — ' + T.saPickup : ''), el: r => [pill('SALE_STATUS', r.status, r.status === 'OPEN' ? 'good' : 'bad'), r.pickupPending === 'Y' ? h('span', { class: 'pill warn', text: T.saPickup }) : null] },
        { k: 'cost', l: T.seCost, num: true, v: r => saleCost(r), fmt: v => (v == null || v === '' ? '' : money(v)), csv: r => saleCost(r), hide: () => !has('profit.view') }, { k: 'profit', l: T.saProfit, num: true, fmt: v => (v == null || v === '' ? '' : money(v)), csv: r => r.profit, hide: () => !has('profit.view') }] });
    S.refresh = lv.reload;
  }
};
function saleCost(s) { if (s.cost != null && s.cost !== '') return s.cost; if (s.costAtSale == null || s.costAtSale === '' || Number(s.costAtSale) === 0) return ''; return Number(s.costAtSale) + Number(s.partsCost || 0) + Number(s.outsideCost || 0); }
function saleDialog(s) {
  const m = openModal({ title: fmt(T.saCard, { id: s.saleId }) });
  m.body.appendChild(kv([[T.fId, s.stockId], [T.fModel, s.model], [T.fSerial, s.serial], [T.seDate, fmtDate(s.saleDate)], [T.seBill, s.billNo || (s.billPending === 'Y' ? T.seBillPending : '')], [T.fCustomer, s.customer], [T.fMobile, s.mobile], [T.fPrice, money(s.price)], [T.sePay, lbl('PAY', s.payMode)],
    [T.fCustWarranty, s.warrantyTill ? fmtDate(s.warrantyTill) : ''], [T.fSalesperson, s.salesperson || s.salespersonName || userName(s.salespersonId)], [T.saEntered, userName(s.enteredBy)], [T.saConfirmed, lbl('YN', s.confirmed) + (s.confirmedBy ? ' — ' + userName(s.confirmedBy) : '')], [T.fStatus, pill('SALE_STATUS', s.status, s.status === 'OPEN' ? 'good' : 'bad')],
    has('profit.view') && saleCost(s) !== '' ? [T.seCost, money(saleCost(s))] : null, has('profit.view') && s.profit != null ? [T.saProfit, money(s.profit)] : null]));
  const open = s.status === 'OPEN', A = h('div', { class: 'btns' });
  /* R4life-03: balance due and its collection */
  if (Number(s.balanceDue) > 0) m.body.appendChild(note(fmt(T.saBalance, { amount: money(s.balanceDue), date: fmtDate(s.dueDate) }), s.dueDate && s.dueDate < todayISO() ? 'bad' : 'warn'));
  if (open && Number(s.balanceDue) > 0 && has('sale.create')) A.appendChild(btn(T.saCollect, () => { m.close(); actionDialog({ title: fmt(T.saCollectTitle, { id: s.saleId }), action: 'sale.collect',
    fields: [{ k: 'amount', l: T.saCollectAmount, t: 'money', req: true, min: 1, dflt: s.balanceDue }, { k: 'mode', l: T.sePay, t: 'sel', req: true, placeholder: true, o: () => ['CASH', 'UPI', 'CARD', 'BANK'].map(v => ({ v, t: lbl('PAY', v) })) }],
    build: v => ({ saleId: s.saleId, amount: v.amount, mode: v.mode }), ok: () => T.saCollected }); }, 'sec'));
  if (open && has('sale.confirm') && s.confirmed !== 'Y' && !isMe(s.enteredBy)) A.appendChild(btn(T.saConfirm, async e => { const r = await runAction(e.currentTarget, 'sale.confirm', { saleId: s.saleId }, { ok: T.saConfirmedOk }); if (r.ok) { m.close(); const w = r.warnings || (r.sale && r.sale.warnings); if (w && w.length) confirmBox(h('div', null, h('p', { text: T.saCostWarn }), chipList('SALE_WARN', w, 'warn')), { yes: T.ok, no: T.close }); } }, '', { id: 'saleConfirm' }));
  if (open && s.pickupPending === 'Y' && (has('sale.handover') || has('sale.create') || has('sale.confirm'))) A.appendChild(btn(T.saHanded, async e => { const r = await runAction(e.currentTarget, 'sale.handedOver', { saleId: s.saleId }, { ok: T.saHandedOk }); if (r.ok) m.close(); }, 'sec'));
  if (open && has('sale.correct')) {
    A.appendChild(btn(T.saCorrect, () => { m.close(); actionDialog({ title: fmt(T.saCorrectTitle, { id: s.saleId }), action: 'sale.correct', init: Object.assign({}, s, { warrantyDays: s.warrantyDays == null ? '' : String(s.warrantyDays) }),
      fields: [{ k: 'billNo', l: T.seBill, max: 40 }, { k: 'price', l: T.fPrice, t: 'money', min: 500 }, { k: 'customer', l: T.fCustomer, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile' }, { k: 'warrantyDays', l: T.seWarranty, t: 'sel', o: custWarrantyOpts },
        { k: 'saleDate', l: T.seDate, t: 'date', maxToday: true }, { k: 'salespersonId', l: T.fSalesperson, t: 'sel', o: () => userOpts() }, { k: 'payMode', l: T.sePay, t: 'sel', o: payOpts }, { k: 'moneyMode', l: T.saCorrectMoney, t: 'sel', req: true, placeholder: true, o: () => [{ v: 'NONE', t: T.saMoneyNone }].concat(['CASH', 'UPI', 'CARD', 'BANK'].map(v => ({ v, t: fmt(T.saMoneyMode, { mode: lbl('PAY', v) }) }))), show: v => v.price != null && v.price !== '' && Number(v.price) !== Number(s.price) }, { k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }],
      build: (v, F) => { const ch = F.changed(); delete ch.reason; delete ch.refundMode; if (ch.price != null && Number(ch.price) !== Number(s.price)) ch.moneyMode = v.moneyMode; else delete ch.moneyMode; /* R22-04: what happened to the money of the price difference - said by the person who corrects (nothing / given back / collected now) */ if (ch.warrantyDays != null && ch.warrantyDays !== '') ch.warrantyDays = Number(ch.warrantyDays); if (!Object.keys(ch).length) { notify(T.edNothing, 'ok'); return null; } return { saleId: s.saleId, fields: ch, reason: v.reason }; } }); }, 'sec'));
    A.appendChild(btn(T.saVoid, () => { m.close();
      /* RV55-01 (round 56): a line of a bill whose customer has paid more than the laptops still on it - the server names the amount
         (BILL_OVERPAID_CHOICE) and the dialog asks what happened to it: the shop keeps it (KEPT) or it was never received (NOT_PAID) */
      const ov = { x: null }, ovSel = h('select', { id: 'voidOverpaid', 'aria-required': 'true' }), ovLbl = h('label', { for: 'voidOverpaid' });
      const ovBox = h('div', { class: 'fld wide', hidden: true, dataset: { k: 'overpaid' } }, ovLbl, ovSel);
      const ovShow = x => { ov.x = x; ovLbl.textContent = fmt(T.saOverLabel, { amount: money(x) }); clear(ovSel); [['', T.select], ['KEPT', fmt(T.saOverKept, { amount: money(x) })], ['NOT_PAID', T.saOverNotPaid]].forEach(o => ovSel.appendChild(h('option', { value: o[0], text: o[1] }))); ovBox.hidden = false; };
      actionDialog({ title: fmt(T.saVoidTitle, { id: s.saleId }), intro: T.saVoidIntro, action: 'sale.void', danger: true, submit: T.saVoid, fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }, { k: 'refund', l: T.saVoidRefund, t: 'money', min: 0, hint: T.saVoidRefundHint }, { k: 'refundMode', l: T.saRefundMode, t: 'sel', o: payOpts1, show: v => Number(v.refund) > 0 }],
        extra: (body, F) => { F.el.appendChild(ovBox); F.el.addEventListener('input', e => { if (e.target && e.target.closest && e.target.closest('[data-k="refund"]')) { ov.x = null; ovBox.hidden = true; } }); /* another refund = another amount: asked again */ },
        validate: () => (ov.x != null && !ovSel.value ? fmt(T.saOverNeed, { amount: money(ov.x) }) : ''),
        run: async data => { const r = await callConfirmed('sale.void', ov.x != null && ovSel.value ? Object.assign({}, data, { overpaid: ovSel.value }) : data); if (r && !r.ok && r.code === 'BILL_OVERPAID_CHOICE' && r.overpaid != null) { ovShow(r.overpaid); soon(() => ovSel.focus()); } return r; },
        build: v => Object.assign({ saleId: s.saleId, reason: v.reason }, Number(v.refund) > 0 ? { refund: v.refund, refundMode: v.refundMode || s.payMode } : {}), ok: T.saVoided }); }, 'sec'));
    const ex4 = Array.isArray(s.paidExtras) ? s.paidExtras : [];
    A.appendChild(btn(T.saReturnNs, () => { m.close(); actionDialog({ title: fmt(T.saReturnNsTitle, { id: s.stockId }), intro: T.saReturnNsIntro, action: 'sale.returnNoScan', submit: T.saReturnNs, dflt: { refund: s.price },
      fields: [{ k: 'noScanReason', l: T.saReturnNsMode, t: 'sel', req: true, o: () => opts('SCAN_MODE', ['NO_POWER', 'NO_OS', 'LOCKED', 'UNSUPPORTED']) }, { k: 'refund', l: T.saRefund, t: 'money', req: true, min: 0, dflt: s.price }, { k: 'refundMode', l: T.saRefundMode, t: 'sel', req: true, o: payOpts1 }].concat(ex4.length ? [{ k: 'extrasBack', l: fmt(T.saExtrasBack, { items: ex4.map(x => x.item + (Number(x.qty) > 1 ? ' x' + x.qty : '')).join(', ') }), t: 'sel', req: true, placeholder: true, wide: true, o: [{ v: 'Y', t: T.saExtrasBackY }, { v: 'N', t: T.saExtrasBackN }] }] : [], [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 300 }]),
      build: v => Object.assign({ saleId: s.saleId, noScanReason: v.noScanReason, refund: v.refund, refundMode: v.refundMode, reason: v.reason }, ex4.length ? { extrasBack: v.extrasBack } : {}), /* R54A-04: the paid accessories of the bill - back with the laptop or kept */ ok: r => (r.approvalId ? T.saReturnNsOk : T.saved) }); }, 'sec', { id: 'saleReturnNs' }));
  }
  A.appendChild(btn(T.open + ' ' + s.stockId, () => openLaptop(s.stockId), 'sec'));
  m.body.appendChild(A);
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
}

/* ---------- D4 reservations, sale requests ---------- */
function reserveDialog(it) {
  return actionDialog({ title: fmt(T.rsTitle, { id: it.id }), action: 'reserve.create',
    fields: [{ k: 'customer', l: T.fCustomer, req: true, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile', req: true }, { k: 'advance', l: T.rsAdvance, t: 'money', req: true, min: 0, dflt: 0 }, { k: 'advanceMode', l: T.rsAdvMode, t: 'sel', o: payOpts1, req: true, show: v => Number(v.advance) > 0 },
      { k: 'expiresOn', l: T.rsExpires, t: 'date', req: true, dflt: addDays(todayISO(), 2) }], build: v => Object.assign({ id: it.id }, v), ok: r => fmt(T.rsDone, { id: r.reserveId }),
    after: (r, v) => slipDialog(T.rsReceipt, fmt(T.rsReceiptText, { id: r.reserveId, model: modelText(it), stock: it.id, customer: v.customer, mobile: v.mobile, advance: money(v.advance), till: fmtDate(v.expiresOn) }), v.mobile) });
}
/* R46A-01: the person who took an advance never refunds it (the server refuses it: REFUND_MODE_MANAGER) - staff see who does it instead of
   a refund form whose Save is always refused. The manager / owner keep the form. */
const ownAdvance = (by, advance) => !isMgrEff() && Number(advance) > 0 && isMe(by); /* RV48-06: an acting manager counts as the manager (server: isMgr_) */
function ownAdvanceNote(title, text) { const m = openModal({ title }); m.body.appendChild(note(text, 'warn')); append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec'))); return m; }
/* R4b-04: staff refund the full advance (keeping part of it is for the manager / owner); R46A-01: a colleague's refund goes back in the
   mode the advance came in (another mode is the manager's) */
function reserveCancelDialog(reserveId, advance, by, advanceMode) { const adv = Number(advance) || 0;
  if (ownAdvance(by, adv)) return ownAdvanceNote(fmt(T.rsCancelTitle, { id: reserveId }), fmt(T.rsOwnAdvance, { advance: money(adv) }));
  return actionDialog({ title: fmt(T.rsCancelTitle, { id: reserveId }), action: 'reserve.cancel', danger: true, submit: T.rsCancel, intro: adv > 0 && !isMgrEff() ? fmt(T.rsCancelFull, { advance: money(adv) }) : '', fields: [{ k: 'refund', l: T.rsRefund, t: 'money', req: true, min: isMgrEff() ? 0 : adv, dflt: adv }, { k: 'refundMode', l: T.rsRefundMode, t: 'sel', o: payOpts1, req: true, dflt: !isMgrEff() && advanceMode ? advanceMode : undefined, /* RV48-06 */ show: v => Number(v.refund) > 0 }], build: v => Object.assign({ reserveId }, v), ok: T.rsCancelled }); }
function saleRequestDialog(it) { return actionDialog({ title: fmt(T.rqTitle, { id: it.id }), intro: T.rqIntro, action: 'sale.request', submit: T.bSaleRequest, fields: [{ k: 'customer', l: T.fCustomer, req: true, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile', req: true }, { k: 'price', l: T.rqPrice, t: 'money', req: true, min: 500 }, { k: 'note', l: T.fNote, t: 'area', max: 300 }], build: v => Object.assign({ id: it.id }, v), ok: T.rqDone }); }
/* R4life-04: the advance of an expired / dropped reservation: refunded (amount + mode) or kept (manager) */
function advanceSettleDialog(r) { if (ownAdvance(r.byId || r.by, r.advance)) return ownAdvanceNote(fmt(T.rsSettleTitle, { id: r.reserveId }), fmt(T.rsOwnAdvanceSettle, { advance: money(r.advance) })); /* R46A-01 */
  return actionDialog({ title: fmt(T.rsSettleTitle, { id: r.reserveId }), intro: fmt(T.rsSettleIntro, { advance: money(r.advance), customer: r.customer }), action: 'reserve.cancel',
  fields: [isMgrEff() ? { k: 'forfeit', l: T.rsForfeit, t: 'check' } : null, /* RV48-06: the server allows an acting manager to keep it */ { k: 'refund', l: T.rsRefund, t: 'money', req: true, min: 0, dflt: r.advance, show: v => v.forfeit !== 'Y' }, { k: 'refundMode', l: T.rsRefundMode, t: 'sel', o: payOpts1, req: true, show: v => v.forfeit !== 'Y' && Number(v.refund) > 0 }].filter(Boolean),
  build: v => (v.forfeit === 'Y' ? { reserveId: r.reserveId, forfeit: 'Y' } : { reserveId: r.reserveId, refund: v.refund, refundMode: v.refundMode }), ok: T.rsSettled, after: () => S.refresh && S.refresh() }); }
/* R46A-02: what "Sell" on a reservation row carries into the Sell screen (read once there) */
function sellFrom(r) { const req = (r.kind || '') === 'SALE_REQUEST' || r.kind === 'REQUEST', mob = validMobile(normMobile(r.mobile || '')) ? normMobile(r.mobile) : '';
  S.sellPre = { stockId: r.stockId, customer: r.customer || '', mobile: mob, price: req && Number(r.price) > 0 ? Number(r.price) : 0, byId: req ? r.byId || '' : '' }; }
VIEWS.reservations = {
  title: T.rsList, perm: () => has('reserve') || has('sale.request'),
  render(root) {
    viewHead(root, T.rsList);
    const lv = listView(root, { action: 'reserve.list', name: 'Reservations', title: T.rsList, empty: T.rsEmpty, search: false, onRow: r => openLaptop(r.stockId),
      filters: [{ k: 'open', l: T.poShow, t: 'sel', req: true, o: [{ v: 'Y', t: T.ouOpen }, { v: 'N', t: T.ouAll }], dflt: 'Y' }],
      onAct: (a, r) => { if (a === 'cancel') reserveCancelDialog(r.reserveId, r.advance, r.byId || r.by, r.advanceMode); else if (a === 'settle') advanceSettleDialog(r); else if (a === 'sell') { sellFrom(r); go('sell', r.stockId); } },
      cols: [{ k: 'reserveId', l: T.rsId, main: true }, { k: 'kind', l: T.rsKind, v: r => lbl('RESERVE_KIND', r.kind || 'RESERVATION') }, { k: 'stockId', l: T.fId, main: true }, { k: 'model', l: T.fModel }, { k: 'customer', l: T.fCustomer }, { k: 'mobile', l: T.fMobile },
        { k: 'advance', l: T.rsAdvance, num: true, fmt: v => (v ? money(v) : ''), csv: r => r.advance }, { k: 'price', l: T.rqPrice, num: true, fmt: v => (Number(v) > 0 ? money(v) : ''), csv: r => r.price } /* R46A-02 */, { k: 'expiresAt', l: T.rsExpires, v: r => r.expiresAt || r.expiresOn || '', fmt: v => (v ? fmtDate(v) : '') }, { k: 'by', l: T.cBy, v: r => userName(r.by) }, { k: 'status', l: T.fStatus, v: r => lbl('RESERVE_STATUS', r.status), el: r => pill('RESERVE_STATUS', r.status, r.status === 'OPEN' ? 'warn' : 'plain') },
        { k: 'act', l: '', act: true, el: r => (r.status === 'OPEN' ? [has('reserve') || isMe(r.by) ? btn(T.rsCancel, null, 'sec sm', { 'data-act': 'cancel' }) : null, has('sale.create') ? btn(T.rsSell, null, 'sm', { 'data-act': 'sell' }) : null] : (r.advanceOpen === 'Y' && (has('reserve') || isMe(r.by)) ? btn(T.rsSettle, null, 'sec sm', { 'data-act': 'settle' }) : null)) }] });
    S.refresh = lv.reload;
  }
};

/* ---------- V12 exchanges ---------- */
VIEWS.exchanges = {
  title: T.exTitle, perm: () => has('exchange.entry') || has('exchange.value'),
  render(root) {
    viewHead(root, T.exTitle); root.appendChild(note(T.exBanner));
    const val = has('exchange.value'), yes = x => x === 'Y' || x === true;
    const norm = x => Object.assign({ date: x.time, photoId: x.hasIdPhoto, photoSeller: x.hasSellerPhoto }, x);   /* server: time, hasIdPhoto, hasSellerPhoto */
    const lv = listView(root, { action: 'exchange.list', name: 'Exchanges', title: T.exTitle, empty: T.exEmpty, search: false, onRow: r => exDialog(r), mapRow: norm,
      filters: [{ k: 'status', l: T.fStatus, t: 'sel', o: opts('EX_STATUS'), ph: T.all }],
      cols: [{ k: 'id', l: T.exId, main: true }, { k: 'date', l: T.cDate, fmt: v => (v ? fmtDate(v) : '') }, { k: 'kind', l: T.exKind, v: r => lbl('EX_KIND', r.kind) }, { k: 'customer', l: T.exSeller, main: true }, { k: 'mobile', l: T.fMobile }, { k: 'billNo', l: T.seBill }, { k: 'stockId', l: T.fId },
        { k: 'idProof', l: T.exIdProof, v: r => (r.idType ? lbl('ID_TYPE', r.idType) + (r.idLast4 ? ' …' + r.idLast4 : '') : '') }, { k: 'photos', l: T.exPhotos, v: r => (yes(r.photoId) && yes(r.photoSeller) ? T.exPhotoOk : T.exPhotoMissing), el: r => h('span', { class: 'pill ' + (yes(r.photoId) && yes(r.photoSeller) ? 'good' : 'bad'), text: yes(r.photoId) && yes(r.photoSeller) ? T.exPhotoOk : T.exPhotoMissing }) },
        { k: 'value', l: T.exValue, num: true, fmt: v => (v == null || v === '' ? '' : money(v)), csv: r => r.value, hide: () => !val }, { k: 'status', l: T.fStatus, v: r => lbl('EX_STATUS', r.status), el: r => pill('EX_STATUS', r.status, r.status === 'CLOSED' ? 'good' : (r.status === 'PENDING' || r.status === 'SCANNED' ? 'warn' : 'bad')) }] });
    S.refresh = lv.reload;
    function exDialog(x) {
      const m = openModal({ title: fmt(T.exCard, { id: x.id }) });
      m.body.appendChild(kv([[T.exKind, lbl('EX_KIND', x.kind)], [T.fStatus, pill('EX_STATUS', x.status, 'plain')], [T.exSeller, x.customer], [T.fMobile, x.mobile], [T.seBill, x.billNo], [T.fId, x.stockId], [T.exIdProof, x.idType ? lbl('ID_TYPE', x.idType) + (x.idLast4 ? ' …' + x.idLast4 : '') : ''],
        [lbl('PHOTO', 'ID_PHOTO'), yes(x.photoId) ? T.exPhotoOk : T.exPhotoMissing], [lbl('PHOTO', 'SELLER_PHOTO'), yes(x.photoSeller) ? T.exPhotoOk : T.exPhotoMissing], val && x.value != null && x.value !== '' ? [T.exValue, money(x.value)] : null, x.holdUntil ? [T.exHold, fmtDate(x.holdUntil)] : null]));
      if (x.status === 'PENDING' || x.status === 'SCANNED') append(m.body, [photoButton(T.exUpId, 'ID_PHOTO', () => x.id, () => { m.close(); lv.reload(); }), photoButton(T.exUpSeller, 'SELLER_PHOTO', () => x.id, () => { m.close(); lv.reload(); })]);
      if (val && x.status === 'PENDING') m.body.appendChild(h('div', { class: 'btns' },
        btn(T.exEdit, () => { m.close(); actionDialog({ title: T.exEdit, action: 'exchange.edit', init: x, fields: [{ k: 'customer', l: T.exSeller, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile' }, { k: 'billNo', l: T.seBill, max: 40 }], build: (v, F) => { const ch = F.changed(); if (!Object.keys(ch).length) { notify(T.edNothing, 'ok'); return null; } return { id: x.id, fields: ch }; } }); }, 'sec'),
        btn(T.exCancel, () => { m.close(); actionDialog({ title: fmt(T.exCancelTitle, { id: x.id }), action: 'exchange.cancel', danger: true, submit: T.exCancel, fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ id: x.id, reason: v.reason }) }); }, 'sec')));
      append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
    }
  }
};
