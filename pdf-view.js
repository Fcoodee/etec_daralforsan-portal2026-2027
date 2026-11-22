/* v10.8.62: عارض PDF داخل الصفحة للأجهزة الذكية (أندرويد وiOS وiPadOS) — Chrome على أندرويد لا يعرض PDF داخل iframe فيُظهر بطاقة «Open».
   يرسم الصفحات على canvas بمكتبة PDF.js (vendor/pdfjs، رخصة Apache-2.0) ويُحمّل الصفحات كسولاً لتخفيف الذاكرة. سطح المكتب يبقى على العارض الأصلي للمتصفح. */
(function () {
  "use strict";
  var V = (document.currentScript && /[?&]v=([^&]+)/.exec(document.currentScript.src) || [0, "1"])[1], lib = null, cur = null;
  function needs() {
    var ua = navigator.userAgent || "";
    return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) || navigator.pdfViewerEnabled === false;
  }
  function load() {
    if (!lib) lib = import("./vendor/pdfjs/pdf.min.mjs?v=" + V).then(function (m) { m.GlobalWorkerOptions.workerSrc = new URL("vendor/pdfjs/pdf.worker.min.mjs?v=" + V, document.baseURI).href; return m; });
    return lib;
  }
  function clear() { if (!cur) return; try { cur.io && cur.io.disconnect(); cur.doc && cur.doc.destroy(); } catch (e) {} if (cur.box) cur.box.innerHTML = ""; cur = null; }
  function render(box, u8) {
    clear(); box.innerHTML = '<p class="pv-msg">جاري تجهيز صفحات الملف ...</p>';
    var st = cur = { box: box, zoom: 1, pages: [], io: null, doc: null, dead: false };
    return load().then(function (pdfjs) { return pdfjs.getDocument({ data: u8, isEvalSupported: false }).promise; }).then(function (doc) {
      if (cur !== st) { doc.destroy(); return; }
      st.doc = doc; box.innerHTML = "";
      var bar = document.createElement("div"); bar.className = "pv-bar";
      bar.innerHTML = '<button type="button" data-z="-1" aria-label="تصغير">−</button><span class="pv-n"></span><button type="button" data-z="1" aria-label="تكبير">+</button>';
      box.appendChild(bar);
      var holder = document.createElement("div"); holder.className = "pv-pages"; box.appendChild(holder);
      var n = bar.querySelector(".pv-n");
      return doc.getPage(1).then(function (p1) {
        var vp1 = p1.getViewport({ scale: 1 });
        function width() { return Math.max(200, (box.clientWidth - 16) * st.zoom); }
        for (var i = 1; i <= doc.numPages; i++) {
          var w = document.createElement("div"); w.className = "pv-pg"; w.dataset.p = i; holder.appendChild(w);
          st.pages.push({ el: w, done: false, busy: false });
        }
        function size() { var cw = width(), h = cw * vp1.height / vp1.width; st.pages.forEach(function (o) { o.el.style.width = cw + "px"; o.el.style.height = h + "px"; if (o.done) { o.done = false; o.el.innerHTML = ""; } }); }
        function draw(o, idx) {
          if (o.done || o.busy || st.dead || cur !== st) return; o.busy = true;
          doc.getPage(idx).then(function (pg) {
            var cw = width(), vp0 = pg.getViewport({ scale: 1 }), sc = cw / vp0.width, dpr = Math.min(window.devicePixelRatio || 1, 2.5), vp = pg.getViewport({ scale: sc * dpr });
            var cv = document.createElement("canvas"); cv.width = Math.floor(vp.width); cv.height = Math.floor(vp.height); cv.style.width = cw + "px"; cv.style.height = Math.floor(vp0.height * sc) + "px";
            return pg.render({ canvasContext: cv.getContext("2d"), viewport: vp }).promise.then(function () { if (cur !== st) return; o.el.innerHTML = ""; o.el.style.height = cv.style.height; o.el.appendChild(cv); o.done = true; });
          }).catch(function () {}).then(function () { o.busy = false; });
        }
        function observe() {
          if (st.io) st.io.disconnect();
          st.io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { var i = +e.target.dataset.p; draw(st.pages[i - 1], i); } }); }, { root: box, rootMargin: "700px 0px" });
          st.pages.forEach(function (o) { st.io.observe(o.el); });
        }
        size(); observe(); n.textContent = "1 / " + doc.numPages;
        function cnt() { var top = box.getBoundingClientRect().top + bar.offsetHeight + 4, k = 1; for (var q = 0; q < st.pages.length; q++) { if (st.pages[q].el.getBoundingClientRect().bottom > top + 40) { k = q + 1; break; } } n.textContent = k + " / " + doc.numPages; }
        box.addEventListener("scroll", function () { if (!cnt.t) cnt.t = setTimeout(function () { cnt.t = 0; cnt(); }, 120); }, { passive: true });
        bar.addEventListener("click", function (e) { var b = e.target.closest("[data-z]"); if (!b) return; st.zoom = Math.max(1, Math.min(3, st.zoom + (+b.dataset.z) * 0.5)); size(); observe(); });
      });
    });
  }
  window.PortalPDF = { needs: needs, render: render, clear: clear };
})();
