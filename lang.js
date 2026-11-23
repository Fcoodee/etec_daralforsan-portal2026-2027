/* lang.js — v10.9.0 — تجربة اللغة لصفحات المنصة: عربي | English | عربي + English.
   - العربية هي الأصل في الصفحات؛ الإنجليزية من قاموس ثابت (i18n-ui.js) + البيانات الرسمية (report-i18n.js وhighlights.js).
   - الوضع العربي لا يحمّل شيئاً إضافياً. القاموس يُحمَّل عند اختيار English أو العربي + English فقط.
   - التبديل بتغيير نصوص العقد نفسها (لا إعادة بناء للصفحة)، ويُحفظ الاختيار في المتصفح.
   - لا يعمل على صفحات التقارير والملفات (report وopen و404): لا تضمّنها هذا الملف.
   - ما لا ترجمة له في القاموس (أسماء الملفات والسجلات القادمة من Drive) يبقى كما هو. */
(function () {
  "use strict";
  var KEY = "etec.lang", MODES = ["ar", "en", "both"], de = document.documentElement;
  var me = document.currentScript, VER = (me && (me.src.match(/[?&]v=([\d.]+)/) || [])[1]) || "";
  function stored() { try { var v = localStorage.getItem(KEY); return MODES.indexOf(v) >= 0 ? v : null; } catch (e) { return null; } }
  var mode = stored() || de.getAttribute("data-lang-default") || "ar";
  if (MODES.indexOf(mode) < 0) mode = "ar";

  var M = new Map(), K = {}, P = [], loaded = { ui: false, data: false }, ready = false, busy = false, rec = [], krec = [], arec = [], obs = null;
  var SKIP = /^(SCRIPT|STYLE|NOSCRIPT|TEXTAREA|CODE|PRE|SVG|CANVAS|IFRAME|OBJECT|TITLE)$/;
  var AR = /[؀-ۿ]/;
  function norm(t) { return String(t).replace(/\s+/g, " ").trim(); }

  /* ===== القاموس ===== */
  function absorbUI() {
    var L = window.ETEC_L; if (!L || loaded.ui) return;
    loaded.ui = true;
    Object.keys(L.u || {}).forEach(function (a) { M.set(norm(a), L.u[a]); });
    K = L.k || {};
    P = (L.p || []).map(function (r) { return [new RegExp(r[0]), r[1]]; });
  }
  /* البيانات الرسمية: أسماء المجالات والمعايير والمؤشرات والسجلات والوثائق + الإضاءات */
  function absorbData() {
    var I = window.ETEC_I18N, H = window.ETEC_PH;
    if (I && H && !loaded.data) {
      loaded.data = true;
      (H.inds || []).forEach(function (i) {
        if (i.text && I.ind && I.ind[i.code]) M.set(norm(i.text), I.ind[i.code]);
        if (i.dn && I.dom && I.dom[i.d]) M.set(norm(i.dn), I.dom[i.d]);
        if (i.cn && I.crit && I.crit[i.c]) M.set(norm(i.cn), I.crit[i.c]);
      });
      Object.keys(I.rec || {}).forEach(function (a) { M.set(norm(a), I.rec[a]); });
      Object.keys(I.docs || {}).forEach(function (c) { (I.docs[c] || []).forEach(function (x) { if (x.ar && x.en) M.set(norm(x.ar), x.en); }); });
    }
    var HL = window.ETEC_HL;
    if (HL && !absorbData._hl) {
      absorbData._hl = true;
      Object.keys(HL).forEach(function (c) { (HL[c] || []).forEach(function (x) { if (x && x.ar && x.en) M.set(norm(x.ar), x.en); }); });
    }
  }
  function loadJS(src, cb) {
    var s = document.createElement("script"); s.src = src + (VER ? "?v=" + VER : ""); s.onload = cb; s.onerror = cb; document.head.appendChild(s);
  }
  function ensureDict(cb) {
    var need = 1; function done() { if (--need === 0) { absorbUI(); absorbData(); cb(); } }
    if (!window.ETEC_L) { need++; loadJS("i18n-ui.js", done); }
    if (window.ETEC_PH && !window.ETEC_I18N) { need++; loadJS("report-i18n.js", done); }
    done();
  }

  /* ===== الترجمة ===== */
  function tr(t, depth) {
    var k = norm(t); if (!k || !AR.test(k)) return null;
    var v = M.get(k); if (v) return v;
    depth = depth || 0; if (depth > 3) return null;
    for (var i = 0; i < P.length; i++) {
      var m = P[i][0].exec(k); if (!m) continue;
      /* $n = المجموعة كما هي؛ {n} = المجموعة مترجمة (أو كما هي إن لم تُترجم) */
      return P[i][1].replace(/\$(\d)|\{(\d)\}/g, function (x, a, b) { if (a) return m[+a] || ""; var g = m[+b] || ""; return tr(g, depth + 1) || g; });
    }
    /* مقاطع مفصولة بـ « · » أو « — »: تُترجم كل قطعة على حدة إن أمكن ترجمة كل ما هو عربي فيها */
    var seps = [" · ", " — ", " - "];
    for (var j = 0; j < seps.length; j++) {
      if (k.indexOf(seps[j]) < 0) continue;
      var parts = k.split(seps[j]), out = [], ok = true;
      for (var q = 0; q < parts.length; q++) { var pt = parts[q], r = AR.test(pt) ? tr(pt, depth + 1) : pt; if (r == null) { ok = false; break; } out.push(r); }
      if (ok) return out.join(seps[j]);
    }
    return null;
  }
  function skipEl(el) { return !el || SKIP.test(el.nodeName) || (el.closest && el.closest("[data-no-i18n],.i18n-en,.lg-ar,.lg-en,#etecWM,#etecWM2,#etecMetaBox,[data-k]")); }
  function put(n, en) {
    var s = n.nodeValue, lead = (s.match(/^\s*/) || [""])[0], trail = (s.match(/\s*$/) || [""])[0];
    if (mode === "en") { n.__cur = lead + en + trail; n.nodeValue = n.__cur; }
    else if (mode === "both" && n.parentNode && n.parentNode.nodeName === "OPTION") { n.__cur = lead + s.trim() + " · " + en + trail; n.nodeValue = n.__cur; }
    else if (mode === "both" && n.parentNode) {
      var sp = document.createElement("span"); sp.className = "i18n-en"; sp.setAttribute("lang", "en"); sp.setAttribute("dir", "ltr"); sp.textContent = en;
      n.parentNode.insertBefore(sp, n.nextSibling); n.__sp = sp;
    }
  }
  function procText(n) {
    if (n.__i || mode === "ar" || !n.isConnected) return;
    var p = n.parentNode; if (!p || skipEl(p)) return;
    var en = tr(n.nodeValue); if (!en) return;
    n.__i = 1; n.__ar = n.nodeValue; rec.push(n); put(n, en);
  }
  var ATTR = ["placeholder", "title", "aria-label", "alt"];
  function procAttrs(el) {
    if (mode !== "en" || el.nodeType !== 1 || skipEl(el)) return;
    for (var i = 0; i < ATTR.length; i++) {
      var a = ATTR[i], v = el.getAttribute(a); if (!v || el.hasAttribute("data-ar-" + a)) continue;
      var en = tr(v); if (en) { el.setAttribute("data-ar-" + a, v); el.setAttribute(a, en); arec.push([el, a]); }
    }
  }
  function procKeyed(el) {
    var key = el.getAttribute("data-k"); if (!key || mode === "ar" || el.__k) return;
    var en = K[key]; if (!en) return;
    el.__k = 1; el.__arH = el.innerHTML; krec.push(el);
    if (mode === "en") el.innerHTML = en; else el.innerHTML = el.__arH + '<span class="i18n-en i18n-blk" lang="en" dir="ltr">' + en + "</span>";
  }
  function walk(root) {
    if (mode === "ar" || !root) return;
    if (root.nodeType === 3) { procText(root); return; }
    if (root.nodeType !== 1) return;
    if (root.matches && root.matches("[data-k]")) { procKeyed(root); return; }
    if (skipEl(root)) return;
    procAttrs(root);
    var tw = document.createTreeWalker(root, 1 | 4, null), n, els = [], txt = [];
    while ((n = tw.nextNode())) { if (n.nodeType === 3) txt.push(n); else els.push(n); }
    els.forEach(function (e) { if (e.hasAttribute && e.hasAttribute("data-k")) procKeyed(e); else procAttrs(e); });
    txt.forEach(procText);
  }
  function restore() {
    rec.forEach(function (n) { if (n.__sp && n.__sp.parentNode) n.__sp.parentNode.removeChild(n.__sp); if (n.__ar != null && n.isConnected !== false) n.nodeValue = n.__ar; n.__i = 0; n.__sp = null; n.__cur = null; });
    krec.forEach(function (el) { if (el.__arH != null) el.innerHTML = el.__arH; el.__k = 0; });
    arec.forEach(function (x) { var el = x[0], a = x[1], o = el.getAttribute("data-ar-" + a); if (o != null) el.setAttribute(a, o); el.removeAttribute("data-ar-" + a); });
    rec = []; krec = []; arec = [];
    var t = document.title; if (de.__arTitle) document.title = de.__arTitle;
  }
  function centerPass() {
    var sp = document.querySelectorAll(".i18n-en:not(.i18n-c)"), hit = [], i;
    for (i = 0; i < sp.length; i++) { var pe = sp[i].parentElement; if (pe && getComputedStyle(pe).textAlign === "center") hit.push(sp[i]); }
    for (i = 0; i < hit.length; i++) hit[i].classList.add("i18n-c");
  }
  function titleSync() {
    if (!de.__arTitle) de.__arTitle = document.title;
    var en = tr(de.__arTitle);
    document.title = mode === "ar" || !en ? de.__arTitle : (mode === "en" ? en : de.__arTitle + " | " + en);
  }

  /* ===== التطبيق على الصفحة ===== */
  function attrs() { de.setAttribute("data-lang", mode); de.setAttribute("lang", mode === "en" ? "en" : "ar"); de.setAttribute("dir", mode === "en" ? "ltr" : "rtl"); }
  function apply() {
    busy = true; if (obs) obs.disconnect();
    restore(); attrs();
    if (mode !== "ar") { walk(document.body); titleSync(); if (mode === "both") centerPass(); }
    else if (de.__arTitle) document.title = de.__arTitle;
    busy = false; watch(); paintSw();
    try { window.dispatchEvent(new CustomEvent("etec-lang", { detail: { mode: mode } })); } catch (e) {}
  }
  function watch() {
    if (!window.MutationObserver || mode === "ar") return;
    if (!obs) obs = new MutationObserver(function (list) {
      if (busy || mode === "ar") return;
      busy = true; obs.disconnect();
      list.forEach(function (m) {
        if (m.type === "characterData") {
          var n = m.target;
          if (n.__i && n.nodeValue !== n.__cur && mode === "en") { n.__i = 0; n.__ar = null; var ix = rec.indexOf(n); if (ix >= 0) rec.splice(ix, 1); procText(n); }
          else if (!n.__i) procText(n);
        } else m.addedNodes.forEach(function (a) { if (!(a.nodeType === 1 && a.classList && a.classList.contains("i18n-en"))) walk(a); });
      });
      busy = false; obs.observe(document.body, { childList: true, subtree: true, characterData: true });
    });
    obs.observe(document.body, { childList: true, subtree: true, characterData: true });
  }
  function set(m, remember) {
    if (MODES.indexOf(m) < 0) return;
    mode = m; if (remember !== false) { try { localStorage.setItem(KEY, m); } catch (e) {} }
    if (m === "ar") { apply(); return; }
    ensureDict(apply);
  }

  /* ===== المبدّل ===== */
  var sw;
  function buildSw() {
    if (sw) return;
    sw = document.createElement("div"); sw.className = "lg-sw"; sw.setAttribute("data-no-i18n", ""); sw.setAttribute("role", "group"); sw.setAttribute("aria-label", "اللغة · Language");
    [["ar", "عربي", "Arabic"], ["en", "EN", "English"], ["both", "ع + EN", "Arabic + English"]].forEach(function (x) {
      var b = document.createElement("button"); b.type = "button"; b.setAttribute("data-m", x[0]); b.textContent = x[1]; b.title = x[2]; b.setAttribute("aria-label", x[2]);
      b.addEventListener("click", function () { set(x[0]); }); sw.appendChild(b);
    });
    sw.classList.add("lg-fix"); document.body.appendChild(sw);
    var css = document.createElement("style");
    css.textContent = ".lg-sw{display:inline-flex;gap:0;border:1px solid rgba(148,163,184,.55);border-radius:999px;overflow:hidden;background:rgba(255,255,255,.96);direction:ltr;flex:none;margin-inline-start:auto;font-family:var(--font-en,Inter,Arial,sans-serif)}" +
      ".lg-sw button{all:unset;box-sizing:border-box;cursor:pointer;padding:3px 11px;font-size:12px;font-weight:700;color:#334155;min-height:26px;line-height:20px;white-space:nowrap}" +
      ".lg-sw button+button{border-inline-start:1px solid #e2e8f0}.lg-sw button[aria-pressed=true]{background:#123a63;color:#fff}.lg-sw button:focus-visible{outline:2px solid #1f78c1;outline-offset:-2px}" +
      ".lg-sw.lg-hero{position:absolute;top:12px;inset-inline-start:12px;z-index:3}.lg-sw.lg-fix{position:fixed;bottom:14px;left:50%;right:auto;top:auto;margin:0;transform:translateX(-50%);z-index:2147482000;box-shadow:0 4px 16px rgba(15,23,42,.28);border-color:rgba(18,58,99,.35)}body{padding-bottom:64px}@media(max-width:600px){.lg-sw.lg-fix{bottom:96px}body{padding-bottom:104px}}" +
      ".i18n-en{font-family:var(--font-en,Inter,Arial,sans-serif);font-weight:500;font-size:.84em;line-height:1.5;direction:ltr;unicode-bidi:isolate;opacity:.85;letter-spacing:0}" +
      ".i18n-en:not(.i18n-blk){display:block;width:fit-content;max-width:100%;margin-left:auto;margin-right:0}.i18n-en.i18n-c{margin-left:auto;margin-right:auto}.i18n-blk{display:block;margin-top:2px;width:fit-content;max-width:100%;margin-left:auto;margin-right:0}" +
      "html[data-lang=en] body{text-align:start}@media print{.lg-sw{display:none}}";
    document.head.appendChild(css);
    paintSw();
  }
  function paintSw() { if (!sw) return; Array.prototype.forEach.call(sw.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-m") === mode ? "true" : "false"); }); }

  function boot() {
    if (ready) return; ready = true;
    de.__arTitle = document.title;
    buildSw();
    if (mode === "ar") { attrs(); return; }
    ensureDict(apply);
  }
  attrs();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();

  /* واجهة عامة: للاختبار وللصفحات التي تُحمّل بيانات متأخرة */
  window.ETEC_LANG = {
    get: function () { return mode; }, set: set,
    refresh: function () { if (mode !== "ar") { absorbUI(); absorbData(); apply(); } },
    missing: function () {
      var out = {}, tw = document.createTreeWalker(document.body, 4, null), n;
      while ((n = tw.nextNode())) { var p = n.parentNode; if (!p || SKIP.test(p.nodeName) || (p.closest && p.closest("[data-no-i18n],.i18n-en,.lg-ar,.lg-en,#etecWM,#etecWM2,#etecMetaBox,[data-k]"))) continue; var s = n.__ar != null ? n.__ar : n.nodeValue; var k = norm(s); if (k && AR.test(k) && !(M.has(k)) && !n.__i) out[k] = 1; }
      Array.prototype.forEach.call(document.querySelectorAll("[placeholder],[title],[aria-label],[alt]"), function (el) { if (skipEl(el)) return; ATTR.forEach(function (a) { var v = el.getAttribute("data-ar-" + a) || el.getAttribute(a), k = v && norm(v); if (k && AR.test(k) && !tr(k)) out["@" + a + ": " + k] = 1; }); });
      return Object.keys(out);
    }
  };
})();
