import { spawnSync } from 'node:child_process'

const python = process.env.TUNTAS_PYTHON || 'python'
for (const [command, args] of [
  [python, ['scripts/extract-workbook.py']],
  [process.execPath, ['--experimental-strip-types', 'scripts/build-fixtures.ts']],
]) {
  const result = spawnSync(command, args, { stdio: 'inherit', cwd: new URL('..', import.meta.url) })
  if (result.error) {
    console.error(result.error.message, '\nSet TUNTAS_PYTHON to Python with scripts/requirements.txt installed.')
    process.exit(1)
  }
  if (result.status !== 0) process.exit(result.status || 1)
}
