<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import type { RoadmapItem } from '~/types'

type InboxTab = 'all' | 'low-confidence' | 'manual'

const props = defineProps<{
  activeTab: string
}>()

const emit = defineEmits<{
  'update:active-tab': [tab: InboxTab]
  'toggle-audit-uploader': []
  'scan': []
}>()

const store = useRoadmapStore()
const search = ref('')

const currentTab = computed<InboxTab>(() => {
  const t = props.activeTab as InboxTab
  if (['all', 'low-confidence', 'manual'].includes(t)) return t
  return 'all'
})

const allItems = computed(() => {
  const sorted = [...store.inboxItems].sort((a, b) => b.confidence - a.confidence)
  if (!search.value) return sorted
  const q = search.value.toLowerCase()
  return sorted.filter(i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q))
})

const lowConfidenceItemsList = computed(() => {
  return allItems.value.filter(i => i.confidenceLevel === 'low')
})

const manualItems = computed(() => {
  return allItems.value.filter(i => i.sources.some(s => s.type === 'manual'))
})

const filteredItems = computed(() => {
  switch (currentTab.value) {
    case 'low-confidence': return lowConfidenceItemsList.value
    case 'manual': return manualItems.value
    default: return allItems.value
  }
})

const tabCounts = computed(() => ({
  all: store.inboxItems.length,
  'low-confidence': store.lowConfidenceItems.length,
  manual: store.inboxItems.filter(i => i.sources.some(s => s.type === 'manual')).length,
}))

const tabs: { key: InboxTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'low-confidence', label: 'Low Confidence' },
  { key: 'manual', label: 'Manual' },
]

function handleItemClick(item: RoadmapItem) {
  store.startTriage(item)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Scan button -->
    <div class="p-3 border-b border-border-subtle">
      <button
        class="w-full px-4 py-2 bg-accent text-white text-xs font-semibold rounded-lg hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
        @click="emit('scan')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        Scan
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex border-b border-border-subtle p-2 gap-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 px-2 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap"
        :class="currentTab === tab.key ? 'bg-surface-raised text-text-primary' : 'text-text-tertiary hover:text-text-secondary'"
        @click="emit('update:active-tab', tab.key)"
      >
        {{ tab.label }}
        <span
          class="ml-1 px-1.5 py-0.5 text-[10px] rounded-full font-bold"
          :class="currentTab === tab.key ? 'bg-accent/10 text-accent' : 'bg-surface-raised text-text-tertiary'"
        >
          {{ tabCounts[tab.key] }}
        </span>
      </button>
    </div>

    <!-- Search -->
    <div class="px-3 py-2">
      <input
        v-model="search"
        type="text"
        placeholder="Search projects..."
        class="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border-subtle rounded-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      >
    </div>

    <!-- Item list -->
    <div class="flex-1 overflow-y-auto px-2 pb-2">
      <TransitionGroup name="inbox" tag="div" class="space-y-1.5">
        <InboxCard
          v-for="item in filteredItems"
          :key="item.key"
          :item="item"
          @triage="handleItemClick(item)"
        />
      </TransitionGroup>

      <div v-if="filteredItems.length === 0" class="flex flex-col items-center py-8 text-center">
        <div class="text-3xl mb-2 opacity-60" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-text-tertiary">
            <rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <p class="text-xs text-text-tertiary">
          No items in {{ currentTab === 'all' ? 'inbox' : currentTab === 'low-confidence' ? 'low confidence' : 'manual entries' }}
        </p>
      </div>
    </div>
  </div>
</template>
