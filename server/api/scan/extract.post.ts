import type { SlackMessageBatch, ConfluencePageBatch } from '~/types'
import { extractProjectsFromConversations } from '~/server/utils/ai-extract'

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    slackBatches: SlackMessageBatch[]
    confluenceBatches: ConfluencePageBatch[]
  }>(event)

  if (!body.slackBatches && !body.confluenceBatches) {
    throw createError({
      statusCode: 400,
      message: 'At least one of slackBatches or confluenceBatches must be provided',
    })
  }

  const slackBatches = body.slackBatches ?? []
  const confluenceBatches = body.confluenceBatches ?? []

  // Check that there is actually some content to extract from
  const totalSlackMessages = slackBatches.reduce((sum, b) => sum + b.messages.length, 0)
  const totalConfluencePages = confluenceBatches.reduce((sum, b) => sum + b.pages.length, 0)

  if (totalSlackMessages === 0 && totalConfluencePages === 0) {
    return { projects: [] }
  }

  try {
    return await extractProjectsFromConversations(slackBatches, confluenceBatches)
  }
  catch (e) {
    if ((e as { statusCode?: number }).statusCode) throw e
    const message = e instanceof Error ? e.message : 'Failed to extract projects from scan data'
    throw createError({ statusCode: 500, message })
  }
})
