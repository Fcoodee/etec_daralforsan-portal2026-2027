/*
 * page-gate.js — جلسة عمل مصرح بها + قفل الصفحات + بوابة بيانات الاتصال المشفّرة.
 * يقرأ اسم المستخدم وكلمة المرور من ملف access.txt الخارجي بدالة fetch (الصيغة: «المعرف,كلمة المرور»، ويدعم «المعرف,sha256:الملح:البصمة»).
 * أنماط الاستعمال (وسم واحد لكل صفحة):
 *   <script src="page-gate.js" data-always="1"></script>   في <head>: قفل دائم للصفحة حتى الدخول (يمكن إضافة data-title و data-msg).
 *       الافتراضي نزع محتوى الصفحة من DOM حتى الدخول؛ وللصفحات ذات التهيئة غير المتزامنة (IndexedDB أو fetch) أضف data-detach="0" فيكتفي بالإخفاء.
 *   <script src="page-gate.js" data-lazy="1"></script>     بلا قفل: يوفّر DFGate.require(cb) لطلب الدخول عند الحاجة فقط.
 *   <script src="page-gate.js"></script>                   قفل اختياري: تُقفل الصفحة فقط إن وُجد في access.txt سطر  #@gate,اسم-الصفحة.html
 * الدخول الصحيح يسجّل «جلسة عمل مصرح بها» مشتركة بين الصفحات والتبويبات (ساعة واحدة)، وعندها يتوقف مربع الحوار القانوني.
 * عند انقضاء الساعة تُقفل الصفحات المقفلة من جديد تلقائياً دون إعادة تحميل، وتعود الأزرار المقفلة ومربع التنبيه.
 * صلاحية إرسال الرسائل (DFGate.canMail): سطر اختياري في access.txt  #@mail,مستخدم1,مستخدم2  يحصر الإرسال في المذكورين؛ وبلا السطر يُسمح لكل مصرح له.
 * مدير النظام (DFGate.isAdmin): سطر اختياري  #@admin,مستخدم1,مستخدم2  ؛ وبلا السطر يُعدّ المستخدم «admin» وحده مديراً. تُستعمل لفتح المراحل «جارٍ العمل» (stages.html).
 * عند تعذّر قراءة access.txt تبقى الصفحات المقفلة مقفلة (fail-closed).
 * ⚠ هذا قفل في المتصفح لا خادم: يردع الاطلاع العابر ولا يحجب المصدر عمّن يعرف قراءته. (انظر ملاحظات الإصدار)
 */
