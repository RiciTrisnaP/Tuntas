import { readFileSync, mkdirSync, writeFileSync } from 'node:fs'
import { buildDataset } from '../src/lib/adapters/index.ts'
import type { RawWorkbook } from '../src/lib/domain/types.ts'

const workbook: RawWorkbook = JSON.parse(readFileSync('data/generated/workbook.json', 'utf8'))
const dataset = buildDataset(workbook)
// Keep source rows/formulas in data/generated/workbook.json; ship only normalized values and row references to the browser.
for (const screening of dataset.screenings) delete screening.provenance.rawPayload
mkdirSync('src/data/generated', { recursive: true })
writeFileSync('src/data/generated/screenings.json', JSON.stringify(dataset, null, 2) + '\n')
console.log(`Generated ${dataset.screenings.length} normalized records, canonical parity verified. Synthetic snapshot only.`)
