'use client';

import React from 'react';
import { useApi } from '@/hooks/useApi';

interface Opportunity { id: string; title: string; relevanceScore: number; url: string; }

export default function OpportunitiesPage() {
  const { data: opportunities, loading } = useApi<Opportunity[]>('/opportunities', []);

  const displayOpps = (opportunities && opportunities.length > 0) ? opportunities : [
    { id: '1', title: 'Microsoft PM Internship', relevanceScore: 92, url: '#' },
    { id: '2', title: 'Google APM Program', relevanceScore: 87, url: '#' },
    { id: '3', title: 'AWS Cloud Practitioner Certification', relevanceScore: 78, url: '#' }
  ];

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingTop: '4vh' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--foreground)', letterSpacing: -1, marginBottom: 16 }}>Recommended Opportunities</h1>
        <p style={{ fontSize: 18, color: 'var(--muted)' }}>Based on your active goals and skill profile.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading ? (
          <div>{[1,2].map(i => <div key={i} className="card skeleton" style={{ height: 120, marginBottom: 24 }} />)}</div>
        ) : (
          displayOpps.map(opp => (
            <div key={opp.id} className="card" style={{ padding: 32, borderRadius: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>{opp.title}</h2>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#4ade80' }}>{opp.relevanceScore}% Match</div>
              </div>
              <a href={opp.url} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 16, fontWeight: 600, borderRadius: 10, textDecoration: 'none' }}>View</a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
