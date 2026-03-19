<script setup lang="ts">
import type { RoadmapItem } from '~/types'
import { priorityColor, statusColor } from '~/lib/colors'

const props = defineProps<{
  item: RoadmapItem
}>()

defineEmits<{
  click: []
}>()

const isAudit = computed(() => props.item.source === 'audit')
</script>

<template>
  <button
    class="w-full text-left rounded-lg border p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-sm cursor-pointer"
    :class="isAudit
      ? 'bg-audit-light border-audit-border hover:border-audit'
      : 'bg-surface border-border-subtle hover:border-border'"
    @click="$emit('click')"
  >
    <!-- Title -->
    <div class="text-sm font-semibold text-text-primary line-clamp-2 mb-1.5">
      {{ item.title }}
    </div>

    <!-- Meta row -->
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-[10px] font-mono text-text-tertiary">
        {{ item.key }}
      </span>

      <div
        class="w-1.5 h-1.5 rounded-full"
        :style="{ backgroundColor: priorityColor(item.priority) }"
        :title="item.priority"
      />

      <span
        class="text-[9px] font-medium px-1.5 py-0.5 rounded-full text-white"
        :style="{ backgroundColor: statusColor(item.status) }"
      >
        {{ item.status }}
      </span>

      <template v-if="isAudit">
        <span class="text-[9px] font-bold uppercase tracking-wider px-1 py-0.5 rounded bg-audit-border text-audit">
          {{ item.auditPriority }}
        </span>
        <span v-if="item.auditEffort" class="text-[9px] text-text-tertiary">
          {{ item.auditEffort }} effort
        </span>
      </template>

      <span class="text-[9px] text-text-tertiary" aria-hidden="true">
        {{ item.ticketType === 'dev' ? '💻' : item.ticketType === 'design' ? '🎨' : '🔗' }}
      </span>
    </div>

    <!-- Audit area -->
    <div v-if="isAudit && item.auditArea" class="text-[10px] text-text-tertiary mt-1">
      📍 {{ item.auditArea }}
    </div>
  </button>
</template>
