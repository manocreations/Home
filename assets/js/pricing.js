(function () {
  'use strict';
  // Set your WhatsApp number with country code, digits only (e.g. '919876543210'). Leave '' to hide the button.
  var CONFIG = {
    whatsapp: '919080354580', // YOUR WhatsApp number with country code, digits only, e.g. '919876543210'. Quotes are sent to this number.
    brand: 'ManO CreationS',
    site: 'www.manocreations.com',
    // Logo for the PDF and image: the first PNG that loads is used. Save your logo as assets/img/logo.png (transparent PNG works best).
    logos: ['assets/img/logo.png', 'assets/img/favicon.png'],
    // Quote copies are emailed to you through Web3Forms (free). Create a key at web3forms.com using manojsalem98@gmail.com and paste it here.
    // attach: true also sends the PDF or image file with the email (may need a paid Web3Forms plan).
    notify: { key: '', attach: false },
    qrImage: 'assets/img/qr.png', // your own QR code (PNG). If missing, a sample pattern is shown.
    logoHasName: false, // set true if your logo image already contains the words "ManO CreationS"
    jspdf: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
  };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return '₹' + n.toLocaleString('en-IN'); };
  var panel = $('#panel'), list = $('#q-list');

  // ---- Items and add / stepper controls
  var reg = [];
  function mk(tag, cls, text, label) {
    var e = document.createElement(tag); if (cls) e.className = cls;
    if (text) e.textContent = text; if (label) e.setAttribute('aria-label', label);
    if (tag === 'button') e.type = 'button';
    return e;
  }
  $$('[data-price]').forEach(function (el) {
    var it = { el: el, name: el.dataset.name, price: +el.dataset.price, plus: el.dataset.plus === '1', q: 0 };
    it.add = mk('button', 'add', '+ Add', 'Add ' + it.name + ' to quote');
    it.step = mk('span', 'step'); it.step.hidden = true;
    it.minus = mk('button', '', '−', 'Remove one ' + it.name);
    it.count = mk('span', 'n'); it.count.setAttribute('aria-live', 'polite');
    it.plusBtn = mk('button', '', '+', 'Add one more ' + it.name);
    it.step.append(it.minus, it.count, it.plusBtn);
    it.add.onclick = function () { setQ(it, 1); it.plusBtn.focus(); };
    it.plusBtn.onclick = function () { setQ(it, it.q + 1); };
    it.minus.onclick = function () { setQ(it, it.q - 1); if (!it.q) it.add.focus(); };
    $('.ctl', el).append(it.add, it.step);
    reg.push(it);
  });
  function chosen() { return reg.filter(function (i) { return i.q > 0; }); }
  function setQ(it, q) { it.q = Math.max(0, Math.min(99, q)); sync(it); render(); }
  function sync(it) {
    it.add.hidden = it.q > 0; it.step.hidden = it.q === 0;
    it.count.textContent = it.q; it.el.classList.toggle('on', it.q > 0);
  }
  function total() { return chosen().reduce(function (s, i) { return s + i.price * i.q; }, 0); }
  function plusAny() { return chosen().some(function (i) { return i.plus; }); }
  var money = function (n) { return fmt(n) + (plusAny() ? '+' : ''); };

  // ---- Quote panel
  function render() {
    var sel = chosen(), k = document.activeElement && document.activeElement.dataset ? document.activeElement.dataset.k : null;
    list.textContent = '';
    sel.forEach(function (it, idx) {
      var li = mk('li', 'qi'), nm = mk('span', 'qn', it.name), am = mk('span', 'qa', fmt(it.price * it.q) + (it.plus ? '+' : ''));
      var row = mk('span', 'qc'), st = mk('span', 'step');
      var m = mk('button', '', '−', 'Remove one ' + it.name), c = mk('span', 'n', String(it.q)), p = mk('button', '', '+', 'Add one more ' + it.name);
      var rm = mk('button', 'link', 'Remove', 'Remove ' + it.name + ' from quote');
      m.dataset.k = idx + 'm'; p.dataset.k = idx + 'p'; rm.dataset.k = idx + 'r';
      m.onclick = function () { setQ(it, it.q - 1); }; p.onclick = function () { setQ(it, it.q + 1); }; rm.onclick = function () { setQ(it, 0); };
      st.append(m, c, p); row.append(st, rm); li.append(nm, am, row); list.append(li);
    });
    if (k) { var e = $('[data-k="' + k + '"]', list); if (e) e.focus(); }
    $('.layout').classList.toggle('split', sel.length > 0);
    $('#q-empty').hidden = sel.length > 0; $('#q-sum').hidden = !sel.length;
    $('#q-total').textContent = money(total());
    if (!sel.length) { showStep(1); curRef = ''; }
    syncActs();
    var n = sel.reduce(function (s, i) { return s + i.q; }, 0);
    $('#q-mini').textContent = n + (n === 1 ? ' item' : ' items') + ' · ' + money(total());
    $('#bar').hidden = !sel.length;
    $('#bar-text').textContent = n + (n === 1 ? ' item' : ' items') + ' · ' + money(total());
    if (!sel.length) panel.classList.remove('open');
  }
  function quoteText() {
    var lines = chosen().map(function (i) { return '- ' + i.name + (i.q > 1 ? ' x ' + i.q : '') + ': ' + fmt(i.price * i.q) + (i.plus ? '+' : ''); });
    var who = $('#q-name').value.trim();
    return 'Hi ' + CONFIG.brand + ', I would like a quote.\n' + (who ? 'Brand: ' + who + '\n' : '') + 'Ref: ' + quoteRef() + '\n\n' + lines.join('\n') + '\n\nEstimated starting total: ' + money(total());
  }
  $('#q-copy').onclick = function () {
    var b = this, text = quoteText(), orig = b.textContent;
    var done = function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = orig; }, 1800); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done);
    else { var ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove(); done(); }
  };
  $('#q-clear').onclick = function () { reg.forEach(function (i) { i.q = 0; sync(i); }); render(); };
  $('#bar-open').onclick = function () { panel.classList.add('open'); $('#panel-close').focus(); };
  $('#panel-close').onclick = function () { panel.classList.remove('open'); $('#bar-open').focus(); };
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') panel.classList.remove('open'); });

  // ---- Tabs and search
  var tab = 'packs', qEl = $('#q');
  function view() {
    var q = qEl.value.trim().toLowerCase(), any = false;
    $$('.tab').forEach(function (t) { t.setAttribute('aria-pressed', String(!q && t.dataset.tab === tab)); });
    $$('.group').forEach(function (g) {
      var n = 0;
      $$('.svc,.card', g).forEach(function (el) { var ok = !q || el.dataset.s.indexOf(q) > -1; el.hidden = !ok; if (ok) n++; });
      $$('.sub', g).forEach(function (s) { s.hidden = !$$('.svc,.card', s).some(function (el) { return !el.hidden; }); });
      g.hidden = q ? n === 0 : g.dataset.group !== tab;
      if (!g.hidden) any = true;
    });
    $('#none').hidden = any;
  }
  $$('.tab').forEach(function (t) { t.onclick = function () { tab = t.dataset.tab; qEl.value = ''; view(); window.scrollTo({ top: $('.tools').offsetTop - 8 }); }; });
  qEl.oninput = view;

  // ---- Logo, PDF
    // PDF download
  function loadJsPdf() {
    return new Promise(function (res, rej) {
      if (window.jspdf) return res(window.jspdf);
      var s = document.createElement('script'); s.src = CONFIG.jspdf;
      s.onload = function () { res(window.jspdf); }; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  function loadLogo() {
    var list = CONFIG.logos.slice();
    return new Promise(function (res) {
      (function next() {
        if (!list.length) return res(null);
        var img = new Image();
        img.onload = function () {
          try {
            var c = document.createElement('canvas');
            c.width = img.naturalWidth; c.height = img.naturalHeight;
            c.getContext('2d').drawImage(img, 0, 0);
            res({ data: c.toDataURL('image/png'), w: c.width, h: c.height, img: img });
          } catch (e) { next(); }
        };
        img.onerror = next; img.src = list.shift();
      })();
    });
  }
  function rs(n) { return 'Rs. ' + n.toLocaleString('en-IN'); } // standard PDF fonts cannot draw the rupee sign
  function makePdf() {
    var btn = $('#q-pdf'), label = btn.textContent;
    btn.disabled = true; btn.textContent = 'Preparing PDF...';
    Promise.all([loadJsPdf(), loadLogo()]).then(function (r) {
      var doc = new r[0].jsPDF({ unit: 'mm', format: 'a4' }), logo = r[1];
      var W = 210, M = 18, B = 276, y = 18;
      var d = new Date();
      var dateStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
      var ref = quoteRef();
      var ink = [17, 17, 17], grey = [110, 110, 110];

      // Header
      var x = M;
      if (logo) {
        var h = 16, w = Math.min(h * logo.w / logo.h, 60);
        doc.addImage(logo.data, 'PNG', M, y, w, h); x = M + w + 4;
      }
      if (!logo || !CONFIG.logoHasName) {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(18); doc.setTextColor.apply(doc, ink);
        doc.text(CONFIG.brand, x, y + 10.5);
      }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(22); doc.setTextColor.apply(doc, ink);
      doc.text('QUOTE', W - M, y + 7, { align: 'right' });
      doc.setFont('helvetica', 'normal'); doc.setFontSize(10); doc.setTextColor.apply(doc, grey);
      doc.text('Date: ' + dateStr, W - M, y + 13, { align: 'right' });
      doc.text('Ref: ' + ref, W - M, y + 18, { align: 'right' });
      y += 26;
      doc.setDrawColor(17, 17, 17); doc.setLineWidth(0.6); doc.line(M, y, W - M, y); y += 9;

      var who = $('#q-name').value.trim();
      if (who) {
        doc.setFontSize(9); doc.setTextColor.apply(doc, grey); doc.text('Prepared for', M, y);
        doc.setFontSize(12); doc.setFont('helvetica', 'bold'); doc.setTextColor.apply(doc, ink); doc.text(who, M, y + 6);
        y += 16;
      }

      // Table
      var cQty = 128, cRate = 160, cAmt = W - M;
      function head() {
        doc.setFillColor(240, 240, 240); doc.rect(M, y, W - 2 * M, 9, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor.apply(doc, ink);
        doc.text('Service', M + 3, y + 6); doc.text('Qty', cQty, y + 6, { align: 'right' });
        doc.text('Starting rate', cRate, y + 6, { align: 'right' }); doc.text('Amount', cAmt - 3, y + 6, { align: 'right' });
        y += 9;
      }
      head();
      var total = 0, anyPlus = false;
      chosen().forEach(function (i) {
        var sub = i.price * i.q; total += sub; if (i.plus) anyPlus = true;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
        var lines = doc.splitTextToSize(i.name, 90), rh = lines.length * 5 + 5;
        if (y + rh > B - 40) { footer(); doc.addPage(); y = 18; head(); }
        doc.setTextColor.apply(doc, ink);
        doc.text(lines, M + 3, y + 6.5);
        doc.text(String(i.q), cQty, y + 6.5, { align: 'right' });
        doc.text(rs(i.price) + (i.plus ? '+' : ''), cRate, y + 6.5, { align: 'right' });
        doc.text(rs(sub) + (i.plus ? '+' : ''), cAmt - 3, y + 6.5, { align: 'right' });
        y += rh;
        doc.setDrawColor(225, 225, 225); doc.setLineWidth(0.2); doc.line(M, y, W - M, y);
      });

      // Total
      if (y + 62 > B) { footer(); doc.addPage(); y = 18; }
      y += 6;
      doc.setFillColor(17, 17, 17); doc.rect(W - M - 82, y, 82, 12, 'F');
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor(255, 255, 255);
      doc.text('Estimated total', W - M - 79, y + 7.8);
      doc.text(rs(total) + (anyPlus ? '+' : ''), cAmt - 3, y + 7.8, { align: 'right' });
      y += 22;
      doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, grey);
      var note = doc.splitTextToSize('All prices are starting prices and are estimates only. The final quote depends on scope, number of revisions and turnaround time. This document is not a tax invoice.', W - 2 * M - 40);
      doc.text(note, M, y);
      if (qrData) { doc.addImage(qrData, 'PNG', W - M - 30, y - 4, 30, 30); doc.setFontSize(7); doc.text('Sample QR code', W - M - 15, y + 29, { align: 'center' }); }

      function footer() {
        var n = doc.internal.getCurrentPageInfo().pageNumber;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.setTextColor.apply(doc, grey);
        doc.text(CONFIG.brand + '  |  ' + CONFIG.site, M, 288);
        doc.text('Page ' + n, W - M, 288, { align: 'right' });
      }
      footer();
      var fn = CONFIG.brand.replace(/\s+/g, '-') + '-Quote-' + ref + '.pdf';
      doc.save(fn);
      notify('pdf downloaded', doc.output('blob'), fn);
    }).catch(function () {
      alert('Could not create the PDF. Check your internet connection and try again.');
    }).then(function () { btn.disabled = false; btn.textContent = label; });
  }
  $('#q-pdf').addEventListener('click', makePdf);



  // ---- QR code (a sample pattern until you add your own at assets/img/qr.png)
  var qrData = '', qrImg = null;
  function setQr(url) {
    qrData = url; qrImg = new Image(); qrImg.src = url;
    $$('.qr').forEach(function (i) { i.src = url; });
  }
  function dummyQr() {
    var N = 25, Z = 2, S = 10, c = document.createElement('canvas'), x = c.getContext('2d'), seed = 7;
    c.width = c.height = (N + 2 * Z) * S;
    x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.fillStyle = '#111';
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function finder(cx, cy) {
      for (var i = 0; i < 7; i++) for (var j = 0; j < 7; j++) {
        var edge = i === 0 || j === 0 || i === 6 || j === 6, core = i > 1 && i < 5 && j > 1 && j < 5;
        if (edge || core) x.fillRect((Z + cx + i) * S, (Z + cy + j) * S, S, S);
      }
    }
    for (var i = 0; i < N; i++) for (var j = 0; j < N; j++) {
      var inF = (i < 8 && j < 8) || (i > N - 9 && j < 8) || (i < 8 && j > N - 9);
      if (!inF && rnd() > 0.5) x.fillRect((Z + i) * S, (Z + j) * S, S, S);
    }
    finder(0, 0); finder(N - 7, 0); finder(0, N - 7);
    return c.toDataURL('image/png');
  }
  try { setQr(dummyQr()); } catch (e) {}
  (function () {
    var im = new Image();
    im.onload = function () {
      try { var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); setQr(c.toDataURL('image/png')); } catch (e) {}
    };
    im.src = CONFIG.qrImage;
  })();

  // ---- Image
  function wrapText(ctx, t, w) {
    var words = t.split(' '), lines = [], cur = '';
    words.forEach(function (wd) { var test = cur ? cur + ' ' + wd : wd; if (ctx.measureText(test).width > w && cur) { lines.push(cur); cur = wd; } else cur = test; });
    lines.push(cur); return lines;
  }
  function paint(ctx, logo, H, date, ref) {
    var W = 1080, M = 64, FF = '-apple-system,"Segoe UI",Arial,sans-serif', y = M, who = $('#q-name').value.trim();
    ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    var x = M;
    if (logo) { var h = 72, w = Math.min(h * logo.w / logo.h, 260); ctx.drawImage(logo.img, M, y, w, h); x = M + w + 16; }
    if (!logo || !CONFIG.logoHasName) { ctx.fillStyle = '#111'; ctx.font = '700 36px ' + FF; ctx.textAlign = 'left'; ctx.fillText(CONFIG.brand, x, y + 48); }
    ctx.textAlign = 'right'; ctx.fillStyle = '#111'; ctx.font = '800 48px ' + FF; ctx.fillText('QUOTE', W - M, y + 40);
    ctx.fillStyle = '#6e6e6e'; ctx.font = '400 22px ' + FF; ctx.fillText(date, W - M, y + 72); ctx.fillText('Ref: ' + ref, W - M, y + 100);
    ctx.textAlign = 'left'; y += 124;
    ctx.fillStyle = '#111'; ctx.fillRect(M, y, W - 2 * M, 3); y += 40;
    if (who) { ctx.fillStyle = '#6e6e6e'; ctx.font = '400 20px ' + FF; ctx.fillText('Prepared for', M, y); ctx.fillStyle = '#111'; ctx.font = '700 30px ' + FF; ctx.fillText(who, M, y + 38); y += 76; }
    ctx.fillStyle = '#f0f0f0'; ctx.fillRect(M, y, W - 2 * M, 52);
    ctx.fillStyle = '#111'; ctx.font = '700 22px ' + FF;
    ctx.fillText('Service', M + 16, y + 34); ctx.textAlign = 'right';
    ctx.fillText('Qty', 650, y + 34); ctx.fillText('Starting rate', 830, y + 34); ctx.fillText('Amount', W - M - 16, y + 34);
    ctx.textAlign = 'left'; y += 52;
    chosen().forEach(function (i) {
      ctx.font = '400 26px ' + FF; var lines = wrapText(ctx, i.name, 520), rh = lines.length * 34 + 28;
      ctx.fillStyle = '#111'; lines.forEach(function (l, n) { ctx.fillText(l, M + 16, y + 38 + n * 34); });
      ctx.textAlign = 'right'; ctx.fillText(String(i.q), 650, y + 38);
      ctx.fillText(fmt(i.price) + (i.plus ? '+' : ''), 830, y + 38); ctx.fillText(fmt(i.price * i.q) + (i.plus ? '+' : ''), W - M - 16, y + 38);
      ctx.textAlign = 'left'; y += rh; ctx.fillStyle = '#e2e2e2'; ctx.fillRect(M, y - 1, W - 2 * M, 1);
    });
    y += 28; ctx.fillStyle = '#111'; ctx.fillRect(W - M - 460, y, 460, 76);
    ctx.fillStyle = '#fff'; ctx.font = '700 26px ' + FF; ctx.fillText('Estimated total', W - M - 440, y + 48);
    ctx.textAlign = 'right'; ctx.fillText(money(total()), W - M - 16, y + 48); ctx.textAlign = 'left'; y += 76 + 40;
    var y0 = y; ctx.fillStyle = '#6e6e6e'; ctx.font = '400 20px ' + FF;
    wrapText(ctx, 'All prices are starting prices and are estimates only. The final quote depends on scope, number of revisions and turnaround time. This document is not a tax invoice.', W - 2 * M - 190).forEach(function (l) { ctx.fillText(l, M, y); y += 28; });
    if (qrImg && qrImg.complete && qrImg.naturalWidth) { ctx.drawImage(qrImg, W - M - 150, y0 - 20, 150, 150); ctx.font = '400 16px ' + FF; ctx.textAlign = 'center'; ctx.fillText('Sample QR code', W - M - 75, y0 + 150); ctx.textAlign = 'left'; y = Math.max(y, y0 + 150); }
    y += 16; ctx.fillText(CONFIG.brand + '  |  ' + CONFIG.site, M, y);
    return y + M;
  }
  // ---- Email a copy of the quote to ManO CreationS (visitors are told about this in step 2)
  var lastSent = '';
  function notify(kind, blob, name) {
    var n = CONFIG.notify;
    if (!n || !n.key || !chosen().length) return;
    var contact = $('#q-contact').value.trim(), who = $('#q-name').value.trim(), ref = quoteRef();
    var sig = quoteText() + '|' + contact + (n.attach ? '|' + kind : '');
    if (sig === lastSent) return;
    lastSent = sig;
    var fields = {
      access_key: n.key, subject: 'New quote ' + ref + ' from ' + who, from_name: CONFIG.brand + ' website',
      brand: who, contact: contact || 'not given', ref: ref, action: kind, total: money(total()), message: quoteText()
    };
    var req;
    if (n.attach && blob) {
      var fd = new FormData(); Object.keys(fields).forEach(function (k) { fd.append(k, fields[k]); });
      fd.append('attachment', blob, name);
      req = fetch('https://api.web3forms.com/submit', { method: 'POST', body: fd });
    } else {
      req = fetch('https://api.web3forms.com/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(fields) });
    }
    req.catch(function () { lastSent = ''; });
  }
  $('#q-share').hidden = !(CONFIG.notify && CONFIG.notify.key);

  function makeImage() {
    return loadLogo().then(function (logo) {
      var d = new Date(), date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }), ref = quoteRef();
      var H = paint(document.createElement('canvas').getContext('2d'), logo, 6000, date, ref), S = 2, c = document.createElement('canvas');
      c.width = 1080 * S; c.height = H * S;
      var ctx = c.getContext('2d'); ctx.scale(S, S); paint(ctx, logo, H, date, ref);
      return new Promise(function (res) { c.toBlob(function (blob) { res({ blob: blob, name: CONFIG.brand.replace(/\s+/g, '-') + '-Quote-' + ref + '.png' }); }, 'image/png'); });
    });
  }
  function saveBlob(blob, name) {
    var a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  }
  function working(b, text, job) {
    var o = b.textContent; b.disabled = true; b.textContent = text;
    var done = function () { b.textContent = o; syncActs(); };
    job().then(done, done);
  }
  $('#q-img').onclick = function () {
    working(this, 'Preparing image...', function () { return makeImage().then(function (r) { saveBlob(r.blob, r.name); notify('image downloaded', r.blob, r.name); }); });
  };
  // ---- Two steps: review items, then brand name, sending and downloads
  var curRef = '';
  function quoteRef() {
    if (!curRef) { var d = new Date(); curRef = 'MC-' + d.getFullYear() + ('0' + (d.getMonth() + 1)).slice(-2) + ('0' + d.getDate()).slice(-2) + '-' + d.getTime().toString(36).slice(-4).toUpperCase(); }
    return curRef;
  }
  function showStep(n) { $('#step1').hidden = n !== 1; $('#step2').hidden = n !== 2; }
  function syncActs() {
    var ok = chosen().length > 0 && $('#q-name').value.trim() !== '';
    $$('.acts .dl').forEach(function (b) { b.disabled = !ok; });
    $('#q-hint').hidden = ok;
  }
  $('#q-next').onclick = function () { showStep(2); $('#q-name').focus(); };
  $('#q-back').onclick = function () { showStep(1); $('#q-next').focus(); };
  $('#q-name').addEventListener('input', syncActs);

  reg.forEach(sync); view(); render();
})();
