import type { NormalizedScreeningResult } from './types.ts'

export function reviewReasons(result: NormalizedScreeningResult): string[] {
  const reasons: string[] = []
  if (!result.valid) reasons.push('Hasil tidak valid; evaluasi atau pemeriksaan ulang diperlukan.')
  if (result.sourceDevice !== 'cobas' && result.ct.internalControl == null) reasons.push('Nilai kontrol internal tidak tersedia.')
  if (result.research?.concordance === 'Tidak sesuai') reasons.push('Ketidaksesuaian hasil cabang A/B yang tercatat.')
  return reasons
}
