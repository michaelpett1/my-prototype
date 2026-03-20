import { useRoadmapStore } from '~/stores/roadmap'
import type { VelocityData } from '~/types'

export function useVelocity() {
  const store = useRoadmapStore()
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchVelocity() {
    isLoading.value = true
    error.value = null
    try {
      const data = await $fetch<{ velocity: VelocityData }>('/api/scan/velocity')
      store.setVelocity(data.velocity)
    }
    catch (e: unknown) {
      const fetchErr = e as { data?: { message?: string } }
      error.value = fetchErr?.data?.message || (e instanceof Error ? e.message : 'Failed to fetch velocity')
    }
    finally {
      isLoading.value = false
    }
  }

  return { isLoading, error, fetchVelocity }
}
