# TUNTAS prototype

React + TypeScript prototype using the official synthetic integration workbook at `data/raw/KelompokB_MockData_Software_NUSA_CerviScan_cobas.xlsx` as the current source of available mock data. The product behavior and role scope follow `GENOHACK2026_Prototype_Mock_Data_Integration_Plan.md`; the implementation audit is in `IMPLEMENTATION_AUDIT.md`.

## Mock-data pipeline

```text
XLSX → read-only workbook extractor → NUSA / CerviScan / cobas adapters
     → normalized screening and follow-up domain → derived state
     → patient / doctor / provider / Dinkes view models → React screens
```

Install the pinned workbook reader in the Python environment used to run generation:

```powershell
python -m pip install -r scripts/requirements.txt
npm run data:generate
npm run data:validate
```

`TUNTAS_PYTHON` may point `data:generate` to a specific Python executable. Extraction reads formula caches and formula text, records workbook hash and row provenance, and never saves the source XLSX. The builder independently derives results and checks them against the workbook's `5 Format Standar` and `6 Tindak Lanjut` tables. Generated files are `data/generated/workbook.json` (source evidence) and `src/data/generated/screenings.json` (normalized synthetic fixture with source-row pointers; raw source payloads stay out of the browser bundle).

The dataset is a synthetic scenario snapshot, not live service data or population prevalence. Dates in later follow-up rows are recorded scenario events, not appointments or current overdue status. The workbook's technical assumptions are unvalidated mock rules. cobas Ct and separate HPV52 are unavailable; CerviScan profile fields are absent; NUSA branch B/methylation are research-only. The prototype does not train or include a clinical ML model, clinical risk score, booking workflow, identity/contact data, or persistence for newly entered clinical decisions.

## Run and checks

```powershell
npm install
npm run dev
npm run lint
npm run build
```

Primary demos: Patient `/patient/P-0008`, Doctor / Clinical Reviewer `/doctor/reviews`, Government / Dinkes `/dinkes`. Provider operations are secondary and read-only at `/kader`.
