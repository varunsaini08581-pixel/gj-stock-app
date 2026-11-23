/* GJ App v4 — V13 jobs, D5 job card, D6 job status view, new job without scan, quick service. */
'use strict';
Object.assign(T, {
  jbTitle: 'Repair jobs', jbSearch: 'RJ / name / mobile / model', jbOpenOnly: 'Open jobs', jbTech: 'Technician', jbEmpty: 'No jobs match.', jbNew: 'New job without scan', jbQuick: 'Quick service', jbId: 'Job', jbCreated: 'Received on', jbPromised: 'Promised date',
  jbReady: 'Ready on', jbDue: 'Amount due', jbProblem: 'Problem', jbCard: 'Job {id}', jbCreatedBy: 'Received by', jbCategory: 'Category', jbWhatsapp: 'WhatsApp', jbNoWhatsapp: 'no WhatsApp', jbProblemText: 'What the customer reported',
  jbReceivedWith: 'Received with', jbReceivedOther: 'Other items received', jbCondition: 'Condition (scratches / damage)', jbEstimate: 'Estimate', jbAbandon: 'Close as abandoned', jbAbandonTitle: 'Close job {id} as abandoned', jbAbandonIntro: 'Only when the customer has not come for the laptop for the set number of days (default 90) despite notices. The owner decides.', jbAbandonOutcome: 'What happens to the laptop', jbAbandonReason: 'Notices sent and reason', jbAbandonAmount: 'Amount received for the laptop', jbAbandonPay: 'Payment mode', jbAbandonMoney: 'The money is booked in the day close of the day the owner decides (line "Abandoned laptops sold").', jbAbandonAsked: 'Sent to the owner for approval.', jbAbandoned: 'Job closed as abandoned.', jbLineRemoveAsk: 'Remove the line "{text}" from this job? A removed customer part is no longer an explanation at the delivery scan.', jbAdvance: 'Advance', jbAdvMode: 'Advance payment mode', jbPassword: 'Device password',
  jbIntake: 'Intake', jbDelScan: 'Delivery scan', jbFinal: 'Final amount', jbAwaiting: 'Cancelled — laptop waiting to be returned to the customer', jbComeback: 'Comeback of {id}', jbSlipNotSent: 'Slip not sent — ask the counter.', jbSlipSent: 'Slip sent',
  jbEstimates: 'Estimate history', jbEstAdd: 'Add estimate', jbEstAmount: 'Estimate amount', jbEstApproved: 'Customer approved', jbEstHow: 'How it was approved (call, WhatsApp, in person)', jbEstNone: 'No estimate recorded.',
  jbUpdate: 'Update job', jbNewStatus: 'Status', jbNote: 'Note', jbAmountReason: 'Reason for changing the amount', jbZeroReason: 'Reason for zero amount', jbUpdated: 'Job updated.', jbNothing: 'Nothing was changed.',
  jbParts: 'Parts fitted', jbFit: 'Fit part', jbPull: 'Pull part', jbLines: 'Other charges and customer\'s own parts', jbLineAdd: 'Add charge / part', jbLineKind: 'Kind', jbLineText: 'Description', jbLineAmount: 'Amount charged', jbLineCost: 'Cost to shop', jbLinesNone: 'No other charges.',
  jbOutside: 'Outside', jbOutNow: 'Outside now: {reason} — {partner}. Due back {due}.', jbOutSend: 'Send outside (no scan)', jbOutBack: 'Record return from outside', jbOutHint: 'A job that starts normally is sent outside with the pendrive.',
  jbSlips: 'Customer slips', jbSlipIntake: 'Intake slip', jbSlipReady: '"Ready for pickup" message', jbSlipMark: 'Mark slip as sent', jbSlipMarked: 'Slip marked as sent.', jbPin: 'Pickup PIN: {pin}',
  jbDeliver: 'Deliver to customer', jbBill: 'Bill no. (required for every delivery)', jbCustPin: 'Customer\'s pickup PIN (4 digits)', jbNoPin: 'No PIN — deliver with ID proof (manager / owner only)', jbIdType: 'ID type', jbIdLast4: 'Last 4 digits of the ID',
  jbCollector: 'Collected by (name)', jbCollectorMobile: 'Collector\'s mobile', jbItemsReturned: 'All items received with the laptop were returned', jbOldParts: 'Old parts returned to the customer', jbNoScanReason: 'Reason for delivering without a delivery scan (manager / owner)',
  jbNoPinIntro: 'Only when the customer has lost the phone or forgotten the PIN. Check their ID before handing over.', jbDelivered: 'Laptop delivered to the customer.', jbDeliverBtn: 'Deliver',
  jbCancel: 'Cancel job', jbCancelTitle: 'Cancel job {id}', jbCancelIntro: 'The job is closed without repair. The laptop stays in the Repair count until it is returned to the customer. When parts were used, the cancellation needs approval.', jbCancelled: 'Job cancelled.',
  jbReopen: 'Reopen job', jbReopened: 'Job reopened.', jbEdit: 'Edit details', jbEditTitle: 'Edit job {id}', jbSetTech: 'Change technician', jbSticker: 'Change sticker', jbNewSticker: 'New RJ sticker', jbReminder: 'Reminder call made', jbReminderNote: 'What was said',
  jbReminderDone: 'Reminder recorded.', jbHistory: 'History', jbPrevious: 'Earlier jobs of this customer / laptop', jbNoneYet: 'No entries yet.',
  jnTitle: 'New job without scan', jnIntro: 'Only for a customer laptop that cannot be scanned with the pendrive. Every other job is created with the pendrive.', jnSticker: 'RJ sticker', jnReason: 'Why it cannot be scanned', jnSerial: 'Laptop serial number',
  jnRam: 'RAM serial numbers (separated by commas)', jnDisk: 'Disk serial numbers (separated by commas)', jnTech: 'Technician', jnTechPh: 'Select technician', jnType: 'Job type', jnComeback: 'Comeback of job (RJ, optional)', jnCreated: 'Job {id} created.',
  jqTitle: 'Quick service', jqIntro: 'For small work done at the counter while the customer waits. A bill number is always required.', jqWork: 'Work done', jqAmount: 'Amount', jqDone: 'Quick service {id} recorded.'
});
const OPEN_JOB = ['RECEIVED', 'IN_PROGRESS', 'WAITING_PART', 'OUTSIDE', 'READY'];
const techOpts = () => userOpts(u => u.role === 'REPAIR' || u.role === 'MANAGER');
const yes = x => x === 'Y' || x === true;
const jobOpen = j => OPEN_JOB.indexOf(j.status) >= 0;
const awaiting = j => j.status === 'CANCELLED' && yes(j.awaitingReturn);

