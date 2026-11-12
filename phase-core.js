/* phase-core.js — v9.0.0 — نواة صفحات مرحلة الاعتماد (home / indicators).
 * مصدر البيانات: phase-data.js (52 مؤشراً و140 سجلاً) + حالة Drive الحيّة من سكربت Apps Script (schema tree-v2)،
 * وعند تعذّرها تُعرض لقطة portal-names.js (ETEC_SNAPSHOT) دون ادّعاء أنها حيّة.
 * الدور تخصيص عرض لا حماية (انظر portal-role.js). لا يكتب هذا الملف شيئاً في Drive. */
(function () {
  "use strict";
  var PH = window.ETEC_PH || { inds: [], teams: {} };
  var DN = { 1: "الإدارة المدرسية", 2: "التعليم والتعلم", 3: "نواتج التعلم", 4: "البيئة المدرسية" };
  var STATE = {
    missing:  { t: "قالب ناقص",     c: "bad",  tip: "لا يوجد ملف هذا السجل في مجلد المؤشر؛ يُبلَّغ مدير النظام." },
    blank:    { t: "جاهز للتعبئة",  c: "idle", tip: "القالب الفارغ موجود في «1_قيد_المراجعة»: نزّله وعبّئه وأعد رفعه بالاسم نفسه." },
    review:   { t: "قيد المراجعة",  c: "wip",  tip: "رُفع معبّأً في «1_قيد_المراجعة» وينتظر المراجعة." },
    approved: { t: "معتمد",        c: "ok",   tip: "الملف المعبّأ موجود في «2_معتمد»." }
  };
  var ST = { live: false, asof: "", gen: "", ver: "", errors: [], ind: {}, loaded: false, failed: false };
  var listeners = [];

  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pct(x) { return Math.round((x || 0) * 100); }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function byCode(c) { for (var k = 0; k < PH.inds.length; k++) if (PH.inds[k].code === c) return PH.inds[k]; return null; }
  function folderUrl(i) { return "https://drive.google.com/drive/folders/" + i.f; }
  function rootUrl() { return "https://drive.google.com/drive/folders/" + PH.root; }

  /* ===== حالة مؤشر واحد، من الحيّ أو من اللقطة ===== */
  function sOf(i) {
    var raw = ST.ind[i.code], snap = (window.ETEC_SNAPSHOT && ETEC_SNAPSHOT.ind && ETEC_SNAPSHOT.ind[i.code]) || null, st = {}, out;
    if (raw) {
      i.recs.forEach(function (n) { st[n] = (raw.st && raw.st[n]) || ((raw.docs || []).indexOf(n) >= 0 ? "review" : ((raw.missing || []).indexOf(n) >= 0 ? "missing" : "blank")); });
      out = { req: raw.req || i.recs.length, up: raw.up || 0, ap: raw.ap || 0, ready: raw.ready || 0, st: st, rep: raw.rep || { n: 0, photos: 0, files: [] }, invalid: raw.invalid || [], live: true };
    } else {
      i.recs.forEach(function (n) { st[n] = snap && (snap.docs || []).indexOf(n) >= 0 ? "review" : "blank"; });
      out = { req: i.recs.length, up: snap ? snap.up || 0 : 0, ap: 0, ready: snap ? snap.ready || 0 : 0, st: st, rep: { n: 0, photos: 0, files: [] }, invalid: [], live: false };
    }
    out.p = out.req ? Math.min(out.up, out.req) / out.req : 0;
    out.review = 0; i.recs.forEach(function (n) { if (st[n] === "review") out.review++; });
    out.repState = out.rep.n > 0 ? ((out.rep.photos || 0) >= 6 ? "done" : "part") : "none";
    return out;
  }
  /* المعادلة نفسها المعتمدة في لوحة المتابعة: المؤشر = المرفوع/المطلوب، المعيار = متوسط مؤشراته، المجال = متوسط معاييره، المشروع = متوسط المؤشرات */
  function critP(c) { return avg(PH.inds.filter(function (i) { return i.c === c; }).map(function (i) { return sOf(i).p; })); }
  function critList(d) { var m = {}, o = []; PH.inds.forEach(function (i) { if ((!d || i.d === d) && !m[i.c]) { m[i.c] = 1; o.push({ c: i.c, cn: i.cn, d: i.d }); } }); return o; }
  function domP(d) { return avg(critList(d).map(function (x) { return critP(x.c); })); }
  function projP() { return avg(PH.inds.map(function (i) { return sOf(i).p; })); }
  function totals(list) {
    var t = { req: 0, up: 0, ap: 0, review: 0, ready: 0, blank: 0, ind: 0, started: 0, repDone: 0, repPart: 0 };
    (list || PH.inds).forEach(function (i) {
      var s = sOf(i); t.ind++; t.req += s.req; t.up += s.up; t.ap += s.ap; t.review += s.review; t.ready += s.ready;
      i.recs.forEach(function (n) { if (s.st[n] === "blank") t.blank++; });
      if (s.up > 0) t.started++; if (s.repState === "done") t.repDone++; else if (s.repState === "part") t.repPart++;
    });
    t.p = t.req ? t.up / t.req : 0; return t;
  }
  function ownerName(i) { var T = PH.teams[i.d]; return T ? T.mem[i.own] : ""; }

  /* ===== الهوية في هذا الجهاز: عضو (مجال+اسم) أو مشرف (مجال) ===== */
  var MK = "etec.me.v1";
  function meGet() { try { var q = new URLSearchParams(location.search), d = q.get("d"), m = q.get("m"); if (d && PH.teams[d]) { var o = { d: +d, idx: /^\d$/.test(m || "") ? +m : -1 }; meSet(o); return o; } } catch (e) {} try { var v = JSON.parse(localStorage.getItem(MK) || "null"); if (v && PH.teams[v.d]) return v; } catch (e) {} return null; }
  function meSet(o) { try { localStorage.setItem(MK, JSON.stringify(o)); } catch (e) {} }
  function meClear() { try { localStorage.removeItem(MK); } catch (e) {} }

  /* ===== تحميل الحالة ===== */
  function notify() { listeners.forEach(function (f) { try { f(ST); } catch (e) {} }); }
  function apply(d) {
    if (d && d.schema === "tree-v2" && d.ind) { ST.live = true; ST.ind = d.ind; ST.gen = d.generatedAt || ""; ST.asof = d.asof || ""; ST.ver = d.version || ""; ST.errors = d.errors || []; ST.partial = !!d.partial; ST.failed = false; }
    else { ST.failed = true; }
    ST.loaded = true; notify();
  }
  function load(force) {
    var url = window.ETEC_STATUS_URL || "";
    if (!url) { ST.loaded = true; ST.asof = (window.ETEC_SNAPSHOT || {}).asof || ""; notify(); return; }
    ST.loading = true; notify();
    var cb = "__phStatus" + Date.now(), s = document.createElement("script"), done = false;
    var timer = setTimeout(function () { if (done) return; done = true; ST.loading = false; ST.failed = true; ST.loaded = true; cleanup(); notify(); }, 90000);
    function cleanup() { clearTimeout(timer); try { delete window[cb]; } catch (e) { window[cb] = undefined; } if (s.parentNode) s.parentNode.removeChild(s); }
    window[cb] = function (d) { if (done) return; done = true; ST.loading = false; cleanup(); apply(d); };
    s.onerror = function () { if (done) return; done = true; ST.loading = false; ST.failed = true; ST.loaded = true; cleanup(); notify(); };
    s.src = url + (url.indexOf("?") >= 0 ? "&" : "?") + "callback=" + cb + (force ? "&refresh=1" : "");
    document.body.appendChild(s);
  }
  function onStatus(f) { listeners.push(f); if (ST.loaded) f(ST); }

  /* ===== مكوّنات العرض ===== */
  function bar(p, cls) { return '<span class="ph-bar ' + (cls || "") + '" role="img" aria-label="' + pct(p) + '%"><i style="width:' + pct(p) + '%"></i></span>'; }
  function chip(state, label) { var m = STATE[state] || STATE.blank; return '<span class="ph-chip ' + m.c + '" title="' + esc(m.tip) + '">' + esc(label || m.t) + "</span>"; }
  function repLine(s) {
    if (s.repState === "done") return '<span class="ph-chip ok">تقرير الشواهد: مكتمل (' + s.rep.photos + " صور)</span>";
    if (s.repState === "part") return '<span class="ph-chip wip">تقرير الشواهد: ' + s.rep.photos + " من 6 صور</span>";
    return '<span class="ph-chip idle">تقرير الشواهد: لم يُرفع</span>';
  }
  /* بطاقة مؤشر: العنوان والتقدّم وحالة كل سجل وروابط المجلد والتقرير */
  function card(i, o) {
    o = o || {}; var s = sOf(i), open = !!o.open, me = ownerName(i);
    var recs = i.recs.map(function (n) { var k = s.st[n] || "blank"; return '<li class="ph-rec"><span class="ph-recn">' + esc(n) + "</span>" + chip(k) + "</li>"; }).join("");
    var tag = i.dv ? '<span class="ph-tag" title="سجل متابعة مشتق من «إضاءات نحو تحقيق المؤشر» ويدخل في النسبة">سجل متابعة</span>' : "";
    return '<article class="ph-card" id="i-' + esc(i.code) + '" data-code="' + esc(i.code) + '">' +
      '<button type="button" class="ph-card-h" aria-expanded="' + open + '" data-toggle>' +
      '<span class="ph-code" dir="ltr">' + esc(i.code) + "</span>" +
      '<span class="ph-card-t"><b>' + esc(i.st) + "</b><small>" + esc(DN[i.d]) + " · " + esc(i.cn) + (o.owner === false ? "" : " · " + esc(me)) + "</small></span>" + tag +
      '<span class="ph-card-p"><b dir="ltr">' + s.up + "/" + s.req + "</b>" + bar(s.p) + "</span></button>" +
      '<div class="ph-card-b"' + (open ? "" : " hidden") + ">" +
      '<p class="ph-stmt">' + esc(i.text) + "</p>" +
      '<ul class="ph-recs">' + recs + "</ul>" +
      '<div class="ph-row">' + repLine(s) + (s.review ? '<span class="ph-chip wip">بانتظار المراجعة: ' + s.review + "</span>" : "") + (s.invalid.length ? '<span class="ph-chip bad" title="' + esc(s.invalid.join("، ")) + '">ملفات لا تطابق أي سجل: ' + s.invalid.length + "</span>" : "") + "</div>" +
      '<div class="ph-actions"><a class="ph-btn pri" href="' + folderUrl(i) + '" target="_blank" rel="noopener"><i class="fa-solid fa-folder-open"></i> مجلد المؤشر في Drive</a>' +
      '<a class="ph-btn" data-roles="admin,sup,member" href="output.html?i=' + esc(i.code) + '"><i class="fa-solid fa-file-image"></i> تقرير الشواهد</a>' +
      '<a class="ph-btn" href="indicators.html?code=' + esc(i.code) + '"><i class="fa-solid fa-link"></i> رابط المؤشر</a></div>' +
      "</div></article>";
  }
  function bindCards(root) {
    root.addEventListener("click", function (e) {
      var h = e.target.closest("[data-toggle]"); if (!h || !root.contains(h)) return;
      var b = h.parentNode.querySelector(".ph-card-b"), ex = h.getAttribute("aria-expanded") === "true";
      h.setAttribute("aria-expanded", String(!ex)); if (ex) b.setAttribute("hidden", ""); else b.removeAttribute("hidden");
    });
  }

  /* ===== الترويسة الموحدة ===== */
  function chrome(active) {
    var el = document.getElementById("chrome"); if (!el) return;
    var R = window.PortalRole, role = R ? R.get() : "", roles = R ? R.roles : {};
    var items = [
      ["home.html", "fa-house", role && roles[role] ? roles[role].hl : "مساحتي", "admin,sup,member,self"],
      ["indicators.html", "fa-list-check", "المؤشرات والسجلات", "admin,sup,member,self"],
      ["status-report.html", "fa-clipboard-list", "تقرير الحالة", "admin,sup,self"],
      ["output.html", "fa-file-image", "تقرير الشواهد", "admin,sup,member"],
      ["reference.html", "fa-book-open", "مرجع الهيئة", "admin,sup,self"]
    ];
    var nav = items.filter(function (x) { return !role || x[3].split(",").indexOf(role) >= 0; }).map(function (x) {
      return '<a href="' + x[0] + '"' + (x[0] === active ? ' aria-current="page"' : "") + '><i class="fa-solid ' + x[1] + '"></i> ' + esc(x[2]) + "</a>"; }).join("");
    el.innerHTML = '<div class="ph-top"><a class="ph-home" href="index.html"><i class="fa-solid fa-house"></i> البوابة</a><span class="ph-sub">مشروع الاعتماد 2026-2027 · الدبلوما الأمريكية (بنين) · مدارس دار الفرسان</span><span class="ph-conn" id="phConn"></span></div>' +
      '<header class="ph-head"><div class="ph-logos"><img src="logo0.png" alt="Diploma 2026"><img src="logo1.png" alt="دار الفرسان"><img src="logo2.png" alt="ETEC"></div></header>' +
      '<nav class="ph-nav" aria-label="التنقل">' + nav + "</nav>";
    onStatus(function () { connChip(); });
  }
  function fmtT(t) { try { return new Date(t).toLocaleString("ar-SA-u-ca-gregory", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return t; } }
  function connChip() {
    var c = document.getElementById("phConn"); if (!c) return;
    var role = window.PortalRole ? PortalRole.get() : "", live = ST.live && !ST.failed, when = live ? fmtT(ST.gen) : (ST.asof || "");
    var txt = ST.loading ? "جارٍ تحديث الحالة…" : live ? "آخر تحديث: " + when : (role === "admin" ? "لقطة " + when + " · ليست حالة حيّة" : "الأرقام حتى " + when);
    c.className = "ph-conn " + (ST.loading ? "load" : live ? "ok" : "off");
    c.innerHTML = '<i class="fa-solid ' + (ST.loading ? "fa-rotate fa-spin" : live ? "fa-circle-check" : "fa-circle-exclamation") + '"></i> ' + esc(txt) + ' <button type="button" id="phRef" class="ph-ref" aria-label="تحديث"><i class="fa-solid fa-arrows-rotate"></i> تحديث</button>';
    document.getElementById("phRef").addEventListener("click", function () { load(true); });
  }

  window.PHC = { PH: PH, DN: DN, STATE: STATE, ST: ST, esc: esc, pct: pct, avg: avg, byCode: byCode, folderUrl: folderUrl, rootUrl: rootUrl, sOf: sOf, critP: critP, critList: critList, domP: domP, projP: projP, totals: totals, ownerName: ownerName,
    me: { get: meGet, set: meSet, clear: meClear }, load: load, onStatus: onStatus, bar: bar, chip: chip, card: card, bindCards: bindCards, chrome: chrome, fmtT: fmtT };
})();
