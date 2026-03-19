<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { useJira } from '~/composables/useJira'
import type { RoadmapItem } from '~/types'

const props = defineProps<{
  activeTab: 'jira' | 'audit'
  showAuditUploader: boolean
}>()

const emit = defineEmits<{
  'update:activeTab': [tab: 'jira' | 'audit']
  'toggleAuditUploader': []
}>()

const store = useRoadmapStore()
const { isLoading: jiraLoading, error: jiraError, importTickets } = useJira()
const search = ref('')

const filteredItems = computed(() => {
  const items = props.activeTab === 'jira' ? store.jiraInboxItems : store.auditInboxItems
  if (!search.value) return items
  const q = search.value.toLowerCase()
  return items.filter(i => i.title.toLowerCase().includes(q) || i.key.toLowerCase().includes(q))
})

function handleItemClick(item: RoadmapItem) {
  store.startTriage(item)
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Tabs -->
    <div class="flex border-b border-border-subtle p-2 gap-1">
      <button
        class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
        :class="activeTab === 'jira' ? 'bg-surface-raised text-text-primary' : 'text-text-tertiary hover:text-text-secondary'"
        @click="emit('update:activeTab', 'jira')"
      >
        Jira
        <span class="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-accent/10 text-accent font-bold">
          {{ store.jiraInboxItems.length }}
        </span>
      </button>
      <button
        class="flex-1 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors"
        :class="activeTab === 'audit' ? 'bg-surface-raised text-text-primary' : 'text-text-tertiary hover:text-text-secondary'"
        @click="emit('update:activeTab', 'audit')"
      >
        📄 Audit
        <span class="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-audit/10 text-audit font-bold">
          {{ store.auditInboxItems.length }}
        </span>
      </button>
    </div>

    <!-- Search -->
    <div class="px-3 py-2">
      <input
        v-model="search"
        type="text"
        placeholder="Search tickets..."
        class="w-full px-3 py-1.5 text-xs bg-surface-raised border border-border-subtle rounded-md text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
      >
    </div>

    <!-- Item list -->
    <div class="flex-1 overflow-y-auto px-2 pb-2">
      <TransitionGroup name="inbox" tag="div" class="space-y-1.5">
        <InboxCard
          v-for="item in filteredItems"
          :key="item.key"
          :item="item"
          @click="handleItemClick(item)"
        />
      </TransitionGroup>

      <div v-if="filteredItems.length === 0" class="flex flex-col items-center py-8 text-center">
        <div class="text-3xl mb-2 opacity-60" aria-hidden="true">👈</div>
        <p class="text-xs text-text-tertiary">
          {{ activeTab === 'jira' ? 'No Jira tickets in inbox' : 'No audit items in inbox' }}
        </p>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="p-3 border-t border-border-subtle">
      <template v-if="activeTab === 'jira'">
        <button
          class="w-full px-4 py-2 bg-ui-dark text-white text-xs font-semibold rounded-lg hover:bg-ui-dark/90 transition-colors disabled:opacity-50"
          :disabled="jiraLoading"
          @click="importTickets()"
        >
          {{ jiraLoading ? 'Pulling...' : 'Pull from Jira' }}
        </button>
        <div v-if="jiraError" class="mt-2 text-xs text-danger">{{ jiraError }}</div>
      </template>
      <button
        v-if="activeTab === 'audit'"
        class="w-full px-4 py-2 bg-surface border border-audit-border text-audit text-xs font-semibold rounded-lg hover:bg-audit-light transition-colors"
        @click="emit('toggleAuditUploader')"
      >
        📄 Upload Audit PDF
      </button>
    </div>
  </div>
</template>
