import { useRoadmapStore } from '~/stores/roadmap'
import type { LaneConfig } from '~/types'
import { LANES } from '~/types'

export function useRoadmap() {
  const store = useRoadmapStore()

  const lanes: LaneConfig[] = LANES

  return {
    store,
    lanes,
  }
}
