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
  const clampedProgress = Math.min(100, Math.max(0, Math.round(progress)));

  // Convert percentage (0-100) → raw value
  // Works for all metric types including binary (start=0, target=1 → 0–100% maps to 0–1)
  const setFromPercent = (pct: number) => {
    const clamped = Math.min(100, Math.max(0, pct));
    const raw = kr.startValue + (clamped / 100) * (kr.targetValue - kr.startValue);
    setValue(Math.round(raw * 100) / 100);
  };

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

  // Data-led KRs (number, currency) use the actual value range on the slider
  const isDataLed = kr.metricType !== 'binary' && kr.metricType !== 'percentage';

  // Colour helpers based on progress
  const accentColor = progress >= 100 ? '#16A34A' : progress >= 50 ? '#2563EB' : 'var(--text-primary)';
  const trackBg = progress >= 100 ? '#BBF7D0' : progress >= 50 ? '#BFDBFE' : '#E5E7EB';

  // Sensible step for the value slider (1 for small ranges, larger for big ranges)
  const range = kr.targetValue - kr.startValue;
  const sliderStep = range > 1000 ? 10 : range > 100 ? 1 : 0.01;

  // Tick marks for 0%, 25%, 50%, 75%, 100%
  const ticks = [0, 25, 50, 75, 100];
  const closestTick = ticks.reduce((prev, curr) =>
    Math.abs(curr - progress) < Math.abs(prev - progress) ? curr : prev
  );

  return (
    <Modal open onClose={onClose} title="Update Achieved Target">
      <div style={{ minWidth: 380 }}>
        {/* KR Title */}
        <p className="text-[14px] font-bold leading-snug mb-3" style={{ color: 'var(--text-primary)' }}>
          {kr.title}
        </p>

        {/* Progress update — slider + input */}
        <div
          className="mb-5 rounded-xl"
          style={{
            background: progress >= 100
              ? 'linear-gradient(135deg, #DCFCE7 0%, #D1FAE5 100%)'
              : progress >= 50
                ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                : 'linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 100%)',
            padding: '16px 20px',
            border: `1px solid ${progress >= 100 ? '#BBF7D0' : progress >= 50 ? '#BFDBFE' : 'var(--border)'}`,
          }}
        >
          {/* Header: label + value tally */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
              Current Progress
            </span>
            <span className="text-[13px] font-semibold" style={{ color: accentColor }}>
              {fmt(kr, value)} / {fmt(kr, kr.targetValue)}
            </span>
          </div>

          {isDataLed ? (
            /* ── Data-led KR: slider + input use actual values (start → target) ── */
            <>
              {/* Large value display + editable input */}
              <div className="flex items-center justify-center gap-1.5 mb-3">
                {kr.metricType === 'currency' && (
                  <span className="text-[22px] font-extrabold leading-none" style={{ color: accentColor }}>$</span>
                )}
                <input
                  type="number"
                  min={kr.startValue}
                  max={kr.targetValue}
                  value={value}
                  onChange={e => setValue(Number(e.target.value))}
                  className="text-center font-extrabold leading-none"
                  style={{
                    fontSize: 32,
                    width: kr.metricType === 'currency' ? 140 : 100,
                    color: accentColor,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${accentColor}`,
                    outline: 'none',
                    letterSpacing: '-0.02em',
                    padding: '0 2px 2px',
                    MozAppearance: 'textfield',
                  }}
                />
                {kr.metricType === 'percentage' && (
                  <span className="text-[22px] font-extrabold leading-none" style={{ color: accentColor }}>%</span>
                )}
              </div>

              {/* Range slider: start value → target value */}
              <div className="relative" style={{ padding: '0 2px' }}>
                <input
                  type="range"
                  min={kr.startValue}
                  max={kr.targetValue}
                  step={sliderStep}
                  value={Math.min(kr.targetValue, Math.max(kr.startValue, value))}
                  onChange={e => setValue(Number(e.target.value))}
                  className="progress-slider"
                  style={{
                    width: '100%',
                    height: 8,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    borderRadius: 999,
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, ${accentColor} ${clampedProgress}%, ${trackBg} ${clampedProgress}%)`,
                  }}
                />
                {/* Start / Target labels */}
                <div className="flex justify-between mt-1.5">
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {fmt(kr, kr.startValue)}
                  </span>
                  <span className="text-[10px] font-medium" style={{ color: 'var(--text-muted)' }}>
                    {fmt(kr, kr.targetValue)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* ── Binary / percentage-only KR: slider uses 0–100% ── */
            <>
              {/* Large % display + editable input */}
              <div className="flex items-center justify-center gap-1 mb-3">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={clampedProgress}
                  onChange={e => setFromPercent(Number(e.target.value))}
                  className="text-center font-extrabold leading-none"
                  style={{
                    fontSize: 32,
                    width: 80,
                    color: accentColor,
                    background: 'transparent',
                    border: 'none',
                    borderBottom: `2px solid ${accentColor}`,
                    outline: 'none',
                    letterSpacing: '-0.02em',
                    padding: '0 2px 2px',
                    MozAppearance: 'textfield',
                  }}
                />
                <span className="text-[24px] font-extrabold leading-none" style={{ color: accentColor }}>
                  %
                </span>
              </div>

              {/* Range slider: 0–100% */}
              <div className="relative" style={{ padding: '0 2px' }}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={clampedProgress}
                  onChange={e => setFromPercent(Number(e.target.value))}
                  className="progress-slider"
                  style={{
                    width: '100%',
                    height: 8,
                    appearance: 'none',
                    WebkitAppearance: 'none',
                    borderRadius: 999,
                    outline: 'none',
                    cursor: 'pointer',
                    background: `linear-gradient(to right, ${accentColor} ${clampedProgress}%, ${trackBg} ${clampedProgress}%)`,
                  }}
                />
                {/* Tick labels */}
                <div className="flex justify-between mt-1.5">
                  {ticks.map(t => (
                    <span
                      key={t}
                      className="text-[10px]"
                      style={{
                        color: t === closestTick
                          ? accentColor
                          : 'var(--text-muted)',
                        fontWeight: t === closestTick ? 700 : 400,
                      }}
                    >
                      {t}%
                    </span>
                  ))}
                </div>
              </div>
            </>
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
