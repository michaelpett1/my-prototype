import { useRoadmapStore } from '~/stores/roadmap'
import type {
  RoadmapItem,
  ExtractedProject,
  SlackMessageBatch,
  ConfluencePageBatch,
} from '~/types'
import { toConfidenceLevel } from '~/types'

type ScanStatus = 'idle' | 'scanning-slack' | 'scanning-confluence' | 'extracting' | 'done' | 'error'

function convertToRoadmapItem(project: ExtractedProject): RoadmapItem {
  const key = `SCAN-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`.toUpperCase()
  const confidenceLevel = toConfidenceLevel(project.confidence)

  return {
    key,
    title: project.title,
    description: project.description,
    status: 'proposed',
    priority: project.priority,
    assignee: null,
    lane: project.suggestedLane,
    projectSize: project.estimatedDurationWeeks > 1 ? 'epic' : 'deliverable',
    durationWeeks: project.estimatedDurationWeeks,
    startWeekIdx: -1,
    endWeekIdx: -1,
    effortPoints: project.effortPoints,
    confidence: project.confidence,
    confidenceLevel,
    sources: project.sources,
    note: '',
    scanId: `scan-${Date.now()}`,
  }
}

export function useScan() {
  const store = useRoadmapStore()
  const status = ref<ScanStatus>('idle')
  const progress = ref({ slackChannels: 0, confluencePages: 0, projects: 0 })
  const error = ref<string | null>(null)

  let doneResetTimer: ReturnType<typeof setTimeout> | null = null

  async function runScan(options?: { daysBack?: number }) {
    // Clear previous state
    error.value = null
    progress.value = { slackChannels: 0, confluencePages: 0, projects: 0 }

    if (doneResetTimer) {
      clearTimeout(doneResetTimer)
      doneResetTimer = null
    }

    try {
      status.value = 'scanning-slack'
      const slackResult = await $fetch<{ batches: SlackMessageBatch[] }>('/api/scan/slack', {
        method: 'POST',
        body: { daysBack: options?.daysBack ?? 30 },
      })
      progress.value.slackChannels = slackResult.batches.length

      status.value = 'scanning-confluence'
      const confluenceResult = await $fetch<{ batches: ConfluencePageBatch[] }>('/api/scan/confluence', {
        method: 'POST',
        body: { daysBack: options?.daysBack ?? 30 },
      })
      progress.value.confluencePages = confluenceResult.batches.reduce(
        (sum, b) => sum + b.pages.length,
        0,
      )

      status.value = 'extracting'
      const extractResult = await $fetch<{ projects: ExtractedProject[] }>('/api/scan/extract', {
        method: 'POST',
        body: {
          slackBatches: slackResult.batches,
          confluenceBatches: confluenceResult.batches,
        },
      })

      // Convert ExtractedProject[] to RoadmapItem[] and add to store
      const items = extractResult.projects.map(convertToRoadmapItem)
      store.addItems(items)
      progress.value.projects = items.length
      status.value = 'done'

      // Auto-reset to idle after 3 seconds
      doneResetTimer = setTimeout(() => {
        if (status.value === 'done') {
          status.value = 'idle'
        }
      }, 3000)
    }
    catch (e: unknown) {
      const fetchErr = e as { data?: { message?: string } }
      error.value = fetchErr?.data?.message || (e instanceof Error ? e.message : 'Scan failed')
      status.value = 'error'
    }
  }

  onUnmounted(() => {
    if (doneResetTimer) {
      clearTimeout(doneResetTimer)
    }
  })

  return { status, progress, error, runScan }
}
