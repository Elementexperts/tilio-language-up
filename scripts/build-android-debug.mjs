import { spawnSync } from 'node:child_process'

const gradle = process.platform === 'win32' ? 'gradlew.bat' : './gradlew'
const result = spawnSync(gradle, ['assembleDebug'], {
  cwd: new URL('../android/', import.meta.url),
  stdio: 'inherit',
  shell: process.platform === 'win32',
})

process.exit(result.status ?? 1)
