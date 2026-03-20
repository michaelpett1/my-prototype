<script setup lang="ts">
import type { SourceReference, ItemSource } from '~/types'

const props = defineProps<{
  sources: SourceReference[]
}>()

interface SourceBadge {
  type: ItemSource
  label: string
  count: number
  bgClass: string
}

const badges = computed<SourceBadge[]>(() => {
  const counts = new Map<ItemSource, number>()
  for (const source of props.sources) {
    counts.set(source.type, (counts.get(source.type) ?? 0) + 1)
  }

  const config: Record<ItemSource, { label: string; bgClass: string }> = {
    slack: { label: '#', bgClass: 'bg-purple-600 text-white' },
    confluence: { label: 'C', bgClass: 'bg-blue-600 text-white' },
    jira: { label: 'J', bgClass: 'bg-blue-500 text-white' },
    manual: { label: 'M', bgClass: 'bg-gray-400 text-white' },
  }

  const result: SourceBadge[] = []
  for (const [type, count] of counts) {
    const c = config[type]
    result.push({
      type,
      label: c.label,
      count,
      bgClass: c.bgClass,
    })
  }

  return result
})
</script>

<template>
  <div class="inline-flex items-center gap-0.5">
    <span
      v-for="badge in badges"
      :key="badge.type"
      class="inline-flex items-center justify-center rounded text-[9px] font-bold leading-none"
      :class="[badge.bgClass, badge.count > 1 ? 'px-1 py-0.5 min-w-[18px]' : 'w-[16px] h-[16px]']"
      :title="`${badge.type}${badge.count > 1 ? ` (${badge.count})` : ''}`"
    >
      {{ badge.label }}<span v-if="badge.count > 1" class="text-[8px] ml-px opacity-80">&times;{{ badge.count }}</span>
    </span>
  </div>
</template>
