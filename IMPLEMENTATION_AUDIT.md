# Implementation audit: official mock workbook → TUNTAS

Workbook inspection and audit completed before this turn's application/UI changes, 21 October 2026 (Asia/Jakarta).

Authority: the XLSX controls available data and values. The integration-plan MD controls product behavior, roles, architecture and deprecated assumptions. Existing Figma fixtures are not authoritative. This audit does not modify the workbook or authorize clinical model training.

## A. Actual XLSX structure

Source: `data/raw/KelompokB_MockData_Software_NUSA_CerviScan_cobas.xlsx`.

SHA-256: `ea767599a909d453284c1e805a1e120b6b5016a221d9d8e7aa1d49799457930d`.

The workbook contains cached results as well as 3,888 formula cells. Read it twice, with formulas and with `data_only=True`; do not read a formula string as a clinical value. Do not recalculate or save the original. Independently recompute adapter output and compare it with cached Format Standar; fail validation on disagreement. Preserve the original formula/address evidence for inspection.

| Actual sheet | Used extent | Header row | Data rows | Grain |
|---|---|---:|---:|---|
| Baca Dulu | A1:C19 | Not a data table | 7 numeric assumptions plus explanatory text | Source notes/configuration |
| 1 Kamus Data | A1:J36 | 1 | 35 | Variable definition/capability claim |
| 2 Mock NUSA | A1:AB61 | 1 | 60 | One test/sample |
| 3 Mock CerviScan | A1:H302 | 2 | 300 | One sample/target; five rows per sample |
| 4 Mock cobas | A1:I62 | 2 | 60 | One test/sample |
| 5 Format Standar | A1:P182 | 2 | 180 | One normalized screening test |
| 6 Tindak Lanjut | A1:M182 | 2 | 180 | One follow-up record for that test |
| 7 Ringkasan | A1:E19 | 3 | Indicators at rows 4–17 | Aggregate per source |

Exact source columns:

**NUSA (28)**

```text
id_perempuan, barcode_A, barcode_B, usia, riwayat_skrining,
vaksin_hpv, gejala_merah, cara_ambil, waktu_swab, waktu_mulai_run,
langkah_lengkap, id_alat, lot_cartridge, durasi_run_menit,
ct_hpv16, ct_hpv18, ct_hpv52, ct_pool_lain, ct_kontrol_internal,
status_qc (rumus), kategori (rumus), status_cabang_B,
tgl_kirim_B, tgl_terima_B, dalam_jendela (rumus), genotipe_lab,
metilasi (RISET), kesesuaian_A_B
```

**CerviScan (8)**

```text
Well, Sample, Target, Kanal (contoh), Cq, id_perempuan, lab, tgl_run
```

Targets: HPV16, HPV18, HPV52, HR lain (11 tipe), Beta-globin (IC). Each appears 60 times. `N/A` appears 229 times in Cq; it is not zero. Kanal 1–5 are examples, not validated fluorophore mappings.

**cobas (9)**

```text
Sample ID, id_perempuan, HPV16, HPV18, Other HR (12 tipe),
Validity, Ct (semua kanal), lab, tgl_run
```

Results are POS/NEG/Invalid. All 60 Ct cells contain `Perlu cek`. No separate HPV52 result is available.

**Format Standar (16)**

```text
sumber_alat, id_sampel, id_perempuan, ct_hpv16, ct_hpv18,
ct_hpv52, ct_pool_lain, ct_kontrol_internal, hasil_16, hasil_18,
hasil_lain (52+pool), valid, kategori_kemenkes, delta_ct,
tgl_hasil, kelengkapan_data
```

**Tindak Lanjut (13)**

```text
id_perempuan, sumber_alat, kategori (rumus), tgl_hasil (rumus),
tgl_dihubungi_kader, hari_ke_kontak (rumus), tgl_iva,
hari_ke_iva (rumus), iva_dalam_target (rumus), hasil_iva,
tindakan, histologi, tgl_recall (rumus)
```

### Verified values and relationships

| Measure | Each source | Combined |
|---|---:|---:|
| Screenings | 60 | 180 |
| Negative | 45 | 135 |
| Positive 16/18 | 4 | 12 |
| Positive other | 8 | 24 |
| Invalid | 3 | 9 |
| Positive total | 12 | 36 |
| Contact recorded | 12 | 36 |
| IVA recorded | 10 | 30 |
| IVA ≤60 days | 9 | 27 |
| IVA >60 days | 1 | 3 |
| Positive with no IVA recorded | 2 | 6 |
| Average result → contact | 2 days | 2 days |
| Treatment recorded: cryotherapy/thermal ablation | 2 | 6 |
| Referral recorded | 1 | 3 |

