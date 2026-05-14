import { streamText } from "ai"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { message, courseId } = await req.json()

    const apiKey = process.env.AI_GATEWAY_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: "Missing AI Gateway API key" },
        { status: 500 }
      )
    }

    const systemPrompt =
      courseId === "uz-ko"
        ? `
You are a friendly Korean tutor for Uzbek-speaking beginners.
Explain things in Uzbek.
Keep answers short and beginner-friendly.
Correct mistakes gently.
Always suggest one better Korean phrase.
`
        : `
You are a friendly English tutor for Uzbek-speaking beginners.
Explain things in Uzbek.
Keep answers short and beginner-friendly.
Correct mistakes gently.
Always suggest one better English phrase.
`

    const result = await streamText({
      model: "openai/gpt-4o-mini",
      apiKey,
      system: systemPrompt,
      prompt: message,
      maxTokens: 150,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error(error)

    return Response.json(
      { error: "AI tutor failed" },
      { status: 500 }
    )
  }
}