<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'

const emit = defineEmits<{
  close: []
}>()

const store = useRoadmapStore()
const isDragging = ref(false)
const status = ref<'idle' | 'uploading' | 'extracting' | 'done' | 'error'>('idle')
const fileName = ref('')
const errorMessage = ref('')
const extractedCount = ref(0)

async function handleFile(file: File) {
  if (!file.name.endsWith('.pdf')) {
    errorMessage.value = 'Please upload a PDF file'
    status.value = 'error'
    return
  }

  fileName.value = file.name
  status.value = 'uploading'

  try {
    const formData = new FormData()
    formData.append('file', file)

    status.value = 'extracting'
    const response = await $fetch<{ tickets: Array<{ title: string; priority: string; effort: string; area: string; suggestedLane: string }> }>('/api/audit/parse', {
      method: 'POST',
      body: formData,
    })

    if (response.tickets && response.tickets.length > 0) {
      const prefix = `AUDIT-${Date.now().toString(36).toUpperCase()}`
      const items = response.tickets.map((t, idx) => ({
        key: `${prefix}-${String(idx + 1).padStart(2, '0')}`,
        title: t.title,
        status: 'New' as const,
        priority: t.priority === 'P0' || t.priority === 'High' ? 'High' as const : t.priority === 'P1' || t.priority === 'Medium' ? 'Medium' as const : 'Low' as const,
        assignee: null,
        ticketType: 'both' as const,
        lane: (t.suggestedLane || 'Improvements') as 'New Product Features' | 'Improvements' | 'Site Hygiene',
        weekIdx: -1,
        note: '',
        source: 'audit' as const,
        auditPriority: t.priority,
        auditEffort: t.effort,
        auditArea: t.area,
      }))

      store.addItems(items)
      extractedCount.value = items.length
      status.value = 'done'
    } else {
      errorMessage.value = 'No actionable items found in the PDF'
      status.value = 'error'
    }
  } catch (e) {
    errorMessage.value = e instanceof Error ? e.message : 'Failed to parse PDF'
    status.value = 'error'
  }
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function handleFileInput(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) handleFile(file)
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <div class="fixed inset-0 z-40 bg-ui-overlay/40 backdrop-blur-sm" @click="emit('close')" />

    <!-- Dialog -->
    <div class="fixed inset-0 z-50 flex items-center justify-center p-8">
      <div class="bg-surface rounded-2xl shadow-dialog border border-border w-full max-w-md" @click.stop>
        <!-- Header -->
        <div class="px-6 pt-5 pb-3 flex items-center justify-between">
          <h2 class="text-base font-bold text-text-primary">Upload Audit Report</h2>
          <button
            aria-label="Close"
            class="text-text-tertiary hover:text-text-primary p-1 rounded-md hover:bg-surface-raised transition-colors"
            @click="emit('close')"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M18 6 6 18" /><path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 pb-6">
          <!-- Drop zone -->
          <div
            v-if="status === 'idle' || status === 'error'"
            class="border-2 border-dashed rounded-xl p-8 text-center transition-colors"
            :class="isDragging ? 'border-accent bg-accent/5' : 'border-border hover:border-border'"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
          >
            <div class="text-4xl mb-3 opacity-60">📄</div>
            <p class="text-sm text-text-secondary mb-2">
              Drop a PDF here or click to browse
            </p>
            <p class="text-xs text-text-tertiary mb-4">
              Audit reports, UX analyses, SEO reviews
            </p>
            <label class="px-4 py-2 bg-ui-dark text-white text-xs font-semibold rounded-lg hover:bg-ui-dark/90 transition-colors cursor-pointer">
              Choose File
              <input
                type="file"
                accept=".pdf"
                class="hidden"
                @change="handleFileInput"
              >
            </label>

            <div v-if="status === 'error'" class="mt-4 text-xs text-danger">
              {{ errorMessage }}
            </div>
          </div>

          <!-- Processing state -->
          <div v-else-if="status === 'uploading' || status === 'extracting'" class="py-8 text-center">
            <div class="w-8 h-8 mx-auto mb-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p class="text-sm font-medium text-text-primary mb-1">
              {{ status === 'uploading' ? 'Uploading...' : 'Extracting tickets with Claude...' }}
            </p>
            <p class="text-xs text-text-tertiary">{{ fileName }}</p>
          </div>

          <!-- Done state -->
          <div v-else-if="status === 'done'" class="py-8 text-center">
            <div class="text-4xl mb-3">✅</div>
            <p class="text-sm font-semibold text-text-primary mb-1">
              {{ extractedCount }} tickets extracted
            </p>
            <p class="text-xs text-text-tertiary mb-4">
              From {{ fileName }}
            </p>
            <button
              class="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              @click="emit('close')"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
