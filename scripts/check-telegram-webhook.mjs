const token = process.env.TELEGRAM_BOT_TOKEN?.trim()

if (!token) {
  console.error('Missing TELEGRAM_BOT_TOKEN environment variable.')
  console.error('Run with: TELEGRAM_BOT_TOKEN=your_token node scripts/check-telegram-webhook.mjs')
  process.exit(1)
}

const response = await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)
const data = await response.json()

if (!data.ok) {
  console.error('Telegram returned an error:')
  console.error(JSON.stringify(data, null, 2))
  process.exit(1)
}

const result = data.result ?? {}

console.log('Telegram webhook status')
console.log('-----------------------')
console.log(`URL: ${result.url || '(not set)'}`)
console.log(`Pending updates: ${result.pending_update_count ?? 0}`)
console.log(`Allowed updates: ${(result.allowed_updates ?? []).join(', ') || '(default)'}`)
console.log(`IP address: ${result.ip_address || '(unknown)'}`)

if (result.last_error_message) {
  console.log('')
  console.log('Last error')
  console.log('----------')
  console.log(`Date: ${result.last_error_date || '(unknown)'}`)
  console.log(`Message: ${result.last_error_message}`)
  process.exitCode = 2
} else {
  console.log('')
  console.log('No webhook errors reported.')
}
