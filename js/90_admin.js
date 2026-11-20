/* GJ App v4 — V23 staff, V24 devices, V25 settings, V26 log / history. */
'use strict';
Object.assign(C, { CFG_TYPE: { TIME: 'Time', INT: 'Number', MONEY: 'Amount', YN: 'Yes / No', EMAIL: 'E-mail address', USERS: 'Staff list', LIST: 'List', DATES: 'Dates', TEXT: 'Text' }, SUMMARY: { AM: 'Morning brief', PM: 'Closing summary' } });
Object.assign(T, {
  usTitle: 'Staff', usNew: '+ New staff member', usName: 'Name', usRole: 'Role', usActive: 'Active', usInactive: 'Not active', usLocked: 'Locked', usActing: 'Acting manager until', usExtra: 'Extra permissions (codes separated by commas)', usEmpty: 'No staff yet.',
  usCard: '{name}', usEdit: 'Edit', usEditTitle: 'Edit staff member', usNewTitle: 'New staff member', usOwnRow: 'Role and Active cannot be changed on your own account.', usReset: 'Reset PIN', usResetAsk: 'Reset the PIN of {name}? Their current PIN stops working at once.',
  usUnlock: 'Unlock', usUnlocked: 'Account unlocked.', usMoveAsk: '{name} moves out of {from}. The open repair jobs of {name} go to the manager (to you when there is no active manager) and the scan cycles of {name} in that section are cleared (the manager is responsible until you set the rota). Continue?', usMoveYes: 'Move', usMoved: 'Jobs moved: {jobs}. Scan cycles cleared: {cycles}.', usAbsent: 'Leave / absence', usAbsentDone: 'Leave of {name} saved.', usAbsentTitle: 'Leave / absence — {name}', usAbsentNow: 'Recorded leave: {list}.', usAbsentFrom: 'From', usAbsentTo: 'To (last day of leave)', usAbsentClear: 'Remove the leave that starts on the From date instead', usLeft: 'Staff has left', usLeftTitle: 'Staff has left — {name}',
  usLeftIntro: 'The account is disabled and their devices are disabled. A pendrive that only this person used is disabled too; a shared pendrive stays active (collect it, or disable it under Devices). Colleagues who used the same devices must set a new PIN at the next login. Items in their name are listed next so that you can reassign them.',
  usForceAll: 'Every staff member must set a new PIN (not only those who shared a device)', usPendrives: 'Pendrives used in the last 30 days', usPdLabel: 'Pendrive', usPdShared: 'Also used by', usPdState: 'State', usPdRevoked: 'Disabled', usPdActive: 'Still active - collect it or disable it under Devices',
  usPinForced: 'Must set a new PIN: {names}', usPinNone: 'No colleague has to set a new PIN.',
  usTempTitle: 'Temporary PIN', usTempMsg: 'Give this PIN to {name} in person. They must set their own PIN at the first login. It is shown only once.', usTempNoted: 'I have noted the PIN', usOpenItems: 'Items in the name of {name}', usNoOpen: 'Nothing is open in their name.',
  usReassign: 'Reassign', usReassignTo: 'Reassign to', usReassigned: 'Reassigned.', usCountRota: 'Daily count rota', usRotaNone: 'Not set (Settings)', usMust: 'Must set a new PIN',
  dvTitle: 'Devices', dvLabel: 'Device name', dvKind: 'Kind', dvAgent: 'Browser / system', dvUsb: 'USB serial', dvSeen: 'Last seen', dvNotSeen: 'Not seen for {n} days', dvUsers: 'Allowed users', dvAllUsers: 'All staff', dvAdmin: 'Owner may sign in on this device',
  dvCustomer: 'Customer laptops only', dvRevoke: 'Disable device', dvRevokeAsk: 'Disable "{label}" permanently? It will have to be registered and approved again.', dvRevokeSel: 'Disable selected', dvRevokeSelAsk: 'Disable {n} selected devices permanently?', dvRevoked: 'Device disabled.',
  dvEmpty: 'No devices.', dvEditTitle: 'Device — {label}', dvFewAdmin: 'The owner account has fewer than two approved devices. Register and approve a second device now, so that a lost device does not lock you out.', dvRequested: 'Requested by', dvThis: 'this device',
  cfTitle: 'Settings', cfKey: 'Setting', cfValue: 'Value', cfNote: 'Meaning', cfChange: 'Change', cfPending: 'New value {v} applies from {t}', cfEditTitle: 'Change setting — {key}', cfNewValue: 'New value', cfListHint: 'One entry per line.', cfDatesHint: 'One date per line, as YYYY-MM-DD.',
  cfSaved: 'Setting saved.', cfSavedLater: 'Saved. The new value applies from {t}.', cfTestMail: 'Send test mail', cfTestTo: 'Send a test e-mail to', cfTestSent: 'Test e-mail sent.', cfSendPm: 'Send closing summary now', cfSendAm: 'Send morning brief now', cfSummarySent: '{kind} sent.',
  cfSummaryQueued: 'The e-mail limit is reached; it will be sent later.', cfNetwork: 'Add shop network', cfOutsideDays: 'Outside days - {reason}', cfSalesRecord: 'Sales staff record sales themselves', cfNetworkTitle: 'Add shop network', cfNetworkHash: 'Network code (from the "scan from an unknown network" alert)', cfNetworkAdded: 'Network added.', cfBadTime: 'Enter the time as HH:MM.', cfBadEmail: 'Enter a valid e-mail address.', cfEmailsHint: 'Up to three e-mail addresses, separated by commas.', cfGeneral: 'General', cfEmpty: 'No settings available.',
  lgTitle: 'Log / History', lgTabLog: 'Activity log', lgTabHist: 'Change history', lgUser: 'User', lgAction: 'Action code', lgTable: 'Table', lgId: 'Record ID', lgField: 'Field', lgFrom: 'Before', lgTo: 'After', lgDevice: 'Device', lgResult: 'Result', lgEmpty: 'No entries match.'
});
/* The temporary PIN is shown once; the dialog closes only with its own button (F412). */
function tempPinDialog(name, pin) {
  const m = openModal({ title: T.usTempTitle, closable: false });
  append(m.body, [h('p', { text: fmt(T.usTempMsg, { name }) }), h('div', { class: 'paircode', id: 'tempPin', text: pin })]);
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.usTempNoted, () => closeModal(m, false), '', { id: 'tempPinNoted', 'data-autofocus': '' })));
}
VIEWS.staff = {
  title: T.usTitle, perm: () => has('admin.users'),
  render(root) {
    const admin = isAdmin();
    /* fix round 5 (R5access-09): the owner may limit a person to named devices */
    let devOpts5 = []; if (isAdmin()) api('admin.devices', {}).then(r => { if (r.ok) devOpts5 = (r.devices || []).filter(d => d.status === 'APPROVED').map(d => ({ v: d.deviceId, t: d.label })); });
    const fields = (u, own) => [{ k: 'name', l: T.usName, req: true, max: 60 }, { k: 'mobile', l: T.fMobile, t: 'mobile', req: true }, own ? null : { k: 'role', l: T.usRole, t: 'sel', req: true, o: opts('ROLE') }, own ? null : { k: 'active', l: T.usActive, t: 'check', dflt: 'Y' },
      { k: 'actingUntil', l: T.usActing, t: 'date', show: v => v.role === 'SALES' || v.role === 'REPAIR' }, isAdmin() && u && !own ? { k: 'ownDevices', l: T.usOwnDevices, t: 'multi', o: () => devOpts5, wide: true } : null, { k: 'extraPerms', l: T.usExtra, max: 300, wide: true }].filter(Boolean);
    const saveData = (v, F, u) => { const d = u ? Object.assign({ userId: u.userId }, F.changed()) : Object.assign({}, v); if (d.extraPerms != null) d.extraPerms = String(d.extraPerms).split(/[\s,;]+/).filter(Boolean); return d; };
    viewHead(root, T.usTitle, [admin ? btn(T.usNew, () => actionDialog({ title: T.usNewTitle, action: 'admin.userSave', fields: fields(null, false), build: (v, F) => saveData(v, F, null), ok: () => '', after: (r, v) => { reloadLists(); if (r.tempPin) tempPinDialog(v.name, r.tempPin); } }), '', { id: 'staffNew' }) : null]);
    S.refresh = load(root, 'admin.users', {}, (r, box) => {
      const users = r.users || [], staffRow = u => u.role === 'SALES' || u.role === 'REPAIR', act = u => !(u.active === 'N' || u.active === false), locked = u => yes(u.locked) || !!u.lockedUntil;
      const cols = [{ k: 'name', l: T.usName, main: true }, { k: 'role', l: T.usRole, v: u => lbl('ROLE', u.role) }, { k: 'mobile', l: T.fMobile }, { k: 'status', l: T.fStatus, v: u => (act(u) ? T.usActive : T.usInactive) + (locked(u) ? ' — ' + T.usLocked : ''), el: u => [h('span', { class: 'pill ' + (act(u) ? 'good' : 'bad'), text: act(u) ? T.usActive : T.usInactive }), locked(u) ? h('span', { class: 'pill warn', text: T.usLocked }) : null, yes(u.mustChangePin) ? h('span', { class: 'pill plain', text: T.usMust }) : null] },
        { k: 'actingUntil', l: T.usActing, fmt: v => (v ? fmtDate(v) : '') }, { k: 'extraPerms', l: T.usExtra, v: u => (u.extraPerms || []).join(', ') }];
      box.appendChild(tools('Staff', T.usTitle, cols, async () => users));
      box.appendChild(simpleTable(cols, users, { empty: T.usEmpty, onRow: u => userCard(u) }));
      const rot = r.rotas || {};
      box.appendChild(h('div', { class: 'card' }, h('h2', { text: T.usCountRota }), kv(['SALES', 'REPAIR'].map(s => [lbl('SECTION', s), (rot[s] || rot[s.toLowerCase()] || []).map(userName).join(' → ') || T.usRotaNone]))));
      function userCard(u) {
        const own = u.userId === S.me.userId, m = openModal({ title: fmt(T.usCard, { name: u.name }) }), may = admin || staffRow(u);
        m.body.appendChild(kv([[T.usRole, lbl('ROLE', u.role)], [T.fMobile, u.mobile], [T.fStatus, act(u) ? T.usActive : T.usInactive], [T.usLocked, locked(u) ? (u.lockedUntil ? fmtDT(u.lockedUntil) : T.yes) : ''], [T.usActing, u.actingUntil ? fmtDate(u.actingUntil) : '']]));
        if (own) m.body.appendChild(note(T.usOwnRow));
        const A = h('div', { class: 'btns', id: 'userActions' });
        if (admin) A.appendChild(btn(T.usEdit, () => { m.close(); actionDialog({ title: T.usEditTitle, action: 'admin.userSave', init: Object.assign({}, u, { active: act(u) ? 'Y' : 'N', extraPerms: (u.extraPerms || []).join(', ') }), fields: fields(u, own),
          build: (v, F) => { const d = saveData(v, F, u); if (Object.keys(d).length < 2) { notify(T.edNothing, 'ok'); return null; } return d; },
          /* R4life-09: moving a person to the other section moves his open jobs and scan cycles - the owner is asked first */
          run: async d => { const sec = r => (r === 'SALES' || r === 'REPAIR' ? r : ''); if (d.role && sec(u.role) && sec(d.role) !== sec(u.role) && !(await confirmBox(fmt(T.usMoveAsk, { name: u.name, from: lbl('ROLE', u.role) }), { yes: T.usMoveYes }))) return { ok: false, cancelled: true }; return callConfirmed('admin.userSave', d); },
          after: x => { reloadLists(); const it = x && x.openItems; if (it && it.jobs) notify(fmt(T.usMoved, { jobs: it.jobs.length ? it.jobs.map(j => j.id + ' -> ' + j.to).join(', ') : T.none, cycles: (it.rotaCycles || []).length ? it.rotaCycles.join(', ') : T.none }), 'ok'); } }); }, 'sec', { id: 'userEdit' }));
        if (may && !own) A.appendChild(btn(T.usReset, async e => { if (!(await confirmBox(fmt(T.usResetAsk, { name: u.name }), { yes: T.usReset, danger: true }))) return; const x = await runAction(e.currentTarget, 'admin.pinReset', { userId: u.userId }, { ok: false }); if (x.ok) { m.close(); tempPinDialog(u.name, x.tempPin); } }, 'sec', { id: 'userReset' }));
        if (may && locked(u)) A.appendChild(btn(T.usUnlock, async e => { const x = await runAction(e.currentTarget, 'admin.unlock', { userId: u.userId }, { ok: T.usUnlocked }); if (x.ok) m.close(); }, 'sec'));
        /* UI-07 / R4life-10: leave as a date range, with the recorded leave listed and removable */
        if (has('rota') && staffRow(u) && act(u)) A.appendChild(btn(T.usAbsent, () => { m.close(); actionDialog({ title: fmt(T.usAbsentTitle, { name: u.name }), intro: (u.absent || []).length ? fmt(T.usAbsentNow, { list: u.absent.map(r => r.from === r.to ? fmtDate(r.from) : fmtDate(r.from) + ' - ' + fmtDate(r.to)).join(', ') }) : '', action: 'rota.absent',
          fields: [{ k: 'from', l: T.usAbsentFrom, t: 'date', req: true, dflt: todayISO() }, { k: 'to', l: T.usAbsentTo, t: 'date', req: true, dflt: todayISO() }, { k: 'clear', l: T.usAbsentClear, t: 'check' }],
          build: v => (v.clear ? { userId: u.userId, clear: 'Y', from: v.from } : { userId: u.userId, from: v.from, to: v.to }), ok: () => fmt(T.usAbsentDone, { name: u.name }), after: reloadLists }); }, 'sec'));
        if (admin && !own && act(u)) A.appendChild(btn(T.usLeft, () => { m.close(); actionDialog({ title: fmt(T.usLeftTitle, { name: u.name }), intro: T.usLeftIntro, action: 'admin.staffLeft', pin: true, danger: true, submit: T.usLeft, fields: [{ k: 'forcePinAll', l: T.usForceAll, t: 'check' }], build: v => ({ userId: u.userId, forcePinAll: v.forcePinAll ? 'Y' : 'N' }), ok: () => '', after: x => { reloadLists(); openItemsDialog(u, x.openItems || {}, x); } }); }, 'bad', { id: 'userLeft' }));
        m.body.appendChild(A);
        append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
      }
    });
  }
};
function openItemsDialog(u, items, res) {
  const m = openModal({ title: fmt(T.usOpenItems, { name: u.name }), wide: true });
  res = res || {};
  if ((res.pendrivesUsed || []).length) { /* fix round 3 (sim #15): the pendrives the person used; a shared one stays active until revoked */
    m.body.appendChild(h('h3', { text: T.usPendrives }));
    m.body.appendChild(simpleTable([{ k: 'label', l: T.usPdLabel, main: true }, { k: 'shared', l: T.usPdShared, v: x => (x.shared === 'Y' ? (x.sharedWith || []).join(', ') : T.no) }, { k: 'revoked', l: T.usPdState, v: x => (x.revoked === 'Y' ? T.usPdRevoked : T.usPdActive) }], res.pendrivesUsed));
  }
  if (res.pinForced) m.body.appendChild(note(res.pinForced.length ? fmt(T.usPinForced, { names: res.pinForced.join(', ') }) : T.usPinNone, 'ok'));
  const groups = [['TRANSIT', items.transit], ['MOVE', (items.moves || []).map(x => (typeof x === 'object' && x.moveId ? { ref: x.moveId, text: x.itemId } : x))], ['JOB', items.jobs], ['RESERVATION', items.reservations], ['APPROVAL', items.approvals], ['SALE', items.unconfirmedSales || items.sales]].filter(g => (g[1] || []).length);
  if (!groups.length) m.body.appendChild(note(T.usNoOpen, 'ok'));
  groups.forEach(g => {
    m.body.appendChild(h('h3', { text: lbl('REASSIGN', g[0]) }));
    const can = ['TRANSIT', 'MOVE', 'JOB', 'RESERVATION'].indexOf(g[0]) >= 0;
    m.body.appendChild(simpleTable([{ k: 'ref', l: T.cRef, main: true, v: x => (typeof x === 'string' ? x : x.ref || x.id) }, { k: 'text', l: T.hText, v: x => (typeof x === 'string' ? '' : x.text || '') },
      { k: 'to', l: T.usReassignTo, el: () => { if (!can) return null; const s = h('select', { 'aria-label': T.usReassignTo }); s.appendChild(h('option', { value: '', text: T.select })); userOpts(x => x.userId !== u.userId).forEach(o => s.appendChild(h('option', { value: o.v, text: o.t }))); return s; } },
      { k: 'act', l: '', act: true, el: () => (can ? btn(T.usReassign, null, 'sec sm', { 'data-act': 're' }) : null) }], g[1],
    { onAct: async (a, x, b) => { const s = $('select', b.closest('tr')); if (!s.value) { s.focus(); return; } const ref = typeof x === 'string' ? x : x.ref || x.id;
      actionDialog({ title: T.usReassign + ' ' + ref, action: 'admin.reassign', fields: [{ k: 'reason', l: T.fReason, t: 'area', req: true, max: 200 }], build: v => ({ kind: g[0], ref, userId: s.value, reason: v.reason }), ok: T.usReassigned, refresh: false, after: () => { const tr = b.closest('tr'); if (tr) tr.remove(); } }); } }));
  });
  append(m.foot, h('div', { class: 'foot-btns' }, btn(T.close, () => m.close(), 'sec')));
}

