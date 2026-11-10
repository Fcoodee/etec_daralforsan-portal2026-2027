/* etec-ref.js — v8.10.11: المرجع الرسمي للهيئة كما في الوثائق المنشورة (نوفمبر 2026).
   - بيانات ثابتة للقراءة فقط؛ لا تحتوي أي نسب أداء. القيم التي يُدخلها المنظّم (نتائج المجالات الفعلية، حالة الأدوات) في portal-config.js.
   - المصادر: الإصدار الثاني من وثيقة المعايير 2026 (ص8–15)، الدليل الإجرائي للتقويم الذاتي — الإصدار الثالث 1447هـ (ص7، 11، 13–19)،
     سياسات التقويم والاعتماد المدرسي 1445هـ (ص20–26)، وملف «معايير التقويم والاعتماد المدرسي — فبراير 2026» (إضاءات الأدوات لكل مؤشر، ص10–56).
   - خريطة الأدوات (TOOLS_MAP) مستخرجة من خانات الاختيار في ملف فبراير؛ وهي إرشادية، وليست من الإصدار الثاني الرسمي. */
(function () {
  'use strict';
  var TOOL_LABELS = {
    docs: 'تحليل الوثائق', survey_teacher: 'استبانة المعلم', survey_learner: 'استبانة المتعلم', survey_family: 'استبانة الأسرة',
    obs_class: 'الملاحظة الصفية', obs_env: 'ملاحظة بيئة التعلم', interviews: 'المقابلات', natl_tests: 'الاختبارات الوطنية',
    survey_assoc: 'الاستبانات المصاحبة للاختبار', licenses: 'نتائج الرخصة المهنية'
  };
  var LEVELS = [
    { k: 'prep', n: 'التهيئة', from: 0, to: 50, note: 'مستوى أداء منخفض: يتطلب تدخلات جوهرية في معظم المجالات' },
    { k: 'start', n: 'الانطلاق', from: 50, to: 75, note: 'مستوى أداء مقبول: يتطلب تحسينات كبيرة في بعض المجالات' },
    { k: 'prog', n: 'التقدم', from: 75, to: 90, note: 'مستوى أداء جيد: يتطلب استمرار المتابعة للتحسين والتطوير' },
    { k: 'exc', n: 'التميز', from: 90, to: 100, note: 'مستوى أداء متميز: يتطلب استدامة التميز والابتكار' }
  ];
  function levelOf(p) { if (typeof p !== 'number' || isNaN(p)) return null; for (var i = LEVELS.length - 1; i >= 0; i--) if (p >= LEVELS[i].from) return LEVELS[i]; return LEVELS[0]; }
  /* قواعد الاعتماد (الإصدار الثاني، ص9؛ السياسات ص22–23). المجال 3 = نواتج التعلم؛ المجالات 1 و2 و4 هي «الثلاثة الأخرى». */
  function accreditation(d) {
    var L = {}; [1, 2, 3, 4].forEach(function (k) { L[k] = levelOf(d && d[k]); });
    if ([1, 2, 3, 4].some(function (k) { return !L[k]; })) return null;
    var why = [], prep = function (k) { return L[k].k === 'prep'; };
    var others = [1, 2, 4].filter(prep);
    if (prep(3)) why.push('«التهيئة» في نواتج التعلم');
    if (others.length >= 2) why.push('«التهيئة» في ' + others.length + ' من المجالات الثلاثة الأخرى');
    if (why.length) return { k: 'none', n: 'غير معتمد', why: why, L: L };
    var allProg = [1, 2, 3, 4].every(function (k) { return L[k].from >= 75; });
    return allProg ? { k: 'full', n: 'اعتماد كامل', why: ['«التقدم» فأعلى في جميع المجالات'], L: L }
                   : { k: 'cond', n: 'اعتماد مشروط', why: ['ما عدا شروط الاعتماد الكامل وعدم الاعتماد'], L: L };
  }
  window.ETEC_REF = {
    asof: '2026-11-10',
    baseline: 'الإصدار الثاني 2026 من وثيقة معايير التقويم والتصنيف والاعتماد المدرسي',
    counts: { domains: 4, criteria: 11, indicatorsPrivate: 52, indicatorsPublic: 49, tools: 12 },
    toolLabels: TOOL_LABELS, levels: LEVELS, levelOf: levelOf, accreditation: accreditation,
    toolsMap: {
    "1-1-1-1": ["survey_teacher", "docs", "interviews"],
    "1-1-1-2": ["survey_teacher", "docs", "interviews"],
    "1-2-1-1": ["survey_learner", "survey_family", "docs", "interviews"],
    "1-2-1-2": ["survey_teacher", "docs", "interviews"],
    "1-2-1-3": ["survey_teacher", "survey_learner", "survey_family", "docs", "interviews"],
    "1-2-1-4": ["survey_learner", "survey_family", "docs", "interviews"],
    "1-2-1-5": ["survey_teacher", "survey_learner", "survey_family", "docs"],
    "1-3-1-1": ["survey_teacher", "docs", "interviews"],
    "1-3-1-2": ["survey_family", "docs", "interviews"],
    "1-3-1-3": ["survey_teacher", "docs", "interviews"],
    "1-4-1-1": ["survey_teacher", "docs", "interviews"],
    "1-4-1-2": ["survey_teacher", "docs", "interviews"],
    "1-4-1-3": ["docs", "interviews"],
    "1-4-1-4": ["survey_teacher", "docs", "licenses"],
    "1-4-1-5": ["survey_teacher", "docs", "interviews"],
    "1-4-1-6": ["survey_teacher", "docs"],
    "1-4-1-7": ["survey_teacher", "docs", "interviews"],
    "1-5-1-1": ["survey_learner", "survey_family", "docs", "interviews"],
    "1-5-1-2": ["survey_teacher", "survey_learner", "survey_family", "docs", "interviews"],
    "2-1-1-1": ["survey_learner", "obs_class", "interviews"],
    "2-1-1-2": ["survey_family", "docs", "obs_class", "interviews"],
    "2-1-1-3": ["survey_learner", "obs_class", "interviews"],
    "2-1-1-4": ["survey_teacher", "survey_learner", "survey_family", "obs_class", "interviews"],
    "2-1-1-5": ["survey_learner", "survey_family", "obs_class", "interviews"],
    "2-1-1-6": ["survey_learner", "survey_family", "docs", "obs_class", "interviews"],
    "2-1-1-7": ["survey_learner", "survey_family", "docs", "obs_class", "interviews"],
    "2-1-1-8": ["survey_learner", "survey_family", "obs_class", "interviews"],
    "2-1-1-9": ["survey_learner", "survey_family", "obs_class", "interviews"],
    "2-2-1-1": ["survey_learner", "survey_family", "docs", "obs_class"],
    "2-2-1-2": ["survey_learner", "survey_family", "docs", "obs_class"],
    "2-2-1-3": ["survey_teacher", "docs", "interviews"],
    "2-2-1-4": ["survey_learner", "survey_family", "docs", "interviews"],
    "3-1-1-1": ["natl_tests", "survey_assoc"],
    "3-1-1-2": ["natl_tests", "survey_assoc"],
    "3-1-1-3": ["natl_tests", "survey_assoc"],
    "3-1-1-4": ["natl_tests", "survey_assoc"],
    "3-1-1-5": ["natl_tests", "survey_assoc"],
    "3-1-1-6": ["natl_tests", "survey_assoc"],
    "3-2-1-1": ["survey_teacher", "survey_learner", "survey_family", "interviews"],
    "3-2-1-2": ["survey_teacher", "survey_learner", "survey_family", "interviews"],
    "3-2-1-3": ["survey_teacher", "survey_learner", "survey_family", "interviews"],
    "3-2-1-4": ["survey_teacher", "survey_learner", "survey_family", "docs"],
    "3-2-1-5": ["survey_teacher", "docs", "interviews"],
    "3-2-1-6": ["survey_teacher", "survey_learner", "survey_family", "interviews"],
    "3-2-1-7": ["survey_teacher", "survey_learner", "survey_family", "interviews"],
    "4-1-1-1": ["docs", "obs_env"],
    "4-1-1-2": ["survey_teacher", "obs_env"],
    "4-1-1-3": ["survey_teacher", "survey_learner", "obs_env"],
    "4-1-1-4": ["obs_env"],
    "4-2-1-1": ["survey_family", "docs", "obs_env"],
    "4-2-1-2": ["survey_teacher", "docs", "obs_env"],
    "4-2-1-3": ["survey_teacher", "survey_learner", "obs_env"]
    },
    sampling: {
      surveys: [
        { t: 'استبانة المتعلم', lt100: '50%', mid: '40%', gt300: '30%' },
        { t: 'استبانة المعلم', lt100: '70%', mid: '60%', gt300: '50%' },
        { t: 'استبانة الأسرة', lt100: '25%', mid: '15%', gt300: '10%' }
      ],
      surveyNote: 'الحد الأدنى للتعبئة بحسب عدد المستجيبين: أقل من 100 | من 100 إلى 300 | أكثر من 300 (الدليل الإجرائي ص15)',
      observations: 'نماذج الملاحظة الصفية: 15 على الأقل في المدرسة المستقلة، وتُضاعف مع كل مرحلة؛ والجدول يبلغ 17 لتشمل اللغة الإنجليزية في المدارس العالمية (الدليل الإجرائي ص17)'
    },
    team: [
      { s: 'الدليل الإجرائي ص11', v: 'مدير المدرسة رئيساً مع أربعة معلمين، وفريق مستقل لكل مرحلة' },
      { s: 'دليل الخدمات الإلكترونية ص18', v: 'إضافة 4 أعضاء على الأقل، ولا حذف إذا نزل العدد دون 3' },
      { s: 'دليل بوابة مدير المدرسة ص12', v: '3 أعضاء على الأقل' }
    ]
  };
})();
