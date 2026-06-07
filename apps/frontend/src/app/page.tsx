'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function HomePage() {
  const [jobUrl, setJobUrl] = useState('');
  const [profile, setProfile] = useState('');
  const [experience, setExperience] = useState('');
  const [fileName, setFileName] = useState('');
  const [isHovering, setIsHovering] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden bg-[#0A0A0A]">
      
      {/* Animated Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600/20 blur-[120px] animate-float" style={{ animationDelay: '0s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-purple-600/20 blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Top Auth Nav */}
      <div className="absolute top-0 w-full p-6 flex justify-end gap-4 z-20">
        <Link href="/signin" className="px-6 py-2 rounded-full text-slate-300 hover:text-white font-medium transition-colors">
          Sign In
        </Link>
        <Link href="/signup" className="px-6 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-medium backdrop-blur-md transition-all">
          Sign Up
        </Link>
      </div>

      <div className="w-full max-w-xl z-10 animate-fade-in mt-16">
        
        {/* Header section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 animate-gradient pb-2">
            AjaxApply AI
          </h1>
          <p className="text-lg text-slate-400">
            Tell us where you want to work. We'll handle the rest.
          </p>
        </div>

        {/* Glassmorphism Card */}
        <div className="glass rounded-2xl p-8 shadow-2xl border border-white/10 relative overflow-hidden">
          
          <div className="flex flex-col gap-6">
            
            {/* Target Website */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Target Job URL</label>
              <input 
                type="url" 
                placeholder="https://jobs.netflix.com/..."
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={jobUrl}
                onChange={e => setJobUrl(e.target.value)}
              />
            </div>

            {/* Preferred Profile */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Preferred Role</label>
              <input 
                type="text" 
                placeholder="e.g. Senior Frontend Engineer"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={profile}
                onChange={e => setProfile(e.target.value)}
              />
            </div>

            {/* Experience */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Years of Experience</label>
              <input 
                type="number" 
                min="0"
                placeholder="e.g. 5"
                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                value={experience}
                onChange={e => setExperience(e.target.value)}
              />
            </div>

            {/* File Upload Zone */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Your Resume</label>
              <div 
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${isHovering ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5 hover:border-white/40'}`}
                onDragOver={e => { e.preventDefault(); setIsHovering(true); }}
                onDragLeave={() => setIsHovering(false)}
                onDrop={e => {
                  e.preventDefault();
                  setIsHovering(false);
                  if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
                    setFileName(e.dataTransfer.files[0].name);
                  }
                }}
              >
                <input 
                  type="file" 
                  accept=".pdf,.docx" 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-colors ${isHovering || fileName ? 'text-blue-400' : 'text-slate-500'}`}>
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M12 18v-6"></path>
                    <path d="m9 15 3-3 3 3"></path>
                  </svg>
                  <p className="text-slate-300 font-medium">
                    {fileName ? (
                      <span className="text-blue-400">{fileName}</span>
                    ) : (
                      <>Drag & drop PDF here, or <span className="text-blue-400">click to browse</span></>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all animate-glow transform hover:-translate-y-1"
            >
              Deploy Agent
            </button>

          </div>
        </div>
        
      </div>
    </main>
  );
}
