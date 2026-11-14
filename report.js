/* report.js — v9.2.0 — صفحة العمل على قالب تقرير الشواهد: خانات صور وأوصاف، مسودة محلية، إصدار PDF بالاسم الصحيح، ورفع/مسودة مركزية عبر Apps Script. */
(function () {
  "use strict";
  var P = window.PHC; if (!P) return;
  var E = P.esc, DEF = 6, MAXS = 12, TK = "etec.tok.v1", WK = "etec.who.v1";
  var $ = function (id) { return document.getElementById(id); };
  var code = "", slots = [], saveT = null, ready = false, db = null, upOK = false;

  function ind() { return P.byCode(code); }
  function blank() { return { img: "", link: "", cap: "", date: "", src: "" }; }
  function has(s) { return !!(s.img || s.link); }
  function count() { return slots.filter(has).length; }
  function clean(x) { return String(x || "").replace(/[\\\/:*?"<>|]/g, " ").replace(/\s+/g, " ").trim(); }
  function fname() { var i = ind(); return code + "_تقرير الشواهد_" + clean(i ? i.st : "") + "_" + count() + "صور.pdf"; }
  function msg(id, t, cls) { var e = $(id); if (!e) return; e.textContent = t || ""; e.className = "rp-msg" + (cls ? " " + cls : ""); }
  function driveImg(u) {
    u = String(u || "").trim(); if (!/^https?:\/\//i.test(u)) return "";
    var m = /\/d\/([\w-]{20,})/.exec(u) || /[?&]id=([\w-]{20,})/.exec(u);
    return m ? "https://drive.google.com/thumbnail?id=" + m[1] + "&sz=w1400" : u;
  }

  /* ===== التخزين المحلي: IndexedDB (الصور كبيرة) مع رجوع إلى localStorage ===== */
  function openDb() {
    return new Promise(function (res) {
      try { var r = indexedDB.open("etec-report", 1); r.onupgradeneeded = function () { r.result.createObjectStore("d"); }; r.onsuccess = function () { db = r.result; res(); }; r.onerror = function () { res(); }; } catch (e) { res(); }
    });
  }
  function dbGet(k) {
    return new Promise(function (res) {
      if (!db) { try { res(JSON.parse(localStorage.getItem("etec.rp." + k) || "null")); } catch (e) { res(null); } return; }
      var q = db.transaction("d").objectStore("d").get(k); q.onsuccess = function () { res(q.result || null); }; q.onerror = function () { res(null); };
    });
  }
  function dbPut(k, v) {
    return new Promise(function (res) {
      if (!db) { try { localStorage.setItem("etec.rp." + k, JSON.stringify(v)); res(true); } catch (e) { res(false); } return; }
      var t = db.transaction("d", "readwrite"); t.objectStore("d").put(v, k); t.oncomplete = function () { res(true); }; t.onerror = function () { res(false); };
    });
  }
  function save() {
    if (!ready) return; clearTimeout(saveT);
    saveT = setTimeout(function () { dbPut(code, { slots: slots, updated: Date.now() }).then(function (ok) { msg("saveMsg", ok ? "حُفظت المسودة على هذا الجهاز " + new Date().toLocaleTimeString("ar-SA") : "تعذّر الحفظ على الجهاز (المساحة ممتلئة)؛ صدّر المسودة ملفاً.", ok ? "ok" : "bad"); }); }, 400);
  }
  function fit() { while (slots.length < DEF) slots.push(blank()); }

  /* ===== معالجة الصورة: تصغير وإعادة ترميز (يحذف EXIF) ===== */
  function proc(file) {
    return new Promise(function (res, rej) {
      if (!/^image\//.test(file.type)) { rej(new Error("الملف ليس صورة")); return; }
      var r = new FileReader();
      r.onload = function () {
        var im = new Image();
        im.onload = function () {
          var M = 1400, k = Math.min(1, M / Math.max(im.width, im.height)), c = document.createElement("canvas");
          c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
          var x = c.getContext("2d"); x.fillStyle = "#fff"; x.fillRect(0, 0, c.width, c.height); x.drawImage(im, 0, 0, c.width, c.height);
          res(c.toDataURL("image/jpeg", 0.82));
        };
        im.onerror = function () { rej(new Error("تعذّر قراءة الصورة")); }; im.src = r.result;
      };
      r.onerror = function () { rej(new Error("تعذّر قراءة الملف")); }; r.readAsDataURL(file);
    });
  }

  /* ===== رسم القالب (الورقة المطبوعة بالإنجليزية؛ المجالات والمعايير والمؤشرات والسجلات والوثائق والإضاءات بلغتين) ===== */
  var I = window.ETEC_I18N || { dom: {}, crit: {}, ind: {}, rec: {}, docs: {} }, HL = window.ETEC_HL || {};
  function bi(en, ar, cls) { return '<div class="bi ' + (cls || "") + '"><div class="en">' + E(en || ar || "") + '</div><div class="ar" dir="rtl" lang="ar">' + E(ar || "") + "</div></div>"; }
  function slotHtml(s, i) {
    var h = has(s), src = s.img || driveImg(s.link);
    return '<div class="slot' + (h ? "" : " empty") + '" data-i="' + i + '"><div class="ph" data-pick tabindex="0" role="button" aria-label="Upload photo for slot ' + (i + 1) + '">' +
      (h ? '<img alt="Evidence ' + (i + 1) + '" src="' + E(src) + '">' : '<span class="hint"><i class="fa-regular fa-image" style="font-size:26px"></i><br>Click to choose a photo or drop it here</span>') +
      '<span class="num">' + (i + 1) + "</span>" + (h ? '<button type="button" class="x" data-rm title="Remove photo" aria-label="Remove">×</button>' : "") + "</div>" +
      '<div class="meta"><textarea class="in" data-f="cap" dir="auto" rows="2" placeholder="Evidence description: what does it show, and which activity?">' + E(s.cap) + '</textarea>' +
      '<div class="in" style="display:grid;grid-template-columns:1fr 1fr;gap:5px"><input type="date" data-f="date" value="' + E(s.date) + '" aria-label="Date"><input type="text" dir="auto" data-f="src" value="' + E(s.src) + '" placeholder="Record / source" aria-label="Source"></div>' +
      '<input class="in" type="text" dir="ltr" data-f="link" value="' + E(s.link) + '" placeholder="Or paste an image link (Drive or other)" aria-label="Image link">' +
      '<div class="pt" dir="auto">' + ptText(s) + "</div></div></div>";
  }
  function ptText(s) { var a = []; if (s.cap) a.push(E(s.cap)); var m = []; if (s.date) m.push(E(s.date)); if (s.src) m.push(E(s.src)); if (m.length) a.push("<small>" + m.join(" · ") + "</small>"); return a.join("<br>"); }
  function listSec(en, ar, items, empty) {
    return '<section class="sec"><h2 class="sec-t"><span>' + en + "</span>" + (ar ? '<span dir="rtl" lang="ar">' + ar + "</span>" : "") + "</h2>" +
      (items.length ? '<ol class="sec-l">' + items.join("") + "</ol>" : '<p class="sec-e">' + empty + "</p>") + "</section>";
  }
  function render() {
    var i = ind(), now = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    /* قرار مدير المشروع: الرسمي (المجال/المعيار/المؤشر/الإضاءات) بلغتين؛ وما يخص القسم (السجلات والوثائق) بالإنجليزية فقط */
    var recs = i.recs.map(function (r) { return '<li><div class="bi"><div class="en">' + E(I.rec[r] || r) + "</div></div></li>"; });
    var docs = (I.docs[i.code] || []).map(function (x) { return '<li><div class="bi"><div class="en">' + E(x.en) + "</div></div></li>"; });
    var hl = (HL[i.code] || []).map(function (x) { return "<li>" + bi(x.en, x.ar) + "</li>"; });
    $("sheet").innerHTML =
      '<div class="sh-head"><div class="logos"><img src="logo1.png" alt="Dar Al-Forsan Schools"><img src="logo0.png" alt="American Diploma"></div>' +
      '<div class="tt"><b>Evidence Report</b><small>Dar Al-Forsan Schools — American Diploma Section (Boys) · Academic Year 2026–2027</small>' +
      '<small>School Evaluation &amp; Accreditation Standards — General Education 2026</small></div></div>' +
      '<div class="sh-ind"><div class="sh-two">' +
        '<div><span class="lb">Domain</span>' + bi(I.dom[i.d], P.DN[i.d]) + "</div>" +
        '<div><span class="lb">Criterion</span>' + bi(I.crit[i.c], i.cn) + "</div></div>" +
      '<div class="sh-ic"><span class="c">' + E(i.code) + '</span><span class="lb">Indicator</span></div>' + bi(I.ind[i.code], i.text, "ind") +
      '<div class="sh-meta">Date: ' + E(now) + "</div></div>" +
      '<h2 class="sec-t one"><span>Evidence Photos</span></h2>' +
      '<div class="sh-grid" id="grid">' + slots.map(slotHtml).join("") + "</div>" +
      '<div class="pg2">' +
      listSec("Records", "", recs, "No records are defined for this indicator.") +
      listSec("Documents", "", docs, "No supporting documents are proposed for this indicator.") +
      listSec("Highlights toward achieving the indicator", "إضاءات نحو تحقيق المؤشر", hl, "Official highlights will be added here.").replace('<section class="sec">', '<section class="sec' + (hl.length ? "" : " noprint") + '">') +
      "</div>" +
      '<div class="sh-foot"><span>Evidence photos: <b>' + count() + "</b> · Unofficial English translation — the Arabic text is the reference.</span><span>Internal platform — not affiliated with the Education and Training Evaluation Commission (ETEC).</span></div>";
    info(); $("addSlot").disabled = slots.length >= MAXS;
  }
  function info() {
    var n = count();
    $("slotInfo").textContent = n + " صور";
    $("fname").textContent = fname();
    $("btnPrint").disabled = n < 1;
    var f = document.querySelector(".sh-foot b"); if (f) f.textContent = n;
  }

  /* ===== الأحداث ===== */
  function setImg(i, file) {
    proc(file).then(function (u) { slots[i].img = u; slots[i].link = ""; render(); save(); }).catch(function (e) { msg("saveMsg", e.message, "bad"); });
  }
  var fileIn = document.createElement("input"); fileIn.type = "file"; fileIn.accept = "image/*"; fileIn.multiple = true; var target = 0;
  fileIn.addEventListener("change", function () {
    var fl = Array.prototype.slice.call(fileIn.files || []), i = target;
    fl.forEach(function (f, k) {
      var j = i; while (j < slots.length && has(slots[j]) && j < MAXS) j++;
      if (j >= slots.length && slots.length < MAXS) { slots.push(blank()); }
      if (j < slots.length) setImg(j, f);
    });
    fileIn.value = "";
  });
  var grid = $("sheet");
  grid.addEventListener("click", function (e) {
    var sl = e.target.closest(".slot"); if (!sl) return; var i = +sl.dataset.i;
    if (e.target.closest("[data-rm]")) { slots[i].img = ""; slots[i].link = ""; render(); save(); return; }
    if (e.target.closest("[data-pick]") && !has(slots[i])) { target = i; fileIn.click(); }
  });
  grid.addEventListener("keydown", function (e) { if ((e.key === "Enter" || e.key === " ") && e.target.matches("[data-pick]")) { e.preventDefault(); e.target.click(); } });
  grid.addEventListener("input", function (e) {
    var sl = e.target.closest(".slot"), f = e.target.getAttribute("data-f"); if (!sl || !f) return;
    var i = +sl.dataset.i; slots[i][f] = e.target.value;
    if (f === "link") { slots[i].img = slots[i].img; var w = has(slots[i]); sl.classList.toggle("empty", !w); }
    sl.querySelector(".pt").innerHTML = ptText(slots[i]); info(); save();
  });
  grid.addEventListener("change", function (e) { if (e.target.getAttribute("data-f") === "link") { render(); save(); } });
  ["dragenter", "dragover"].forEach(function (ev) { grid.addEventListener(ev, function (e) { var sl = e.target.closest(".slot"); if (sl) { e.preventDefault(); sl.classList.add("drag"); } }); });
  ["dragleave", "drop"].forEach(function (ev) { grid.addEventListener(ev, function (e) { var sl = e.target.closest(".slot"); if (sl) sl.classList.remove("drag"); }); });
  grid.addEventListener("drop", function (e) {
    var sl = e.target.closest(".slot"); if (!sl) return; e.preventDefault();
    var f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if (f) setImg(+sl.dataset.i, f);
  });
  $("addSlot").addEventListener("click", function () { if (slots.length < MAXS) { slots.push(blank()); render(); save(); } });

  /* ===== الطباعة: إصدار PDF ===== */
  $("btnPrint").addEventListener("click", function () {
    var n = count(); if (n < 1) { msg("saveMsg", "أضف صورة واحدة على الأقل.", "bad"); return; }
    var old = document.title; document.title = fname().replace(/\.pdf$/, "");
    var back = function () { document.title = old; window.removeEventListener("afterprint", back); }; window.addEventListener("afterprint", back);
    window.print();
  });
  $("btnCopy").addEventListener("click", function () { try { navigator.clipboard.writeText(fname()); msg("saveMsg", "نُسخ الاسم.", "ok"); } catch (e) { msg("saveMsg", "تعذّر النسخ؛ انسخه يدوياً.", "bad"); } });

  /* ===== تصدير/استيراد/مسح ===== */
  $("btnExp").addEventListener("click", function () {
    var b = new Blob([JSON.stringify({ code: code, slots: slots, v: "9.2.0" })], { type: "application/json" }), a = document.createElement("a");
    a.href = URL.createObjectURL(b); a.download = "مسودة_تقرير_" + code + ".json"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 2000);
  });
  $("btnImp").addEventListener("click", function () { $("impIn").click(); });
  $("impIn").addEventListener("change", function () {
    var f = this.files && this.files[0]; if (!f) return; var r = new FileReader();
    r.onload = function () { try { var o = JSON.parse(r.result); if (!o || !Array.isArray(o.slots)) throw 0; if (o.code && o.code !== code && !confirm("المسودة لمؤشر آخر (" + o.code + "). استيرادها فوق هذا المؤشر؟")) return; slots = o.slots.slice(0, MAXS).map(function (s) { return { img: s.img || "", link: s.link || "", cap: s.cap || "", date: s.date || "", src: s.src || "" }; }); fit(); render(); save(); msg("saveMsg", "استُوردت المسودة.", "ok"); } catch (e) { msg("saveMsg", "ملف المسودة غير صالح.", "bad"); } };
    r.readAsText(f); this.value = "";
  });
  $("btnClear").addEventListener("click", function () { if (confirm("مسح كل خانات هذا المؤشر من هذا الجهاز؟")) { slots = []; fit(); render(); save(); } });

  /* ===== الشواهد المرجعية ===== */
  function loadRefs() {
    $("refs").textContent = "…";
    fetch("data/evidence_refs.json", { cache: "no-store" }).then(function (r) { return r.ok ? r.json() : {}; }).catch(function () { return {}; }).then(function (o) {
      var l = (o && o[code]) || [];
      if (typeof l === "string") l = [{ u: l, t: "مجلد الشواهد" }];
      var dn = String(code).split("-")[0], cn = String(code).split("-").slice(0, 2).join("-"), crit = o && o._criterion && o._criterion[cn], gen = crit || (o && o._domain && o._domain[dn]) || (o && o._all) || "", gl = crit ? "المعيار " + cn : "المجال " + dn;
      var main = l.length ? "<a class='ph-btn' style='display:block;text-align:center;margin-bottom:8px' href='" + E(l[0].u) + "' target='_blank' rel='noopener'>فتح مجلد الشواهد لهذا المؤشر</a><div style='font-size:12px;line-height:1.8;margin-bottom:6px'>نزّل الصور منه، ثم ارفعها في خانات التقرير.</div>" : (gen ? "<a class='ph-btn' style='display:block;text-align:center;margin-bottom:8px' href='" + E(gen) + "' target='_blank' rel='noopener'>فتح مجلد شواهد " + E(gl) + "</a><div style='font-size:12px;line-height:1.8'>ابحث داخله عن " + (crit ? "المؤشر" : "المعيار ثم المؤشر") + "، نزّل الصور المناسبة، ثم ارفعها في خانات التقرير.</div>" : "");
      if (!l.length && gen) { $("refs").innerHTML = main; return; }
      $("refs").innerHTML = l.length ? main + "<ul style='list-style:none;margin:0;padding:0'>" + l.map(function (x, k) { return "<li><a href='" + E(x.u) + "' target='_blank' rel='noopener'>" + E(x.t || x.u) + "</a><button type='button' class='ph-btn sm' data-ins='" + k + "'>إدراج</button></li>"; }).join("") + "</ul>" : "لم يُضَف رابط الشواهد لهذا المؤشر بعد. سيصلك من منسق المشروع.";
      $("refs").onclick = function (e) { var b = e.target.closest("[data-ins]"); if (!b) return; var x = l[+b.dataset.ins], j = slots.findIndex(function (s) { return !has(s); }); if (j < 0) { if (slots.length >= MAXS) { msg("saveMsg", "لا توجد خانة فارغة.", "bad"); return; } slots.push(blank()); j = slots.length - 1; } slots[j].link = x.u; slots[j].cap = slots[j].cap || x.t || ""; render(); save(); };
    });
  }

  /* ===== الرفع الآلي والمسودة المركزية ===== */
  function url() { return window.ETEC_STATUS_URL || ""; }
  function tok() { return ($("tok").value || "").trim(); }
  function chip(t, c) { var e = $("upState"); e.textContent = t; e.className = "ph-chip " + c; }
  function post(action, extra) {
    var body = Object.assign({ action: action, code: code, token: tok(), who: $("who").value.trim() }, extra || {});
    return fetch(url(), { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body) }).then(function (r) { return r.json(); });
  }
  function upEnable(on) { ["btnUp", "btnSaveC", "btnLoadC"].forEach(function (id) { $(id).disabled = !on; }); }
  function ping() {
    upOK = false; upEnable(false);
    if (!url()) { chip("غير مفعّل", "idle"); msg("upMsg", "رابط السكربت غير مضبوط.", "bad"); return; }
    chip("يتحقق…", "wip");
    post("ping").then(function (r) {
      if (r && r.ok) { upOK = true; upEnable(true); chip("جاهز", "ok"); msg("upMsg", "متصل بالسكربت " + (r.v || ""), "ok"); try { localStorage.setItem(TK, tok()); localStorage.setItem(WK, $("who").value.trim()); } catch (e) {} }
      else { chip("غير جاهز", "bad"); msg("upMsg", (r && r.error) || "تعذّر التحقق.", "bad"); }
    }).catch(function () { chip("غير متاح", "bad"); msg("upMsg", "تعذّر الاتصال بالسكربت.", "bad"); });
  }
  $("tok").addEventListener("change", ping); $("who").addEventListener("change", function () { try { localStorage.setItem(WK, this.value.trim()); } catch (e) {} });
  $("btnUp").addEventListener("click", function () { if (upOK) $("pdfIn").click(); });
  $("pdfIn").addEventListener("change", function () {
    var f = this.files && this.files[0]; this.value = ""; if (!f) return;
    if (f.type !== "application/pdf" && !/\.pdf$/i.test(f.name)) { msg("upMsg", "اختر ملف PDF.", "bad"); return; }
    if (f.size > 20 * 1024 * 1024) { msg("upMsg", "الملف أكبر من 20 ميغابايت.", "bad"); return; }
    if (count() < 1) { msg("upMsg", "أضف صورة واحدة على الأقل قبل الرفع.", "bad"); return; }
    var nm = fname();
    if (!confirm("سيُرفع الملف إلى مجلد التقرير باسم:\n" + nm + "\n(عدد الصور حسب القالب الحالي: " + count() + ")\nويُنقل الهيكل الفارغ إلى سلة Drive. متابعة؟")) return;
    var r = new FileReader(); msg("upMsg", "جارٍ الرفع…");
    r.onload = function () {
      post("uploadReport", { name: nm, pdf: String(r.result).split(",")[1] }).then(function (o) {
        if (o && o.ok) { msg("upMsg", "تم الرفع (" + o.photos + " صور)" + (o.replaced ? " واستُبدل " + o.replaced + " ملف" : "") + ". حدّث الحالة بعد دقيقة.", "ok"); P.load(true); } else msg("upMsg", (o && o.error) || "فشل الرفع.", "bad");
      }).catch(function () { msg("upMsg", "تعذّر الاتصال بالسكربت.", "bad"); });
    };
    r.readAsDataURL(f);
  });
  $("btnSaveC").addEventListener("click", function () {
    msg("upMsg", "جارٍ الحفظ…"); post("saveDraft", { draft: JSON.stringify({ code: code, slots: slots, v: "9.2.0" }) }).then(function (o) { msg("upMsg", o && o.ok ? "حُفظت المسودة مركزياً." : (o && o.error) || "فشل الحفظ.", o && o.ok ? "ok" : "bad"); }).catch(function () { msg("upMsg", "تعذّر الاتصال.", "bad"); });
  });
  $("btnLoadC").addEventListener("click", function () {
    post("loadDraft").then(function (o) {
      if (!o || !o.ok) { msg("upMsg", (o && o.error) || "فشل الاسترجاع.", "bad"); return; }
      if (!o.draft) { msg("upMsg", "لا توجد مسودة مركزية لهذا المؤشر.", "bad"); return; }
      if (!confirm("استبدال الخانات الحالية بالمسودة المركزية؟")) return;
      var d = JSON.parse(o.draft); slots = (d.slots || []).slice(0, MAXS); fit(); render(); save(); msg("upMsg", "استُرجعت المسودة المركزية.", "ok");
    }).catch(function () { msg("upMsg", "تعذّر الاتصال.", "bad"); });
  });

  /* ===== تشغيل ===== */
  function rpLink() { var i = ind(), s = i && P.sOf(i), a = $("lnkRp"); if (s && s.fo && s.fo.rp) { a.href = P.subUrl(s.fo.rp); a.hidden = false; } else { a.href = P.subUrl ? P.folderUrl(i) : "#"; a.hidden = false; a.textContent = "مجلد المؤشر"; } }
  function open(c) {
    code = c; ready = false; slots = []; try { history.replaceState(null, "", "report.html?code=" + encodeURIComponent(c)); } catch (e) {}
    $("indSel").value = c; document.title = "تقرير الشواهد " + c;
    return dbGet(c).then(function (d) { slots = d && Array.isArray(d.slots) ? d.slots.slice(0, MAXS) : []; fit(); render(); ready = true; loadRefs(); rpLink(); if (d) msg("saveMsg", "استُرجعت مسودتك المحفوظة على هذا الجهاز.", "ok"); else msg("saveMsg", ""); if (tok().length >= 8) ping(); });
  }
  function init() {
    P.chrome("report.html");
    var me = P.me.get(), q = ""; try { q = new URLSearchParams(location.search).get("code") || ""; } catch (e) {}
    var mine = me && me.idx >= 0 ? P.PH.inds.filter(function (i) { return i.d === me.d && i.own === me.idx; }) : [];
    var sel = $("indSel"), html = "";
    if (mine.length) html += '<optgroup label="مؤشراتي">' + mine.map(function (i) { return '<option value="' + i.code + '">' + i.code + " — " + E(i.st) + "</option>"; }).join("") + "</optgroup>";
    var onlyMine = !!(window.PortalRole && PortalRole.get() === "member" && mine.length); /* العضو: مؤشراته فقط */
    if (!onlyMine) [1, 2, 3, 4].forEach(function (d) { html += '<optgroup label="' + E(P.DN[d]) + '">' + P.PH.inds.filter(function (i) { return i.d === d; }).map(function (i) { return '<option value="' + i.code + '">' + i.code + " — " + E(i.st) + "</option>"; }).join("") + "</optgroup>"; });
    sel.innerHTML = html; sel.addEventListener("change", function () { open(sel.value); });
    try { $("tok").value = localStorage.getItem(TK) || ""; $("who").value = localStorage.getItem(WK) || (me && me.idx >= 0 ? P.PH.teams[me.d].mem[me.idx] : ""); } catch (e) {}
    var inMine = function (c) { return mine.some(function (i) { return i.code === c; }); };
    var first = P.byCode(q) && (!onlyMine || inMine(q)) ? q : (mine[0] ? mine[0].code : P.PH.inds[0].code);
    openDb().then(function () { return open(first); }).then(function () { ping(); });
    P.onStatus(function () { if (ready) rpLink(); });
    P.load();
  }
  init();
})();
