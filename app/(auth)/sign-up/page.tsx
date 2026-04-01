'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff, User, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/authStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import type { User as SupabaseUser } from '@supabase/supabase-js';

const BENEFITS = [
  'AI scans JIRA, Confluence & Slack automatically',
  'Interactive Gantt charts and visual roadmaps',
  'Duplicate detection prevents clutter',
  'Free for individual use',
];

export default function SignUpPage() {
  return (
    <Suspense>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/onboarding';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    // Clear ALL previous user/workspace data before creating new account
    // This prevents data leaking between accounts on the same browser
    if (typeof window !== 'undefined') {
      ['northstar-auth', 'northstar-settings', 'northstar-projects', 'northstar-roadmap', 'northstar-suggestions', 'northstar-okrs'].forEach(
        key => localStorage.removeItem(key)
      );
      // Clear tour, scan setup, and seed flags for fresh onboarding experience
      ['dashboard', 'timelines', 'okrs', 'suggestions', 'roadmap', 'settings'].forEach(
        page => localStorage.removeItem(`northstar-tour-${page}`)
      );
      localStorage.removeItem('northstar-scan-setup-dismissed');
      localStorage.removeItem('northstar-projects-seeded');
      localStorage.removeItem('northstar-roadmap-seeded');
      localStorage.removeItem('northstar-team-seeded');
      localStorage.removeItem('northstar-depts-seeded');
    }

    if (hasSupabase) {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: name },
        },
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Set user in auth store
      if (authData.user) {
        useAuthStore.setState({
          user: authData.user,
          currentWorkspace: null,
          workspaces: [],
          members: [],
          invitations: [],
          isInitialized: true,
          isLoading: false,
        });
        useSettingsStore.getState().updateProfile({ name, email, role: '' });
      }
      setLoading(false);
    } else {
      // Simulated mode — create a fresh local user identity
      useAuthStore.setState({
        user: { id: `user-${Date.now()}`, email, user_metadata: { full_name: name } } as unknown as SupabaseUser,
        currentWorkspace: null,
        workspaces: [],
        members: [],
        invitations: [],
        isInitialized: true,
        isLoading: false,
      });
      useSettingsStore.getState().updateProfile({ name, email, role: '' });
      setLoading(false);
    }

    // Redirect to onboarding (or invite page if coming from an invite)
    router.push(redirectTo);
    router.refresh();
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    if (!hasSupabase) {
      router.push(redirectTo);
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px 10px 38px',
    fontSize: 14,
    border: '1px solid var(--input-border)',
    borderRadius: 7,
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 460,
        margin: '0 auto',
        display: 'flex',
        gap: 40,
        alignItems: 'flex-start',
      }}
    >
      {/* Card */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            background: 'var(--bg-primary)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
            padding: '36px 32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--text-primary)',
                letterSpacing: '-0.02em',
                margin: 0,
              }}
            >
              Create your account
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 6, margin: '6px 0 0' }}>
              Get started with Northstar for free
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Name */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="name"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
              >
                Full name
              </label>
              <div style={{ position: 'relative' }}>
                <User
                  size={15}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--input-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor="email"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
              >
                Work email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={15}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--input-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 20 }}>
              <label
                htmlFor="password"
                style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={15}
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ ...inputStyle, paddingRight: 40 }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = '#2563EB';
                    e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'var(--input-border)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    padding: 2,
                    display: 'flex',
                  }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {/* Password strength hint */}
              {password.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  {[0, 1, 2, 3].map((i) => {
                    const filled =
                      (i === 0 && password.length >= 1) ||
                      (i === 1 && password.length >= 6) ||
                      (i === 2 && password.length >= 8) ||
                      (i === 3 && password.length >= 12);
                    return (
                      <div
                        key={i}
                        style={{
                          flex: 1,
                          height: 3,
                          borderRadius: 99,
                          background: filled
                            ? password.length >= 12
                              ? '#22C55E'
                              : password.length >= 8
                              ? '#F59E0B'
                              : '#EF4444'
                            : 'var(--text-disabled)',
                          transition: 'background 200ms',
                        }}
                      />
                    );
                  })}
                </div>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: '#DC2626',
                  background: 'var(--danger-bg)',
                  border: '1px solid #FECACA',
                  borderRadius: 6,
                  padding: '8px 12px',
                  marginBottom: 16,
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
                background: loading ? '#93C5FD' : '#2563EB',
                border: 'none',
                borderRadius: 7,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
                transition: 'background 150ms',
              }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Terms */}
          <p style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', marginTop: 16, lineHeight: 1.5, margin: '16px 0 0' }}>
            By creating an account, you agree to our{' '}
            <span style={{ color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>{' '}
            and{' '}
            <span style={{ color: 'var(--text-tertiary)', textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
          </p>

          {/* Divider */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              margin: '24px 0',
            }}
          >
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>or</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>

          {/* SSO buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              style={{
                width: '100%',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-strong)',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.89 4.49-2.422 5.879C11.83 15.354 10.089 16 8 16A8 8 0 1 1 8 0c2.15 0 3.95.78 5.34 2.06l-2.17 2.17C10.28 3.38 9.24 2.94 8 2.94a5.07 5.07 0 0 0-5.06 5.06A5.07 5.07 0 0 0 8 13.06c2.54 0 4.21-1.45 4.57-3.5H8V6.56h7.545z" fill="#4285F4"/>
              </svg>
              Sign up with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              style={{
                width: '100%',
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--text-secondary)',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-strong)',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'background 150ms, border-color 150ms',
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path fillRule="evenodd" clipRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" fill="#24292F"/>
              </svg>
              Sign up with GitHub
            </button>
          </div>
        </div>

        {/* Benefits list */}
        <div style={{ marginTop: 24, padding: '0 4px' }}>
          {BENEFITS.map((benefit) => (
            <div
              key={benefit}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '5px 0',
              }}
            >
              <CheckCircle size={14} style={{ color: '#22C55E', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>{benefit}</span>
            </div>
          ))}
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', marginTop: 20 }}>
          Already have an account?{' '}
          <Link
            href="/sign-in"
            style={{
              color: '#2563EB',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
