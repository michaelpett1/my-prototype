'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

export interface TourStep {
  title: string;
  description: string;
  target?: string;
}

export interface ProductTourProps {
  tourKey: string;
  steps: TourStep[];
}

const STORAGE_PREFIX = 'northstar-tour-';
const ALL_TOUR_KEYS = ['dashboard', 'timelines', 'okrs', 'suggestions', 'roadmap', 'settings'];

function getStorageKey(tourKey: string) {
  return `${STORAGE_PREFIX}${tourKey}`;
}

function isTourCompleted(tourKey: string): boolean {
  if (typeof window === 'undefined') return true;
  return localStorage.getItem(getStorageKey(tourKey)) === 'completed';
}

function markTourCompleted(tourKey: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getStorageKey(tourKey), 'completed');
}

function markAllToursCompleted() {
  if (typeof window === 'undefined') return;
  ALL_TOUR_KEYS.forEach(key => {
    localStorage.setItem(getStorageKey(key), 'completed');
  });
}

export default function ProductTour({ tourKey, steps }: ProductTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const [cardPosition, setCardPosition] = useState<{ top: number; left: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isTourCompleted(tourKey)) return;
    setVisible(true);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setOpacity(1));
    });
  }, [tourKey]);

  const positionCard = useCallback(() => {
    const step = steps[currentStep];
    if (!step?.target) {
      setCardPosition(null);
      return;
    }
    const el = document.querySelector(step.target);
    if (!el) {
      setCardPosition(null);
      return;
    }
    const rect = el.getBoundingClientRect();
    const cardWidth = 400;
    const cardHeight = cardRef.current?.offsetHeight ?? 220;
    const padding = 16;

    let top = rect.bottom + padding;
    let left = rect.left + rect.width / 2 - cardWidth / 2;

    if (left < padding) left = padding;
    if (left + cardWidth > window.innerWidth - padding) {
      left = window.innerWidth - cardWidth - padding;
    }
    if (top + cardHeight > window.innerHeight - padding) {
      top = rect.top - cardHeight - padding;
    }
    if (top < padding) {
      top = window.innerHeight / 2 - cardHeight / 2;
    }

    setCardPosition({ top, left });
  }, [currentStep, steps]);

  useEffect(() => {
    if (!visible) return;
    positionCard();
    window.addEventListener('resize', positionCard);
    window.addEventListener('scroll', positionCard, true);
    return () => {
      window.removeEventListener('resize', positionCard);
      window.removeEventListener('scroll', positionCard, true);
    };
  }, [visible, positionCard]);

  const close = useCallback(() => {
    setOpacity(0);
    setTimeout(() => {
      markTourCompleted(tourKey);
      setVisible(false);
    }, 250);
  }, [tourKey]);

  const skipAll = useCallback(() => {
    setOpacity(0);
    setTimeout(() => {
      markAllToursCompleted();
      setVisible(false);
    }, 250);
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep === steps.length - 1) {
      close();
    } else {
      setCurrentStep((s) => s + 1);
    }
  }, [currentStep, steps.length, close]);

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1));
  }, []);

  if (!visible || steps.length === 0) return null;

  const step = steps[currentStep];
  const isFirst = currentStep === 0;
  const isLast = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          backgroundColor: 'rgba(0,0,0,0.4)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          opacity,
          transition: 'opacity 250ms ease',
        }}
        onClick={close}
      />

      {/* Card */}
      <div
        ref={cardRef}
        role="dialog"
        aria-label="Product tour"
        style={{
          position: 'fixed',
          zIndex: 9999,
          width: 400,
          maxWidth: 'calc(100vw - 32px)',
          backgroundColor: 'var(--bg-primary)',
          borderRadius: 14,
          boxShadow: '0 20px 60px rgba(0,0,0,0.20), 0 0 0 1px var(--border-row)',
          overflow: 'hidden',
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          opacity,
          transition: 'opacity 250ms ease, top 250ms ease, left 250ms ease, transform 250ms ease',
          ...(cardPosition
            ? { top: cardPosition.top, left: cardPosition.left }
            : { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }),
        }}
      >
        {/* Top accent bar / progress */}
        <div style={{ height: 3, backgroundColor: 'var(--border-light)', position: 'relative' }}>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progress}%`,
              background: 'linear-gradient(90deg, #2563EB, #7C3AED)',
              borderRadius: '0 2px 2px 0',
              transition: 'width 300ms ease',
            }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: '24px 28px 20px' }}>
          {/* Step indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            marginBottom: 16,
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}>
              {steps.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === currentStep ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === currentStep
                      ? 'linear-gradient(90deg, #2563EB, #7C3AED)'
                      : i < currentStep
                        ? '#2563EB'
                        : 'rgba(0,0,0,0.08)',
                    transition: 'all 300ms ease',
                  }}
                />
              ))}
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: 'var(--text-muted)',
              letterSpacing: '0.02em',
              marginLeft: 4,
            }}>
              {currentStep + 1}/{steps.length}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontSize: 17,
            fontWeight: 700,
            color: 'var(--text-primary)',
            margin: '0 0 8px',
            lineHeight: 1.35,
            letterSpacing: '-0.01em',
          }}>
            {step.title}
          </h3>

          {/* Description */}
          <p style={{
            fontSize: 13.5,
            color: 'var(--text-tertiary)',
            margin: '0 0 24px',
            lineHeight: 1.6,
          }}>
            {step.description}
          </p>

          {/* Footer */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            {/* Skip links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                onClick={close}
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: 'var(--text-muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--text-tertiary)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
              >
                Skip
              </button>
              <span style={{ color: 'var(--border-light)', fontSize: 11 }}>|</span>
              <button
                type="button"
                onClick={skipAll}
                style={{
                  fontSize: 11,
                  fontWeight: 500,
                  color: 'var(--text-disabled)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  fontFamily: 'inherit',
                  transition: 'color 150ms ease',
                }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.color = 'var(--text-muted)'; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.color = 'var(--text-disabled)'; }}
              >
                Skip all tours
              </button>
            </div>

            {/* Navigation buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              {!isFirst && (
                <button
                  type="button"
                  onClick={handleBack}
                  style={{
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-light)',
                    borderRadius: 8,
                    padding: '8px 16px',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                    lineHeight: 1,
                    transition: 'all 150ms ease',
                  }}
                  onMouseEnter={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.backgroundColor = 'var(--bg-tertiary)';
                    el.style.borderColor = 'var(--text-disabled)';
                  }}
                  onMouseLeave={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.backgroundColor = 'var(--bg-tertiary)';
                    el.style.borderColor = 'var(--border-light)';
                  }}
                >
                  Back
                </button>
              )}
              <button
                type="button"
                onClick={handleNext}
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: 'linear-gradient(135deg, #2563EB, #4F46E5)',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 20px',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  lineHeight: 1,
                  boxShadow: '0 1px 3px rgba(37,99,235,0.3)',
                  transition: 'all 150ms ease',
                }}
                onMouseEnter={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.background = 'linear-gradient(135deg, #1D4ED8, #4338CA)';
                  el.style.boxShadow = '0 2px 8px rgba(37,99,235,0.4)';
                }}
                onMouseLeave={(e) => {
                  const el = e.target as HTMLElement;
                  el.style.background = 'linear-gradient(135deg, #2563EB, #4F46E5)';
                  el.style.boxShadow = '0 1px 3px rgba(37,99,235,0.3)';
                }}
              >
                {isLast ? 'Get Started' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
