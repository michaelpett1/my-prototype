export type LaneName = 'New Product Features' | 'Improvements' | 'Site Hygiene'
export type Mode = 'auto' | 'triage'
export type TicketType = 'dev' | 'design' | 'both'
export type Priority = 'Blocked' | 'High' | 'Medium' | 'Low'
export type TicketStatus = 'Backlog' | 'To Do' | 'In Progress' | 'In QA' | 'In Product' | 'New'
export type ItemSource = 'jira' | 'audit'
export type TriageStep = 'lane' | 'timing' | 'notes' | null

export interface RoadmapItem {
  key: string
  title: string
  status: TicketStatus
  priority: Priority
  assignee: string | null
  ticketType: TicketType
  lane: LaneName
  weekIdx: number // 0-12 = placed, -1 = unplaced (inbox)
  note: string
  source: ItemSource
  auditPriority?: string
  auditEffort?: string
  auditArea?: string
  jiraUrl?: string
}

export interface WeekConfig {
  num: number
  start: Date
  end: Date
  label: string
  dateLabel: string
  month: string
  capacity: number
}

export interface QuarterConfig {
  year: number
  quarter: 1 | 2 | 3 | 4
  startDate: Date
  weeks: WeekConfig[]
}

export interface LaneConfig {
  name: LaneName
  color: string
  lightColor: string
  icon: string
}

export interface TriageState {
  currentItem: RoadmapItem | null
  step: TriageStep
  selectedLane: LaneName | null
  selectedWeek: number | null
  note: string
}

export interface FilterState {
  lanes: LaneName[]
  types: TicketType[]
}

export interface JiraIssue {
  key: string
  fields: {
    summary: string
    status: { name: string }
    priority: { name: string }
    assignee: { displayName: string } | null
    issuetype: { name: string }
    labels: string[]
    created: string
    updated: string
  }
}

export interface AuditTicket {
  title: string
  priority: string
  effort: string
  area: string
  suggestedLane: LaneName
  rationale?: string
}

export const LANES: LaneConfig[] = [
  { name: 'New Product Features', color: 'lane-features', lightColor: 'lane-features-light', icon: '🚀' },
  { name: 'Improvements', color: 'lane-improvements', lightColor: 'lane-improvements-light', icon: '⚡' },
  { name: 'Site Hygiene', color: 'lane-hygiene', lightColor: 'lane-hygiene-light', icon: '🧹' },
]

export const PRIORITY_ORDER: Record<Priority, number> = {
  Blocked: 0,
  High: 1,
  Medium: 2,
  Low: 3,
}
