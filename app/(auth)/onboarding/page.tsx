'use client';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Loader2,
  Building2,
  Mail,
  ArrowRight,
  ArrowLeft,
  LayoutDashboard,
  Target,
  Sparkles,
  Zap,
  Users,
  Search,
  CheckCircle,
  Calendar,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Info,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { useSettingsStore } from '@/lib/store/settingsStore';
import { useProjectsStore } from '@/lib/store/projectsStore';
import { useOKRsStore } from '@/lib/store/okrsStore';
import { useRoadmapStore } from '@/lib/store/roadmapStore';
import { useSuggestionsStore } from '@/lib/store/suggestionsStore';
import { registerUser } from '@/lib/utils/userRegistry';

type OnboardingStep = 'welcome' | 'create' | 'invite' | 'features' | 'scans' | 'ready';

const FEATURES = [
  {
    icon: LayoutDashboard,
    title: 'Dashboard',
    description: 'Get a high-level overview of your product portfolio — active projects, OKR health, and recent activity at a glance.',
    color: '#2563EB',
  },
  {
    icon: Calendar,
    title: 'Timelines',
    description: 'Plan and visualise delivery with interactive Gantt charts. Track dependencies, milestones, and project status across your team.',
    color: '#8B5CF6',
  },
  {
    icon: Target,
    title: 'OKRs',
    description: 'Set objectives and key results. Track progress with check-ins, confidence signals, and weighted metrics.',
    color: '#22C55E',
  },
  {
    icon: Sparkles,
    title: 'Suggestions',
    description: 'AI-powered scanning surfaces relevant tickets, documents, and discussions from your tools — so nothing falls through the cracks.',
    color: '#F59E0B',
  },
];

