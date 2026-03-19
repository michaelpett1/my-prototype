<script setup lang="ts">
import type { RoadmapItem } from '~/types'
import { laneColor, laneLightColor, priorityColor, statusColor } from '~/lib/colors'

const props = defineProps<{
  item: RoadmapItem
}>()

const showTooltip = ref(false)
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

function onMouseEnter() {
  tooltipTimeout = setTimeout(() => {
    showTooltip.value = true
  }, 200)
}

function onMouseLeave() {
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
  showTooltip.value = false
}

onUnmounted(() => {
  if (tooltipTimeout) clearTimeout(tooltipTimeout)
})

const isAudit = computed(() => props.item.source === 'audit')

const barBg = computed(() => {
  if (isAudit.value) return '#FFFBEB'
  return laneLightColor(props.item.lane)
})

const barBorder = computed(() => {
  if (isAudit.value) return '#FDE68A'
  return laneColor(props.item.lane)
})
</script>

<template>
  <div
    class="group relative rounded-md cursor-default transition-all duration-200 hover:-translate-y-0.5 hover:shadow-bar-hover"
    :style="{
      backgroundColor: barBg,
      borderLeft: `3px solid ${barBorder}`,
    }"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
  >
    <div class="px-2.5 py-1.5 min-h-[36px] flex items-center gap-2">
      <!-- Priority dot -->
      <div
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :style="{ backgroundColor: priorityColor(item.priority) }"
        :title="item.priority"
      />

      <!-- Title -->
      <div class="text-xs font-medium text-text-primary truncate flex-1">
        {{ item.title }}
      </div>

      <!-- Status dot -->
      <div
        class="w-1.5 h-1.5 rounded-full shrink-0"
        :style="{ backgroundColor: statusColor(item.status) }"
        :title="item.status"
      />

      <!-- Audit badge -->
      <span
        v-if="isAudit"
        class="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-audit-border text-audit shrink-0"
      >
        AUDIT
      </span>
    </div>

    <!-- Assignee -->
    <div v-if="item.assignee" class="px-2.5 pb-1 text-[10px] text-text-tertiary">
      {{ item.assignee }}
    </div>

    <!-- Hover tooltip -->
    <Transition name="spring">
      <div
        v-if="showTooltip"
        class="absolute left-0 top-full mt-2 z-50 w-72 bg-surface rounded-lg border border-border p-3 shadow-lg pointer-events-none"
      >
        <div class="text-sm font-semibold text-text-primary mb-1">
          {{ item.title }}
        </div>
        <div class="text-xs text-text-tertiary mb-2 font-mono">
          {{ item.key }}
        </div>

        <div class="flex flex-wrap gap-1.5 mb-2">
          <span
            class="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
            :style="{ backgroundColor: statusColor(item.status) }"
          >
            {{ item.status }}
          </span>
          <span
            class="text-[10px] font-medium px-1.5 py-0.5 rounded-full text-white"
            :style="{ backgroundColor: priorityColor(item.priority) }"
          >
            {{ item.priority }}
          </span>
          <span class="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-surface-raised text-text-secondary">
            {{ item.ticketType }}
          </span>
        </div>

        <div v-if="item.assignee" class="text-xs text-text-secondary mb-1">
          Assigned to <span class="font-medium">{{ item.assignee }}</span>
        </div>

        <div v-if="item.note" class="text-xs text-text-secondary mt-2 pt-2 border-t border-border-subtle">
          {{ item.note }}
        </div>

        <!-- Audit metadata -->
        <div v-if="isAudit" class="mt-2 pt-2 border-t border-border-subtle space-y-1">
          <div v-if="item.auditPriority" class="text-[10px] text-text-tertiary">
            Priority: <span class="font-semibold text-audit">{{ item.auditPriority }}</span>
          </div>
          <div v-if="item.auditEffort" class="text-[10px] text-text-tertiary">
            Effort: <span class="font-semibold">{{ item.auditEffort }}</span>
          </div>
          <div v-if="item.auditArea" class="text-[10px] text-text-tertiary">
            Area: <span class="font-semibold">{{ item.auditArea }}</span>
          </div>
        </div>

        <!-- Jira link -->
        <a
          v-if="item.jiraUrl"
          :href="item.jiraUrl"
          target="_blank"
          rel="noopener"
          class="mt-2 pt-2 border-t border-border-subtle block text-xs text-accent hover:text-accent-hover font-medium pointer-events-auto"
        >
          Open in Jira →
        </a>
      </div>
    </Transition>
  </div>
</template>
