import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrchestraiLogo } from '../components/common/OrchestraiLogo';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ThemeSwitcher } from '../components/ui/ThemeSwitcher';
import { useAuth } from '../contexts/AuthContext';
import { DEMO_PERSONAS } from '../services/mockData';
import type { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchPersona } = useAuth();
  const [email, setEmail] = useState('sarah.jenkins@enterprise-bank.com');
  const [password, setPassword] = useState('••••••••••••');

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(email);
    navigate('/');
  };

  const handlePersonaClick = (role: UserRole) => {
    switchPersona(role);
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[var(--bg-app)] text-[var(--text-primary)] relative">
      {/* Topbar Controls */}
      <div className="absolute top-6 right-8 flex items-center gap-4">
        <ThemeSwitcher />
      </div>

      <div className="w-full max-w-5xl flex flex-col gap-8 my-auto py-12">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center gap-3">
          <OrchestraiLogo size="lg" showTagline={true} />
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20 mt-2">
            <span>🔐 Phase 2.5 — Governance Identity & RBAC Foundation</span>
          </div>
        </div>

        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Email Login Form */}
          <Card className="lg:col-span-5 flex flex-col gap-6 !p-8 shadow-2xl">
            <div>
              <h2 className="text-xl font-extrabold text-[var(--text-primary)]">Enterprise Single Sign-On</h2>
              <p className="text-xs text-[var(--text-secondary)] mt-1">Authenticate with your corporate credentials</p>
            </div>

            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <Input
                label="Corporate Email"
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="officer@enterprise-bank.com"
              />
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
              />

              <Button type="submit" size="lg" className="w-full mt-2">
                Sign In to Command Center
              </Button>
            </form>

            <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] text-center">
              Secured with Firebase Auth & Role-Based Access Control
            </div>
          </Card>

          {/* Right: 7 Seeded Demo Access Cards */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Seeded Demo Access Personas</h3>
              <span className="text-xs font-semibold text-[var(--accent-primary)]">1-Click Switch</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {DEMO_PERSONAS.map(p => (
                <div
                  key={p.role}
                  onClick={() => handlePersonaClick(p.role)}
                  className="p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card-hover)] cursor-pointer transition-all flex flex-col gap-2 group shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                        {p.title}
                      </span>
                    </div>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                      {p.role}
                    </span>
                  </div>

                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed line-clamp-2">
                    {p.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border-color)] text-[10px] text-[var(--text-muted)]">
                    <span>{p.name}</span>
                    <span className="font-bold text-[var(--accent-primary)] group-hover:translate-x-1 transition-transform">
                      Login →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
