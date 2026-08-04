import { spawnSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..', '..')

export default function globalSetup(): void {
  const dbDir = path.resolve(__dirname, '..', '.e2e-db')

  const res = spawnSync(
    'python',
    [path.join(REPO_ROOT, 'backend', 'e2e', 'seed_db.py'), dbDir],
    { cwd: REPO_ROOT, stdio: 'inherit' },
  )
  if (res.status !== 0) {
    throw new Error(`E2E DB seed failed (exit ${res.status})`)
  }
}
