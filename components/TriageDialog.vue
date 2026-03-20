<script setup lang="ts">
import { useRoadmapStore } from '~/stores/roadmap'
import { useQuarter } from '~/composables/useQuarter'
import { laneColor, laneLightColor } from '~/lib/colors'
import { LANES } from '~/types'
import type { LaneName } from '~/types'

const store = useRoadmapStore()
const { quarter, currentWeekIdx } = useQuarter()
const triage = computed(() => store.triageState)

const STEPS = ['lane', 'duration', 'timing', 'notes'] as const

const durationOptions = [
  { weeks: 1, label: '1 week' },
  { weeks: 2, label: '2 weeks' },
  { weeks: 3, label: '3 weeks' },
  { weeks: 4, label: '4 weeks' },
  { weeks: 5, label: '5+ weeks' },
]

function goToLane() {
  store.setTriageStep('lane')
}

function goToDuration() {
  store.setTriageStep('duration')
}

function selectLane(lane: LaneName) {
  store.setTriageLane(lane)
  store.setTriageStep('duration')
}

function selectDuration(weeks: number) {
  store.setTriageDuration(weeks)
  store.setTriageStep('timing')
}

function selectWeek(weekIdx: number) {
  store.setTriageWeek(weekIdx)
  store.setTriageStep('notes')
}

function handleNoteInput(event: Event) {
  store.setTriageNote((event.target as HTMLTextAreaElement).value)
}

function complete() {
  store.completeTriage()
}

function skip() {
  store.skipTriage()
}

function cancel() {
  store.resetTriage()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') cancel()
}

