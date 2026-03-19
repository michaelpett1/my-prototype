import {
  createJiraClient,
  classifyTicketType,
  classifyLane,
  classifyPriority,
  classifyStatus,
  extractFirstName,
} from '~/server/utils/jira'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.jiraBaseUrl || !config.jiraEmail || !config.jiraApiToken) {
    throw createError({
      statusCode: 500,
      message: 'Jira configuration missing. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env',
    })
  }

  const client = createJiraClient({
    baseUrl: `https://${config.jiraBaseUrl}`,
    email: config.jiraEmail,
    apiToken: config.jiraApiToken,
    projectKey: config.jiraProjectKey,
  })

  try {
    const jql = `project = ${config.jiraProjectKey} AND status NOT IN (Done, Closed) ORDER BY priority DESC, updated DESC`
    const fields = ['summary', 'status', 'priority', 'assignee', 'issuetype', 'labels', 'created', 'updated']

    const issues = await client.searchIssues(jql, fields, 100)

    const tickets = issues.map(issue => ({
      key: issue.key,
      title: issue.fields.summary,
      status: classifyStatus(issue.fields.status.name),
      priority: classifyPriority(issue.fields.priority.name),
      assignee: extractFirstName(issue.fields.assignee?.displayName),
      ticketType: classifyTicketType(issue),
      lane: classifyLane(issue),
      weekIdx: -1,
      note: '',
      source: 'jira' as const,
      jiraUrl: `https://${config.jiraBaseUrl}/browse/${issue.key}`,
    }))

    return { tickets }
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch Jira tickets'
    throw createError({ statusCode: 502, message })
  }
})
