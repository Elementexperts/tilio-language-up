import { isCapacitorAndroid } from '@/lib/platform'

function normalizedBackendOrigin() {
  return process.env.NEXT_PUBLIC_TILIO_BACKEND_ORIGIN?.trim().replace(/\/$/, '') ?? ''
}

export function getBackendApiUrl(path: `/api/${string}`) {
  if (!isCapacitorAndroid()) return path

  const origin = normalizedBackendOrigin()
  if (!origin) {
    throw new Error('Android backend is not configured. Set NEXT_PUBLIC_TILIO_BACKEND_ORIGIN before building.')
  }
  if (!origin.startsWith('https://')) {
    throw new Error('Android backend origin must use HTTPS.')
  }
  return `${origin}${path}`
}
