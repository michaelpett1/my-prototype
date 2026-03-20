import { defineStore } from 'pinia'
import type {
  RoadmapItem,
  LaneName,
  Mode,
  TriageState,
  TriageStep,
  FilterState,
  ItemSource,
  ConfidenceLevel,
  ScanResult,
  VelocityData,
} from '~/types'
import { PRIORITY_ORDER } from '~/types'
import { useQuarter } from '~/composables/useQuarter'

export const useRoadmapStore = defineStore('roadmap', () => {
  const { quarter, currentWeekIdx } = useQuarter()

  // ── State ──────────────────────────────────────────────────────────

  const items = ref<RoadmapItem[]>([])
  const mode = ref<Mode>('auto')
  const masterCapacity = ref(3)
  const isLoading = ref(false)

  const activeFilters = ref<FilterState>({
    lanes: [],
    sources: [],
    confidenceLevels: [],
  })

  const triageState = ref<TriageState>({
    currentItem: null,
    step: null,
    selectedLane: null,
    selectedDuration: null,
    selectedWeek: null,
    note: '',
  })

  const scanHistory = ref<ScanResult[]>([])
  const activeScan = ref<ScanResult | null>(null)
  const velocity = ref<VelocityData | null>(null)
  const baselineCapacityPerWeek = ref(0)

  // ── Week / quarter derived state ───────────────────────────────────

  const weeks = computed(() => quarter.value.weeks)
  const weekCount = computed(() => weeks.value.length)

  // ── Getters: item subsets ──────────────────────────────────────────

  const placedItems = computed(() =>
    items.value.filter(i => i.startWeekIdx >= 0),
  )

  const inboxItems = computed(() =>
    items.value.filter(i => i.startWeekIdx === -1),
  )

  const slackInboxItems = computed(() =>
    inboxItems.value.filter(i =>
      i.sources.some(s => s.type === 'slack'),
    ),
  )

  const confluenceInboxItems = computed(() =>
    inboxItems.value.filter(i =>
      i.sources.some(s => s.type === 'confluence'),
    ),
  )

  const lowConfidenceItems = computed(() =>
    inboxItems.value.filter(i => i.confidenceLevel === 'low'),
  )

  // ── Getters: filtered placed items ─────────────────────────────────

  const filteredPlacedItems = computed(() => {
    let result = placedItems.value

    if (activeFilters.value.lanes.length > 0) {
      result = result.filter(i => activeFilters.value.lanes.includes(i.lane))
    }

    if (activeFilters.value.sources.length > 0) {
      result = result.filter(i =>
        i.sources.some(s => activeFilters.value.sources.includes(s.type)),
      )
    }

    if (activeFilters.value.confidenceLevels.length > 0) {
      result = result.filter(i =>
        activeFilters.value.confidenceLevels.includes(i.confidenceLevel),
      )
    }

    return result
  })

  // ── Cell / load queries ────────────────────────────────────────────

  /** All items active in a given cell (their span covers this week and lane matches). */
  function itemsForCell(weekIdx: number, lane: LaneName): RoadmapItem[] {
    return placedItems.value.filter(
      i => i.startWeekIdx <= weekIdx && i.endWeekIdx >= weekIdx && i.lane === lane,
    )
  }

  /** Items whose placement *starts* in a given cell (used for grid rendering). */
  function itemsStartingInCell(weekIdx: number, lane: LaneName): RoadmapItem[] {
    return placedItems.value.filter(
      i => i.startWeekIdx === weekIdx && i.lane === lane,
    )
  }

  /**
   * Total effort load in a given week.
   * Each item contributes `effortPoints / durationWeeks` to every week it spans.
   */
  function weekLoad(weekIdx: number): number {
    let load = 0
    for (const item of placedItems.value) {
      if (item.startWeekIdx <= weekIdx && item.endWeekIdx >= weekIdx) {
        load += item.effortPoints / item.durationWeeks
      }
    }
    return load
  }

  function isOverCapacity(weekIdx: number): boolean {
    const week = weeks.value[weekIdx]
    if (!week) return false
    return weekLoad(weekIdx) > week.capacity
  }

  // ── Actions: item CRUD ─────────────────────────────────────────────

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
      item.startWeekIdx = -1
      item.endWeekIdx = -1
    }
  }

  function deleteItem(key: string) {
    const idx = items.value.findIndex(i => i.key === key)
    if (idx !== -1) {
      items.value.splice(idx, 1)
    }
  }

  function placeItem(
    key: string,
    startWeekIdx: number,
    lane?: LaneName,
    duration?: number,
  ) {
    const item = items.value.find(i => i.key === key)
    if (!item) return

    if (duration !== undefined) {
      item.durationWeeks = duration
    }
    item.startWeekIdx = startWeekIdx
    item.endWeekIdx = startWeekIdx + item.durationWeeks - 1
    if (lane) item.lane = lane
  }

  function updateItemNote(key: string, note: string) {
    const item = items.value.find(i => i.key === key)
    if (item) item.note = note
  }

  // ── Auto-distribution algorithm ────────────────────────────────────

  function distributeAuto() {
    const cw = currentWeekIdx.value
    const total = weekCount.value

    // Track effort usage per week
    const weekEffort: number[] = new Array(total).fill(0)

    // Reset all items to unplaced
    items.value.forEach(i => {
      i.startWeekIdx = -1
      i.endWeekIdx = -1
    })

    // Separate by project size
    const epics = items.value.filter(i => i.projectSize === 'epic')
    const deliverables = items.value.filter(i => i.projectSize === 'deliverable')

    // Sort each group: confidence DESC, then priority ASC (higher priority = lower number)
    const sortFn = (a: RoadmapItem, b: RoadmapItem) => {
      const confDiff = b.confidence - a.confidence
      if (confDiff !== 0) return confDiff
      return (PRIORITY_ORDER[a.priority] ?? 3) - (PRIORITY_ORDER[b.priority] ?? 3)
    }
    epics.sort(sortFn)
    deliverables.sort(sortFn)

    // Place epics first — they need contiguous blocks
    for (const item of epics) {
      placeContiguous(item, cw, weekEffort, total)
    }

    // Place deliverables — single-week or short spans, effort-based capacity
    for (const item of deliverables) {
      placeContiguous(item, cw, weekEffort, total)
    }
  }

  /**
   * Find the first contiguous block of `durationWeeks` weeks starting from
   * `startFrom` where every week has remaining capacity for this item's
   * per-week effort contribution.
   */
  function placeContiguous(
    item: RoadmapItem,
    startFrom: number,
    weekEffort: number[],
    total: number,
  ): boolean {
    const dur = item.durationWeeks
    const perWeekEffort = item.effortPoints / dur

    // Scan forward from current week
    if (tryPlaceContiguousFrom(item, startFrom, total, dur, perWeekEffort, weekEffort)) {
      return true
    }

    // If nothing found forward, try earlier weeks
    if (tryPlaceContiguousFrom(item, 0, startFrom, dur, perWeekEffort, weekEffort)) {
      return true
    }

    // Last resort: place in the least-loaded contiguous block
    return placeInLeastLoadedBlock(item, dur, perWeekEffort, weekEffort, total)
  }

  function tryPlaceContiguousFrom(
    item: RoadmapItem,
    rangeStart: number,
    rangeEnd: number,
    dur: number,
    perWeekEffort: number,
    weekEffort: number[],
  ): boolean {
    for (let start = rangeStart; start <= rangeEnd - dur; start++) {
      let fits = true
      for (let w = start; w < start + dur; w++) {
        const cap = weeks.value[w]?.capacity ?? masterCapacity.value
        if (cap <= 0 || weekEffort[w] + perWeekEffort > cap) {
          fits = false
          break
        }
      }
      if (fits) {
        commitPlacement(item, start, dur, perWeekEffort, weekEffort)
        return true
      }
    }
    return false
  }

  function placeInLeastLoadedBlock(
    item: RoadmapItem,
    dur: number,
    perWeekEffort: number,
    weekEffort: number[],
    total: number,
  ): boolean {
    let bestStart = -1
    let bestMaxLoad = Infinity

    for (let start = 0; start <= total - dur; start++) {
      let maxLoad = 0
      let viable = true
      for (let w = start; w < start + dur; w++) {
        const cap = weeks.value[w]?.capacity ?? masterCapacity.value
        if (cap <= 0) {
          viable = false
          break
        }
        maxLoad = Math.max(maxLoad, weekEffort[w])
      }
      if (viable && maxLoad < bestMaxLoad) {
        bestMaxLoad = maxLoad
        bestStart = start
      }
    }

    if (bestStart === -1) return false

    commitPlacement(item, bestStart, dur, perWeekEffort, weekEffort)
    return true
  }

  function commitPlacement(
    item: RoadmapItem,
    startIdx: number,
    dur: number,
    perWeekEffort: number,
    weekEffort: number[],
  ) {
    item.startWeekIdx = startIdx
    item.endWeekIdx = startIdx + dur - 1
    for (let w = startIdx; w < startIdx + dur; w++) {
      weekEffort[w] += perWeekEffort
    }
  }

  // ── Capacity management ────────────────────────────────────────────

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

  // ── Mode management ────────────────────────────────────────────────

  function setMode(newMode: Mode) {
    mode.value = newMode
    if (newMode === 'auto') {
      distributeAuto()
    }
  }

  // ── Filter management ──────────────────────────────────────────────

  function toggleLaneFilter(lane: LaneName) {
    const idx = activeFilters.value.lanes.indexOf(lane)
    if (idx === -1) {
      activeFilters.value.lanes.push(lane)
    } else {
      activeFilters.value.lanes.splice(idx, 1)
    }
  }

  function toggleSourceFilter(source: ItemSource) {
    const idx = activeFilters.value.sources.indexOf(source)
    if (idx === -1) {
      activeFilters.value.sources.push(source)
    } else {
      activeFilters.value.sources.splice(idx, 1)
    }
  }

  function toggleConfidenceFilter(level: ConfidenceLevel) {
    const idx = activeFilters.value.confidenceLevels.indexOf(level)
    if (idx === -1) {
      activeFilters.value.confidenceLevels.push(level)
    } else {
      activeFilters.value.confidenceLevels.splice(idx, 1)
    }
  }

  function clearFilters() {
    activeFilters.value.lanes = []
    activeFilters.value.sources = []
    activeFilters.value.confidenceLevels = []
  }

  // ── Triage flow ────────────────────────────────────────────────────

  function startTriage(item: RoadmapItem) {
    triageState.value = {
      currentItem: item,
      step: 'lane',
      selectedLane: item.lane,
      selectedDuration: item.durationWeeks,
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

  function setTriageDuration(duration: number) {
    triageState.value.selectedDuration = duration
  }

  function setTriageWeek(weekIdx: number) {
    triageState.value.selectedWeek = weekIdx
  }

  function setTriageNote(note: string) {
    triageState.value.note = note
  }

  function completeTriage() {
    const { currentItem, selectedLane, selectedDuration, selectedWeek, note } = triageState.value
    if (currentItem && selectedLane != null && selectedWeek != null) {
      placeItem(
        currentItem.key,
        selectedWeek,
        selectedLane,
        selectedDuration ?? currentItem.durationWeeks,
      )
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
      selectedDuration: null,
      selectedWeek: null,
      note: '',
    }
  }

  // ── Velocity ───────────────────────────────────────────────────────

  function setVelocity(data: VelocityData) {
    velocity.value = data
    // Convert sprint-level velocity to a per-week capacity baseline
    if (data.sprintLengthWeeks > 0) {
      baselineCapacityPerWeek.value =
        data.averagePointsPerSprint / data.sprintLengthWeeks
    } else {
      baselineCapacityPerWeek.value = 0
    }
  }

  // ── Scan management ────────────────────────────────────────────────

  function startScan(scan: ScanResult) {
    activeScan.value = scan
    scanHistory.value.push(scan)
  }

  function completeScan(scanId: string, extractedProjects: number) {
    const scan = scanHistory.value.find(s => s.id === scanId)
    if (scan) {
      scan.status = 'complete'
      scan.extractedProjects = extractedProjects
    }
    if (activeScan.value?.id === scanId) {
      activeScan.value = scan ? { ...scan } : null
    }
  }

  function failScan(scanId: string, error: string) {
    const scan = scanHistory.value.find(s => s.id === scanId)
    if (scan) {
      scan.status = 'error'
      scan.error = error
    }
    if (activeScan.value?.id === scanId) {
      activeScan.value = scan ? { ...scan } : null
    }
  }

  // ── Reset ──────────────────────────────────────────────────────────

  function reset() {
    items.value = []
    scanHistory.value = []
    activeScan.value = null
    velocity.value = null
    baselineCapacityPerWeek.value = 0
    resetTriage()
    clearFilters()
  }

  // ── Public API ─────────────────────────────────────────────────────

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
    scanHistory,
    activeScan,
    velocity,
    baselineCapacityPerWeek,

    // Getters
    placedItems,
    inboxItems,
    slackInboxItems,
    confluenceInboxItems,
    lowConfidenceItems,
    filteredPlacedItems,

    // Cell / load queries
    itemsForCell,
    itemsStartingInCell,
    weekLoad,
    isOverCapacity,

    // Item CRUD
    addItems,
    removeItem,
    deleteItem,
    placeItem,
    updateItemNote,

    // Distribution
    distributeAuto,

    // Capacity
    setMasterCapacity,
    setWeekCapacity,

    // Mode
    setMode,

    // Filters
    toggleLaneFilter,
    toggleSourceFilter,
    toggleConfidenceFilter,
    clearFilters,

    // Triage
    startTriage,
    setTriageStep,
    setTriageLane,
    setTriageDuration,
    setTriageWeek,
    setTriageNote,
    completeTriage,
    skipTriage,
    resetTriage,

    // Velocity
    setVelocity,

    // Scan
    startScan,
    completeScan,
    failScan,

    // Reset
    reset,
  }
})
