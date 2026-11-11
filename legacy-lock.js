/*
 * legacy-lock.js — v8.12.0 — «تصحيح المسار»
 * يقفل كل ما لا يوافق مرحلة تصحيح المسار (ما بعد وثائق الهيئة الخمس) ويتيحه لمدير النظام وحده.
 * كلمة المرور تُجلب من ملف access.txt الخارجي عبر page-gate.js (DFGate)، ومدير النظام هو المستخدم «admin»
 * أو المذكورون في السطر  #@admin,مستخدم1,مستخدم2  في access.txt.
 *
 * الاستعمال:
 *   عنصر قديم مخفي افتراضياً:            <div data-legacy>…</div>
 *   عنصر يظهر وهو مقفل فقط (زر/تنبيه):    <div data-legacy-lockui>…</div>
 *   زر طلب الدخول:                        <button data-legacy-unlock>…</button>
 *   صفحة قديمة كاملة (في <head>):         <script src="legacy-lock.js" data-page="1"></script>
 * البرمجة: window.LegacyLock = { isAdmin(), request(cb) }
 * القفل في المتصفح ولا يحجب المصدر عمّن يعرف قراءته؛ والحماية الفعلية تحتاج خادم مصادقة (مرحلة لاحقة).
 * عند تعذّر قراءة access.txt يبقى كل شيء مقفلاً (fail-closed).
 */
(function () {
  "use strict";
  var me = document.currentScript, PAGE = !!(me && me.getAttribute("data-page") === "1");
  var root = document.documentElement, ok = false, busy = false;

  var st = document.createElement("style");
  st.textContent =
    "html.lg-on [data-legacy]{display:none!important}" +
    "html:not(.lg-on) [data-legacy-lockui]{display:none!important}" +
    "html.lg-page body>*:not(#lgOverlay){display:none!important}" +
    "#lgOverlay{position:fixed;inset:0;z-index:2147482500;display:flex;align-items:center;justify-content:center;padding:20px;direction:rtl;font-family:Cairo,Tahoma,sans-serif;background:linear-gradient(160deg,#002a2a,#0f172a)}" +
    "#lgOverlay .bx{max-width:460px;width:100%;background:#fff;border-radius:18px;padding:28px 24px;text-align:center;border-top:6px solid #c29b38}" +
    "#lgOverlay h1{margin:0 0 8px;font-size:18px;font-weight:800;color:#0f172a}" +
    "#lgOverlay p{margin:0 0 16px;font-size:13px;line-height:1.9;color:#475569}" +
    "#lgOverlay .b{display:inline-block;margin:3px;padding:9px 16px;border-radius:10px;font:700 12px Cairo,Tahoma,sans-serif;text-decoration:none;cursor:pointer;border:0}" +
    "#lgOverlay .p{background:#003d3d;color:#fff}#lgOverlay .s{background:#f1f5f9;color:#0f172a}" +
    "#lgOverlay .m{margin-top:10px;font-size:12px;font-weight:700;color:#b45309;min-height:18px}";
  document.head.appendChild(st);
  root.classList.add("lg-on");
  if (PAGE) root.classList.add("lg-page");

  function apply() {
    root.classList.toggle("lg-on", !ok);
    if (PAGE) { root.classList.toggle("lg-page", !ok); if (ok) removeOverlay(); else showOverlay(); }
    try { window.dispatchEvent(new CustomEvent("lg:change", { detail: { admin: ok } })); } catch (e) {}
  }
  function check() {
    return new Promise(function (res) {
      var n = 0, t = setInterval(function () {
        if (window.DFGate) { clearInterval(t); try { if (!DFGate.isAuth()) return res(false); DFGate.isAdmin().then(function (v) { res(!!v); }, function () { res(false); }); } catch (e) { res(false); } }
        else if (++n > 40) { clearInterval(t); res(false); }
      }, 100);
    });
  }
  function refresh() { return check().then(function (v) { ok = v; apply(); return v; }); }

  function request(cb) {
    if (ok) { if (cb) cb(); return; }
    if (!window.DFGate || busy) return;
    busy = true;
    DFGate.require(function () {
      refresh().then(function (v) {
        busy = false;
        if (v) { if (cb) cb(); }
        else setMsg("هذا الحساب ليس مدير النظام؛ المحتوى القديم لمدير النظام وحده.");
      });
    }, { title: "دخول مدير النظام", msg: "هذا المحتوى من مرحلة ما قبل «تصحيح المسار» ويُتاح لمدير النظام وحده. أدخل بيانات مدير النظام المعتمدة." });
    setTimeout(function () { busy = false; }, 1500);
  }

  var ov = null;
  function setMsg(t) { var m = ov && ov.querySelector(".m"); if (m) m.textContent = t; else { try { alert(t); } catch (e) {} } }
  function showOverlay() {
    if (ov || !document.body) return;
    ov = document.createElement("div"); ov.id = "lgOverlay"; ov.setAttribute("role", "alertdialog");
    ov.innerHTML = '<div class="bx"><h1>محتوى ما قبل «تصحيح المسار»</h1><p>هذه الصفحة لا توافق المعايير والوثائق الرسمية المعتمدة في المرحلة الحالية، وتُتاح لمدير النظام وحده.</p>' +
      '<button type="button" class="b p" data-lgreq>دخول مدير النظام</button><a class="b s" href="index.html">البوابة الرئيسية</a><a class="b s" href="evidence-link.html">مشروع ربط الشواهد</a><div class="m" role="status"></div></div>';
    document.body.appendChild(ov);
  }
  function removeOverlay() { if (ov) { ov.remove(); ov = null; } }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-legacy-unlock],[data-lgreq]"); if (!b) return;
    e.preventDefault(); request();
  });
  window.addEventListener("df-auth", refresh);
  function boot() { if (PAGE) showOverlay(); refresh(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
  window.LegacyLock = { isAdmin: function () { return ok; }, request: request, refresh: refresh };
})();