(function () {
  'use strict';
  if (window.DFGate && window.DFGate._booted) return;
  var SC = document.currentScript, DS = (SC && SC.dataset) || {};
  var ALWAYS = DS.always === '1', LAZY = DS.lazy === '1', ACCESS = DS.access || 'access.txt', DETACH = DS.detach !== '0';
  var TITLE = DS.title || 'صفحة خاصة بفريقنا';
  var MSG = DS.msg || 'هذه الصفحة للتشاور بين فريق العمل والإشراف الأكاديمي للقسم. فضلاً أدخل بيانات الدخول المعتمدة لتتصفحها معنا.';
  var PAGE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var AK = 'df_auth_v1', TTL = 60 * 60 * 1000, TRY = 'df_gate_try', LOCK = 'df_gate_until', CK = 'df_ck';
  var html = document.documentElement, frag = null, mark = null, users = [], gates = [], mailers = [], admins = [], loaded = false, locked = false, overlay = null, lastCred = null;
  function S(k, v, del) { try { if (del) sessionStorage.removeItem(k); else if (v === undefined) return sessionStorage.getItem(k); else sessionStorage.setItem(k, v); } catch (e) {} return null; }
  function L(k, v, del) { try { if (del) localStorage.removeItem(k); else if (v === undefined) return localStorage.getItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function ping() { try { window.dispatchEvent(new Event('df-auth')); } catch (e) {} }

  /* ----- جلسة العمل المصرح بها ----- */
  function info() {
    try { var o = JSON.parse(L(AK) || 'null'); if (o && o.exp > Date.now()) return o; } catch (e) {}
    return null; /* مصدر الحقيقة الوحيد: df_auth_v1 بتاريخ انتهاء، فلا تُعدّ مفاتيح الجلسة القديمة دخولاً */
  }
  function isAuth() { return !!info(); }
  function setAuth(u) { L(AK, JSON.stringify({ u: u, exp: Date.now() + TTL })); ping(); watch(); }
  function clearAuth() { L(AK, null, true); ['df_content_unlocked', 'df_content_unlocked_user', 'df_logged_in', 'df_username', CK].forEach(function (k) { S(k, null, true); }); lastCred = null; ping(); }

  /* ----- انتهاء الجلسة: تُقفل الصفحة المقفلة من جديد دون إعادة تحميل ----- */
  var expT = null;
  function lockAgain(why) {
    if (!ALWAYS || locked) return;
    locked = true; html.classList.add('pg-locked'); if (DETACH) detach();
    openLogin({ full: true, title: why === 'out' ? 'أُنهيت جلسة العمل' : 'انتهت جلسة العمل', msg: why === 'out' ? 'أُنهيت الجلسة من تبويب آخر. أدخل بيانات الدخول لمتابعة العمل.' : 'انقضت ساعة على الدخول. أدخل بيانات الدخول لمتابعة العمل.' });
  }
  function watch() {
    clearTimeout(expT); var i = info(); if (!i || !i.exp) return;
    expT = setTimeout(function () { if (!isAuth()) { L(AK, null, true); ping(); lockAgain(); } else watch(); }, Math.max(0, i.exp - Date.now()) + 300);
  }
  document.addEventListener('visibilitychange', function () { if (!document.hidden && !isAuth() && L(AK)) { L(AK, null, true); ping(); lockAgain(); } });
  /* ----- منع الفهرسة ونماذج الذكاء الاصطناعي (إشارات اختيارية) ----- */
  if (!LAZY) [['robots', 'noindex,nofollow,noarchive,noimageindex'], ['robots', 'noai,noimageai'], ['googlebot', 'noindex,nofollow,noarchive']].forEach(function (m) { var t = document.createElement('meta'); t.name = m[0]; t.content = m[1]; document.head.appendChild(t); });

  var css = 'html.pg-locked body>*:not(#pg-overlay):not([data-gate-keep]){display:none!important}' +
    '#pg-overlay{position:fixed;inset:0;z-index:2147482000;display:flex;align-items:center;justify-content:center;padding:16px;font-family:Cairo,Tahoma,sans-serif;direction:rtl;background:rgba(2,12,12,.74)}' +
    '#pg-overlay.pg-full{background:linear-gradient(160deg,#002a2a,#0f172a)}' +
    '#pg-box{position:relative;background:#fff;color:#0f172a;border-radius:20px;max-width:430px;width:100%;padding:26px;box-shadow:0 24px 70px rgba(0,0,0,.5);border-top:6px solid #c29b38;text-align:right}' +
    '#pg-x{position:absolute;top:10px;left:12px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f5f9;color:#475569;font-size:18px;line-height:1;cursor:pointer}' +
    '#pg-box .ic{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#c29b38,#006666);display:flex;align-items:center;justify-content:center;margin-bottom:12px}' +
    '#pg-box h2{margin:0 0 6px;font-size:17px;font-weight:900;color:#003d3d}#pg-box p{margin:0 0 12px;font-size:12.5px;line-height:1.9;color:#475569}' +
    '#pg-overlay,#pg-box{color-scheme:light}' +
    '#pg-box input{width:100%;box-sizing:border-box;font:600 13px Cairo,Tahoma,sans-serif;padding:11px 12px;border:1px solid #cbd5e1;border-radius:10px;margin-bottom:9px;direction:ltr;text-align:right;background:#fff;color:#0f172a}' +
    '#pg-box input:focus{outline:none;border-color:#006666;box-shadow:0 0 0 3px rgba(0,102,102,.15)}' +
    '#pg-err{display:none;font-size:12px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:9px;padding:8px 10px;margin-bottom:9px;line-height:1.7}' +
    '#pg-go{width:100%;border:0;border-radius:12px;background:#006666;color:#fff;font:800 14px Cairo,Tahoma,sans-serif;padding:12px;cursor:pointer}#pg-go:disabled{opacity:.55;cursor:not-allowed}' +
    '#pg-box .ft{margin-top:12px;font-size:10.5px;color:#94a3b8;text-align:center;line-height:1.8}#pg-box .ft a{color:#006666}' +
    '#pg-out{position:fixed;bottom:14px;left:14px;z-index:9999;background:#7f1d1d;color:#fff;border:0;border-radius:999px;font:700 11px Cairo,Tahoma,sans-serif;padding:9px 14px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '@media print{#pg-out,#pg-overlay{display:none!important}}';
  var st = document.createElement('style'); st.id = 'pg-style'; st.textContent = css; document.head.appendChild(st);
  if (!LAZY && !isAuth()) html.classList.add('pg-locked');

  /* ----- قراءة access.txt بدالة fetch ----- */
  function parse(text) {
    users = []; gates = []; mailers = []; admins = [];
    text.split(/\r?\n/).forEach(function (raw) {
      var l = raw.trim(); if (!l) return;
      if (l.indexOf('#@gate,') === 0) { gates.push(l.slice(7).trim().toLowerCase()); return; }
      if (l.indexOf('#@mail,') === 0) { l.slice(7).split(',').forEach(function (x) { x = x.trim().toLowerCase(); if (x) mailers.push(x); }); return; }
      if (l.indexOf('#@admin,') === 0) { l.slice(8).split(',').forEach(function (x) { x = x.trim().toLowerCase(); if (x) admins.push(x); }); return; }
      if (l.charAt(0) === '#') return;
      var i = l.indexOf(','); if (i < 1) return;
      users.push({ u: l.slice(0, i).trim(), p: l.slice(i + 1).trim() });
    });
  }
  function load() { return fetch(ACCESS, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }).then(function (t) { parse(t); loaded = true; }); }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function check(u, p) {
    var chain = Promise.resolve(false);
    users.filter(function (x) { return x.u.toLowerCase() === u.toLowerCase(); }).forEach(function (c) {
      chain = chain.then(function (done) {
        if (done) return true;
        if (c.p.indexOf('sha256:') === 0) {
          var parts = c.p.split(':'); if (parts.length < 3 || !(window.crypto && crypto.subtle)) return false;
          return crypto.subtle.digest('SHA-256', new TextEncoder().encode(parts[1] + ':' + p)).then(function (b) { return hex(b) === parts[2].toLowerCase(); });
        }
        return c.p === p;
      });
    });
    return chain;
  }

  /* ----- إخفاء محتوى الصفحة من DOM حتى الدخول ----- */
  function detach() {
    if (frag || !document.body) return;
    mark = document.createComment('pg'); frag = document.createDocumentFragment();
    var kids = Array.prototype.slice.call(document.body.childNodes);
    document.body.insertBefore(mark, document.body.firstChild);
    kids.forEach(function (n) { if (n.id !== 'pg-overlay' && n.nodeName !== 'SCRIPT' && n.nodeName !== 'STYLE' && !(n.getAttribute && n.getAttribute('data-gate-keep') !== null) && n.id !== 'dfl-overlay') frag.appendChild(n); });
  }
  function reveal(user) {
    locked = false; html.classList.remove('pg-locked');
    if (frag && mark && mark.parentNode) { mark.parentNode.insertBefore(frag, mark); frag = null; }
    if (overlay) { overlay.remove(); overlay = null; }
    if (!window.DFLegal && !document.getElementById('pg-out')) {
      var b = document.createElement('button'); b.id = 'pg-out'; b.type = 'button'; b.textContent = 'إنهاء الجلسة'; b.title = 'إنهاء جلسة العمل المصرح بها';
      b.addEventListener('click', function () { clearAuth(); location.reload(); }); document.body.appendChild(b);
    }
    try { window.dispatchEvent(new Event('resize')); if (typeof window.onPageGateOpen === 'function') window.onPageGateOpen(user); } catch (e) {}
  }

  /* ----- نافذة الدخول (صفحة كاملة أو نافذة قابلة للإغلاق) ----- */
  function openLogin(o) {
    o = o || {}; if (overlay) overlay.remove();
    overlay = document.createElement('div'); overlay.id = 'pg-overlay'; overlay.className = o.full ? 'pg-full' : '';
    overlay.innerHTML = '<div id="pg-box" role="dialog" aria-modal="true" aria-labelledby="pg-t">' + (o.full ? '' : '<button type="button" id="pg-x" aria-label="إغلاق">&times;</button>') +
      '<div class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg></div>' +
      '<h2 id="pg-t"></h2><p id="pg-m"></p><div id="pg-err" role="alert"></div>' +
      '<form id="pg-form" autocomplete="on"><input id="pg-u" type="text" placeholder="اسم المستخدم" autocomplete="username" required aria-label="اسم المستخدم"><input id="pg-p" type="password" placeholder="كلمة المرور" autocomplete="current-password" required aria-label="كلمة المرور"><button id="pg-go" type="submit">دخول</button></form>' +
      '<div class="ft">الدخول يسجّل جلسة عمل مصرح بها لمدة ساعة. هذا المحتوى يخضع لنظام حماية البيانات الشخصية (PDPL) وأنظمة الملكية الفكرية (IP) ومبادئ أخلاقيات الذكاء الاصطناعي (SDAIA) والذكاء الاصطناعي المسؤول، ويجب أخذ الموافقة الخطية من إدارة مدارس دار الفرسان الأهلية لأي استخدام للمحتوى بأي شكل.' + (o.full ? '<br><a href="evidence-link.html">العودة إلى لوحة المتابعة</a>' : '') + '</div></div>';
    document.body.appendChild(overlay);
    overlay.querySelector('#pg-t').textContent = o.title || TITLE; overlay.querySelector('#pg-m').textContent = o.msg || MSG;
    var form = overlay.querySelector('#pg-form'), err = overlay.querySelector('#pg-err'), go = overlay.querySelector('#pg-go');
    function msg(t) { err.textContent = t; err.style.display = t ? 'block' : 'none'; }
    function close() { if (overlay) { overlay.remove(); overlay = null; } }
    if (!o.full) {
      overlay.querySelector('#pg-x').addEventListener('click', close);
      overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
      overlay.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    }
    function cooldown() { var until = +S(LOCK) || 0, left = Math.ceil((until - Date.now()) / 1000); if (left > 0) { go.disabled = true; msg('تجاوزتَ عدد المحاولات. أعد المحاولة بعد ' + left + ' ثانية.'); setTimeout(cooldown, 1000); } else { go.disabled = false; if (until) { S(LOCK, null, true); S(TRY, null, true); msg(''); } } }
    cooldown();
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (go.disabled) return;
      var u = overlay.querySelector('#pg-u').value.trim(), p = overlay.querySelector('#pg-p').value;
      go.disabled = true; msg('');
      (loaded ? Promise.resolve() : load()).then(function () { return check(u, p); }).then(function (good) {
        if (good) { lastCred = { u: u, p: p }; S(TRY, null, true); setAuth(u); var cb = o.onOk; if (o.full) reveal(u); else close(); if (cb) cb(u, p); return; }
        var n = (+S(TRY) || 0) + 1; S(TRY, String(n));
        if (n >= 5) { S(LOCK, String(Date.now() + 30000)); msg('اسم المستخدم أو كلمة المرور غير صحيحة. تعذّر الدخول مؤقتاً.'); } else { msg('اسم المستخدم أو كلمة المرور غير صحيحة. (محاولة ' + n + ' من 5)'); }
        overlay.querySelector('#pg-p').value = ''; go.disabled = false; cooldown();
      }).catch(function () { msg('تعذّر قراءة ملف الصلاحيات (access.txt). تأكد أن الموقع يعمل عبر خادم وليس كملف محلي، ثم أعد المحاولة.'); go.disabled = false; });
    });
    setTimeout(function () { var i = overlay && overlay.querySelector('#pg-u'); if (i) i.focus(); }, 60);
  }

  /* ----- فتح بيانات الاتصال المشفّرة (AES-GCM) بكلمة مرور المستخدم ----- */
  function b64d(s) { var b = atob(s), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; }
  function b64e(a) { var s = ''; for (var i = 0; i < a.length; i++) s += String.fromCharCode(a[i]); return btoa(s); }
  function decPayload(K, enc) {
    return crypto.subtle.importKey('raw', K, 'AES-GCM', false, ['decrypt']).then(function (key) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(enc.iv) }, key, b64d(enc.ct)); }).then(function (raw) { return JSON.parse(new TextDecoder().decode(raw)); });
  }
  function unwrap(enc, u, p) {
    var w = (enc.wraps || []).filter(function (x) { return x.u === u.toLowerCase(); })[0];
    if (!w) return Promise.reject(new Error('no-wrap'));
    return crypto.subtle.importKey('raw', new TextEncoder().encode(p), 'PBKDF2', false, ['deriveKey'])
      .then(function (km) { return crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64d(w.s), iterations: enc.it, hash: 'SHA-256' }, km, { name: 'AES-GCM', length: 256 }, false, ['decrypt']); })
      .then(function (k) { return crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64d(w.i) }, k, b64d(w.w)); }).then(function (raw) { return new Uint8Array(raw); });
  }
  function unlockContacts(enc) {
    if (!(window.crypto && crypto.subtle)) return Promise.reject(new Error('no-crypto'));
    var ck = S(CK);
    if (ck) return decPayload(b64d(ck), enc).catch(function () { S(CK, null, true); return unlockContacts(enc); });
    if (lastCred) return unwrap(enc, lastCred.u, lastCred.p).then(function (K) { S(CK, b64e(K)); return decPayload(K, enc); });
    return new Promise(function (res, rej) {
      openLogin({ title: 'فتح قائمة البريد', msg: 'قائمة البريد محفوظة مشفّرة. أدخل كلمة المرور لفتحها في هذه الجلسة.', onOk: function () { unlockContacts(enc).then(res, rej); } });
    });
  }

  window.DFGate = {
    _booted: true, isAuth: isAuth, expiresAt: function () { var i = info(); return i ? i.exp : 0; }, user: function () { var i = info(); return i ? i.u : ''; },
    require: function (cb, opts) { if (isAuth() && !(opts && opts.force)) { cb(); return; } openLogin({ onOk: cb, title: (opts && opts.title) || 'دخول بجلسة عمل مصرح بها', msg: (opts && opts.msg) || 'أدخل بيانات الدخول المعتمدة لتسجيل جلسة عمل مصرح بها.' }); },
    logout: function () { clearAuth(); }, unlockContacts: unlockContacts,
    /* صلاحية إرسال الرسائل: إن وُجد في access.txt سطر  #@mail,مستخدم1,مستخدم2  اقتُصر الإرسال عليهم، وإلا فلكل مستخدم مصرح له */
    /* مدير النظام: المذكورون في سطر  #@admin,مستخدم1,مستخدم2  في access.txt؛ وبلا السطر يُعدّ المستخدم «admin» وحده مديراً. تعيد وعداً بقيمة true/false */
    isAdmin: function () { return (loaded ? Promise.resolve() : load()).then(function () { var i = info(), u = ((i && i.u) || '').toLowerCase(); return !!i && (admins.length ? admins : ['admin']).indexOf(u) >= 0; }).catch(function () { return false; }); },
    canMail: function () { return (loaded ? Promise.resolve() : load()).then(function () { var i = info(), u = ((i && i.u) || '').toLowerCase(); return !!i && (mailers.length === 0 || mailers.indexOf(u) >= 0); }); }
  };

  window.addEventListener('storage', function (e) { if (e.key !== AK) return; if (locked && isAuth()) reveal(info().u); else if (!locked && !isAuth()) lockAgain('out'); else watch(); });
  function boot() {
    if (isAuth()) { html.classList.remove('pg-locked'); watch(); return; }
    if (LAZY) return;
    if (ALWAYS) { locked = true; if (DETACH) detach(); openLogin({ full: true }); return; }
    load().then(function () { if (gates.indexOf(PAGE) >= 0) { locked = true; detach(); openLogin({ full: true }); } else html.classList.remove('pg-locked'); })
      .catch(function () { locked = true; detach(); openLogin({ full: true }); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
