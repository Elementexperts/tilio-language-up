export const runtime = 'edge'

const TILIO_APP_URL = 'https://www.tilio.online'
const TELEGRAM_API_BASE = 'https://api.telegram.org'
const AI_TIMEOUT_MS = 4500
const TELEGRAM_TIMEOUT_MS = 4500
const MAX_TUTOR_REPLIES_PER_USER_PER_DAY = 2

const tutorReplyCounts = new Map<string, { date: string; count: number }>()
const welcomedGroupUsers = new Map<string, string>()

type TelegramChat = {
  id: number
  type: 'private' | 'group' | 'supergroup' | 'channel'
}

type TelegramUser = {
  id: number
  is_bot?: boolean
  first_name?: string
  username?: string
}

type TelegramEntity = {
  type: string
  offset: number
  length: number
  url?: string
}

type TelegramMessage = {
  message_id: number
  text?: string
  caption?: string
  chat: TelegramChat
  from?: TelegramUser
  entities?: TelegramEntity[]
  caption_entities?: TelegramEntity[]
  reply_to_message?: TelegramMessage
  new_chat_members?: TelegramUser[]
}

type TelegramChatMember = {
  user: TelegramUser
  status: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked'
}

type TelegramChatMemberUpdated = {
  chat: TelegramChat
  from?: TelegramUser
  old_chat_member: TelegramChatMember
  new_chat_member: TelegramChatMember
}

type TelegramChatJoinRequest = {
  chat: TelegramChat
  from: TelegramUser
}

type TelegramUpdate = {
  message?: TelegramMessage
  edited_message?: TelegramMessage
  chat_member?: TelegramChatMemberUpdated
  my_chat_member?: TelegramChatMemberUpdated
  chat_join_request?: TelegramChatJoinRequest
}

type TelegramInlineKeyboardButton = {
  text: string
  url?: string
  web_app?: { url: string }
}

type TelegramSendMessageOptions = {
  parse_mode?: 'HTML' | 'MarkdownV2'
  reply_markup?: {
    inline_keyboard: TelegramInlineKeyboardButton[][]
  }
  reply_to_message_id?: number
  disable_web_page_preview?: boolean
}

type TelegramSendMessagePayload = TelegramSendMessageOptions & {
  chat_id: number
  text: string
}

type TelegramDeleteMessagePayload = {
  chat_id: number
  message_id: number
}

type TelegramChatMemberResponse = {
  ok: boolean
  result?: {
    status?: 'creator' | 'administrator' | 'member' | 'restricted' | 'left' | 'kicked'
  }
}

const appButtonMarkup = {
  inline_keyboard: [
    [
      {
        text: "🚀 Tilio'ni ochish",
        web_app: { url: TILIO_APP_URL },
      },
    ],
  ],
}

function jsonOk() {
  return Response.json({ ok: true })
}

function getEnv(name: string) {
  return process.env[name]?.trim() ?? ''
}

function getTodayKey() {
  return new Date().toISOString().split('T')[0]
}

function getCommand(text: string) {
  const firstToken = text.trim().split(/\s+/)[0] ?? ''
  if (!firstToken.startsWith('/')) return ''
  return firstToken.split('@')[0].toLowerCase()
}

function getEntityText(text: string, entity: TelegramEntity) {
  return text.slice(entity.offset, entity.offset + entity.length)
}

function hasMentionEntity(message: TelegramMessage) {
  const text = message.text ?? ''
  return Boolean(
    message.entities?.some((entity) => {
      if (entity.type !== 'mention' && entity.type !== 'text_mention') return false
      const mention = getEntityText(text, entity).toLowerCase()
      return mention.includes('tilio')
    }),
  )
}

function isReplyToTilioBot(message: TelegramMessage) {
  const replyFrom = message.reply_to_message?.from
  if (!replyFrom?.is_bot) return false
  const username = replyFrom.username?.toLowerCase() ?? ''
  return username.length === 0 || username.includes('tilio')
}

