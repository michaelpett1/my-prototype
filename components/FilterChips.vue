<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { laneColor as getLaneColor } from '~/lib/colors'
import { LANES } from '~/types'
import type { LaneName, TicketType } from '~/types'

const store = useRoadmapStore()

const laneShortLabels: Record<LaneName, string> = {
  'New Product Features': 'Features',
  'Improvements': 'Improvements',
  'Site Hygiene': 'Hygiene',
}

const typeOptions: { key: TicketType; label: string; icon: string }[] = [
  { key: 'dev', label: 'Dev', icon: '💻' },
  { key: 'design', label: 'Design', icon: '🎨' },
  { key: 'both', label: 'Both', icon: '🔗' },
]

function isLaneSelected(lane: LaneName): boolean {
  return store.activeFilters.lanes.includes(lane)
}

function isTypeSelected(type: TicketType): boolean {
  return store.activeFilters.types.includes(type)
}

const hasFilters = computed(() =>
  store.activeFilters.lanes.length > 0 || store.activeFilters.types.length > 0
)
</script>

<template>
  <div class="flex items-center gap-1.5 flex-wrap">
    <!-- Lane chips -->
    <button
      v-for="lane in LANES"
      :key="lane.name"
      class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap"
      :class="isLaneSelected(lane.name)
        ? 'border-transparent text-white'
        : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'"
      :style="isLaneSelected(lane.name)
        ? { backgroundColor: getLaneColor(lane.name) }
        : {}"
      @click="store.toggleLaneFilter(lane.name)"
    >
      <span aria-hidden="true">{{ lane.icon }}</span>
      {{ laneShortLabels[lane.name] }}
    </button>

    <div class="w-px h-3.5 bg-border mx-0.5" />

    <!-- Type chips -->
    <button
      v-for="opt in typeOptions"
      :key="opt.key"
      class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap"
      :class="isTypeSelected(opt.key)
        ? 'border-ui-dark bg-ui-dark text-white'
        : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'"
      @click="store.toggleTypeFilter(opt.key)"
    >
      <span aria-hidden="true">{{ opt.icon }}</span>
      {{ opt.label }}
    </button>

    <!-- Clear filters -->
    <button
      v-if="hasFilters"
      class="text-xs text-text-tertiary hover:text-danger transition-colors ml-1"
      @click="store.clearFilters()"
    >
      Clear
    </button>
  </div>
</template>
