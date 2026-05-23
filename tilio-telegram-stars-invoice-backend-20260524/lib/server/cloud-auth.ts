export interface ServerCloudUser {
  userId: string
  accessToken: string
}

function getSupabaseClientConfig() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error('Supabase client credentials are missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  return { url, anonKey }
}

function decodeJwtPayload(token: string) {
  const payload = token.split('.')[1]
  if (!payload) throw new Error('Invalid authorization token')
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf8')) as { sub?: string }
}

export async function requireCloudUser(request: Request): Promise<ServerCloudUser> {
  const header = request.headers.get('authorization')
  const accessToken = header?.startsWith('Bearer ') ? header.slice('Bearer '.length).trim() : ''
  if (!accessToken) throw new Error('Cloud account is required before checkout')

  const payload = decodeJwtPayload(accessToken)
  const userId = payload.sub
  if (!userId) throw new Error('Cloud account token is missing a user id')

  const { url, anonKey } = getSupabaseClientConfig()
  const response = await fetch(`${url}/rest/v1/users?id=eq.${encodeURIComponent(userId)}&select=id&limit=1`, {
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error('Cloud account token could not be verified')
  }

  const rows = await response.json() as Array<{ id: string }>
  if (rows[0]?.id !== userId) {
    throw new Error('Cloud account profile was not found')
  }

  return { userId, accessToken }
}
