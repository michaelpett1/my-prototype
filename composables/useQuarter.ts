import type { QuarterConfig, WeekConfig } from '~/types'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getQuarterStartMonth(quarter: 1 | 2 | 3 | 4): number {
  return (quarter - 1) * 3
}

function formatDate(date: Date): string {
  return `${date.getDate()} ${MONTHS[date.getMonth()]}`
}

export function generateQuarter(year: number, quarter: 1 | 2 | 3 | 4): QuarterConfig {
  const startMonth = getQuarterStartMonth(quarter)
  const startDate = new Date(year, startMonth, 1)

  const dayOfWeek = startDate.getDay()
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const firstMonday = new Date(year, startMonth, 1 + mondayOffset)

  const weeks: WeekConfig[] = []

  for (let i = 0; i < 13; i++) {
    const weekStart = new Date(firstMonday)
    weekStart.setDate(firstMonday.getDate() + i * 7)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    weeks.push({
      num: i,
      start: weekStart,
      end: weekEnd,
      label: `W${i + 1}`,
      dateLabel: formatDate(weekStart),
      month: MONTHS[weekStart.getMonth()],
      capacity: 3,
    })
  }

  return { year, quarter, startDate: firstMonday, weeks }
}

// Module-level shared state — singleton across all callers
const now = new Date()
const _currentQuarterNum = (Math.floor(now.getMonth() / 3) + 1) as 1 | 2 | 3 | 4
const _currentYear = now.getFullYear()

const _quarter = ref(generateQuarter(_currentYear, _currentQuarterNum))
const _activeQuarter = ref(_currentQuarterNum)
const _activeYear = ref(_currentYear)

const _currentWeekIdx = computed(() => {
  const now = new Date()
  for (let i = 0; i < _quarter.value.weeks.length; i++) {
    const w = _quarter.value.weeks[i]
    if (now >= w.start && now <= w.end) return i
  }
  return 0
})

const _monthGroups = computed(() => {
  const groups: { month: string; startIdx: number; count: number }[] = []
  let currentMonth = ''
  for (let i = 0; i < _quarter.value.weeks.length; i++) {
    const w = _quarter.value.weeks[i]
    if (w.month !== currentMonth) {
      groups.push({ month: w.month, startIdx: i, count: 1 })
      currentMonth = w.month
    } else {
      groups[groups.length - 1].count++
    }
  }
  return groups
})

export function useQuarter() {
  function setQuarter(year: number, q: 1 | 2 | 3 | 4) {
    _activeYear.value = year
    _activeQuarter.value = q
    _quarter.value = generateQuarter(year, q)
  }

  return {
    quarter: _quarter,
    activeQuarter: _activeQuarter,
    activeYear: _activeYear,
    currentWeekIdx: _currentWeekIdx,
    setQuarter,
    monthGroups: _monthGroups,
  }
}
