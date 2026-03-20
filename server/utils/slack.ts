import type { SlackMessage } from '~/types'

interface SlackSearchResponse {
  ok: boolean
  error?: string
  messages?: {
    total: number
    matches: Array<{
      channel: { id: string; name: string }
      username: string
      text: string
      ts: string
      thread_ts?: string
      permalink?: string
    }>
  }
}

interface SlackConversationsListResponse {
  ok: boolean
  error?: string
  channels?: Array<{
    id: string
    name: string
  }>
  response_metadata?: {
    next_cursor?: string
  }
}

interface SlackHistoryResponse {
  ok: boolean
  error?: string
  messages?: Array<{
    user?: string
    text: string
    ts: string
    thread_ts?: string
  }>
  has_more?: boolean
  response_metadata?: {
    next_cursor?: string
  }
}

export function createSlackClient(token: string) {
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }

  async function searchMessages(query: string, count = 100): Promise<SlackMessage[]> {
    const response = await $fetch<SlackSearchResponse>(
      'https://slack.com/api/search.messages',
      {
        method: 'GET',
        headers,
        query: {
          query,
          count,
          sort: 'timestamp',
          sort_dir: 'desc',
        },
      },
    )

    if (!response.ok) {
      throw createError({
        statusCode: 502,
        message: `Slack API error: ${response.error || 'unknown error'}`,
      })
    }

    const matches = response.messages?.matches ?? []

    return matches.map(match => ({
      channel: match.channel.name,
      channelId: match.channel.id,
      user: match.username,
      text: match.text,
      ts: match.ts,
      threadTs: match.thread_ts,
      permalink: match.permalink,
    }))
  }

  async function listChannels(): Promise<Array<{ id: string; name: string }>> {
    const allChannels: Array<{ id: string; name: string }> = []
    let cursor: string | undefined

    do {
      const response = await $fetch<SlackConversationsListResponse>(
        'https://slack.com/api/conversations.list',
        {
          method: 'GET',
          headers,
          query: {
            types: 'public_channel,private_channel',
            limit: 200,
            exclude_archived: true,
            ...(cursor ? { cursor } : {}),
          },
        },
      )

      if (!response.ok) {
        throw createError({
          statusCode: 502,
          message: `Slack API error: ${response.error || 'unknown error'}`,
        })
      }

      const channels = response.channels ?? []
      allChannels.push(...channels.map(ch => ({ id: ch.id, name: ch.name })))

      cursor = response.response_metadata?.next_cursor || undefined
    } while (cursor)

    return allChannels
  }

  async function getChannelHistory(channelId: string, oldest?: string): Promise<SlackMessage[]> {
    const allMessages: SlackMessage[] = []
    let cursor: string | undefined

    do {
      const response = await $fetch<SlackHistoryResponse>(
        'https://slack.com/api/conversations.history',
        {
          method: 'GET',
          headers,
          query: {
            channel: channelId,
            limit: 200,
            ...(oldest ? { oldest } : {}),
            ...(cursor ? { cursor } : {}),
          },
        },
      )

      if (!response.ok) {
        throw createError({
          statusCode: 502,
          message: `Slack API error: ${response.error || 'unknown error'}`,
        })
      }

      const messages = response.messages ?? []
      allMessages.push(
        ...messages.map(msg => ({
          channel: '',
          channelId,
          user: msg.user ?? 'unknown',
          text: msg.text,
          ts: msg.ts,
          threadTs: msg.thread_ts,
        })),
      )

      cursor = response.response_metadata?.next_cursor || undefined
    } while (cursor)

    return allMessages
  }

  return { searchMessages, listChannels, getChannelHistory }
}
