/* GJ App v4 — string table (STR). All user-visible text lives in T (interface text) and C (labels of codes, SPEC section 3).
   Other script files add their own section to T with Object.assign(T, {...}). Nothing in the app branches on label text. */
'use strict';
const APP_VERSION = '4.0.7'; /* 4.0.7 (round 46, R46A-01..09): own advance refunded by the manager, sale request carried into Sell, full bill on the sale slip, waiting job-without-scan request shown and named, approval cards in words, Close next to Cancel actions, laptop card fits a 360 px phone. 4.0.6 (round 37, R37B-01..06, -08): a form is locked after an unsure answer, no update while a count is open, idle lock by the wall clock, sale date refreshed, Min App Version check, visible update bar, bulk approve only of visible rows; 4.0.5: R2A-10 reason for reopening a PO, RVM-08 "Did you receive this cash?" on the dismiss of a cash request; 4.0.4: CASH-OFF - the cash day close can be switched off on the server (Day money screen, dismiss of cash requests); P1: request IDs kept by api() (2.G); 4.0.2: RVR22 + RVRP fixes (money choice, cash link, request ID per user); 4.0.3: RVV (a manager's cash link is sent for the owner's approval) - after this app is on GitHub Pages run raiseMinAppVersion() once */
const PROTOCOL_VERSION = 4;

