# مسح شواهد الابتدائية: مجال «البيئة المدرسية » (Drive folder 1s9SBvBRnl0129LPU7vlbGWRiyd5vtTHo)

Method: Google Drive connector only (`search_files`, `parentId = '<id>'`, pageSize 100, excludeContentSnippets, all nextPageToken pages followed until empty). Read-only; no file contents opened. Crawl date: 2026-11-16. Source for every figure below: Drive connector listing of the folder IDs given in the tables.

## 1. Inventory per indicator (counts per indicator folder, including subfolders)

### Takeaway
All 2 criteria and 7 indicators exist as folders and none is empty. Total = 19 folders (2 criteria + 7 indicators + 10 subfolders) and 134 files (61 PDF, 64 JPEG, 7 DOCX, 2 XLSX, 0 Google-native, 0 other). 64 of the 134 files are images, and they sit in only two indicators (4-1-1-3 and 4-1-1-4).

### Cited Findings (summable table; Drive connector listings)

Root «البيئة المدرسية » (1s9SBvBRnl0129LPU7vlbGWRiyd5vtTHo) has exactly 2 children, both folders, 0 loose files:
- «المبنى المدرسي» (criterion 4-1) 11_lgZZmELruiheL29n8n30UMMiKzKqw7, 4 indicator folders, 0 loose files, modified 2026-11-08
- «الأمن والسلامة» (criterion 4-2) 1O5KBz0omnhNdkoLebDQQC5CmwhfchMhG, 3 indicator folders, 0 loose files, modified 2026-11-08

| indicator | folder path (under root) | folder ID | total files | direct files | files in subfolders | by type (PDF / Word / Excel / images / Google-native / other) |
|---|---|---|---|---|---|---|
| 4-1-1-1 | المبنى المدرسي / (4-1-1-1) توفر المدرسة مبنى تعليميًا يستوفي المواصفات والاشتراطات المعتمدة من حيث النوع والخدمات المساندة. | 1OmySLY9oUqCFP57_jx5YINCeesl2Uthy | 8 | 8 | 0 | 6 / 1 / 1 / 0 / 0 / 0 |
| 4-1-1-2 | المبنى المدرسي / (4-1-1-2) تنظيم مبنى المدرسة ملائم لعدد المتعلمين وخصائص المرحلة العمرية، ومنهم ذوو الإعاقة. | 1noyRqLebMUErGuLutWUJtcdBTvoIMZQV | 7 | 7 | 0 | 6 / 1 / 0 / 0 / 0 / 0 |
| 4-1-1-3 | المبنى المدرسي / (4-1-1-3) تتوافر فصول ومعامل ملائمة للعملية التعليمية تلبي احتياجات المتعلمين، ومنهم ذوو الإعاقة. | 1SKCp6srkPDVIWzXMGbWP-NhB3LvBJsi9 | 47 | 5 | 42 (3 subfolders) | 14 / 1 / 0 / 32 / 0 / 0 |
| 4-1-1-4 | المبنى المدرسي / (4-1-1-4) تلبي المرافق والتجهيزات والخدمات المساندة احتياجات المتعلمين، ومنهم ذوو الإعاقة. | 1-tgjuKrZvFsyXmCv9trMS2M59sqZRGTv | 46 | 6 | 40 (2 subfolders) | 13 / 1 / 0 / 32 / 0 / 0 |
| 4-2-1-1 | الأمن والسلامة / (4-2-1-1) تتوافر في مبنى المدرسة ومرافقها جميع متطلبات الأمن والسلامة. | 1zNUs-4vJtyOBavzy-YM0pFq7vVkf-OMm | 11 | 6 | 5 (3 subfolders) | 10 / 1 / 0 / 0 / 0 / 0 |
| 4-2-1-2 | الأمن والسلامة / (4-2-1-2) تتابع المدرسة صيانة المبنى وجميع مرافقه وتجهيزاته بشكل دوري. | 1jXTtqthRdqhZjpXC995W4qMFvV-GChtD | 8 | 5 | 3 (1 subfolder) | 6 / 1 / 1 / 0 / 0 / 0 |
| 4-2-1-3 | الأمن والسلامة / (4-2-1-3) تتابع المدرسة نظافة المبنى المدرسي وجميع مرافقه بشكل مستمر. | 1rv-hVQAj3ogKlPbLxjR686LVAyIx_b75 | 7 | 5 | 2 (1 subfolder) | 6 / 1 / 0 / 0 / 0 / 0 |
| **TOTAL** | | | **134** | 42 | 92 | **61 / 7 / 2 / 64 / 0 / 0** |