function shouldHandleGroupMessage(message: TelegramMessage) {
  const text = getMessageText(message).trim()
  if (!text) return false
  return text.startsWith('/') || hasMentionEntity(message) || isReplyToTilioBot(message)
}

function isGroupChat(chat: TelegramChat) {
  return chat.type === 'group' || chat.type === 'supergroup'
}

function getMessageText(message: TelegramMessage) {
  return message.text ?? message.caption ?? ''
}

function stripBotMention(text: string) {
  return text.replace(/@\w*tilio\w*/gi, '').trim()
}

function isLikelySensitiveOrHarmful(text: string) {
  const normalized = text.toLowerCase()
  const blockedTerms = [
    'bomb',
    'weapon',
    'hack',
    'malware',
    'suicide',
    'self harm',
    'o\'zimni o\'ldir',
    'terror',
    'porn',
    'nude',
  ]
  return blockedTerms.some((term) => normalized.includes(term))
}

function getQuickTutorReply(text: string) {
  const normalized = text.toLowerCase()

  if (/\bbook\b/.test(normalized)) {
    return 'book — kitob degani. Masalan: I read a book.'
  }

  if (text.includes('안녕하세요')) {
    return '안녕하세요 — salom degani. Bu hurmatli salomlashuv.'
  }

  if (text.includes('Здравствуйте')) {
    return 'Здравствуйте — salom degani. Rus tilida hurmatli salomlashuv.'
  }

  if (text.includes('مرحبا')) {
    return 'مرحبا — salom degani. Talaffuzi: marhaban.'
  }

  if (/\bhallo\b/i.test(text)) {
    return 'Hallo — salom degani. Nemis tilida oddiy salomlashuv.'
  }

  return null
}

function consumeTutorReplySlot(message: TelegramMessage, isAdmin = false) {
  if (isAdmin) return { allowed: true, count: 1 }

  const userId = message.from?.id
  if (!userId) return { allowed: true, count: 1 }

  const today = getTodayKey()
  const key = `${message.chat.id}:${userId}`
  const current = tutorReplyCounts.get(key)
  const currentCount = current?.date === today ? current.count : 0

  if (currentCount >= MAX_TUTOR_REPLIES_PER_USER_PER_DAY) {
    return { allowed: false, count: currentCount }
  }

  const nextCount = currentCount + 1
  tutorReplyCounts.set(key, { date: today, count: nextCount })
  return { allowed: true, count: nextCount }
}

function withTilioAppSuggestion(reply: string, replyCount: number) {
  const suffix = replyCount >= MAX_TUTOR_REPLIES_PER_USER_PER_DAY
    ? "Bu bugungi 2-javobim. Ko'proq mashq va darslar uchun Tilio ilovasida davom eting: /app"
    : "Ko'proq misol va mashq uchun Tilio ilovasida davom eting: /app"

  return `${reply}\n\n${suffix}`
}

function shouldSendFallbackWelcome(message: TelegramMessage, isAdmin: boolean) {
  if (isAdmin || !isGroupChat(message.chat) || !message.from || message.from.is_bot) return false

  const text = getMessageText(message).toLowerCase().trim()
  if (!text) return false

  const command = getCommand(text)
  if (command) return false

  const key = `${message.chat.id}:${message.from.id}`
  if (welcomedGroupUsers.has(key)) return false

  const greetingPattern = /\b(salom|assalomu|hello|hi|hey|privet|привет|здравствуйте|hallo|مرحبا|السلام)\b/i
  return greetingPattern.test(text)
}

