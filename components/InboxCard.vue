<script setup lang="ts">
import type { RoadmapItem } from '~/types'
import { priorityColor } from '~/lib/colors'

const props = defineProps<{
  item: RoadmapItem
}>()

const emit = defineEmits<{
  triage: [item: RoadmapItem]
}>()

const confidenceDotColor = computed(() => {
  switch (props.item.confidenceLevel) {
    case 'high': return '#39B54A'
    case 'medium': return '#F59E0B'
    case 'low': return '#EF4444'
    default: return '#6B7280'
  }
})

const confidenceDotTitle = computed(() => {
  return `Confidence: ${props.item.confidenceLevel}`
})

const sourceBadges = computed(() => {
  const seen = new Set<string>()
  const badges: { type: string; label: string }[] = []
  for (const src of props.item.sources) {
    if (!seen.has(src.type)) {
      seen.add(src.type)
      switch (src.type) {
        case 'slack':
          badges.push({ type: 'slack', label: 'S' })
          break
        case 'confluence':
          badges.push({ type: 'confluence', label: 'C' })
          break
        case 'manual':
          badges.push({ type: 'manual', label: 'M' })
          break
        case 'jira':
          badges.push({ type: 'jira', label: 'J' })
          break
      }
    }
  }
  return badges
})

const durationLabel = computed(() => {
  if (props.item.projectSize === 'epic' && props.item.durationWeeks > 1) {
    return `${props.item.durationWeeks}w`
  }
  return null
})

const sourceBadgeStyle = (type: string) => {
  switch (type) {
    case 'slack': return 'bg-purple-100 text-purple-700'
    case 'confluence': return 'bg-blue-100 text-blue-700'
    case 'manual': return 'bg-gray-100 text-gray-600'
    case 'jira': return 'bg-blue-100 text-blue-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}
</script>

<template>
  <button
    class="w-full text-left rounded-lg border bg-surface border-border-subtle p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm hover:border-border cursor-pointer"
    @click="emit('triage', item)"
  >
    <div class="flex items-start gap-2.5">
      <!-- Left: confidence dot -->
      <div class="flex-shrink-0 mt-1.5">
        <div
          class="w-2.5 h-2.5 rounded-full"
          :style="{ backgroundColor: confidenceDotColor }"
          :title="confidenceDotTitle"
        />
      </div>

      <!-- Center: title + description -->
      <div class="flex-1 min-w-0">
        <div class="text-sm font-semibold text-text-primary line-clamp-1">
          {{ item.title }}
        </div>
        <div v-if="item.description" class="text-[11px] text-text-tertiary line-clamp-1 mt-0.5">
          {{ item.description }}
        </div>
      </div>

      <!-- Right: source badges, duration, effort -->
      <div class="flex items-center gap-1.5 flex-shrink-0">
        <span
          v-for="badge in sourceBadges"
          :key="badge.type"
          class="inline-flex items-center justify-center w-5 h-5 text-[9px] font-bold rounded"
          :class="sourceBadgeStyle(badge.type)"
          :title="badge.type"
        >
          {{ badge.label }}
        </span>

        <span
          v-if="durationLabel"
          class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-surface-raised text-text-secondary"
          title="Duration"
        >
          {{ durationLabel }}
        </span>

        <span
          class="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-accent/10 text-accent"
          title="Effort points"
        >
          {{ item.effortPoints }}pt
        </span>
      </div>
    </div>

    <!-- Bottom: priority indicator -->
    <div class="flex items-center gap-1.5 mt-2 pl-5">
      <div
        class="w-1.5 h-1.5 rounded-full"
        :style="{ backgroundColor: priorityColor(item.priority) }"
      />
      <span class="text-[10px] font-medium text-text-tertiary">
        {{ item.priority }}
      </span>
    </div>
  </button>
</template>