VIEWS.jobs = {
  title: T.jbTitle, perm: () => has('job.view') || has('job.status'),
  render(root, arg) {
    const full = has('job.view');
    viewHead(root, T.jbTitle, [has('job.create') ? btn(T.jbNew, () => jobNoScanDialog(''), 'sec', { id: 'jobNew' }) : null, has('job.quick') ? btn(T.jbQuick, quickDialog, 'sec', { id: 'jobQuick' }) : null]);
    const cols = full ? [{ k: 'id', l: T.jbId, main: true }, { k: 'customer', l: T.fCustomer, main: true }, { k: 'mobile', l: T.fMobile }, { k: 'model', l: T.fModel, v: modelText }, { k: 'problemCode', l: T.jbProblem, v: j => lbl('PROBLEM', j.problemCode) },
      { k: 'status', l: T.fStatus, v: j => lbl('JOB_STATUS', j.status), el: j => [pill('JOB_STATUS', j.status), awaiting(j) ? h('span', { class: 'pill warn', text: T.jbAwaiting }) : null] }, { k: 'techId', l: T.jbTech, v: j => j.techName || j.technician || userName(j.techId) },
      { k: 'createdAt', l: T.jbCreated, fmt: fmtDT }, { k: 'promisedDate', l: T.jbPromised, fmt: v => (v ? fmtDate(v) : '') }, { k: 'estimate', l: T.jbEstimate, num: true, fmt: v => (v == null || v === '' ? '' : money(v)), csv: j => j.estimate }]
      : [{ k: 'id', l: T.jbId, main: true }, { k: 'customer', l: T.fCustomer, main: true }, { k: 'model', l: T.fModel, v: modelText }, { k: 'status', l: T.fStatus, v: j => lbl('JOB_STATUS', j.status), el: j => pill('JOB_STATUS', j.status) },
        { k: 'readyAt', l: T.jbReady, fmt: v => (v ? fmtDT(v) : '') }, { k: 'amountDue', l: T.jbDue, num: true, v: j => (j.amountDue != null && j.amountDue !== '' ? j.amountDue : (j.finalAmount == null ? '' : j.finalAmount)), fmt: v => (v == null || v === '' ? '' : money(v)) }];
    const lv = listView(root, { action: 'job.list', name: 'Repair_jobs', title: T.jbTitle, cols, searchPh: T.jbSearch, empty: T.jbEmpty, onRow: j => openJob(j.id),
      filters: [{ k: 'open', l: T.poShow, t: 'sel', req: true, o: [{ v: 'Y', t: T.jbOpenOnly }, { v: 'N', t: T.all }], dflt: 'Y' }, { k: 'status', l: T.fStatus, t: 'sel', o: opts('JOB_STATUS'), ph: T.all }, full ? { k: 'techId', l: T.jbTech, t: 'sel', o: techOpts, ph: T.all } : null].filter(Boolean) });
    S.refresh = lv.reload;
    if (arg) openJob(normSticker(arg, 'RJ'));
  }
};
/* R46A-04: the requests waiting for this job (job.get) - who decides them; a waiting job-without-scan request blocks Ready and delivery */
Object.assign(T, { jbApprWait: 'Waiting for approval: {id} ({type}), decided by {who}.', jbApprOwner: 'the owner', jbApprMgr: 'the manager or the owner',
  jbDeliverWait: 'Do not hand the laptop over yet: request {id} ({type}) is waiting for approval by {who}. The delivery is refused until it is approved.' });