async function sendFallbackWelcome(message: TelegramMessage) {
  const user = message.from
  if (!user) return

  const key = `${message.chat.id}:${user.id}`
  welcomedGroupUsers.set(key, getTodayKey())

  await sendTelegramMessage(
    message.chat.id,
    `Xush kelibsiz, ${user.first_name?.trim() || 'do\'st'}! Tilio guruhda til o'rganishga yordam beradi. Savol berish uchun botni mention qiling yoki /app orqali darslarni oching.`,
    {
      reply_markup: appButtonMarkup,
      reply_to_message_id: message.message_id,
    },
  )
}

function hasUrlEntity(message: TelegramMessage) {
  return Boolean(
    [...(message.entities ?? []), ...(message.caption_entities ?? [])].some((entity) => (
      entity.type === 'url' || entity.type === 'text_link'
    )),
  )
}

function isLikelyAdMessage(message: TelegramMessage) {
  if (!isGroupChat(message.chat)) return false

  const text = getMessageText(message).toLowerCase()
  if (!text.trim()) return false

  const hasLink = hasUrlEntity(message) || /https?:\/\/|www\.|t\.me\/|telegram\.me\/|bit\.ly|tinyurl|wa\.me\//i.test(text)
  const hasPromoWords = [
    'reklama',
    'реклама',
    'advertising',
    'promo',
    'aksiya',
    'скидка',
    'chegirma',
    'discount',
    'earn money',
    'tez pul',
    'заработ',
    'crypto',
    'airdrop',
    'casino',
    'betting',
    'ставк',
    'obuna bo',
    'подпис',
    'канал',
    'join',
    'kiring',
    'buy now',
    'sotiladi',
  ].some((term) => text.includes(term))
  const hasContactPush = /@\w{5,}|(\+?\d[\d\s().-]{8,}\d)/.test(text)

  return (hasLink && (hasPromoWords || hasContactPush)) || (hasPromoWords && hasContactPush)
}

async function sendTelegramMessage(chatId: number, text: string, options: TelegramSendMessageOptions = {}) {
  const botToken = getEnv('TELEGRAM_BOT_TOKEN')
  if (!botToken) {
    console.error('Telegram bot token is not configured')
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS)
  const payload: TelegramSendMessagePayload = {
    chat_id: chatId,
    text,
    ...options,
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.error('Telegram sendMessage failed', response.status)
    }
  } catch {
    console.error('Telegram sendMessage request failed')
  } finally {
    clearTimeout(timeout)
  }
}

async function deleteTelegramMessage(chatId: number, messageId: number) {
  const botToken = getEnv('TELEGRAM_BOT_TOKEN')
  if (!botToken) {
    console.error('Telegram bot token is not configured')
    return
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS)
  const payload: TelegramDeleteMessagePayload = {
    chat_id: chatId,
    message_id: messageId,
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/deleteMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    if (!response.ok) {
      console.error('Telegram deleteMessage failed', response.status)
    }
  } catch {
    console.error('Telegram deleteMessage request failed')
  } finally {
    clearTimeout(timeout)
  }
}