/* ---------- C: code -> label (SPEC section 3). Hindi in brackets only where section 3 marks it. ---------- */
const C = {
  ROLE: { ADMIN: 'Owner', MANAGER: 'Manager', SALES: 'Sales', REPAIR: 'Repair' },
  SECTION: { SALES: 'Sales', REPAIR: 'Repair', ALL: 'All sections' },
  STATE: { ACTIVE: 'In stock', PENDING: 'Waiting for approval', SOLD: 'Sold', RETURNED: 'Returned to dealer (settled)', WRITTEN_OFF: 'Written off (बट्टे खाते)', VOID: 'Void (entry cancelled)' },
  STATUS: { READY: 'Ready for sale', UNDER_CHECK: 'Under check', NEEDS_REPAIR: 'Needs repair', DEALER_RETURN: 'Return to dealer', RESERVED: 'Reserved', SHOP_USE: 'In shop use', MISSING: 'Missing' },
  LOCATION: { SALES: 'Sales', REPAIR: 'Repair', OUTSIDE: 'Outside the shop', CUSTOMER: 'With customer', DEALER: 'With dealer', NONE: 'None' },
  SCAN_MODE: { PENDRIVE: 'Pendrive scan', NO_POWER: 'Does not power on', NO_OS: 'No operating system', LOCKED: 'Locked (BIOS / disk password)', UNSUPPORTED: 'Cannot run the pendrive (Chromebook, tablet, monitor…)', SEALED: 'Packed and sealed (सील बंद)' },
  SOURCE: { PURCHASE: 'Dealer purchase', OLD_STOCK: 'Old stock', EXCHANGE: 'Exchange', BUYBACK: 'Buyback', CUSTOMER_RETURN: 'Customer return', REPLACEMENT: 'Dealer replacement' },
  TYPE: { LAPTOP: 'Laptop', DESKTOP: 'Desktop', AIO: 'All-in-one', TABLET: 'Tablet', MONITOR: 'Monitor', PRINTER: 'Printer', OTHER: 'Other' },
  TOUCH: { TOUCH: 'Touch', NON_TOUCH: 'Non-touch', UNKNOWN: 'Not detected' },
  CHARGER: { ORIGINAL: 'Original charger', COMPATIBLE: 'Compatible charger', NONE: 'No charger', UNKNOWN: 'Not recorded' },
  VERIFIED: { Y: 'Verified by pendrive', N: 'Not verified' },
  FIT: { OK: 'Fit: OK', WARN: 'Fit: warning', BAD: 'Fit: bad', UNKNOWN: 'Fit: not known' },
  UNFIT: { BATT_LOW: 'Battery health below limit', BATT_SERVICE: 'Battery needs service', DISK_BAD: 'Disk reports failure', DISK_WARN: 'Disk warning', DISK_WORN: 'Disk life below limit',
    LOCK_DOMAIN: 'Joined to a company domain', LOCK_MDM: 'Enrolled in company management (MDM)', LOCK_AAD: 'Joined to company Azure AD / Entra ID', LOCK_ACTIVATION: 'Activation Lock / Find My is ON',
    LOCK_BITLOCKER: 'Drive encryption ON', LOCK_COMPUTRACE: 'Computrace / Absolute found', LOCK_BIOS: 'BIOS password', LOCK_DISK: 'Disk password', WIN_NOT_ACTIVATED: 'Windows not activated',
    WIN_KMS: 'Activated by KMS (temporary)', BATT_NOT_READ: 'Battery not read', WEAR_NOT_READ: 'Disk wear not read', DEVICE_PROBLEM: 'Device problem reported', DEVICE_DISABLED: 'Disabled device found', MDM_TRACE: 'Traces of company management' },
  FLAG: { IN_TRANSIT: 'In transit', UNVERIFIED: 'Not verified', UNFIT: 'Unfit', HW_PENDING: 'Hardware change pending', PENDING: 'Waiting for approval', NOT_SCANNED: 'Not scanned in this cycle', MISSING: 'Missing', RESERVED: 'Reserved', EXEMPT: 'Exempt from scan', RESCAN: 'Scan needed after part change', RESCAN_NEEDED: 'Scan needed after part change', ON_HOLD: 'On hold', PICKUP_PENDING: 'Sold — awaiting pickup', AWAITING_PICKUP: 'Sold — awaiting pickup' },
  CYCLE_STATE: { NOT_SCANNED: 'Not scanned', DONE: 'Scanned', EXEMPT: 'Exempt', SEALED_PENDING: 'Sealed — count pending', CARRIED_OVER: 'Not scanned (also missed last cycle)' },
  PO_STATUS: { OPEN: 'Open', PARTIAL: 'Partly received', RECEIVED: 'Fully received', CLOSED: 'Closed' },
  PO_LINE: { LAPTOP: 'Laptop', PART: 'Part', ACCESSORY: 'Accessory', LOT: 'Mixed lot' },
  RECEIPT: { OK: 'Matches the PO', MISMATCH: 'Different from the PO', EXTRA: 'Extra unit', FAULTY: 'Faulty on arrival', UNFIT: 'Health below limit / locked', FAULTY_LATER: 'Found faulty after receipt', SHORT: 'Not received', SERIAL_NOT_ON_PO: 'Serial number not on the PO', NO_PO: 'No purchase order', REPLACEMENT: 'Dealer replacement', NO_SCAN: 'Entered without scan' },
  FAULT: { DEALER_FAULT: 'Dealer fault', TRANSIT_DAMAGE: 'Transit damage', WRONG_ITEM: 'Wrong item' },
  CHECK: { SCREEN: 'Screen', KEYBOARD: 'Keyboard', PORTS: 'Ports', HINGE: 'Hinge', SPEAKER: 'Speaker', CAMERA: 'Camera', WIFI: 'Wi-Fi', BIOS_OPENS: 'BIOS opens', CHARGER: 'Charger', BODY: 'Body' },
  CHECK_RESULT: { OK: 'OK', FAIL: 'Fail', NOT_CHECKED: 'Not checked', ISSUE: 'Issue' },
  CONDITION: { WORKING: 'Working', FAULTY: 'Faulty' },
  WARRANTY_DAYS: { 15: '15 days', 30: '30 days', 90: '3 months (90 days)' },
  DEALER_STATUS: { APPROVED: 'Approved', PENDING: 'Waiting for approval', REJECTED: 'Rejected' },
  DEALER_CAT: { LAPTOPS: 'Laptops', PARTS: 'Parts', ACCESSORIES: 'Accessories', SERVICE: 'Service partner (lamination / outside repair)' },
  MOVE_KIND: { HANDOVER: 'Handover', OUTSIDE: 'Sent outside' },
  OUT_REASON: { LAMINATION: 'Lamination', OUTSIDE_REPAIR: 'Outside repair', DEALER_RETURN: 'Dealer warranty return', DEALER_REPLACEMENT: 'Dealer replacement', PHOTO_SHOOT: 'Photo shoot', STANDBY_CUSTOMER: 'Standby laptop to customer', WITH_STAFF: 'With staff member', ON_APPROVAL: 'On approval at another shop', OTHER: 'Other' },
  MOVE_OUTCOME: { SAME_UNIT: 'Same laptop returned', REPLACEMENT: 'Replacement received', REFUND_CREDIT: 'Refund / credit note', SOLD_OUTSIDE: 'Sold outside', WRITTEN_OFF: 'Written off (बट्टे खाते)' },
  SALE_STATUS: { OPEN: 'Open', VOID: 'Entry cancelled', RETURNED: 'Returned by customer' },
  PAY: { CASH: 'Cash', UPI: 'UPI', CARD: 'Card', BANK: 'Bank transfer', MIXED: 'Mixed', SET_OFF: 'Set off on the bill', NOT_ASKED: 'Not asked (old app) - check' }, /* NOT_ASKED: R33C-02, a vendor charge from an app / pendrive without "Paid how" */
  EX_KIND: { EXCHANGE: 'Exchange', BUYBACK: 'Buyback', CUSTOMER_RETURN: 'Customer return' },
  EX_STATUS: { PENDING: 'Laptop not yet entered', SCANNED: 'Entered, waiting for approval', CLOSED: 'Closed', CANCELLED: 'Cancelled', REJECTED: 'Rejected' },
  ID_TYPE: { AADHAAR: 'Aadhaar', DL: 'Driving licence', VOTER: 'Voter ID', PAN: 'PAN', PASSPORT: 'Passport', OTHER: 'Other' },
  RESERVE_STATUS: { OPEN: 'Open', SOLD: 'Sold', CANCELLED: 'Cancelled', EXPIRED: 'Expired' },
  WRITEOFF: { SCRAP: 'Scrap', PARTS_DONOR: 'Used for parts', LOST_STOLEN: 'Lost / stolen', ENTRY_MISTAKE: 'Entry mistake' },
  JOB_STATUS: { RECEIVED: 'Received', IN_PROGRESS: 'In progress', WAITING_PART: 'Waiting for part', OUTSIDE: 'Outside', READY: 'Ready for pickup', DELIVERED: 'Delivered', RETURNED_UNREPAIRED: 'Returned without repair', CANCELLED: 'Cancelled', ABANDONED: 'Closed as abandoned' },
  JOB_TYPE: { IN_SHOP: 'In shop', ONSITE: 'On site', QUICK: 'Quick service' },
  JOB_CAT: { WALK_IN: 'Walk-in', GJ_IN_WARRANTY: 'GJ laptop — in warranty', GJ_OUT_OF_WARRANTY: 'GJ laptop — out of warranty', REPAIR_WARRANTY: 'Comeback under repair warranty' },
  PROBLEM: { DISPLAY: 'Display', KEYBOARD: 'Keyboard', BATTERY: 'Battery', CHARGING_PORT: 'Charging / port', HINGE_BODY: 'Hinge / body', MOTHERBOARD_DEAD: 'Motherboard / dead', SOFTWARE: 'Windows / software', SLOW_UPGRADE: 'Slow / upgrade', WATER_DAMAGE: 'Water damage', SPEAKER_MIC: 'Speaker / microphone', TOUCHPAD: 'Touchpad', WIFI_BT: 'Wi-Fi / Bluetooth', OTHER: 'Other' },
  RECEIVED_WITH: { CHARGER: 'Charger', BAG: 'Bag', BATTERY: 'Battery', OTHER: 'Other' },
  INTAKE: { PENDRIVE: 'Pendrive scan', NO_SCAN: 'No scan', LATE: 'Scanned later' },
  DELIVERY_SCAN: { SAME: 'No change', CHANGED: 'Hardware changed', EXPLAINED: 'Change matches recorded parts', REJECTED: 'Change not accepted - scan again', NOT_COMPARED: 'No intake scan to compare', NONE: 'Not scanned' },
  JOB_EVENT: { CREATED: 'Job created', ABANDONED: 'Closed as abandoned', EDITED: 'Details edited', STATUS: 'Status changed', ESTIMATE: 'Estimate added', TECH_CHANGED: 'Technician changed', PART_FITTED: 'Part fitted', PART_UNDONE: 'Part fitting undone', PART_PULLED: 'Part pulled', CHARGE_ADDED: 'Charge added', SENT_OUT: 'Sent outside', BACK_IN: 'Returned from outside', DELIVERY_SCAN: 'Delivery scan', SNAPSHOT_LATE: 'Scanned after intake', SLIP_SENT: 'Slip sent', REMINDER: 'Reminder call', DELIVERED: 'Delivered to customer', CANCELLED: 'Cancelled', REOPENED: 'Reopened', STICKER_CHANGED: 'Sticker changed', DUES_SALE: 'Sold for the amount due', ABANDON_UNDONE: 'Abandon decision undone by the owner' },
  ZERO_REASON: { GJ_WARRANTY: 'GJ warranty', REPAIR_WARRANTY: 'Repair warranty', GOODWILL: 'Goodwill', NOT_REPAIRED: 'Not repaired' },
  JOB_LINE: { OTHER_CHARGE: 'Other charge', CHARGE: 'Other charge', CUSTOMER_PART: "Customer's own part", OUTSIDE_WORK: 'Outside work' },
  OLD_PARTS: { Y: 'Yes', N: 'No', NA: 'Not applicable' },
  PART_STATUS: { IN_STOCK: 'In stock', FITTED: 'Fitted', FAULTY: 'Faulty', AT_DEALER: 'Sent back to dealer', RETURNED: 'Dealer return settled', SOLD: 'Sold' },
  PART_TYPE: { RAM: 'RAM', SSD: 'SSD', HDD: 'HDD', CHARGER: 'Charger', DISPLAY: 'Display', BATTERY: 'Battery', KEYBOARD: 'Keyboard', ADAPTER: 'Adapter', MOTHERBOARD: 'Motherboard', WIFI_CARD: 'Wi-Fi card', OTHER: 'Other' },
  PART_CLOSE: { REPLACED: 'Replaced', CREDITED: 'Credited', REJECTED: 'Rejected by dealer' },
  ACC_REASON: { RECEIVED: 'Received', SOLD: 'Sold', WITH_LAPTOP: 'Given with laptop', USED_IN_REPAIR: 'Used in repair', DAMAGED: 'Damaged', SHOP_USE: 'Shop use', OPENING: 'Opening stock', ADJUST_PLUS: 'Count correction (+)', ADJUST_MINUS: 'Count correction (−)' },
  COUNT_STATUS: { OPEN: 'Open', CLOSED: 'Closed', ABANDONED: 'Abandoned', NOT_STARTED: 'Not started' },
  COUNT_RESULT: { FOUND: 'Found', MISSING: 'Missing', EXTRA: 'Extra', UNKNOWN: 'Unknown code', DUP: 'Already scanned', ERROR: 'Not saved' },
  MISSING_REASON: { IN_OTHER_SECTION: 'In the other section', OUT_NOT_RECORDED: 'Sent outside, not recorded', SOLD_NOT_MARKED: 'Sold, not yet entered', WITH_CUSTOMER: 'Collected by customer', NOT_FOUND: 'Cannot be found' },
  DEVICE_KIND: { WEB: 'GJ App', PENDRIVE: 'Pendrive' },
  DEVICE_STATUS: { APPROVED: 'Approved', PENDING: 'Waiting for approval', REVOKED: 'Disabled', REPLACED: 'Replaced', UNKNOWN: 'Not registered' },
  APPR_TYPE: { DEVICE: 'New device', PENDRIVE_CHANGE: 'Pendrive changed', OLD_STOCK: 'Old stock entry', NO_PO: 'Receipt without PO', NETWORK_ADD: 'Add shop network', NO_SCAN_ENTRY: 'Entry without scan', PO_MISMATCH: 'Different from the PO', PO_EXTRA: 'Extra unit on PO',
    SERIAL_NOT_ON_PO: 'Serial number not on the PO', UNFIT_ACCEPT: 'Accept unfit laptop', EXCHANGE: 'Exchange / buyback', DEALER: 'New dealer', HW_FIRST: 'First scan differs from record', HW_CHANGE: 'Hardware changed',
    IDENTITY: 'Weak identity match', REBIND: 'Motherboard replaced (rebind)', UNSCANNABLE: 'Cannot be scanned', WRITE_OFF: 'Write off (बट्टे खाते)', OUT_REPEAT: 'Sent outside again', OUT_NO_SCAN: 'Sent outside without scan',
    SPEC_EDIT: 'Lower RAM / storage of a record', UUID_BLOCK: 'Duplicate motherboard ID', DEALER_RETURN_REASON: 'Dealer return - no fault on record', SALE_BELOW_MIN: 'Sale below minimum price', SALE_RETURN: 'Customer return', JOB_CANCEL: 'Job cancelled with parts used', JOB_ABANDON: 'Close a job as abandoned', JOB_NO_SCAN: 'Job without scan',
    PART_NO_PO: 'Part without PO', ACC_WRITEOFF: 'Accessory write-off', ACC_ADJUST: 'Accessory count correction', ACC_NO_PO: 'Accessory without PO', STAFF_CUSTODY: 'Laptop with staff member (Custody / ज़िम्मेदारी)',
    PO_REASSIGN: 'Move to another PO line', REINSTATE: 'Written-off laptop back in stock' },
  APPR_STATUS: { PENDING: 'Pending', APPROVED: 'Approved', REJECTED: 'Rejected', CANCELLED: 'Cancelled' },
  OUTCOME: { ACCEPT: 'Accept into stock', RETURN_TO_DEALER: 'Return to dealer', VOID: 'Void (entry mistake)' },
  HW_DIFF: { BOARD_CHANGED: 'Motherboard changed', NIC_CHANGED: 'Built-in network adapter changed (motherboard or Wi-Fi card)', CPU: 'Processor', RAM_REMOVED: 'RAM removed', RAM_ADDED: 'RAM added', DISK_REMOVED: 'Disk removed', DISK_ADDED: 'Disk added', BATT_REMOVED: 'Battery removed', BATT_CHANGED: 'Battery changed', BATT_SERIAL_BLANK: 'Battery serial blank', BATT_DESIGN: 'Battery design capacity', SCREEN: 'Screen', ACTIVATION: 'Windows activation', TOUCH: 'Touch', RECORD_RAM: 'RAM differs from record', RECORD_STORAGE: 'Storage differs from record' },
  DIR: { DOWN: 'Downgrade', UP: 'Upgrade', SAME: 'No change in value' },
  ABANDON: { SOLD_FOR_DUES: 'Sold for the amount due', SCRAPPED: 'Scrapped', HANDED_TO_OWNER: 'Kept by the owner (outside the counts)' },
  ALERT_STATUS: { OPEN: 'Open', ACK: 'Acknowledged', RESOLVED: 'Resolved' },
  SEVERITY: { URGENT: 'Urgent', NORMAL: 'Normal', INFO: 'Information' },
  INCIDENT: { SCAN_LATE: 'Scan late', RECORD_VANISHED: 'Record deleted in the Sheet', SPOT_MISS: 'Spot check missed', MISSING: 'Laptop missing', STICKER_MISSING: 'Sticker missing', STICKER_MISMATCH: 'Sticker mismatch', BAD_DATE: 'Invalid date in data', BAD_CODE: 'Invalid code in data', BAD_SNAPSHOT: 'Invalid hardware snapshot', SHEET_VALUE_DAMAGED: 'Sheet value damaged', BASELINE_REJECTED: 'First scan rejected', COUNT_CLAIM_FALSE: 'Count reason not confirmed', SOLD_IN_SHOP: 'Sold laptop seen in shop', STOCK_AS_CUSTOMER: 'Stock laptop presented as customer laptop', RECONCILE_FIX: 'Reconcile (मिलान) correction', MAIL_FAILED: 'E-mail failed', OFFLINE_REJECTED: 'Offline scan rejected' },
  YN: { Y: 'Yes', N: 'No' },
  LOOKUP: { STOCK: 'Laptop in stock', SOLD: 'Sold laptop', JOB: 'Repair job', PART: 'Part', FREE_GJ: 'Unused GJ sticker', FREE_RJ: 'Unused RJ sticker', VOID_STICKER: 'Cancelled sticker', NONE: 'No match' },
  TAG: { FAST: 'Fast seller', SLOW: 'Slow mover' },
  REASSIGN: { TRANSIT: 'Laptop in transit', MOVE: 'Item outside', JOB: 'Open job', RESERVATION: 'Reservation', APPROVAL: 'Pending request', SALE: 'Unconfirmed sale' },
  BANNER: { HEARTBEAT_STALE: 'Automatic alerts have stopped. The owner must check the system.', MAIL_QUOTA_LOW: 'The daily e-mail limit is almost used. Alerts are being combined.', ADMIN_ONE_DEVICE: 'The owner account has fewer than two approved devices. Register a second device now.', BACKUP_EMAIL_MISSING: 'The off-account backup is not set up. Enter an e-mail address outside this Google account under Settings > Backup Email.', SYS_SCHEMA: 'The system is paused because the data sheet structure was changed.', HEARTBEAT: 'Automatic alerts have stopped. The owner must check the system.', MAIL_LIMIT: 'The daily e-mail limit is almost used. Alerts are being combined.', ADMIN_DEVICES: 'The owner account has fewer than two approved devices. Register a second device now.', SCHEMA: 'The system is paused because the data sheet structure was changed.', PIN_FORCE: 'All staff must set a new PIN at the next login.' },
  TODO: { SCAN_DUE: '{n} laptops still to scan in this cycle', SPOT_CHECK: 'Spot check — scan {n} laptops within 2 hours', HANDOVER_ACCEPT: '{n} laptops waiting for you to accept', COUNT_TURN: 'It is your turn to do today\'s closing count', CYCLE_RESPONSIBLE: 'You are responsible for the current scan cycle', SLIPS_NOT_SENT: '{n} job slips not sent', UNCONFIRMED_SALES: '{n} sales waiting for confirmation', APPROVALS: '{n} requests waiting for approval', ALERTS: '{n} open alerts', SALE_REQUESTS: '{n} sale requests from sales staff', ROTA_NOT_SET: 'Scan-cycle rota not set for {month} — choose the responsible person for each cycle', CYCLE_RESPONSIBLE_ABSENT: 'Cycle {cycle} {sectionText}: {name} is absent on the last day of the cycle — choose another person' }
};

