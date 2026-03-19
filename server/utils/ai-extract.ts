import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a product analyst. Extract actionable recommendations from this audit document. Return a JSON array of tickets. Each ticket should have:
- title: concise action-oriented name (e.g. "Add sort dropdown to operator list")
- priority: "P0" | "P1" | "P2" | "P3"
- effort: "Low" | "Medium" | "High"
- area: the feature area (e.g. "Card Design", "Mobile", "Filtering", "SEO", "Performance")
- suggestedLane: "New Product Features" | "Improvements" | "Site Hygiene"

Only extract concrete, implementable recommendations. Skip observations that don't have a clear action. Return ONLY the JSON array, no other text.`

interface AuditTicket {
  title: string
  priority: string
  effort: string
  area: string
  suggestedLane: string
}

function isValidTicket(t: unknown): t is AuditTicket {
  if (!t || typeof t !== 'object') return false
  const obj = t as Record<string, unknown>
  return typeof obj.title === 'string'
    && typeof obj.priority === 'string'
    && typeof obj.effort === 'string'
    && typeof obj.area === 'string'
    && typeof obj.suggestedLane === 'string'
}

export async function extractTicketsFromText(text: string): Promise<{ tickets: AuditTicket[] }> {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      message: 'ANTHROPIC_API_KEY not configured in .env',
    })
  }

  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please extract actionable tickets from the following audit document:\n\n${text.substring(0, 50000)}`,
      },
    ],
  })

  const responseText = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === 'text')
    .map(block => block.text)
    .join('')

  // Parse JSON from response
  const jsonMatch = responseText.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    throw createError({ statusCode: 500, message: 'No valid JSON array found in AI response' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonMatch[0])
  } catch {
    throw createError({ statusCode: 500, message: 'AI returned invalid JSON' })
  }

  if (!Array.isArray(parsed)) {
    throw createError({ statusCode: 500, message: 'AI response is not a JSON array' })
  }

  const tickets = parsed.filter(isValidTicket)

  if (tickets.length === 0) {
    throw createError({ statusCode: 500, message: 'No valid tickets extracted from AI response' })
  }

  return { tickets }
}
