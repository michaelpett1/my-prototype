import type { SlackMessageBatch } from '~/types'
import { createSlackClient } from '~/server/utils/slack'

const ROADMAP_QUERIES = [
  'roadmap',
  'we need to build',
  'project plan',
  'Q2',
  'initiative',
  'deliverable',
]

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.slackBotToken) {
    throw createError({
      statusCode: 500,
      message: 'SLACK_BOT_TOKEN not configured. Add it to your .env file.',
    })
  }

  const body = await readBody<{ daysBack?: number }>(event) ?? {}
  const daysBack = body.daysBack ?? 30

  const client = createSlackClient(config.slackBotToken)

  try {
    // Search for roadmap signals across all configured queries
    const searchPromises = ROADMAP_QUERIES.map(query =>
      client.searchMessages(`${query} after:${getDateDaysAgo(daysBack)}`, 50),
    )

    const searchResults = await Promise.all(searchPromises)

    // Flatten all messages and deduplicate by timestamp + channel
    const seen = new Set<string>()
    const allMessages = searchResults.flat().filter((msg) => {
      const key = `${msg.channelId}:${msg.ts}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // Group messages by channel
    const channelMap = new Map<string, SlackMessageBatch>()

    for (const msg of allMessages) {
      if (!channelMap.has(msg.channelId)) {
        channelMap.set(msg.channelId, {
          channelId: msg.channelId,
          channelName: msg.channel,
          messages: [],
        })
      }
      channelMap.get(msg.channelId)!.messages.push(msg)
    }

    // Sort messages within each batch by timestamp descending
    const batches: SlackMessageBatch[] = Array.from(channelMap.values()).map(batch => ({
      ...batch,
      messages: batch.messages.sort((a, b) => parseFloat(b.ts) - parseFloat(a.ts)),
    }))

    return { batches }
  }
  catch (e) {
    if ((e as { statusCode?: number }).statusCode) throw e
    const message = e instanceof Error ? e.message : 'Failed to scan Slack messages'
    throw createError({ statusCode: 502, message })
  }
})

function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}
