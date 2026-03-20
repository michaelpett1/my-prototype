import Anthropic from '@anthropic-ai/sdk'
import type { SlackMessageBatch, ConfluencePageBatch, ExtractedProject, LaneName, Priority, SourceReference } from '~/types'

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

// ── Project extraction from Slack + Confluence conversations ─────────

const PROJECT_EXTRACTION_PROMPT = `You are a senior product manager analysing internal communications to identify planned work items for a product roadmap.

Given Slack messages and Confluence page content, extract **project-level work items** — NOT individual tasks or bugs, but meaningful deliverables or initiatives.

For each project you identify:
- title: Clear, concise project name (e.g. "Operator Review Page Redesign", "Mobile Betslip Improvements")
- description: 1-2 sentence summary of what the project involves
- suggestedLane: One of "New Product Features" | "Improvements" | "Site Hygiene"
  - "New Product Features" = net-new capabilities, major new pages/flows
  - "Improvements" = enhancements to existing features, CRO, UX refinements
  - "Site Hygiene" = bugs, tech debt, performance, SEO fixes, compliance
- estimatedDurationWeeks: Estimated duration (1 for small items, 2-5 for epics, up to 8 for major initiatives)
- effortPoints: Story point estimate (1-13 scale, Fibonacci-ish: 1, 2, 3, 5, 8, 13)
- confidence: How certain this is actually planned work:
  - 0.8-1.0 = explicitly planned, assigned, or committed to
  - 0.5-0.8 = actively discussed, likely to happen
  - 0.2-0.5 = mentioned in passing, vague, aspirational
- priority: "High" | "Medium" | "Low" | "Blocked"
- sources: Array of source references where this project was mentioned, each with:
  - type: "slack" or "confluence"
  - id: channel ID or page ID
  - title: channel name or page title
  - excerpt: the relevant text snippet (max 200 chars)
  - timestamp: ISO 8601 date string

Rules:
1. DEDUPLICATE: If the same project is mentioned in multiple places, merge into one item with multiple sources
2. SKIP noise: Ignore casual chat, off-topic messages, meeting logistics
3. AGGREGATE: Group related discussions into a single project (e.g. multiple messages about "redesigning the homepage" = one project)
4. BE SPECIFIC: "Improve performance" is too vague — "Reduce operator page load time below 2s" is better
5. MINIMUM CONFIDENCE: Only include items with confidence >= 0.2

Return ONLY a JSON array of project objects. No other text.`

function isValidExtractedProject(p: unknown): p is ExtractedProject {
  if (!p || typeof p !== 'object') return false
  const obj = p as Record<string, unknown>
  const validLanes: LaneName[] = ['New Product Features', 'Improvements', 'Site Hygiene']
  const validPriorities: Priority[] = ['Blocked', 'High', 'Medium', 'Low']

  return typeof obj.title === 'string'
    && typeof obj.description === 'string'
    && typeof obj.suggestedLane === 'string'
    && validLanes.includes(obj.suggestedLane as LaneName)
    && typeof obj.estimatedDurationWeeks === 'number'
    && typeof obj.effortPoints === 'number'
    && typeof obj.confidence === 'number'
    && obj.confidence >= 0 && obj.confidence <= 1
    && typeof obj.priority === 'string'
    && validPriorities.includes(obj.priority as Priority)
    && Array.isArray(obj.sources)
}

function buildConversationContext(
  slackBatches: SlackMessageBatch[],
  confluenceBatches: ConfluencePageBatch[],
): string {
  const parts: string[] = []

  // Slack context
  if (slackBatches.length > 0) {
    parts.push('=== SLACK MESSAGES ===\n')
    for (const batch of slackBatches) {
      parts.push(`--- Channel: #${batch.channelName} (${batch.channelId}) ---`)
      for (const msg of batch.messages) {
        const date = new Date(parseFloat(msg.ts) * 1000).toISOString()
        parts.push(`[${date}] @${msg.user}: ${msg.text}`)
      }
      parts.push('')
    }
  }

  // Confluence context
  if (confluenceBatches.length > 0) {
    parts.push('=== CONFLUENCE PAGES ===\n')
    for (const batch of confluenceBatches) {
      parts.push(`--- Space: ${batch.spaceName} (${batch.spaceKey}) ---`)
      for (const page of batch.pages) {
        parts.push(`Page: "${page.title}" (ID: ${page.id})`)
        parts.push(`Last modified: ${page.lastModified}`)
        parts.push(`URL: ${page.url}`)
        // Truncate very long page content to keep within token limits
        const truncatedBody = page.bodyText.substring(0, 5000)
        parts.push(`Content:\n${truncatedBody}`)
        if (page.bodyText.length > 5000) {
          parts.push('... [content truncated]')
        }
        parts.push('')
      }
    }
  }

  return parts.join('\n')
}

function normaliseSource(source: Record<string, unknown>): SourceReference {
  return {
    type: (source.type as string === 'slack' || source.type === 'confluence')
      ? source.type as 'slack' | 'confluence'
      : 'slack',
    id: String(source.id ?? ''),
    title: String(source.title ?? ''),
    url: source.url ? String(source.url) : undefined,
    excerpt: String(source.excerpt ?? '').substring(0, 200),
    timestamp: String(source.timestamp ?? new Date().toISOString()),
  }
}

export async function extractProjectsFromConversations(
  slackBatches: SlackMessageBatch[],
  confluenceBatches: ConfluencePageBatch[],
): Promise<{ projects: ExtractedProject[] }> {
  const config = useRuntimeConfig()

  if (!config.anthropicApiKey) {
    throw createError({
      statusCode: 500,
      message: 'ANTHROPIC_API_KEY not configured in .env',
    })
  }

  const conversationContext = buildConversationContext(slackBatches, confluenceBatches)

  if (conversationContext.trim().length === 0) {
    return { projects: [] }
  }

  const client = new Anthropic({ apiKey: config.anthropicApiKey })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 8192,
    system: PROJECT_EXTRACTION_PROMPT,
    messages: [
      {
        role: 'user',
        content: `Please analyse the following internal communications and extract project-level roadmap items:\n\n${conversationContext.substring(0, 80000)}`,
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
    throw createError({ statusCode: 500, message: 'No valid JSON array found in AI response for project extraction' })
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(jsonMatch[0])
  }
  catch {
    throw createError({ statusCode: 500, message: 'AI returned invalid JSON during project extraction' })
  }

  if (!Array.isArray(parsed)) {
    throw createError({ statusCode: 500, message: 'AI response is not a JSON array' })
  }

  const projects: ExtractedProject[] = parsed
    .filter(isValidExtractedProject)
    .map(p => ({
      ...p,
      sources: Array.isArray(p.sources)
        ? p.sources.map((s: Record<string, unknown>) => normaliseSource(s))
        : [],
    }))

  return { projects }
}
