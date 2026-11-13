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

  /* ===== رسم القالب ===== */
  function slotHtml(s, i) {
    var h = has(s), src = s.img || driveImg(s.link);
    return '<div class="slot' + (h ? "" : " empty") + '" data-i="' + i + '"><div class="ph" data-pick tabindex="0" role="button" aria-label="رفع صورة للخانة ' + (i + 1) + '">' +
      (h ? '<img alt="شاهد ' + (i + 1) + '" src="' + E(src) + '">' : '<span class="hint"><i class="fa-regular fa-image" style="font-size:26px"></i><br>اضغط لاختيار صورة أو اسحبها هنا</span>') +
      '<span class="num">' + (i + 1) + "</span>" + (h ? '<button type="button" class="x" data-rm title="إزالة الصورة" aria-label="إزالة">×</button>' : "") + "</div>" +
      '<div class="meta"><textarea class="in" data-f="cap" rows="2" placeholder="وصف الشاهد: ماذا يُظهر وأي نشاط؟">' + E(s.cap) + '</textarea>' +
      '<div class="in" style="display:grid;grid-template-columns:1fr 1fr;gap:5px"><input type="date" data-f="date" value="' + E(s.date) + '" aria-label="التاريخ"><input type="text" data-f="src" value="' + E(s.src) + '" placeholder="السجل/المصدر" aria-label="المصدر"></div>' +
      '<input class="in" type="text" dir="ltr" data-f="link" value="' + E(s.link) + '" placeholder="أو الصق رابط صورة (Drive أو غيره)" aria-label="رابط صورة">' +
      '<div class="pt">' + ptText(s) + "</div></div></div>";
  }
  function ptText(s) { var a = []; if (s.cap) a.push(E(s.cap)); var m = []; if (s.date) m.push(E(s.date)); if (s.src) m.push(E(s.src)); if (m.length) a.push("<small>" + m.join(" · ") + "</small>"); return a.join("<br>"); }
  function render() {
    var i = ind(), R = P.sOf(i), now = new Date().toLocaleDateString("ar-SA-u-ca-gregory", { dateStyle: "long" });
    $("sheet").innerHTML =
      '<div class="sh-head"><img src="logo1.png" alt="دار الفرسان"><div class="tt"><b>تقرير الشواهد</b><small>قسم الدبلوما الأمريكية (بنين) — مدارس دار الفرسان · العام الدراسي 2026-2027</small></div><img src="logo0.png" alt="الدبلوما"></div>' +
      '<div class="sh-ind"><span class="c">' + E(i.code) + "</span><b>" + E(i.st) + "</b><br>" + E(P.DN[i.d]) + " · " + E(i.cn) + "<br>" + E(i.text) + "<br><small>المسؤول: " + E(P.ownerName(i)) + " · التاريخ: " + E(now) + "</small></div>" +
      '<div class="sh-grid" id="grid">' + slots.map(slotHtml).join("") + "</div>" +
      '<div class="sh-foot"><span>عدد الشواهد: <b>' + count() + "</b></span><span>منصة داخلية غير تابعة لهيئة تقويم التعليم والتدريب</span></div>";
    info(); $("addSlot").disabled = slots.length >= MAXS;
  }
  function info() {
    var tg = P.target(), n = count();
    $("slotInfo").textContent = n + " صور · الهدف لاعتبار التقرير «مربوطاً»: " + tg + (n >= tg ? " ✔" : "");
    $("fname").textContent = fname();
    $("btnPrint").disabled = n < 1;
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
      $("refs").innerHTML = l.length ? "<ul style='list-style:none;margin:0;padding:0'>" + l.map(function (x, k) { return "<li><a href='" + E(x.u) + "' target='_blank' rel='noopener'>" + E(x.t || x.u) + "</a><button type='button' class='ph-btn sm' data-ins='" + k + "'>إدراج</button></li>"; }).join("") + "</ul>" : "لم تُزوَّد روابط لهذا المؤشر بعد. يضيفها مدير النظام في <code>data/evidence_refs.json</code>.";
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
    if (tok().length < 8) { chip("أدخل الرمز", "idle"); msg("upMsg", ""); return; }
    chip("يتحقق…", "wip");
    post("ping").then(function (r) {
      if (r && r.ok) { upOK = true; upEnable(true); chip("جاهز", "ok"); msg("upMsg", "متصل بالسكربت " + (r.v || ""), "ok"); try { localStorage.setItem(TK, tok()); localStorage.setItem(WK, $("who").value.trim()); } catch (e) {} }
      else { chip("غير جاهز", "bad"); msg("upMsg", (r && r.error) || "تعذّر التحقق.", "bad"); }
    }).catch(function () { chip("غير متاح", "bad"); msg("upMsg", "تعذّر الاتصال: انشر السكربت v9.2.0 (إصدار جديد) وتأكد من الرابط.", "bad"); });
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
    [1, 2, 3, 4].forEach(function (d) { html += '<optgroup label="' + E(P.DN[d]) + '">' + P.PH.inds.filter(function (i) { return i.d === d; }).map(function (i) { return '<option value="' + i.code + '">' + i.code + " — " + E(i.st) + "</option>"; }).join("") + "</optgroup>"; });
    sel.innerHTML = html; sel.addEventListener("change", function () { open(sel.value); });
    try { $("tok").value = localStorage.getItem(TK) || ""; $("who").value = localStorage.getItem(WK) || (me && me.idx >= 0 ? P.PH.teams[me.d].mem[me.idx] : ""); } catch (e) {}
    var first = P.byCode(q) ? q : (mine[0] ? mine[0].code : P.PH.inds[0].code);
    openDb().then(function () { return open(first); });
    P.onStatus(function () { if (ready) rpLink(); });
    P.load();
  }
  init();
})();
