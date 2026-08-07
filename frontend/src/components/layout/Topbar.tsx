import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_PERSONAS } from '../../services/mockData';
import type { UserRole } from '../../types';

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, currentPersona, switchPersona, logout } = useAuth();

  return (
    <header className="h-16 px-8 sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-topbar)] backdrop-blur-md transition-all">
      {/* Search / Context Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-[var(--text-primary)]">Enterprise Banking Tenant</span>
          <span className="text-[var(--text-muted)]">• RBAC Engine</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Quick Persona Switcher Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase text-[var(--text-muted)] hidden md:inline">Persona:</span>
          <select
            value={currentUser?.role || 'SUPER_ADMIN'}
            onChange={e => switchPersona(e.target.value as UserRole)}
            className="px-2.5 py-1 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs font-bold text-[var(--accent-primary)] focus:outline-none cursor-pointer"
          >
            {DEMO_PERSONAS.map(p => (
              <option key={p.role} value={p.role} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                {p.icon} {p.title} ({p.role})
              </option>
            ))}
          </select>
        </div>

        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* User Profile Capsule */}
        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'SJ'}
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-[var(--text-primary)] leading-tight">
              {currentUser?.name || 'Sarah Jenkins'}
            </span>
            <span className="text-[10px] font-extrabold text-[var(--accent-primary)]">
              {currentPersona?.title || 'Super Admin'}
            </span>
          </div>

          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-500 text-xs transition-colors"
            title="Log Out"
          >
            🚪
          </button>
        </div>
      </div>
    </header>
  );
};