There are 180 unique patient IDs and 180 unique source/sample keys. Source → standard → follow-up joins have no missing/mismatched records. All CerviScan groups have exactly the five expected targets and consistent patient/lab/date metadata. An independent raw-source derivation agrees with all 180 cached normalized records (numeric delta-Ct tolerance 1e-9). Contact/IVA elapsed-day caches agree with their dates.

Laboratories, by samples (not by raw target rows): CerviScan Labkesda DKI 39 and Lab RSUD Pasar Minggu 21; cobas Labkesda Surabaya (hub) 20 and Lab hub DKI (contoh) 40. NUSA has no lab field. Lab location is not patient domicile or Puskesmas of origin.

NUSA contains age/history/questionnaire fields for 60 records; neither CerviScan nor cobas has actual per-record age/history/collection-method data. The data dictionary describes intended availability, not populated source values. `nik_hash`, consent, inspekulo, screening co-test, amplification curves and actual patient identity are not present as record-level input columns.

NUSA branch B is sent for 12/60 samples. All 12 recorded A/B comparisons say Sesuai; there are no mismatch cases to invent. Methylation: eight Negatif, four Belum diuji, 48 blank. No methylation-positive case exists. NUSA Ct HPV16 is blank in all 60 samples; its four 16/18-positive cases are HPV18, not HPV16.

### Corrections/refinements to the MD

- Main counts, canonical scenarios, raw target structure and clinical rules agree with the workbook.
- Exact headers differ from shorthand in the MD: `(rumus)`, `(RISET)` and `hasil_lain (52+pool)` matter to the importer.
- NUSA `tgl_hasil` is explicitly `INT(waktu_mulai_run)`, not swab date or run end time.
- Delta-Ct is the minimum numeric HPV Ct minus IC Ct for a valid test with a numeric HPV Ct. cobas uses the text Perlu cek; normalize it to null with an unavailable reason.
- IVA ≤60 days is 27, while all recorded IVA examinations total 30. The funnel must not confuse these measures.
- Result dates range 5–20 October 2026, but recorded IVA dates extend through **28 December 2026**. Of the 30 recorded IVA dates, 29 are later than 21 October. Treat this as a complete synthetic scenario snapshot, not a live status as of today. Never reinterpret a recorded examination as an appointment. Pending means no examination recorded; overdue requires an explicit as-of policy and is not inferred in this first pipeline.
- `kelengkapan_data` calls NUSA complete with curves, but no curve arrays are included and branch B is populated only for 12. Preserve the source label for lineage while displaying an honest capability/availability description.
- The source notes mention older branding and risk-score features. Product decisions in the MD supersede those suggestions: no clinical ML model or unsupported score is introduced.

Canonical rows verified directly:

| Patient | Source | Actual result and follow-up |
|---|---|---|
| P-0001 | NUSA | Negative, age 59, recall 2036-10-05 |
| P-0008 | NUSA | HPV52 Ct 35.8, IC 26.3, delta 9.5; IVA 2026-10-24 negative; recall 2029-10-24 |
| P-0016 | NUSA | HPV18 Ct 28.6, IC 28.3, delta ~0.3; contact 2026-10-08; IVA absent |
| P-0024 | NUSA | Invalid, IC absent; recall/action text Ambil ulang |
| P-0073 | CerviScan | HPV16 Ct 24.4; IVA 2026-11-06, Positive <75%; Krioterapi recorded |
| P-0124 | cobas | HPV16 POS, Ct unavailable; IVA 2026-10-21 negative; recall 2027-10-21 |

## B. Existing application data flow

```text
Figma constants in screens + src/data/kader.ts
  → JSX / badge and chart helpers
  → independent screens
```

There is no data ingestion, shared clinical domain, adapter, role service, or persistent workflow. Routing selects screens but `KaderDetail` does not look up the chosen patient. Upload reads only file metadata, not content. Save merely closes the sheet. Dashboard totals, geography, history, score and graph geometry are separate constants. Browser role links are demo navigation, not authorization.

## C. XLSX → normalized schema mapping

