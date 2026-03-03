'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * F1 start lights ceremony — 5 red lights appear one by one, then all go out.
 * Plays the light activation tone and aggressive engine rev sound.
 */
export default function StartLights({ onComplete }: { onComplete: () => void }) {
  const [activeLights, setActiveLights] = useState(0);
  const [lightsOut, setLightsOut] = useState(false);
  const [phase, setPhase] = useState<'lights' | 'go' | 'fadeout' | 'done'>('lights');
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  // Play identical beep tone for each light activation — same pitch every time
  const playLightTone = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.value = 820; // Same tone for every light
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio not available — continue silently
    }
  }, [getAudioCtx]);

  // Aggressive F1 engine rev on lights out — multi-layered for realism
  const playEngineRev = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const duration = 3.0;
      const now = ctx.currentTime;

      // --- Layer 1: Heavy distorted noise base (raw engine roar) ---
      const bufferSize = ctx.sampleRate * duration;
      const noiseBuffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = noiseBuffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
          // Aggressive clipped noise
          data[i] = Math.max(-1, Math.min(1, (Math.random() * 2 - 1) * 1.5));
        }
      }
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuffer;

      // Bandpass filter sweeping upward (engine revving higher)
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(150, now);
      noiseFilter.frequency.exponentialRampToValueAtTime(800, now + 0.3);
      noiseFilter.frequency.exponentialRampToValueAtTime(3000, now + 0.8);
      noiseFilter.frequency.exponentialRampToValueAtTime(5000, now + 1.5);
      noiseFilter.frequency.exponentialRampToValueAtTime(6000, now + 2.5);
      noiseFilter.Q.value = 3;

      // Highpass to remove muddiness
      const hipass = ctx.createBiquadFilter();
      hipass.type = 'highpass';
      hipass.frequency.value = 100;

      // Waveshaper for distortion/aggression
      const waveshaper = ctx.createWaveShaper();
      const curveLength = 44100;
      const curve = new Float32Array(curveLength);
      for (let i = 0; i < curveLength; i++) {
        const x = (i * 2) / curveLength - 1;
        curve[i] = (Math.PI + 8) * x / (Math.PI + 8 * Math.abs(x));
      }
      waveshaper.curve = curve;
      waveshaper.oversample = '4x';

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0, now);
      noiseGain.gain.linearRampToValueAtTime(0.35, now + 0.08);
      noiseGain.gain.setValueAtTime(0.35, now + 0.5);
      noiseGain.gain.linearRampToValueAtTime(0.45, now + 1.0);
      noiseGain.gain.setValueAtTime(0.45, now + 1.8);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      noise.connect(noiseFilter);
      noiseFilter.connect(hipass);
      hipass.connect(waveshaper);
      waveshaper.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start(now);
      noise.stop(now + duration);

      // --- Layer 2: High-pitched screaming V6 turbo whine ---
      const whine = ctx.createOscillator();
      whine.type = 'sawtooth';
      whine.frequency.setValueAtTime(200, now);
      whine.frequency.exponentialRampToValueAtTime(1200, now + 0.4);
      whine.frequency.exponentialRampToValueAtTime(3500, now + 1.0);
      whine.frequency.exponentialRampToValueAtTime(5000, now + 1.8);
      whine.frequency.exponentialRampToValueAtTime(6500, now + 2.5);

      const whineGain = ctx.createGain();
      whineGain.gain.setValueAtTime(0, now);
      whineGain.gain.linearRampToValueAtTime(0.08, now + 0.15);
      whineGain.gain.linearRampToValueAtTime(0.12, now + 0.8);
      whineGain.gain.setValueAtTime(0.12, now + 1.5);
      whineGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      whine.connect(whineGain);
      whineGain.connect(ctx.destination);
      whine.start(now);
      whine.stop(now + duration);

      // --- Layer 3: Low-frequency rumble (engine vibration) ---
      const rumble = ctx.createOscillator();
      rumble.type = 'square';
      rumble.frequency.setValueAtTime(55, now);
      rumble.frequency.exponentialRampToValueAtTime(120, now + 0.5);
      rumble.frequency.exponentialRampToValueAtTime(180, now + 1.2);
      rumble.frequency.exponentialRampToValueAtTime(220, now + 2.0);

      const rumbleLowpass = ctx.createBiquadFilter();
      rumbleLowpass.type = 'lowpass';
      rumbleLowpass.frequency.value = 300;

      const rumbleGain = ctx.createGain();
      rumbleGain.gain.setValueAtTime(0, now);
      rumbleGain.gain.linearRampToValueAtTime(0.15, now + 0.1);
      rumbleGain.gain.setValueAtTime(0.15, now + 1.0);
      rumbleGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      rumble.connect(rumbleLowpass);
      rumbleLowpass.connect(rumbleGain);
      rumbleGain.connect(ctx.destination);
      rumble.start(now);
      rumble.stop(now + duration);

      // --- Layer 4: Turbo whistle harmonic ---
      const turbo = ctx.createOscillator();
      turbo.type = 'sine';
      turbo.frequency.setValueAtTime(2000, now);
      turbo.frequency.exponentialRampToValueAtTime(8000, now + 1.0);
      turbo.frequency.exponentialRampToValueAtTime(12000, now + 2.0);

      const turboGain = ctx.createGain();
      turboGain.gain.setValueAtTime(0, now);
      turboGain.gain.linearRampToValueAtTime(0.03, now + 0.5);
      turboGain.gain.linearRampToValueAtTime(0.06, now + 1.2);
      turboGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      turbo.connect(turboGain);
      turboGain.connect(ctx.destination);
      turbo.start(now);
      turbo.stop(now + duration);

      // --- Layer 5: Initial launch burst (tire screech + explosive start) ---
      const burstSize = ctx.sampleRate * 0.6;
      const burstBuffer = ctx.createBuffer(1, burstSize, ctx.sampleRate);
      const burstData = burstBuffer.getChannelData(0);
      for (let i = 0; i < burstSize; i++) {
        burstData[i] = (Math.random() * 2 - 1) * 0.8;
      }
      const burst = ctx.createBufferSource();
      burst.buffer = burstBuffer;

      const burstFilter = ctx.createBiquadFilter();
      burstFilter.type = 'highpass';
      burstFilter.frequency.value = 2000;
      burstFilter.Q.value = 1;

      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0.2, now);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      burst.connect(burstFilter);
      burstFilter.connect(burstGain);
      burstGain.connect(ctx.destination);
      burst.start(now);
      burst.stop(now + 0.6);

    } catch {
      // Audio not available — continue silently
    }
  }, [getAudioCtx]);

  useEffect(() => {
    // Light sequence: each light turns on with 0.8s delay
    const timers: ReturnType<typeof setTimeout>[] = [];

    for (let i = 1; i <= 5; i++) {
      timers.push(
        setTimeout(() => {
          setActiveLights(i);
          playLightTone();
        }, i * 800)
      );
    }

    // Lights out after a random-ish delay (1-1.5s after 5th light)
    const lightsOutDelay = 5 * 800 + 1000 + Math.random() * 500;
    timers.push(
      setTimeout(() => {
        setLightsOut(true);
        setPhase('go');
        playEngineRev();
      }, lightsOutDelay)
    );

    // Fade out and complete
    timers.push(
      setTimeout(() => {
        setPhase('fadeout');
      }, lightsOutDelay + 1500)
    );

    timers.push(
      setTimeout(() => {
        setPhase('done');
        onComplete();
      }, lightsOutDelay + 2200)
    );

    return () => timers.forEach(clearTimeout);
  }, [onComplete, playLightTone, playEngineRev]);

  if (phase === 'done') return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#0a0a0a] transition-opacity duration-700 ${
        phase === 'fadeout' ? 'opacity-0' : 'opacity-100'
      }`}
    >
      {/* Lights gantry */}
      <div className="relative">
        {/* Gantry bar */}
        <div className="absolute -top-4 -left-4 -right-4 h-2 bg-gradient-to-r from-gray-700 via-gray-500 to-gray-700 rounded-full" />

        {/* 5 light columns */}
        <div className="flex gap-4 sm:gap-6">
          {[1, 2, 3, 4, 5].map(num => (
            <div
              key={num}
              className="flex flex-col items-center gap-1"
            >
              {/* Light housing */}
              <div className="bg-gray-900 rounded-xl p-2 sm:p-3 border border-gray-700 shadow-lg">
                {/* Two red lights per column (like real F1) */}
                {[0, 1].map(row => (
                  <div
                    key={row}
                    className={`w-8 h-8 sm:w-12 sm:h-12 rounded-full mb-1 last:mb-0 transition-all duration-200 ${
                      !lightsOut && activeLights >= num
                        ? 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8),0_0_40px_rgba(220,38,38,0.4)]'
                        : 'bg-gray-800 border border-gray-700'
                    }`}
                    style={{
                      transitionDelay: lightsOut ? '0ms' : `${num * 50}ms`,
                    }}
                  />
                ))}
              </div>
              {/* Column support */}
              <div className="w-1 h-8 bg-gray-700 rounded-b" />
            </div>
          ))}
        </div>
      </div>

      {/* GO! flash text */}
      {phase === 'go' && lightsOut && (
        <div
          className="mt-12 text-center"
          style={{ animation: 'goFlash 1s ease-out forwards' }}
        >
          <p className="text-6xl sm:text-8xl font-black tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #22c55e, #00d4ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: 'none',
              filter: 'drop-shadow(0 0 30px rgba(34, 197, 94, 0.5))',
            }}
          >
            GO!
          </p>
        </div>
      )}

      {/* Red glow ambiance when lights are on */}
      {!lightsOut && activeLights > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at center 40%, rgba(220, 38, 38, ${0.05 * activeLights}) 0%, transparent 60%)`,
          }}
        />
      )}

      {/* Green glow ambiance on GO */}
      {lightsOut && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at center 40%, rgba(34, 197, 94, 0.15) 0%, transparent 60%)',
            animation: 'goGlow 1.5s ease-out forwards',
          }}
        />
      )}

      <style>{`
        @keyframes goFlash {
          0% { opacity: 0; transform: scale(0.5); }
          30% { opacity: 1; transform: scale(1.2); }
          50% { transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes goGlow {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}
