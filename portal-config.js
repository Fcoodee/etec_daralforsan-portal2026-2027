/* إعدادات مشتركة لصفحات مشروع ربط الشواهد بالسجلات
   (evidence-link.html و approval-request.html و hardcopy.html و output.html و indicator.html)

   1) ETEC_STATUS_URL: رابط تطبيق الويب لـ Apps Script (ينتهي بـ /exec). يوضع مرة واحدة هنا.
   2) ETEC_VISIT_DATE: موعد زيارة التقويم الخارجي بصيغة السنة-الشهر-اليوم، مثل "2026-12-20" (اختياري).
      حين يُحدَّد يظهر في لوحة المتابعة سطر «على المسار / متأخر» ويُحسب الخط الزمني في طلب الموافقة.
   3) ETEC_PLAN_WEEKS: مدد المراحل الخمس بالأسابيع.
   4) ETEC_PHASE1: المرحلة السابقة (جمع الشواهد وإتمام التقويم الذاتي): نسبتها وتاريخ قياسها (من لوحة 2026-2027).
   5) ETEC_EVIDENCE_REF_URL: «مرجع الشواهد المؤمَّنة» (درايف مكتب الإشراف والتطوير). يخدم تغذية التقرير البصري فقط.
   6) ETEC_OFFICIAL_CENTER_URL: صفحة المركز الوطني للتقويم والتميز المدرسي (تميز).
   9) ETEC_SITE_BASE: العنوان الأساسي للموقع المنشور، تُبنى منه الروابط داخل رسائل البريد.
   8) ETEC_RIGHTS_OWNER: صاحب الحقوق الذي يظهر في مربع الحوار القانوني (مثل: «مدارس دار الفرسان الأهلية»). اتركه فارغاً حتى يُحدَّد قانونياً.
   7) ETEC_PROJECT_ORGANIZER: اسم منظّم المشروع (مهندس بيانات النظام) الذي يظهر في صفحة التسليم المطبوعة. */
window.ETEC_STATUS_URL = "";
window.ETEC_VISIT_DATE = "";
window.ETEC_PLAN_WEEKS = [1, 2, 5, 2, 1];
window.ETEC_PHASE1 = { pct: 99, atClose: 76, date: "2026-09-20", pending: 2, pendingNote: "1-4-1-1 (الموارد البشرية) و1-4-1-3 (الإدارة المالية)" };
window.ETEC_EVIDENCE_REF_URL = "https://drive.google.com/drive/folders/19eBfs6wK7rZvje81ANWFTl_ORLAqK3v6?usp=sharing";
window.ETEC_OFFICIAL_CENTER_URL = "https://etec.gov.sa/ar/centers/ncsee";
window.ETEC_PROJECT_ORGANIZER = "";
window.ETEC_RIGHTS_OWNER = "";
window.ETEC_SITE_BASE = "https://fcoodee.github.io/etec_daralforsan-portal2026-2027/";
