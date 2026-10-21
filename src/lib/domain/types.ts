export type SourceDevice = 'NUSA HPV' | 'CerviScan' | 'cobas'
export type ProgramCategory = 'NEGATIVE' | 'POSITIVE_16_18' | 'POSITIVE_OTHER' | 'INVALID'
export type QualitativeResult = 'POSITIVE' | 'NEGATIVE' | 'INVALID' | 'NOT_AVAILABLE'
export type TargetKey = 'hpv16' | 'hpv18' | 'hpv52' | 'otherHighRisk' | 'internalControl'
export type CellValue = string | number | boolean | null
export type SourceRow = { excelRow: number; values: Record<string, CellValue>; formulas: Record<string, string> }
export type SourceTable = { sheet: string; headerRow: number; headers: string[]; rows: SourceRow[] }
export type Rule = { value: number; source: string; note: string; clinicalValidated: boolean }
export type Rules = Record<'hpvCtPositiveThreshold' | 'internalControlMaxCt' | 'branchBShippingWindowDays' |
  'ivaTargetDays' | 'negativeRecallYears' | 'otherNormalIvaRecallYears' | 'positive1618NormalIvaRecallYears', Rule>
export type RawWorkbook = {
  metadata: { sourceFile: string; sha256: string; dataVersion: string; synthetic: true; mode: string;
    sheets: { name: string; rows: number; columns: number; formulaCount: number }[] }
  assumptions: Rules
  tables: Record<'dictionary' | 'nusa' | 'cerviscan' | 'cobas' | 'canonical' | 'followups' | 'summary', SourceTable>
}
export type CtValues = Record<TargetKey, number | null>
export type MolecularTarget = {
  key: TargetKey; label: string; result: QualitativeResult; ct: number | null
  availability: 'MEASURED' | 'NOT_DETECTED' | 'MISSING' | 'UNAVAILABLE'
}
export type NormalizedScreeningResult = {
  testId: string; sourceDevice: SourceDevice; sampleId: string; patientId: string
  resultDate: string; sourceLab: string | null
  ct: CtValues
  qualitative: { hpv16: QualitativeResult; hpv18: QualitativeResult; otherHighRisk: QualitativeResult }
  valid: boolean; programCategory: ProgramCategory; deltaCt: number | null
  targets: MolecularTarget[]
  profile: { age: number | null; screeningHistory: string | null; vaccination: string | null;
    redFlagSymptoms: string | null; collectionMethod: string | null; collectedAt: string | null }
  research: null | { clinicalUse: false; branchStatus: string; barcode: string; sentAt: string | null;
    receivedAt: string | null; genotype: string | null; methylation: string | null; concordance: string | null }
  sourceCompletenessLabel: string
  provenance: { sheet: string; excelRows: number[]; rawPayload?: Record<string, CellValue>[] }
}
export type Followup = {
  testId: string; contactedAt: string | null; contactDays: number | null
  ivaAt: string | null; ivaDays: number | null; ivaWithinTarget: boolean | null
  ivaResult: string | null; recordedAction: string | null; histology: string | null
  recallAt: string | null; recallInstruction: string | null
  provenance: { sheet: string; excelRow: number }
}
export type FollowUpStatus = 'ROUTINE_RECALL' | 'RETEST_REQUIRED' | 'AWAITING_CONTACT' | 'AWAITING_IVA' |
  'FOLLOW_UP_COMPLETE' | 'ACTION_REQUIRED' | 'REFERRED'
export type Screening = NormalizedScreeningResult & {
  followup: Followup; followUpStatus: FollowUpStatus; reviewReasons: string[]
}
export type Dataset = {
  metadata: RawWorkbook['metadata'] & { firstResultDate: string; lastResultDate: string; lastRecordedIvaDate: string }
  rules: Rules; screenings: Screening[]
}
