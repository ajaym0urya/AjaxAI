'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { API_BASE } from '@/lib/constants';

export const dynamic = 'force-dynamic';

interface Objective { id: string; title: string; progressScore: number; momentumScore: number; status: string; }

export default function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [obj, setObj] = useState<Objective | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const arr: Objective[] = await fetch(`${API_BASE}/objectives`).then(r => r.json());
      const found = arr.find(o => o.id === id);
      if (found) setObj(found);
    } catch { /* ignore */ } 
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div style={{ padding: 32 }}><div className="skeleton" style={{ height: 40, width: 300, marginBottom: 16 }} /></div>;
  if (!obj) return <div style={{ padding: 32, color: 'var(--muted)' }}>Goal not found. <Link href="/dashboard" style={{ color: 'var(--foreground)' }}>Go home</Link></div>;

  const healthColor = obj.momentumScore >= 70 ? '#4ade80' : obj.momentumScore >= 40 ? '#fbbf24' : '#f87171';
  const healthLabel = obj.momentumScore >= 70 ? 'Good' : obj.momentumScore >= 40 ? 'Fair' : 'Needs Attention';

  return (
    <div className="animate-fade-in" style={{ maxWidth: 720, margin: '0 auto', paddingTop: '4vh' }}>
      <div style={{ marginBottom: 48 }}>
        <Link href="/dashboard" style={{ fontSize: 14, color: 'var(--muted)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
          <span>←</span> Back to Home
        </Link>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--foreground)', letterSpacing: -1, marginBottom: 24 }}>{obj.title}</h1>
        <div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Health</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: healthColor }}>{healthLabel}</div>
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600, marginBottom: 8 }}>Progress</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{obj.progressScore}%</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div className="card" style={{ padding: 32, borderRadius: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 24 }}>What Ajax Is Doing</h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--foreground)' }}><span style={{ color: '#4ade80' }}>•</span> Analyzed resume</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--foreground)' }}><span style={{ color: '#4ade80' }}>•</span> Found skill gaps</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--foreground)' }}><span style={{ color: '#4ade80' }}>•</span> Found 17 jobs</li>
            <li style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, color: 'var(--foreground)' }}><span style={{ color: '#4ade80' }}>•</span> Built learning roadmap</li>
          </ul>
        </div>
        <div className="card" style={{ padding: 32, borderRadius: 16, background: 'rgba(0,120,212,0.05)', borderColor: 'rgba(0,120,212,0.3)' }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12, color: 'var(--foreground)' }}>Recommended Next Action</h2>
          <p style={{ fontSize: 20, fontWeight: 500, color: 'var(--foreground)', marginBottom: 24 }}>Learn SQL Fundamentals</p>
          <button className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 16, fontWeight: 600, borderRadius: 10 }} onClick={() => alert("Action Accepted")}>Accept</button>
        </div>
      </div>
    </div>
  );
}
