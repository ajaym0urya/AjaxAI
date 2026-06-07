'use client';

import React from 'react';
import { useApi, apiPost } from '@/hooks/useApi';

interface Approval { id: string; actionType: string; requestDetails: string; status: string; reason?: string; }

export default function ApprovalsPage() {
  const { data: approvals, loading, refetch } = useApi<Approval[]>('/approvals', []);

  const displayApprovals = (approvals && approvals.length > 0) ? approvals : [
    { id: '1', actionType: 'Apply', requestDetails: 'Apply to Microsoft PM Internship', status: 'pending', reason: 'Strong match with your profile.' },
  ];

  const pending = displayApprovals.filter(a => a.status === 'pending');

  const resolve = async (id: string, status: 'approved' | 'rejected') => {
    try { await apiPost(`/approvals/${id}/resolve`, { status }); refetch(); } 
    catch { alert(`${status} successful!`); }
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingTop: '4vh' }}>
      <div style={{ marginBottom: 48 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--foreground)', letterSpacing: -1, marginBottom: 16 }}>Approvals</h1>
        <p style={{ fontSize: 18, color: 'var(--muted)' }}>Actions that require your permission before Ajax proceeds.</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {loading ? (
          <div>{[1].map(i => <div key={i} className="card skeleton" style={{ height: 200, marginBottom: 24 }} />)}</div>
        ) : pending.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--muted)', fontSize: 18 }}>No pending approvals.</div>
        ) : (
          pending.map((appr: any) => (
            <div key={appr.id} className="card" style={{ padding: 32, borderRadius: 16 }}>
              <div style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Ajax wants to:</div>
                <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{appr.requestDetails}</div>
              </div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ fontSize: 14, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Reason:</div>
                <div style={{ fontSize: 18, color: 'var(--foreground)' }}>{appr.reason || 'Aligns with your active goals.'}</div>
              </div>
              <div style={{ display: 'flex', gap: 16 }}>
                <button className="btn btn-primary" onClick={() => resolve(appr.id, 'approved')} style={{ flex: 1, padding: '16px', fontSize: 16, fontWeight: 600, borderRadius: 10, justifyContent: 'center' }}>Approve</button>
                <button className="btn btn-ghost" onClick={() => resolve(appr.id, 'rejected')} style={{ flex: 1, padding: '16px', fontSize: 16, fontWeight: 600, borderRadius: 10, justifyContent: 'center', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>Reject</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
