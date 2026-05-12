const adminEmails = (process.env.NEXT_PUBLIC_TESTER_ADMIN_EMAILS ?? '')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

const adminUserIds = (process.env.NEXT_PUBLIC_TESTER_ADMIN_USER_IDS ?? '')
  .split(',')
  .map((id) => id.trim())
  .filter(Boolean)

export function canViewTesterStats(params: { email?: string | null; userId?: string | null }) {
  const email = params.email?.trim().toLowerCase()
  const userId = params.userId?.trim()

  return Boolean((email && adminEmails.includes(email)) || (userId && adminUserIds.includes(userId)))
}