/* ---------- T: interface text (shell and shared). ---------- */
const T = {
  warrantyUnknown: 'Not known — the dealer bill was never entered',
  appName: 'GJ App', shop: 'Genuine Junction',
  loading: 'Loading…', wait: 'Please wait…', select: 'Select', all: 'All', none: 'None', yes: 'Yes', no: 'No', notKnown: 'Not known',
  save: 'Save', cancel: 'Cancel', close: 'Close', back: '← Back', add: 'Add', edit: 'Edit', remove: 'Remove', search: 'Search', show: 'Show', ok: 'OK', continue_: 'Continue', retry: 'Try again',
  saved: 'Saved', recorded: 'Recorded', sentForApproval: 'Saved — waiting for approval', done: 'Done',
  netFail: 'Could not reach the server - the entry may already be saved. Check the internet connection and press the button again: an entry that was saved is not saved twice.',
  offline: 'No connection to the server. Your work is kept on screen; try again when the connection is back.',
  errGeneric: 'The action could not be completed ({code}).',
  errUnexpected: 'Something went wrong on this screen. Reload the page; if it happens again, tell the owner.',
  reload: 'Reload', dismiss: 'Dismiss',
  required: '{field} is required.', invalid: '{field} is not valid.', mobileHint: 'Enter a 10-digit mobile number starting with 6–9.', pinHint: 'Enter the 6-digit PIN.',
  discardTitle: 'Discard changes?', discardMsg: 'You have entered details that are not saved. Leave and discard them?', discard: 'Discard', keepEditing: 'Keep editing',
  confirmTitle: 'Please confirm', yourPin: 'Your PIN (to confirm)',
  showing: 'Showing {x} of {y}', listPartial: 'Only {x} of {y} rows could be loaded. The output is incomplete; try again.', loadMore: 'Load more', csv: 'Download CSV', print: 'Print', noRows: 'Nothing to show.', filters: 'Filters', sortBy: 'Sort by {col}',
  printedBy: 'printed by {user}', notSet: '—', never: 'Never', today: 'Today', daysLeft: '{n} days left', expired: 'Expired', days: '{n} days', day1: '1 day',
  camera: 'Scan with camera', cameraUnsupported: 'Camera scanning is not supported in this browser. Use the scanner or type the code.', cameraDenied: 'Camera permission was not granted.', cameraHint: 'Hold the barcode inside the frame.',
  footOnline: 'Online', footOffline: 'Offline', footDevice: 'Device: {d}', footUser: 'User: {u}', footVersion: 'Version {v}',
  logout: 'Sign out', home: 'Home',
  updateTitle: 'A new version is available', updateMsg: 'This screen is running an old version of GJ App. Update now to continue.', updateNow: 'Update now', updateReady: 'A new version of GJ App is ready. It starts when you have finished this screen.', updateReload: 'Reload now',
  lockTitle: 'Screen locked', lockIdle: 'Locked after a period of inactivity. Your work on this screen is kept.', lockSession: 'Your session has ended. Enter your PIN to continue; your work on this screen is kept.', lockUser: 'Signed in as {name}', unlock: 'Unlock', otherUser: 'Sign in as someone else',
  browserOld: 'This browser is too old for GJ App. Please update Chrome, Edge or Safari and open the app again.', storageBlocked: 'This browser is blocking storage (private window?). Open GJ App in a normal window.',
  noPerm: 'You do not have permission to open this screen.', usePendrive: 'Use the pendrive for this action.',
  rs: '₹', by: 'by', at: 'at', on: 'on', of: 'of'
};

