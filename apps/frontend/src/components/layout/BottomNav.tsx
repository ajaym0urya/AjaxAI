'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWebSocket } from '@/hooks/useWebSocket';

const NAV_ITEMS = [
  { href: '/dashboard',     icon: '🏠', label: 'Home' },
  { href: '/opportunities', icon: '🔍', label: 'Match' },
  { href: '/approvals',     icon: '✅', label: 'Review', badge: true },
  { href: '/activity',      icon: '📜', label: 'Activity' },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { status: wsStatus } = useWebSocket();
  const pendingApprovals = 1; // You could fetch this from context or props if needed

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link key={item.href} href={item.href} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <span className="bottom-nav-icon">
              {item.icon}
              {item.badge && pendingApprovals > 0 && (
                <span className="bottom-nav-badge" />
              )}
            </span>
            <span className="bottom-nav-label">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
