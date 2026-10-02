/*
 * page-gate.js — قفل صفحة باسم مستخدم وكلمة مرور تُقرأ من ملف access.txt الخارجي بدالة fetch.
 * الاستعمال:  <script src="page-gate.js" data-always="1"></script>  في <head> (قفل دائم لهذه الصفحة).
 * أو بلا data-always: تُقفل الصفحة فقط إن وُجد في access.txt سطر  #@gate,اسم-الصفحة.html
 * صيغة المستخدمين: «المعرف,كلمة المرور» (سطر لكل مستخدم) ويدعم أيضاً «المعرف,sha256:الملح:البصمة» لكلمة مرور مُجزّأة.
 * سلوك آمن عند الفشل: إن تعذّر قراءة access.txt تبقى الصفحة مقفلة (fail-closed).
 * ⚠ هذا قفل في المتصفح لا خادم: يمنع الاطلاع العابر لكنه لا يحجب المصدر عمّن يعرف كيف يقرأه. (انظر ملاحظات الإصدار)
 */
(function () {
  'use strict';
  var SC = document.currentScript, ALWAYS = !!(SC && SC.dataset.always === '1'), ACCESS = (SC && SC.dataset.access) || 'access.txt';
  var PAGE = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var KEY = 'df_gate_' + PAGE, UKEY = KEY + '_user', TRY = KEY + '_try', LOCK = KEY + '_until';
  var html = document.documentElement, frag = null, mark = null, users = [], gates = null, loaded = false, overlay = null;
  var store = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { sessionStorage.removeItem(k); } catch (e) {} } };
  function ok() { return store.get(KEY) === '1'; }

  // ----- منع الفهرسة ونماذج الذكاء الاصطناعي (إشارات اختيارية تحترمها بعض الخدمات) -----
  [['robots', 'noindex,nofollow,noarchive,noimageindex'], ['robots', 'noai,noimageai'], ['googlebot', 'noindex,nofollow,noarchive']].forEach(function (m) { var t = document.createElement('meta'); t.name = m[0]; t.content = m[1]; document.head.appendChild(t); });

  var css = 'html.pg-locked body>*:not(#pg-overlay){display:none!important}' +
    '#pg-overlay{position:fixed;inset:0;z-index:2147482000;background:linear-gradient(160deg,#002a2a,#0f172a);display:flex;align-items:center;justify-content:center;padding:16px;font-family:Cairo,Tahoma,sans-serif;direction:rtl}' +
    '#pg-box{background:#fff;color:#0f172a;border-radius:20px;max-width:430px;width:100%;padding:26px;box-shadow:0 24px 70px rgba(0,0,0,.5);border-top:6px solid #c29b38;text-align:right}' +
    '#pg-box .ic{width:54px;height:54px;border-radius:50%;background:linear-gradient(135deg,#c29b38,#006666);display:flex;align-items:center;justify-content:center;margin-bottom:12px}' +
    '#pg-box h2{margin:0 0 6px;font-size:17px;font-weight:900;color:#003d3d}#pg-box p{margin:0 0 12px;font-size:12.5px;line-height:1.9;color:#475569}' +
    '#pg-box input{width:100%;box-sizing:border-box;font:600 13px Cairo,Tahoma,sans-serif;padding:11px 12px;border:1px solid #cbd5e1;border-radius:10px;margin-bottom:9px;direction:ltr;text-align:right}' +
    '#pg-box input:focus{outline:none;border-color:#006666;box-shadow:0 0 0 3px rgba(0,102,102,.15)}' +
    '#pg-err{display:none;font-size:12px;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;border-radius:9px;padding:8px 10px;margin-bottom:9px;line-height:1.7}' +
    '#pg-go{width:100%;border:0;border-radius:12px;background:#006666;color:#fff;font:800 14px Cairo,Tahoma,sans-serif;padding:12px;cursor:pointer}#pg-go:disabled{opacity:.55;cursor:not-allowed}' +
    '#pg-box .ft{margin-top:12px;font-size:10.5px;color:#94a3b8;text-align:center;line-height:1.8}#pg-box .ft a{color:#006666}' +
    '#pg-out{position:fixed;bottom:14px;left:14px;z-index:9999;background:#7f1d1d;color:#fff;border:0;border-radius:999px;font:700 11px Cairo,Tahoma,sans-serif;padding:9px 14px;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.3)}' +
    '@media print{#pg-out{display:none!important}}';
  var st = document.createElement('style'); st.id = 'pg-style'; st.textContent = css; document.head.appendChild(st);

  var needsGate = ALWAYS && !ok();
  if (!ALWAYS && !ok()) needsGate = true; // مؤقتاً حتى نقرأ access.txt: نخفي ثم نكشف إن لم تكن الصفحة مدرجة
  if (needsGate) html.classList.add('pg-locked');

  function parse(text) {
    users = []; gates = [];
    text.split(/\r?\n/).forEach(function (raw) {
      var l = raw.trim(); if (!l) return;
      if (l.indexOf('#@gate,') === 0) { gates.push(l.slice(7).trim().toLowerCase()); return; }
      if (l.charAt(0) === '#') return;
      var i = l.indexOf(','); if (i < 1) return;
      users.push({ u: l.slice(0, i).trim(), p: l.slice(i + 1).trim() });
    });
  }
  function load() {
    return fetch(ACCESS, { cache: 'no-store' }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); }).then(function (t) { parse(t); loaded = true; });
  }
  function hex(buf) { return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ('0' + b.toString(16)).slice(-2); }).join(''); }
  function check(u, p) {
    var cand = users.filter(function (x) { return x.u.toLowerCase() === u.toLowerCase(); });
    var chain = Promise.resolve(false);
    cand.forEach(function (c) {
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

  function detach() {
    if (frag || !document.body) return;
    mark = document.createComment('pg'); frag = document.createDocumentFragment();
    var kids = Array.prototype.slice.call(document.body.childNodes);
    document.body.insertBefore(mark, document.body.firstChild);
    kids.forEach(function (n) { if (n.id !== 'pg-overlay' && n.nodeName !== 'SCRIPT' && n.nodeName !== 'STYLE') frag.appendChild(n); });
  }
  function reveal(user) {
    html.classList.remove('pg-locked');
    if (frag && mark && mark.parentNode) { mark.parentNode.insertBefore(frag, mark); frag = null; }
    if (overlay) { overlay.remove(); overlay = null; }
    if (!document.getElementById('pg-out')) {
      var b = document.createElement('button'); b.id = 'pg-out'; b.type = 'button'; b.textContent = 'قفل الصفحة'; b.title = 'إعادة قفل هذه الصفحة';
      b.addEventListener('click', function () { store.del(KEY); store.del(UKEY); location.reload(); }); document.body.appendChild(b);
    }
    try { window.dispatchEvent(new Event('resize')); if (typeof window.onPageGateOpen === 'function') window.onPageGateOpen(user); } catch (e) {}
  }
  function buildOverlay() {
    overlay = document.createElement('div'); overlay.id = 'pg-overlay';
    overlay.innerHTML = '<div id="pg-box"><div class="ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg></div>' +
      '<h2>صفحة خاصة بفريقنا</h2><p>هذه الصفحة للتشاور بين فريق العمل والإشراف الأكاديمي للقسم. فضلاً أدخل بيانات الدخول المعتمدة لتتصفحها معنا.</p>' +
      '<div id="pg-err" role="alert"></div>' +
      '<form id="pg-form" autocomplete="on"><input id="pg-u" type="text" placeholder="اسم المستخدم" autocomplete="username" required aria-label="اسم المستخدم"><input id="pg-p" type="password" placeholder="كلمة المرور" autocomplete="current-password" required aria-label="كلمة المرور"><button id="pg-go" type="submit">دخول</button></form>' +
      '<div class="ft">هذا العمل يخضع لنظام حماية البيانات الشخصية (PDPL) ولأنظمة حماية الملكية الفكرية (IP).<br><a href="evidence-link.html">العودة إلى لوحة المتابعة</a></div></div>';
    document.body.appendChild(overlay);
    var form = document.getElementById('pg-form'), err = document.getElementById('pg-err'), go = document.getElementById('pg-go');
    function msg(t) { err.textContent = t; err.style.display = t ? 'block' : 'none'; }
    function cooldown() { var until = +store.get(LOCK) || 0, left = Math.ceil((until - Date.now()) / 1000); if (left > 0) { go.disabled = true; msg('تجاوزتَ عدد المحاولات. أعد المحاولة بعد ' + left + ' ثانية.'); setTimeout(cooldown, 1000); } else { go.disabled = false; if (until) { store.del(LOCK); store.del(TRY); msg(''); } } }
    cooldown();
    form.addEventListener('submit', function (e) {
      e.preventDefault(); if (go.disabled) return;
      var u = document.getElementById('pg-u').value.trim(), p = document.getElementById('pg-p').value;
      go.disabled = true; msg('');
      (loaded ? Promise.resolve() : load()).then(function () { return check(u, p); }).then(function (good) {
        if (good) { store.set(KEY, '1'); store.set(UKEY, u); store.del(TRY); reveal(u); return; }
        var n = (+store.get(TRY) || 0) + 1; store.set(TRY, String(n));
        if (n >= 5) { store.set(LOCK, String(Date.now() + 30000)); msg('اسم المستخدم أو كلمة المرور غير صحيحة. تعذّر الدخول مؤقتاً.'); } else { msg('اسم المستخدم أو كلمة المرور غير صحيحة. (محاولة ' + n + ' من 5)'); }
        document.getElementById('pg-p').value = ''; go.disabled = false; cooldown();
      }).catch(function () { msg('تعذّر قراءة ملف الصلاحيات (access.txt). تأكد أن الموقع يعمل عبر خادم وليس كملف محلي، ثم أعد المحاولة.'); go.disabled = false; });
    });
    setTimeout(function () { var i = document.getElementById('pg-u'); if (i) i.focus(); }, 60);
  }
  function boot() {
    if (ok()) { html.classList.remove('pg-locked'); if (!document.getElementById('pg-out')) reveal(store.get(UKEY)); return; }
    if (ALWAYS) { detach(); buildOverlay(); return; }
    // صفحة اختيارية: نقرأ access.txt ونقفل فقط إن كانت مدرجة بـ #@gate
    load().then(function () {
      if (gates.indexOf(PAGE) >= 0) { detach(); buildOverlay(); } else { html.classList.remove('pg-locked'); }
    }).catch(function () { detach(); buildOverlay(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