| Domain field | NUSA | CerviScan | cobas |
|---|---|---|---|
| sourceDevice | Explicit NUSA source | Explicit CerviScan source | Explicit cobas source |
| sampleId | barcode_A | Sample, after grouping | Sample ID |
| patientId | id_perempuan | Consistent group id_perempuan | id_perempuan |
| testId | source + sample ID | source + sample ID | source + sample ID |
| resultDate | Date part of waktu_mulai_run | tgl_run | tgl_run |
| ct.hpv16 / hpv18 / hpv52 / otherHighRisk | Matching Ct fields | Cq keyed by target name | null; HPV52 not separately available |
| ct.internalControl | ct_kontrol_internal | Beta-globin (IC) Cq | null |
| valid | Numeric IC ≤ source demo limit | Numeric IC ≤ source demo limit | Validity |
| qualitative.hpv16 / hpv18 | Ct < source threshold if valid | Same | POS/NEG/Invalid |
| qualitative.otherHighRisk | Combined HPV52 + other HR pool | Same | Other HR (12 tipe) |
| individual molecular targets | Four HPV targets + IC | Four HPV targets + IC | HPV16/18 + pooled other HR; no fake HPV52/IC Ct |
| programCategory | Invalid precedence, then 16/18, other, negative | Same | Validity and qualitative result |
| deltaCt | min numeric HPV Ct − IC, valid only | Same | null/unavailable |
| profile | Actual age/history/vaccine/symptoms/collection metadata | null where absent | null where absent |
| sourceLab | null | Group lab | lab |
| research | Branch B, methylation, concordance; clinicalUse=false | null | null |
| sourceCompletenessLabel | Retained from matching Format Standar | Same | Same |
| provenance | Original sheet/Excel row pointers retained in normalized browser records; raw values/formula evidence stays in `data/generated/workbook.json` | All five source rows | Original row |

Follow-up joins initially use patient ID + source because that pair is unique in this workbook; validate uniqueness, category, date and coverage, then attach the testId. Reject ambiguous/repeated episodes rather than selecting the first. Store recorded result/contact/IVA/recall dates as date-only ISO strings. `Ambil ulang`/`Ditentukan bidan` are recall instructions, not dates. Keep original source result unchanged.

Rules: read Baca Dulu B13:B19 (HPV <40; IC ≤35; B shipping 7 days; IVA 60 days; recalls 10/3/1 years). These are mock-workbook rules, not newly validated clinical guidance. Contact target ≤2 days and pilot completion target ≥80% are documented in Ringkasan E13/E12 and the MD. No near-cutoff interval or new clinical threshold is introduced.

## D. Existing UI fields populated directly

| Component / region | Supported direct values |
|---|---|
| Kader patient card/header | Workbook patient ID; NUSA age only; source and category |
| KaderDetail test card | Source, sample ID, result date, category; collection metadata only for NUSA |
| KaderDetail/contact sheet | Recorded contact date, IVA date/result, recorded action, histology and recall |
| Lab preview | Actual source sample IDs, target values, source lab, raw values and source-supported target names |
| Lab research area | Actual NUSA-only branch B/methylation/concordance; keep research separation |
| Patient messages/result | Result date, humanized category, recorded contact/IVA/recall and next step |
| Doctor review | Pseudonymous IDs, source, validity, molecular values, completeness and research metadata |
| Dinkes header | Dataset date interval and synthetic status |

## E. Existing UI fields requiring derived values

- Category/qualitative result/validity/delta-Ct: source adapters using only workbook rules, checked against Format Standar.
- Contact and IVA elapsed days; IVA within ≤60 days; positive pending IVA; retest required; routine recall and recorded referral/action state.
- Patient narratives, CTA and journey nodes: deterministic role view model, without cancer diagnosis or risk probability.
- Queue membership/counts: actual follow-up state; no hardcoded task counts or undocumented numerical score.
- Review reasons: invalid, genuinely missing required data, or actual NUSA A/B mismatch; current data produces nine invalid-review cases and zero A/B mismatch cases.
- Dinkes distribution, valid total, invalid rate, positivity composition, contact average, completed/all IVA and on-time rate, per-source and actual lab aggregates.
- Government percentages specify denominators. Positive composition is 36/180; valid-result composition would be 36/171 and must not be silently substituted. On-time completion is 27/36, not 27/30.
- Data availability descriptions must reflect present fields, not merely copy the overly broad NUSA completeness label.

## F. Unsupported/obsolete UI fields to remove or replace

This inventory covers every current data-bearing region. Static educational copy/design tokens are separate from source data.