/* ── Scan Setup Step (extracted for clarity) ────────────────────── */
function ScanSetupStep({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const MCP_CONFIGS = [
    {
      name: 'Atlassian (JIRA + Confluence)',
      icon: Search,
      color: '#2563EB',
      desc: 'Search JIRA tickets, epics, and Confluence pages. One server covers both tools.',
      config: `"atlassian": {\n  "command": "npx",\n  "args": ["-y", "@anthropic/atlassian-mcp-server"]\n}`,
      note: 'You\'ll be prompted to authenticate with your Atlassian account on first use.',
    },
    {
      name: 'Slack',
      icon: Users,
      color: '#22C55E',
      desc: 'Scan Slack channels and threads for relevant discussions and decisions.',
      config: `"slack": {\n  "command": "npx",\n  "args": ["-y", "@anthropic/slack-mcp-server"]\n}`,
      note: 'Requires Slack workspace access. You\'ll authorize via OAuth on first use.',
    },
  ];

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1"
        style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16 }}
      >
        <ArrowLeft size={12} /> Back
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Sparkles size={18} color="#FFFFFF" />
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Set up your scans
        </h2>
      </div>
      <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 20px', lineHeight: 1.6 }}>
        Each user sets up scans on their own machine. This connects Northstar to your JIRA, Confluence, and Slack so it can surface relevant items for your roadmap.
      </p>

      {/* How it works — concise */}
      <div style={{ padding: '12px 14px', background: 'var(--info-bg)', borderRadius: 8, border: '1px solid #BAE6FD', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <Info size={14} style={{ color: '#0284C7', marginTop: 1, flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#0C4A6E', margin: '0 0 4px' }}>How scans work</p>
            <p style={{ fontSize: 12, color: '#0369A1', margin: 0, lineHeight: 1.6 }}>
              Scans use MCP (Model Context Protocol) servers running locally in your Claude Code environment. Each team member configures their own connections — your credentials stay on your machine.
            </p>
          </div>
        </div>
      </div>

      {/* Setup steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {MCP_CONFIGS.map((mcp, i) => {
          const Icon = mcp.icon;
          const isExpanded = expandedIdx === i;
          return (
            <div
              key={i}
              style={{
                background: 'var(--bg-primary)',
                borderRadius: 10,
                border: isExpanded ? `1.5px solid ${mcp.color}30` : '1px solid var(--border)',
                overflow: 'hidden',
                transition: 'border-color 200ms',
              }}
            >
              <button
                onClick={() => setExpandedIdx(isExpanded ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 14px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  width: 30,
                  height: 30,
                  borderRadius: 7,
                  background: `${mcp.color}10`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={14} style={{ color: mcp.color }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{mcp.name}</p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '2px 0 0' }}>{mcp.desc}</p>
                </div>
                <ArrowRight
                  size={14}
                  style={{
                    color: 'var(--text-muted)',
                    flexShrink: 0,
                    transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                    transition: 'transform 200ms',
                  }}
                />
              </button>

              {isExpanded && (
                <div style={{ padding: '0 14px 14px', borderTop: '1px solid var(--bg-subtle)' }}>
                  <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '12px 0 8px', lineHeight: 1.5 }}>
                    Add this to your Claude Code MCP settings:
                  </p>
                  <div style={{ position: 'relative' }}>
                    <pre style={{
                      fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
                      fontSize: 11,
                      backgroundColor: '#1E293B',
                      color: '#E2E8F0',
                      borderRadius: 7,
                      padding: '12px 14px',
                      overflowX: 'auto',
                      lineHeight: 1.6,
                      margin: 0,
                    }}>
                      {mcp.config}
                    </pre>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleCopy(mcp.config, i); }}
                      style={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        background: 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: 5,
                        padding: '4px 8px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                        fontSize: 11,
                        color: '#CBD5E1',
                      }}
                    >
                      {copiedIdx === i ? <><Check size={11} /> Copied</> : <><Copy size={11} /> Copy</>}
                    </button>
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: '8px 0 0', lineHeight: 1.5 }}>
                    <Shield size={10} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
                    {mcp.note}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Where to add */}
      <div style={{ padding: '12px 14px', background: 'var(--bg-secondary)', borderRadius: 8, border: '1px solid var(--border-row)', marginBottom: 16 }}>
        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', margin: '0 0 6px' }}>
          <Terminal size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Where to add these
        </p>
        <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: 0, lineHeight: 1.6 }}>
          Open Claude Code &rarr; Settings &rarr; MCP Servers and paste the config. Or add directly to your <code style={{
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 11,
            background: 'var(--bg-tertiary)',
            borderRadius: 3,
            padding: '1px 5px',
          }}>.claude/settings.json</code> file under <code style={{
            fontFamily: 'ui-monospace, SFMono-Regular, monospace',
            fontSize: 11,
            background: 'var(--bg-tertiary)',
            borderRadius: 3,
            padding: '1px 5px',
          }}>&quot;mcpServers&quot;</code>.
        </p>
      </div>

      {/* Tip */}
      <div style={{ padding: '10px 14px', background: 'var(--success-bg)', borderRadius: 8, border: '1px solid #BBF7D0', marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'var(--success-text)', margin: 0, lineHeight: 1.5 }}>
          <Zap size={11} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 3 }} />
          <strong>You can do this later.</strong> Once set up, trigger scans from the Suggestions page using the &ldquo;Run Scan&rdquo; button. Results appear instantly.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 10 }}>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border-strong)',
            borderRadius: 7,
            cursor: 'pointer',
          }}
        >
          Skip for now
        </button>
        <button
          onClick={onNext}
          style={{
            flex: 1,
            padding: '12px 16px',
            fontSize: 14,
            fontWeight: 600,
            color: '#FFFFFF',
            background: '#2563EB',
            border: 'none',
            borderRadius: 7,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          Continue <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense>
      <OnboardingContent />
    </Suspense>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isNewWorkspace = searchParams.get('new') === '1';
  const { user, initialize, isInitialized, workspaces, createWorkspace } = useAuthStore();
  const updateWorkspace = useSettingsStore(s => s.updateWorkspace);
  const [step, setStep] = useState<OnboardingStep>(isNewWorkspace ? 'create' : 'welcome');
  const [wsName, setWsName] = useState('');
  const [wsVision, setWsVision] = useState('');
  const [inviteEmails, setInviteEmails] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [onboardingStarted, setOnboardingStarted] = useState(isNewWorkspace);

  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // If user already has workspaces and hasn't started onboarding this session, redirect
  // Skip this check if creating a new workspace (?new=1)
  useEffect(() => {
    if (isInitialized && workspaces.length > 0 && !onboardingStarted && !isNewWorkspace) {
      router.push('/dashboard');
    }
  }, [isInitialized, workspaces, router, onboardingStarted, isNewWorkspace]);

  // If no user, redirect to sign-in
  useEffect(() => {
    if (isInitialized && !user) {
      router.push('/sign-in');
    }
  }, [isInitialized, user, router]);

  function generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50) || 'workspace';
  }

  async function handleCreateWorkspace(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!wsName.trim()) {
      setError('Please enter a workspace name.');
      return;
    }

    setLoading(true);
    try {
      // Reset in-memory Zustand state so no data leaks from previous workspace
      useProjectsStore.setState({ items: [], groups: [], _loadedWorkspaceId: null });
      useOKRsStore.setState({ objectives: [], _loadedWorkspaceId: null });
      useRoadmapStore.setState({ tasks: [], _loadedWorkspaceId: null });
      useSuggestionsStore.setState({ suggestions: [] });
      useSettingsStore.setState({ departments: [], teamMembers: [] });

      const newWs = await createWorkspace(wsName.trim(), generateSlug(wsName));
      // Save vision to settings
      updateWorkspace({ name: wsName.trim(), vision: wsVision.trim() });
      // Add creator as team member with owner role
      const currentUser = useAuthStore.getState().user;
      if (currentUser?.email) {
        const userName = currentUser.user_metadata?.full_name ?? currentUser.email.split('@')[0];
        useSettingsStore.getState().addTeamMember({
          id: currentUser.id,
          name: userName,
          email: currentUser.email,
          role: 'Workspace Creator',
          avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=2563EB&color=fff&size=40`,
          workspaceRole: 'owner',
        });
      }
      // Register user→workspace mapping so returning sign-ins restore this workspace
      if (currentUser?.email) {
        registerUser(
          currentUser.email,
          currentUser.id,
          currentUser.user_metadata?.full_name ?? currentUser.email.split('@')[0],
          {
            id: newWs.id,
            name: newWs.name,
            slug: newWs.slug,
            createdBy: newWs.createdBy,
            createdAt: newWs.createdAt,
          }
        );
      }
      setStep('invite');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  }

  async function handleInviteSubmit() {
    if (inviteEmails.trim()) {
      const { inviteMember } = useAuthStore.getState();
      const emails = inviteEmails.split(/[,\n]/).map(e => e.trim()).filter(Boolean);
      for (const email of emails) {
        try {
          await inviteMember(email, 'member');
        } catch {
          // Silently skip failed invites
        }
      }
    }
    setStep('features');
  }

  function handleFinish() {
    router.push('/dashboard');
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    fontSize: 14,
    border: '1px solid var(--input-border)',
    borderRadius: 7,
    background: 'var(--input-bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 150ms',
  };

  const STEPS: OnboardingStep[] = ['welcome', 'create', 'invite', 'features', 'scans', 'ready'];
  const stepIndex = STEPS.indexOf(step);
  const totalSteps = STEPS.length;

  if (!isInitialized) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <Loader2 size={24} className="animate-spin" style={{ color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: 520, margin: '0 auto' }}>
      {/* Progress bar */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, padding: '0 4px' }}>
        {STEPS.map((_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 99,
              background: i <= stepIndex ? '#2563EB' : 'var(--text-disabled)',
              transition: 'background 300ms',
            }}
          />
        ))}
      </div>

      <div
        style={{
          background: 'var(--bg-primary)',
          borderRadius: 14,
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
          padding: '36px 32px',
          minHeight: 380,
        }}
      >
        {/* ── Step 1: Welcome ─────────────────────────────── */}
        {step === 'welcome' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
                <img src="/assets/northstar-logo.svg" alt="Northstar" style={{ width: 56, height: 56 }} />
              </div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
                Welcome to Northstar
              </h1>
              <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.6 }}>
                Your AI-powered product management tool. Northstar connects your JIRA, Confluence, and Slack to keep your roadmap in sync and your team aligned.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
              {[
                { icon: '📋', text: 'Plan projects with interactive Gantt charts and timelines' },
                { icon: '🎯', text: 'Track OKRs with weighted key results and check-ins' },
                { icon: '🤖', text: 'AI scans your tools to surface tickets, docs, and discussions' },
                { icon: '👥', text: 'Collaborate with your team in shared workspaces' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-tertiary)', borderRadius: 8, border: '1px solid var(--bg-subtle)' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item.text}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => { setOnboardingStarted(true); setStep('create'); }}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#2563EB',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
              }}
            >
              Get started <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── Step 2: Create Workspace ────────────────────── */}
        {step === 'create' && (
          <form onSubmit={handleCreateWorkspace}>
            <button
              type="button"
              onClick={() => { setStep('welcome'); setError(''); }}
              className="flex items-center gap-1"
              style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16 }}
            >
              <ArrowLeft size={12} /> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Building2 size={18} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Create your workspace
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 24px' }}>
              A workspace is your team&apos;s shared environment for roadmaps, OKRs, and timelines. Only members can access its data.
            </p>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Workspace name *
              </label>
              <input
                value={wsName}
                onChange={e => setWsName(e.target.value)}
                placeholder="e.g. Acme Product, Marketing Team"
                style={inputStyle}
                autoFocus
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                Team vision <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
              </label>
              <textarea
                value={wsVision}
                onChange={e => setWsVision(e.target.value)}
                placeholder="What is your team working towards? e.g. Build the best user experience in our market."
                rows={2}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                This appears on your dashboard to keep everyone aligned.
              </p>
            </div>

            {error && (
              <div style={{ fontSize: 13, color: '#DC2626', background: 'var(--danger-bg)', border: '1px solid #FECACA', borderRadius: 6, padding: '8px 12px', marginBottom: 16 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 16px',
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
              }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Creating...' : 'Create Workspace'}
            </button>
          </form>
        )}

        {/* ── Step 3: Invite Team ─────────────────────────── */}
        {step === 'invite' && (
          <div>
            <button
              type="button"
              onClick={() => setStep('create')}
              className="flex items-center gap-1"
              style={{ fontSize: 12, color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 16 }}
            >
              <ArrowLeft size={12} /> Back
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="#FFFFFF" />
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                Invite your team
              </h2>
            </div>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)', margin: '0 0 24px' }}>
              Add team members who&apos;ll collaborate on your roadmap. Only workspace members can view your data. You can always invite more later from Settings.
            </p>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>
                <Mail size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
                Email addresses
              </label>
              <textarea
                value={inviteEmails}
                onChange={e => setInviteEmails(e.target.value)}
                placeholder={"colleague@company.com\nanother@company.com"}
                rows={3}
                style={{ ...inputStyle, resize: 'vertical' }}
              />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                Separate multiple emails with commas or new lines.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('features')}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 7,
                  cursor: 'pointer',
                }}
              >
                Skip for now
              </button>
              <button
                onClick={handleInviteSubmit}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  fontSize: 14,
                  fontWeight: 600,
                  color: '#FFFFFF',
                  background: '#2563EB',
                  border: 'none',
                  borderRadius: 7,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                Send invites <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Feature Tour ────────────────────────── */}
        {step === 'features' && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                What you can do with Northstar
              </h2>
              <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 6 }}>
                Here&apos;s a quick overview of the key features.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
              {FEATURES.map((f, i) => {
                const Icon = f.icon;
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                      padding: '14px 16px',
                      background: 'var(--bg-secondary)',
                      borderRadius: 10,
                      border: '1px solid var(--border-light)',
                    }}
                  >
                    <div style={{
                      width: 34,
                      height: 34,
                      borderRadius: 8,
                      background: `${f.color}12`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Icon size={16} style={{ color: f.color }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>{f.title}</p>
                      <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '3px 0 0', lineHeight: 1.5 }}>{f.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setStep('scans')}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#2563EB',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              Next: Automated Scans <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── Step 5: Scan Setup ──────────────────────────── */}
        {step === 'scans' && (
          <ScanSetupStep onBack={() => setStep('features')} onNext={() => setStep('ready')} />
        )}

        {/* ── Step 6: Ready ──────────────────────────────── */}
        {step === 'ready' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 20,
              background: 'var(--success-bg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <CheckCircle size={32} style={{ color: '#22C55E' }} />
            </div>

            <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: '0 0 8px' }}>
              You&apos;re all set!
            </h2>
            <p style={{ fontSize: 14, color: 'var(--text-tertiary)', marginTop: 0, marginBottom: 28, lineHeight: 1.6 }}>
              Your workspace <strong style={{ color: 'var(--text-primary)' }}>{wsName || 'workspace'}</strong> is ready. Here&apos;s what to do next:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left', marginBottom: 28, padding: '0 8px' }}>
              {[
                'Add your first project or timeline item',
                'Set up an objective with key results',
                'Run your first scan to pull in suggestions',
                'Invite more team members from Settings',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0' }}>
                  <div style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: 'var(--info-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    color: '#2563EB',
                    flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item}</span>
                </div>
              ))}
            </div>

            <button
              onClick={handleFinish}
              style={{
                width: '100%',
                padding: '12px 16px',
                fontSize: 14,
                fontWeight: 600,
                color: '#FFFFFF',
                background: '#2563EB',
                border: 'none',
                borderRadius: 7,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 1px 3px rgba(37, 99, 235, 0.3)',
              }}
            >
              Go to Dashboard <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      {/* Step indicator */}
      <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>
        Step {stepIndex + 1} of {totalSteps}
      </p>
    </div>
  );
}
