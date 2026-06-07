import type { Metadata } from 'next';
import './globals.css';
import RootClientLayout from './RootClientLayout';

export const viewport = { width: 'device-width', initialScale: 1 };

export const metadata: Metadata = {
  title: 'Ajax OS | Autonomous AI Operating System',
  description: 'An Autonomous AI Operating System powered by collaborative agent swarms that continuously plans, reasons, learns, and executes work across the web and enterprise systems.',
  keywords: ['AI OS', 'Agent Swarm', 'Autonomous AI', 'Goal Execution'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <RootClientLayout>{children}</RootClientLayout>
      </body>
    </html>
  );
}
