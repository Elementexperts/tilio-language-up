export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { message, courseId } = await req.json()

    const apiKey = process.env.AI_GATEWAY_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: "Missing AI_GATEWAY_API_KEY" },
        { status: 500 }
      )
    }

    const systemPrompt =
      courseId === "uz-ko"
        ? "You are a friendly Korean tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better Korean phrase."
        : "You are a friendly English tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better English phrase."

    const response = await fetch("https://ai-gateway.vercel.sh/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 150,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      return Response.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? "No response"

    return Response.json({ text })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "AI tutor failed" },
      { status: 500 }
    )
  }
}