async function isMessageFromGroupAdmin(message: TelegramMessage) {
  const botToken = getEnv('TELEGRAM_BOT_TOKEN')
  const userId = message.from?.id

  if (!botToken || !userId || !isGroupChat(message.chat)) return false

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TELEGRAM_TIMEOUT_MS)

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}/bot${botToken}/getChatMember`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: message.chat.id,
        user_id: userId,
      }),
      signal: controller.signal,
    })

    if (!response.ok) return false
    const data = (await response.json()) as TelegramChatMemberResponse
    const status = data.result?.status
    return status === 'creator' || status === 'administrator'
  } catch {
    return false
  } finally {
    clearTimeout(timeout)
  }
}

async function askAiTutor(message: string) {
  const apiKey = getEnv('AI_GATEWAY_API_KEY')
  if (!apiKey) return null

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)

  try {
    const response = await fetch('https://ai-gateway.vercel.sh/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are Tilio, a friendly beginner language tutor for Uzbek speakers. Keep replies under 500 characters. Explain in Uzbek. Help with English, Korean, Russian, Arabic, or German. For simple vocabulary questions, answer with meaning and one short example. Refuse harmful, sensitive, or unrelated requests briefly.',
          },
          {
            role: 'user',
            content: message,
          },
        ],
        max_tokens: 140,
      }),
      signal: controller.signal,
    })

    if (!response.ok) return null
    const data = await response.json()
    const text = data.choices?.[0]?.message?.content
    return typeof text === 'string' && text.trim() ? text.trim() : null
  } catch {
    return null
  } finally {
    clearTimeout(timeout)
  }
}

async function handleNewMembers(message: TelegramMessage) {
  if (!isGroupChat(message.chat)) return

  const newMembers = message.new_chat_members?.filter((member) => !member.is_bot) ?? []
  if (newMembers.length === 0) return

  const names = newMembers
    .slice(0, 3)
    .map((member) => member.first_name?.trim() || 'do\'st')
    .join(', ')
  const suffix = newMembers.length > 3 ? ' va boshqalar' : ''

  await sendTelegramMessage(
    message.chat.id,
    `Xush kelibsiz, ${names}${suffix}! Tilio bilan har kuni kichik dars, yangi so'z va oson mashq. Boshlash uchun /app ni bosing.`,
    {
      reply_markup: appButtonMarkup,
      reply_to_message_id: message.message_id,
    },
  )
}

async function sendGroupWelcome(chat: TelegramChat, users: TelegramUser[]) {
  if (!isGroupChat(chat)) return

  const newMembers = users.filter((member) => !member.is_bot)
  if (newMembers.length === 0) return

  const names = newMembers
    .slice(0, 3)
    .map((member) => member.first_name?.trim() || 'do\'st')
    .join(', ')
  const suffix = newMembers.length > 3 ? ' va boshqalar' : ''

  await sendTelegramMessage(
    chat.id,
    `Xush kelibsiz, ${names}${suffix}! Tilio bilan har kuni kichik dars, yangi so'z va oson mashq. Boshlash uchun /app ni bosing.`,
    { reply_markup: appButtonMarkup },
  )
}

async function handleChatMemberUpdate(chatMember: TelegramChatMemberUpdated) {
  const oldStatus = chatMember.old_chat_member.status
  const newStatus = chatMember.new_chat_member.status
  const joined = (oldStatus === 'left' || oldStatus === 'kicked') && (newStatus === 'member' || newStatus === 'restricted')

  if (!joined) return
  await sendGroupWelcome(chatMember.chat, [chatMember.new_chat_member.user])
}

async function handleCommand(message: TelegramMessage, command: string) {
  const chatId = message.chat.id

  if (command === '/start') {
    await sendTelegramMessage(
      chatId,
      "Assalomu alaykum! Men Tilio botman. Inglizcha, koreyscha, ruscha, arabcha va nemischa so'zlarni qisqa tushuntirib beraman. Darslarni davom ettirish uchun Tilio ilovasini oching.",
      { reply_markup: appButtonMarkup },
    )
    return
  }

  if (command === '/help') {
    await sendTelegramMessage(
      chatId,
      [
        'Tilio buyruqlari:',
        '/start - botni boshlash',
        '/app - Tilio ilovasini ochish',
        '/daily - bugungi darsga qaytish',
        '/plus - Tilio Plus haqida',
        '/privacy - maxfiylik siyosati',
        '',
        "Guruhda meni mention qiling: @TilioBot book nima?",
      ].join('\n'),
    )
    return
  }

  if (command === '/app') {
    await sendTelegramMessage(chatId, "Tilio'ni oching va bugungi darsni davom ettiring.", {
      reply_markup: appButtonMarkup,
    })
    return
  }

  if (command === '/privacy') {
    await sendTelegramMessage(
      chatId,
      `Maxfiylik siyosati: ${TILIO_APP_URL}/privacy\n\nTilio progress, hisob va o'quv faoliyati ma'lumotlarini ilovani ishlatish va sinxronlash uchun saqlaydi.`,
      { disable_web_page_preview: true },
    )
    return
  }

  if (command === '/plus') {
    await sendTelegramMessage(
      chatId,
      "Tilio Plus aqlli takrorlash, xatolar mashqi, speaking/listening practice va AI tutor bilan ko'proq mashq qilish imkonini beradi.",
    )
    return
  }

  if (command === '/daily') {
    await sendTelegramMessage(chatId, "Bugungi kichik darsni oching. 5 daqiqa ham streak va xotira uchun katta qadam.", {
      reply_markup: appButtonMarkup,
    })
    return
  }

  await sendTelegramMessage(chatId, "Bu buyruqni hali bilmayman. /help orqali mavjud buyruqlarni ko'ring.")
}

