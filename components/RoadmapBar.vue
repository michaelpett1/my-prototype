<script setup lang="ts">
import type { RoadmapItem, ItemSource } from '~/types'
import { laneColor, laneLightColor } from '~/lib/colors'

const props = defineProps<{
  item: RoadmapItem
}>()

// ── Tooltip ──────────────────────────────────────────────────────────

const showTooltip = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  tooltipTimeout = setTimeout(() => {
    showTooltip.value = true
  }, 300)
}

function onMouseLeave() {
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  showTooltip.value = false
}

onUnmounted(() => {
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
})

// ── Derived styling ──────────────────────────────────────────────────

const isMultiWeek = computed(() => props.item.durationWeeks > 1)
const isWide = computed(() => props.item.durationWeeks >= 3)

const borderColor = computed(() => laneColor(props.item.lane))
const bgColor = computed(() => laneLightColor(props.item.lane))

/** Modulate opacity by confidence: high = 1.0, medium = 0.8, low = 0.55 */
const confidenceOpacity = computed(() => {
  switch (props.item.confidenceLevel) {
    case 'high': return 1.0
    case 'medium': return 0.8
    case 'low': return 0.55
    default: return 1.0
  }
})

// ── Confidence indicator ─────────────────────────────────────────────

const confidenceDotColor = computed(() => {
  switch (props.item.confidenceLevel) {
    case 'high': return '#10B981'
    case 'medium': return '#F59E0B'
    case 'low': return '#EF4444'
    default: return '#9CA3AF'
  }
})

const confidenceLabel = computed(() => {
  switch (props.item.confidenceLevel) {
    case 'high': return 'High confidence'
    case 'medium': return 'Medium confidence'
    case 'low': return 'Low confidence'
    default: return 'Unknown'
  }
})

// ── Source badges ────────────────────────────────────────────────────

interface SourceBadge {
  type: ItemSource
  label: string
  bgClass: string
  textClass: string
}

const SOURCE_BADGE_MAP: Record<ItemSource, Omit<SourceBadge, 'type'>> = {
  slack: { label: '#', bgClass: 'bg-purple-100', textClass: 'text-purple-700' },
  confluence: { label: 'C', bgClass: 'bg-blue-100', textClass: 'text-blue-700' },
  jira: { label: 'J', bgClass: 'bg-green-100', textClass: 'text-green-700' },
  manual: { label: 'M', bgClass: 'bg-gray-100', textClass: 'text-gray-600' },
}

const sourceBadges = computed<SourceBadge[]>(() => {
  const seen = new Set<ItemSource>()
  const badges: SourceBadge[] = []

  for (const src of props.item.sources) {
    if (!seen.has(src.type)) {
      seen.add(src.type)
      const config = SOURCE_BADGE_MAP[src.type]
      if (config) {
        badges.push({ type: src.type, ...config })
      }
    }
  }

  return badges
})

// ── Duration label ───────────────────────────────────────────────────

const durationLabel = computed(() => {
  const w = props.item.durationWeeks
  return w === 1 ? '1w' : `${w}w`
})

// ── Tooltip source grouping ─────────────────────────────────────────

const groupedSources = computed(() => {
  const groups: Record<string, { type: ItemSource; items: { title: string; url?: string }[] }> = {}

  for (const src of props.item.sources) {
    if (!groups[src.type]) {
      groups[src.type] = { type: src.type, items: [] }
    }
    groups[src.type].items.push({ title: src.title, url: src.url })
  }

  return Object.values(groups)
})
</script>

