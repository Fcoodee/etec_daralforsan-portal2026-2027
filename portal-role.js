/*
 * portal-role.js — v8.11.0
 * الدور المشترك بين كل صفحات البوابة: «تخصيص عرض» لا «حماية وصول».
 * البيانات وملف access.txt عامّان، والدور هنا يرتّب ما يظهر لكل مستخدم فقط.
 *
 * الاستعمال:
 *   - وسم واحد في كل صفحة بعد portal-meta.js:  <script src="portal-role.js"></script>
 *   - أي عنصر يحمل data-roles="admin,sup" يُخفى عن بقية الأدوار.
 *   - عنصر <div id="roleHome"></div> يُملأ بمدخل الدور المباشر (في index.html).
 *   - مفتاح التخزين نفسه الذي تستعمله evidence-link.html: etec.utype.v1
 */
(function () {
  "use strict";
  var KEY = "etec.utype.v1";
  var SKEY = "etec.utype.session"; /* احتياطي لتبويب العمل الحالي: portal-meta.js يمسح KEY عند غياب جلسة دخول صالحة */
  var ORDER = ["admin", "sup", "member", "self"];
  var ROLES = {
    admin:  { n: "مدير النظام", ic: "fa-user-shield", hl: "لوحة التحكم", q: "هل المنظومة سليمة؟", home: "home.html?u=admin" },
    sup:    { n: "مشرف فريق السجلات والشواهد", ic: "fa-user-check", hl: "لوحة المراجعة", q: "ما الذي ينتظر مراجعتي؟", home: "home.html?u=sup" },
    member: { n: "عضو فريق السجلات والشواهد", ic: "fa-user-pen", hl: "مساحتي", q: "ماذا أرفع الآن؟", home: "home.html?u=member" },
    self:   { n: "مشرف عمليات التقويم الذاتي", ic: "fa-magnifying-glass-chart", hl: "الفجوات والنسب", q: "أين فجواتنا؟", home: "home.html?u=self" }
  };
  /* من يرى أي صفحة. الصفحة خارج نطاق الدور تُعرض مع تنبيه ولا تُحجب (تخصيص عرض لا حماية). */
  var ALL = ORDER.slice();
  var PAGES = {
    /* صفحات مرحلة ما بعد تصحيح المسار (المبنية من جديد): مفتوحة بحسب الدور بلا دخول */
    "index.html": ALL, "home.html": ALL, "indicators.html": ALL
    /* كل ما عداها قديم: لمدير النظام وحده (يُعدّ admin افتراضاً لأي صفحة غير مدرجة أعلاه) */
  };

  /* روابط ثانوية مباشرة في مدخل كل دور (لا تتجاوز ثلاثة) */
  var SECOND = {
    admin:  [["indicators.html", "fa-list-check", "المؤشرات والسجلات"], ["status-report.html", "fa-clipboard-list", "تقرير الحالة"], ["governance.html", "fa-scale-balanced", "الحوكمة الإدارية"]],
    sup:    [["indicators.html", "fa-list-check", "المؤشرات والسجلات"]],
    member: [["indicators.html", "fa-list-check", "المؤشرات والسجلات"]],
    self:   [["indicators.html", "fa-list-check", "المؤشرات والسجلات"]]
  };


  function pageKey() {
    var s = (location.pathname || "").split("/").pop();
    return s || "index.html";
  }
  function valid(r) { return !!r && Object.prototype.hasOwnProperty.call(ROLES, r); }
  function esc(x) { return String(x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  /* مدير النظام وحده يحتاج رمزاً وكلمة مرور: الدور «admin» لا يُقبل إلا مع جلسة df_auth_v1 سارية وعلامة تحقق من الصلاحية (ADMK) تطابق المستخدم */
  var ADMK = "etec.admin.ok";
  function adminOk() {
    try {
      var a = JSON.parse(localStorage.getItem("df_auth_v1") || "null");
      if (!a || !(a.exp > Date.now())) return false;
      return sessionStorage.getItem(ADMK) === String(a.u || "");
    } catch (e) { return false; }
  }
  function get() {
    var r = get0();
    if (r === "admin" && !adminOk()) {
      try { if (localStorage.getItem(KEY) === "admin") localStorage.removeItem(KEY); } catch (e) {}
      try { if (sessionStorage.getItem(SKEY) === "admin") sessionStorage.removeItem(SKEY); } catch (e) {}
      return "";
    }
    return r;
  }
  function get0() {
    var q = "";
    try { q = new URLSearchParams(location.search).get("u") || ""; } catch (e) {}
    if (valid(q)) { try { localStorage.setItem(KEY, q); } catch (e) {} try { sessionStorage.setItem(SKEY, q); } catch (e) {} return q; }
    var v = "";
    try { v = localStorage.getItem(KEY) || ""; } catch (e) {}
    if (valid(v)) return v;
    if (v) { try { localStorage.removeItem(KEY); } catch (e) {} } /* قيمة قديمة (edu / ext) */
    try { v = sessionStorage.getItem(SKEY) || ""; } catch (e) { v = ""; }
    return valid(v) ? v : "";
  }
  function set(r) {
    if (!valid(r)) return;
    if (r === "admin" && !adminOk() && !(window.DFGate && DFGate.isAuth())) return;
    try { localStorage.setItem(KEY, r); } catch (e) {}
    try { sessionStorage.setItem(SKEY, r); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent("etec:utchange")); } catch (e) {}
  }
  function withGate(cb) {
    if (window.DFGate) { cb(); return; }
    var sc = document.createElement("script"); sc.src = "page-gate.js"; sc.dataset.lazy = "1";
    sc.onload = cb; sc.onerror = function () { alert("تعذّر تحميل نافذة الدخول؛ أعد تحميل الصفحة."); };
    document.head.appendChild(sc);
  }
  /* اختيار دور: الأدوار الثلاثة غير الإدارية فورية بلا رمز؛ مدير النظام يمرّ بنافذة الدخول ثم يُتحقَّق من صلاحيته في access.txt */
  function choose(k, done, o) {
    if (!valid(k)) return;
    if (k !== "admin") { set(k); if (done) done(k); return; }
    withGate(function () {
      function verify(force) {
        var run = function () {
          DFGate.isAdmin().then(function (ok) {
            if (ok) { try { sessionStorage.setItem(ADMK, DFGate.user()); } catch (e) {} set("admin"); if (done) done("admin"); }
            else { DFGate.logout(); verify(true); }
          });
        };
        if (DFGate.isAuth() && !force) run();
        else DFGate.require(run, { force: !!force, title: force ? "هذا الحساب ليس مدير النظام" : "دخول مدير النظام", msg: force ? "الحساب المُدخَل لا يملك صلاحية مدير النظام. أدخل رمز المدير وكلمة مروره، أو اختر دوراً آخر." : "مدير النظام وحده يحتاج رمز مستخدم وكلمة مرور. بقية الأدوار تُفتح بلا دخول." });
      }
      verify(false);
    });
  }
  function allowed(page, role) {
    var list = PAGES[page || pageKey()] || ["admin"];
    return !role || list.indexOf(role) >= 0;
  }

  var role = get();
  try { document.documentElement.setAttribute("data-role", role); css(); } catch (e) {}

  function css() {
    if (document.getElementById("prCss")) return;
    var st = document.createElement("style");
    st.id = "prCss";
    st.textContent =
      ".pr-off{display:none!important}" +
      "html:not([data-role=\"admin\"]) [data-admin-only]{display:none!important}" +
      "#prBar{font-family:Cairo,Tahoma,sans-serif;direction:rtl;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;padding:7px 14px;font-size:12px;line-height:1.7;background:#f0fdfa;border-bottom:1px solid #99f6e4;color:#134e4a}" +
      "#prBar.warn{background:#fffbeb;border-bottom-color:#fcd34d;color:#78350f}" +
      "#prBar.none{background:#eff6ff;border-bottom-color:#bfdbfe;color:#1e3a8a}" +
      "#prBar b{font-weight:800}" +
      "#prBar select{font:inherit;font-size:12px;padding:2px 8px;border:1px solid #94a3b8;border-radius:8px;background:#fff;color:#0f172a}" +
      "#prBar a{font-weight:800;text-decoration:none;padding:2px 10px;border-radius:999px;background:#0f766e;color:#fff}" +
      "#prBar a:hover{background:#115e59}" +
      "#prBar .sp{flex:1}" +
      "@media print{#prBar,#roleHome{display:none!important}}";
    document.head.appendChild(st);
  }

  function applyData() {
    var els = document.querySelectorAll("[data-roles]");
    for (var i = 0; i < els.length; i++) {
      var ok = (els[i].getAttribute("data-roles") || "").split(",");
      els[i].classList.toggle("pr-off", !!role && ok.indexOf(role) < 0);
    }
  }

  function bar() {
    var pg = pageKey();
    if (document.getElementById("utChip") || pg === "login.html" || pg === "index.html") return; /* evidence-link لها شريطها، وصفحة الدخول بلا شريط */
    var old = document.getElementById("prBar"); if (old) old.remove();
    var b = document.createElement("div");
    b.id = "prBar";
    var opts = ORDER.map(function (k) { return '<option value="' + k + '"' + (k === role ? " selected" : "") + ">" + esc(ROLES[k].n) + "</option>"; }).join("");
    var sel = '<label>الدور: <select id="prSel" aria-label="اختيار الدور">' + (role ? "" : '<option value="" selected>اختر دورك…</option>') + opts + "</select></label>";
    if (!role) {
      b.className = "none";
      b.innerHTML = "<span>اختر دورك لتظهر لك مساحتك مباشرة.</span>" + sel;
    } else if (!allowed(pg, role)) {
      b.className = "warn";
      b.innerHTML = "<span><b>هذه الصفحة خارج مساحة دورك</b> (" + esc(ROLES[role].n) + ")؛ تُعرض للاطلاع فقط.</span>" + sel + '<span class="sp"></span><a href="' + ROLES[role].home + '">العودة إلى «' + esc(ROLES[role].hl) + "»</a>";
    } else {
      b.innerHTML = '<span><b>' + esc(ROLES[role].n) + "</b> · " + esc(ROLES[role].q) + "</span>" + sel + '<span class="sp"></span><a href="' + ROLES[role].home + '">«' + esc(ROLES[role].hl) + "»</a>";
    }
    document.body.insertBefore(b, document.body.firstChild);
    var s = document.getElementById("prSel");
    if (s) s.addEventListener("change", function () {
      if (!valid(s.value)) return;
      var v = s.value;
      choose(v, function () {
        try { var u = new URL(location.href); u.searchParams.set("u", v); location.href = u.toString(); } catch (e) { location.reload(); }
      });
      s.value = role || "";
    });
  }

  function home() {
    var h = document.getElementById("roleHome");
    if (!h) return;
    var last = role;
    h.innerHTML = '<section aria-label="اختيار الدور" class="rh-box"><h2 class="rh-h">من أنت في المشروع؟</h2>' +
      '<p class="rh-p">اختر دورك لتفتح مساحتك مباشرة. مدير النظام وحده يحتاج رمزاً وكلمة مرور؛ بقية الأدوار تُفتح بلا دخول. الدور تخصيص عرض لا حماية للبيانات.</p><div class="rh-grid">' +
      ORDER.map(function (k) { return '<button type="button" data-pickrole="' + k + '" class="rh-pick"><i class="fa-solid ' + ROLES[k].ic + '"></i><b>' + esc(ROLES[k].n) + "</b><small>" + esc(ROLES[k].q) + "</small>" +
        (k === "admin" ? '<small><i class="fa-solid fa-lock"></i> يتطلب دخولاً</small>' : (k === last ? "<small>آخر اختيار لك</small>" : "")) + "</button>"; }).join("") +
      '</div><div id="rhMsg" class="rh-p" role="status"></div></section>';
    h.addEventListener("click", function (e) {
      var t = e.target.closest("[data-pickrole]"); if (!t) return;
      var k = t.getAttribute("data-pickrole");
      choose(k, function () { location.href = ROLES[k].home; });
    });
  }

  /* صفحة لمدير النظام وحده: تُغطّى بنافذة دخول حتى يدخل المدير (تخصيص عرض لا حماية خادم) */
  function adminOnlyGate() {
    var list = PAGES[pageKey()] || ["admin"];
    if (list.length !== 1 || list[0] !== "admin" || role === "admin" || document.getElementById("rolGate")) return;
    var hs = document.createElement("style"); hs.id = "rolGateCss"; hs.textContent = "html.rol-lock body>*:not(#rolGate):not(#pg-overlay){display:none!important}"; document.head.appendChild(hs);
    document.documentElement.classList.add("rol-lock");
    var d = document.createElement("div"); d.id = "rolGate";
    d.style.cssText = "position:fixed;inset:0;z-index:2147483100;display:flex;align-items:center;justify-content:center;padding:16px;direction:rtl;font-family:Cairo,Tahoma,sans-serif;background:linear-gradient(160deg,#002a2a,#0f172a)";
    d.innerHTML = '<div style="background:#fff;border-radius:20px;max-width:420px;width:100%;padding:26px;text-align:right;border-top:6px solid #c29b38"><h2 style="margin:0 0 8px;font-size:17px;font-weight:900;color:#003d3d">هذه الصفحة لمدير النظام</h2><p style="margin:0 0 14px;font-size:13px;line-height:1.9;color:#475569">يحتاج مدير النظام وحده إلى رمز مستخدم وكلمة مرور.</p>' +
      '<button id="rolGo" type="button" style="width:100%;border:0;border-radius:12px;background:#006666;color:#fff;font:800 14px Cairo,Tahoma,sans-serif;padding:12px;cursor:pointer">دخول مدير النظام</button>' +
      '<a href="index.html" style="display:block;text-align:center;margin-top:12px;font-size:12px;color:#006666">العودة إلى اختيار الدور</a></div>';
    document.body.appendChild(d);
    document.getElementById("rolGo").addEventListener("click", function () { choose("admin", function () { try { var u = new URL(location.href); u.searchParams.set("u", "admin"); location.href = u.toString(); } catch (e) { location.reload(); } }); });
  }
  function run() { css(); applyData(); bar(); home(); adminOnlyGate(); }
  window.PortalRole = { get: function () { return role; }, set: set, choose: choose, roles: ROLES, order: ORDER, pages: PAGES, allowed: allowed, valid: valid, refresh: function () { role = get(); run(); } };
  window.addEventListener("etec:utchange", function () { role = get(); if (role === "admin") { var g = document.getElementById("rolGate"); if (g) g.remove(); document.documentElement.classList.remove("rol-lock"); } try { document.documentElement.setAttribute("data-role", role); } catch (e) {} applyData(); });
  window.addEventListener("etec:logout", function () { if (role === "admin") { try { sessionStorage.removeItem(SKEY); sessionStorage.removeItem(ADMK); } catch (e) {} role = ""; try { document.documentElement.setAttribute("data-role", ""); } catch (e) {} applyData(); } });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