const jobApprWho = a => (a.who === 'ADMIN' ? T.jbApprOwner : T.jbApprMgr);
const jobNoScanWait = j => (j.approvals || []).find(a => a.type === 'JOB_NO_SCAN');
function openJob(id) {
  const m = openModal({ title: fmt(T.jbCard, { id }), full: true });
  m.reload = load(m.body, 'job.get', { id }, (r, box) => drawJob(box, r.job, m));
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
  return m;
}
function drawJob(box, j, m) {
  const full = has('job.view') && !j.statusView && !j.statusOnly, canEdit = full && has('job.edit'), open = jobOpen(j), deliverable = j.status === 'READY' || awaiting(j);
  m.titleEl.textContent = fmt(T.jbCard, { id: j.id }) + (j.customer ? ' — ' + j.customer : '');
  box.appendChild(h('div', { class: 'chips' }, pill('JOB_STATUS', j.status), j.type ? pill('JOB_TYPE', j.type, 'plain') : null, j.category ? pill('JOB_CAT', j.category, 'plain') : null, awaiting(j) ? h('span', { class: 'pill warn', text: T.jbAwaiting }) : null,
    j.comebackOf ? h('span', { class: 'pill warn', text: fmt(T.jbComeback, { id: j.comebackOf }) }) : null));
  (j.approvals || []).forEach(a => box.appendChild(note(fmt(T.jbApprWait, { id: a.id, type: lbl('APPR_TYPE', a.type), who: jobApprWho(a) }), 'warn'))); /* R46A-04 */
  if (!full) {
    box.appendChild(h('div', { class: 'card' }, kv([[T.fCustomer, j.customer], [T.fModel, modelText(j)], [T.jbReady, j.readyAt ? fmtDT(j.readyAt) : ''], [T.jbDue, (j.amountDue != null && j.amountDue !== '') || (j.finalAmount != null && j.finalAmount !== '') ? money(j.amountDue != null && j.amountDue !== '' ? j.amountDue : j.finalAmount) : '']])));
  } else {
    box.appendChild(h('div', { class: 'cols2' },
      h('div', { class: 'card' }, kv([[T.jbCreated, fmtDT(j.createdAt)], [T.jbCreatedBy, userName(j.createdBy)], [T.fCustomer, j.customer], [T.fMobile, j.mobile ? j.mobile + (yes(j.whatsapp) ? '' : ' (' + T.jbNoWhatsapp + ')') : ''], [T.fModel, modelText(j)], [T.fSerial, j.serial],
        [T.jbProblem, lbl('PROBLEM', j.problemCode)], [T.jbProblemText, j.problem], [T.jbReceivedWith, (j.receivedWith || []).map(c => lbl('RECEIVED_WITH', c)).join(', ') + (j.receivedOther ? ' — ' + j.receivedOther : '')], [T.jbCondition, j.condition]])),
      h('div', { class: 'card' }, kv([[T.jbTech, j.techName || j.technician || userName(j.techId)], [T.jbPromised, j.promisedDate ? fmtDate(j.promisedDate) : ''], [T.jbAdvance, j.advance ? money(j.advance) + (j.advanceMode ? ' (' + lbl('PAY', j.advanceMode) + ')' : '') : ''],
        [T.jbFinal, j.finalAmount != null && j.finalAmount !== '' ? money(j.finalAmount) : ''], [T.jbReady, j.readyAt ? fmtDT(j.readyAt) : ''], [T.jbIntake, lbl('INTAKE', j.intakeMode)], [T.jbDelScan, j.deliveryScan ? pill('DELIVERY_SCAN', j.deliveryScan) : ''],
        j.devicePassword ? [T.jbPassword, j.devicePassword] : null, [T.seBill, j.billNo], j.deliveredAt ? [lbl('JOB_STATUS', 'DELIVERED'), fmtDT(j.deliveredAt)] : null]))));
  }
  const A = h('div', { class: 'btns', id: 'jobActions' });
  if (canEdit && open) A.appendChild(btn(T.jbEdit, () => jobEditDialog(j), 'sec'));
  if (full && has('job.assign') && isMgr() && open) A.appendChild(btn(T.jbSetTech, () => actionDialog({ title: T.jbSetTech, action: 'job.setTech', fields: [{ k: 'techId', l: T.jbTech, t: 'sel', req: true, o: techOpts, dflt: j.techId }], build: v => ({ id: j.id, techId: v.techId }) }), 'sec'));
  if (full && isMgr() && open) A.appendChild(btn(T.jbSticker, () => actionDialog({ title: T.jbSticker, action: 'job.changeSticker', fields: [{ k: 'newSticker', l: T.jbNewSticker, t: 'code', sticker: 'RJ', req: true }], build: v => ({ id: j.id, newSticker: v.newSticker }), after: r => { m.close(); if (r.job && r.job.id) openJob(r.job.id); } }), 'sec'));
  if (has('job.status') && (open || awaiting(j))) A.appendChild(btn(T.jbReminder, () => actionDialog({ title: T.jbReminder, action: 'job.reminder', fields: [{ k: 'note', l: T.jbReminderNote, t: 'area', req: true, max: 300 }], build: v => ({ id: j.id, note: v.note }), ok: T.jbReminderDone }), 'sec'));
  /* R4life-06: a job the customer never collected (Ready / cancelled and waiting for the customer) - manager asks, owner decides */
  if (full && has('job.assign') && (j.status === 'READY' || j.awaitingReturn === true || j.awaitingReturn === 'Y')) A.appendChild(btn(T.jbAbandon, () => actionDialog({ title: fmt(T.jbAbandonTitle, { id: j.id }), intro: T.jbAbandonIntro, action: 'job.abandon', danger: true, submit: T.jbAbandon,
    fields: [{ k: 'outcome', l: T.jbAbandonOutcome, t: 'sel', req: true, placeholder: true, o: () => ['SOLD_FOR_DUES', 'SCRAPPED', 'HANDED_TO_OWNER'].map(v => ({ v, t: lbl('ABANDON', v) })) }, { k: 'amount', l: T.jbAbandonAmount, t: 'money', req: true, min: 1, hint: T.jbAbandonMoney, show: v => v.outcome === 'SOLD_FOR_DUES' }, { k: 'payMode', l: T.jbAbandonPay, t: 'sel', req: true, placeholder: true, show: v => v.outcome === 'SOLD_FOR_DUES', o: () => ['CASH', 'UPI', 'CARD', 'BANK'].map(v => ({ v, t: lbl('PAY', v) })) }, { k: 'reason', l: T.jbAbandonReason, t: 'area', req: true, max: 300 }],
    build: v => Object.assign({ id: j.id, outcome: v.outcome, reason: v.reason }, v.outcome === 'SOLD_FOR_DUES' ? { amount: v.amount, payMode: v.payMode } : {}), ok: x => (x.approvalId ? T.jbAbandonAsked : T.jbAbandoned) }), 'sec'));
  if (full && has('job.cancel') && open) A.appendChild(btn(T.jbCancel, () => actionDialog({ title: fmt(T.jbCancelTitle, { id: j.id }), intro: T.jbCancelIntro, action: 'job.cancel', danger: true, submit: T.jbCancel, fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ id: j.id, reason: v.reason }), ok: r => (r.approvalId ? T.sentForApproval : T.jbCancelled) }), 'sec'));
  if (full && isMgr() && !open && j.type !== 'QUICK' && (j.status !== 'ABANDONED' || isAdmin())) A.appendChild(btn(T.jbReopen, () => actionDialog({ title: T.jbReopen, action: 'job.reopen', fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ id: j.id, reason: v.reason }), ok: T.jbReopened }), 'sec'));
  box.appendChild(A);
  /* slips: only for roles that may see the pickup PIN */
  if (has('job.pin') && (open || awaiting(j))) {
    const slip = async (b, kind) => { b.disabled = true; const r = await api('job.slip', { id: j.id, kind }); b.disabled = false; if (!r.ok) { notify(r.msg, 'bad'); return; }
      const sm = slipDialog(kind === 'INTAKE' ? T.jbSlipIntake : T.jbSlipReady, r.text || '', j.mobile && !/\*/.test(j.mobile) ? j.mobile : '', [r.pin ? h('p', { class: 'slip-pin', text: fmt(T.jbPin, { pin: r.pin }) }) : null]);
      if (r.waLink && /^https:\/\/wa\.me\//.test(r.waLink)) { const a = $('#waLink', sm.el); if (a) a.href = r.waLink; else $('.foot-btns', sm.el).prepend(h('a', { class: 'btn good', id: 'waLink', target: '_blank', rel: 'noopener noreferrer', href: r.waLink, text: T.seWhatsApp })); }
      $('.foot-btns', sm.el).prepend(btn(T.jbSlipMark, async e => { const x = await runAction(e.currentTarget, 'job.slipSent', { id: j.id }, { ok: T.jbSlipMarked }); if (x.ok) sm.close(); }, ''));
    };
    box.appendChild(h('div', { class: 'card' }, h('h3', { text: T.jbSlips }), h('p', { class: 'hint', text: yes(j.slipSent) ? T.jbSlipSent : '' }), h('div', { class: 'btns' }, btn(T.jbSlipIntake, e => slip(e.currentTarget, 'INTAKE'), 'sec', { id: 'slipIntake' }), j.status === 'READY' ? btn(T.jbSlipReady, e => slip(e.currentTarget, 'READY'), 'sec', { id: 'slipReady' }) : null)));
  } else if (full && open && !yes(j.slipSent)) box.appendChild(note(T.jbSlipNotSent, 'warn'));
  if (full) {
    box.appendChild(h('div', { class: 'sect' }, h('h3', { text: T.jbEstimates }), canEdit && open ? btn(T.jbEstAdd, () => actionDialog({ title: T.jbEstAdd, action: 'job.estimate', fields: [{ k: 'amount', l: T.jbEstAmount, t: 'money', req: true, min: 0 }, { k: 'customerApproved', l: T.jbEstApproved, t: 'check' }, { k: 'how', l: T.jbEstHow, max: 120, wide: true }], build: v => Object.assign({ id: j.id }, v) }), 'sec sm', { id: 'estAdd' }) : null));
    box.appendChild(simpleTable([{ k: 'at', l: T.cAt, v: e => e.at || e.time || '', fmt: fmtDT }, { k: 'amount', l: T.jbEstAmount, num: true, fmt: money }, { k: 'customerApproved', l: T.jbEstApproved, v: e => lbl('YN', e.customerApproved) }, { k: 'how', l: T.jbEstHow }, { k: 'by', l: T.cBy, fmt: userName }], j.estimates || j.estimateLog || [], { empty: T.jbEstNone }));
    if (canEdit && open) {
      const F = mkForm([{ k: 'status', l: T.jbNewStatus, t: 'sel', req: true, o: opts('JOB_STATUS', OPEN_JOB.filter(s => s !== 'OUTSIDE' || j.status === 'OUTSIDE')) }, { k: 'promisedDate', l: T.jbPromised, t: 'date' }, { k: 'finalAmount', l: T.jbFinal, t: 'money' },
        { k: 'zeroReason', l: T.jbZeroReason, t: 'sel', o: opts('ZERO_REASON'), show: v => v.finalAmount === 0 }, { k: 'amountReason', l: T.jbAmountReason, max: 200 }, { k: 'note', l: T.jbNote, t: 'area', max: 300 }],
      { status: j.status, promisedDate: j.promisedDate, finalAmount: j.finalAmount, zeroReason: j.zeroReason });
      const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
      const U = unsureGuard(err, () => [F.el]); /* R37B-01: the update boxes are locked after an unsure answer; Save sends the same change again */
      const sb = btn(T.save, async () => {
        if (sb.dataset.busy) return; err.hidden = true; const ch = F.changed();
        if (!Object.keys(ch).length) { notify(T.jbNothing, 'ok'); return; }
        sb.dataset.busy = '1'; sb.disabled = true; const r = await U.run(() => callConfirmed('job.update', Object.assign({ id: j.id }, ch)), sb); /* R37B-01 */ delete sb.dataset.busy; sb.disabled = false;
        if (r.cancelled) return; if (!r.ok) { if (r.field) F.mark(r.field, ''); err.textContent = r.msg; err.hidden = false; return; }
        notify(T.jbUpdated, 'ok'); refresh();
      }, '', { id: 'jobSave' });
      box.appendChild(h('div', { class: 'card', id: 'jobUpdate' }, h('h3', { text: T.jbUpdate }), F.el, err, h('div', { class: 'btns' }, sb)));
    }
    box.appendChild(h('div', { class: 'sect' }, h('h3', { text: T.jbParts }), has('parts') && open ? h('div', { class: 'vactions' }, btn(T.jbFit, () => fitPartDialog(j.id), 'sec sm'), btn(T.jbPull, () => pullPartDialog(j.id), 'sec sm')) : null));
    box.appendChild(simpleTable([{ k: 'partId', l: T.cRef, main: true }, { k: 'type', l: T.cType, fmt: v => lbl('PART_TYPE', v) }, { k: 'spec', l: T.cSpec }, { k: 'serial', l: T.fSerial }], j.parts || [], { onRow: p => openPart(p.partId) }));
    box.appendChild(h('div', { class: 'sect' }, h('h3', { text: T.jbLines }), canEdit && open ? btn(T.jbLineAdd, () => actionDialog({ title: T.jbLineAdd, action: 'job.addLine', fields: [{ k: 'kind', l: T.jbLineKind, t: 'sel', req: true, o: opts('JOB_LINE', ['OTHER_CHARGE', 'CUSTOMER_PART', 'OUTSIDE_WORK']) }, { k: 'text', l: T.jbLineText, req: true, max: 120 }, { k: 'serial', l: T.fSerial, max: 40 }, { k: 'amount', l: T.jbLineAmount, t: 'money' }, isMgr() ? { k: 'cost', l: T.jbLineCost, t: 'money' } : null].filter(Boolean), build: v => Object.assign({ id: j.id }, v) }), 'sec sm') : null));
    box.appendChild(simpleTable([{ k: 'kind', l: T.jbLineKind, v: l => lbl('JOB_LINE', l.kind) }, { k: 'text', l: T.jbLineText, main: true }, { k: 'serial', l: T.fSerial }, { k: 'amount', l: T.jbLineAmount, num: true, fmt: v => (v == null || v === '' ? '' : money(v)) },
      has('cost.view') ? { k: 'cost', l: T.jbLineCost, num: true, fmt: v => (v == null || v === '' ? '' : money(v)) } : null, { k: 'act', l: '', act: true, el: () => (canEdit && open ? btn(T.remove, null, 'sec sm', { 'data-act': 'rm' }) : null) }].filter(Boolean), j.lines || [], { empty: T.jbLinesNone, onAct: async (a, l, b) => { if (!(await confirmBox(fmt(T.jbLineRemoveAsk, { text: l.text || lbl('JOB_LINE', l.kind) }), { yes: T.remove, danger: true }))) return; return runAction(b, 'job.removeLine', { id: j.id, lineId: l.lineId }); } }));
    const ob = h('div', { class: 'card' }, h('h3', { text: T.jbOutside }));
    if (j.move) { ob.appendChild(note(fmt(T.jbOutNow, { reason: lbl('OUT_REASON', j.move.reason), partner: j.move.partner || T.notSet, due: fmtDT(j.move.dueAt) }), isLate(j.move) ? 'bad' : 'warn')); if (role() === 'REPAIR' || isMgr()) ob.appendChild(btn(T.jbOutBack, () => outsideReturnDialog({ moveId: j.move.moveId, itemId: j.id }), 'sec')); }
    else if (open && has('outside') && (role() === 'REPAIR' || isMgr())) { ob.appendChild(h('p', { class: 'hint', text: T.jbOutHint })); ob.appendChild(btn(T.jbOutSend, () => outsideSendDialog(j.id, {}), 'sec')); }
    if (j.move || open) box.appendChild(ob);
  }
  if (deliverable && has('job.deliver')) box.appendChild(deliverBox(j));
  if (full) {
    box.appendChild(h('h3', { text: T.jbHistory }));
    box.appendChild(simpleTable([{ k: 'at', l: T.cAt, v: e => e.at || e.time || '', fmt: fmtDT }, { k: 'event', l: T.cAction, v: e => lbl('JOB_EVENT', e.event) }, { k: 'text', l: T.hText, main: true, v: e => e.text || e.details || '' }, { k: 'by', l: T.cBy, fmt: userName }], j.log || [], { empty: T.jbNoneYet }));
    if ((j.previous || []).length) { box.appendChild(h('h3', { text: T.jbPrevious })); box.appendChild(simpleTable([{ k: 'id', l: T.jbId, main: true }, { k: 'date', l: T.cDate, v: p => p.date || p.createdAt || '', fmt: v => (v ? fmtDate(v) : '') }, { k: 'problem', l: T.jbProblem, v: p => p.problem || lbl('PROBLEM', p.problemCode) }, { k: 'status', l: T.fStatus, v: p => lbl('JOB_STATUS', p.status) }], j.previous, { onRow: p => openJob(p.id) })); }
  }
}
function deliverBox(j) {
  const mgr = has('job.deliverNoPin');
  /* fix round 5: paid now = final amount - advance; a mixed payment carries its split; an advance above the bill is settled (refund + mode) */
  const cancelledJob = j.awaitingReturn === true || j.status === 'CANCELLED', adv5 = Number(j.held != null && j.held !== '' ? j.held : j.advance) || 0 /* T-fix (R3B-02): what the shop holds, also after an earlier delivery */, fin5 = v => (cancelledJob ? Number(v.finalAmount) || 0 : Number(j.finalAmount) || 0), over5 = v => Math.max(0, adv5 - fin5(v));
  const F = mkForm([{ k: 'billNo', l: T.jbBill, req: true, max: 40 }, cancelledJob ? { k: 'finalAmount', l: T.jbCheckCharge, t: 'money', req: true, min: 0, dflt: 0 } : null, { k: 'payMode', l: T.sePay, t: 'sel', req: true, placeholder: true, o: payOpts },
    { k: 'splitCASH', l: fmt(T.seSplit, { mode: lbl('PAY', 'CASH') }), t: 'money', show: v => v.payMode === 'MIXED' }, { k: 'splitUPI', l: fmt(T.seSplit, { mode: lbl('PAY', 'UPI') }), t: 'money', show: v => v.payMode === 'MIXED' },
    { k: 'splitCARD', l: fmt(T.seSplit, { mode: lbl('PAY', 'CARD') }), t: 'money', show: v => v.payMode === 'MIXED' }, { k: 'splitBANK', l: fmt(T.seSplit, { mode: lbl('PAY', 'BANK') }), t: 'money', show: v => v.payMode === 'MIXED' },
    adv5 > 0 ? { k: 'advanceRefund', l: fmt(T.jbAdvRefund, { advance: money(adv5) }), t: 'money', req: true, min: 0, show: v => over5(v) > 0 } : null, adv5 > 0 ? { k: 'advanceRefundMode', l: T.jbAdvRefundMode, t: 'sel', req: true, placeholder: true, o: payOpts1, show: v => over5(v) > 0 } : null,
    mgr ? { k: 'noPin', l: T.jbNoPin, t: 'check', hint: T.jbNoPinIntro } : null, { k: 'customerPin', l: T.jbCustPin, t: 'digits', len: 4, req: true, show: v => v.noPin !== 'Y' },
    { k: 'idType', l: T.jbIdType, t: 'sel', req: true, o: opts('ID_TYPE'), show: v => v.noPin === 'Y' }, { k: 'last4', l: T.jbIdLast4, t: 'digits', len: 4, req: true, show: v => v.noPin === 'Y' },
    { k: 'collName', l: T.jbCollector, max: 60, req: false }, { k: 'collMobile', l: T.jbCollectorMobile, t: 'mobile' }, { k: 'oldPartsReturned', l: T.jbOldParts, t: 'sel', req: true, placeholder: true, o: opts('OLD_PARTS') },
    { k: 'itemsReturned', l: T.jbItemsReturned, t: 'check', req: true }, mgr ? { k: 'noScanReason', l: T.jbNoScanReason, max: 200, wide: true } : null, mgr ? { k: 'partsNotSeenReason', l: T.jbPartsNotSeen, max: 200, wide: true } : null, { k: 'pin', l: T.yourPin, t: 'pin', req: true }].filter(Boolean));
  const err = h('div', { class: 'errbox', role: 'alert', hidden: true });
  const U = unsureGuard(err, () => [F.el]); /* R37B-01: the delivery boxes are locked after an unsure answer; the button sends the same delivery again */
  const b = btn(T.jbDeliverBtn, async () => {
    if (b.dataset.busy) return; err.hidden = true; const bad = F.check(); if (bad) { err.textContent = bad; err.hidden = false; return; }
    const v = F.get();
    if (v.noPin === 'Y' && !v.collName) { F.mark('collName', ''); err.textContent = fmt(T.required, { field: T.jbCollector }); err.hidden = false; return; }
    const d = { id: j.id, billNo: v.billNo, payMode: v.payMode, itemsReturned: v.itemsReturned, oldPartsReturned: v.oldPartsReturned, pin: v.pin };
    if (v.noPin === 'Y') d.idProof = { type: v.idType, last4: v.last4 }; else d.customerPin = v.customerPin;
    if (v.collName) d.collectedBy = { name: v.collName, mobile: v.collMobile }; if (v.noScanReason) d.noScanReason = v.noScanReason; if (v.partsNotSeenReason) d.partsNotSeenReason = v.partsNotSeenReason;
    if (cancelledJob) d.finalAmount = v.finalAmount; if (over5(v) > 0) { d.advanceRefund = v.advanceRefund; d.advanceRefundMode = v.advanceRefundMode; }
    if (v.payMode === 'MIXED') { d.paySplit = {}; ['CASH', 'UPI', 'CARD', 'BANK'].forEach(k => { if (v['split' + k]) d.paySplit[k] = v['split' + k]; }); }
    b.dataset.busy = '1'; b.disabled = true; const r = await U.run(() => callConfirmed('job.deliver', d), b); /* R37B-01 */ delete b.dataset.busy; b.disabled = false;
    if (r.cancelled) return;
    if (!r.ok) { F.clearErr(); if (r.field) F.mark(r.field, ''); if (r.code === 'PICKUP_PIN_WRONG') { F.set('customerPin', ''); F.mark('customerPin', ''); } if (r.code === 'AUTH_PIN_WRONG') F.mark('pin', ''); err.textContent = r.msg; err.hidden = false; return; }
    notify(T.jbDelivered, 'ok'); refresh();
  }, '', { id: 'jobDeliver' });
  const nsw = jobNoScanWait(j); /* R46A-04: said before the counter fills the form (the server stays the guard: the request may be decided meanwhile) */
  return h('div', { class: 'card', id: 'deliverBox' }, h('h3', { text: T.jbDeliver }), nsw ? note(fmt(T.jbDeliverWait, { id: nsw.id, type: lbl('APPR_TYPE', nsw.type), who: jobApprWho(nsw) }), 'bad') : null, F.el, err, h('div', { class: 'btns' }, b));
}
function jobEditDialog(j) {
  const lockedMobile = yes(j.slipSent) && !isMgr();
  return actionDialog({ title: fmt(T.jbEditTitle, { id: j.id }), wide: true, action: 'job.edit', init: j,
    fields: [{ k: 'customer', l: T.fCustomer, max: 60 }, { k: 'mobile', l: T.fMobile, t: /\*/.test(j.mobile || '') ? 'text' : 'mobile', ro: lockedMobile || /\*/.test(j.mobile || '') }, { k: 'brand', l: T.fBrand, t: 'sel', o: () => L().brands || [] }, { k: 'model', l: T.fModelOnly, max: 60 },
      { k: 'problemCode', l: T.jbProblem, t: 'sel', o: () => ((L().problems || []).length ? L().problems.map(c => ({ v: c, t: lbl('PROBLEM', c) })) : opts('PROBLEM')) }, { k: 'problem', l: T.jbProblemText, t: 'area', max: 200 },
      { k: 'receivedWith', l: T.jbReceivedWith, t: 'multi', o: opts('RECEIVED_WITH') }, { k: 'condition', l: T.jbCondition, max: 200, wide: true }, { k: 'devicePassword', l: T.jbPassword, max: 60 }],
    build: (v, F) => { const ch = F.changed(); if (!Object.keys(ch).length) { notify(T.jbNothing, 'ok'); return null; } return { id: j.id, fields: ch }; } });
}
function jobNoScanDialog(sticker) {
  return actionDialog({ title: T.jnTitle, intro: T.jnIntro, wide: true, action: 'job.createNoScan', init: { sticker },
    fields: [{ k: 'sticker', l: T.jnSticker, t: 'code', sticker: 'RJ', req: true }, { k: 'reason', l: T.jnReason, t: 'sel', req: true, o: opts('SCAN_MODE', ['NO_POWER', 'NO_OS', 'LOCKED', 'UNSUPPORTED']) }, { k: 'customer', l: T.fCustomer, req: true, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile', req: true },
      { k: 'whatsapp', l: T.jbWhatsapp, t: 'check', dflt: 'Y' }, { k: 'type', l: T.jnType, t: 'sel', req: true, o: opts('JOB_TYPE', ['IN_SHOP', 'ONSITE']), dflt: 'IN_SHOP' }, { k: 'brand', l: T.fBrand, t: 'sel', req: true, o: () => L().brands || [] }, { k: 'model', l: T.fModelOnly, max: 60 },
      { k: 'serial', l: T.jnSerial, t: 'code', cam: false, max: 40, noSticker: true }, { k: 'ramSerials', l: T.jnRam, max: 200 }, { k: 'diskSerials', l: T.jnDisk, max: 200 },
      { k: 'problemCode', l: T.jbProblem, t: 'sel', req: true, o: () => ((L().problems || []).length ? L().problems.map(c => ({ v: c, t: lbl('PROBLEM', c) })) : opts('PROBLEM')) }, { k: 'problem', l: T.jbProblemText, t: 'area', req: true, max: 200 },
      { k: 'receivedWith', l: T.jbReceivedWith, t: 'multi', o: opts('RECEIVED_WITH') }, { k: 'receivedOther', l: T.jbReceivedOther, max: 120, show: v => (v.receivedWith || []).indexOf('OTHER') >= 0 }, { k: 'condition', l: T.jbCondition, req: true, max: 200, wide: true },
      { k: 'estimate', l: T.jbEstimate, t: 'money' }, { k: 'advance', l: T.jbAdvance, t: 'money' }, { k: 'advanceMode', l: T.jbAdvMode, t: 'sel', req: true, o: payOpts1, show: v => Number(v.advance) > 0 }, { k: 'promisedDate', l: T.jbPromised, t: 'date' },
      { k: 'devicePassword', l: T.jbPassword, max: 60 }, { k: 'techId', l: T.jnTech, t: 'sel', req: true, placeholder: true, ph: T.jnTechPh, o: techOpts }, { k: 'comebackOf', l: T.jnComeback, t: 'code', sticker: 'RJ', cam: false }],
    build: v => { const d = Object.assign({}, v); const sp = s => String(s || '').split(/[\s,;]+/).map(x => x.trim().toUpperCase()).filter(Boolean); if (v.ramSerials || v.diskSerials) d.typedSerials = { ram: sp(v.ramSerials), disk: sp(v.diskSerials) }; delete d.ramSerials; delete d.diskSerials; d.receivedWith = v.receivedWith || []; return d; },
    ok: r => fmt(T.jnCreated, { id: r.jobId }) + (r.approvalId ? ' ' + T.sentForApproval : ''), after: r => openJob(r.jobId) });
}
function quickDialog() {
  return actionDialog({ title: T.jqTitle, intro: T.jqIntro, action: 'job.quick', fields: [{ k: 'customer', l: T.fCustomer, req: true, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile', req: true }, { k: 'work', l: T.jqWork, t: 'area', req: true, max: 200 }, { k: 'amount', l: T.jqAmount, t: 'money', req: true, min: 0 },
    { k: 'billNo', l: T.jbBill, req: true, max: 40 }, { k: 'payMode', l: T.sePay, t: 'sel', req: true, placeholder: true, o: payOpts1 }], ok: r => fmt(T.jqDone, { id: r.jobId }) });
}