/* ---------- V24 devices ---------- */
VIEWS.devices = {
  title: T.dvTitle, perm: () => has('admin.devices'),
  render(root) {
    const picked = {};
    const bulk = btn(T.dvRevokeSel, async () => { const ids = Object.keys(picked).filter(k => picked[k]); if (!ids.length) return; if (!(await confirmBox(fmt(T.dvRevokeSelAsk, { n: ids.length }), { danger: true, yes: T.dvRevokeSel }))) return;
      bulk.disabled = true; for (const id of ids) { const r = await api('admin.deviceSave', { deviceId: id, revoke: 'Y' }); if (!r.ok) { notify(r.msg, 'bad'); break; } } bulk.disabled = false; refresh(); }, 'sec', { id: 'dvBulk' });
    viewHead(root, T.dvTitle, [bulk]);
    root.addEventListener('change', e => { const c = e.target.closest('input[data-pick]'); if (c) picked[c.dataset.pick] = c.checked; });
    S.refresh = load(root, 'admin.devices', {}, async (r, box) => {
      Object.keys(picked).forEach(k => delete picked[k]);
      const devs = r.devices || [], mine = ((await Net.device()) || {}).id;
      if (devs.filter(d => d.status === 'APPROVED' && yes(d.adminAllowed) && d.kind === 'WEB').length < 2) box.appendChild(note(T.dvFewAdmin, 'warn'));
      const cols = [{ k: 'sel', l: T.apSelect, act: true, noCsv: true, el: d => (d.status === 'APPROVED' && d.deviceId !== mine ? h('label', { class: 'tick' }, h('input', { type: 'checkbox', 'aria-label': T.apSelect + ' ' + d.label, dataset: { pick: d.deviceId } })) : null) },
        { k: 'label', l: T.dvLabel, main: true, v: d => d.label + (d.deviceId === mine ? ' (' + T.dvThis + ')' : '') }, { k: 'kind', l: T.dvKind, v: d => lbl('DEVICE_KIND', d.kind) }, { k: 'status', l: T.fStatus, v: d => lbl('DEVICE_STATUS', d.status), el: d => pill('DEVICE_STATUS', d.status) }, { k: 'agent', l: T.dvAgent },
        { k: 'usbSerial', l: T.dvUsb }, { k: 'lastSeen', l: T.dvSeen, v: d => (d.lastSeen ? fmtDT(d.lastSeen) : T.never) + (Number(d.notSeenDays) >= 7 ? ' — ' + fmt(T.dvNotSeen, { n: d.notSeenDays }) : '') }, { k: 'requestedBy', l: T.dvRequested, v: d => userName(d.requestedBy) },
        { k: 'allowedUsers', l: T.dvUsers, v: d => ((d.allowedUsers || []).length ? d.allowedUsers.map(userName).join(', ') : T.dvAllUsers) }, { k: 'adminAllowed', l: T.dvAdmin, v: d => lbl('YN', yes(d.adminAllowed) ? 'Y' : 'N') }, { k: 'customerUse', l: T.dvCustomer, v: d => (d.kind === 'PENDRIVE' ? lbl('YN', yes(d.customerUse) ? 'Y' : 'N') : '') }];
      box.appendChild(tools('Devices', T.dvTitle, cols, async () => devs));
      box.appendChild(simpleTable(cols, devs, { empty: T.dvEmpty, onRow: d => {
        if (d.status !== 'APPROVED') return;
        actionDialog({ title: fmt(T.dvEditTitle, { label: d.label }), action: 'admin.deviceSave', init: { label: d.label, allowScope: (d.allowedUsers || []).length ? 'LIST' : 'ALL', allowedUsers: d.allowedUsers || [], adminAllowed: yes(d.adminAllowed) ? 'Y' : 'N', customerUse: yes(d.customerUse) ? 'Y' : 'N' },
          fields: [{ k: 'label', l: T.dvLabel, req: true, max: 40 }, { k: 'allowScope', l: T.apAllowScope, t: 'sel', req: true, o: [{ v: 'ALL', t: T.apAllowAll }, { v: 'LIST', t: T.apAllowList }] }, { k: 'allowedUsers', l: T.dvUsers, t: 'multi', req: true, o: () => userOpts(), needList: true, show: v => v.allowScope === 'LIST' } /* RV32-02: the same explicit choice as at approval */, { k: 'adminAllowed', l: T.dvAdmin, t: 'check' }, d.kind === 'PENDRIVE' ? { k: 'customerUse', l: T.dvCustomer, t: 'check' } : null].filter(Boolean),
          build: (v, F) => { const ch = F.changed(), o = Object.assign({ deviceId: d.deviceId }, v); delete o.allowScope; delete o.allowedUsers; if ('allowScope' in ch || 'allowedUsers' in ch) o.allowedUsers = v.allowScope === 'ALL' ? 'ALL' : (v.allowedUsers || []); return o; }, /* RV32-02 / R33C-04: the explicit choice, sent only when it changed */
          extra: (body, F, m) => { if (d.deviceId !== mine) body.appendChild(h('div', { class: 'btns' }, btn(T.dvRevoke, async e => { if (!(await confirmBox(fmt(T.dvRevokeAsk, { label: d.label }), { danger: true, yes: T.dvRevoke }))) return; const x = await runAction(e.currentTarget, 'admin.deviceSave', { deviceId: d.deviceId, revoke: 'Y' }, { ok: T.dvRevoked }); if (x.ok) { F.dirty = false; m.close(); } }, 'bad', { id: 'dvRevoke' }))); } });
      } }));
    });
  }
};

