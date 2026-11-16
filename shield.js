/* shield.js — طبقة حماية المحتوى الشاملة (تعمية + قفل التحديد/النسخ + ردع التصوير)
   تُحمَّل في كل صفحات المنصة. ملاحظة هندسية: هذه روادع سلوكية، لا يمكن لصفحة ويب منع تصوير الشاشة على مستوى نظام التشغيل. */
(function () {
  "use strict";
  if (window.__etecShield) return; window.__etecShield = 1;
  var d = document, de = d.documentElement;
  var css =
    "html,body,body *{-webkit-user-select:none!important;-moz-user-select:none!important;-ms-user-select:none!important;user-select:none!important;-webkit-touch-callout:none!important;-webkit-tap-highlight-color:transparent}" +
    "input,textarea,[contenteditable='true'],[contenteditable='true'] *{-webkit-user-select:text!important;-moz-user-select:text!important;user-select:text!important}" +
    "img,svg,a{-webkit-user-drag:none;user-drag:none}" +
    "#df-lock-btn,#df-logout-btn{display:none!important}" +
    "#sh-veil{position:fixed;top:0;right:0;bottom:0;left:0;z-index:2147483647;display:none;align-items:center;justify-content:center;flex-direction:column;gap:10px;text-align:center;padding:24px;" +
    "background:#0b1f3a;background:rgba(11,31,58,.985);-webkit-backdrop-filter:blur(30px);backdrop-filter:blur(30px);color:#fff;font-family:Cairo,Tahoma,Arial,sans-serif;direction:rtl}" +
    "#sh-veil b{font-size:18px}#sh-veil span{font-size:12px;opacity:.75;direction:ltr}" +
    "html.sh-on #sh-veil{display:flex}" +
    "@media print{html,body{display:none!important;visibility:hidden!important}}";
  var st = d.createElement("style"); st.id = "sh-css"; st.appendChild(d.createTextNode(css));
  (d.head || de).appendChild(st);

  var veil;
  function mk() {
    if (veil || !d.body) return;
    veil = d.createElement("div"); veil.id = "sh-veil"; veil.setAttribute("data-gate-keep", "1");
    veil.innerHTML = "<b>المحتوى محجوب مؤقتاً لحمايته</b><span>Content concealed for protection · return to this window to continue</span>";
    d.body.appendChild(veil);
  }
  var holdUntil = 0;
  function hide(ms) { mk(); de.classList.add("sh-on"); holdUntil = Date.now() + (ms || 0); }
  function show() { if (Date.now() < holdUntil) { setTimeout(show, holdUntil - Date.now() + 20); return; } de.classList.remove("sh-on"); }
  function wipeClip() { try { navigator.clipboard && navigator.clipboard.writeText(" ").catch(function () {}); } catch (e) {} }
  function isField(t) { return t && t.closest && t.closest("input,textarea,[contenteditable='true']"); }

  // تعمية عند فقدان التركيز/الإخفاء (أدوات القص، تبديل النوافذ، مبدّل التطبيقات)
  window.addEventListener("blur", function () { hide(0); });
  window.addEventListener("focus", function () { show(); });
  d.addEventListener("visibilitychange", function () { if (d.hidden) hide(0); else show(); });
  window.addEventListener("pagehide", function () { hide(0); });
  window.addEventListener("pageshow", function () { show(); });
  window.addEventListener("beforeprint", function () { hide(2500); });
  window.addEventListener("afterprint", function () { holdUntil = 0; show(); });
  // الأجهزة اللمسية: لا يوجد blur عند لقطة الشاشة؛ نردّ فقط على إخفاء التبويب
  // منع التضمين داخل إطار خارجي
  try { if (window.top !== window.self) { hide(1e9); } } catch (e) { hide(1e9); }

  function stop(e) { e.preventDefault(); e.stopPropagation(); return false; }
  ["copy", "cut", "dragstart", "drop"].forEach(function (n) { d.addEventListener(n, function (e) { if (!isField(e.target)) stop(e); }, true); });
  d.addEventListener("selectstart", function (e) { if (!isField(e.target)) stop(e); }, true);
  d.addEventListener("contextmenu", function (e) { if (!isField(e.target)) stop(e); }, true);

  d.addEventListener("keydown", function (e) {
    var k = (e.key || "").toLowerCase(), c = e.ctrlKey || e.metaKey, f = isField(e.target);
    if (k === "printscreen" || k === "snapshot") { hide(2500); wipeClip(); return stop(e); }
    if (e.metaKey && e.shiftKey && (k === "3" || k === "4" || k === "5" || k === "s")) { hide(2500); }  // macOS / Win+Shift+S
    if (e.key === "Meta" || e.key === "OS") { /* Win+Shift+S يبدأ بالمفتاح */ }
    if (k === "f12") return stop(e);
    if (c && e.shiftKey && (k === "i" || k === "j" || k === "c" || k === "s")) return stop(e);
    if (c && (k === "p" || k === "s" || k === "u")) return stop(e);
    if (c && !f && (k === "c" || k === "x" || k === "a")) return stop(e);
  }, true);
  d.addEventListener("keyup", function (e) {
    var k = (e.key || "").toLowerCase();
    if (k === "printscreen" || k === "snapshot") { hide(2500); wipeClip(); setTimeout(show, 2600); }
  }, true);

  if (d.readyState === "loading") d.addEventListener("DOMContentLoaded", mk); else mk();
})();