/** Compute a visual preview showing which weeks the item would span from the selected start week. */
const spanPreview = computed(() => {
  const dur = triage.value.selectedDuration ?? triage.value.currentItem?.durationWeeks ?? 1
  const start = triage.value.selectedWeek
  if (start == null) return null
  return {
    startWeekIdx: start,
    endWeekIdx: start + dur - 1,
  }
})

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <Teleport to="body">
    <!-- Backdrop -->
    <Transition name="spring">
      <div
        v-if="triage.currentItem"
        class="fixed inset-0 z-40 bg-ui-overlay/40 backdrop-blur-sm"
        @click="cancel"
      />
    </Transition>

    <!-- Dialog -->
    <Transition name="spring">
      <div
        v-if="triage.currentItem"
        class="fixed inset-x-0 bottom-0 z-50 flex justify-center p-6"
      >
        <div
          class="bg-surface rounded-2xl shadow-dialog border border-border w-full max-w-lg overflow-hidden"
          @click.stop
        >
          <!-- Header -->
          <div class="px-6 pt-5 pb-3 border-b border-border-subtle">
            <div class="flex items-start justify-between">
              <div>
                <h2 class="text-lg font-bold text-text-primary tracking-tight" style="letter-spacing: -0.02em">
                  {{ triage.currentItem.title }}
                </h2>
                <div class="text-xs text-text-tertiary font-mono mt-1">
                  {{ triage.currentItem.key }}
                </div>
              </div>
              <button
                aria-label="Close"
                class="text-text-tertiary hover:text-text-primary p-1 rounded-md hover:bg-surface-raised transition-colors"
                @click="cancel"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <!-- Step indicator (4 steps) -->
            <div class="flex gap-1.5 mt-3">
              <div
                v-for="(s, idx) in STEPS"
                :key="s"
                class="h-1 flex-1 rounded-full transition-colors duration-300"
                :class="STEPS.indexOf(triage.step as typeof STEPS[number]) >= idx ? 'bg-accent' : 'bg-border'"
              />
            </div>
          </div>

          <!-- Steps content -->
          <div class="px-6 py-5 min-h-[240px]">
            <!-- Step 1: Lane selection -->
            <div v-if="triage.step === 'lane'">
              <h3 class="text-sm font-semibold text-text-secondary mb-4">What category does this belong in?</h3>
              <div class="grid grid-cols-3 gap-3">
                <button
                  v-for="lane in LANES"
                  :key="lane.name"
                  class="flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                  :class="triage.selectedLane === lane.name
                    ? 'border-current shadow-sm'
                    : 'border-border-subtle hover:border-border'"
                  :style="triage.selectedLane === lane.name ? { borderColor: laneColor(lane.name), backgroundColor: laneLightColor(lane.name) } : {}"
                  @click="selectLane(lane.name)"
                >
                  <span class="text-2xl">{{ lane.icon }}</span>
                  <span class="text-xs font-semibold text-text-primary text-center leading-tight">{{ lane.name }}</span>
                </button>
              </div>
            </div>

            <!-- Step 2: Duration selection -->
            <div v-else-if="triage.step === 'duration'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-text-secondary">How long will this take?</h3>
                <button class="text-xs text-accent hover:text-accent-hover font-medium" @click="goToLane">
                  &larr; Back
                </button>
              </div>

              <div class="grid grid-cols-5 gap-2">
                <button
                  v-for="opt in durationOptions"
                  :key="opt.weeks"
                  class="flex flex-col items-center gap-1.5 px-3 py-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]"
                  :class="triage.selectedDuration === opt.weeks
                    ? 'border-accent bg-accent/5 shadow-sm'
                    : 'border-border-subtle hover:border-border'"
                  @click="selectDuration(opt.weeks)"
                >
                  <span class="text-lg font-bold text-text-primary">{{ opt.weeks }}{{ opt.weeks >= 5 ? '+' : '' }}</span>
                  <span class="text-[10px] font-medium text-text-tertiary">{{ opt.weeks === 1 ? 'week' : 'weeks' }}</span>
                </button>
              </div>
            </div>

            <!-- Step 3: Week selection (timing) -->
            <div v-else-if="triage.step === 'timing'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-text-secondary">When should this ship?</h3>
                <button class="text-xs text-accent hover:text-accent-hover font-medium" @click="goToDuration">
                  &larr; Back
                </button>
              </div>

              <!-- Quick options -->
              <div class="grid grid-cols-2 gap-2 mb-4">
                <button
                  class="px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-medium text-text-primary hover:bg-surface-raised transition-colors"
                  @click="selectWeek(currentWeekIdx)"
                >
                  This week
                </button>
                <button
                  v-if="currentWeekIdx + 1 < quarter.weeks.length"
                  class="px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-medium text-text-primary hover:bg-surface-raised transition-colors"
                  @click="selectWeek(currentWeekIdx + 1)"
                >
                  Next week
                </button>
                <button
                  class="px-4 py-2.5 rounded-lg border border-border-subtle text-sm font-medium text-text-primary hover:bg-surface-raised transition-colors"
                  @click="selectWeek(quarter.weeks.length - 1)"
                >
                  End of quarter
                </button>
              </div>

              <!-- Week picker with span preview -->
              <div class="text-xs font-medium text-text-tertiary mb-2">Or pick a specific week:</div>
              <div class="grid grid-cols-7 gap-1">
                <button
                  v-for="week in quarter.weeks"
                  :key="week.num"
                  class="flex flex-col items-center py-2 px-1 rounded-lg border text-xs transition-all duration-200"
                  :class="{
                    'border-accent bg-accent text-white': triage.selectedWeek === week.num,
                    'border-accent/30 bg-accent/10 text-accent': spanPreview && triage.selectedWeek !== week.num && week.num > (spanPreview.startWeekIdx) && week.num <= spanPreview.endWeekIdx,
                    'border-border-subtle hover:border-border hover:bg-surface-raised': (!spanPreview || (week.num < (spanPreview.startWeekIdx) || week.num > spanPreview.endWeekIdx)) && triage.selectedWeek !== week.num && week.capacity > 0,
                    'border-danger-light bg-danger-light text-text-tertiary cursor-not-allowed': week.capacity === 0,
                  }"
                  :disabled="week.capacity === 0"
                  @click="week.capacity > 0 && selectWeek(week.num)"
                >
                  <span class="font-semibold">{{ week.label }}</span>
                  <span class="text-[9px] mt-0.5 opacity-70">{{ store.weekLoad(week.num).toFixed(1) }}/{{ week.capacity }}</span>
                </button>
              </div>

              <!-- Span preview legend -->
              <div v-if="spanPreview" class="flex items-center gap-2 mt-3 text-[10px] text-text-tertiary">
                <div class="w-3 h-2 rounded-sm bg-accent" />
                <span>Start</span>
                <div class="w-3 h-2 rounded-sm bg-accent/10 border border-accent/30" />
                <span>Span ({{ triage.selectedDuration ?? triage.currentItem?.durationWeeks ?? 1 }}w)</span>
              </div>
            </div>

            <!-- Step 4: Notes -->
            <div v-else-if="triage.step === 'notes'">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-sm font-semibold text-text-secondary">Any context to add?</h3>
                <button class="text-xs text-accent hover:text-accent-hover font-medium" @click="store.setTriageStep('timing')">
                  &larr; Back
                </button>
              </div>

              <!-- Summary -->
              <div class="p-3 rounded-lg bg-surface-raised mb-4">
                <div class="flex items-center gap-2 mb-1">
                  <div
                    class="w-2 h-2 rounded-full"
                    :style="{ backgroundColor: triage.selectedLane ? laneColor(triage.selectedLane) : '#6B7280' }"
                  />
                  <span class="text-xs font-medium text-text-primary">{{ triage.selectedLane }}</span>
                  <span class="text-xs text-text-tertiary">&middot;</span>
                  <span class="text-xs text-text-secondary">
                    {{ triage.selectedDuration ?? triage.currentItem?.durationWeeks ?? 1 }}w
                  </span>
                  <span class="text-xs text-text-tertiary">&middot;</span>
                  <span class="text-xs text-text-secondary">
                    {{ quarter.weeks[triage.selectedWeek ?? 0]?.label }} ({{ quarter.weeks[triage.selectedWeek ?? 0]?.dateLabel }})
                  </span>
                </div>
              </div>

              <textarea
                :value="triage.note"
                placeholder="Dependencies, blockers, context... (optional)"
                rows="3"
                class="w-full px-3 py-2 text-sm bg-surface border border-border-subtle rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none transition-all"
                @input="handleNoteInput"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="px-6 py-4 border-t border-border-subtle flex items-center justify-between">
            <button
              class="text-xs font-medium text-text-tertiary hover:text-danger transition-colors"
              @click="skip"
            >
              Skip
            </button>

            <button
              v-if="triage.step === 'notes'"
              class="px-5 py-2 bg-accent text-white text-sm font-semibold rounded-lg hover:bg-accent-hover transition-colors"
              @click="complete"
            >
              Place on Roadmap
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
