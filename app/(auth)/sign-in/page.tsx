'use client';
import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/store/authStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { lookupUser, seedRegistryIfEmpty } from '@/lib/utils/userRegistry';
import type { User as SupabaseUser } from '@supabase/supabase-js';

export default function SignInPage() {
  return (
    <Suspense>
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showWorkspacePicker, setShowWorkspacePicker] = useState(false);
  const [availableWorkspaces, setAvailableWorkspaces] = useState<Array<{ id: string; name: string; slug: string; createdBy: string | null; createdAt: string }>>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    const hasSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    if (hasSupabase) {
      const supabase = createClient();
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        setError(authError.message);
        setLoading(false);
        return;
      }

      // Set user in auth store and load workspaces
      if (authData.user) {
        useAuthStore.setState({ user: authData.user });
        const fullName = authData.user.user_metadata?.full_name ?? email.split('@')[0];
        useSettingsStore.getState().updateProfile({ name: fullName, email });

        // Fetch workspaces for this user
        try {
          const workspaces = await useAuthStore.getState().fetchWorkspaces();
          if (workspaces.length > 1) {
            useAuthStore.setState({
              workspaces,
              currentWorkspace: null,
              isInitialized: true,
              isLoading: false,
            });
            setAvailableWorkspaces(workspaces);
            setShowWorkspacePicker(true);
            setLoading(false);
            return;
          } else if (workspaces.length === 1) {
            useAuthStore.setState({
              workspaces,
              currentWorkspace: workspaces[0],
              isInitialized: true,
              isLoading: false,
            });
          } else {
            // No workspaces — will redirect to onboarding
            useAuthStore.setState({
              workspaces: [],
              currentWorkspace: null,
              isInitialized: true,
              isLoading: false,
            });
          }
        } catch {
          // Workspace fetch failed — send to onboarding
          useAuthStore.setState({
            workspaces: [],
            currentWorkspace: null,
            isInitialized: true,
            isLoading: false,
          });
        }
      }
      setLoading(false);
    } else {
      // No Supabase configured — simulate sign-in with local user
      // Seed known users into registry (runs once, no-op after)
      seedRegistryIfEmpty();
      // Check if this is a returning user with existing workspaces
      const existingRecord = lookupUser(email);

      // Validate password for registered users
      if (existingRecord && password !== 'P@ssword!123') {
        setError('Invalid email or password.');
        setLoading(false);
        return;
      }

      if (existingRecord && existingRecord.workspaces.length > 0) {
        // Returning user — restore their user ID and workspace data
        const allWorkspaces = existingRecord.workspaces.map(w => ({
          id: w.id,
          name: w.name,
          slug: w.slug,
          createdBy: w.createdBy,
          createdAt: w.createdAt,
        }));

        // Restore cached profile if available, otherwise set name/email
        const cachedProfile = localStorage.getItem(`northstar-profile-${email.toLowerCase()}`);
        if (cachedProfile) {
          try {
            const profile = JSON.parse(cachedProfile);
            useSettingsStore.getState().updateProfile({ ...profile, name: existingRecord.name, email });
          } catch {
            useSettingsStore.getState().updateProfile({ name: existingRecord.name, email });
          }
        } else {
          useSettingsStore.getState().updateProfile({ name: existingRecord.name, email });
        }

        if (allWorkspaces.length > 1) {
          // Multiple workspaces — show picker
          useAuthStore.setState({
            user: { id: existingRecord.userId, email, user_metadata: { full_name: existingRecord.name } } as unknown as SupabaseUser,
            currentWorkspace: null,
            workspaces: allWorkspaces,
            isInitialized: true,
            isLoading: false,
          });
          setAvailableWorkspaces(allWorkspaces);
          setShowWorkspacePicker(true);
          setLoading(false);
          return;
        } else {
          // Single workspace — go straight in
          useAuthStore.setState({
            user: { id: existingRecord.userId, email, user_metadata: { full_name: existingRecord.name } } as unknown as SupabaseUser,
            currentWorkspace: allWorkspaces[0],
            workspaces: allWorkspaces,
            isInitialized: true,
            isLoading: false,
          });
        }
      } else {
        // Unknown email — reject sign-in
        setError('No account found with that email. Please create an account first.');
        setLoading(false);
        return;
      }
      setLoading(false);
    }

    // Check if user has a workspace — if not, send to onboarding
    const { currentWorkspace } = useAuthStore.getState();
    if (!currentWorkspace) {
      router.push('/onboarding');
    } else {
      router.push(redirectTo);
    }
    router.refresh();
  };

  const handleSelectWorkspace = (ws: { id: string; name: string; slug: string; createdBy: string | null; createdAt: string }) => {
    useAuthStore.setState({ currentWorkspace: ws });
    setShowWorkspacePicker(false);
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

  // Workspace picker view
  if (showWorkspacePicker) {
    return (
      <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
        <div
          style={{
            background: 'var(--bg-primary)',
            borderRadius: 14,
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.06), 0 2px 8px rgba(0,0,0,0.03)',
            padding: '36px 32px',
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
              Choose a workspace
            </h1>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 6 }}>
              Select a workspace to continue
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {availableWorkspaces.map(ws => (
              <button
                key={ws.id}
                onClick={() => handleSelectWorkspace(ws)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '14px 16px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: 10,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'border-color 150ms, box-shadow 150ms, background 150ms',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#2563EB';
                  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.08)';
                  e.currentTarget.style.background = 'var(--bg-hover)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-medium)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.background = 'var(--bg-primary)';
                }}
              >
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: 'linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  {ws.name.charAt(0).toUpperCase()}
                </div>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{ws.name}</p>
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, marginTop: 2 }}>{ws.slug}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 400,
        margin: '0 auto',
      }}
    >
      {/* Card */}
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
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 6, margin: '6px 0 0' }}>
            Sign in to your Northstar account
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: 16 }}>
            <label
              htmlFor="email"
              style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}
            >
              Email
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
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <label
                htmlFor="password"
                style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <button
                type="button"
                style={{
                  fontSize: 12,
                  fontWeight: 500,
                  color: '#2563EB',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                Forgot password?
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }}
              />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
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
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

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
            Continue with Google
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
            Continue with GitHub
          </button>
        </div>
      </div>

      {/* Footer link */}
      <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--text-tertiary)', marginTop: 24 }}>
        {"Don't have an account? "}
        <Link
          href="/sign-up"
          style={{
            color: '#2563EB',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
