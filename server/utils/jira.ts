import type { JiraIssue } from '~/types'

interface JiraConfig {
  baseUrl: string
  email: string
  apiToken: string
  projectKey: string
}

interface JiraSearchResponse {
  issues: JiraIssue[]
  total: number
  maxResults: number
  startAt: number
}

export function createJiraClient(config: JiraConfig) {
  const authHeader = `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`

  async function searchIssues(jql: string, fields: string[], maxResults = 50): Promise<JiraIssue[]> {
    const allIssues: JiraIssue[] = []
    let startAt = 0
    const MAX_PAGES = 20

    while (allIssues.length < MAX_PAGES * maxResults) {
      const response = await $fetch<JiraSearchResponse>(
        `${config.baseUrl}/rest/api/3/search`,
        {
          method: 'POST',
          headers: {
            Authorization: authHeader,
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: {
            jql,
            fields,
            maxResults,
            startAt,
          },
        },
      )

      allIssues.push(...response.issues)

      if (allIssues.length >= response.total || response.issues.length === 0) {
        break
      }

      startAt += response.issues.length
    }

    return allIssues
  }

  return { searchIssues }
}

export function classifyTicketType(issue: JiraIssue): 'dev' | 'design' | 'both' {
  const summary = issue.fields.summary.toLowerCase()
  const issueType = issue.fields.issuetype.name.toLowerCase()
  const labels = issue.fields.labels.map(l => l.toLowerCase())

  if (summary.includes('[ux]') || issueType.includes('ux') || labels.includes('design')) {
    return 'design'
  }
  if (summary.includes('[dev]') || issueType === 'bug' || labels.includes('dev')) {
    return 'dev'
  }
  if (issueType.includes('cross-functional') || labels.includes('cross-functional')) {
    return 'both'
  }
  return 'dev'
}

export function classifyLane(issue: JiraIssue): 'New Product Features' | 'Improvements' | 'Site Hygiene' {
  const summary = issue.fields.summary.toLowerCase()
  const issueType = issue.fields.issuetype.name.toLowerCase()
  const labels = issue.fields.labels.map(l => l.toLowerCase())

  // Site Hygiene
  if (issueType === 'bug' || summary.includes('[bug]') || labels.includes('bug') || labels.includes('research') || labels.includes('hygiene')) {
    return 'Site Hygiene'
  }

  // New Product Features
  if (summary.includes('[ux]') && (summary.includes('redesign') || summary.includes('new'))) {
    return 'New Product Features'
  }
  if (labels.includes('new-feature') || labels.includes('feature')) {
    return 'New Product Features'
  }

  // Improvements (CRO)
  if (summary.includes('[cro]') || labels.includes('cro') || labels.includes('improvement')) {
    return 'Improvements'
  }

  return 'Improvements'
}

export function classifyPriority(jiraPriority: string): 'Blocked' | 'High' | 'Medium' | 'Low' {
  const p = jiraPriority.toLowerCase()
  if (p === 'blocker' || p === 'highest') return 'Blocked'
  if (p === 'high') return 'High'
  if (p === 'medium') return 'Medium'
  return 'Low'
}

export function classifyStatus(jiraStatus: string): 'Backlog' | 'To Do' | 'In Progress' | 'In QA' | 'In Product' | 'New' {
  const s = jiraStatus.toLowerCase()
  if (s.includes('progress') || s.includes('dev')) return 'In Progress'
  if (s.includes('qa') || s.includes('review') || s.includes('test')) return 'In QA'
  if (s.includes('product') || s.includes('done') || s.includes('release')) return 'In Product'
  if (s.includes('to do') || s.includes('open') || s.includes('ready')) return 'To Do'
  return 'Backlog'
}

export function extractFirstName(displayName: string | null | undefined): string | null {
  if (!displayName) return null
  return displayName.split(' ')[0]
}
