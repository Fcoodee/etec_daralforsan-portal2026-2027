/* fx.js — حركات شعار الدبلوما (v10.8.0): (1) شعار وحده بحركات بهلوانية من بدء تحميل صفحة الهبوط، بلا صندوق ولا خلفية
   (2) شعار صغير يرافق كل ضغطة ماوس/لمس لثوانٍ. لا يعتمد على أي ملف آخر، ويحترم «تقليل الحركة». */
(function () {
  "use strict";
  if (window.__etecFx) return; window.__etecFx = 1;
  var de = document.documentElement, LOGO = "logo0.png";
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion:reduce)").matches;
  var css = "#fxSplash{position:fixed;inset:0;z-index:2147483000;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;background:transparent;transition:opacity .45s ease}" +
    "#fxSplash.out{opacity:0}#fxSplash .lg{width:150px;height:150px;object-fit:contain;filter:drop-shadow(0 10px 8px rgba(15,23,42,.28));will-change:transform}" +
    "#fxSplash .tx{margin-top:10px;font:800 16px/1.5 'Tajawal','Segoe UI',Tahoma,sans-serif;color:#123a63;text-shadow:0 0 6px #fff,0 0 12px #fff,0 0 18px #fff}" +
    ".fxClick{position:fixed;z-index:2147483001;width:64px;height:64px;margin:-32px 0 0 -32px;object-fit:contain;pointer-events:none;opacity:0;filter:drop-shadow(0 6px 5px rgba(15,23,42,.3));will-change:transform,opacity}";
  var st = document.createElement("style"); st.textContent = css; (document.head || de).appendChild(st);
  /* حركة بهلوانية: قفز + دوران + قلب (نفس لغة شاشة التحديث) */
  var ACRO = [
    { transform: "translateY(0) rotate(0) scale(1)", offset: 0 },
    { transform: "translateY(10px) scale(1.12,.84)", offset: .08 },
    { transform: "translateY(-70px) rotate(360deg) scale(1)", offset: .18 },
    { transform: "translateY(0) rotate(360deg) scale(1.1,.88)", offset: .26 },
    { transform: "translateY(0) rotate(360deg) scale(1)", offset: .34 },
    { transform: "translateY(-44px) rotateY(360deg)", offset: .46 },
    { transform: "translateY(0) rotateY(360deg) scale(1.08,.9)", offset: .54 },
    { transform: "translateX(-38px) translateY(-20px) rotate(-360deg)", offset: .62 },
    { transform: "translateX(38px) translateY(-20px) rotate(360deg)", offset: .72 },
    { transform: "translateX(0) translateY(0) rotate(720deg) scale(1)", offset: .8 },
    { transform: "translateY(-58px) rotateX(360deg) scale(.92)", offset: .88 },
    { transform: "translateY(0) rotateX(360deg) scale(1.06,.9)", offset: .96 },
    { transform: "translateY(0) rotate(0) scale(1)", offset: 1 }
  ];
  var isLanding = /(^|\/)(index\.html)?$/.test(location.pathname) || /\/index\.html$/.test(location.pathname);
  /* (1) شاشة البداية: على صفحة الهبوط فقط، من أول لحظة تحميل */
  if (isLanding && !reduce) {
    var sp = document.createElement("div"); sp.id = "fxSplash"; sp.setAttribute("role", "status"); sp.setAttribute("aria-label", "الرجاء الانتظار");
    sp.innerHTML = '<img class="lg" src="' + LOGO + '" alt="" aria-hidden="true"><div class="tx">الرجاء الانتظار ...</div>';
    de.appendChild(sp);
    var lg = sp.querySelector(".lg"), t0 = Date.now(), gone = false;
    try { lg.animate(ACRO, { duration: 2800, iterations: Infinity, easing: "cubic-bezier(.45,.05,.3,1)" }); } catch (e) {}
    var hide = function () { if (gone) return; gone = true; sp.classList.add("out"); setTimeout(function () { if (sp.parentNode) sp.parentNode.removeChild(sp); }, 500); };
    var ready = function () { var w = Math.max(0, 2600 - (Date.now() - t0)); setTimeout(hide, w); };
    if (document.readyState === "complete") ready(); else window.addEventListener("load", ready);
    setTimeout(hide, 6000); /* سقف أمان */
  }
  /* (2) شعار يرافق كل ضغطة: يظهر مع حركة لثوانٍ ثم يتلاشى */
  var live = 0;
  function pop(x, y) {
    if (reduce || live >= 4) return; live++;
    var im = document.createElement("img"); im.className = "fxClick"; im.src = LOGO; im.alt = ""; im.setAttribute("aria-hidden", "true");
    im.style.left = x + "px"; im.style.top = y + "px"; de.appendChild(im);
    var a;
    try {
      a = im.animate([
        { opacity: 0, transform: "translateY(10px) scale(.3) rotate(0)", offset: 0 },
        { opacity: 1, transform: "translateY(-30px) scale(1.15) rotate(180deg)", offset: .14 },
        { opacity: 1, transform: "translateY(-12px) scale(1) rotateY(360deg)", offset: .38 },
        { opacity: 1, transform: "translateY(-46px) scale(1.05) rotate(360deg)", offset: .6 },
        { opacity: 1, transform: "translateY(-14px) scale(1) rotateX(360deg)", offset: .82 },
        { opacity: 0, transform: "translateY(-60px) scale(.8) rotate(540deg)", offset: 1 }
      ], { duration: 2400, easing: "ease-in-out", fill: "forwards" });
    } catch (e) {}
    var done = function () { live--; if (im.parentNode) im.parentNode.removeChild(im); };
    if (a) a.onfinish = done; else setTimeout(done, 2400);
  }
  window.addEventListener("pointerdown", function (e) { if (e.isPrimary === false) return; pop(e.clientX, e.clientY); }, true);
})();
