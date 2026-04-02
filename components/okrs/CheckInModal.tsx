'use client';
import { useState } from 'react';
import confetti from 'canvas-confetti';
import { Modal } from '@/components/ui/Modal';
import { useOKRsStore } from '@/lib/store/okrsStore';
import { calcKRProgress, calcObjectiveProgress } from '@/lib/utils/colorUtils';
import type { KeyResult, OKRStatus } from '@/lib/types';

interface CheckInModalProps {
  kr: KeyResult;
  objectiveId: string;
  onClose: () => void;
}

const fmt = (kr: KeyResult, v: number) =>
  kr.metricType === 'currency' ? `$${v.toLocaleString()}`
  : kr.metricType === 'percentage' ? `${v}%`
  : kr.metricType === 'binary' ? (v ? 'Done' : 'Not done')
  : String(v);

const CONF_OPTIONS: { value: OKRStatus; label: string; bg: string; text: string }[] = [
  { value: 'off_track', label: 'Low', bg: 'var(--bg-primary)', text: 'var(--text-tertiary)' },
  { value: 'at_risk', label: 'Medium', bg: 'var(--bg-primary)', text: 'var(--text-tertiary)' },
  { value: 'on_track', label: 'High', bg: '#16A34A', text: '#FFFFFF' },
];

