'use client';

import React, { useState, useEffect } from 'react';
import BottomNav from '@/components/layout/BottomNav';
import CommandPalette from '@/components/CommandPalette';

export default function RootClientLayout({ children }: { children: React.ReactNode }) {
  const [cmdOpen, setCmdOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCmdOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="app-shell">
      {/* Top Header Logo (Optional, but good for branding on mobile and desktop) */}
      <header className="top-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'var(--foreground)', color: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14 }}>A</div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.3, color: 'var(--foreground)' }}>Ajax</div>
        </div>
      </header>

      <main className="main-content">
        {children}
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
      
      <CommandPalette isOpen={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  );
}