/* fmt: {key} placeholders; "1 laptops" / "1 jobs" ... become singular (UI-02) */
function fmt(s, p) { return String(s == null ? '' : s).replace(/\{(\w+)\}/g, (m, k) => (p && p[k] != null ? p[k] : m)).replace(/(^|[^\d,.])1 (laptop|job|item|approval|alert|cycle|day|line|part|sale|handover|entry)s\b/g, '$11 $2').replace(/(^|[^\d,.])1 entries\b/g, '$11 entry'); }
/* humanAction (UI-01): an API action name as plain English ("count.close" -> "Count closed"); known names from the table, others readable */
const ACTION_LBL = { 'count.close': 'Daily count closed', 'count.start': 'Daily count started', 'count.scan': 'Count scan', 'count.reveal': 'Count differences shown', 'stock.stickerMissing': 'Sticker reported missing',
  'rota.cycleSet': 'Scan-cycle rota set', 'rota.absent': 'Absence recorded', 'rota.swap': 'Count rota swapped', 'dealer.add': 'Dealer added', 'sale.create': 'Sale recorded', 'sale.request': 'Sale requested', 'sale.correct': 'Sale corrected',
  'sale.void': 'Sale cancelled', 'sale.collect': 'Balance collected', 'reserve.create': 'Laptop reserved', 'reserve.cancel': 'Reservation cancelled', 'stock.setStatus': 'Status changed', 'stock.edit': 'Laptop details edited',
  'stock.writeOff': 'Write-off', 'handover.sendNoScan': 'Handover sent', 'handover.acceptNoScan': 'Handover accepted', 'outside.sendNoScan': 'Sent outside', 'outside.returnNoScan': 'Back from outside', 'job.create': 'Job created',
  'job.update': 'Job updated', 'job.deliver': 'Job delivered', 'job.addLine': 'Job line added', 'job.removeLine': 'Job line removed', 'job.abandon': 'Job closed as abandoned', 'approvals.decide': 'Approval decided', 'sheet.submit': 'Stock sheet submitted',
  'po.create': 'Purchase order created', 'acc.issue': 'Accessory issued', 'acc.receive': 'Accessories received', 'receive.part': 'Part received', 'parts.fit': 'Part fitted', 'parts.sell': 'Part sold', 'file.upload': 'Photo uploaded',
  'admin.userSave': 'User saved', 'admin.configSave': 'Setting changed', 'auth.changePin': 'PIN changed', 'auth.logout': 'Signed out' };
function humanAction(code) {
  code = String(code == null ? '' : code); if (Object.prototype.hasOwnProperty.call(ACTION_LBL, code)) return ACTION_LBL[code];
  if (/^[A-Z0-9_]+$/.test(code)) return humanCode(code);
  const m = code.replace(/^offline\./, '').split('.'); const words = m.map(w => w.replace(/([a-z])([A-Z])/g, '$1 $2').toLowerCase()).join(' ');
  return (/^offline\./.test(code) ? 'Offline: ' : '') + words.charAt(0).toUpperCase() + words.slice(1);
}
function humanCode(code) { const s = String(code == null ? '' : code).replace(/_/g, ' ').toLowerCase(); return s.charAt(0).toUpperCase() + s.slice(1); }
/* Label of a code. Unknown codes are shown in readable form, never hidden. */
function lbl(group, code) { if (code == null || code === '') return ''; const g = C[group]; return (g && Object.prototype.hasOwnProperty.call(g, code)) ? g[code] : humanCode(code); }
function opts(group, codes) { const g = C[group] || {}; return (codes || Object.keys(g)).map(c => ({ v: String(c), t: lbl(group, c) })); }
