// Operational targets explicitly documented in the workbook/plan; no clinical score or near-cutoff rule.
export const PROGRAM_TARGETS = {
  contactDays: { value: 2, source: '7 Ringkasan!E13; integration plan §8' },
  ivaCompletionPercent: { value: 80, source: '7 Ringkasan!E12' },
} as const
export const SOURCES = ['NUSA HPV', 'CerviScan', 'cobas'] as const
