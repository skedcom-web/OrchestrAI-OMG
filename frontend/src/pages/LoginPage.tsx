import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrchestraiLogo } from '../components/common/OrchestraiLogo';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { GuidedTour } from '../components/landing/GuidedTour';
import { useAuth } from '../contexts/AuthContext';
import { DEMO_PERSONAS } from '../services/mockData';
import type { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('');
  const [showDemoPersonas, setShowDemoPersonas] = useState(true);
  const [tourOpen, setTourOpen] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    login(email);
    navigate('/');
  };

  const handlePersonaClick = (role: UserRole) => {
    switchPersona(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8 bg-[var(--bg-app)] text-[var(--text-primary)] relative">
      {/* Floating Theme Switcher at Top Right */}
      <div className="absolute top-3 right-3 sm:top-6 sm:right-8 z-30">
        <ThemeSwitcher />
      </div>

      {/* Main Container matching Reference Layout */}
      <div className="w-full max-w-6xl rounded-3xl overflow-hidden shadow-2xl border border-[var(--border-color)] bg-[var(--bg-card)] grid grid-cols-1 lg:grid-cols-12 min-h-[640px] mt-10 sm:mt-0">
        
        {/* LEFT COLUMN: Gradient Brand & Value Proposition Panel */}
        <div className="lg:col-span-6 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-8 sm:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Ambient Orbital Glow */}
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-cyan-400/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

          {/* Top Badges */}
          <div className="flex items-center gap-2 relative z-10">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider border border-white/20">
              <span className="w-2 h-2 rounded-full bg-cyan-300 animate-pulse" />
              ORCHESTRAI
            </span>
            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-extrabold uppercase tracking-wider border border-white/15">
              MODEL GOVERNANCE
            </span>
          </div>

          {/* Core Headline & Mission */}
          <div className="my-8 flex flex-col gap-4 relative z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight text-white">
              Govern AI with Confidence
            </h1>
            <p className="text-base text-white/95 font-semibold">
              From AI idea to AI approval — and beyond.
            </p>
            <ul className="flex flex-col gap-1.5 max-w-lg">
              {[
                'Know what AI exists.',
                'Assess the risks.',
                'Validate the evidence.',
                'Make confident GO / Conditional GO / NO GO decisions.',
                'Continuously govern AI throughout its lifecycle.',
              ].map(line => (
                <li key={line} className="flex items-start gap-2.5">
                  <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-cyan-300 shrink-0" aria-hidden />
                  <span className="text-sm text-blue-100/95 leading-relaxed">{line}</span>
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setTourOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-white text-blue-700 text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
              >
                Start Guided Tour
              </button>
              <button
                type="button"
                onClick={() => handlePersonaClick('SUPER_ADMIN')}
                className="px-4 py-2.5 rounded-xl border border-white/40 text-white text-sm font-bold hover:bg-white/10 transition-all cursor-pointer"
              >
                Explore Demo
              </button>
            </div>
          </div>

          {/* Governance Stats Banner */}
          <div className="relative z-10 flex flex-col gap-4">
            <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                  GOVERNED ASSETS
                </span>
                <p className="text-2xl font-black text-white mt-0.5">9 Asset Classes</p>
                <span className="text-[10px] text-cyan-300 font-semibold">100% Visibility</span>
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-blue-200">
                  DECISION ENGINE
                </span>
                <p className="text-2xl font-black text-white mt-0.5">GO / NO GO</p>
                <span className="text-[10px] text-emerald-300 font-semibold">Gatekeeper Enforced</span>
              </div>
            </div>

            {/* Security Guarantee Box */}
            <div className="p-4 rounded-xl bg-black/20 backdrop-blur-md border border-white/10 text-xs text-blue-100 flex items-start gap-3">
              <span className="text-base shrink-0">🛡️</span>
              <div className="leading-relaxed text-[11px]">
                <strong className="text-white block font-bold">End-to-End Governance Security</strong>
                Every action is secured by Role-Based Access Control (RBAC) and recorded to a Day-1 compliance audit log.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Authentication & Demo Persona Switcher */}
        <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between bg-[var(--bg-card)]">
          <div className="flex flex-col gap-6">
            {/* Logo & Welcome Header */}
            <div className="flex flex-col items-center text-center gap-3">
              <OrchestraiLogo size="lg" showTagline={false} />
              <div className="mt-2">
                <h2 className="text-2xl font-extrabold text-[var(--text-primary)] tracking-tight">
                  Welcome to OrchestrAI OMG
                </h2>
                <p className="text-xs text-[var(--text-secondary)] mt-1">
                  Connect your corporate account to access your governance workspace.
                </p>
              </div>
            </div>

            {/* Email SSO Form */}
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4 mt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">
                  CORPORATE EMAIL ADDRESS
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                    ✉️
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="officer@enterprise-bank.com"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Continue</span>
                <span>→</span>
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-2 flex items-center justify-center">
              <div className="w-full border-t border-[var(--border-color)]" />
              <span className="absolute px-3 bg-[var(--bg-card)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                OR SEEDED DEMO ACCESS
              </span>
            </div>

            {/* Seeded Demo Access Cards Toggle */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)]">Select Demo Persona Role (1-Click)</span>
                <button
                  type="button"
                  onClick={() => setShowDemoPersonas(!showDemoPersonas)}
                  className="text-xs font-bold text-blue-500 hover:underline"
                >
                  {showDemoPersonas ? 'Hide Personas' : 'Show All 7 Roles'}
                </button>
              </div>

              {showDemoPersonas && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {DEMO_PERSONAS.map(p => (
                    <div
                      key={p.role}
                      onClick={() => handlePersonaClick(p.role)}
                      className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] hover:border-blue-500/50 hover:bg-[var(--bg-card-hover)] cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-lg shrink-0">{p.icon}</span>
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs font-bold text-[var(--text-primary)] truncate group-hover:text-blue-500 transition-colors">
                            {p.title}
                          </span>
                          <span className="text-[9px] text-[var(--text-muted)] truncate">{p.name}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-blue-500 group-hover:translate-x-1 transition-transform">
                        Login →
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Disclaimer matching Reference Layout */}
          <div className="pt-6 border-t border-[var(--border-color)] text-center text-[10px] text-[var(--text-muted)] leading-relaxed">
            By continuing, you connect to the enterprise governance engine and enable secure RBAC role execution.
          </div>
        </div>

      </div>

      {/* Pre-authentication tour: explains the flow without deep-linking into
          modules the visitor cannot reach until they sign in. */}
      <GuidedTour open={tourOpen} onClose={() => setTourOpen(false)} allowNavigation={false} />
    </div>
  );
};
