import React from 'react';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';

export const Topbar: React.FC = () => {
  return (
    <header className="h-16 px-8 sticky top-0 z-10 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--bg-topbar)] backdrop-blur-md transition-all">
      {/* Search / Context Header */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="font-semibold text-[var(--text-primary)]">Enterprise Banking Tenant</span>
          <span className="text-[var(--text-muted)]">• Production Scope</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-5">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Audit Status */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--text-muted)]">
          <span className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold border border-emerald-500/20">
            Audit Mode: Active
          </span>
        </div>

        {/* User Profile Capsule */}
        <div className="flex items-center gap-3 pl-3 border-l border-[var(--border-color)]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-red-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
            SJ
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-bold text-[var(--text-primary)] leading-tight">
              Sarah Jenkins
            </span>
            <span className="text-[10px] font-semibold text-[var(--accent-primary)]">
              Super Admin
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
