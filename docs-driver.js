/* docs-driver.js — سواقة الوثائق والسجلات (docs_driver) — v1.0
   تقرأ جدول التعبئة في سجل Word (الجدول الثاني في الوثيقة) وتعدّل صفوفه فقط، دون المساس بالترويسة أو شاهد المصدر أو الاعتماد.
   لا تُنشئ توقيعاً ولا تعتمد؛ الاعتماد يبقى للمشرف عبر أزرار المراجعة. المنطق هنا نقي (بلا DOM الصفحة) ليُختبر منفصلاً. */
(function (root) {
  "use strict";
  var W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main";
  var XMLNS = "http://www.w3.org/XML/1998/namespace";
  function ctx(o) { o = o || {}; return { DP: o.DOMParser || root.DOMParser, XS: o.XMLSerializer || root.XMLSerializer }; }
  function kids(el, name) { var r = [], c = el.firstChild; while (c) { if (c.nodeType === 1 && c.localName === name && c.namespaceURI === W) r.push(c); c = c.nextSibling; } return r; }
  function all(el, name) { return Array.prototype.slice.call(el.getElementsByTagNameNS(W, name)); }
  function text(el) { return all(el, "t").map(function (t) { return t.textContent; }).join(""); }
  function setCell(tc, val, doc) {
    var ps = kids(tc, "p"), p = ps[0];
    if (!p) { p = doc.createElementNS(W, "w:p"); tc.appendChild(p); }
    for (var i = 1; i < ps.length; i++) tc.removeChild(ps[i]);
    var runs = kids(p, "r"), r = runs[0];
    if (!r) { r = doc.createElementNS(W, "w:r"); p.appendChild(r); }
    for (var j = 1; j < runs.length; j++) p.removeChild(runs[j]);
    var ts = kids(r, "t"), t = ts[0];
    if (!t) { t = doc.createElementNS(W, "w:t"); r.appendChild(t); }
    for (var k = 1; k < ts.length; k++) r.removeChild(ts[k]);
    t.setAttributeNS(XMLNS, "xml:space", "preserve"); t.textContent = val == null ? "" : String(val);
  }
  /* يعيد { header:[...], rows:[[...]], tableIndex } من document.xml */
  function read(xml, o) {
    var c = ctx(o), doc = new c.DP().parseFromString(xml, "application/xml"), tbls = all(doc, "tbl");
    if (tbls.length < 2) throw new Error("لم يُعثر على جدول التعبئة في هذا السجل.");
    var trs = kids(tbls[1], "tr"); if (trs.length < 2) throw new Error("جدول التعبئة بلا صفوف.");
    var cells = function (tr) { return kids(tr, "tc").map(function (tc) { return text(tc); }); };
    return { header: cells(trs[0]), rows: trs.slice(1).map(cells) };
  }
  /* يكتب rows في جدول التعبئة؛ note (اختياري) يستبدل فقرة «No Diploma Section source…» إن وُجدت */
  function apply(xml, rows, note, o) {
    var c = ctx(o), doc = new c.DP().parseFromString(xml, "application/xml"), tbls = all(doc, "tbl");
    if (tbls.length < 2) throw new Error("لم يُعثر على جدول التعبئة.");
    var tbl = tbls[1], trs = kids(tbl, "tr"), tpl = trs[trs.length - 1], n = trs[0] ? kids(trs[0], "tc").length : 0;
    if (!rows.length) throw new Error("لا صفوف للكتابة.");
    for (var i = 1; i < trs.length; i++) tbl.removeChild(trs[i]);
    rows.forEach(function (vals) {
      var tr = tpl.cloneNode(true), tcs = kids(tr, "tc");
      for (var k = 0; k < n; k++) setCell(tcs[k], vals[k], doc);
      tbl.appendChild(tr);
    });
    if (note && String(note).trim()) {
      all(doc, "p").some(function (p) { if (/^\s*No Diploma Section source for this register/.test(text(p))) { setCell(p.parentNode && p.parentNode.localName === "tc" ? p.parentNode : p, "", doc); var rs = kids(p, "r"); if (rs[0]) { var ts = kids(rs[0], "t"); if (ts[0]) { ts[0].setAttributeNS(XMLNS, "xml:space", "preserve"); ts[0].textContent = String(note).trim(); } } return true; } return false; });
    }
    var out = new c.XS().serializeToString(doc);
    return /^<\?xml/.test(out) ? out : '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n' + out;
  }
  root.DocsCore = { read: read, apply: apply };
  if (typeof module !== "undefined" && module.exports) module.exports = root.DocsCore;
})(typeof window !== "undefined" ? window : globalThis);
