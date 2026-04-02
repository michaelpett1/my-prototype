'use client';
import { useState, useRef } from 'react';
import { Loader2, Copy, Check, X, RefreshCw, Trash2, Mail } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useAuthStore, type WorkspaceInvitation } from '@/lib/store/authStore';

export function InviteMemberModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { inviteMember, invitations, revokeInvitation, resendInvitation, currentWorkspace } = useAuthStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'member' | 'viewer'>('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prevOpen = useRef(false);
  if (open && !prevOpen.current) {
    prevOpen.current = true;
    setEmail('');
    setError('');
    setSuccess('');
  }
  if (!open && prevOpen.current) {
    prevOpen.current = false;
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter an email address.');
      return;
    }

    setLoading(true);
    try {
      const inv = await inviteMember(email.trim(), role);
      setSuccess(`Invitation sent to ${email}. Token: ${inv.token}`);
      setEmail('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  }

  function copyInviteLink(inv: WorkspaceInvitation) {
    const link = `${window.location.origin}/invite/${inv.token}`;
    navigator.clipboard.writeText(link);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  async function handleRevoke(id: string) {
    try {
      await revokeInvitation(id);
    } catch {
      // silent
    }
  }

  async function handleResend(id: string) {
    try {
      await resendInvitation(id);
    } catch {
      // silent
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '8px 10px',
    fontSize: 13,
    border: '1px solid var(--border-strong)',
    borderRadius: 6,
    color: 'var(--text-primary)',
    background: 'var(--bg-primary)',
    outline: 'none',
  };

  const pendingInvitations = invitations.filter(i => !i.acceptedAt);

  return (
    <Modal open={open} onClose={onClose} title="Invite Members">
      <div style={{ minWidth: 420, maxWidth: 500 }}>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
          Invite people to <strong>{currentWorkspace?.name}</strong>. They&apos;ll receive an invitation link.
        </p>

        <form onSubmit={handleInvite} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Mail size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Email address"
              type="email"
              style={{ ...inputStyle, paddingLeft: 32 }}
              autoFocus
            />
          </div>
          <select
            value={role}
            onChange={e => setRole(e.target.value as 'admin' | 'member' | 'viewer')}
            style={{ ...inputStyle, width: 100 }}
          >
            <option value="admin">Admin</option>
            <option value="member">Member</option>
            <option value="viewer">Viewer</option>
          </select>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              background: loading ? '#93C5FD' : '#2563EB',
              border: 'none',
              borderRadius: 6,
              cursor: loading ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : null}
            Invite
          </button>
        </form>

        {error && (
          <div style={{ fontSize: 12, color: '#DC2626', background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 6, padding: '6px 10px', marginBottom: 12 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ fontSize: 12, color: '#16A34A', background: 'var(--success-bg)', border: '1px solid #BBF7D0', borderRadius: 6, padding: '6px 10px', marginBottom: 12 }}>
            {success}
          </div>
        )}

        {/* Pending invitations */}
        {pendingInvitations.length > 0 && (
          <div>
            <h3 style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>
              Pending Invitations ({pendingInvitations.length})
            </h3>
            <div style={{ border: '1px solid var(--border-medium)', borderRadius: 8, overflow: 'hidden' }}>
              {pendingInvitations.map((inv, idx) => {
                const expired = new Date(inv.expiresAt) < new Date();
                return (
                  <div
                    key={inv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '8px 12px',
                      borderBottom: idx < pendingInvitations.length - 1 ? '1px solid var(--border-row)' : 'none',
                      background: expired ? 'var(--danger-bg)' : 'transparent',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, color: 'var(--text-primary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {inv.email}
                      </p>
                      <p style={{ fontSize: 11, color: expired ? '#DC2626' : 'var(--text-muted)', margin: '2px 0 0' }}>
                        {expired ? 'Expired' : `Expires ${new Date(inv.expiresAt).toLocaleDateString()}`}
                        {' · '}{inv.role}
                      </p>
                    </div>
                    <button
                      onClick={() => copyInviteLink(inv)}
                      title="Copy invite link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
                    >
                      {copiedId === inv.id ? <Check size={14} color="#16A34A" /> : <Copy size={14} />}
                    </button>
                    {expired && (
                      <button
                        onClick={() => handleResend(inv.id)}
                        title="Resend (extend 7 days)"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D97706', padding: 4 }}
                      >
                        <RefreshCw size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => handleRevoke(inv.id)}
                      title="Revoke invitation"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#DC2626', padding: 4 }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onClose}
            style={{
              fontSize: 13,
              fontWeight: 500,
              padding: '7px 14px',
              borderRadius: 6,
              border: '1px solid var(--border-strong)',
              color: 'var(--text-secondary)',
              background: 'var(--bg-primary)',
              cursor: 'pointer',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </Modal>
  );
}
