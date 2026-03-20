import type { LaneName, ConfidenceLevel, ItemSource } from '~/types'

export const LANE_COLORS: Record<LaneName, string> = {
  'New Product Features': '#0157FF',
  'Improvements': '#7C3AED',
  'Site Hygiene': '#059669',
}

export const LANE_LIGHT_COLORS: Record<LaneName, string> = {
  'New Product Features': '#EBF1FF',
  'Improvements': '#F3EEFF',
  'Site Hygiene': '#ECFDF5',
}

export const PRIORITY_COLORS: Record<string, string> = {
  'Blocked': '#EF4444',
  'High': '#F97316',
  'Medium': '#F59E0B',
  'Low': '#6B7280',
}

export const STATUS_COLORS: Record<string, string> = {
  'In Progress': '#7C3AED',
  'In QA': '#F59E0B',
  'In Product': '#10B981',
  'To Do': '#0157FF',
  'Backlog': '#9CA3AF',
  'New': '#D97706',
}

export function laneColor(lane: LaneName): string {
  return LANE_COLORS[lane] ?? '#6B7280'
}

export function laneLightColor(lane: LaneName): string {
  return LANE_LIGHT_COLORS[lane] ?? '#F4F5F7'
}

export function priorityColor(priority: string): string {
  return PRIORITY_COLORS[priority] ?? '#6B7280'
}

export function statusColor(status: string): string {
  return STATUS_COLORS[status] ?? '#9CA3AF'
}

// ── Confidence colors ──────────────────────────────────────────────

export const CONFIDENCE_COLORS: Record<ConfidenceLevel, string> = {
  high: '#10B981',
  medium: '#F59E0B',
  low: '#EF4444',
}

export const CONFIDENCE_BG_COLORS: Record<ConfidenceLevel, string> = {
  high: '#ECFDF5',
  medium: '#FFFBEB',
  low: '#FEF2F2',
}

export function confidenceColor(level: ConfidenceLevel): string {
  return CONFIDENCE_COLORS[level] ?? '#9CA3AF'
}

export function confidenceBgColor(level: ConfidenceLevel): string {
  return CONFIDENCE_BG_COLORS[level] ?? '#F4F5F7'
}

// ── Source colors ──────────────────────────────────────────────────

export const SOURCE_COLORS: Record<ItemSource, string> = {
  slack: '#4A154B',
  confluence: '#0052CC',
  jira: '#0052CC',
  manual: '#6B7280',
}

export function sourceColor(type: ItemSource): string {
  return SOURCE_COLORS[type] ?? '#6B7280'
}