Sums: criterion 4-1 = 8+7+47+46 = 108 files; criterion 4-2 = 11+8+7 = 26 files; 108+26 = 134. Type check: 61+7+2+64 = 134.

### Gaps
- None for enumeration: every listing ended with an empty page (no nextPageToken). Fully-empty pages were returned for first-level continuation tokens, meaning no further children.
- Per-file Word/PDF page content was not opened (out of scope).

## 2. File titles and modified dates, per indicator folder

### Takeaway
Each indicator holds an official cover document in two copies (the .docx and a PDF of it) plus, since 2026-11-14, a numbered series of PDF evidence files named `4-x-x-x (n) - ...`. Older evidence is unnumbered in subfolders.

### Cited Findings
Dates are modifiedTime (UTC date) from the connector. "created 11-14" means createdTime 2026-11-14 (numbered files were created 2026-11-14 with modifiedTime 2026-11-12).

**4-1-1-1 (8 files; 1OmySLY9oUqCFP57_jx5YINCeesl2Uthy)**
- خطة الصيانة .xlsx (Excel, 18,873 B) 2026-10-26
- (4-1-1-1) توفر المدرسة مبنى تعليميًا يستوفي المواصفات والاشتراطات المعتمدة من حيث النوع والخدمات المساندة..docx (Word) 2026-10-26
- (4-1-1-1) ...المساندة..docx.pdf (PDF) 2026-10-26
- رخصة البلدية حتى 07-07-1448هـــــــ.pdf 2026-10-26
- شهادة الدفاع المدني لكامل المدارس 2025.pdf 2026-10-26
- 4-1-1-1 (1) - ملف مطابقة المبنى والتراخيص.pdf 2026-11-12
- 4-1-1-1 (2) - لجنة جاهزية المبنى وقائمة التحقق.pdf 2026-11-12
- 4-1-1-1 (3) - خطة الصيانة ونظام البلاغات.pdf 2026-11-12

**4-1-1-2 (7 files; 1noyRqLebMUErGuLutWUJtcdBTvoIMZQV)**
- (4-1-1-2) تنظيم مبنى المدرسة ملائم لعدد المتعلمين وخصائص المرحلة العمرية، ومنهم ذوو الإعاقة..docx (Word, 4.1 MB) 2026-11-08
- (4-1-1-2) ...ذوو الإعاقة..pdf (PDF) 2026-11-08
- التقرير الهندسي والطاقة الاستيعابية للمبنى .pdf (1,190,277 B) 2026-10-26
- المخططات المعتمدة حريق وانذار.pdf (1,724,520 B) 2026-10-27
- 4-1-1-2 (1) - دراسة الطاقة الاستيعابية وكثافة الفصول.pdf 2026-11-12
- 4-1-1-2 (2) - توزيع الفصول وفق المرحلة العمرية.pdf 2026-11-12
- 4-1-1-2 (3) - تنظيم الفصول والأثاث وصيانتها.pdf 2026-11-12

