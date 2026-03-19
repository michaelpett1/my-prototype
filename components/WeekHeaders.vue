<script setup lang="ts">
import { useQuarter } from '~/composables/useQuarter'
import { useRoadmapStore } from '~/stores/roadmap'

const { quarter, monthGroups, currentWeekIdx } = useQuarter()
const store = useRoadmapStore()

const gridCols = computed(() => `200px repeat(${quarter.value.weeks.length}, minmax(100px, 1fr))`)
</script>

<template>
  <div class="sticky top-0 z-20 bg-base">
    <!-- Month row -->
    <div class="grid" :style="{ gridTemplateColumns: gridCols }">
      <div class="px-4 py-2" />
      <template v-for="group in monthGroups" :key="group.month">
        <div
          :style="{ gridColumn: `span ${group.count}` }"
          class="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-tertiary"
        >
          {{ group.month }}
        </div>
      </template>
    </div>

    <!-- Week row -->
    <div class="grid border-b border-border-subtle" :style="{ gridTemplateColumns: gridCols }">
      <div class="px-4 py-2" />
      <div
        v-for="week in quarter.weeks"
        :key="week.num"
        class="relative px-3 py-2 text-center border-l border-border-subtle transition-colors duration-200"
        :class="{
          'bg-accent/5': week.num === currentWeekIdx,
        }"
      >
        <div class="text-xs font-semibold" :class="week.num === currentWeekIdx ? 'text-accent' : 'text-text-primary'">
          {{ week.label }}
        </div>
        <div class="text-[10px] text-text-tertiary mt-0.5">
          {{ week.dateLabel }}
        </div>
        <!-- Current week indicator -->
        <div
          v-if="week.num === currentWeekIdx"
          class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full"
        />
        <!-- Zero capacity indicator (takes priority over over-capacity) -->
        <div
          v-if="week.capacity === 0"
          class="absolute top-1 right-1 text-[10px]"
          aria-label="Week disabled"
        >
          🚫
        </div>
        <!-- Over capacity indicator -->
        <div
          v-else-if="store.isOverCapacity(week.num)"
          class="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-danger animate-pulse"
          aria-label="Over capacity"
        />
      </div>
    </div>
  </div>
</template>
