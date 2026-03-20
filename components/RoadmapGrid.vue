<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { useQuarter } from '~/composables/useQuarter'
import { LANES } from '~/types'
import { laneColor } from '~/lib/colors'
import type { RoadmapItem, LaneName } from '~/types'

const store = useRoadmapStore()
const { quarter, currentWeekIdx } = useQuarter()

// ── Grid layout ──────────────────────────────────────────────────────

const weekCount = computed(() => quarter.value.weeks.length)

/** Outer grid: fixed lane-label column + week columns */
const outerGridCols = computed(
  () => `200px repeat(${weekCount.value}, minmax(80px, 1fr))`,
)

/** Inner items-grid: purely week columns (no label column) */
const innerGridCols = computed(
  () => `repeat(${weekCount.value}, minmax(80px, 1fr))`,
)

// ── Per-lane item filtering ──────────────────────────────────────────

/**
 * Returns all placed items for a given lane, sorted by startWeekIdx
 * so they render in chronological order.
 */
function laneItems(lane: LaneName): RoadmapItem[] {
  return store.placedItems
    .filter(i => i.lane === lane)
    .sort((a, b) => a.startWeekIdx - b.startWeekIdx)
}

/** Count of placed items in a lane. */
function laneItemCount(lane: LaneName): number {
  return store.placedItems.filter(i => i.lane === lane).length
}

// ── Filter dimming ───────────────────────────────────────────────────

function isItemDimmed(item: RoadmapItem): boolean {
  const { lanes, sources, confidenceLevels } = store.activeFilters

  if (lanes.length > 0 && !lanes.includes(item.lane)) return true
  if (sources.length > 0 && !item.sources.some(s => sources.includes(s.type))) return true
  if (confidenceLevels.length > 0 && !confidenceLevels.includes(item.confidenceLevel)) return true

  return false
}
</script>

<template>
  <div class="flex-1 overflow-x-auto roadmap-scroll">
    <!-- Week headers (shared component, stays unchanged) -->
    <WeekHeaders />

    <!-- Grid body -->
    <div class="relative">
      <!-- Lane rows -->
      <div
        v-for="lane in LANES"
        :key="lane.name"
        class="grid border-b border-border-subtle"
        :style="{ gridTemplateColumns: outerGridCols }"
      >
        <!-- Lane label (fixed, sticky left) -->
        <div
          class="flex items-center gap-3 px-4 border-r border-border-subtle bg-base sticky left-0 z-10"
          style="min-height: 80px"
        >
          <div
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: laneColor(lane.name) }"
          />
          <div class="min-w-0">
            <div class="text-sm font-semibold text-text-primary truncate">
              {{ lane.name }}
            </div>
            <div class="text-xs text-text-tertiary mt-0.5">
              {{ laneItemCount(lane.name) }} items
            </div>
          </div>
        </div>

        <!--
          Items container: spans ALL week columns as a single cell,
          then uses a nested CSS grid to position bars via grid-column.
        -->
        <div
          class="relative col-span-full col-start-2"
          style="min-height: 80px"
        >
          <!-- Background layers: week stripes + current week highlight -->
          <div
            class="absolute inset-0 grid pointer-events-none"
            :style="{ gridTemplateColumns: innerGridCols }"
          >
            <div
              v-for="week in quarter.weeks"
              :key="'bg-' + week.num"
              class="border-l border-border-subtle transition-colors duration-200"
              :class="{
                'bg-accent/[0.03]': week.num === currentWeekIdx,
                'bg-danger-light/50': week.capacity === 0,
                'bg-surface-raised/30': week.num % 2 === 0 && week.num !== currentWeekIdx && week.capacity > 0,
              }"
            />
          </div>

          <!-- Items grid (stacking rows for overlapping items) -->
          <div
            class="relative grid auto-rows-min gap-y-1 p-1.5"
            :style="{ gridTemplateColumns: innerGridCols }"
          >
            <div
              v-for="item in laneItems(lane.name)"
              :key="item.key"
              :style="{
                gridColumn: `${item.startWeekIdx + 1} / span ${Math.min(item.durationWeeks, weekCount - item.startWeekIdx)}`,
              }"
              :class="{ 'opacity-20': isItemDimmed(item) }"
              class="transition-opacity duration-300"
            >
              <RoadmapBar :item="item" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
