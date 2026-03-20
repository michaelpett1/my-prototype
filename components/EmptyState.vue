<script setup lang="ts">
defineEmits<{
  scan: []
  'add-manual': []
}>()
</script>

<template>
  <div class="flex flex-col items-center justify-center py-20 px-8">
    <div class="text-6xl mb-6 opacity-80">
      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-text-tertiary" aria-hidden="true">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />
      </svg>
    </div>
    <h2 class="text-xl font-bold text-text-primary mb-2 tracking-tight">
      No items on the roadmap yet
    </h2>
    <p class="text-sm text-text-secondary mb-8 text-center max-w-md">
      Scan your team's conversations to auto-populate the roadmap, or add projects manually.
    </p>
    <div class="flex gap-3">
      <button
        class="px-5 py-2.5 bg-ui-dark text-white text-sm font-semibold rounded-lg hover:bg-ui-dark/90 transition-colors flex items-center gap-2"
        @click="$emit('scan')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        Scan Slack &amp; Confluence
      </button>
      <button
        class="px-5 py-2.5 bg-surface border border-border text-text-primary text-sm font-semibold rounded-lg hover:bg-surface-raised transition-colors flex items-center gap-2"
        @click="$emit('add-manual')"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M12 5v14" /><path d="M5 12h14" />
        </svg>
        Add Manually
      </button>
    </div>
  </div>
</template>
