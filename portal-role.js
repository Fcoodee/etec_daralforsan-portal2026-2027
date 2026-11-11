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
    admin:  { n: "مدير النظام", ic: "fa-user-shield", hl: "لوحة التحكم", q: "هل المنظومة سليمة؟", home: "evidence-link.html?u=admin" },
    sup:    { n: "مشرف فريق السجلات والشواهد", ic: "fa-user-check", hl: "لوحة المراجعة", q: "ما الذي ينتظر مراجعتي؟", home: "evidence-link.html?u=sup" },
    member: { n: "عضو فريق السجلات والشواهد", ic: "fa-user-pen", hl: "مساحتي", q: "ماذا أرفع الآن؟", home: "evidence-link.html?u=member" },
    self:   { n: "مشرف عمليات التقويم الذاتي", ic: "fa-magnifying-glass-chart", hl: "الفجوات والنسب", q: "أين فجواتنا؟", home: "evidence-link.html?u=self" }
  };
  /* من يرى أي صفحة. الصفحة خارج نطاق الدور تُعرض مع تنبيه ولا تُحجب (تخصيص عرض لا حماية). */
  var ALL = ORDER.slice();
  var PAGES = {
    "index.html": ALL, "stages.html": ALL, "login.html": ALL, "evidence-link.html": ALL,
    "indicator.html": ["admin", "sup", "member"],
    "output.html": ["admin", "sup", "member"],
    "hardcopy.html": ["admin", "sup"],
    "approval-request.html": ["admin"],
    "stage-wip.html": ["admin"],
    "governance.html": ["admin", "sup", "self"],
    "all_summary.html": ["admin"],
    "status-report.html": ["admin", "sup", "self"],
    "report-all.html": ["admin"],
    "records-sources.html": ["admin", "sup", "self"],
    "reference.html": ["admin", "sup", "self"],
    "2026-2027.html": ["admin"],
    "index-2025-2026.html": ["admin"]
  };
  /* روابط ثانوية مباشرة في مدخل كل دور (لا تتجاوز ثلاثة) */
  var SECOND = {
    admin:  [["approval-request.html", "fa-file-signature", "طلب رقمنة الزيارة"], ["governance.html", "fa-scale-balanced", "الحوكمة الإدارية"], ["reference.html", "fa-book-open", "مرجع الهيئة"]],
    sup:    [["hardcopy.html", "fa-print", "تقرير استلام المهام"], ["output.html", "fa-file-image", "مولّد التقرير البصري"], ["status-report.html", "fa-clipboard-list", "تقرير الحالة"]],
    member: [["output.html", "fa-file-image", "مولّد التقرير البصري"]],
    self:   [["status-report.html", "fa-clipboard-list", "تقرير الحالة"], ["reference.html", "fa-book-open", "مرجع الهيئة"], ["records-sources.html", "fa-list-check", "مصادر السجلات"]]
  };

  function pageKey() {
    var s = (location.pathname || "").split("/").pop();
    return s || "index.html";
  }
  function valid(r) { return !!r && Object.prototype.hasOwnProperty.call(ROLES, r); }
  function esc(x) { return String(x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function get() {
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
    try { localStorage.setItem(KEY, r); } catch (e) {}
    try { sessionStorage.setItem(SKEY, r); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent("etec:utchange")); } catch (e) {}
  }
  function allowed(page, role) {
    var list = PAGES[page || pageKey()];
    if (!list) return true;
    return !role || list.indexOf(role) >= 0;
  }

  var role = get();

  function css() {
    if (document.getElementById("prCss")) return;
    var st = document.createElement("style");
    st.id = "prCss";
    st.textContent =
      ".pr-off{display:none!important}" +
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
    if (document.getElementById("utChip") || pg === "login.html") return; /* evidence-link لها شريطها، وصفحة الدخول بلا شريط */
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
      set(s.value);
      try { var u = new URL(location.href); u.searchParams.set("u", s.value); location.href = u.toString(); } catch (e) { location.reload(); }
    });
  }

  function home() {
    var h = document.getElementById("roleHome");
    if (!h) return;
    if (!role) {
      h.innerHTML = '<section aria-label="اختيار الدور" class="mb-8 bg-white border border-teal-200 rounded-2xl p-5 shadow-sm">' +
        '<h2 class="text-base font-black text-slate-800 mb-1">من أنت في المشروع؟</h2>' +
        '<p class="text-[12px] text-slate-500 mb-4 leading-7">اختر دورك لتظهر لك مساحتك مباشرة، ويتذكّر هذا الجهاز اختيارك. الدور تخصيص عرض لا حماية للبيانات.</p>' +
        '<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">' +
        ORDER.map(function (k) { return '<button type="button" data-pickrole="' + k + '" class="text-right border border-gray-200 hover:border-teal-400 hover:bg-teal-50 rounded-xl p-4 transition"><i class="fa-solid ' + ROLES[k].ic + ' text-teal-700"></i> <b class="text-[13px] text-slate-800">' + esc(ROLES[k].n) + '</b><span class="block text-[11.5px] text-slate-500 mt-1">' + esc(ROLES[k].q) + "</span></button>"; }).join("") +
        "</div></section>";
      h.addEventListener("click", function (e) {
        var t = e.target.closest("[data-pickrole]"); if (!t) return;
        set(t.getAttribute("data-pickrole")); location.href = "index.html?u=" + t.getAttribute("data-pickrole");
      });
      return;
    }
    var r = ROLES[role];
    var sec = (SECOND[role] || []).map(function (x) { return '<a href="' + x[0] + '" class="inline-flex items-center gap-1.5 text-[12px] font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-full px-3 py-1.5"><i class="fa-solid ' + x[1] + '"></i> ' + esc(x[2]) + "</a>"; }).join("");
    h.innerHTML = '<section aria-label="مدخلك المباشر" class="mb-8 bg-gradient-to-br from-teal-700 to-slate-900 text-white rounded-2xl p-6 shadow-lg">' +
      '<div class="flex flex-wrap items-center gap-4">' +
      '<div class="p-4 bg-white/10 rounded-2xl"><i class="fa-solid ' + r.ic + ' text-3xl text-cyan-200"></i></div>' +
      '<div class="flex-1 min-w-[220px]"><div class="text-[11px] font-bold text-cyan-200">أهلاً بك · ' + esc(r.n) + "</div>" +
      '<div class="text-lg font-black mt-0.5">' + esc(r.q) + "</div></div>" +
      '<a href="' + r.home + '" class="inline-flex items-center gap-2 bg-cyan-300 hover:bg-white text-slate-950 text-sm font-black px-5 py-3 rounded-xl">افتح «' + esc(r.hl) + '» <i class="fa-solid fa-arrow-left"></i></a></div>' +
      (sec ? '<div class="flex flex-wrap gap-2 mt-4">' + sec + "</div>" : "") + "</section>";
  }

  function run() { css(); applyData(); bar(); home(); }
  window.PortalRole = { get: function () { return role; }, set: set, roles: ROLES, order: ORDER, pages: PAGES, allowed: allowed, valid: valid, refresh: function () { role = get(); run(); } };
  window.addEventListener("etec:utchange", function () { role = get(); applyData(); });
  window.addEventListener("etec:logout", function () { try { sessionStorage.removeItem(SKEY); } catch (e) {} role = ""; });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run); else run();
})();
