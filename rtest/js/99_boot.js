/* GJ App v4 — start. Static shell text comes from the string table; the brand button goes Home. */
'use strict';
(function () {
  const off = document.getElementById('offline'); if (off) off.textContent = T.offline;
  const brand = document.getElementById('brand'); if (brand) brand.addEventListener('click', () => { if (S.me && !S.locked && !S.forcedPin) go('home'); });
  boot().catch(e => { console.error(e); fatal(T.errUnexpected); });
})();