export function CheckInModal({ kr, objectiveId, onClose }: CheckInModalProps) {
  const [value, setValue] = useState(kr.currentValue);
  const [note, setNote] = useState('');
  const [achievedTarget, setAchievedTarget] = useState('');
  const [confidence, setConfidence] = useState<OKRStatus>(kr.confidence);
  const [saving, setSaving] = useState(false);
  const { addCheckIn, updateKeyResult } = useOKRsStore();

  const progress = calcKRProgress(kr.startValue, value, kr.targetValue);

  const fireConfetti = () => {
    // Fire from both sides for a celebration effect
    const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 10000 };
    confetti({ ...defaults, particleCount: 80, origin: { x: 0.25, y: 0.6 } });
    confetti({ ...defaults, particleCount: 80, origin: { x: 0.75, y: 0.6 } });
    // Second burst slightly delayed
    setTimeout(() => {
      confetti({ ...defaults, particleCount: 50, origin: { x: 0.5, y: 0.4 } });
    }, 200);
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      await addCheckIn(objectiveId, kr.id, {
        value,
        note: [achievedTarget, note].filter(Boolean).join(' — '),
      });
      if (confidence !== kr.confidence) {
        updateKeyResult(objectiveId, kr.id, { confidence });
      }

      // Check if this check-in completes the objective (all KRs at 100%)
      const objective = useOKRsStore.getState().objectives.find(o => o.id === objectiveId);
      if (objective) {
        const objProgress = calcObjectiveProgress(objective.keyResults);
        if (objProgress >= 100) {
          fireConfetti();
        }
      }

      onClose();
    } finally {
      setSaving(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 12px',
    fontSize: 13,
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-strong)',
    borderRadius: 7,
    outline: 'none',
    transition: 'border-color 150ms ease-out',
  };

  // Tick marks for 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 25, 50, 75, 100];
  const closestTick = ticks.reduce((prev, curr) =>
    Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
  );

  return (
    <Modal open onClose={onClose} title="Update Achieved Target">
      <div style={{ minWidth: 380 }}>
        {/* KR Title */}
        <p className="text-[14px] font-bold leading-snug mb-1" style={{ color: 'var(--text-primary)' }}>
          {kr.title}
        </p>
        <p className="text-[13px] mb-4" style={{ color: '#16A34A', fontWeight: 500 }}>
          Completion progress: <strong>{Math.round(progress)}%</strong>
        </p>

        {/* Slider + number input */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {kr.metricType === 'binary' ? 0 : kr.startValue}
            </span>
            <div className="flex-1 flex items-center gap-2">
              {kr.metricType === 'binary' ? (
                <select
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  style={inputStyle}
                >
                  <option value={0}>Not done</option>
                  <option value={1}>Done</option>
                </select>
              ) : (
                <>
                  <input
                    type="number"
                    value={value}
                    onChange={e => setValue(Number(e.target.value))}
                    style={{
                      ...inputStyle,
                      width: 70,
                      textAlign: 'center',
                      padding: '6px 4px',
                      fontWeight: 600,
                    }}
                  />
                  <div className="flex items-center" style={{ color: 'var(--text-disabled)' }}>
                    <button
                      type="button"
                      onClick={() => setValue(v => v + 1)}
                      className="block text-[10px] leading-none px-0.5"
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      &#9650;
                    </button>
                    <button
                      type="button"
                      onClick={() => setValue(v => v - 1)}
                      className="block text-[10px] leading-none px-0.5"
                      style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
                    >
                      &#9660;
                    </button>
                  </div>
                </>
              )}
            </div>
            <span className="text-[12px] font-mono" style={{ color: 'var(--text-tertiary)' }}>
              {kr.metricType === 'binary' ? 1 : kr.targetValue}
            </span>
          </div>

          {/* Progress bar with ticks */}
          {kr.metricType !== 'binary' && (
            <div className="relative mt-1">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: 6, background: 'var(--border-light)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%`, background: 'var(--text-primary)' }}
                />
              </div>
              {/* Tick labels */}
              <div className="flex justify-between mt-1.5">
                {ticks.map(t => (
                  <span
                    key={t}
                    className="text-[11px]"
                    style={{
                      color: t === closestTick ? '#16A34A' : 'var(--text-muted)',
                      fontWeight: t === closestTick ? 600 : 400,
                    }}
                  >
                    {t}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Target description */}
        <div className="mb-4">
          <p className="text-[12px] font-semibold mb-1" style={{ color: 'var(--text-secondary)' }}>Target</p>
          <p className="text-[13px]" style={{ color: 'var(--text-tertiary)' }}>{kr.title}</p>
        </div>

        {/* Achieved Target */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Achieved Target
          </label>
          <textarea
            value={achievedTarget}
            onChange={e => setAchievedTarget(e.target.value.slice(0, 250))}
            rows={3}
            placeholder="Describe what was achieved..."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            onFocus={e => { e.target.style.borderColor = 'var(--app-accent, #2563EB)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; }}
          />
          <p className="text-[11px] text-right mt-1" style={{ color: 'var(--text-muted)' }}>
            {250 - achievedTarget.length} Characters Left
          </p>
        </div>

        {/* Confidence Level */}
        <div className="mb-4">
          <label className="text-[12px] font-semibold block mb-2" style={{ color: 'var(--text-secondary)' }}>
            OKR Confidence Level
          </label>
          <div className="flex gap-2">
            {CONF_OPTIONS.map(opt => {
              const isActive = confidence === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setConfidence(opt.value)}
                  className="flex-1 text-[13px] font-semibold rounded-[6px] transition-all duration-150"
                  style={{
                    padding: '8px 12px',
                    border: `1px solid ${isActive ? (opt.value === 'on_track' ? '#16A34A' : opt.value === 'at_risk' ? '#D97706' : '#DC2626') : 'var(--border-strong)'}`,
                    background: isActive
                      ? (opt.value === 'on_track' ? '#16A34A' : opt.value === 'at_risk' ? '#D97706' : '#DC2626')
                      : 'var(--bg-primary)',
                    color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Additional Comments */}
        <div className="mb-5">
          <label className="text-[12px] font-semibold block mb-1.5" style={{ color: 'var(--text-secondary)' }}>
            Add Key Result Comments
          </label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value.slice(0, 250))}
            rows={3}
            placeholder="Add any additional comments..."
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
            onFocus={e => { e.target.style.borderColor = 'var(--app-accent, #2563EB)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border-strong)'; }}
          />
          <p className="text-[11px] text-right mt-1" style={{ color: 'var(--text-muted)' }}>
            {250 - note.length} Characters Left
          </p>
        </div>

        {/* Actions */}
        <div
          className="flex justify-end gap-2 pt-3"
          style={{ borderTop: '1px solid var(--border)' }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '8px 20px',
              borderRadius: 7,
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 20px',
              borderRadius: 7,
              border: 'none',
              color: '#FFFFFF',
              background: saving ? '#93C5FD' : 'var(--app-accent, #2563EB)',
              cursor: saving ? 'not-allowed' : 'pointer',
            }}
          >
            {saving ? 'Saving...' : 'Update'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
