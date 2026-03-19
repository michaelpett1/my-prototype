<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { useQuarter } from '~/composables/useQuarter'
import { useCapacity } from '~/composables/useCapacity'

const store = useRoadmapStore()
const { quarter } = useQuarter()
const { utilizationPercent } = useCapacity()

function handleWeekCapacity(weekIdx: number, event: Event) {
  const target = event.target as HTMLInputElement
  store.setWeekCapacity(weekIdx, Number(target.value))
}
</script>

<template>
  <div class="border-t border-border-subtle bg-surface/50">
    <div
      class="grid items-center"
      :style="{ gridTemplateColumns: `200px repeat(${quarter.weeks.length}, minmax(100px, 1fr))` }"
    >
      <!-- Label -->
      <div class="px-4 py-3">
        <div class="text-xs font-semibold text-text-secondary">Capacity</div>
        <div class="text-[10px] text-text-tertiary mt-0.5">
          {{ utilizationPercent }}% used
        </div>
      </div>

      <!-- Per-week sliders -->
      <div
        v-for="week in quarter.weeks"
        :key="week.num"
        class="flex flex-col items-center px-1 py-2 border-l border-border-subtle"
      >
        <input
          type="range"
          min="0"
          max="6"
          :value="week.capacity"
          class="w-12 h-1 appearance-none rounded-full cursor-pointer"
          :class="week.capacity === 0 ? 'accent-danger' : 'accent-accent'"
          :aria-label="`Week ${week.num + 1} capacity`"
          @input="handleWeekCapacity(week.num, $event)"
        >
        <div
          class="text-[10px] font-semibold mt-1 transition-colors duration-200"
          :class="{
            'text-danger': week.capacity === 0,
            'text-warning': store.isOverCapacity(week.num),
            'text-text-tertiary': !store.isOverCapacity(week.num) && week.capacity > 0,
          }"
        >
          {{ week.capacity === 0 ? '🚫' : `${store.weekLoad(week.num)}/${week.capacity}` }}
        </div>
      </div>
    </div>
  </div>
</template>