**4-1-1-3 (47 files; 1SKCp6srkPDVIWzXMGbWP-NhB3LvBJsi9)**
Direct (5):
- (4-1-1-3) تتوافر فصول ومعامل ملائمة للعملية التعليمية تلبي احتياجات المتعلمين، ومنهم ذوو الإعاقة..docx 2026-10-28
- (4-1-1-3) ...ذوو الإعاقة.pdf 2026-10-28
- 4-1-1-3 (1) - واقع الفصول والمعامل.pdf 2026-11-12
- 4-1-1-3 (2) - تجهيز الفصول ومصادر التعلم.pdf 2026-11-12
- 4-1-1-3 (3) - تهيئة الفصول لذوي الإعاقة.pdf 2026-11-12
Subfolder «يلبي المبنى احتياجات ذوي الإعاقة » (1Ho6XcNlQIh1BwDOA1azgKf9HO7L9vCCv), 8 PDF, modified 2026-10-28:
- تقرير مصور عن الامن والسلامة توفير طفايات الحريق لسلامة الطلاب.pdf
- شاهد عن مخارج.pdf
- تقرير مصور عن الامن والسلامة توفير مخارج الطوارئ لسلامة الطلاب.pdf
- تقرير مصور عن الامن والسلامة كواشف) الحريق (والدخان).pdf
- تقرير مصور عن الامن والسلامة توفير مصعد لذوي الهمم.pdf
- تقرير مصور عن الامن والسلامة توفير كاميرات مراقبة في كل مكان لسلامة الطلاب.pdf
- تقرير مصور عن الامن والسلامة توفير ممر عربات الكراسي المتحركة لسلامة الطلاب.pdf
- تقرير مصور عن الامن والسلامة فرش الأرض بالفلين لسلامة الطلاب.pdf
Subfolder «صور  المبنى من الداخل والتجهيزات» (1zij-SLW6CgsqgTfnBrhOruuixlkYux6s), 32 JPEG, all modified 2026-10-28: `WhatsApp Image 2026-10-28 at 7.47.11 AM.jpeg` plus `(1)` through `(31)` (all 32 indices present, none missing).
Subfolder «التقرير الهندسي والطاقة الاستيعابية للمبنى » (1iKFd8JpcmGIGBrCoXRvTq5CecaGr7bIy), 2 PDF:
- اعداد الطلاب داخل الفصول.pdf (2.66 MB) 2026-11-14
- التقرير الهندسي والطاقة الاستيعابية للمبنى .pdf (1,190,277 B) 2026-10-27

**4-1-1-4 (46 files; 1-tgjuKrZvFsyXmCv9trMS2M59sqZRGTv)**
Direct (6):
- (4-1-1-4) تلبي المرافق والتجهيزات والخدمات المساندة احتياجات المتعلمين، ومنهم ذوو الإعاقة..docx 2026-10-28
- (4-1-1-4) ...الإعاقة..docx.pdf 2026-10-28
- تجهيزات المعمل.pdf 2026-10-27
- 4-1-1-4 (1) - المرافق المساندة وتيسير الحركة لذوي الإعاقة.pdf 2026-11-12
- 4-1-1-4 (2) - السلامة في المرافق والخدمات المساندة.pdf 2026-11-12
- 4-1-1-4 (3) - الصيانة الدورية والمقصف والإرشاد الصحي.pdf 2026-11-12
Subfolder «المبنى يلبي احتياجات ذوي الإعاقة » (17IxrfkgKfu6VvpLloMgQO5tzwZldIqEI), 8 PDF, modified 2026-10-28: same 8 titles as the 4-1-1-3 subfolder «يلبي المبنى احتياجات ذوي الإعاقة » (see duplicates).
Subfolder «صورالمبنى » (1rBKllDlzTSXOrZ7CgzsWRWtDUdm_8CEP), 32 JPEG, every file titled exactly `صور المبنى.jpeg`, modified 2026-11-12 (04:13 to 04:18).

**4-2-1-1 (11 files; 1zNUs-4vJtyOBavzy-YM0pFq7vVkf-OMm)**
Direct (6):
- (4-2-1-1) تتوافر في مبنى المدرسة ومرافقها جميع متطلبات الأمن والسلامة..docx 2026-10-27
- (4-2-1-1) ...الأمن والسلامة...pdf (note: three dots before .pdf) 2026-10-26
- 4-2-1-1 (1) - الترخيص والمخططات المعتمدة لأنظمة الحماية من الحريق.pdf 2026-11-12
- 4-2-1-1 (2) - خطة الإخلاء وتجربة الإخلاء الافتراضية.pdf 2026-11-12
- 4-2-1-1 (3) - السلامة الصحية والبيئة المدرسية والمقصف.pdf 2026-11-12
- 4-2-1-1 (4) - مصفوفة تحقق متطلبات الأمن والسلامة.pdf 2026-11-12
Subfolder «خطط الاخلاء » (1JApz9udT1ndwCBN6-TNVnwbhyTyb60lY), 3 PDF:
- المخططات المعتمدة حريق وانذار.pdf (2,434,143 B) 2026-11-14
- خطة الإخلاء بتاريخ 6-10.pdf 2026-11-14
- دليل_اعمال_منسقي_الامن_والسلامة_والمرافق_للعام_1447هـ دار الفرسان(2).pdf 2026-11-14
Subfolder «تراخيص السلامة» (1dbYu1Ye5hOS1zjsVLyvM69bMXl9kNblN), 1 PDF: شهادة الدفاع المدني لكامل المدارس 2025.pdf 2026-10-20
Subfolder «سجل الموجه الصحي » (1rs3da1xtAwWZfuKjpRMXN9Q29WnP04bR), 1 PDF: سجل الموجه الصحي.pdf (3.15 MB) 2026-11-14