async function handleMention(message: TelegramMessage, isAdmin = false) {
  const chatId = message.chat.id
  const cleanText = stripBotMention(getMessageText(message))
  const prompt = cleanText || "Qisqa til o'rganish maslahati ber."
  const replySlot = consumeTutorReplySlot(message, isAdmin)

  if (!replySlot.allowed) {
    return
  }

  if (isLikelySensitiveOrHarmful(prompt)) {
    await sendTelegramMessage(
      chatId,
      withTilioAppSuggestion("Bu mavzuda yordam bera olmayman. Til o'rganish bo'yicha savol bering.", replySlot.count),
      {
        reply_markup: appButtonMarkup,
        reply_to_message_id: message.message_id,
      },
    )
    return
  }

  const aiReply = getQuickTutorReply(prompt) ?? await askAiTutor(prompt)
  await sendTelegramMessage(
    chatId,
    withTilioAppSuggestion(aiReply ?? "Hozir javob berishda qiynaldim. Qisqaroq qilib yana so'rab ko'ring.", replySlot.count),
    {
      reply_markup: appButtonMarkup,
      reply_to_message_id: message.message_id,
    },
  )
}

export async function POST(req: Request) {
  const expectedSecret = getEnv('TELEGRAM_WEBHOOK_SECRET')
  const incomingSecret = req.headers.get('x-telegram-bot-api-secret-token') ?? ''

  if (!expectedSecret || incomingSecret !== expectedSecret) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const update = (await req.json()) as TelegramUpdate

    if (update.chat_member) {
      await handleChatMemberUpdate(update.chat_member)
      return jsonOk()
    }

    if (update.chat_join_request) {
      await sendGroupWelcome(update.chat_join_request.chat, [update.chat_join_request.from])
      return jsonOk()
    }

    const message = update.message

    if (!message?.chat?.id) {
      return jsonOk()
    }

    if (message.new_chat_members?.length) {
      await handleNewMembers(message)
      return jsonOk()
    }

    const isAdmin = await isMessageFromGroupAdmin(message)

    if (!isAdmin && isLikelyAdMessage(message)) {
      await deleteTelegramMessage(message.chat.id, message.message_id)
      return jsonOk()
    }

    if (!getMessageText(message)) {
      return jsonOk()
    }

    const command = getCommand(getMessageText(message))
    const isPrivate = message.chat.type === 'private'

    if (shouldSendFallbackWelcome(message, isAdmin)) {
      await sendFallbackWelcome(message)
    }

    if (!isPrivate && !shouldHandleGroupMessage(message)) {
      return jsonOk()
    }

    if (command) {
      await handleCommand(message, command)
      return jsonOk()
    }

    if (isPrivate) {
      await handleMention(message, isAdmin)
      return jsonOk()
    }

    if (hasMentionEntity(message) || isReplyToTilioBot(message)) {
      await handleMention(message, isAdmin)
    }

    return jsonOk()
  } catch (error) {
    console.error('Telegram webhook failed', error instanceof Error ? error.message : 'Unknown error')
    return jsonOk()
  }
}
