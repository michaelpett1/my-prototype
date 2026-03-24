'use client';
import { create } from 'zustand';
import type { Objective, KeyResult, CheckIn, OKRStatus } from '@/lib/types';
import { OBJECTIVES } from '@/lib/data/mockData';

interface OKRsState {
  objectives: Objective[];
  selectedObjectiveId: string | null;
  filterPeriod: string | null;
  filterOwnerId: string | null;
  checkInModalKRId: string | null;

  selectObjective: (id: string | null) => void;
  setFilterPeriod: (period: string | null) => void;
  setFilterOwnerId: (id: string | null) => void;
  openCheckIn: (krId: string) => void;
  closeCheckIn: () => void;
  updateKeyResult: (objectiveId: string, krId: string, patch: Partial<KeyResult>) => void;
  addCheckIn: (objectiveId: string, krId: string, checkIn: CheckIn) => void;
  addObjective: (obj: Objective) => void;
  updateObjectiveStatus: (id: string, status: OKRStatus) => void;
}

export const useOKRsStore = create<OKRsState>((set) => ({
  objectives: OBJECTIVES,
  selectedObjectiveId: null,
  filterPeriod: null,
  filterOwnerId: null,
  checkInModalKRId: null,

  selectObjective: (id) => set({ selectedObjectiveId: id }),
  setFilterPeriod: (period) => set({ filterPeriod: period }),
  setFilterOwnerId: (id) => set({ filterOwnerId: id }),
  openCheckIn: (krId) => set({ checkInModalKRId: krId }),
  closeCheckIn: () => set({ checkInModalKRId: null }),
  updateKeyResult: (objectiveId, krId, patch) =>
    set((state) => ({
      objectives: state.objectives.map((obj) =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map((kr) =>
                kr.id === krId ? { ...kr, ...patch, updatedAt: new Date().toISOString() } : kr
              ),
            }
          : obj
      ),
    })),
  addCheckIn: (objectiveId, krId, checkIn) =>
    set((state) => ({
      objectives: state.objectives.map((obj) =>
        obj.id === objectiveId
          ? {
              ...obj,
              keyResults: obj.keyResults.map((kr) =>
                kr.id === krId
                  ? { ...kr, checkIns: [...kr.checkIns, checkIn], currentValue: checkIn.value, updatedAt: new Date().toISOString() }
                  : kr
              ),
            }
          : obj
      ),
    })),
  addObjective: (obj) => set((state) => ({ objectives: [...state.objectives, obj] })),
  updateObjectiveStatus: (id, status) =>
    set((state) => ({
      objectives: state.objectives.map((obj) =>
        obj.id === id ? { ...obj, status, updatedAt: new Date().toISOString() } : obj
      ),
    })),
}));
