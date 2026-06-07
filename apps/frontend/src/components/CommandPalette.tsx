'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const COMMANDS = [
  { id: 'dashboard',     label: 'Go Home',                  icon: '🏠', href: '/dashboard' },
  { id: 'opportunities', label: 'View Opportunities',       icon: '🔍', href: '/opportunities' },
  { id: 'approvals',     label: 'Review Approvals',         icon: '✅', href: '/approvals' },
  { id: 'activity',      label: 'View Activity Feed',       icon: '📜', href: '/activity' },
];

interface CommandPaletteProps { isOpen: boolean; onClose: () => void; }

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const filtered = COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => { if (isOpen) { setQuery(''); setSelectedIdx(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);
  useEffect(() => { setSelectedIdx(0); }, [query]);

  const execute = (href: string) => { router.push(href); onClose(); };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setSelectedIdx(i => Math.min(i + 1, filtered.length - 1)); } 
    else if (e.key === 'ArrowUp') { e.preventDefault(); setSelectedIdx(i => Math.max(i - 1, 0)); } 
    else if (e.key === 'Enter') { if (filtered[selectedIdx]) execute(filtered[selectedIdx].href); } 
    else if (e.key === 'Escape') { onClose(); }
  };

  if (!isOpen) return null;

  return (
    <div className="cmd-overlay" onClick={onClose}>
      <div className="cmd-box animate-fade-in" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontSize: 16, opacity: 0.5 }}>⌘</span>
          <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} onKeyDown={handleKey} placeholder="Ask Ajax…" style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--foreground)', fontSize: 15, fontFamily: 'inherit' }} />
          <kbd style={{ fontSize: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--muted)' }}>ESC</kbd>
        </div>
        <div style={{ maxHeight: 360, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No commands found</div>
          ) : (
            filtered.map((cmd, idx) => (
              <button key={cmd.id} onClick={() => execute(cmd.href)} onMouseEnter={() => setSelectedIdx(idx)} style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '10px 16px', background: idx === selectedIdx ? 'rgba(0,120,212,0.1)' : 'none', border: 'none', cursor: 'pointer', color: idx === selectedIdx ? 'var(--accent-light)' : 'var(--foreground)', fontSize: 13.5, textAlign: 'left', transition: 'all 0.1s' }}>
                <span style={{ fontSize: 16, width: 20, textAlign: 'center' }}>{cmd.icon}</span>
                {cmd.label}
                {idx === selectedIdx && <kbd style={{ marginLeft: 'auto', fontSize: 10, background: 'var(--surface-3)', border: '1px solid var(--border)', borderRadius: 4, padding: '2px 6px', color: 'var(--muted)' }}>↵</kbd>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
