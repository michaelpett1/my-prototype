<script setup lang="ts">
defineEmits<{
  connectJira: []
  uploadAudit: []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-8">
    <div class="text-6xl mb-6 opacity-80">
      📋
    </div>
    <h2 class="text-xl font-bold text-text-primary mb-2 tracking-tight">
      No items on the roadmap yet
    </h2>
    <p class="text-sm text-text-secondary mb-8 text-center max-w-md">
      Pull tickets from Jira or upload an audit report to populate your roadmap.
    </p>
    <div class="flex gap-3">
      <button
        class="px-5 py-2.5 bg-ui-dark text-white text-sm font-semibold rounded-lg hover:bg-ui-dark/90 transition-colors"
        @click="$emit('connectJira')"
      >
        Pull from Jira
      </button>
      <button
        class="px-5 py-2.5 bg-surface border border-border text-text-primary text-sm font-semibold rounded-lg hover:bg-surface-raised transition-colors"
        @click="$emit('uploadAudit')"
      >
        Upload Audit PDF
      </button>
    </div>
  </div>
</template>