/* ---------- V25 settings (typed editors; nothing is a raw prompt) ---------- */
/* keyLabel (UI-04): "Outside Days OUTSIDE_REPAIR" -> "Outside days - Outside repair"; other keys as they are */
function keyLabel(k) { const m = /^Outside Days ([A-Z_]+)$/.exec(String(k || '')); if (m) return fmt(T.cfOutsideDays, { reason: lbl('OUT_REASON', m[1]) }); const m2 = /^Outside Charge Alert ([A-Z_]+)$/.exec(String(k || '')); if (m2) return fmt(T.cfOutsideCharge, { reason: lbl('OUT_REASON', m2[1]) }); return k === 'SALES_CAN_RECORD_SALE' ? T.cfSalesRecord : k; }
VIEWS.settings = {
  title: T.cfTitle, perm: () => has('admin.config'),
  render(root) {
    const admin = isAdmin();
    const summary = kind => async e => { const r = await runAction(e.currentTarget, 'admin.sendSummary', { kind }, { ok: false, refresh: false }); if (r.ok) notify(yes(r.sent) ? fmt(T.cfSummarySent, { kind: lbl('SUMMARY', kind) }) : T.cfSummaryQueued, 'ok'); };
    viewHead(root, T.cfTitle, admin ? [btn(T.cfSendPm, summary('PM'), 'sec', { id: 'cfSendPm' }), btn(T.cfSendAm, summary('AM'), 'sec', { id: 'cfSendAm' }),
      btn(T.cfNetwork, () => actionDialog({ title: T.cfNetworkTitle, action: 'admin.networkAdd', fields: [{ k: 'hash', l: T.cfNetworkHash, req: true, max: 80, wide: true }], ok: T.cfNetworkAdded, refresh: false }), 'sec')] : null);
    const show = (s, v) => (Array.isArray(v) ? (s.type === 'USERS' ? v.map(userName).join(', ') : v.join(', ')) : (s.type === 'YN' ? lbl('YN', v) : (s.type === 'MONEY' && v !== '' && v != null ? money(v) : (s.type === 'USERS' ? String(v || '').split(',').filter(Boolean).map(x => userName(x.trim())).join(', ') : String(v == null ? '' : v)))));
    S.refresh = load(root, 'admin.config', {}, (r, box) => {
      const all = r.settings || []; if (!all.length) { box.appendChild(h('p', { class: 'empty', text: T.cfEmpty })); return; }
      const groups = {}; all.forEach(s => { const g = s.group || T.cfGeneral; (groups[g] = groups[g] || []).push(s); });
      const cols = [{ k: 'key', l: T.cfKey, main: true, v: s => keyLabel(s.key) }, { k: 'value', l: T.cfValue, main: true, v: s => show(s, s.value), el: s => [h('span', { text: show(s, s.value) }), s.pendingValue != null && s.pendingValue !== '' ? h('div', { class: 'hint pending', text: fmt(T.cfPending, { v: show(s, s.pendingValue), t: fmtDT(s.pendingFrom) }) }) : null] },
        { k: 'note', l: T.cfNote }, { k: 'act', l: '', act: true, el: s => [btn(T.cfChange, null, 'sec sm', { 'data-act': 'edit' }), (s.type === 'EMAIL' || s.type === 'EMAILS') && admin ? btn(T.cfTestMail, null, 'sec sm', { 'data-act': 'mail' }) : null] }];
      box.appendChild(tools('Settings', T.cfTitle, cols, async () => all));
      Object.keys(groups).forEach(g => { box.appendChild(h('h2', { text: g })); box.appendChild(simpleTable(cols, groups[g], { onAct: (a, s) => (a === 'mail' ? actionDialog({ title: T.cfTestMail, action: 'admin.testMail', fields: [{ k: 'to', l: T.cfTestTo, t: 'email', req: true, dflt: Array.isArray(s.value) ? s.value[0] : String(s.value || '').split(',')[0].trim() }], ok: T.cfTestSent, refresh: false }) : editSetting(s)) })); });
    });
    function editSetting(s) {
      const arr = Array.isArray(s.value), list = v => (arr ? v : String(v || '').split(',').map(x => x.trim()).filter(Boolean)); let fd;
      switch (s.type) {
        case 'TIME': fd = { k: 'value', l: T.cfNewValue, t: 'time', req: true, dflt: s.value }; break;
        case 'INT': fd = { k: 'value', l: T.cfNewValue, t: 'int', req: true, dflt: s.value, min: s.min != null ? Number(s.min) : undefined, maxv: s.max != null ? Number(s.max) : undefined, hint: s.min != null && s.max != null ? s.min + ' – ' + s.max : '' }; break;
        case 'MONEY': fd = { k: 'value', l: T.cfNewValue, t: 'money', req: true, dflt: s.value }; break;
        case 'YN': fd = { k: 'value', l: T.cfNewValue, t: 'sel', req: true, o: opts('YN'), dflt: s.value }; break;
        case 'EMAIL': fd = { k: 'value', l: T.cfNewValue, t: 'email', dflt: s.value }; break;
        case 'EMAILS': fd = { k: 'value', l: T.cfNewValue, max: 300, wide: true, hint: T.cfEmailsHint, dflt: s.value }; break;
        case 'USERS': fd = { k: 'value', l: T.cfNewValue, t: 'multi', o: () => userOpts(), dflt: list(s.value) }; break;
        case 'LIST': fd = { k: 'value', l: T.cfNewValue, t: 'area', max: 4000, hint: T.cfListHint, dflt: list(s.value).join('\n') }; break;
        case 'DATES': fd = { k: 'value', l: T.cfNewValue, t: 'area', max: 4000, hint: T.cfDatesHint, dflt: list(s.value).join('\n') }; break;
        default: fd = { k: 'value', l: T.cfNewValue, max: 300, dflt: s.value, wide: true };
      }
      const verAhead = (st, val) => { if (st.key !== 'Min App Version' && st.key !== 'Min Pendrive Version') return ''; val = String(val || '').trim(); if (!/^\d+\.\d+\.\d+$/.test(val)) return T.cfVerFormat;
        const app = st.key === 'Min App Version', have = app ? APP_VERSION : (/^\d+\.\d+\.\d+$/.test(String(st.maxVersion || '')) ? st.maxVersion : ''); if (!app && /^\d+\.\d+\.\d+$/.test(String(st.value || '')) && cmpVer(val, st.value) <= 0) return ''; /* RV38-02: lowering the pendrive minimum is always possible (as on the server) */
        return have && cmpVer(val, have) > 0 ? fmt(app ? T.cfVerAheadApp : T.cfVerAheadPd, { have }) : ''; };
      actionDialog({ title: fmt(T.cfEditTitle, { key: keyLabel(s.key) }), intro: s.note || '', action: 'admin.configSave', pin: true, fields: [fd],
        /* R37B-05: a minimum version above the app in use (or above the newest pendrive the server knows) would lock every client out,
           the owner's own app included - refused here and by the server */
        validate: v => verAhead(s, v.value) || (s.type === 'TIME' && !/^\d{2}:\d{2}$/.test(v.value || '') ? T.cfBadTime : ((s.type === 'EMAIL' || s.type === 'EMAILS') && v.value && String(v.value).split(',').some(x => !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x.trim())) ? T.cfBadEmail : (s.type === 'DATES' && String(v.value || '').split(/\n/).some(x => x.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(x.trim())) ? T.cfDatesHint : ''))),
        build: v => { let val = v.value === undefined ? '' : v.value; if (s.type === 'LIST' || s.type === 'DATES') { val = String(val).split(/\n/).map(x => x.trim()).filter(Boolean); if (!arr) val = val.join(','); } else if (s.type === 'USERS' && !arr) val = (val || []).join(','); return { key: s.key, value: val }; },
        ok: x => (x.applied === 'N' || x.applied === false ? fmt(T.cfSavedLater, { t: fmtDT(x.pendingFrom) }) : T.cfSaved), after: reloadLists });
    }
  }
};

