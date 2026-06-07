import type { Metadata } from 'next';
import './globals.css';

export const viewport = { width: 'device-width', initialScale: 1 };

export const metadata: Metadata = {
  title: 'AjaxApply | AI Job Application Agent',
  description: 'An autonomous AI agent that scrapes and applies to jobs for you.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body style={{ backgroundColor: '#0f172a', color: '#f8fafc', minHeight: '100vh' }}>
        {children}
      </body>
    </html>
  );
}
