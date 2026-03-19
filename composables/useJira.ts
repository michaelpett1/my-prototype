import { useRoadmapStore } from '~/stores/roadmap'
import type { RoadmapItem } from '~/types'

export function useJira() {
  const store = useRoadmapStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTickets(): Promise<RoadmapItem[]> {
    isLoading.value = true
    error.value = null

    try {
      const response = await $fetch<{ tickets: RoadmapItem[] }>('/api/jira/tickets')
      return response.tickets
    } catch (e: unknown) {
      const fetchErr = e as { data?: { message?: string } }
      error.value = fetchErr?.data?.message
        || (e instanceof Error ? e.message : 'Failed to fetch Jira tickets')
      return []
    } finally {
      isLoading.value = false
    }
  }

  async function importTickets() {
    const tickets = await fetchTickets()
    if (tickets.length > 0) {
      store.addItems(tickets)
    }
    return tickets.length
  }

  return {
    isLoading,
    error,
    fetchTickets,
    importTickets,
  }
}
