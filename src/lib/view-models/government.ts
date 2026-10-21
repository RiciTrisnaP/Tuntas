import { SOURCES } from '../domain/config.ts'
import { isPositive } from '../domain/screening.ts'
import type { Screening, SourceDevice } from '../domain/types.ts'
import { percent } from './shared.ts'

type GovernmentMetrics = ReturnType<typeof aggregate>

function aggregate(selected: Screening[]) {
  const count = (predicate: (r: Screening) => boolean) => selected.filter(predicate).length
  const positive = selected.filter(r => isPositive(r.programCategory))
  const onTime = positive.filter(r => r.followup.ivaWithinTarget === true).length
  const contacts = selected.flatMap(r => r.followup.contactDays == null ? [] : [r.followup.contactDays])
  const labs = [...new Set(selected.flatMap(r => r.sourceLab ? [r.sourceLab] : []))].map(name => ({
    name, total: count(r => r.sourceLab === name), positive: count(r => r.sourceLab === name && isPositive(r.programCategory)),
  }))
  return { total: selected.length, valid: count(r => r.valid),
    negative: count(r => r.programCategory === 'NEGATIVE'), positive1618: count(r => r.programCategory === 'POSITIVE_16_18'),
    positiveOther: count(r => r.programCategory === 'POSITIVE_OTHER'), invalid: count(r => !r.valid), positive: positive.length,
    contacted: positive.filter(r => r.followup.contactedAt).length,
    ivaCompleted: positive.filter(r => r.followup.ivaAt).length, ivaWithinTarget: onTime,
    ivaWithinTargetRate: percent(onTime, positive.length),
    ivaLate: positive.filter(r => r.followup.ivaWithinTarget === false).length,
    ivaPending: positive.filter(r => !r.followup.ivaAt).length,
    actionRecorded: positive.filter(r => r.followup.recordedAction && r.followup.recordedAction !== 'Tidak perlu').length,
    referralRecorded: positive.filter(r => r.followup.recordedAction === 'Rujuk FKTL').length,
    avgDaysToContact: contacts.length ? contacts.reduce((a, b) => a + b, 0) / contacts.length : null,
    invalidRate: percent(count(r => !r.valid), selected.length), positiveComposition: percent(positive.length, selected.length),
    laboratories: labs, noLab: count(r => r.sourceLab == null),
    branchB: count(r => r.research?.branchStatus === 'Dikirim'),
    ctAvailable: count(r => r.sourceDevice !== 'cobas'),
  }
}

function sourceSummary(records: Screening[], source: SourceDevice): Pick<GovernmentMetrics,
  'total' | 'positive' | 'invalid' | 'ivaWithinTarget' | 'ivaWithinTargetRate' | 'branchB'> {
  const vm = aggregate(records.filter(r => r.sourceDevice === source))
  return { total: vm.total, positive: vm.positive, invalid: vm.invalid, ivaWithinTarget: vm.ivaWithinTarget,
    ivaWithinTargetRate: vm.ivaWithinTargetRate, branchB: vm.branchB }
}

export function governmentViewModel(records: Screening[], source?: SourceDevice) {
  const selected = source ? records.filter(r => r.sourceDevice === source) : records
  return { ...aggregate(selected), source,
    bySource: source ? [] : SOURCES.map(name => ({ source: name, ...sourceSummary(records, name) })) }
}
