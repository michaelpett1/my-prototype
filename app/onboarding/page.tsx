'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STEPS = [
  {
    title: 'Welcome to F1 Predictor',
    description: 'Test your F1 knowledge by predicting qualifying and race results for every round of the 2026 season.',
    icon: '🏎️',
  },
  {
    title: 'How Scoring Works',
    description: 'Predict the top 3 in qualifying (3pts exact, 1pt if in top 3). Predict the top 10 in the race (3pts exact, 1pt if in top 10). Bonus points for perfect predictions!',
    icon: '🏆',
  },
  {
    title: 'Sprint Weekends',
    description: '5 rounds feature sprint races. Predict the top 5 for additional points. Sprint weekends are marked with a purple badge.',
    icon: '⚡',
  },
  {
    title: 'Compete & Climb',
    description: 'Track your progress on the leaderboard, compete with friends, and aim for the top spot across all 24 rounds.',
    icon: '📊',
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/');
    }
  };

  const current = STEPS[step];

  return (
    <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
      <div className="w-full max-w-lg text-center">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all ${
                i === step ? 'bg-[--color-accent-blue] w-6' : 'bg-[--color-border-bright]'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-gradient-card rounded-xl p-10 glow-blue">
          <div className="text-5xl mb-6">{current.icon}</div>
          <h2 className="text-2xl font-bold mb-4">{current.title}</h2>
          <p className="text-[--color-text-secondary] leading-relaxed mb-8">{current.description}</p>

          <button
            onClick={handleNext}
            className="w-full py-3 bg-gradient-accent rounded-lg font-semibold uppercase tracking-wider hover:opacity-90 transition-opacity"
          >
            {step < STEPS.length - 1 ? 'Next' : 'Get Started'}
          </button>

          {step < STEPS.length - 1 && (
            <button
              onClick={() => router.push('/')}
              className="mt-3 text-sm text-[--color-text-muted] hover:text-[--color-text-secondary] transition-colors"
            >
              Skip
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