| Component / region | Existing assumptions to remove/replace |
|---|---|
| App home | Four independent top-level Kader/Dinkes/Lab/Peserta roles; replace with Patient/Doctor/Dinkes and explicitly secondary provider operations |
| KaderTugas header | Senin 19 Okt, Puskesmas Cempaka Putih, five calls, two overdue; no such assignments/deadlines in workbook |
| KaderTugas cards | Ibu S./R./N./D., ages for non-NUSA sources, ad-hoc s/r/n/d IDs, scores, Sisa 20 jam, invented IVA appointment and fixed recall text |
| KaderDetail identity | Ibu S., age 38, masked NIK 0142, RW05/address; replace with selected pseudonymous record and nullable real source profile |
| KaderDetail timeline | Invitation 5 Oct, collection 13 Oct/CerviScan self-swab, result 18 Oct, three call attempts, fixed step 4/6; invitation/attempts/appointments are absent |
| KaderDetail score | +3 HPV16, +1 age, +1 history and total high score; no approved weighting/source |
| KaderDetail counseling/history | Fixed HPV16 statement, provider Rina, call times, WhatsApp delivery/read status and automatic-task history; build neutral category copy and recorded events only |
| KaderDetail actions | Empty tel link, fabricated counselor assignment, save/schedule affordances without supporting contacts/appointment data |
| CatatHasilSheet | Fixed Ibu S., phone time, Pkm, 22/23/26 Oct appointment dates and slots; workbook records performed IVA, not bookable slots or phone outcomes. First pipeline uses read-only recorded follow-up |
| DinkesRingkasan filters | Jul–Sep period, Jakarta Pusat, three Puskesmas, arbitrary active filters; replace with actual source selector and dataset date range |
| DinkesRingkasan KPIs | 1,006, 989, 33 other positives, 11 invalid, 29/45; replace with computed workbook totals |
| DinkesRingkasan funnel | 1,250 invitations, 1,006 collections, six awaiting results, 41 contacts, 24 treated. No invitation/collection queue exists. Use screened → positive → contacted → IVA → action/referral recorded |
| DinkesRingkasan bars/alarms | Puskesmas A/B/C, regional counts, five overdue cases, six long-pending samples, invalid >5% alarm. Current source invalid rate is exactly 5%; do not trigger a >5% alarm. Replace with factual pending/late/retest summaries |
| DinkesPuskesmas title/KPIs | Puskesmas C/Jakarta assignment, 240/184/170/14/6/10 etc.; replace page with actual source detail and supported laboratory aggregates |
| DinkesPuskesmas trend | Fixed SVG curve, weekly labels and +23 points; no such cohort/time-series exists. Remove |
| DinkesPuskesmas kader table | Rina/Siti/Yuni/Lilis, assignments, weekly completions and response times; no staff/assignment records. Replace with source data availability |
| Lab Stepper/file | Preselected CSV filename, 12KB, 48 rows, upload time, successful Terbaca; XLSX snapshot replaces simulated upload success |
| Lab mapping/table | FAM/HEX/ROX/Cy5, six TNT IDs/values, fixed category totals and hidden 42 rows; replace with real source targets and counts |
| Lab research panel | Five of 48 CerviScan branch B samples and checked consent toggle; branch B belongs only to NUSA and consent records are absent |
| Lab footer | Ready to send to three Puskesmas, automatic task-delivery claim, inactive validate/send; no route/delivery assignment exists. Present read-only normalized source snapshot |
| PesertaWhatsApp | Sari identity, Cempaka Putih, invitations/reminders at invented times, SATUSEHAT availability, official business/E2E claims and bookable IVA. Replace with explicitly simulated messages based only on selected recorded events and a working result link |
| Sidebar/status chrome | Provider/user names and cities are not authenticated identities. Replace with demo role labels. Phone 09.41/network/battery icons are decorative device chrome, not a clinical timestamp; remove the fake clock where it could be confused with source time |
| Shared badges/charts | Reuse visuals, but all category, KPI, progress, stage and count props must originate from view models; no unsupported risk chip, regional chart or invention of missing values |

## G. Required adapters

**NUSA:** one source row per result. Parse exact headers including suffixes; nullable Ct; numeric IC rule; date from run start; preserve actual questionnaire metadata. Isolate branch B and methylation with clinicalUse=false. Neither methylation nor branch B changes primary category. Compare computed QC/category with source cached fields and canonical output.

**CerviScan:** group Sample, require exactly one row for each of five targets; reject missing/duplicate/unknown target or inconsistent patient/lab/run metadata. Convert N/A to null, not zero. Map by Target, never by the illustrative Kanal column. Calculate validity/category/delta using workbook rules; output 60 records.

**cobas:** require actual Validity and POS/NEG/Invalid enums. Keep all Ct/delta null with an unavailable reason; separate HPV52 is not available. Preserve categorical results and real lab/date; output 60 records.

