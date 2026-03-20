<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { laneColor as getLaneColor } from '~/lib/colors'
import { LANES } from '~/types'
import type { LaneName, ItemSource, ConfidenceLevel } from '~/types'

const store = useRoadmapStore()

const laneShortLabels: Record<LaneName, string> = {
  'New Product Features': 'Features',
  'Improvements': 'Improvements',
  'Site Hygiene': 'Hygiene',
}

const sourceOptions: { key: ItemSource; label: string; icon: string }[] = [
  { key: 'slack', label: 'Slack', icon: '#' },
  { key: 'confluence', label: 'Confluence', icon: '&#9776;' },
  { key: 'manual', label: 'Manual', icon: '&#9998;' },
]

const confidenceOptions: { key: ConfidenceLevel; label: string; color: string }[] = [
  { key: 'high', label: 'High', color: '#39B54A' },
  { key: 'medium', label: 'Med', color: '#F59E0B' },
  { key: 'low', label: 'Low', color: '#EF4444' },
]

function isLaneSelected(lane: LaneName): boolean {
  return store.activeFilters.lanes.includes(lane)
}

function isSourceSelected(source: ItemSource): boolean {
  return store.activeFilters.sources.includes(source)
}

function isConfidenceSelected(level: ConfidenceLevel): boolean {
  return store.activeFilters.confidenceLevels.includes(level)
}

const hasFilters = computed(() =>
  store.activeFilters.lanes.length > 0
  || store.activeFilters.sources.length > 0
  || store.activeFilters.confidenceLevels.length > 0,
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

    <!-- Source chips -->
    <button
      v-for="opt in sourceOptions"
      :key="opt.key"
      class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap"
      :class="isSourceSelected(opt.key)
        ? 'border-ui-dark bg-ui-dark text-white'
        : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'"
      @click="store.toggleSourceFilter(opt.key)"
    >
      <span aria-hidden="true" class="text-[10px]" v-html="opt.icon" />
      {{ opt.label }}
    </button>

    <div class="w-px h-3.5 bg-border mx-0.5" />

    <!-- Confidence chips -->
    <button
      v-for="opt in confidenceOptions"
      :key="opt.key"
      class="flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border transition-all duration-200 whitespace-nowrap"
      :class="isConfidenceSelected(opt.key)
        ? 'border-transparent text-white'
        : 'border-border bg-surface text-text-secondary hover:bg-surface-raised'"
      :style="isConfidenceSelected(opt.key)
        ? { backgroundColor: opt.color }
        : {}"
      @click="store.toggleConfidenceFilter(opt.key)"
    >
      <span
        class="w-1.5 h-1.5 rounded-full flex-shrink-0"
        :style="{ backgroundColor: isConfidenceSelected(opt.key) ? '#FFFFFF' : opt.color }"
        aria-hidden="true"
      />
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
