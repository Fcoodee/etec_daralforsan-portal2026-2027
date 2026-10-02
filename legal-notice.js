/*
 * legal-notice.js — مربع حوار قانوني يظهر عند كل نقرة على رابط أو انتقال بين الصفحات.
 * النص: «هذا العمل يخضع لـ PDPL (نظام حماية البيانات الشخصية) و IP (أنظمة حماية الملكية الفكرية)» + زر «نعم أعي ذلك».
 * - يعترض كل <a href> (عدا الروابط الداخلية # و javascript: والتنزيلات)، وكذلك window.open، ويوفّر DFLegal.go(url) للتنقل البرمجي.
 * - لا يمنع النسخ بنفسه؛ هو إقرار وتنبيه. (الحماية التقنية الأقوى: انظر ملاحظات الإصدار)
 * - إعدادات اختيارية في portal-config.js: ETEC_RIGHTS_OWNER (صاحب الحقوق).
 */
(function () {
  'use strict';
  if (window.DFLegal) return;
  var bypass = false, last = null, overlay = null, yesCb = null;

  var CSS = '#dfl-overlay{position:fixed;inset:0;z-index:2147483000;background:rgba(2,12,12,.74);display:none;align-items:center;justify-content:center;padding:16px;font-family:Cairo,Tahoma,sans-serif;direction:rtl}' +
    '#dfl-overlay.dfl-show{display:flex}' +
    '#dfl-box{position:relative;background:#fff;color:#0f172a;border-radius:18px;max-width:440px;width:100%;padding:24px 24px 18px;box-shadow:0 24px 70px rgba(0,0,0,.45);text-align:right;border-top:6px solid #c29b38}' +
    '#dfl-x{position:absolute;top:10px;left:12px;width:30px;height:30px;border:0;border-radius:50%;background:#f1f5f9;color:#475569;font-size:18px;line-height:1;cursor:pointer}' +
    '#dfl-x:hover{background:#e2e8f0}' +
    '#dfl-ic{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,#006666,#003d3d);display:flex;align-items:center;justify-content:center;margin-bottom:10px}' +
    '#dfl-box h3{margin:0 0 6px;font-size:16px;font-weight:900;color:#003d3d}' +
    '#dfl-box p{margin:0;font-size:12.5px;line-height:1.9;color:#334155}' +
    '#dfl-box ul{margin:8px 0;padding:0;list-style:none}' +
    '#dfl-box li{display:flex;gap:8px;align-items:baseline;background:#f0fafa;border:1px solid #cdeaea;border-radius:10px;padding:7px 10px;margin-bottom:6px;font-size:12.5px;line-height:1.7}' +
    '#dfl-box li b{color:#006666;font-size:13px;min-width:44px;direction:ltr;text-align:left}' +
    '#dfl-box .dfl-sm{font-size:11.5px;color:#64748b;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:8px 10px}' +
    '#dfl-yes{display:block;width:100%;margin-top:14px;border:0;border-radius:12px;background:#006666;color:#fff;font:800 14px Cairo,Tahoma,sans-serif;padding:12px;cursor:pointer}' +
    '#dfl-yes:hover{background:#005252}#dfl-yes:focus-visible,#dfl-x:focus-visible{outline:3px solid #c29b38;outline-offset:2px}' +
    '#dfl-ft{margin-top:8px;text-align:center;font-size:10.5px;color:#94a3b8}' +
    '@media print{#dfl-overlay{display:none!important}}';

  function ensure() {
    if (overlay) return;
    var st = document.createElement('style'); st.id = 'dfl-style'; st.textContent = CSS; document.head.appendChild(st);
    overlay = document.createElement('div'); overlay.id = 'dfl-overlay'; overlay.setAttribute('role', 'dialog'); overlay.setAttribute('aria-modal', 'true'); overlay.setAttribute('aria-labelledby', 'dfl-title');
    overlay.innerHTML = '<div id="dfl-box">' +
      '<button type="button" id="dfl-x" aria-label="إغلاق دون المتابعة">&times;</button>' +
      '<div id="dfl-ic"><svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2l8 3v6c0 5-3.4 9.3-8 11-4.6-1.7-8-6-8-11V5z"/><path d="M9 12l2 2 4-4"/></svg></div>' +
      '<h3 id="dfl-title">تنبيه قانوني قبل المتابعة</h3>' +
      '<p>هذا العمل يخضع لـ:</p>' +
      '<ul><li><b>PDPL</b><span>نظام حماية البيانات الشخصية</span></li><li><b>IP</b><span>أنظمة حماية الملكية الفكرية</span></li></ul>' +
      '<p class="dfl-sm">ولا يجوز نسخ محتوياته أو هندسته أو خوارزمياته، ولا رفعها إلى نماذج الذكاء الاصطناعي أو أي جهة خارجية، دون إذن كتابي من صاحب الحقوق.</p>' +
      '<button type="button" id="dfl-yes">نعم أعي ذلك</button>' +
      '<div id="dfl-ft"></div></div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.getElementById('dfl-x').addEventListener('click', close);
    document.getElementById('dfl-yes').addEventListener('click', function () { var cb = yesCb; close(true); if (cb) cb(); });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'Tab') { var f = [document.getElementById('dfl-x'), document.getElementById('dfl-yes')]; var i = f.indexOf(document.activeElement); e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus(); }
    });
  }
  function show(cb) {
    if (!document.body) { cb(); return; }
    ensure(); yesCb = cb; last = document.activeElement;
    var owner = window.ETEC_RIGHTS_OWNER || '';
    document.getElementById('dfl-ft').textContent = '© ' + new Date().getFullYear() + ' — ' + (owner ? 'جميع الحقوق محفوظة لـ ' + owner : 'جميع الحقوق محفوظة');
    overlay.classList.add('dfl-show');
    setTimeout(function () { var y = document.getElementById('dfl-yes'); if (y) y.focus(); }, 30);
  }
  function close(accepted) {
    if (!overlay) return; overlay.classList.remove('dfl-show'); if (!accepted) yesCb = null;
    try { if (last && last.focus) last.focus(); } catch (e) {}
  }
  function intercept(a, viaMiddle) {
    show(function () {
      if (viaMiddle) { bypass = true; try { window.open(a.href, '_blank', 'noopener'); } finally { bypass = false; } return; }
      bypass = true; try { a.click(); } finally { bypass = false; }
    });
  }
  function relevant(a) {
    if (!a || a.closest('#dfl-overlay') || a.hasAttribute('data-nolegal') || a.hasAttribute('download')) return false;
    var h = a.getAttribute('href') || ''; return !!h && h.charAt(0) !== '#' && !/^\s*javascript:/i.test(h);
  }
  document.addEventListener('click', function (e) {
    if (bypass) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!relevant(a)) return;
    e.preventDefault(); e.stopPropagation(); intercept(a, false);
  }, true);
  document.addEventListener('auxclick', function (e) {
    if (bypass || e.button !== 1) return;
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!relevant(a)) return;
    e.preventDefault(); e.stopPropagation(); intercept(a, true);
  }, true);

  var _open = window.open ? window.open.bind(window) : null;
  if (_open) window.open = function (u, t, f) {
    if (bypass) return _open(u, t, f);
    show(function () { bypass = true; try { _open(u, t, f); } finally { bypass = false; } });
    return null;
  };
  window.DFLegal = {
    go: function (url, newTab) { show(function () { bypass = true; try { if (newTab && _open) _open(url, '_blank', 'noopener'); else location.href = url; } finally { bypass = false; } }); },
    show: show
  };
})();
