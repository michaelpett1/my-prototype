'use client';
import { create } from 'zustand';
import type { TimelineItem, TimelineViewMode, GanttScale } from '@/lib/types';
import { TIMELINE_ITEMS } from '@/lib/data/mockData';

interface ProjectsState {
  items: TimelineItem[];
  viewMode: TimelineViewMode;
  ganttScale: GanttScale;
  selectedItemId: string | null;
  filterStatus: string | null;
  filterOwnerId: string | null;
  filterPriority: string | null;

  setViewMode: (mode: TimelineViewMode) => void;
  setGanttScale: (scale: GanttScale) => void;
  selectItem: (id: string | null) => void;
  updateItem: (id: string, patch: Partial<TimelineItem>) => void;
  addItem: (item: TimelineItem) => void;
  setFilterStatus: (status: string | null) => void;
  setFilterOwnerId: (id: string | null) => void;
  setFilterPriority: (priority: string | null) => void;
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  items: TIMELINE_ITEMS,
  viewMode: 'gantt',
  ganttScale: 'month',
  selectedItemId: null,
  filterStatus: null,
  filterOwnerId: null,
  filterPriority: null,

  setViewMode: (mode) => set({ viewMode: mode }),
  setGanttScale: (scale) => set({ ganttScale: scale }),
  selectItem: (id) => set({ selectedItemId: id }),
  updateItem: (id, patch) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...patch, updatedAt: new Date().toISOString() } : item
      ),
    })),
  addItem: (item) => set((state) => ({ items: [...state.items, item] })),
  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterOwnerId: (id) => set({ filterOwnerId: id }),
  setFilterPriority: (priority) => set({ filterPriority: priority }),
}));
