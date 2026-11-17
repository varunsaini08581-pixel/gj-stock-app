/* GJ App — self-hosted barcode decoder used when the browser has no BarcodeDetector.
   Reads Code 128 (sets A, B, C) one-dimensional barcodes from horizontal scan lines of a camera frame.
   window.GJDecoder.decode(imageData) -> text or null. No network, no dependencies. */
(function () {
  'use strict';
  var P = ['212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213', '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132', '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211', '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313', '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331', '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111', '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214', '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111', '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141', '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141', '114131', '311141', '411131', '211412', '211214', '211232'];
  var PAT = P.map(function (s) { return s.split('').map(Number); });
  function match(runs, at) {
    var total = 0, i, k, best = -1, bestErr = 1e9;
    for (i = 0; i < 6; i++) total += runs[at + i];
    if (total < 11) return -1;
    var unit = total / 11;
    for (k = 0; k < PAT.length; k++) {
      var err = 0;
      for (i = 0; i < 6; i++) { var d = runs[at + i] / unit - PAT[k][i]; err += d * d; if (err >= bestErr) break; }
      if (err < bestErr) { bestErr = err; best = k; }
    }
    return bestErr < 1.2 ? best : -1;
  }
  function decodeRuns(runs) {
    /* runs: widths, alternating, starting with a bar */
    for (var s = 0; s + 12 < runs.length; s += 2) {
      var start = match(runs, s);
      if (start < 103 || start > 105) continue;
      if (s > 0 && runs[s - 1] < (runs[s] + runs[s + 1]) ) { /* quiet zone too small: still try */ }
      var codes = [start], at = s + 6, ok = false;
      while (at + 6 <= runs.length) {
        if (at + 7 <= runs.length) {
          var st = 0, j; for (j = 0; j < 7; j++) st += runs[at + j];
          var u = st / 13, stop = [2, 3, 3, 1, 1, 1, 2], e = 0;
          for (j = 0; j < 7; j++) { var dd = runs[at + j] / u - stop[j]; e += dd * dd; }
          if (e < 1.2 && codes.length >= 3) { ok = true; break; }
        }
        var c = match(runs, at); if (c < 0 || c > 102) break;
        codes.push(c); at += 6;
      }
      if (!ok) continue;
      var check = codes[codes.length - 1], sum = codes[0], i;
      for (i = 1; i < codes.length - 1; i++) sum += codes[i] * i;
      if (sum % 103 !== check) continue;
      var set = start === 103 ? 'A' : (start === 104 ? 'B' : 'C'), out = '', shift = '';
      for (i = 1; i < codes.length - 1; i++) {
        var v = codes[i], cur = shift || set; shift = '';
        if (cur === 'C') { if (v < 100) out += (v < 10 ? '0' : '') + v; else if (v === 100) set = 'B'; else if (v === 101) set = 'A'; continue; }
        if (v < 96) { out += cur === 'B' ? String.fromCharCode(v + 32) : String.fromCharCode(v < 64 ? v + 32 : v - 64); continue; }
        if (v === 98) shift = cur === 'A' ? 'B' : 'A';
        else if (v === 99) set = 'C';
        else if (v === 100) { if (cur === 'A') set = 'B'; }
        else if (v === 101) { if (cur === 'B') set = 'A'; }
      }
      out = out.replace(/[^\x20-\x7e]/g, '');
      if (out.length >= 2) return out;
    }
    return null;
  }
  function rowRuns(data, width, y) {
    var lum = new Array(width), min = 255, max = 0, x, o = y * width * 4;
    for (x = 0; x < width; x++) { var l = (data[o + x * 4] * 3 + data[o + x * 4 + 1] * 6 + data[o + x * 4 + 2]) / 10; lum[x] = l; if (l < min) min = l; if (l > max) max = l; }
    if (max - min < 40) return null;
    var th = (min + max) / 2, runs = [], dark = lum[0] < th, n = 0, first = true;
    for (x = 0; x < width; x++) {
      var d = lum[x] < th;
      if (d === dark) n++; else { if (!(first && !dark)) runs.push(n); first = false; dark = d; n = 1; }
    }
    runs.push(n);
    return runs;
  }
  function decode(img) {
    if (!img || !img.data || !img.width) return null;
    var fr = [0.5, 0.4, 0.6, 0.3, 0.7, 0.45, 0.55, 0.2, 0.8], i;
    for (i = 0; i < fr.length; i++) {
      var runs = rowRuns(img.data, img.width, Math.floor(img.height * fr[i]));
      if (!runs || runs.length < 20) continue;
      var t = decodeRuns(runs) || decodeRuns(runs.slice().reverse().slice(runs.length % 2 === 0 ? 1 : 0));
      if (t) return t;
    }
    return null;
  }
  var api = { decode: decode, _patterns: P };
  if (typeof window !== 'undefined') window.GJDecoder = api;
  if (typeof module !== 'undefined') module.exports = api;
})();
