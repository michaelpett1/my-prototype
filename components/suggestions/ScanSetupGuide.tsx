'use client';

import React from 'react';
import { Terminal, ExternalLink, Zap, CheckCircle2 } from 'lucide-react';

interface ScanSetupGuideProps {
  onDismiss: () => void;
}

const DISMISSED_KEY = 'northstar-scan-setup-dismissed';

export function ScanSetupGuide({ onDismiss }: ScanSetupGuideProps) {
  const handleDismiss = () => {
    localStorage.setItem(DISMISSED_KEY, 'true');
    onDismiss();
  };

  const stepNumberStyle: React.CSSProperties = {
    width: 22,
    height: 22,
    borderRadius: '50%',
    backgroundColor: 'var(--app-accent, #2563EB)',
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const codeBlockStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    fontSize: 12,
    backgroundColor: 'var(--bg-tertiary)',
    border: '1px solid var(--border-row)',
    borderRadius: 6,
    padding: 12,
    overflowX: 'auto',
    lineHeight: 1.5,
    color: 'var(--text-primary)',
    marginTop: 8,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 15,
    color: 'var(--text-primary)',
    fontWeight: 700,
    margin: 0,
  };

  const bodyStyle: React.CSSProperties = {
    fontSize: 13,
    color: 'var(--text-tertiary)',
    lineHeight: 1.6,
    margin: 0,
  };

  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: 24,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            backgroundColor: 'rgba(37,99,235,0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Zap size={16} style={{ color: 'var(--app-accent, #2563EB)' }} />
        </div>
        <h3 style={{ ...headingStyle, fontSize: 16 }}>Set Up Scans</h3>
      </div>

      {/* What scans do */}
      <p style={{ ...bodyStyle, marginBottom: 16 }}>
        Northstar scans your JIRA, Confluence, and Slack to automatically surface tickets, documents,
        and discussions that may be relevant to your roadmap.
      </p>

      {/* Requirements */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          backgroundColor: 'var(--bg-tertiary)',
          border: '1px solid var(--border-row)',
          borderRadius: 6,
          padding: 12,
          marginBottom: 20,
        }}
      >
        <Terminal size={14} style={{ color: 'var(--app-accent, #2563EB)', marginTop: 2, flexShrink: 0 }} />
        <p style={{ ...bodyStyle, margin: 0 }}>
          Scans require MCP (Model Context Protocol) server integrations to be configured in your Claude Code environment.
        </p>
      </div>

      {/* Setup steps */}
      <h4 style={{ ...headingStyle, marginBottom: 14 }}>Setup Steps</h4>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {/* Step 1: JIRA */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={stepNumberStyle}>1</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...headingStyle, fontSize: 13, marginBottom: 4 }}>JIRA</p>
            <p style={{ ...bodyStyle, marginBottom: 4 }}>
              Add the Atlassian MCP server to your Claude Code config. This enables searching JIRA issues and reading ticket details.
            </p>
            <pre style={codeBlockStyle}>
{`"atlassian": {
  "command": "npx",
  "args": ["-y", "@anthropic/atlassian-mcp-server"]
}`}
            </pre>
          </div>
        </div>

        {/* Step 2: Confluence */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={stepNumberStyle}>2</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...headingStyle, fontSize: 13, marginBottom: 4 }}>Confluence</p>
            <p style={bodyStyle}>
              The Atlassian MCP server also covers Confluence. Once configured, Northstar can search pages and documents.
            </p>
          </div>
        </div>

        {/* Step 3: Slack */}
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={stepNumberStyle}>3</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ ...headingStyle, fontSize: 13, marginBottom: 4 }}>Slack</p>
            <p style={{ ...bodyStyle, marginBottom: 4 }}>
              Add the Slack MCP server to enable scanning Slack channels for relevant discussions.
            </p>
            <pre style={codeBlockStyle}>
{`"slack": {
  "command": "npx",
  "args": ["-y", "@anthropic/slack-mcp-server"]
}`}
            </pre>
          </div>
        </div>
      </div>

      {/* How to add */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          marginTop: 20,
          marginBottom: 8,
        }}
      >
        <ExternalLink size={14} style={{ color: 'var(--app-accent, #2563EB)', marginTop: 2, flexShrink: 0 }} />
        <p style={bodyStyle}>
          Open Claude Code, go to Settings → MCP Servers, and add the configurations above. Or add them to your{' '}
          <code
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-row)',
              borderRadius: 4,
              padding: '1px 5px',
            }}
          >
            .claude/settings.json
          </code>{' '}
          file.
        </p>
      </div>

      {/* Once configured */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <CheckCircle2 size={14} style={{ color: '#16A34A', marginTop: 2, flexShrink: 0 }} />
        <p style={bodyStyle}>
          After setup, click &lsquo;Run Scan&rsquo; to test the connection. If successful, suggestions will appear in the Pending tab.
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={handleDismiss}
          style={{
            backgroundColor: 'var(--app-accent, #2563EB)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            padding: '9px 18px',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            lineHeight: 1.4,
          }}
        >
          I&apos;ve configured my MCP servers
        </button>
        <button
          onClick={handleDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-tertiary)',
            fontSize: 13,
            cursor: 'pointer',
            padding: 0,
            textDecoration: 'underline',
            textUnderlineOffset: 2,
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
