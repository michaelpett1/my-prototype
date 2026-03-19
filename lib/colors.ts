import type { LaneName } from '~/types'

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
