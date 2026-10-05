import { cpSync } from 'node:fs'
import { spawnSync } from 'node:child_process'

const backendOrigin = process.env.NEXT_PUBLIC_TILIO_BACKEND_ORIGIN?.trim() || 'https://www.tilio.online'
if (!backendOrigin.startsWith('https://')) {
  console.error('NEXT_PUBLIC_TILIO_BACKEND_ORIGIN must use HTTPS.')
  process.exit(1)
}

const nextBin = process.platform === 'win32' ? 'node_modules\\.bin\\next.cmd' : 'node_modules/.bin/next'
const result = spawnSync(nextBin, ['build', 'android-web'], {
  stdio: 'inherit',
  shell: process.platform === 'win32',
  env: {
    ...process.env,
    NEXT_PUBLIC_TILIO_BACKEND_ORIGIN: backendOrigin,
  },
})

if (result.status !== 0) process.exit(result.status ?? 1)

const outputPublic = new URL('../android-web/out/', import.meta.url)
cpSync(new URL('../public/', import.meta.url), outputPublic, { recursive: true })
