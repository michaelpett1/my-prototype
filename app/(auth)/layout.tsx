'use client';
import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: 'linear-gradient(135deg, #FAFAF9 0%, #F0F4FF 50%, #FDF2F8 100%)',
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: '16px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
          }}
        >
          <img
            src="/assets/northstar-logo.svg"
            alt="Northstar"
            style={{ width: 36, height: 36 }}
          />
          <span
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: '#1C1917',
              letterSpacing: '-0.01em',
            }}
          >
            Northstar
          </span>
        </Link>
      </header>

      {/* Content */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 24px 48px',
        }}
      >
        {children}
      </main>
    </div>
  );
}
