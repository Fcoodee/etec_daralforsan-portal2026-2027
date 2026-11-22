# Saudi government bodies (non-MoE, non-ETEC) supporting school quality, governance, data and responsible technology

Verification date: 22 Nov 2026. Status legend: VERIFIED = page/PDF opened and content read via WebFetch. UNVERIFIED = URL surfaced by a .gov.sa-restricted web search (domain and title seen in results) but the page was NOT opened. BLOCKED = fetch attempted and failed (reason noted). Direct curl from the sandbox also failed (HTTP 000, proxy) for all hosts, so no second channel was available.

## Which official pages state the AI ethics and data-protection obligations a school portal handling student/staff records should follow?

### Takeaway
SDAIA publishes the PDPL text, its Implementing Regulation, controller/processor guides and the AI Ethics Principles, but every SDAIA page I tried to open returned a "Request Rejected" firewall page, so none is VERIFIED by content. The URLs below are real search hits on sdaia.gov.sa / dgp.sdaia.gov.sa and should be treated as UNVERIFIED until opened by a human. The only verified item in this area is the DGA policy document (technology/data governance).

### Cited Findings
| # | Title (AR / EN) | Publisher | URL | Status | Relevance | Priority |
|---|---|---|---|---|---|---|
| 1 | نظام حماية البيانات الشخصية / Personal Data Protection Law | SDAIA | https://sdaia.gov.sa/en/SDAIA/about/Documents/PersonalDataProtectionLaw.pdf | UNVERIFIED (BLOCKED: "Request Rejected" page) | Core law for student/staff personal-data processing, consent, retention, breach duties (content not read) | High |
| 2 | اللائحة التنفيذية لنظام حماية البيانات الشخصية / Implementing Regulation of the PDPL | SDAIA | https://sdaia.gov.sa/en/SDAIA/about/Documents/ImplementingRegulation.pdf | UNVERIFIED (not opened) | Operational controller obligations | High |
| 3 | دليل نظام حماية البيانات الشخصية للمتحكمين والمعالجين / Guide to the Saudi PDPL for Controllers and Processors | SDAIA National Data Governance Platform (dgp.sdaia.gov.sa) | https://dgp.sdaia.gov.sa/wps/wcm/connect/f579bc32-fda8-47bd-bc6f-66b8cb77985c/ENG-Guide+to+the+saudi+PDP+law+for+controllersprocessors.pdf?MOD=AJPERES | UNVERIFIED (not opened) | Practical guidance for a school as controller | High |
| 4 | Guide to the Saudi PDPL Handbook v1.0 (Dec 2023) | SDAIA (dgp.sdaia.gov.sa) | https://dgp.sdaia.gov.sa/wps/wcm/connect/85a664fd-6e4e-4edb-bab4-1cbdb02ba6d5/Guide+to+the+saudi+PDP+law+HANDBOOK__%D9%90EN.pdf?MOD=AJPERES | UNVERIFIED (not opened) | Plain-language handbook | Medium |
| 5 | Data Protection page / صفحة حماية البيانات | SDAIA | https://sdaia.gov.sa/en/Research/Pages/DataProtection.aspx | UNVERIFIED (BLOCKED: "Request Rejected") | Entry point listing PDPL documents | Medium |
| 6 | Rules for Appointing a Personal Data Protection Officer | SDAIA | https://sdaia.gov.sa/en/SDAIA/about/Documents/RulesforAppointingPersonalDataProtectionOfficer.pdf | UNVERIFIED (not opened) | Whether a school must designate a DPO | Medium |
| 7 | Standard Contractual Clauses for Personal Data Transfer | SDAIA (dgp.sdaia.gov.sa) | https://dgp.sdaia.gov.sa/wps/portal/pdp/knowledgecenter/details/StandardContractualClauses/ (full URL in search results carries a long session token) | UNVERIFIED (not opened) | Relevant if portal uses cloud/vendors abroad | Medium |
| 8 | مبادئ أخلاقيات الذكاء الاصطناعي / AI Ethics Principles (2025 edition) | SDAIA | https://sdaia.gov.sa/en/SDAIA/about/Documents/ai-principles.pdf | UNVERIFIED (BLOCKED: "Request Rejected") | Ethics principles for AI features in the portal | High |
| 9 | AI Ethics Principles v1.0, Sept 2023 | SDAIA (dgp.sdaia.gov.sa) | https://dgp.sdaia.gov.sa/wps/wcm/connect/4c56ed1c-1b82-447d-ac29-638f5f99c12e/ai-principles-EN.pdf | UNVERIFIED (not opened; earlier version) | Prior edition; cite only if 2025 edition cannot be confirmed | Low |
| 10 | Generative AI Guidelines for Government (2025) / for Public (2025) | SDAIA | https://sdaia.gov.sa/en/SDAIA/about/Files/GenAIGuidelinesForGovernmentENCompressed.pdf ; https://sdaia.gov.sa/en/SDAIA/about/Files/GenerativeAIPublicEN.pdf | UNVERIFIED (not opened) | Guidance if staff/students use generative AI | Medium |
| 11 | AI Adoption Framework (2025); AI Bias Reference Guide (1st ed. May 2026) | SDAIA | https://sdaia.gov.sa/en/SDAIA/about/Files/AIAdoptionFramework.pdf ; https://sdaia.gov.sa/en/MediaCenter/KnowledgeCenter/ResearchLibrary/EN-AI-BIAS.pdf | UNVERIFIED (not opened) | Adoption governance and bias checks for any analytics on student data | Low-Medium |
| 12 | Digital Government Policies v2.0 (DGA-1-2, published 10/03/2024): five policies incl. Governance and Compliance (privacy, oversight) and Technology Policy (data management and governance, cloud, emerging tech); applies to government entities and private companies that develop or operate digital government activities — [DGA](https://dga.gov.sa/en/regulatory-documents/Digital-government-policies) | Digital Government Authority (هيئة الحكومة الرقمية) | https://dga.gov.sa/en/regulatory-documents/Digital-government-policies (PDF: https://dga.gov.sa/sites/default/files/2024-03/Digital%20Government%20Policies%20-%20V2.0.pdf) | VERIFIED (landing page opened; PDF itself not opened) | Reference model for data governance and digital services; binding on government entities, so for a private school it is a benchmark, not a stated obligation | Medium |
| 13 | DGA Regulatory Framework; Digital Transformation Basic Standards; IT Governance Controls in Digital Government | DGA | https://dga.gov.sa/en/regulatory_framework ; https://dga.gov.sa/en/Standards_Of_Digital_Transformation ; https://dga.gov.sa/en/regulatory-documents/IT-governance-controls-in-digital-government | UNVERIFIED (search hits only) | Supporting DGA standards | Low |

### Inferences
- A school portal storing student/staff records is a "controller" under the PDPL in practice; items 1-3 are the must-read set once a human can open them. This is an inference from the law's purpose, not a read finding.
- Items 8 and 10 are the likely anchors for any AI-assisted feature (analytics, chatbots); the applicability of the principles to private schools was not confirmed.
- DGA policies state they apply to government entities and companies delivering digital government activities (verified), so a private school is not clearly in scope.

### Gaps
- No SDAIA page could be opened (firewall "Request Rejected" on sdaia.gov.sa fetches), so article numbers, children's-data provisions, breach-notification deadlines and the list of AI principles are not confirmed. Do not quote contents from this file.
- Arabic-language URLs for SDAIA documents not located.
- my.gov.sa not opened (curl failed; not searched).

## Which official pages define child protection and student rights duties for schools?

### Takeaway
The Child Protection Law (نظام حماية الطفل) exists on the Bureau of Experts laws portal, but the page could not be opened (robots.txt unreachable), so its article content is unverified.

### Cited Findings
| # | Title (AR / EN) | Publisher | URL | Status | Relevance | Priority |
|---|---|---|---|---|---|---|
| 1 | نظام حماية الطفل / Child Protection Law | هيئة الخبراء بمجلس الوزراء (Bureau of Experts at the Council of Ministers), laws.boe.gov.sa | https://laws.boe.gov.sa/BoeLaws/Laws/LawDetails/2d3cb83a-0379-4cde-8e0b-a9a700f272bd/1 | UNVERIFIED (BLOCKED: WebFetch ROBOTS_UNREACHABLE; title and URL seen in search results only) | Primary text for child safety/abuse-prevention duties relevant to students | High |
| 2 | Same law, boe.gov.sa legacy view | Bureau of Experts | https://www.boe.gov.sa/ViewSystemDetails.aspx?SystemID=356&VersionID=333&lang=ar | UNVERIFIED (search hit only) | Alternate link | Low |

### Inferences
- Duties of schools (reporting, protection from abuse/neglect) cannot be stated without reading the text; recommend the writer treat this as a pointer only.

### Gaps
- No article numbers, royal decree number/date, or school-specific duties confirmed. Student rights beyond this law (e.g., MoE student conduct regulations) are outside this scope.

## Which Vision 2030 / HCDP pages anchor the education quality objectives?

### Takeaway
The HCDP 2021-2025 Delivery Plan on vision2030.gov.sa was opened and states education objectives and KPIs. The HCDP landing page itself failed to load.

### Cited Findings
- The HCDP delivery plan's education objectives sit under three Vision 2030 goals (strengthening Islamic values and national identity, a fulfilling and healthy life, and increasing employment); they include values/character, national identity and Arabic language, family involvement, lifelong learning and equitable access, learning outcomes, labor-market readiness and innovation — [HCDP Delivery Plan 2021-2025](https://www.vision2030.gov.sa/media/pgid4z3t/2021-2025-human-capability-development-program-delivery-plan-en.pdf)
- School-relevant KPIs (baseline to 2025 target) from the same plan: school discipline index 0.3 (2018) to 0.35; parent participation in school activities 37% (2018) to 80%; student life satisfaction 7.95 to 8.12; kindergarten enrollment 21% (2019) to 40%; students with disabilities enrolled 1.4% to 20%; PISA reading 399 to 454, math 373 to 441, science 386 to 448; TIMSS grade 4 math 398 to 484, science 402 to 493 — [HCDP Delivery Plan 2021-2025](https://www.vision2030.gov.sa/media/pgid4z3t/2021-2025-human-capability-development-program-delivery-plan-en.pdf) (only the first 100,000 of about 151,000 characters were read; the WebFetch summary is model-generated, so spot-check figures before quoting).

| # | Title (AR / EN) | Publisher | URL | Status | Relevance | Priority |
|---|---|---|---|---|---|---|
| 1 | Human Capability Development Program Delivery Plan 2021-2025 / برنامج تنمية القدرات البشرية - خطة التنفيذ | Vision 2030 / HCDP | https://www.vision2030.gov.sa/media/pgid4z3t/2021-2025-human-capability-development-program-delivery-plan-en.pdf | VERIFIED (opened, partial read) | Anchors education quality objectives and KPIs | High |
| 2 | HCDP program page / صفحة برنامج تنمية القدرات البشرية | Vision 2030 | https://www.vision2030.gov.sa/en/explore/programs/human-capability-development-program | UNVERIFIED (BLOCKED: fetch client_error) | Landing page | Medium |
| 3 | HCDP Annual Report 2025 (EN / AR) | Vision 2030 / HCDP | https://www.vision2030.gov.sa/media/uyqfqgge/hcdp-annualreport-2025-en.pdf ; https://www.vision2030.gov.sa/media/isbekbj1/hcdp-annualreport-2025-ar.pdf | UNVERIFIED (search hits only) | Latest progress against targets | Medium |
| 4 | Saudi Vision 2030 document / وثيقة رؤية السعودية 2030 | Vision 2030 | https://www.vision2030.gov.sa/media/rc0b5oy1/saudi_vision203.pdf | UNVERIFIED (search hit only) | Foundational vision text | Medium |
| 5 | Saudi Vision 2030 portal | Vision 2030 | https://www.vision2030.gov.sa/en | UNVERIFIED (search hit only) | Home | Low |

### Inferences
- The delivery plan's 2025 targets are now past their horizon at the 22 Nov 2026 verification date; the writer should check the Annual Report 2025 (unopened) or a successor plan for current targets rather than present 2025 targets as live.

### Gaps
- Arabic title of the delivery plan not confirmed from the page. No successor (post-2025) HCDP plan was located. Vision 2030 page statements on school quality beyond the delivery plan were not read.
