export type TimelineItemStatus = 'not_started' | 'in_progress' | 'at_risk' | 'complete';
export type Priority = 'p0' | 'p1' | 'p2' | 'p3';
export type OKRStatus = 'on_track' | 'at_risk' | 'off_track';
export type MetricType = 'number' | 'percentage' | 'currency' | 'binary';
export type TimelineViewMode = 'gantt' | 'table' | 'board';
export type GanttScale = 'week' | 'month' | 'quarter';
export type Theme = 'light' | 'dark' | 'system';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  role: string;
}

export interface TimelineItem {
  id: string;
  title: string;
  description: string;
  type: 'project' | 'milestone' | 'task';
  parentId: string | null;
  status: TimelineItemStatus;
  priority: Priority;
  ownerId: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CheckIn {
  id: string;
  value: number;
  note: string;
  createdAt: string;
}

export interface KeyResult {
  id: string;
  objectiveId: string;
  title: string;
  ownerId: string;
  metricType: MetricType;
  startValue: number;
  currentValue: number;
  targetValue: number;
  confidence: OKRStatus;
  checkIns: CheckIn[];
  createdAt: string;
  updatedAt: string;
}

export interface Objective {
  id: string;
  title: string;
  description: string;
  ownerId: string;
  period: string;
  status: OKRStatus;
  keyResults: KeyResult[];
  createdAt: string;
  updatedAt: string;
}

export interface ActivityEvent {
  id: string;
  text: string;
  timestamp: string;
  type: 'status_change' | 'progress' | 'created' | 'checkin';
}

export interface AppSettings {
  theme: Theme;
  accentColor: string;
  sidebarCompact: boolean;
  profile: {
    name: string;
    email: string;
    avatarUrl: string;
    role: string;
  };
  workspace: {
    name: string;
    defaultOKRPeriod: string;
    defaultTimelineView: TimelineViewMode;
  };
}