**4-2-1-2 (8 files; 1jXTtqthRdqhZjpXC995W4qMFvV-GChtD)**
Direct (5):
- (4-2-1-2) تتابع المدرسة صيانة المبنى وجميع مرافقه وتجهيزاته بشكل دوري..docx 2026-10-27
- (4-2-1-2) ...بشكل دوري..docx.pdf 2026-10-26
- 4-2-1-2 (1) - خطة الصيانة الدورية وحصر الاحتياجات.pdf 2026-11-12
- 4-2-1-2 (2) - تنفيذ الصيانة ومتابعة البلاغات.pdf 2026-11-12
- 4-2-1-2 (3) - سجلات الصيانة والتوعية والتقويم.pdf 2026-11-12
Subfolder «خطط  وسجلات الصيانة » (1zyxljcBGptrP2auTmltZR-NCvTRcBMGw), 3 files, modified 2026-10-26:
- خطة 2026.xlsx (Excel, 18,873 B)
- تقرير_الصيانة_والإنجازات_النصف_شهري.pdf
- خطة صيانة شهر 9.pdf

**4-2-1-3 (7 files; 1rv-hVQAj3ogKlPbLxjR686LVAyIx_b75)**
Direct (5):
- (4-2-1-3) تتابع المدرسة نظافة المبنى المدرسي وجميع مرافقه بشكل مستمر..docx 2026-10-27
- (4-2-1-3) ...بشكل مستمر..pdf 2026-10-26
- 4-2-1-3 (1) - كوادر النظافة وتوزيع المهام.pdf 2026-11-12
- 4-2-1-3 (2) - أدوات النظافة والإشراف الميداني.pdf 2026-11-12
- 4-2-1-3 (3) - التوعية بالنظافة وسلامة البيئة الصحية.pdf 2026-11-12
Subfolder «جدول اعمال النظافة » (1ZHKG-ACdtx8Fv2kMR0ibDAsV_kN9hi2_), 2 PDF, modified 2026-10-26:
- جدول عمل شهر سبتمبر.pdf
- جدول_عمال_شهر_أكتوبر.pdf

### Inferences
- The numbered `4-x-x-x (n) - ...` PDFs (all created 2026-11-14, modified 2026-11-12) look like a newer, structured evidence series added across all 7 indicators; each indicator has 3 numbered files except 4-2-1-1, which has 4 (total 22 numbered files). Folders therefore mix an older ad-hoc layer (subfolders, unnumbered files) and the newer numbered layer.
- The Word/PDF pair `(4-x-x-x) <indicator text>` in every indicator folder is the indicator's cover/description document, not an independent piece of evidence.

### Gaps
- Contents were not opened, so whether the numbered PDFs consolidate or replace the older unnumbered files is unknown.

## 3. Naming consistency, loose files, duplicates, empties, missing indicators

### Takeaway
No loose files in the criterion folders, no empty indicator folders, and no missing indicators (7 of 7). Main issues are inconsistent file/folder naming and substantial exact duplication (the same 8 PDFs and the same 32 images are stored twice).

