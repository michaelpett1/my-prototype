<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import type { Mode } from '~/types'

const store = useRoadmapStore()

const modes: { key: Mode; label: string; icon: string }[] = [
  { key: 'auto', label: 'Auto', icon: '⚡' },
  { key: 'triage', label: 'Triage', icon: '✋' },
]

function setMode(mode: Mode) {
  store.setMode(mode)
}
</script>

<template>
  <div class="relative flex items-center bg-surface-raised rounded-full p-0.5">
    <!-- Sliding pill -->
    <div
      class="absolute top-0.5 bottom-0.5 rounded-full bg-surface shadow-sm transition-all duration-300 ease-out"
      :style="{
        left: store.mode === 'auto' ? '2px' : '50%',
        width: 'calc(50% - 2px)',
      }"
    />

    <button
      v-for="m in modes"
      :key="m.key"
      class="relative z-10 flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-colors duration-200"
      :class="store.mode === m.key ? 'text-text-primary' : 'text-text-tertiary hover:text-text-secondary'"
      @click="setMode(m.key)"
    >
      <span class="text-xs">{{ m.icon }}</span>
      {{ m.label }}
    </button>
  </div>
</template>
