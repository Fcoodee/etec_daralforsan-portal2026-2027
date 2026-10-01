/**
 * board-lock.js — قفل لوحات البوابة من ملف access.txt
 * مدارس دار الفرسان — قسم الدبلوما الأمريكية (بنين) — v8.10.1
 *
 * الصيغة داخل access.txt (سطر لكل لوحة):
 *     #@lock,index-2025-2026.html
 *     #@lock,2026-2027.html
 * السطر يبدأ بـ # فيتجاهله نظام الدخول (login.html / content-protect.js) ولا يُقرأ كمستخدم.
 * لفتح لوحة: احذف سطرها من access.txt. لا حاجة لتعديل أي صفحة.
 *
 * الاستخدام:
 *   - في اللوحة المقفلة، داخل <head>:   <script src="board-lock.js" data-board="2026-2027.html"></script>
 *   - في index.html قبل </body>:        <script src="board-lock.js"></script>  + data-lock="..." على البطاقة
 * عند تعذر قراءة access.txt تُقفل اللوحة احتياطاً (fail-closed).
 * تنبيه: القفل من جانب المتصفح؛ يكفي للتنظيم لا للسرية.
 */
(function () {
  var me = document.currentScript;
  var board = me && me.getAttribute('data-board');
  var root = document.documentElement;

  if (board) {
    root.classList.add('bl-pending');
    var st = document.createElement('style');
    st.textContent = 'html.bl-pending body{visibility:hidden}';
    document.head.appendChild(st);
  }

  function readLocks() {
    return fetch('access.txt', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('access.txt'); return r.text(); })
      .then(function (t) {
        return t.split('\n').map(function (l) { return l.trim(); })
          .filter(function (l) { return /^#@lock\s*,/i.test(l); })
          .map(function (l) { return l.split(',')[1].trim(); });
      });
  }

  function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

  function lockPage(reason) {
    ready(function () {
      var ov = document.createElement('div');
      ov.setAttribute('role', 'alertdialog');
      ov.setAttribute('aria-modal', 'true');
      ov.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:flex;align-items:center;justify-content:center;padding:24px;' +
        'background:radial-gradient(circle at 50% 30%,#0f3b3b,#020617);font-family:Cairo,Tahoma,sans-serif;direction:rtl;visibility:visible';
      ov.innerHTML =
        '<div style="max-width:440px;width:100%;background:#fff;border-radius:18px;padding:30px 26px;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,.45)">' +
        '<div style="width:64px;height:64px;margin:0 auto 14px;border-radius:50%;background:#fef3c7;display:flex;align-items:center;justify-content:center;font-size:30px">🔒</div>' +
        '<h1 style="font-size:19px;font-weight:800;color:#0f172a;margin:0 0 8px">هذه اللوحة مقفلة حالياً</h1>' +
        '<p style="font-size:13px;line-height:1.9;color:#475569;margin:0 0 18px">' + reason + '</p>' +
        '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap">' +
        '<a href="evidence-link.html" style="background:#003d3d;color:#fff;text-decoration:none;font-size:12px;font-weight:700;padding:9px 16px;border-radius:10px">مشروع ربط الشواهد بالسجلات</a>' +
        '<a href="index.html" style="background:#f1f5f9;color:#0f172a;text-decoration:none;font-size:12px;font-weight:700;padding:9px 16px;border-radius:10px">البوابة الرئيسية</a>' +
        '</div></div>';
      document.body.appendChild(ov);
      document.body.style.overflow = 'hidden';
      Array.prototype.forEach.call(document.body.children, function (c) { if (c !== ov) c.setAttribute('aria-hidden', 'true'); });
      root.classList.remove('bl-pending');
      var a = ov.querySelector('a'); if (a) a.focus();
    });
  }

  function lockCards(locks) {
    ready(function () {
      document.querySelectorAll('[data-lock]').forEach(function (card) {
        if (locks.indexOf(card.getAttribute('data-lock')) === -1) return;
        card.classList.add('bl-locked');
        card.setAttribute('aria-disabled', 'true');
        card.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); a.addEventListener('click', function (e) { e.preventDefault(); }); });
        if (card.tagName === 'A') { card.setAttribute('tabindex', '-1'); card.addEventListener('click', function (e) { e.preventDefault(); }); }
        var badge = document.createElement('div');
        badge.className = 'bl-badge';
        badge.innerHTML = '🔒 مقفلة حالياً';
        card.appendChild(badge);
      });
    });
  }

  readLocks().then(function (locks) {
    if (board) {
      if (locks.indexOf(board) !== -1) lockPage('تم إيقاف الوصول إلى هذه اللوحة مؤقتاً بقرار من إدارة المشروع. العمل الحالي يتم عبر مشروع ربط الشواهد بالسجلات.');
      else root.classList.remove('bl-pending');
    } else {
      lockCards(locks);
    }
  }).catch(function () {
    if (board) lockPage('تعذر التحقق من صلاحية الوصول (ملف access.txt غير متاح). أُقفلت اللوحة احتياطاً.');
  });
})();
