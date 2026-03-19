import { useRoadmapStore } from '~/stores/roadmap'

export function useCapacity() {
  const store = useRoadmapStore()

  const totalCapacity = computed(() =>
    store.weeks.reduce((sum, w) => sum + w.capacity, 0)
  )

  const totalLoad = computed(() => store.placedItems.length)

  const utilizationPercent = computed(() => {
    if (totalCapacity.value === 0) return 0
    return Math.round((totalLoad.value / totalCapacity.value) * 100)
  })

  return {
    masterCapacity: computed({
      get: () => store.masterCapacity,
      set: (val: number) => store.setMasterCapacity(val),
    }),
    totalCapacity,
    totalLoad,
    utilizationPercent,
    setWeekCapacity: store.setWeekCapacity,
    weekLoad: store.weekLoad,
    isOverCapacity: store.isOverCapacity,
  }
}
