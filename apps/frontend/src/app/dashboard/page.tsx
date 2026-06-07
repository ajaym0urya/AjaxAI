'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApi, apiPost } from '@/hooks/useApi';

interface Objective { id: string; title: string; progressScore: number; status: string; }

const EXAMPLES = ['Get a Product Manager job', 'Learn Azure in 60 days', 'Launch a startup', 'Prepare for AWS Certification'];

export default function HomePage() {
  const { data: objectives, refetch } = useApi<Objective[]>('/objectives', []);
  const [goalInput, setGoalInput] = useState('');
  const [launching, setLaunching] = useState(false);

  const handleStart = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!goalInput.trim() || launching) return;
    setLaunching(true);
    try {
      await apiPost('/objectives/', { title: goalInput, description: 'Autonomously generated goal', complexity: 'Medium' });
      setGoalInput('');
      refetch();
    } catch (err) { console.error(err); } 
    finally { setLaunching(false); }
  };

  const activeGoals = (objectives || []).filter(o => o.status !== 'Completed');

  return (
    <div className="animate-fade-in" style={{ maxWidth: 800, margin: '0 auto', paddingTop: '8vh' }}>
      <div style={{ textAlign: 'center', marginBottom: 64 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: 'var(--foreground)', letterSpacing: -1, marginBottom: 32 }}>
          What would you like to achieve?
        </h1>
        <form onSubmit={handleStart} style={{ position: 'relative', maxWidth: 640, margin: '0 auto', marginBottom: 24 }}>
          <input className="input" style={{ width: '100%', padding: '24px 32px', fontSize: 20, borderRadius: 16, background: 'var(--surface)', border: '2px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.2)', color: 'var(--foreground)' }} placeholder="Type your goal here..." value={goalInput} onChange={e => setGoalInput(e.target.value)} disabled={launching} />
          <button type="submit" disabled={!goalInput.trim() || launching} style={{ position: 'absolute', right: 12, top: 12, bottom: 12, padding: '0 24px', background: launching ? 'var(--surface-3)' : 'var(--foreground)', color: launching ? 'var(--muted)' : 'var(--background)', border: 'none', borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: (!goalInput.trim() || launching) ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
            {launching ? 'Thinking...' : 'Start'}
          </button>
        </form>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setGoalInput(ex)} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--muted)', padding: '8px 16px', borderRadius: 99, fontSize: 13, cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.color = 'var(--foreground)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }} onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              {ex}
            </button>
          ))}
        </div>
      </div>
      {activeGoals.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 40 }}>
          <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--muted)', marginBottom: 24, textAlign: 'center' }}>Your Active Goals</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {activeGoals.map(goal => (
              <Link key={goal.id} href={`/objectives/${goal.id}`} style={{ textDecoration: 'none' }}>
                <div className="card card-interactive" style={{ padding: 32, borderRadius: 16, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <h3 style={{ fontSize: 24, fontWeight: 700, color: 'var(--foreground)' }}>{goal.title}</h3>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 28, fontWeight: 800, color: '#0078D4' }}>{goal.progressScore}%</div>
                      <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 500 }}>Progress</div>
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}><div className="progress-track" style={{ height: 8, background: 'var(--surface-2)' }}><div className="progress-fill" style={{ width: `${goal.progressScore}%`, background: '#0078D4', borderRadius: 99 }} /></div></div>
                  <div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: 'var(--muted)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 }}>Currently Working On</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--foreground)' }}><span style={{ color: '#4ade80' }}>✓</span> Resume Analysis</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--foreground)' }}><span style={{ color: '#4ade80' }}>✓</span> Market Research</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--muted)' }}><span style={{ color: '#fbbf24' }}>⏳</span> Finding opportunities</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--muted)' }}><span style={{ color: '#fbbf24' }}>⏳</span> Building roadmap</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
