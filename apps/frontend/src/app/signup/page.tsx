'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('http://localhost:8000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Sign up failed');
      
      setMessage('Account created successfully! You can now sign in.');
      setName('');
      setEmail('');
      setPassword('');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#0A0A0A]">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-float"></div>
      
      <div className="w-full max-w-md z-10 animate-fade-in">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
            AjaxApply AI
          </Link>
          <h2 className="text-3xl font-bold text-white mt-6 mb-2">Create an account</h2>
          <p className="text-slate-400">Join the autonomous job application revolution.</p>
        </div>

        <form onSubmit={handleSignUp} className="glass rounded-2xl p-8 shadow-2xl border border-white/10 flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Full Name</label>
            <input 
              type="text" required
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              value={name} onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Email Address</label>
            <input 
              type="email" required
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-300">Password</label>
            <input 
              type="password" required
              className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500/50 outline-none"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button disabled={loading} type="submit" className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition-all">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {message && (
            <div className={`mt-2 p-3 rounded-lg text-sm ${message.startsWith('Error') ? 'bg-red-500/20 text-red-300 border border-red-500/30' : 'bg-green-500/20 text-green-300 border border-green-500/30'}`}>
              {message}
            </div>
          )}

          <p className="text-center text-sm text-slate-400 mt-2">
            Already have an account? <Link href="/signin" className="text-blue-400 hover:text-blue-300">Sign in</Link>
          </p>
        </form>
      </div>
    </main>
  );
}
