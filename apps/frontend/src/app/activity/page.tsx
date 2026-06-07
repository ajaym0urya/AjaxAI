'use client';

import React, { useEffect, useState } from 'react';
import { useApi } from '@/hooks/useApi';
import { useWebSocket } from '@/hooks/useWebSocket';

interface Memory { id: string; type: string; content: string; timestamp: string; }
interface AgentLogPayload { message?: string; }

export default function ActivityPage() {
  const { data: memory } = useApi<Memory[]>('/memory', []);
  const [liveActivities, setLiveActivities] = useState<string[]>([]);

  useWebSocket((msg) => {
    const payload = msg.data as AgentLogPayload | undefined;

    if (msg.type === 'agent_log' && payload?.message) {
      setLiveActivities(prev => [payload.message as string, ...prev]);
    }
  });

  const pastActivities = (memory || [])
    .filter(m => m.type === 'agent_log')
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .map(m => m.content);

  const allActivities = [...liveActivities, ...pastActivities];
  const displayActivities = allActivities.length > 0 ? allActivities : [
    'Ajax analyzed 42 Product Manager jobs',
    'Ajax found 3 certifications',
    'Ajax updated your roadmap',
    'Ajax identified a resume gap'
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingTop: '4vh' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--foreground)', letterSpacing: -1, marginBottom: 16 }}>Activity</h1>
        <p style={{ fontSize: 18, color: 'var(--muted)' }}>What Ajax has been doing behind the scenes.</p>
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--foreground)', marginBottom: 24 }}>Today</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {displayActivities.map((act, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '20px 0', borderBottom: i < displayActivities.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#0078D4', flexShrink: 0 }} />
              <div style={{ fontSize: 18, color: 'var(--foreground)', lineHeight: 1.4 }}>{act}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
