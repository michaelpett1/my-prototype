<script setup lang="ts">
const props = withDefaults(defineProps<{
  status: 'idle' | 'scanning-slack' | 'scanning-confluence' | 'extracting' | 'done' | 'error'
  projectCount?: number
}>(), {
  projectCount: 0,
})

const emit = defineEmits<{
  scan: []
}>()

const resetTimer = ref<ReturnType<typeof setTimeout> | null>(null)

const isScanning = computed(() =>
  ['scanning-slack', 'scanning-confluence', 'extracting'].includes(props.status),
)

const label = computed(() => {
  switch (props.status) {
    case 'idle':
      return 'Scan Conversations'
    case 'scanning-slack':
      return 'Scanning Slack...'
    case 'scanning-confluence':
      return 'Reading Confluence...'
    case 'extracting':
      return 'Extracting projects...'
    case 'done':
      return `${props.projectCount} projects found`
    case 'error':
      return 'Scan failed'
    default:
      return 'Scan Conversations'
  }
})

function handleClick() {
  if (props.status === 'error' || props.status === 'idle' || props.status === 'done') {
    emit('scan')
  }
}

// Auto-reset from 'done' after 3 seconds is handled by the parent via useScan
// but we watch for visual cue purposes
watch(() => props.status, (newStatus) => {
  if (resetTimer.value) {
    clearTimeout(resetTimer.value)
    resetTimer.value = null
  }
})

onUnmounted(() => {
  if (resetTimer.value) {
    clearTimeout(resetTimer.value)
  }
})
</script>

<template>
  <button
    class="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200"
    :class="{
      'bg-accent text-white hover:bg-accent-hover': status === 'idle',
      'bg-accent/90 text-white cursor-wait': isScanning,
      'bg-success/10 text-success': status === 'done',
      'bg-danger/10 text-danger hover:bg-danger/20': status === 'error',
    }"
    :disabled="isScanning"
    @click="handleClick"
  >
    <!-- Idle: radar/search icon -->
    <svg
      v-if="status === 'idle'"
      class="w-3.5 h-3.5"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="7" cy="7" r="5.5" stroke="currentColor" stroke-width="1.5" />
      <path d="M11 11L14 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <path d="M7 4C5.34315 4 4 5.34315 4 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" opacity="0.5" />
    </svg>

    <!-- Scanning: spinner -->
    <svg
      v-if="isScanning"
      class="w-3.5 h-3.5 animate-spin"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" opacity="0.25" />
      <path d="M14 8C14 4.68629 11.3137 2 8 2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
    </svg>

    <!-- Done: checkmark -->
    <svg
      v-if="status === 'done'"
      class="w-3.5 h-3.5"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
      <path d="M5.5 8L7.5 10L10.5 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    </svg>

    <!-- Error: exclamation -->
    <svg
      v-if="status === 'error'"
      class="w-3.5 h-3.5"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="8" cy="8" r="6" stroke="currentColor" stroke-width="1.5" />
      <path d="M8 5V9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="currentColor" />
    </svg>

    <span>{{ label }}</span>
  </button>
</template>
