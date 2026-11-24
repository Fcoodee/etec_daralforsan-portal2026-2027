/* portal-meta.js — الإصدار المعتمد وتاريخ آخر تحديث، وليبل «نوع المستخدم الحالي» في كل الصفحات.
   - الإصدار والتاريخ يُعدَّلان هنا وحده فيظهران موحَّدين في كل الصفحات.
   - الليبل يقرأ نوع المستخدم الذي اختاره في لوحة evidence-link (المفتاح etec.utype.v1) ويبقى ظاهراً ما دامت جلسة الدخول قائمة (df_auth_v1)،
     وبانتهاء الجلسة أو تسجيل الخروج يُمسح النوع فيُسأل المستخدم من جديد عند الدخول التالي.
   - هذا الملف عرضٌ فقط: لا يمنح صلاحية ولا يحمي شيئاً. الحماية في page-gate.js وaccess.txt (لم يتغيّرا). */
(function () {
  'use strict';
  if (window.ETEC_META) return;
  /* showEtecLogo: false لإخفاء شعار هيئة تقويم التعليم والتدريب من ترويسات الصفحات.
     السياسات (1445هـ، ص26) تمنع المدرسة المعتمدة من استخدام شعار الهيئة أو المركز في منشوراتها؛ والافتراضي true إلى أن تقرّر إدارة المدرسة وضعها من الاعتماد. */
  var META = { version: 'v10.8.110', updated: '2026-11-22', updatedText: '22 نوفمبر 2026', showEtecLogo: true };
  window.ETEC_META = META;
  var UK = 'etec.utype.v1', AK = 'df_auth_v1';
  var NAMES = { admin: 'مدير النظام', sup: 'مشرف فريق السجلات والشواهد', member: 'عضو فريق السجلات والشواهد', self: 'مشرف عمليات التقويم الذاتي' };
  var HAS_OWN_BAR = true; /* شريط الدور في أعلى الصفحة يكفي؛ لا ليبل مكرر */

  function ls(k, v, del) { try { if (del) localStorage.removeItem(k); else if (v === undefined) return localStorage.getItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function auth() { try { var o = JSON.parse(ls(AK) || 'null'); if (o && o.exp > Date.now()) return o; } catch (e) {} return null; }
  function urlType() { try { var q = new URLSearchParams(location.search).get('u'); return q && NAMES[q] ? q : ''; } catch (e) { return ''; } }
  function curType() { var v = ls(UK); return v && NAMES[v] ? v : ''; }

  var css = document.createElement('style');
  css.textContent =
    '#etecMetaBox{position:fixed;bottom:6px;right:8px;left:8px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-start;gap:3px;pointer-events:none;direction:rtl;font-family:Tajawal,Tahoma,Arial,sans-serif}' +
    '#etecMetaBox.auth{bottom:50px}' +
    '#etecMetaVer{font:600 11px/1.4 Tajawal,Tahoma,Arial,sans-serif;color:#64748b;background:rgba(255,255,255,.94);border:1px solid #e2e8f0;border-radius:999px;padding:2px 9px;box-shadow:0 1px 3px rgba(0,0,0,.06);max-width:100%}' +
    '#etecMetaUser{font:700 11px/1.4 Tajawal,Tahoma,Arial,sans-serif;color:#0f5f5a;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:3px 11px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px rgba(0,0,0,.08)}' +
    '#etecWM{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.10;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '#etecWM2{position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.26;-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '#etecWM2 img{position:absolute;left:50%;top:87%;width:min(52vmin,420px);height:auto;transform:translate(-50%,-50%)}' +
    'html.lp-wm #etecWM img{top:40%;width:min(60vmin,480px)}' +
    '#etecWM img{position:absolute;left:50%;top:56%;width:min(74vmin,620px);height:auto;transform:translate(-50%,-50%);-webkit-print-color-adjust:exact;print-color-adjust:exact}' +
    '@media (max-width:640px){#etecWM2{opacity:.24}#etecWM2 img{width:min(72vw,340px);top:91%}html.lp-wm #etecWM img{top:42%;width:min(70vw,360px)}#etecWM{opacity:.09}#etecWM img{width:min(88vw,460px);top:58%}}' +
    '@media print{#etecClock{display:none!important}#etecTech{display:none!important}#etecWM2{display:none!important}#etecMetaBox{display:none!important}#etecWM{opacity:.10}#etecWM img{width:125mm;top:50%}}';
  var box, ver, usr;
  function mount() {
    if (!document.body || box) return;
    document.head.appendChild(css);
    /* علامة مائية: شعار قسم الدبلوما بخطوط خارجية فقط (logo-outline.svg) خلف كل الصفحات؛ لا تلتقط نقراً ولا تُقرأ لقارئ الشاشة */
    var wm = document.createElement('div'); wm.id = 'etecWM'; wm.setAttribute('aria-hidden', 'true'); wm.setAttribute('data-gate-keep', ''); var wi = document.createElement('img'); wi.src = 'logo-outline.svg?v=9.14.1'; wi.alt = ''; wi.setAttribute('aria-hidden', 'true'); wi.draggable = false; wm.appendChild(wi); document.body.appendChild(wm);
    /* كل صفحات المنصة (عدا صفحات التقارير والملفات: report وopen و404): علامة مائية ثانية لشعار هيئة تقويم التعليم والتدريب بخطوط خارجية (logo-etec-outline.svg) بالأسلوب نفسه */
    if (!/(^|\/)(report|open|404)\.html$/.test(location.pathname)) { var w2 = document.createElement('div'); w2.id = 'etecWM2'; w2.setAttribute('aria-hidden', 'true'); w2.setAttribute('data-gate-keep', ''); var i2 = document.createElement('img'); i2.src = 'logo-etec-outline.svg?v=10.8.110'; i2.alt = ''; i2.setAttribute('aria-hidden', 'true'); i2.draggable = false; w2.appendChild(i2); document.body.appendChild(w2); document.documentElement.classList.add('lp-wm'); }
    box = document.createElement('div'); box.id = 'etecMetaBox';
    ver = document.createElement('div'); ver.id = 'etecMetaVer'; ver.setAttribute('aria-label', 'رقم الإصدار وتاريخ آخر تحديث');
    ver.textContent = 'الإصدار ' + META.version + ' · آخر تحديث ' + META.updatedText;
    ver.style.display = 'none'; /* رقم الإصدار لمدير النظام وحده: يظهر بعد دخوله فقط، ولا يظهر على شاشة القفل ولا لغيره */
    var note = document.createElement('div'); note.id = 'etecMetaNote'; note.textContent = 'منصة داخلية لمدارس دار الفرسان — غير تابعة لهيئة تقويم التعليم والتدريب، ولا تعرض نتيجة تقويم أو اعتماد رسمية';
    note.style.cssText = 'font:600 9.5px/1.4 Tajawal,Tahoma,Arial,sans-serif;color:#64748b;background:rgba(255,255,255,.94);border:1px solid #e2e8f0;border-radius:999px;padding:1px 9px;max-width:100%';
    box.appendChild(ver); document.body.appendChild(box);
    /* شريط التاريخ الهجري/الميلادي والوقت الحالي (طلب FD، 23 نوفمبر 2026): ثابت أعلى الصفحة، توقيت الرياض، لا يُطبع */
    if (!document.getElementById('etecClock')) {
      var ck = document.createElement('div'); ck.id = 'etecClock'; ck.setAttribute('data-gate-keep', ''); ck.setAttribute('aria-hidden', 'true');
      ck.style.cssText = 'position:fixed;top:6px;left:8px;z-index:2147482000;pointer-events:none;direction:rtl;display:flex;flex-direction:column;align-items:flex-start;gap:1px;font:700 10.5px/1.45 Tajawal,Tahoma,Arial,sans-serif;color:#334155;background:rgba(255,255,255,.92);border:1px solid #e2e8f0;border-radius:10px;padding:3px 9px;box-shadow:0 1px 4px rgba(15,23,42,.10)';
      var tz = 'Asia/Riyadh';
      var fH, fG, fT;
      try { fH = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); fG = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }); fT = new Intl.DateTimeFormat('ar-SA-u-nu-latn', { timeZone: tz, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); } catch (e) { fH = fG = fT = null; }
      var mq = window.matchMedia ? window.matchMedia('(max-width:600px)') : null; var fHs; try { fHs = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { timeZone: tz, day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { fHs = null; }
      var tick = function () { if (!fH) return; var d = new Date(); if (mq && mq.matches && fHs) { ck.style.cssText += ';flex-direction:row;gap:5px;top:3px;left:4px;padding:1px 6px;font-size:9px;border-radius:8px;white-space:nowrap'; ck.innerHTML = '<span>' + fHs.format(d).replace(/\s?هـ$/, '') + ' هـ</span><span>·</span><span>' + fG.format(d).replace(/\s?م$/, '') + ' م</span><span>·</span><b style="font-variant-numeric:tabular-nums">' + fT.format(d) + '</b>'; return; } ck.innerHTML = '<span>' + fH.format(d).replace(/\s?هـ$/, '') + ' هـ</span><span>' + fG.format(d).replace(/\s?م$/, '') + ' م · <b style="font-variant-numeric:tabular-nums">' + fT.format(d) + '</b></span>'; };
      tick(); setInterval(tick, 1000); document.body.appendChild(ck);
    }
    /* ختم الطباعة (قرار FD، 23 نوفمبر 2026): تاريخ ووقت الطباعة الحالية وحدهما، يُكتبان لحظة الطباعة داخل أي عنصر .pstamp ويُمسحان بعدها؛ لا يظهر أي تاريخ آخر. */
    (function () {
      var tz = 'Asia/Riyadh', fH, fG, fT;
      try { fH = new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura-nu-latn', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }); fG = new Intl.DateTimeFormat('ar-SA-u-ca-gregory-nu-latn', { timeZone: tz, day: 'numeric', month: 'long', year: 'numeric' }); fT = new Intl.DateTimeFormat('ar-SA-u-nu-latn', { timeZone: tz, hour: '2-digit', minute: '2-digit', hour12: true }); } catch (e) { return; }
      function fill() { var d = new Date(), t = 'تاريخ الطباعة: ' + fH.format(d).replace(/\s?هـ$/, '') + ' هـ · ' + fG.format(d).replace(/\s?م$/, '') + ' م · الساعة ' + fT.format(d); [].forEach.call(document.querySelectorAll('.pstamp'), function (e) { e.textContent = t; }); window.etecPrintStampText = t; }
      function clear() { [].forEach.call(document.querySelectorAll('.pstamp'), function (e) { e.textContent = ''; }); }
      window.etecStampNow = fill; window.addEventListener('beforeprint', fill); window.addEventListener('afterprint', clear);
      var st = document.createElement('style'); st.textContent = '.pstamp{display:none}@media print{.pstamp{display:inline}.pstamp:empty{display:none}}'; document.head.appendChild(st);
    })();
    /* سطر آخر الصفحة (قرار FD، 23 نوفمبر 2026): نص كما حدده */
    if (!document.getElementById('etecTech')) { var tl = document.createElement('div'); tl.id = 'etecTech'; tl.setAttribute('data-gate-keep', ''); tl.textContent = 'منصة داخلية لمدارس دار الفرسان - Agentic AI - OLE DB - Crystal Reports'; tl.style.cssText = 'text-align:center;direction:rtl;font:600 11px/1.6 Tajawal,Tahoma,Arial,sans-serif;color:#64748b;padding:14px 12px 46px;position:relative;z-index:1'; document.body.appendChild(tl); }
    if (META.showEtecLogo === false) {
      var imgs = document.querySelectorAll('img[alt="ETEC Logo"], img[alt="هيئة تقويم التعليم والتدريب"]');
      for (var k = 0; k < imgs.length; k++) imgs[k].style.display = 'none';
    }
    tick();
  }
  var lastAuth = null;
  function admChk() { if (!ver) return; if (!window.DFGate || !window.DFGate.isAdmin) { ver.style.display = 'none'; return; } window.DFGate.isAdmin().then(function (ok) { ver.style.display = ok && window.DFGate.isAuth() ? '' : 'none'; }, function () { ver.style.display = 'none'; }); }
  function tick() {
    var a = auth();
    if (lastAuth === true && !a) { if (ls(UK) === 'admin') ls(UK, null, true); try { window.dispatchEvent(new CustomEvent('etec:logout')); } catch (e) {} }
    if (!a && ls(UK) === 'admin') ls(UK, null, true); /* انتهاء الجلسة يُسقط دور المدير وحده؛ بقية الأدوار لا تحتاج دخولاً */
    lastAuth = !!a;
    admChk();
    box.className = a ? 'auth' : ''; /* في الجلسة المصرح بها يظهر شريطها أسفل الصفحة، فنرتفع فوقه */
    var t = curType() || urlType(); if (t === 'admin' && !a) t = '';
    if (HAS_OWN_BAR || (!a && !t)) { if (usr) { usr.remove(); usr = null; } return; }
    var txt = t ? 'نوع المستخدم: ' + NAMES[t] : 'المستخدم: ' + ((a && a.u) || '');
    if (!usr) { usr = document.createElement('div'); usr.id = 'etecMetaUser'; usr.setAttribute('role', 'status'); box.insertBefore(usr, ver); }
    usr.textContent = txt; usr.title = a && a.u ? 'جلسة الدخول: ' + a.u : '';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  setInterval(function () { if (box) tick(); }, 2000);
  window.addEventListener('storage', function () { if (box) tick(); });
  window.addEventListener('etec:utchange', function () { if (box) tick(); });
  window.addEventListener('df-auth', function () { if (box) setTimeout(admChk, 80); });
})();

/* v10.8.58: كل إشارة نصية إلى هيئة تقويم التعليم والتدريب (ETEC) تُميَّز بألوان شعارها (أخضر · سماوي · أزرق · بنفسجي) في كل الصفحات، ما يشمل النصوص المولّدة بالجافاسكربت. العرض فقط: لا يغيّر النص ولا الروابط. */
(function () {
  'use strict';
  var RE = /(هيئة تقويم التعليم والتدريب|Education\s*(?:&amp;|&|and)\s*Training Evaluation Commission|\bETEC\b(?![_\-]?\w))/g;
  var SKIP = /^(SCRIPT|STYLE|TEXTAREA|INPUT|SELECT|OPTION|TITLE|NOSCRIPT|CODE|PRE|SVG|CANVAS|IFRAME|BUTTON)$/;
  var css = document.createElement('style');
  css.textContent = '.etec-ref{font-weight:800;color:#1892cf;background:linear-gradient(90deg,#3fa85f 0%,#12afc3 38%,#1892cf 66%,#44368c 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;-webkit-box-decoration-break:clone;box-decoration-break:clone;white-space:normal}' +
    '.etec-ref.on-dark{color:#8fe6c0;background-image:linear-gradient(90deg,#9ff0b8 0%,#7fe6f2 38%,#9fd2ff 66%,#d2c9ff 100%)}' +
    '@media print{.etec-ref{background:none!important;-webkit-text-fill-color:currentColor;color:#1892cf!important}.etec-ref.on-dark{color:#334155!important}}' +
    '@media (forced-colors:active){.etec-ref{background:none;-webkit-text-fill-color:currentColor;color:inherit}}';
  (document.head || document.documentElement).appendChild(css);
  function lum(c) { var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(c || ''); if (!m) return 0; return (0.2126 * m[1] + 0.7152 * m[2] + 0.0722 * m[3]) / 255; }
  function scan(root) {
    if (!root || !document.body) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: function (n) {
      var p = n.parentNode; if (!p || p.nodeType !== 1) return NodeFilter.FILTER_REJECT;
      if (SKIP.test(p.nodeName) || p.isContentEditable || (p.closest && p.closest('.etec-ref,[data-no-etec],svg'))) return NodeFilter.FILTER_REJECT;
      RE.lastIndex = 0; return RE.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT; } });
    var list = [], n; while ((n = w.nextNode())) list.push(n);
    list.forEach(function (t) {
      var txt = t.nodeValue, frag = document.createDocumentFragment(), last = 0, m, dark = false;
      try { dark = lum(getComputedStyle(t.parentNode).color) > 0.62; } catch (e) {}
      RE.lastIndex = 0;
      while ((m = RE.exec(txt))) {
        if (m.index > last) frag.appendChild(document.createTextNode(txt.slice(last, m.index)));
        var s = document.createElement('span'); s.className = 'etec-ref' + (dark ? ' on-dark' : ''); s.textContent = m[0]; frag.appendChild(s);
        last = m.index + m[0].length;
      }
      if (last < txt.length) frag.appendChild(document.createTextNode(txt.slice(last)));
      t.parentNode.replaceChild(frag, t);
    });
  }
  var tmr = null;
  function later() { clearTimeout(tmr); tmr = setTimeout(function () { if (document.body) scan(document.body); }, 120); }
  function start() { scan(document.body); if (window.MutationObserver) new MutationObserver(later).observe(document.body, { childList: true, subtree: true, characterData: true }); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
