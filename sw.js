/* GJ App service worker. Caches the app shell only; API calls always go to the network (no offline data).
   Only successful (HTTP 200, same-origin) responses are cached, so an error page can never be served later. */
const VERSION = '4.0.18'; /* round 67 (RV66-07): GJ App 4.0.8 - new cache name, so a page loaded before rounds 65 / 67 is replaced (R46: 4.0.7) */
const CACHE = 'gj-app-' + VERSION;
const SHELL = ['./', 'index.html', 'style.4.0.0.css', 'config.js', 'manifest.webmanifest', 'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png', 'lib/decoder.js',
  'js/00_str.js', 'js/10_core.js', 'js/12_ui.js', 'js/14_shell.js', 'js/16_passkey.js', 'js/20_home.js', 'js/30_stock.js', 'js/40_purchase.js', 'js/50_sales.js', 'js/60_jobs.js',
  'js/65_parts.js', 'js/70_count.js', 'js/80_control.js', 'js/85_reports.js', 'js/90_admin.js', 'js/99_boot.js'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(SHELL.map(u => fetch(u, { cache: 'no-store' }).then(r => (r.ok ? c.put(u, r) : null)).catch(() => null))))); /* R31C-08: no skipWaiting here - the new worker waits until an open page that is idle sends SKIP_WAITING (14_shell.js); a page with unsaved work shows "Reload now" instead and is never reloaded under the user */
});
/* R33C-01: only a 4.0.5+ page activates this worker - its message is {t: 'SKIP_WAITING', v: <its version>}, sent by 14_shell.js after it
   checked that nothing unsaved is open (count, queued / failed scans, typed forms). The plain string 'SKIP_WAITING' of a 4.0.4 page is
   ignored: that page's idle check does not see a running count, so such a page switches only when all its windows are closed. */
self.addEventListener('message', e => { const m = e.data; if (m && typeof m === 'object' && m.t === 'SKIP_WAITING' && typeof m.v === 'string' && /^\d+\.\d+\.\d+$/.test(m.v)) self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request).then(r => {
      if (r.ok && r.status === 200 && r.type === 'basic') { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return r;
    }).catch(() => caches.match(e.request, { ignoreSearch: true }).then(m => m || Response.error()))
  );
});