/* ---------- V26 log / history ---------- */
VIEWS.log = {
  title: T.lgTitle, perm: () => has('admin.log'),
  render(root) {
    viewHead(root, T.lgTitle);
    const tabs = h('div', { class: 'tabs', role: 'tablist' }), pane = h('div'); append(root, [tabs, pane]);
    const period = [{ k: 'from', l: T.rpFrom, t: 'date', dflt: todayISO() }, { k: 'to', l: T.rpTo, t: 'date', dflt: todayISO() }], userF = { k: 'user', l: T.lgUser, t: 'sel', o: () => (L().users || []).map(u => ({ v: u.name, t: u.name })), ph: T.all };   /* the log stores user names */
    const tabLog = () => { clear(pane); const lv = listView(pane, { action: 'admin.log', name: 'Activity_log', title: T.lgTabLog, empty: T.lgEmpty, filters: [userF, { k: 'action', l: T.lgAction, max: 40 }].concat(period),
      cols: [{ k: 'at', l: T.cAt, v: x => x.at || x.time || '', fmt: fmtDT }, { k: 'user', l: T.lgUser, v: x => userName(x.user) }, { k: 'action', l: T.cAction, main: true, v: x => humanAction(x.action) }, { k: 'ref', l: T.cRef, main: true }, { k: 'result', l: T.lgResult, v: x => (/^[A-Z_]+$/.test(String(x.result || '')) ? humanCode(x.result) : x.result) }, { k: 'text', l: T.hText, v: x => x.text || x.details || '' }, { k: 'device', l: T.lgDevice }], onRow: x => { openRef(x.ref); } }); S.refresh = lv.reload; };
    const tabHist = () => { clear(pane); const lv = listView(pane, { action: 'admin.history', name: 'Change_history', title: T.lgTabHist, empty: T.lgEmpty, filters: [userF, { k: 'table', l: T.lgTable, max: 40 }, { k: 'rowId', l: T.lgId, t: 'code', cam: false, max: 40 }].concat(period),
      cols: [{ k: 'at', l: T.cAt, v: x => x.at || x.time || '', fmt: fmtDT }, { k: 'user', l: T.lgUser, v: x => userName(x.user) }, { k: 'table', l: T.lgTable }, { k: 'rowId', l: T.lgId, main: true }, { k: 'field', l: T.lgField, main: true }, { k: 'old', l: T.lgFrom }, { k: 'new', l: T.lgTo }, { k: 'action', l: T.cAction, v: x => humanAction(x.action) }], onRow: x => { openRef(x.rowId); } }); S.refresh = lv.reload; };
    [[T.lgTabLog, tabLog], [T.lgTabHist, tabHist]].forEach((t, i) => tabs.appendChild(h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': i ? 'false' : 'true', text: t[0], onclick: e => { $$('.tab', tabs).forEach(x => x.setAttribute('aria-selected', x === e.currentTarget ? 'true' : 'false')); t[1](); } })));
    tabLog();
  }
};
