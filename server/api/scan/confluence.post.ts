import type { ConfluencePageBatch } from '~/types'
import { createConfluenceClient } from '~/server/utils/confluence'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  if (!config.jiraBaseUrl || !config.jiraEmail || !config.jiraApiToken) {
    throw createError({
      statusCode: 500,
      message: 'Jira/Confluence configuration missing. Set JIRA_BASE_URL, JIRA_EMAIL, and JIRA_API_TOKEN in .env',
    })
  }

  const body = await readBody<{ daysBack?: number }>(event) ?? {}
  const daysBack = body.daysBack ?? 30

  // Derive Confluence base URL from Jira config
  // jiraBaseUrl is typically "gdcgroup.atlassian.net" — Confluence is at the /wiki path
  const confluenceBaseUrl = config.confluenceBaseUrl
    || `https://${config.jiraBaseUrl}/wiki`

  const client = createConfluenceClient({
    baseUrl: confluenceBaseUrl,
    email: config.jiraEmail,
    apiToken: config.jiraApiToken,
  })

  try {
    // Search for recently modified pages
    const cql = `type = page AND lastModified >= now("-${daysBack}d") ORDER BY lastModified DESC`
    const pages = await client.searchPages(cql, 50)

    // Fetch full body text for each page (search results may have truncated content)
    const pagesWithContent = await Promise.all(
      pages.map(async (page) => {
        try {
          const bodyText = await client.getPageContent(page.id)
          return { ...page, bodyText }
        }
        catch {
          // If we can't fetch content for a single page, keep the search result text
          return page
        }
      }),
    )

    // Group pages by space
    const spaceMap = new Map<string, ConfluencePageBatch>()

    for (const page of pagesWithContent) {
      if (!spaceMap.has(page.spaceKey)) {
        spaceMap.set(page.spaceKey, {
          spaceKey: page.spaceKey,
          spaceName: page.spaceName,
          pages: [],
        })
      }
      spaceMap.get(page.spaceKey)!.pages.push(page)
    }

    const batches: ConfluencePageBatch[] = Array.from(spaceMap.values())

    return { batches }
  }
  catch (e) {
    if ((e as { statusCode?: number }).statusCode) throw e
    const message = e instanceof Error ? e.message : 'Failed to scan Confluence pages'
    throw createError({ statusCode: 502, message })
  }
})
