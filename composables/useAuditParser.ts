import { useRoadmapStore } from '~/stores/roadmap'
import type { RoadmapItem, LaneName } from '~/types'

export function useAuditParser() {
  const store = useRoadmapStore()
  const status = ref<'idle' | 'uploading' | 'extracting' | 'done' | 'error'>('idle')
  const error = ref<string | null>(null)
  const parsedCount = ref(0)

  async function uploadAndParse(file: File): Promise<number> {
    status.value = 'uploading'
    error.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)

      status.value = 'extracting'
      const response = await $fetch<{ tickets: Array<{
        title: string
        priority: string
        effort: string
        area: string
        suggestedLane: string
      }> }>('/api/audit/parse', {
        method: 'POST',
        body: formData,
      })

      if (response.tickets && response.tickets.length > 0) {
        // Find the next available AUDIT key number
        const existingAuditItems = store.items.filter(i => i.source === 'audit')
        const startIdx = existingAuditItems.length + 1

        const items: RoadmapItem[] = response.tickets.map((t, idx) => ({
          key: `AUDIT-${String(startIdx + idx).padStart(2, '0')}`,
          title: t.title,
          status: 'New' as const,
          priority: t.priority === 'P0' || t.priority === 'High' ? 'High' as const
            : t.priority === 'P1' || t.priority === 'Medium' ? 'Medium' as const
            : 'Low' as const,
          assignee: null,
          ticketType: 'both' as const,
          lane: (t.suggestedLane || 'Improvements') as LaneName,
          weekIdx: -1,
          note: '',
          source: 'audit' as const,
          auditPriority: t.priority,
          auditEffort: t.effort,
          auditArea: t.area,
        }))

        store.addItems(items)
        parsedCount.value = items.length
        status.value = 'done'
        return items.length
      }

      error.value = 'No actionable items found'
      status.value = 'error'
      return 0
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to parse audit PDF'
      status.value = 'error'
      return 0
    }
  }

  function reset() {
    status.value = 'idle'
    error.value = null
    parsedCount.value = 0
  }

  return {
    status,
    error,
    parsedCount,
    uploadAndParse,
    reset,
  }
}
