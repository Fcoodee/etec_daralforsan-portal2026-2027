/* portal-meta.js — الإصدار المعتمد وتاريخ آخر تحديث، وليبل «نوع المستخدم الحالي» في كل الصفحات.
   - الإصدار والتاريخ يُعدَّلان هنا وحده فيظهران موحَّدين في كل الصفحات.
   - الليبل يقرأ نوع المستخدم الذي اختاره في لوحة evidence-link (المفتاح etec.utype.v1) ويبقى ظاهراً ما دامت جلسة الدخول قائمة (df_auth_v1)،
     وبانتهاء الجلسة أو تسجيل الخروج يُمسح النوع فيُسأل المستخدم من جديد عند الدخول التالي.
   - هذا الملف عرضٌ فقط: لا يمنح صلاحية ولا يحمي شيئاً. الحماية في page-gate.js وaccess.txt (لم يتغيّرا). */
(function () {
  'use strict';
  if (window.ETEC_META) return;
  /* showEtecLogo: false لإخفاء شعار هيئة تقويم التعليم والتدريب من ترويسات الصفحات.
     السياسات (1445هـ، ص26) تمنع المدرسة المعتمدة من استخدام شعار الهيئة أو المركز في منشوراتها؛ والافتراضي true إلى أن تقرّر إدارة المدرسة وضعها من الاعتماد. */
  var META = { version: 'v9.6.6', updated: '2026-11-13T23:00:00+03:00', updatedText: '13 نوفمبر 2026', showEtecLogo: true };
  window.ETEC_META = META;
  var UK = 'etec.utype.v1', AK = 'df_auth_v1';
  var NAMES = { admin: 'مدير النظام', sup: 'مشرف فريق السجلات والشواهد', member: 'عضو فريق السجلات والشواهد', self: 'مشرف عمليات التقويم الذاتي' };
  var HAS_OWN_BAR = true; /* شريط الدور في أعلى الصفحة يكفي؛ لا ليبل مكرر */

  function ls(k, v, del) { try { if (del) localStorage.removeItem(k); else if (v === undefined) return localStorage.getItem(k); else localStorage.setItem(k, v); } catch (e) {} return null; }
  function auth() { try { var o = JSON.parse(ls(AK) || 'null'); if (o && o.exp > Date.now()) return o; } catch (e) {} return null; }
  function urlType() { try { var q = new URLSearchParams(location.search).get('u'); return q && NAMES[q] ? q : ''; } catch (e) { return ''; } }
  function curType() { var v = ls(UK); return v && NAMES[v] ? v : ''; }

  var css = document.createElement('style');
  css.textContent =
    '#etecMetaBox{position:fixed;bottom:6px;right:8px;left:8px;z-index:2147483000;display:flex;flex-direction:column;align-items:flex-start;gap:3px;pointer-events:none;direction:rtl;font-family:Tahoma,Arial,sans-serif}' +
    '#etecMetaBox.auth{bottom:50px}' +
    '#etecMetaVer{font:600 10px/1.4 Tahoma,Arial,sans-serif;color:#64748b;background:rgba(255,255,255,.94);border:1px solid #e2e8f0;border-radius:999px;padding:2px 9px;box-shadow:0 1px 3px rgba(0,0,0,.06);max-width:100%}' +
    '#etecMetaUser{font:700 11px/1.4 Tahoma,Arial,sans-serif;color:#0f5f5a;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:999px;padding:3px 11px;max-width:100%;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 1px 3px rgba(0,0,0,.08)}' +
    '@media print{#etecMetaBox{display:none!important}}';
  var box, ver, usr;
  function mount() {
    if (!document.body || box) return;
    document.head.appendChild(css);
    box = document.createElement('div'); box.id = 'etecMetaBox';
    ver = document.createElement('div'); ver.id = 'etecMetaVer'; ver.setAttribute('aria-label', 'رقم الإصدار وتاريخ آخر تحديث');
    ver.textContent = 'الإصدار ' + META.version + ' · آخر تحديث ' + META.updatedText;
    var note = document.createElement('div'); note.id = 'etecMetaNote'; note.textContent = 'منصة داخلية لمدارس دار الفرسان — غير تابعة لهيئة تقويم التعليم والتدريب، ولا تعرض نتيجة تقويم أو اعتماد رسمية';
    note.style.cssText = 'font:600 9.5px/1.4 Tahoma,Arial,sans-serif;color:#64748b;background:rgba(255,255,255,.94);border:1px solid #e2e8f0;border-radius:999px;padding:1px 9px;max-width:100%';
    box.appendChild(ver); document.body.appendChild(box);
    if (META.showEtecLogo === false) {
      var imgs = document.querySelectorAll('img[alt="ETEC Logo"], img[alt="هيئة تقويم التعليم والتدريب"]');
      for (var k = 0; k < imgs.length; k++) imgs[k].style.display = 'none';
    }
    tick();
  }
  var lastAuth = null;
  function tick() {
    var a = auth();
    if (lastAuth === true && !a) { if (ls(UK) === 'admin') ls(UK, null, true); try { window.dispatchEvent(new CustomEvent('etec:logout')); } catch (e) {} }
    if (!a && ls(UK) === 'admin') ls(UK, null, true); /* انتهاء الجلسة يُسقط دور المدير وحده؛ بقية الأدوار لا تحتاج دخولاً */
    lastAuth = !!a;
    box.className = a ? 'auth' : ''; /* في الجلسة المصرح بها يظهر شريطها أسفل الصفحة، فنرتفع فوقه */
    var t = curType() || urlType(); if (t === 'admin' && !a) t = '';
    if (HAS_OWN_BAR || (!a && !t)) { if (usr) { usr.remove(); usr = null; } return; }
    var txt = t ? 'نوع المستخدم: ' + NAMES[t] : 'المستخدم: ' + ((a && a.u) || '');
    if (!usr) { usr = document.createElement('div'); usr.id = 'etecMetaUser'; usr.setAttribute('role', 'status'); box.insertBefore(usr, ver); }
    usr.textContent = txt; usr.title = a && a.u ? 'جلسة الدخول: ' + a.u : '';
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
  setInterval(function () { if (box) tick(); }, 2000);
  window.addEventListener('storage', function () { if (box) tick(); });
  window.addEventListener('etec:utchange', function () { if (box) tick(); });
})();
