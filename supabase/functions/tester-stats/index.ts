// @ts-nocheck
import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
}

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function requireEnv(name: string) {
  const value = Deno.env.get(name)
  if (!value) throw new Error(`Missing required secret: ${name}`)
  return value
}

function requireAnyEnv(names: string[]) {
  for (const name of names) {
    const value = Deno.env.get(name)
    if (value) return value
  }
  throw new Error(`Missing required secret: ${names.join(' or ')}`)
}

function decodeJwtPayload(authHeader: string | null) {
  const token = authHeader?.replace(/^Bearer\s+/i, '')
  if (!token) return null
  const payload = token.split('.')[1]
  if (!payload) return null
  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  return JSON.parse(atob(padded))
}

function isAllowedAdmin(payload: Record<string, unknown> | null) {
  const adminEmails = (Deno.env.get('TESTER_ADMIN_EMAILS') ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  const adminUserIds = (Deno.env.get('TESTER_ADMIN_USER_IDS') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean)

  const email = String(payload?.email ?? '').toLowerCase()
  const subject = String(payload?.sub ?? '')

  return (email && adminEmails.includes(email)) || (subject && adminUserIds.includes(subject))
}

function startOfToday() {
  const date = new Date()
  date.setUTCHours(0, 0, 0, 0)
  return date
}

function startOfWeek() {
  const date = startOfToday()
  date.setUTCDate(date.getUTCDate() - 7)
  return date
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'GET') return jsonResponse({ error: 'Method not allowed' }, 405)

  try {
    const payload = decodeJwtPayload(req.headers.get('authorization'))
    if (!isAllowedAdmin(payload)) {
      return jsonResponse({ error: 'Admin tester access required' }, 403)
    }

    const supabase = createClient(
      requireAnyEnv(['SUPABASE_URL', 'PROJECT_URL']),
      requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    )

    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, username, first_name, last_name, created_at')
      .order('created_at', { ascending: false })

    if (usersError) throw new Error(usersError.message)

    const { data: progressRows, error: progressError } = await supabase
      .from('user_progress')
      .select('user_id, xp, streak, completed_lessons, settings, updated_at')

    if (progressError) throw new Error(progressError.message)

    const today = startOfToday()
    const week = startOfWeek()
    const progressByUser = new Map((progressRows ?? []).map((row) => [row.user_id, row]))
    const totalTesters = users?.length ?? 0
    const activeToday = (progressRows ?? []).filter((row) => new Date(row.updated_at) >= today).length
    const activeThisWeek = (progressRows ?? []).filter((row) => new Date(row.updated_at) >= week).length
    const newSignupsThisWeek = (users ?? []).filter((user) => new Date(user.created_at) >= week).length
    const averageStreak = totalTesters
      ? Math.round((progressRows ?? []).reduce((sum, row) => sum + (row.streak ?? 0), 0) / totalTesters)
      : 0
    const averageCompletedLessons = totalTesters
      ? Math.round((progressRows ?? []).reduce((sum, row) => sum + (row.completed_lessons?.length ?? 0), 0) / totalTesters)
      : 0

    const courseCounts = new Map<string, number>()
    for (const row of progressRows ?? []) {
      const courseId = row.settings?.selectedCourse ?? row.settings?.learningPath ?? 'uz-en'
      courseCounts.set(courseId, (courseCounts.get(courseId) ?? 0) + 1)
    }

    const recentTesters = (users ?? []).slice(0, 10).map((user) => {
      const progress = progressByUser.get(user.id)
      return {
        id: user.id,
        name: [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username || 'Tester',
        username: user.username,
        joinedAt: user.created_at,
        lastActiveAt: progress?.updated_at ?? null,
        courseId: progress?.settings?.selectedCourse ?? progress?.settings?.learningPath ?? 'uz-en',
        xp: progress?.xp ?? 0,
        streak: progress?.streak ?? 0,
      }
    })

    return jsonResponse({
      totalTesters,
      activeToday,
      activeThisWeek,
      newSignupsThisWeek,
      averageStreak,
      averageCompletedLessons,
      courses: [...courseCounts.entries()].map(([courseId, testers]) => ({ courseId, testers })),
      recentTesters,
    })
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Tester stats failed' }, 500)
  }
})
