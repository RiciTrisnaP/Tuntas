import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildDataset } from '../src/lib/adapters/index.ts'
import type { RawWorkbook } from '../src/lib/domain/types.ts'
import { governmentViewModel } from '../src/lib/view-models/government.ts'
import { doctorQueue } from '../src/lib/view-models/doctor.ts'

const workbook = JSON.parse(readFileSync('data/generated/workbook.json', 'utf8')) as RawWorkbook
const clone = () => structuredClone(workbook)

test('adapters normalize all sources and reconcile every record with canonical sheet', () => {
  const dataset = buildDataset(workbook)
  assert.equal(dataset.screenings.length, 180)
  assert.deepEqual(Object.fromEntries(['NUSA HPV','CerviScan','cobas'].map(source => [source, dataset.screenings.filter(r => r.sourceDevice === source).length])),
    { 'NUSA HPV': 60, CerviScan: 60, cobas: 60 })
  assert.equal(new Set(dataset.screenings.map(r => r.testId)).size, 180)
  assert.equal(dataset.metadata.firstResultDate, '2026-10-05')
  assert.equal(dataset.metadata.lastResultDate, '2026-10-20')
})

test('preserves representative source facts, unavailable values, and follow-up joins', () => {
  const records = buildDataset(workbook).screenings
  const byPatient = (id: string) => records.find(r => r.patientId === id)!
  const nusaOther = byPatient('P-0008')
  assert.equal(nusaOther.programCategory, 'POSITIVE_OTHER')
  assert.equal(nusaOther.ct.hpv52, 35.8)
  assert.ok(Math.abs(nusaOther.deltaCt! - 9.5) < 1e-9)
  assert.equal(nusaOther.followup.recallAt, '2029-10-24')
  const invalid = byPatient('P-0024')
  assert.equal(invalid.programCategory, 'INVALID')
  assert.equal(invalid.ct.internalControl, null)
  const cobas = byPatient('P-0124')
  assert.equal(cobas.sourceDevice, 'cobas')
  assert.equal(cobas.ct.hpv16, null)
  assert.equal(cobas.targets.find(t => t.key === 'hpv16')?.availability, 'UNAVAILABLE')
  assert.equal(cobas.deltaCt, null)
})

test('role view models aggregate actual source rows without inventing regional data', () => {
  const records = buildDataset(workbook).screenings
  const vm = governmentViewModel(records)
  assert.equal(vm.total, 180)
  assert.equal(vm.negative, 135)
  assert.equal(vm.positive1618, 12)
  assert.equal(vm.positiveOther, 24)
  assert.equal(vm.invalid, 9)
  assert.deepEqual(vm.bySource.map(x => x.total), [60,60,60])
  assert.equal(doctorQueue(records).length, 9)
})

test('adapter fails closed if the cobas Ct contract changes before explicit review', () => {
  const changed = clone()
  changed.tables.cobas.rows[0].values['Ct (semua kanal)'] = 24.1
  assert.throws(() => buildDataset(changed), /cobas Ct contract changed/)
})

test('adapter fails closed when a required CerviScan source column disappears', () => {
  const changed = clone()
  delete changed.tables.cerviscan.rows[0].values.Cq
  assert.throws(() => buildDataset(changed), /Missing column Cq/)
})

test('browser fixture ships normalized data and provenance pointers without raw source payloads', () => {
  const clientRecords = JSON.parse(readFileSync('src/data/generated/screenings.json', 'utf8')).screenings
  assert.equal(clientRecords.length, 180)
  assert.ok(clientRecords.every((r: { provenance: { sheet: string; excelRows: number[]; rawPayload?: unknown } }) =>
    r.provenance.sheet && r.provenance.excelRows.length > 0 && r.provenance.rawPayload === undefined))
})
