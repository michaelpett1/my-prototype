'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { useAuthStore } from '@/lib/store/authStore';
import { createClient } from '@/lib/supabase/client';

export default function InviteAcceptPage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const { user, initialize, isInitialized, acceptInvitation } = useAuthStore();
  const [status, setStatus] = useState<'loading' | 'accepting' | 'success' | 'error' | 'needs-auth'>('loading');
  const [error, setError] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');

  // Initialize auth
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Validate the token and check auth state
  useEffect(() => {
    if (!isInitialized) return;

    async function validateAndAccept() {
      // First verify the token is valid
      const supabase = createClient();
      const { data, error: fetchErr } = await supabase
        .from('workspace_invitations')
        .select('*, workspaces(name)')
        .eq('token', token)
        .is('accepted_at', null)
        .single();

      if (fetchErr || !data) {
        setError('This invitation is invalid or has already been used.');
        setStatus('error');
        return;
      }

      const row = data as Record<string, unknown>;
      const wsData = row.workspaces as Record<string, unknown>;
      setWorkspaceName(wsData?.name as string ?? 'workspace');

      const expiresAt = new Date(row.expires_at as string);
      if (expiresAt < new Date()) {
        setError('This invitation has expired. Please ask your admin to resend it.');
        setStatus('error');
        return;
      }

      // If user is not authenticated, they need to sign in/up first
      if (!user) {
        setStatus('needs-auth');
        return;
      }

      // Accept the invitation
      setStatus('accepting');
      try {
        await acceptInvitation(token);
        setStatus('success');
        setTimeout(() => router.push('/dashboard'), 2000);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to accept invitation');
        setStatus('error');
      }
    }

    validateAndAccept();
  }, [isInitialized, user, token, acceptInvitation, router]);

  return (
    <div style={{ width: '100%', maxWidth: 400, margin: '0 auto' }}>
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid rgba(0,0,0,0.08)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          padding: '36px 32px',
          textAlign: 'center',
        }}
      >
        {(status === 'loading' || status === 'accepting') && (
          <>
            <Loader2 size={36} className="animate-spin" style={{ color: '#2563EB', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              {status === 'loading' ? 'Validating invitation...' : 'Joining workspace...'}
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Just a moment.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={36} style={{ color: '#22C55E', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              You&apos;re in!
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280' }}>
              Welcome to <strong>{workspaceName}</strong>. Redirecting you to the dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle size={36} style={{ color: '#EF4444', margin: '0 auto 16px' }} />
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              Invitation problem
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 16 }}>{error}</p>
            <Link
              href="/sign-in"
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: '#2563EB',
                textDecoration: 'none',
              }}
            >
              Go to sign in →
            </Link>
          </>
        )}

        {status === 'needs-auth' && (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
              Join {workspaceName}
            </h2>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>
              Sign in or create an account to accept this invitation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                href={`/sign-in?redirect=/invite/${token}`}
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#2563EB',
                  borderRadius: 7,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Sign in
              </Link>
              <Link
                href={`/sign-up?redirect=/invite/${token}`}
                style={{
                  display: 'block',
                  padding: '10px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#374151',
                  background: '#FFFFFF',
                  border: '1px solid rgba(0,0,0,0.12)',
                  borderRadius: 7,
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Create an account
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
