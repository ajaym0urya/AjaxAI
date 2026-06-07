import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '12vh 24px', textAlign: 'center' }}>
      <div style={{ fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16 }}>
        404
      </div>
      <h1 style={{ fontSize: 44, lineHeight: 1.05, fontWeight: 800, color: 'var(--foreground)', marginBottom: 16 }}>
        Page not found
      </h1>
      <p style={{ fontSize: 18, color: 'var(--muted)', marginBottom: 32 }}>
        The route you requested does not exist in the current workspace.
      </p>
      <Link href="/dashboard" style={{ color: 'var(--foreground)', textDecoration: 'none', fontWeight: 600 }}>
        Return to dashboard
      </Link>
    </div>
  );
}