'use client';

import { useState, useRef, useEffect } from 'react';

interface HowToPlayProps {
  variant: 'home' | 'predict' | 'season';
}

const CONTENT = {
  home: {
    title: 'How to Play',
    items: [
      { icon: '🏎️', title: 'Predict Each Race', desc: 'Pick qualifying top 3, race top 10, and sprint top 5 for every Grand Prix weekend.' },
      { icon: '🏆', title: 'Season Predictions', desc: 'Predict the Drivers\' & Constructors\' Champions. Windows open 4 times per season.' },
      { icon: '🤝', title: 'Teammate Battles', desc: 'Pick which driver in each team will finish higher in the championship.' },
      { icon: '📊', title: 'Earn Points', desc: 'Exact position = 5pts, one off = 3pts, in top 3/10 = 1pt. Bonus for exact finisher count.' },
      { icon: '🏅', title: 'Compete', desc: 'Climb the global leaderboard or create private leagues with friends.' },
    ],
  },
  predict: {
    title: 'Prediction Guide',
    items: [
      { icon: '👆', title: 'Tap to Select', desc: 'Tap a driver from the pool to fill the next empty position slot.' },
      { icon: '❌', title: 'Remove & Reorder', desc: 'Click × on any slot to clear it and pick a different driver.' },
      { icon: '🏁', title: 'Qualifying → Race', desc: 'Save qualifying picks and you\'ll automatically advance to race predictions.' },
      { icon: '🔢', title: 'Finisher Count', desc: 'On the race tab, predict how many drivers will finish. Exact = 5 bonus points!' },
      { icon: '⏰', title: 'Deadline', desc: 'Predictions lock when qualifying starts. Edit anytime before then.' },
    ],
  },
  season: {
    title: 'Season Predictions Guide',
    items: [
      { icon: '🤝', title: 'Teammate Battles', desc: 'Pick which driver in each team scores more points this season. 5pts each at season end.' },
      { icon: '🏆', title: 'Champions', desc: 'Predict the Drivers\' and Constructors\' Champions. Base: 20pts per correct pick.' },
      { icon: '🪟', title: '4 Windows', desc: 'You can change champion picks before rounds 1, 7, 13 & 19. Each change reduces points by 25%.' },
      { icon: '💡', title: 'Strategy', desc: 'Lock in early for max points, or wait and change as the season develops — but each window costs you.' },
    ],
  },
};

export default function HowToPlay({ variant }: HowToPlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const content = CONTENT[variant];
  const panelRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(prev => !prev)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[--color-accent-blue] bg-[--color-accent-blue]/10 hover:bg-[--color-accent-blue]/20 transition-colors flex-shrink-0"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
          <line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <span className="hidden sm:inline">{content.title}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 sm:hidden" onClick={() => setIsOpen(false)} />

          <div
            ref={panelRef}
            className="fixed sm:absolute right-4 sm:right-0 top-16 sm:top-full sm:mt-2 z-50 w-[calc(100vw-2rem)] sm:w-80 bg-[--color-bg-card] border border-[--color-border-bright] rounded-xl p-4 sm:p-5 shadow-2xl"
            style={{ boxShadow: '0 0 40px rgba(0, 212, 255, 0.1), 0 20px 60px rgba(0,0,0,0.5)', maxHeight: '80vh', overflowY: 'auto' }}
          >
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-bold text-[--color-accent-blue] uppercase tracking-wider">
                {content.title}
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-[--color-text-muted] hover:text-[--color-text-primary] p-1">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="space-y-3">
              {content.items.map((item, i) => (
                <div key={i} className="flex gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-[--color-text-primary]">{item.title}</p>
                    <p className="text-xs text-[--color-text-secondary] leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