### Cited Findings
- Expected 2 criteria / 7 indicators: found 2 criterion folders and 7 indicator folders (4-1-1-1 to 4-1-1-4, 4-2-1-1 to 4-2-1-3). All indicator folders contain at least 5 files. Empty indicator folders: 0. Indicators with no folder: 0. Loose files directly in the root or in the two criterion folders: 0. (Website expectation of 2 criteria / 7 indicators is as supplied in the assignment; not re-verified here.)
- Criterion folders carry no codes in their names («المبنى المدرسي», «الأمن والسلامة»), while indicator folders are named `(4-x-x-x) <full indicator text>` with the code in parentheses.
- Trailing/odd spaces and typos in folder names: root «البيئة المدرسية » (trailing space), «يلبي المبنى احتياجات ذوي الإعاقة » vs «المبنى يلبي احتياجات ذوي الإعاقة » (word order differs between 4-1-1-3 and 4-1-1-4), «صور  المبنى من الداخل والتجهيزات» (double space), «صورالمبنى » (missing space), «خطط  وسجلات الصيانة » (double space), «خطط الاخلاء » (no hamza), «التقرير الهندسي والطاقة الاستيعابية للمبنى » (trailing space).
- File naming has four styles: (a) `(4-x-x-x) <text>..docx` and `...pdf` with doubled/tripled dots and `.docx.pdf` double extensions (4-1-1-1, 4-1-1-4, 4-2-1-2); (b) `4-x-x-x (n) - <title>.pdf` numbered series; (c) free Arabic titles with no indicator code (e.g. تجهيزات المعمل.pdf, رخصة البلدية...); (d) camera/phone defaults (`WhatsApp Image 2026-10-28 at 7.47.11 AM (n).jpeg`, 32 files) and 32 files all named `صور المبنى.jpeg`. Also malformed title «كواشف) الحريق (والدخان)» (misplaced parenthesis).
- Exact duplicates (same file size, per connector listing):
  - 4-1-1-3 subfolder «يلبي المبنى احتياجات ذوي الإعاقة » and 4-1-1-4 subfolder «المبنى يلبي احتياجات ذوي الإعاقة »: the same 8 PDFs, identical sizes (e.g. 349,158; 335,551; 278,665; 329,567; 310,090; 358,269; 323,380; 1,066,701 B) and identical modified timestamps = 8 duplicate pairs (16 files).
  - 4-1-1-3 «صور المبنى من الداخل والتجهيزات» (32 WhatsApp JPEGs) and 4-1-1-4 «صورالمبنى » (32 files named `صور المبنى.jpeg`): matching size sets (e.g. 368,311; 273,329; 210,479; 373,443; 246,674; 698,120 B) = 32 duplicate pairs (64 files).
  - التقرير الهندسي والطاقة الاستيعابية للمبنى .pdf (1,190,277 B) in both 4-1-1-2 (direct) and 4-1-1-3 (subfolder 1iKF...) = 1 duplicate pair.
  - شهادة الدفاع المدني لكامل المدارس 2025.pdf (365,092 B) in 4-1-1-1 (direct) and 4-2-1-1 / «تراخيص السلامة» = 1 duplicate pair.
  - خطة الصيانة .xlsx (4-1-1-1) and خطة 2026.xlsx (4-2-1-2 subfolder): both 18,873 B, different names = probable duplicate (not confirmed by content).
  - Different-size same-title: المخططات المعتمدة حريق وانذار.pdf is 1,724,520 B in 4-1-1-2 vs 2,434,143 B in 4-2-1-1 «خطط الاخلاء » (not exact duplicates; possibly different versions).
  - Word + PDF copies of each indicator cover document are same-content pairs by design (7 pairs).
- Unique-file estimate: 134 listed files minus 57 redundant copies in the confirmed-duplicate groups (8 + 32 + 1 + 1 = 42 duplicate copies; plus the 7 docx/pdf conversions are not counted as duplicates) gives about 92 unique files, excluding the probable xlsx duplicate. Treat as an estimate.
- Ownership: most files are owned by abdo.grab@daralforsan.edu.sa; files in 4-2-1-1 subfolders are owned by personal Gmail accounts (thamer2020.334@gmail.com: خطط الاخلاء 2 files, تراخيص السلامة, سجل الموجه الصحي; waelkh980@gmail.com: دليل أعمال منسقي الأمن والسلامة).
- Evidence mismatch to flag: the 4-1-1-3 and 4-1-1-4 subfolders hold "تقرير مصور عن الامن والسلامة" (security and safety photo reports), which topically belong to criterion 4-2 (الأمن والسلامة); the 4-1-1-3 subfolder also holds the فرش الأرض / مصعد / ممر الكراسي items for disability access.

### Inferences
- Duplication is likely from copy-pasting the same folder under two indicators; unique evidence is about 92 files, not 134. The report writer should quote the 134 listed total and note the duplication separately.
- Because the files are inherited from the same Drive tree with `canEdit: false` for the connector user on all items, this was a read-only view; no change was made.

### Gaps
- Content-level duplicate verification (hash) was not done; duplicates are inferred from identical file size and modified timestamp.
- Number of unique file titles was not separately computed beyond the groups above.
