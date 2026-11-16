/* admin-only.js — قفل المنصة: لا يُعرض محتوى الصفحة إلا لمدير النظام بعد دخول صحيح (page-gate.js + سطر #@admin في access.txt).
   يُحمَّل في رأس كل صفحة عمل بعد page-gate.js (data-always). غير المدير يرى بطاقة «الدخول لمدير النظام فقط».
   ⚠ قفل في المتصفح لا خادم: يمنع الاطلاع العابر ولا يحجب ملفات الموقع العامة عمّن يعرف قراءتها؛ الإغلاق الفعلي بإيقاف النشر. */
(function () {
  "use strict";
  var html = document.documentElement, card = null, tries = 0;
  var st = document.createElement("style");
  st.textContent = "html:not(.adm-ok) body>*:not(#adm-lock):not(#pg-overlay):not([data-gate-keep]){display:none!important}" +
    "#adm-lock{position:fixed;inset:0;z-index:2147481500;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Cairo,Tahoma,sans-serif;direction:rtl;background:linear-gradient(160deg,#123a63,#5b2a86)}" +
    "#adm-lock .bx{background:#fff;border-radius:20px;max-width:440px;width:100%;padding:26px;text-align:center;box-shadow:0 24px 70px rgba(0,0,0,.4);border-top:6px solid #6a2c91}" +
    "#adm-lock h2{margin:8px 0 6px;font-size:19px;font-weight:900;color:#123a63}#adm-lock p{margin:0 0 14px;font-size:13.5px;color:#475569;line-height:1.9}" +
    "#adm-lock a,#adm-lock button{display:inline-block;margin:3px;border:1px solid #cbd5e1;background:#fff;border-radius:11px;padding:7px 16px;font:inherit;font-weight:800;font-size:13px;color:#0f172a;cursor:pointer;text-decoration:none}" +
    "#adm-lock .pri{background:#123a63;color:#fff;border-color:#123a63}";
  document.head.appendChild(st);
  function drop() { if (card) { card.remove(); card = null; } }
  function deny() {
    html.classList.remove("adm-ok");
    if (card || !document.body) return;
    card = document.createElement("div"); card.id = "adm-lock"; card.setAttribute("role", "alert");
    card.innerHTML = '<div class="bx"><div style="font-size:38px">🔒</div><h2>المنصة مغلقة حالياً</h2><p>الدخول متاح لمدير النظام فقط.<br><span dir="ltr" style="font-size:12px;color:#64748b">The platform is closed. Access is limited to the system administrator.</span></p><a class="pri" href="index.html">الصفحة التعريفية</a><button type="button" id="adm-out">تسجيل الخروج</button></div>';
    document.body.appendChild(card);
    card.querySelector("#adm-out").onclick = function () { try { window.DFGate.logout(); } catch (e) {} location.href = "index.html"; };
  }
  function check() {
    if (!window.DFGate) { if (tries++ < 40) setTimeout(check, 100); return; }
    if (!window.DFGate.isAuth()) { html.classList.remove("adm-ok"); drop(); return; }
    window.DFGate.isAdmin().then(function (ok) {
      if (!window.DFGate.isAuth()) { html.classList.remove("adm-ok"); return; }
      if (ok) { drop(); html.classList.add("adm-ok"); } else deny();
    });
  }
  window.addEventListener("df-auth", function () { setTimeout(check, 60); });
  window.addEventListener("storage", function () { setTimeout(check, 60); });
  setInterval(function () { if (window.DFGate && !window.DFGate.isAuth() && html.classList.contains("adm-ok")) check(); }, 3000);
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", check); else check();
})();
