import type { ConfluencePage } from '~/types'

interface ConfluenceConfig {
  baseUrl: string
  email: string
  apiToken: string
}

interface ConfluenceSearchResponse {
  results: Array<{
    id: string
    title: string
    type: string
    _expandable?: {
      space?: string
    }
    space?: {
      key: string
      name: string
    }
    body?: {
      storage?: {
        value: string
      }
    }
    _links?: {
      webui?: string
    }
    history?: {
      lastUpdated?: {
        when: string
      }
    }
  }>
  size: number
  totalSize: number
  _links?: {
    next?: string
  }
}

interface ConfluencePageResponse {
  id: string
  title: string
  space?: {
    key: string
    name: string
  }
  body?: {
    storage?: {
      value: string
    }
  }
  _links?: {
    webui?: string
  }
  history?: {
    lastUpdated?: {
      when: string
    }
  }
}

function stripHtmlTags(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

export function createConfluenceClient(config: ConfluenceConfig) {
  const authHeader = `Basic ${Buffer.from(`${config.email}:${config.apiToken}`).toString('base64')}`

  const headers = {
    Authorization: authHeader,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  }

  async function searchPages(cql: string, limit = 25): Promise<ConfluencePage[]> {
    const response = await $fetch<ConfluenceSearchResponse>(
      `${config.baseUrl}/rest/api/content/search`,
      {
        method: 'GET',
        headers,
        query: {
          cql,
          limit,
          expand: 'space,history.lastUpdated,body.storage',
        },
      },
    )

    return response.results.map(result => ({
      id: result.id,
      title: result.title,
      spaceKey: result.space?.key ?? '',
      spaceName: result.space?.name ?? '',
      url: result._links?.webui
        ? `${config.baseUrl}${result._links.webui}`
        : '',
      bodyText: stripHtmlTags(result.body?.storage?.value ?? ''),
      lastModified: result.history?.lastUpdated?.when ?? '',
    }))
  }

  async function getPageContent(pageId: string): Promise<string> {
    const response = await $fetch<ConfluencePageResponse>(
      `${config.baseUrl}/rest/api/content/${pageId}`,
      {
        method: 'GET',
        headers,
        query: {
          expand: 'body.storage',
        },
      },
    )

    const rawHtml = response.body?.storage?.value ?? ''
    return stripHtmlTags(rawHtml)
  }

  async function getRecentPages(daysBack = 30): Promise<ConfluencePage[]> {
    const cql = `type = page AND lastModified >= now("-${daysBack}d") ORDER BY lastModified DESC`
    return searchPages(cql, 50)
  }

  return { searchPages, getPageContent, getRecentPages }
}
