'use client';
import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useOKRsStore } from '@/lib/store/okrsStore';
import type { KeyResult } from '@/lib/types';

interface CheckInModalProps {
  kr: KeyResult;
  objectiveId: string;
  onClose: () => void;
}

export function CheckInModal({ kr, objectiveId, onClose }: CheckInModalProps) {
  const [value, setValue] = useState(kr.currentValue);
  const [note, setNote] = useState('');
  const { addCheckIn } = useOKRsStore();

  const handleSubmit = () => {
    addCheckIn(objectiveId, kr.id, {
      id: `ci-${Date.now()}`,
      value,
      note,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  const formatValue = (v: number) => {
    if (kr.metricType === 'currency') return `$${v.toLocaleString()}`;
    if (kr.metricType === 'percentage') return `${v}%`;
    if (kr.metricType === 'binary') return v ? 'Done' : 'Not done';
    return String(v);
  };

  return (
    <Modal open onClose={onClose} title="Log Check-in" size="md">
      <div className="space-y-4">
        <div>
          <p className="text-xs text-slate-500 mb-1">Key Result</p>
          <p className="text-sm font-medium text-slate-800">{kr.title}</p>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-500">
          <div>Start: <span className="font-medium text-slate-700">{formatValue(kr.startValue)}</span></div>
          <div>Current: <span className="font-medium text-slate-700">{formatValue(kr.currentValue)}</span></div>
          <div>Target: <span className="font-medium text-slate-700">{formatValue(kr.targetValue)}</span></div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            New value
          </label>
          {kr.metricType === 'binary' ? (
            <select
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
            >
              <option value={0}>Not done</option>
              <option value={1}>Done</option>
            </select>
          ) : (
            <input
              type="number"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 focus:outline-none focus:border-blue-500"
              placeholder={`Enter ${kr.metricType === 'currency' ? 'amount' : 'value'}`}
            />
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Note <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="What drove this change? Any blockers?"
            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit}>Save Check-in</Button>
        </div>
      </div>
    </Modal>
  );
}
