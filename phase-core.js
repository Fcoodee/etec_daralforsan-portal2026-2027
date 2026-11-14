/* phase-core.js — v9.0.0 — نواة صفحات مرحلة الاعتماد (home / indicators).
 * مصدر البيانات: phase-data.js (52 مؤشراً و140 سجلاً) + حالة Drive الحيّة من سكربت Apps Script (schema tree-v2)،
 * وعند تعذّرها تُعرض لقطة portal-names.js (ETEC_SNAPSHOT) دون ادّعاء أنها حيّة.
 * الدور تخصيص عرض لا حماية (انظر portal-role.js). لا يكتب هذا الملف شيئاً في Drive. */
(function () {
  "use strict";
  var PH = window.ETEC_PH || { inds: [], teams: {} };
  var DN = { 1: "الإدارة المدرسية", 2: "التعليم والتعلم", 3: "نواتج التعلم", 4: "البيئة المدرسية" };
  var STATE = {
    missing:  { t: "غير منشأ",                c: "bad",  tip: "لا يوجد ملف لهذا السجل؛ أبلغ مدير النظام." },
    blank:    { t: "منشأ · بانتظار التعبئة",   c: "idle", tip: "نزّل القالب وعبّئه وأعد رفعه بالاسم نفسه." },
    review:   { t: "معبّأ · قيد المراجعة",     c: "wip",  tip: "بانتظار مراجعة المشرف." },
    returned: { t: "أُعيد للتعبئة",             c: "ret",  tip: "أعاده المشرف بملاحظة؛ عدّله وأعد رفعه من زر «رفع»." },
    approved: { t: "مرفوع (بعد المراجعة)",     c: "ok",   tip: "راجعه المشرف وأقرّه." }
  };
  /* أساس النسبة الرسمية: created (المنشأة) أو uploaded (المرفوعة بعد المراجعة) — إعداد ETEC_PROGRESS_BASIS في portal-config.js */
  function basis() { return window.ETEC_PROGRESS_BASIS === "uploaded" ? "uploaded" : "created"; }
  function basisTxt() { return basis() === "uploaded" ? "المرفوعة بعد المراجعة" : "السجلات المنشأة"; }
  function target() { return +window.ETEC_REPORT_TARGET || 6; }

  var ST = { live: false, asof: "", gen: "", ver: "", errors: [], ind: {}, loaded: false, failed: false };
  var listeners = [];

  function esc(x) { return String(x == null ? "" : x).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pct(x) { return Math.round((x || 0) * 100); }
  function avg(a) { return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : 0; }
  function byCode(c) { for (var k = 0; k < PH.inds.length; k++) if (PH.inds[k].code === c) return PH.inds[k]; return null; }
  function fileDl(id) { return "https://drive.google.com/uc?export=download&id=" + id; }
  function fileView(id) { return "https://drive.google.com/file/d/" + id + "/view"; }
  function subUrl(id) { return "https://drive.google.com/drive/folders/" + id; }
  function folderUrl(i) { return "https://drive.google.com/drive/folders/" + i.f; }
  function rootUrl() { return "https://drive.google.com/drive/folders/" + PH.root; }

  /* ===== حالة مؤشر واحد، من الحيّ أو من اللقطة ===== */
  function sOf(i) {
    var raw = ST.ind[i.code], snap = (window.ETEC_SNAPSHOT && ETEC_SNAPSHOT.ind && ETEC_SNAPSHOT.ind[i.code]) || null, st = {}, out, tg = target();
    if (raw) {
      i.recs.forEach(function (n) { st[n] = (raw.st && raw.st[n]) || ((raw.docs || []).indexOf(n) >= 0 ? "review" : ((raw.missing || []).indexOf(n) >= 0 ? "missing" : "blank")); });
      out = { req: raw.req || i.recs.length, up: raw.up || 0, ap: raw.ap || 0, ready: raw.ready || 0, st: st, rep: raw.rep || { n: 0, photos: 0, files: [] }, invalid: raw.invalid || [], fl: raw.fl || {}, fo: raw.fo || {}, ret: raw.ret || {}, live: true };
    } else {
      i.recs.forEach(function (n) { st[n] = snap && (snap.docs || []).indexOf(n) >= 0 ? "review" : "blank"; });
      var shell = !!(window.ETEC_SNAPSHOT && ETEC_SNAPSHOT.repShell);
      out = { req: i.recs.length, up: snap ? snap.up || 0 : 0, ap: 0, ready: snap ? snap.ready || 0 : 0, st: st, rep: { n: shell ? 1 : 0, photos: 0, files: [] }, invalid: [], fl: {}, fo: {}, ret: {}, live: false };
    }
    /* منشأة = ملف السجل موجود؛ مرفوعة = معبّأ ومراجَع في 2_معتمد. */
    out.cr = out.ready;
    out.rpc = out.req ? Math.min(out.cr, out.req) / out.req : 0;
    out.rpu = out.req ? Math.min(out.ap, out.req) / out.req : 0;
    out.review = 0; i.recs.forEach(function (n) { if (st[n] === "review") out.review++; });
    var ph = out.rep.photos || 0;
    /* تقرير الشواهد: حالتان فقط — none لم يُرفع (لا ملف أو قالب فارغ) · done مرفوع (تقرير فيه صور) */
    out.repState = ph > 0 ? "done" : "none";
    /* اكتمال المؤشر = 50% سجلاته ووثائقه + 50% تقرير الشواهد (قرار مدير المشروع). rpc/rpu للسجلات وحدها. */
    var r = out.repState === "done" ? 1 : 0;
    out.pc = (out.rpc + r) / 2; out.pu = (out.rpu + r) / 2;
    out.p = basis() === "uploaded" ? out.pu : out.pc;
    return out;
  }
  /* المعادلة نفسها المعتمدة في لوحة المتابعة: المؤشر = المرفوع/المطلوب، المعيار = متوسط مؤشراته، المجال = متوسط معاييره، المشروع = متوسط المؤشرات */
  function pv(s, b) { return b === "u" ? s.pu : b === "c" ? s.pc : s.p; }
  function critP(c, b) { return avg(PH.inds.filter(function (i) { return i.c === c; }).map(function (i) { return pv(sOf(i), b); })); }
  function critList(d) { var m = {}, o = []; PH.inds.forEach(function (i) { if ((!d || i.d === d) && !m[i.c]) { m[i.c] = 1; o.push({ c: i.c, cn: i.cn, d: i.d }); } }); return o; }
  function domP(d, b) { return avg(critList(d).map(function (x) { return critP(x.c, b); })); }
  function projP(b) { return avg(PH.inds.map(function (i) { return pv(sOf(i), b); })); }
  function totals(list) {
    var t = { returned: 0, req: 0, up: 0, ap: 0, cr: 0, review: 0, ready: 0, blank: 0, ind: 0, started: 0, repNone: 0, repDone: 0 };
    (list || PH.inds).forEach(function (i) {
      var s = sOf(i); t.ind++; t.req += s.req; t.up += s.up; t.ap += s.ap; t.cr += s.cr; t.review += s.review; t.ready += s.ready;
      i.recs.forEach(function (n) { if (s.st[n] === "blank") t.blank++; if (s.st[n] === "returned") t.returned++; });
      if (s.up > 0 || s.ap > 0) t.started++;
      if (s.repState === "done") t.repDone++; else t.repNone++;
    });
    t.pc = t.req ? t.cr / t.req : 0; t.pu = t.req ? t.ap / t.req : 0; t.p = avg((list || PH.inds).map(function (i) { return sOf(i).p; })); return t;
  }
  function ownerName(i) { var T = PH.teams[i.d]; return T ? T.mem[i.own] : ""; }

  /* ===== الهوية في هذا الجهاز: عضو (مجال+اسم) أو مشرف (مجال) ===== */
  var MK = "etec.me.v1";
  /* ملاحظات قديمة وُقّعت باسم عضو (قبل v9.7.1): لا يُعرض توقيعها لأن المراجِع ليس عضواً */
  function isMemName(n) { try { return Object.keys(PH.teams).some(function (d) { return PH.teams[d].mem.indexOf(n) >= 0; }); } catch (e) { return false; } }
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
  /* شريط بلونين: داكن = مرفوعة (بعد المراجعة)، فاتح = منشأة */
  function bar2(pu, pc) { return '<span class="ph-bar ph-bar2" role="img" aria-label="منشأة ' + pct(pc) + '٪ · مرفوعة ' + pct(pu) + '٪"><i class="c" style="width:' + pct(pc) + '%"></i><i class="u" style="width:' + pct(pu) + '%"></i></span>'; }
  function chip(state, label) { var m = STATE[state] || STATE.blank; return '<span class="ph-chip ' + m.c + '" title="' + esc(m.tip) + '">' + esc(label || m.t) + "</span>"; }
  /* بطاقة مؤشر: العنوان والتقدّم وحالة كل سجل وروابط المجلد والتقرير */
  function card(i, o) {
    o = o || {}; var s = sOf(i), open = !!o.open, me = ownerName(i);
    var recs = i.recs.map(function (n) {
      var k = s.st[n] || "blank", f = s.fl[n], filledF = !!(f && f[2] && f[0] === 1);
      var eye = filledF ? '<a class="ph-btn sm ph-eye on" href="' + fileView(f[2]) + '" target="_blank" rel="noopener" title="معاينة السجل المعبّأ" aria-label="معاينة: ' + esc(n) + '"><i class="fa-solid fa-eye"></i></a>' : '<span class="ph-btn sm ph-eye off" aria-disabled="true" title="لا توجد نسخة معبّأة بعد"><i class="fa-solid fa-eye"></i><span class="sr">غير متاحة</span></span>';
      var dl = f && f[2] ? '<a class="ph-btn sm" href="' + fileDl(f[2]) + '" target="_blank" rel="noopener" title="' + (filledF ? "تنزيل السجل المعبّأ" : "تنزيل القالب") + '" aria-label="تنزيل: ' + esc(n) + '"><i class="fa-solid fa-download"></i></a>' : '<span class="ph-dash" aria-label="لا ملف">—</span>';
      var up = k === "approved" ? '<span class="ph-dash" title="معتمد؛ لا يُستبدل إلا بقرار المشرف" aria-label="معتمد">—</span>' : '<button type="button" class="ph-btn sm" data-up="' + esc(i.code) + '" data-rec="' + esc(n) + '" title="ارفع الملف المعبّأ (Word) فيحلّ محل القالب" aria-label="رفع: ' + esc(n) + '"><i class="fa-solid fa-cloud-arrow-up"></i> رفع</button>';
      var u = UPM[i.code + "|" + n], rt = s.ret && s.ret[n];
      var note = k === "returned" && rt ? '<span class="ph-retn"><b>ملاحظة المشرف:</b> ' + esc(rt.n) + (rt.w && !isMemName(rt.w) ? " — " + esc(rt.w) : "") + "</span>" : "";
      var rvw = k === "approved" ? '<span class="ph-rv" data-roles="admin,sup,self"><button type="button" class="ph-btn sm" data-act="return" data-code="' + esc(i.code) + '" data-rec="' + esc(n) + '"><i class="fa-solid fa-rotate-left"></i> إعادة للتعبئة</button></span>' : k === "review" || k === "returned" ? '<span class="ph-rv" data-roles="admin,sup,self"><button type="button" class="ph-btn sm ph-ok" data-act="approve" data-code="' + esc(i.code) + '" data-rec="' + esc(n) + '"><i class="fa-solid fa-circle-check"></i> اعتماد</button>' + (k === "review" ? '<button type="button" class="ph-btn sm" data-act="return" data-code="' + esc(i.code) + '" data-rec="' + esc(n) + '"><i class="fa-solid fa-rotate-left"></i> إعادة للتعبئة</button>' : "") + "</span>" : "";
      return '<tr class="ph-rec"><th scope="row" class="ph-rn">' + esc(n) + '</th><td class="ph-rs">' + chip(k) + note + rvw + '<span class="ph-upm ' + (u ? u[1] : "") + '" role="status">' + (u ? esc(u[0]) : "") + '</span></td><td class="ph-rc">' + eye + '</td><td class="ph-rc">' + dl + '</td><td class="ph-rc">' + up + "</td></tr>"; }).join("");
    var rf = (s.rep.files || []).filter(function (x) { return x.valid && x.n > 0 && x.id; }).sort(function (x, y) { return y.n - x.n; })[0];
    var repRow = '<tr class="ph-rec ph-rrep"><th scope="row" class="ph-rn"><i class="fa-solid fa-file-image"></i> تقرير الشواهد</th><td class="ph-rs">' + (rf ? '<span class="ph-chip ok">مرفوع · ' + rf.n + ' صور</span>' : '<span class="ph-chip idle">لم يُرفع</span>') + '</td>' +
      '<td class="ph-rc">' + (rf ? '<a class="ph-btn sm ph-eye on" href="' + fileView(rf.id) + '" target="_blank" rel="noopener" title="معاينة التقرير المرفوع" aria-label="معاينة التقرير"><i class="fa-solid fa-eye"></i></a>' : '<span class="ph-btn sm ph-eye off" aria-disabled="true" title="لا يوجد تقرير مرفوع بعد"><i class="fa-solid fa-eye"></i><span class="sr">غير متاح</span></span>') + '</td>' +
      '<td class="ph-rc">' + (rf ? '<a class="ph-btn sm" href="' + fileDl(rf.id) + '" target="_blank" rel="noopener" title="تنزيل التقرير" aria-label="تنزيل التقرير"><i class="fa-solid fa-download"></i></a>' : '<span class="ph-dash" aria-label="لا ملف">—</span>') + '</td>' +
      '<td class="ph-rc"><a class="ph-btn sm" data-roles="admin,sup,member" href="report.html?code=' + esc(i.code) + '" title="أصدر التقرير وارفعه من صفحة التقرير"><i class="fa-solid fa-cloud-arrow-up"></i> إصدار ورفع</a></td></tr>';
    var table = '<div class="ph-tw"><table class="ph-rt"><caption class="sr">سجلات المؤشر ' + esc(i.code) + ' وتقريره</caption><thead><tr><th scope="col">السجل</th><th scope="col">الحالة</th><th scope="col" class="ph-rc">معاينة</th><th scope="col" class="ph-rc">تنزيل</th><th scope="col" class="ph-rc">رفع</th></tr></thead><tbody>' + recs + repRow + "</tbody></table></div>";
    var tag = i.dv ? '<span class="ph-tag" title="سجل متابعة مشتق من «إضاءات نحو تحقيق المؤشر» ويدخل في النسبة">سجل متابعة</span>' : "";
    return '<article class="ph-card" id="i-' + esc(i.code) + '" data-code="' + esc(i.code) + '">' +
      '<button type="button" class="ph-card-h" aria-expanded="' + open + '" data-toggle>' +
      '<span class="ph-code" dir="ltr">' + esc(i.code) + "</span>" +
      '<span class="ph-card-t"><b>' + esc(i.st) + "</b><small>" + esc(DN[i.d]) + " · " + esc(i.cn) + (o.owner === false ? "" : " · " + esc(me)) + "</small></span>" + tag +
      '<span class="ph-card-p" title="اكتمال المؤشر = 50% سجلات + 50% تقرير الشواهد · الرقم: سجلات مرفوعة / مطلوبة · الفاتح = منشأة"><b dir="ltr">' + s.ap + "/" + s.req + "</b>" + bar2(s.pu, s.pc) + "</span></button>" +
      '<div class="ph-card-b"' + (open ? "" : " hidden") + ">" +
      '<p class="ph-stmt">' + esc(i.text) + "</p>" +
      table +
      '<div class="ph-row"><span class="ph-chip idle">منشأة ' + s.cr + "/" + s.req + '</span><span class="ph-chip ' + (s.ap ? "ok" : "idle") + '">مرفوعة (بعد المراجعة) ' + s.ap + "/" + s.req + "</span>" + (s.review ? '<span class="ph-chip wip">معبّأة قيد المراجعة: ' + s.review + "</span>" : "") + (s.invalid.length ? '<span class="ph-chip bad" title="' + esc(s.invalid.join("، ")) + '">ملفات لا تطابق أي سجل: ' + s.invalid.length + "</span>" : "") + "</div>" +
      '<div class="ph-actions"><a class="ph-btn pri" href="' + folderUrl(i) + '" target="_blank" rel="noopener"><i class="fa-solid fa-folder-open"></i> مجلد المؤشر في Drive</a>' +
      '</div>' +
      "</div></article>";
  }
  /* رفع سجل معبّأ من البطاقة: لكل الأدوار (عضو/مشرف/مدير). السكربت يتحقق من الصيغة والاسم ويستبدل القالب. */
  var UPM = {};
  /* من يقوم بالإجراء: يُشتق من الدور المختار أولاً (الهوية المحفوظة في الجهاز قد تكون لعضو سابق) */
  function whoAmI() {
    try {
      var m = meGet(), R = window.PortalRole, r = R ? R.get() : "", T = m && PH.teams[m.d];
      if (r === "member" && T && m.idx >= 0) return T.mem[m.idx];
      if (r === "sup" && T) return T.sup;
      return (R && R.roles && R.roles[r] && (R.roles[r].n || R.roles[r].name)) || r || "";
    } catch (e) { return ""; }
  }
  function uploadRecord(btn) {
    var url = window.ETEC_STATUS_URL || "", li = btn.closest("tr"), out = li.querySelector(".ph-upm");
    function say(t, c) { UPM[btn.dataset.up + "|" + btn.dataset.rec] = [t, c || ""]; out.textContent = t; out.className = "ph-upm " + (c || ""); }
    if (!url) { say("الرفع غير مهيّأ.", "bad"); return; }
    var inp = document.createElement("input"); inp.type = "file"; inp.accept = ".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    inp.onchange = function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      if (!/\.docx$/i.test(f.name)) { say("الصيغة المقبولة: Word (docx) فقط.", "bad"); return; }
      if (f.size > 20 * 1024 * 1024) { say("الملف أكبر من 20 ميغابايت.", "bad"); return; }
      btn.disabled = true; say("جارٍ الرفع…", "");
      var rd = new FileReader();
      rd.onload = function () {
        var b64 = String(rd.result).split(",")[1] || "";
        fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "uploadRecord", code: btn.dataset.up, rec: btn.dataset.rec, name: f.name, file: b64, who: whoAmI() }) })
          .then(function (r) { return r.json(); })
          .then(function (o) { btn.disabled = false; if (o && o.ok) { say("تم الرفع ✔ ويظهر «قيد المراجعة» بعد دقيقة.", "ok"); load(true); } else say((o && o.error) || "فشل الرفع.", "bad"); })
          .catch(function () { btn.disabled = false; say("تعذّر الاتصال بالسكربت.", "bad"); });
      };
      rd.onerror = function () { btn.disabled = false; say("تعذّرت قراءة الملف.", "bad"); };
      rd.readAsDataURL(f);
    };
    inp.click();
  }
  /* مراجعة السجل من البطاقة: اعتماد (نقل إلى معتمد) أو إعادة للتعبئة (يبقى في المراجعة بملاحظة) */
  function reviewCall(btn, action, note) {
    var url = window.ETEC_STATUS_URL || "", box = btn.closest(".ph-rs"), out = box.querySelector(".ph-upm"), key = btn.dataset.code + "|" + btn.dataset.rec, R = window.PortalRole;
    function say(t, c) { UPM[key] = [t, c || ""]; out.textContent = t; out.className = "ph-upm " + (c || ""); }
    if (!url) { say("غير مهيّأ.", "bad"); return; }
    box.querySelectorAll("button").forEach(function (b) { b.disabled = true; }); say("جارٍ التنفيذ…", "");
    fetch(url, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: action, code: btn.dataset.code, rec: btn.dataset.rec, note: note || "", who: whoAmI(), role: R ? R.get() : "" }) })
      .then(function (r) { return r.json(); })
      .then(function (o) { if (o && o.ok) { say(action === "approveRecord" ? "اعتُمد ✔" : "أُعيد للتعبئة ✔ (ظهرت الملاحظة للعضو)", "ok"); load(true); } else { box.querySelectorAll("button").forEach(function (b) { b.disabled = false; }); say((o && o.error) || "فشل التنفيذ.", "bad"); } })
      .catch(function () { box.querySelectorAll("button").forEach(function (b) { b.disabled = false; }); say("تعذّر الاتصال بالسكربت.", "bad"); });
  }
  function bindCards(root) {
    root.addEventListener("click", function (e) {
      var ab = e.target.closest("[data-act]");
      if (ab && root.contains(ab)) {
        var act = ab.dataset.act;
        if (act === "approve") { reviewCall(ab, "approveRecord"); return; }
        if (act === "return") {
          var rv = ab.closest(".ph-rv"); rv.dataset.old = rv.innerHTML;
          rv.innerHTML = '<input type="text" class="ph-rin" maxlength="160" placeholder="سبب الإعادة / المطلوب تعديله" aria-label="سبب الإعادة"><button type="button" class="ph-btn sm ph-ok" data-act="retgo" data-code="' + esc(ab.dataset.code) + '" data-rec="' + esc(ab.dataset.rec) + '">إرسال</button><button type="button" class="ph-btn sm" data-act="retcancel">إلغاء</button>';
          rv.querySelector("input").focus(); return;
        }
        if (act === "retcancel") { var r2 = ab.closest(".ph-rv"); r2.innerHTML = r2.dataset.old || ""; return; }
        if (act === "retgo") { var inp = ab.closest(".ph-rv").querySelector("input"), v = (inp.value || "").trim(); if (v.length < 3) { inp.focus(); inp.placeholder = "اكتب السبب (3 أحرف فأكثر)"; return; } reviewCall(ab, "returnRecord", v); return; }
      }
      var ub = e.target.closest("[data-up]"); if (ub && root.contains(ub)) { uploadRecord(ub); return; }
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
      ["home.html", "fa-house", role && roles[role] ? roles[role].hl : "الرئيسية", "admin,sup,self"],
      ["indicators.html", "fa-list-check", "المؤشرات والسجلات", "admin,sup,member,self"],
      ["progress.html", "fa-chart-pie", "قراءة التقدّم", "admin,self"],
      ["report.html", "fa-file-image", "تقرير الشواهد", "admin,sup,member"]
    ];
    var nav = items.filter(function (x) { return !role || x[3].split(",").indexOf(role) >= 0; }).map(function (x) {
      return '<a href="' + x[0] + '"' + (x[0] === active ? ' aria-current="page"' : "") + '><i class="fa-solid ' + x[1] + '"></i> ' + esc(x[2]) + "</a>"; }).join("");
    el.innerHTML = '<div class="ph-top"><a class="ph-home" href="index.html"><i class="fa-solid fa-house"></i> البوابة</a><span class="ph-sub">مشروع الاعتماد 2026-2027 · الدبلوما الأمريكية (بنين) · مدارس دار الفرسان</span></div>' +
      '<header class="ph-head"><div class="ph-logos"><img src="logo0.png" alt="Diploma 2026"><img src="logo1.png" alt="دار الفرسان"><img src="logo2.png" alt="ETEC"></div></header>' +
      '<nav class="ph-nav" aria-label="التنقل">' + nav + '<div class="ph-sync" id="phConn" role="status" aria-live="polite"></div></nav>';
    onStatus(function () { connChip(); });
  }
  function fmtT(t) { try { return new Date(t).toLocaleString("ar-SA-u-ca-gregory", { dateStyle: "medium", timeStyle: "short" }); } catch (e) { return t; } }
  var syncTimer = null, syncT0 = 0;
  function connChip() {
    var c = document.getElementById("phConn"); if (!c) return;
    var role = window.PortalRole ? PortalRole.get() : "", live = ST.live && !ST.failed, when = live ? fmtT(ST.gen) : (ST.asof || "");
    var txt = live ? "آخر تحديث للحالة: " + when : ST.failed ? "تعذّر جلب الحالة الحيّة" + (when ? " · الأرقام المعروضة حتى " + when : "") : (role === "admin" ? "لقطة " + when + " · ليست حالة حيّة" : "الأرقام حتى " + when);
    c.className = "ph-sync " + (ST.loading ? "load" : live ? "ok" : "off");
    c.innerHTML = '<div class="ph-sync-row"><i class="fa-solid ' + (ST.loading ? "fa-rotate fa-spin" : live ? "fa-circle-check" : "fa-circle-exclamation") + '"></i><span class="ph-sync-t" id="phSyncT">' + (ST.loading ? "جارٍ جلب الحالة الحيّة، انتظر: <b id=\"phSyncS\">0</b> ثانية · قد يستغرق حتى دقيقة" : esc(txt)) + '</span>' +
      '<button type="button" id="phRef" class="ph-ref"' + (ST.loading ? " disabled" : "") + ' aria-label="تحديث الحالة الآن"><i class="fa-solid fa-arrows-rotate"></i> ' + (ST.loading ? "جارٍ التحديث" : "تحديث الآن") + '</button></div>' +
      (ST.loading ? '<div class="ph-sync-bar" role="progressbar" aria-label="جارٍ التحديث"><i></i></div>' : "");
    if (syncTimer) { clearInterval(syncTimer); syncTimer = null; }
    if (ST.loading) { syncT0 = Date.now(); syncTimer = setInterval(function () { var e = document.getElementById("phSyncS"); if (e) e.textContent = Math.round((Date.now() - syncT0) / 1000); }, 500); }
    var b = document.getElementById("phRef"); if (b) b.addEventListener("click", function () { load(true); });
  }

  window.PHC = { PH: PH, DN: DN, STATE: STATE, ST: ST, esc: esc, pct: pct, avg: avg, byCode: byCode, folderUrl: folderUrl, fileDl: fileDl, fileView: fileView, subUrl: subUrl, rootUrl: rootUrl, sOf: sOf, critP: critP, critList: critList, domP: domP, projP: projP, totals: totals, ownerName: ownerName,
    bar2: bar2, basis: basis, basisTxt: basisTxt, target: target, me: { get: meGet, set: meSet, clear: meClear }, load: load, onStatus: onStatus, bar: bar, chip: chip, card: card, bindCards: bindCards, chrome: chrome, fmtT: fmtT };
})();
