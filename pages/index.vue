<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { useCapacity } from '~/composables/useCapacity'
import { useScan } from '~/composables/useScan'
import { useVelocity } from '~/composables/useVelocity'
import { mockProjects } from '~/lib/mock-data'

useHead({ title: 'Roadmap Planner' })

const store = useRoadmapStore()
const { masterCapacity, totalLoad, totalCapacity } = useCapacity()
const { status: scanStatus, progress: scanProgress, runScan } = useScan()
const { fetchVelocity } = useVelocity()

const showInbox = ref(true)
const inboxTab = ref<'all' | 'low-confidence' | 'manual'>('all')

// Load mock data only if store is empty
onMounted(() => {
  if (store.items.length === 0) {
    store.addItems([...mockProjects])
  }

  // Fetch velocity data on mount
  fetchVelocity()
})

function handleMasterCapacity(event: Event) {
  const target = event.target as HTMLInputElement
  masterCapacity.value = Number(target.value)
}

function toggleInbox() {
  showInbox.value = !showInbox.value
}

function handleScan() {
  runScan()
}
</script>

<template>
  <div class="min-h-screen bg-base flex flex-col">
    <!-- Header -->
    <header class="bg-surface border-b border-border sticky top-0 z-30">
      <div class="px-6 py-4 flex items-center gap-6">
        <!-- Title -->
        <div class="shrink-0">
          <h1 class="text-lg font-black tracking-tight text-text-primary" style="letter-spacing: -0.04em">
            Roadmap Planner
          </h1>
          <div class="text-xs text-text-tertiary mt-0.5">
            Q{{ Math.ceil((new Date().getMonth() + 1) / 3) }} {{ new Date().getFullYear() }} · {{ totalLoad }} / {{ totalCapacity }} items
          </div>
        </div>

        <!-- Mode toggle -->
        <ModeToggle />

        <!-- Scan button -->
        <ScanButton
          :status="scanStatus"
          :project-count="scanProgress.projects"
          @scan="handleScan"
        />

        <!-- Filters -->
        <div class="flex-1 min-w-0">
          <FilterChips />
        </div>

        <!-- Master capacity -->
        <div class="flex items-center gap-3 shrink-0">
          <label class="text-xs font-medium text-text-secondary">
            Capacity: {{ masterCapacity }} /wk
          </label>
          <input
            type="range"
            min="1"
            max="6"
            :value="masterCapacity"
            class="w-24 h-1 appearance-none rounded-full cursor-pointer accent-accent"
            @input="handleMasterCapacity"
          >
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-2 shrink-0">
          <button
            class="text-xs font-medium text-text-secondary hover:text-text-primary px-3 py-1.5 rounded-md hover:bg-surface-raised transition-colors"
            @click="toggleInbox"
          >
            {{ showInbox ? 'Hide' : 'Show' }} Inbox
          </button>
        </div>
      </div>
    </header>

    <!-- Main content -->
    <div class="flex flex-1 overflow-hidden">
      <!-- Inbox sidebar -->
      <Transition name="inbox">
        <div
          v-if="showInbox && store.mode === 'triage'"
          class="w-80 shrink-0 bg-surface border-r border-border flex flex-col overflow-hidden"
        >
          <InboxSidebar
            :active-tab="inboxTab"
            @update:active-tab="inboxTab = $event"
            @scan="handleScan"
          />
        </div>
      </Transition>

      <!-- Roadmap area -->
      <div class="flex-1 flex flex-col overflow-hidden">
        <template v-if="store.placedItems.length > 0">
          <RoadmapGrid />
          <CapacitySliders />
        </template>
        <EmptyState
          v-else
          @scan="handleScan"
          @add-manual="store.addItems([...mockProjects])"
        />
      </div>
    </div>

    <!-- Triage dialog -->
    <TriageDialog v-if="store.triageState.currentItem" />
  </div>
</template>
