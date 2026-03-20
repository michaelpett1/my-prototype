// ── Core domain types ──────────────────────────────────────────────

export type LaneName = 'New Product Features' | 'Improvements' | 'Site Hygiene'
export type Mode = 'auto' | 'triage'
export type ProjectSize = 'epic' | 'deliverable'
export type Priority = 'Blocked' | 'High' | 'Medium' | 'Low'
export type ProjectStatus = 'proposed' | 'confirmed' | 'in-progress' | 'complete'
export type ConfidenceLevel = 'high' | 'medium' | 'low'
export type ItemSource = 'slack' | 'confluence' | 'jira' | 'manual'
export type TriageStep = 'lane' | 'duration' | 'timing' | 'notes' | null

// ── Source reference (where a project was mentioned) ───────────────

export interface SourceReference {
  type: ItemSource
  id: string            // channel_id, page_id, issue key, etc.
  title: string         // channel name, page title, etc.
  url?: string          // direct link to the conversation/page
  excerpt: string       // relevant text snippet
  timestamp: string     // ISO 8601
}

// ── Roadmap item (a project, not a ticket) ─────────────────────────

export interface RoadmapItem {
  key: string
  title: string
  description: string
  status: ProjectStatus
  priority: Priority
  assignee: string | null
  lane: LaneName
  projectSize: ProjectSize
  durationWeeks: number       // 1 for deliverables, 2-13 for epics
  startWeekIdx: number        // 0-12 = placed, -1 = unplaced (inbox)
  endWeekIdx: number          // startWeekIdx + durationWeeks - 1 when placed
  effortPoints: number        // story points for capacity math
  confidence: number          // 0.0 - 1.0, from AI extraction
  confidenceLevel: ConfidenceLevel
  sources: SourceReference[]  // all sources where this project was mentioned
  note: string
  scanId?: string             // which scan produced this item
}

// ── Week / quarter config ──────────────────────────────────────────

export interface WeekConfig {
  num: number
  start: Date
  end: Date
  label: string
  dateLabel: string
  month: string
  capacity: number       // manual override (effort points per week)
}

export interface QuarterConfig {
  year: number
  quarter: 1 | 2 | 3 | 4
  startDate: Date
  weeks: WeekConfig[]
}

// ── Lane config ────────────────────────────────────────────────────

export interface LaneConfig {
  name: LaneName
  color: string
  lightColor: string
  icon: string
}

// ── Triage state ───────────────────────────────────────────────────

export interface TriageState {
  currentItem: RoadmapItem | null
  step: TriageStep
  selectedLane: LaneName | null
  selectedDuration: number | null   // weeks
  selectedWeek: number | null       // start week
  note: string
}

// ── Filter state ───────────────────────────────────────────────────

export interface FilterState {
  lanes: LaneName[]
  sources: ItemSource[]
  confidenceLevels: ConfidenceLevel[]
}

// ── Scan result ────────────────────────────────────────────────────

export interface ScanResult {
  id: string
  timestamp: string
  status: 'running' | 'complete' | 'error'
  slackChannelsScanned: number
  confluencePagesScanned: number
  rawMentions: number
  extractedProjects: number
  error?: string
}

// ── Velocity (from Jira sprint history) ────────────────────────────

export interface SprintSummary {
  name: string
  completedPoints: number
  completedItems: number
  startDate: string
  endDate: string
}

export interface VelocityData {
  averagePointsPerSprint: number
  averageItemsPerSprint: number
  sprintLengthWeeks: number
  recentSprints: SprintSummary[]
}

// ── Slack / Confluence batch types (for scan pipeline) ─────────────

export interface SlackMessage {
  channel: string
  channelId: string
  user: string
  text: string
  ts: string
  threadTs?: string
  permalink?: string
}

export interface SlackMessageBatch {
  channelId: string
  channelName: string
  messages: SlackMessage[]
}

export interface ConfluencePage {
  id: string
  title: string
  spaceKey: string
  spaceName: string
  url: string
  bodyText: string
  lastModified: string
}

export interface ConfluencePageBatch {
  spaceKey: string
  spaceName: string
  pages: ConfluencePage[]
}

// ── Extracted project (AI output before becoming RoadmapItem) ──────

export interface ExtractedProject {
  title: string
  description: string
  suggestedLane: LaneName
  estimatedDurationWeeks: number
  effortPoints: number
  confidence: number
  priority: Priority
  sources: SourceReference[]
}

// ── Jira types (kept for velocity endpoint) ────────────────────────

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

// ── Constants ──────────────────────────────────────────────────────

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

export function toConfidenceLevel(confidence: number): ConfidenceLevel {
  if (confidence >= 0.8) return 'high'
  if (confidence >= 0.5) return 'medium'
  return 'low'
}
