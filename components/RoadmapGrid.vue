<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { useQuarter } from '~/composables/useQuarter'
import { LANES } from '~/types'
import { laneColor } from '~/lib/colors'
import type { LaneName } from '~/types'

const store = useRoadmapStore()
const { quarter, currentWeekIdx } = useQuarter()

const gridCols = computed(() => `200px repeat(${quarter.value.weeks.length}, minmax(100px, 1fr))`)

function isItemDimmed(item: { lane: LaneName; ticketType: string }): boolean {
  const { lanes, types } = store.activeFilters
  if (lanes.length > 0 && !lanes.includes(item.lane)) return true
  if (types.length > 0 && !types.includes(item.ticketType as 'dev' | 'design' | 'both')) return true
  return false
}
</script>

<template>
  <div class="flex-1 overflow-x-auto roadmap-scroll">
    <!-- Week headers -->
    <WeekHeaders />

    <!-- Grid body -->
    <div class="relative">
      <!-- Lane rows -->
      <div v-for="lane in LANES" :key="lane.name" class="grid border-b border-border-subtle" :style="{ gridTemplateColumns: gridCols }">
        <!-- Lane label -->
        <div class="flex items-center gap-3 px-4 border-r border-border-subtle bg-base sticky left-0 z-10" style="min-height: 120px">
          <div
            class="w-2.5 h-2.5 rounded-full shrink-0"
            :style="{ backgroundColor: laneColor(lane.name) }"
          />
          <div class="min-w-0">
            <div class="text-sm font-semibold text-text-primary truncate">
              {{ lane.name }}
            </div>
            <div class="text-xs text-text-tertiary mt-0.5">
              {{ store.placedItems.filter(i => i.lane === lane.name).length }} items
            </div>
          </div>
        </div>

        <!-- Week cells -->
        <div
          v-for="week in quarter.weeks"
          :key="week.num"
          class="relative border-l border-border-subtle p-1.5 transition-colors duration-200"
          :class="{
            'bg-accent/[0.03]': week.num === currentWeekIdx,
            'bg-danger-light/50': week.capacity === 0,
          }"
          style="min-height: 120px"
        >
          <!-- Even week subtle stripe -->
          <div
            v-if="week.num % 2 === 0"
            class="absolute inset-0 bg-surface-raised/30 pointer-events-none"
          />

          <!-- Items -->
          <TransitionGroup name="bar" tag="div" class="relative space-y-1">
            <div
              v-for="item in store.itemsForCell(week.num, lane.name)"
              :key="item.key"
              :class="{ 'opacity-20': isItemDimmed(item) }"
              class="transition-opacity duration-300"
            >
              <RoadmapBar :item="item" />
            </div>
          </TransitionGroup>
        </div>
      </div>
    </div>
  </div>
</template>