All adapters retain provenance and reject malformed input instead of silently mapping it to negative. Canonical cached rows are independent regression controls, not the runtime adapter input.

## H. Required changes per role

**Patient:** add a small mobile result/journey view using existing PhoneFrame/Card/badge design. Provide canonical demo selectors. Show meaning, next step, dates and recall; no default raw Ct or clinical risk score. Mark the entire experience synthetic; show absent profile/appointment information explicitly. Keep a lightweight screening education entry before results. Optional wellness, notification services and production booking remain out of this small pipeline.

**Doctor / Clinical Reviewer:** add a minimal read-only queue/detail using existing desktop components. Nine invalid cases are expected. Show explicit review reason and source-aware molecular rows. Keep original machine result visible and research separate. Operations for existing kader/source preview are secondary links in this provider workspace, not extra primary roles. Stored doctor decisions/audit persistence are a subsequent step; do not fabricate reviewed states.

**Government / Dinkes:** retain card/funnel/table layout, replace values with computed aggregate view models and source filters. Source detail replaces unsupported Puskesmas geography and SVG trend. Show 180 total, 36 positive, nine invalid, 30 IVA recorded and 27 within target. Explain identical synthetic source patterns are not comparative device efficacy. Never show participant identity.

## I. Files/modules to change

New small build-time/data modules:

- `scripts/extract-workbook.py`, `scripts/build-fixtures.ts`, `scripts/generate-data.mjs`, and pinned Python extraction requirements.
- `data/generated/workbook.json`: source/canonical/reference snapshot with checksum and cell provenance, kept out of UI imports.
- `src/data/generated/screenings.json`: normalized synthetic fixture and manifest.
- `src/lib/adapters/{nusa,cerviscan,cobas,shared,index}.ts`.
- `src/lib/domain/{types,config,screening,followup,review}.ts`.
- `src/lib/view-models/{patient,doctor,government,provider}.ts` and a small data service.
- `tests/pipeline.test.ts`: source parity, canonical scenarios, role aggregates, and fail-closed contracts.

Existing files:

- `package.json`: data generation/validation/test scripts; no clinical ML dependencies.
- `src/App.tsx`: primary role routing and patient/doctor entry points.
- `src/data/kader.ts`: removed the unused hardcoded identity/score fixtures.
- `src/screens/{PatientResult,DoctorReviews}.tsx`: added small patient and reviewer views using role view models.
- `src/screens/{KaderTugas,KaderDetail}.tsx`: repurposed secondary provider operations as read-only views of recorded facts.
- `src/screens/{DinkesRingkasan,DinkesPuskesmas}.tsx`: retained shared visual components while replacing invented regional metrics with dataset/source aggregates.
- `src/screens/{LabUnggah,PesertaWhatsApp,CatatHasilSheet}.tsx`: removed unsupported simulated upload, official WhatsApp conversation and non-persisted contact/booking form.
- `src/components/ui.tsx`: existing visual helpers retained; no medical score is rendered.
- `src/screens/dinkesNav.ts`: source detail navigation and demo identity.
- Minimal Patient/Doctor screens using existing components.
- `README.md`: authoritative sources, generate/validate commands, snapshot semantics, privacy/demo boundaries and remaining work.

Do not change the XLSX. Do not migrate the project from Vite solely because the MD includes an assumed Next.js example. Production auth/server architecture remains documented, separate from this synthetic browser prototype.

## J. Proposed implementation sequence

1. **Complete:** save this audit and source fingerprint before application/UI edits.
2. **Complete:** extract source values, formula/provenance evidence, assumptions and canonical regression rows without writing the workbook; regeneration confirmed the original hash.
3. **Complete:** implement strict NUSA, CerviScan and cobas adapters and reconcile all 180 normalized rows with canonical source values.
4. **Complete:** join follow-up, distinguish dates/instructions, and derive snapshot workflow/review state.
5. **Complete:** build patient, doctor, provider and Dinkes view models; raw source headers remain behind adapters.
6. **Complete:** connect role screens, remove unsupported geography/score/booking/upload claims, and keep provider operations secondary/read-only.
7. **Complete:** six focused tests pass; build and lint pass. The static design detector reports no findings. Browser screenshot inspection could not connect to the local dev server in the in-app browser; verify workbook hash unchanged after generation.

The first implementation is a deterministic **read-only synthetic data pipeline**. It does not add auth, production notifications, clinical ML, real booking, image analysis, an upload service, or fake human-review decisions. Those features do not need to be simulated as completed for the pipeline to demonstrate correct source → result → follow-up → role behavior.
