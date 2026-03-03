'use client';

import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import StartLights from '@/components/StartLights';
import F1Logo from '@/components/F1Logo';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Start lights animation state
  const [showStartLights, setShowStartLights] = useState(false);
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);

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

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto sign in after registration
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Account created but login failed. Please sign in manually.');
        setLoading(false);
        return;
      }

      // Trigger start lights animation before redirect
      setPendingRedirect('/onboarding');
      setShowStartLights(true);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Start lights ceremony on successful sign-up */}
      {showStartLights && <StartLights onComplete={handleStartLightsComplete} />}

      <div className="min-h-screen bg-gradient-main flex items-center justify-center p-4">
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
          <div className="bg-gradient-card rounded-xl p-8 glow-violet animate-slide-up">
            <h2 className="text-xl font-semibold text-[--color-text-primary] mb-6">Create Account</h2>

            {error && (
              <div className="mb-4 p-3 bg-[--color-error]/10 border border-[--color-error]/30 rounded-lg text-[--color-error] text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm text-[--color-text-secondary] mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:border-[--color-accent-blue] focus:ring-1 focus:ring-[--color-accent-blue] transition-colors"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="username" className="block text-sm text-[--color-text-secondary] mb-1.5">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  minLength={3}
                  maxLength={20}
                  pattern="^[a-zA-Z0-9_]+$"
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:border-[--color-accent-blue] focus:ring-1 focus:ring-[--color-accent-blue] transition-colors"
                  placeholder="your_username"
                />
                <p className="mt-1 text-xs text-[--color-text-muted]">3-20 characters, letters, numbers, underscores</p>
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
                  minLength={8}
                  className="w-full px-4 py-3 bg-[--color-bg-input] border border-[--color-border] rounded-lg text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:border-[--color-accent-blue] focus:ring-1 focus:ring-[--color-accent-blue] transition-colors"
                  placeholder="Min 8 characters"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-accent rounded-lg font-semibold text-white uppercase tracking-wider hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-[--color-text-secondary]">
              Already have an account?{' '}
              <Link href="/login" className="text-[--color-accent-blue] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
