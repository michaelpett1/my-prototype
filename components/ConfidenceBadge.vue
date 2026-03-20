<script setup lang="ts">
import type { ConfidenceLevel } from '~/types'

const props = withDefaults(defineProps<{
  level: ConfidenceLevel
  size?: 'sm' | 'md'
}>(), {
  size: 'sm',
})

const dotClass = computed(() => {
  const base = props.size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'
  const color = {
    high: 'bg-green-500',
    medium: 'bg-amber-500',
    low: 'bg-red-500',
  }[props.level]
  return `${base} rounded-full ${color}`
})

const labelText = computed(() => {
  const labels: Record<ConfidenceLevel, string> = {
    high: 'High',
    medium: 'Med',
    low: 'Low',
  }
  return labels[props.level]
})

const pillClass = computed(() => {
  const bg = {
    high: 'bg-green-500/10 text-green-700',
    medium: 'bg-amber-500/10 text-amber-700',
    low: 'bg-red-500/10 text-red-700',
  }[props.level]
  const sizeClass = props.size === 'sm' ? 'px-1.5 py-0.5 text-[9px]' : 'px-2 py-0.5 text-[10px]'
  return `inline-flex items-center gap-1 rounded-full font-semibold ${bg} ${sizeClass}`
})
</script>

<template>
  <span :class="pillClass" :title="`Confidence: ${level}`">
    <span :class="dotClass" />
    <span v-if="size === 'md'">{{ labelText }}</span>
  </span>
</template>
