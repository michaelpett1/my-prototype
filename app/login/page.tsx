'use client';

import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import F1Intro from '@/components/F1Intro';
import StartLights from '@/components/StartLights';
import F1Logo from '@/components/F1Logo';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Intro animation state
  const [showIntro, setShowIntro] = useState(false);
  const [introComplete, setIntroComplete] = useState(false);

  // Start lights animation state
  const [showStartLights, setShowStartLights] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

  // Show intro on first visit (session-based)
  useEffect(() => {
    if (!sessionStorage.getItem('f1-intro-seen')) {
      setShowIntro(true);
    } else {
      setIntroComplete(true);
    }
  }, []);

  const handleIntroComplete = useCallback(() => {
    setShowIntro(false);
    setIntroComplete(true);
    sessionStorage.setItem('f1-intro-seen', '1');
  }, []);

  const handleStartLightsComplete = useCallback(() => {
    setShowStartLights(false);
    if (pendingRedirect) {
      router.push(pendingRedirect);
      router.refresh();
    }
  }, [pendingRedirect, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email: identifier,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid username/email or password');
    } else {
      // Trigger start lights animation before redirect
      setPendingRedirect(callbackUrl);
      setShowStartLights(true);
    }
  };

  return (
    <>
      {/* F1 Car intro animation (first visit) */}
      {showIntro && <F1Intro onComplete={handleIntroComplete} />}

      {/* Start lights ceremony on successful sign-in */}
      {showStartLights && <StartLights onComplete={handleStartLightsComplete} />}

      <div className={`min-h-screen bg-gradient-main flex items-center justify-center p-4 transition-opacity duration-500 ${
        introComplete ? 'opacity-100' : 'opacity-0'
      }`}>
        <div className="w-full max-w-md">
          {/* Logo / Title */}
          <div className="text-center mb-8 animate-fade-in">
            <div className="flex justify-center mb-3">
              <F1Logo width={100} />
            </div>
            <h1 className="text-2xl font-bold tracking-wider text-white/80 uppercase mb-1">Predictor</h1>
            <p className="text-[--color-text-secondary] text-sm">2026 Season</p>
          </div>

          {/* Card */}
          <div className="bg-gradient-card rounded-xl p-8 glow-blue animate-slide-up">
            <h2 className="text-xl font-semibold text-[--color-text-primary] mb-6">Sign In</h2>

            {error && (
              <div className="mb-4 p-3 bg-[--color-error]/10 border border-[--color-error]/30 rounded-lg text-[--color-error] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="identifier" className="block text-sm text-[--color-text-secondary] mb-1.5">
                  Email or Username
                </label>
                <input
                  id="identifier"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:border-[--color-accent-blue] focus:ring-1 focus:ring-[--color-accent-blue] transition-colors"
                  placeholder="you@example.com or username"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm text-[--color-text-secondary] mb-1.5">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:border-[--color-accent-blue] focus:ring-1 focus:ring-[--color-accent-blue] transition-colors"
                  placeholder="Enter your password"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-accent rounded-lg font-semibold text-white uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[--color-text-secondary]">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="text-[--color-accent-blue] hover:underline">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-main flex items-center justify-center">
        <div className="text-[--color-text-secondary]">Loading...</div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
