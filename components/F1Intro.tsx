'use client';

import { useState, useEffect, useRef } from 'react';
import F1Logo from '@/components/F1Logo';

/**
 * F1 car animation intro — shown on first visit to login page.
 * An F1 car zooms across the screen, then fades into the auth forms.
 */
export default function F1Intro({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<'car' | 'fadeout' | 'done'>('car');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Car phase: 2.5s
    const t1 = setTimeout(() => setPhase('fadeout'), 2500);
    // Fadeout phase: 0.6s
    const t2 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 3100);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onComplete]);

  if (phase === 'done') return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-main transition-opacity duration-500 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Track lines */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px bg-white/5"
            style={{
              top: `${15 + i * 10}%`,
              left: 0,
              right: 0,
              animation: `trackLine ${0.8 + i * 0.1}s linear infinite`,
            }}
          />
        ))}
      </div>

      {/* Speed particles */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              top: `${Math.random() * 100}%`,
              right: '-10px',
              backgroundColor: i % 3 === 0 ? '#E10600' : i % 3 === 1 ? '#00d4ff' : 'rgba(255,255,255,0.4)',
              animation: `speedParticle ${0.4 + Math.random() * 0.6}s linear infinite`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* F1 Logo + Car */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo fades in */}
        <div className="animate-fade-in">
          <F1Logo width={120} />
        </div>

        {/* F1 Car SVG zooming across */}
        <div className="relative w-[300px] h-[60px] overflow-hidden">
          <div
            style={{
              animation: 'carZoom 2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
            }}
          >
            <svg width="180" height="50" viewBox="0 0 200 55" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Car body */}
              <path d="M20 35 L40 15 L100 10 L160 12 L180 25 L180 38 L20 38 Z" fill="#E10600"/>
              {/* Cockpit */}
              <path d="M70 15 L90 10 L105 10 L95 22 L70 22 Z" fill="#1a1a3a"/>
              {/* Front wing */}
              <path d="M5 38 L20 30 L20 38 Z" fill="#333"/>
              <rect x="0" y="38" width="22" height="3" rx="1" fill="#666"/>
              {/* Rear wing */}
              <path d="M170 8 L190 8 L190 12 L170 12 Z" fill="#333"/>
              <rect x="168" y="5" width="25" height="3" rx="1" fill="#666"/>
              {/* Wheels */}
              <ellipse cx="50" cy="42" rx="12" ry="12" fill="#222"/>
              <ellipse cx="50" cy="42" rx="8" ry="8" fill="#444"/>
              <ellipse cx="50" cy="42" rx="3" ry="3" fill="#888"/>
              <ellipse cx="150" cy="42" rx="12" ry="12" fill="#222"/>
              <ellipse cx="150" cy="42" rx="8" ry="8" fill="#444"/>
              <ellipse cx="150" cy="42" rx="3" ry="3" fill="#888"/>
              {/* Halo */}
              <path d="M72 15 C80 5, 98 5, 100 12" stroke="#888" strokeWidth="2.5" fill="none"/>
              {/* Exhaust glow */}
              <ellipse cx="185" cy="32" rx="8" ry="4" fill="#E10600" opacity="0.6"/>
              <ellipse cx="190" cy="32" rx="5" ry="2.5" fill="#ff6600" opacity="0.8"/>
            </svg>
          </div>
        </div>

        {/* "PREDICTOR" text */}
        <p
          className="text-xl font-bold tracking-[0.4em] text-white/70 uppercase"
          style={{ animation: 'textReveal 1.5s ease-out 0.5s forwards', opacity: 0 }}
        >
          PREDICTOR
        </p>

        {/* 2026 Season */}
        <p
          className="text-sm text-[--color-text-muted] tracking-widest"
          style={{ animation: 'textReveal 1.5s ease-out 0.8s forwards', opacity: 0 }}
        >
          2026 SEASON
        </p>
      </div>

      <style>{`
        @keyframes carZoom {
          0% { transform: translateX(-250px); opacity: 0; }
          20% { opacity: 1; }
          60% { transform: translateX(60px); }
          100% { transform: translateX(60px); opacity: 1; }
        }
        @keyframes speedParticle {
          0% { transform: translateX(0); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateX(-110vw); opacity: 0; }
        }
        @keyframes trackLine {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-100vw); }
        }
        @keyframes textReveal {
          0% { opacity: 0; transform: translateY(10px); letter-spacing: 0.8em; }
          100% { opacity: 1; transform: translateY(0); letter-spacing: 0.4em; }
        }
      `}</style>
    </div>
  );
}