<template>
  <div
    class="group relative rounded-md cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-bar-hover overflow-hidden"
    :style="{
      backgroundColor: bgColor,
      borderLeft: `4px solid ${borderColor}`,
      opacity: confidenceOpacity,
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div
      class="flex items-center gap-1.5 min-h-[32px]"
      :class="isWide ? 'px-3 py-2' : 'px-2 py-1.5'"
    >
      <!-- Title -->
      <div
        class="font-medium text-text-primary flex-1 min-w-0"
        :class="isWide ? 'text-xs' : 'text-[11px]'"
      >
        <span class="truncate block">{{ item.title }}</span>
      </div>

      <!-- Duration label (multi-week only) -->
      <span
        v-if="isMultiWeek"
        class="text-[10px] font-semibold text-text-tertiary shrink-0 tabular-nums"
      >
        {{ durationLabel }}
      </span>

      <!-- Effort points (multi-week + wide enough) -->
      <span
        v-if="isMultiWeek && item.effortPoints"
        class="text-[10px] font-medium text-text-muted shrink-0 tabular-nums"
      >
        {{ item.effortPoints }}pt
      </span>

      <!-- Confidence dot -->
      <div
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :style="{ backgroundColor: confidenceDotColor }"
        :title="confidenceLabel"
      />

      <!-- Source badges -->
      <div class="flex items-center gap-0.5 shrink-0">
        <span
          v-for="badge in sourceBadges"
          :key="badge.type"
          class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[8px] font-bold leading-none"
          :class="[badge.bgClass, badge.textClass]"
          :title="badge.type"
        >
          {{ badge.label }}
        </span>
      </div>
    </div>

    <!-- Hover tooltip -->
    <Transition name="spring">
      <div
        v-if="showTooltip"
        class="absolute left-0 top-full mt-2 z-50 w-80 bg-surface rounded-lg border border-border p-3 shadow-lg pointer-events-none"
      >
        <!-- Title + key -->
        <div class="text-sm font-semibold text-text-primary mb-0.5">
          {{ item.title }}
        </div>
        <div class="text-[11px] text-text-tertiary font-mono mb-2">
          {{ item.key }}
        </div>

        <!-- Description -->
        <p
          v-if="item.description"
          class="text-xs text-text-secondary mb-2 leading-relaxed"
        >
          {{ item.description }}
        </p>

        <!-- Meta badges row -->
        <div class="flex flex-wrap gap-1.5 mb-2">
          <!-- Status -->
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-raised text-text-secondary">
            {{ item.status }}
          </span>

          <!-- Priority -->
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-raised text-text-secondary">
            {{ item.priority }}
          </span>

          <!-- Project size -->
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-raised text-text-secondary capitalize">
            {{ item.projectSize }}
          </span>

          <!-- Confidence -->
          <span
            class="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
            :style="{ backgroundColor: confidenceDotColor }"
          >
            {{ item.confidenceLevel }} ({{ Math.round(item.confidence * 100) }}%)
          </span>
        </div>

        <!-- Duration + effort row -->
        <div class="flex items-center gap-3 text-xs text-text-secondary mb-2">
          <span>
            Duration: <span class="font-semibold text-text-primary">{{ durationLabel }}</span>
          </span>
          <span v-if="item.effortPoints">
            Effort: <span class="font-semibold text-text-primary">{{ item.effortPoints }} pts</span>
          </span>
          <span>
            Weeks {{ item.startWeekIdx + 1 }}&ndash;{{ item.endWeekIdx + 1 }}
          </span>
        </div>

        <!-- Assignee -->
        <div v-if="item.assignee" class="text-xs text-text-secondary mb-2">
          Assigned to <span class="font-medium text-text-primary">{{ item.assignee }}</span>
        </div>

        <!-- Sources -->
        <div
          v-if="groupedSources.length > 0"
          class="pt-2 border-t border-border-subtle space-y-1.5"
        >
          <div class="text-[10px] font-semibold uppercase tracking-wider text-text-tertiary">
            Sources
          </div>
          <div
            v-for="group in groupedSources"
            :key="group.type"
            class="space-y-0.5"
          >
            <div class="flex items-center gap-1">
              <span
                class="inline-flex items-center justify-center w-3.5 h-3.5 rounded text-[8px] font-bold leading-none"
                :class="[SOURCE_BADGE_MAP[group.type].bgClass, SOURCE_BADGE_MAP[group.type].textClass]"
              >
                {{ SOURCE_BADGE_MAP[group.type].label }}
              </span>
              <span class="text-[10px] font-medium text-text-secondary capitalize">
                {{ group.type }}
              </span>
            </div>
            <div
              v-for="(ref, idx) in group.items"
              :key="idx"
              class="text-[10px] text-text-tertiary pl-5 truncate"
            >
              <a
                v-if="ref.url"
                :href="ref.url"
                target="_blank"
                rel="noopener"
                class="text-accent hover:text-accent-hover pointer-events-auto"
              >
                {{ ref.title }}
              </a>
              <span v-else>{{ ref.title }}</span>
            </div>
          </div>
        </div>

        <!-- Note -->
        <div
          v-if="item.note"
          class="text-xs text-text-secondary mt-2 pt-2 border-t border-border-subtle"
        >
          {{ item.note }}
        </div>
      </div>
    </Transition>
  </div>
</template>
