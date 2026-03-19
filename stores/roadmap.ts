import { defineStore } from 'pinia'
import type { RoadmapItem, WeekConfig, LaneName, Mode, TicketType, TriageState, TriageStep, FilterState } from '~/types'
import { PRIORITY_ORDER } from '~/types'
import { useQuarter } from '~/composables/useQuarter'

export const useRoadmapStore = defineStore('roadmap', () => {
  const { quarter, currentWeekIdx } = useQuarter()

  // State
  const items = ref<RoadmapItem[]>([])
  const mode = ref<Mode>('auto')
  const masterCapacity = ref(3)
  const isLoading = ref(false)
  const activeFilters = ref<FilterState>({ lanes: [], types: [] })
  const triageState = ref<TriageState>({
    currentItem: null,
    step: null,
    selectedLane: null,
    selectedWeek: null,
    note: '',
  })

  // Week configs (reactive capacity per week)
  const weeks = computed(() => quarter.value.weeks)
  const weekCount = computed(() => weeks.value.length)

  // Getters
  const placedItems = computed(() => items.value.filter(i => i.weekIdx >= 0))
  const inboxItems = computed(() => items.value.filter(i => i.weekIdx === -1))
  const jiraInboxItems = computed(() => inboxItems.value.filter(i => i.source === 'jira'))
  const auditInboxItems = computed(() => inboxItems.value.filter(i => i.source === 'audit'))

  function itemsForCell(weekIdx: number, lane: LaneName): RoadmapItem[] {
    return placedItems.value.filter(i => i.weekIdx === weekIdx && i.lane === lane)
  }

  function weekLoad(weekIdx: number): number {
    return placedItems.value.filter(i => i.weekIdx === weekIdx).length
  }

  function isOverCapacity(weekIdx: number): boolean {
    const week = weeks.value[weekIdx]
    if (!week) return false
    return weekLoad(weekIdx) > week.capacity
  }

  const filteredPlacedItems = computed(() => {
    let result = placedItems.value
    if (activeFilters.value.lanes.length > 0) {
      result = result.filter(i => activeFilters.value.lanes.includes(i.lane))
    }
    if (activeFilters.value.types.length > 0) {
      result = result.filter(i => activeFilters.value.types.includes(i.ticketType))
    }
    return result
  })

  // Actions
  function addItems(newItems: RoadmapItem[]) {
    const existingKeys = new Set(items.value.map(i => i.key))
    const deduped = newItems.filter(i => !existingKeys.has(i.key))
    items.value.push(...deduped)

    if (mode.value === 'auto') {
      distributeAuto()
    }
  }

  function removeItem(key: string) {
    const item = items.value.find(i => i.key === key)
    if (item) {
      item.weekIdx = -1
    }
  }

  function deleteItem(key: string) {
    const idx = items.value.findIndex(i => i.key === key)
    if (idx !== -1) {
      items.value.splice(idx, 1)
    }
  }

  function placeItem(key: string, weekIdx: number, lane?: LaneName) {
    const item = items.value.find(i => i.key === key)
    if (item) {
      item.weekIdx = weekIdx
      if (lane) item.lane = lane
    }
  }

  function updateItemNote(key: string, note: string) {
    const item = items.value.find(i => i.key === key)
    if (item) item.note = note
  }

  // Auto-distribution algorithm
  function distributeAuto() {
    const cw = currentWeekIdx.value
    const total = weekCount.value

    // Separate active and backlog items
    const activeStatuses = new Set(['In Progress', 'In QA', 'In Product'])
    const active = items.value.filter(i => activeStatuses.has(i.status))
    const backlog = items.value.filter(i => !activeStatuses.has(i.status))

    // Sort backlog by priority
    backlog.sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3))

    // Track capacity usage per week
    const weekUsage: number[] = new Array(total).fill(0)

    // Reset all items to unplaced
    items.value.forEach(i => { i.weekIdx = -1 })

    // Place active items in current week first
    for (const item of active) {
      if (weekUsage[cw] < (weeks.value[cw]?.capacity ?? 3)) {
        item.weekIdx = cw
        weekUsage[cw]++
      } else {
        // Find next available week (forward only from current)
        const placed = placeInNextAvailableForward(item, cw, weekUsage, total)
        if (!placed) placeInLeastLoaded(item, weekUsage, total)
      }
    }

    // Distribute backlog across remaining weeks (forward only — no wrapping into past)
    for (const item of backlog) {
      const placed = placeInNextAvailableForward(item, cw, weekUsage, total)
      if (!placed) placeInLeastLoaded(item, weekUsage, total)
    }
  }

  function placeInNextAvailableForward(item: RoadmapItem, startWeek: number, weekUsage: number[], total: number): boolean {
    // Scan forward only from startWeek to end of quarter
    for (let idx = startWeek; idx < total; idx++) {
      const cap = weeks.value[idx]?.capacity ?? 3
      if (cap > 0 && weekUsage[idx] < cap) {
        item.weekIdx = idx
        weekUsage[idx]++
        return true
      }
    }
    // If nothing forward, try earlier weeks (better than not placing at all)
    for (let idx = 0; idx < startWeek; idx++) {
      const cap = weeks.value[idx]?.capacity ?? 3
      if (cap > 0 && weekUsage[idx] < cap) {
        item.weekIdx = idx
        weekUsage[idx]++
        return true
      }
    }
    return false
  }

  function placeInLeastLoaded(item: RoadmapItem, weekUsage: number[], total: number) {
    let minLoad = Infinity
    let minIdx = -1
    for (let i = 0; i < total; i++) {
      const cap = weeks.value[i]?.capacity ?? 3
      if (cap === 0) continue
      if (weekUsage[i] < minLoad) {
        minLoad = weekUsage[i]
        minIdx = i
      }
    }
    // If all weeks have 0 capacity, leave item unplaced
    if (minIdx === -1) return
    item.weekIdx = minIdx
    weekUsage[minIdx]++
  }

  // Capacity management
  function setMasterCapacity(cap: number) {
    masterCapacity.value = cap
    quarter.value.weeks.forEach(w => { w.capacity = cap })
    if (mode.value === 'auto') distributeAuto()
  }

  function setWeekCapacity(weekIdx: number, cap: number) {
    const week = quarter.value.weeks[weekIdx]
    if (week) {
      week.capacity = cap
      if (mode.value === 'auto') distributeAuto()
    }
  }

  // Mode management
  function setMode(newMode: Mode) {
    mode.value = newMode
    if (newMode === 'auto') {
      distributeAuto()
    }
  }

  // Filter management
  function toggleLaneFilter(lane: LaneName) {
    const idx = activeFilters.value.lanes.indexOf(lane)
    if (idx === -1) {
      activeFilters.value.lanes.push(lane)
    } else {
      activeFilters.value.lanes.splice(idx, 1)
    }
  }

  function toggleTypeFilter(type: TicketType) {
    const idx = activeFilters.value.types.indexOf(type)
    if (idx === -1) {
      activeFilters.value.types.push(type)
    } else {
      activeFilters.value.types.splice(idx, 1)
    }
  }

  function clearFilters() {
    activeFilters.value.lanes = []
    activeFilters.value.types = []
  }

  // Triage flow
  function startTriage(item: RoadmapItem) {
    triageState.value = {
      currentItem: item,
      step: 'lane',
      selectedLane: item.lane,
      selectedWeek: null,
      note: '',
    }
  }

  function setTriageStep(step: TriageStep) {
    triageState.value.step = step
  }

  function setTriageLane(lane: LaneName) {
    triageState.value.selectedLane = lane
  }

  function setTriageWeek(weekIdx: number) {
    triageState.value.selectedWeek = weekIdx
  }

  function setTriageNote(note: string) {
    triageState.value.note = note
  }

  function completeTriage() {
    const { currentItem, selectedLane, selectedWeek, note } = triageState.value
    if (currentItem && selectedLane != null && selectedWeek != null) {
      placeItem(currentItem.key, selectedWeek, selectedLane)
      if (note) updateItemNote(currentItem.key, note)
    }
    resetTriage()
  }

  function skipTriage() {
    const { currentItem } = triageState.value
    if (currentItem) {
      deleteItem(currentItem.key)
    }
    resetTriage()
  }

  function resetTriage() {
    triageState.value = {
      currentItem: null,
      step: null,
      selectedLane: null,
      selectedWeek: null,
      note: '',
    }
  }

  function reset() {
    items.value = []
    resetTriage()
    clearFilters()
  }

  return {
    // State
    items,
    mode,
    masterCapacity,
    isLoading,
    activeFilters,
    triageState,
    weeks,
    weekCount,
    // Getters
    placedItems,
    inboxItems,
    jiraInboxItems,
    auditInboxItems,
    filteredPlacedItems,
    // Methods
    itemsForCell,
    weekLoad,
    isOverCapacity,
    addItems,
    removeItem,
    deleteItem,
    placeItem,
    updateItemNote,
    distributeAuto,
    setMasterCapacity,
    setWeekCapacity,
    setMode,
    toggleLaneFilter,
    toggleTypeFilter,
    clearFilters,
    startTriage,
    setTriageStep,
    setTriageLane,
    setTriageWeek,
    setTriageNote,
    completeTriage,
    skipTriage,
    resetTriage,
    reset,
  }
})
