export const runtime = "edge"

const androidOrigin = "https://localhost"

function corsHeaders(req: Request) {
  const origin = req.headers.get("origin")
  return origin === androidOrigin
    ? {
        "Access-Control-Allow-Origin": androidOrigin,
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        Vary: "Origin",
      }
    : undefined
}

export function OPTIONS(req: Request) {
  if (req.headers.get("origin") !== androidOrigin) {
    return new Response(null, { status: 403 })
  }
  return new Response(null, { status: 204, headers: corsHeaders(req) })
}

export async function POST(req: Request) {
  try {
    const { message, courseId } = await req.json()

    const apiKey = process.env.AI_GATEWAY_API_KEY

    if (!apiKey) {
      return Response.json(
        { error: "Missing AI_GATEWAY_API_KEY" },
        { status: 500, headers: corsHeaders(req) }
      )
    }

    const tutorPrompts: Record<string, string> = {
      "uz-ko": "You are a friendly Korean tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better Korean phrase.",
      "uz-ru": "You are a friendly Russian tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better Russian phrase in Cyrillic with simple romanization when helpful.",
      "uz-ar": "You are a friendly Arabic tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better Arabic phrase with simple romanization.",
      "uz-de": "You are a friendly German tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better German phrase.",
    }
    const systemPrompt = tutorPrompts[courseId] ?? "You are a friendly English tutor for Uzbek-speaking beginners. Explain in Uzbek. Keep response short. Correct mistakes gently and suggest one better English phrase."

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
      return Response.json({ error: errorText }, { status: response.status, headers: corsHeaders(req) })
    }

    const data = await response.json()
    const text = data.choices?.[0]?.message?.content ?? "No response"

    return Response.json({ text }, { headers: corsHeaders(req) })
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "AI tutor failed" },
      { status: 500, headers: corsHeaders(req) }
    )
  }
}
