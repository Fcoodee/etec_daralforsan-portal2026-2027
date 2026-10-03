#!/usr/bin/env node
/*
 * make_short_links.js — يولّد الروابط المختصرة الثابتة لرسائل البريد ويكتبها في portal-config.js
 * الاستعمال (يلزم Node 18+ واتصال بالإنترنت):
 *     node make_short_links.js portal-config.js
 * يختصر روابط المستودع (لوحة كل مجال ومرجع الهيئة) وروابط Drive الثابتة عبر is.gd (وv.gd عند الفشل)،
 * ثم يستبدل الكتلة بين  // SHORT-LINKS-BEGIN  و  // SHORT-LINKS-END  في portal-config.js. ارفع الملف بعدها إلى GitHub.
 * ⚠ الروابط المختصرة دائمة ولا تُعدَّل، وعناوينها تمر بخدمة خارجية.
 */
const fs = require('fs');
const cfgPath = process.argv[2] || 'portal-config.js';
let cfg = fs.readFileSync(cfgPath, 'utf8');
const pick = (name, d) => { const m = new RegExp('window\\.' + name + '\\s*=\\s*"([^"]*)"').exec(cfg); return m ? m[1] : d; };
const SITE = pick('ETEC_SITE_BASE', 'https://fcoodee.github.io/etec_daralforsan-portal2026-2027/').replace(/\/?$/, '/');
const REF = pick('ETEC_EVIDENCE_REF_URL', 'https://drive.google.com/drive/folders/19eBfs6wK7rZvje81ANWFTl_ORLAqK3v6?usp=sharing');
const PROJ = 'https://drive.google.com/drive/folders/1IDVvAtEyYMA_FZhua_vLDmw_z1cjSBdQ';
const urls = [1, 2, 3, 4].map(d => SITE + 'evidence-link.html?team=' + d).concat([SITE + 'records-sources.html', REF, PROJ]);
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function shorten(u) {
  for (const host of ['is.gd', 'v.gd']) {
    try {
      const r = await fetch('https://' + host + '/create.php?format=simple&url=' + encodeURIComponent(u));
      const t = (await r.text()).trim();
      if (r.ok && /^https:\/\/(is|v)\.gd\//.test(t)) return t;
      console.log('  ' + host + ' ردّ: ' + t.slice(0, 80));
    } catch (e) { console.log('  ' + host + ' تعذّر: ' + e.message); }
  }
  return null;
}
(async () => {
  const m = {}; let bad = 0;
  for (const u of urls) { process.stdout.write('→ ' + u.slice(0, 90) + '\n'); const s = await shorten(u); if (s) { m[u] = s; console.log('   ' + s); } else { bad++; console.log('   ✖ لم يُختصر'); } await sleep(1200); }
  const block = '// SHORT-LINKS-BEGIN\nwindow.ETEC_SHORT_LINKS = ' + JSON.stringify(m, null, 2) + ';\n// SHORT-LINKS-END';
  if (!/SHORT-LINKS-BEGIN[\s\S]*SHORT-LINKS-END/.test(cfg)) cfg += '\n' + block + '\n'; else cfg = cfg.replace(/\/\/ SHORT-LINKS-BEGIN[\s\S]*\/\/ SHORT-LINKS-END/, block);
  fs.writeFileSync(cfgPath, cfg);
  console.log('\nكُتب ' + Object.keys(m).length + ' رابطاً مختصراً في ' + cfgPath + (bad ? ' — وتعذّر ' + bad : '') + '. ارفع الملف إلى GitHub.');
})();
