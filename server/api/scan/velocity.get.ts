import type { VelocityData, SprintSummary } from '~/types'

interface JiraSprintResponse {
  maxResults: number
  startAt: number
  isLast: boolean
  values: Array<{
    id: number
    name: string
    state: string
    startDate?: string
    endDate?: string
    completeDate?: string
  }>
}

interface JiraSprintIssuesResponse {
  total: number
  issues: Array<{
    key: string
    fields: {
      story_points?: number
      customfield_10016?: number // Common Jira story points field
    }
  }>
}

const MOCK_VELOCITY: VelocityData = {
  averagePointsPerSprint: 34,
  averageItemsPerSprint: 12,
  sprintLengthWeeks: 2,
  recentSprints: [
    { name: 'Sprint 23', completedPoints: 38, completedItems: 14, startDate: '2026-02-23', endDate: '2026-03-06' },
    { name: 'Sprint 22', completedPoints: 31, completedItems: 11, startDate: '2026-02-09', endDate: '2026-02-23' },
    { name: 'Sprint 21', completedPoints: 36, completedItems: 13, startDate: '2026-01-26', endDate: '2026-02-09' },
    { name: 'Sprint 20', completedPoints: 29, completedItems: 10, startDate: '2026-01-12', endDate: '2026-01-26' },
    { name: 'Sprint 19', completedPoints: 37, completedItems: 12, startDate: '2025-12-29', endDate: '2026-01-12' },
  ],
}

export default defineEventHandler(async () => {
  const config = useRuntimeConfig()

  // If no board ID configured, return mock data for development
  if (!config.jiraBoardId) {
    return { velocity: MOCK_VELOCITY }
  }

  if (!config.jiraBaseUrl || !config.jiraEmail || !config.jiraApiToken) {
    throw createError({
      statusCode: 500,
      message: 'Jira configuration missing. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env',
    })
  }

  const authHeader = `Basic ${Buffer.from(`${config.jiraEmail}:${config.jiraApiToken}`).toString('base64')}`
  const baseUrl = `https://${config.jiraBaseUrl}`

  try {
    // Fetch closed sprints for the board
    const sprintResponse = await $fetch<JiraSprintResponse>(
      `${baseUrl}/rest/agile/1.0/board/${config.jiraBoardId}/sprint`,
      {
        method: 'GET',
        headers: {
          Authorization: authHeader,
          Accept: 'application/json',
        },
        query: {
          state: 'closed',
          maxResults: 10,
        },
      },
    )

    const sprints = sprintResponse.values
    if (sprints.length === 0) {
      return { velocity: MOCK_VELOCITY }
    }

    // For each sprint, fetch completed issues and sum story points
    const sprintSummaries: SprintSummary[] = await Promise.all(
      sprints.map(async (sprint) => {
        const issuesResponse = await $fetch<JiraSprintIssuesResponse>(
          `${baseUrl}/rest/agile/1.0/sprint/${sprint.id}/issue`,
          {
            method: 'GET',
            headers: {
              Authorization: authHeader,
              Accept: 'application/json',
            },
            query: {
              jql: 'status in (Done, Closed)',
              fields: 'story_points,customfield_10016',
              maxResults: 200,
            },
          },
        )

        const completedPoints = issuesResponse.issues.reduce((sum, issue) => {
          const points = issue.fields.story_points
            ?? issue.fields.customfield_10016
            ?? 0
          return sum + points
        }, 0)

        return {
          name: sprint.name,
          completedPoints,
          completedItems: issuesResponse.issues.length,
          startDate: sprint.startDate ?? '',
          endDate: sprint.endDate ?? sprint.completeDate ?? '',
        }
      }),
    )

    // Calculate averages
    const totalPoints = sprintSummaries.reduce((sum, s) => sum + s.completedPoints, 0)
    const totalItems = sprintSummaries.reduce((sum, s) => sum + s.completedItems, 0)
    const count = sprintSummaries.length

    // Estimate sprint length from first sprint with valid dates
    let sprintLengthWeeks = 2 // default
    const sprintWithDates = sprintSummaries.find(s => s.startDate && s.endDate)
    if (sprintWithDates) {
      const start = new Date(sprintWithDates.startDate)
      const end = new Date(sprintWithDates.endDate)
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
      sprintLengthWeeks = Math.round(diffDays / 7) || 2
    }

    const velocity: VelocityData = {
      averagePointsPerSprint: count > 0 ? Math.round(totalPoints / count) : 0,
      averageItemsPerSprint: count > 0 ? Math.round(totalItems / count) : 0,
      sprintLengthWeeks,
      recentSprints: sprintSummaries,
    }

    return { velocity }
  }
  catch (e) {
    if ((e as { statusCode?: number }).statusCode) throw e
    const message = e instanceof Error ? e.message : 'Failed to fetch velocity data from Jira'
    throw createError({ statusCode: 502, message })
  }
})
