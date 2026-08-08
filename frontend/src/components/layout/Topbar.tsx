import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ThemeSwitcher } from '../ui/ThemeSwitcher';
import { CommandPalette } from './CommandPalette';
import { useAuth } from '../../contexts/AuthContext';
import { useExperience } from '../../contexts/ExperienceContext';
import { DEMO_PERSONAS } from '../../services/mockData';
import { findModule } from '../../config/navigation';
import { getGovernanceAlerts } from '../../services/storageService';
import type { UserRole } from '../../types';

const ModeToggle: React.FC = () => {
  const { mode, setMode } = useExperience();

  const options: { value: 'executive' | 'governance'; label: string; icon: string; hint: string }[] = [
    { value: 'executive', label: 'Executive', icon: '◆', hint: 'Board-level focused surface' },
    { value: 'governance', label: 'Governance', icon: '⬢', hint: 'Full governance depth' },
  ];

  return (
    <div
      data-noglass
      className="flex items-center p-0.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]"
      role="group"
      aria-label="Experience mode"
    >
      {options.map(opt => {
        const active = mode === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setMode(opt.value)}
            title={opt.hint}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all duration-200 cursor-pointer ${
              active
                ? 'bg-[var(--accent-primary)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            }`}
          >
            <span aria-hidden>{opt.icon}</span>
            <span className="hidden lg:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export const Topbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, currentPersona, switchPersona, logout } = useAuth();
  const { setMobileNavOpen } = useExperience();
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const located = findModule(location.pathname);
  const alertCount = getGovernanceAlerts().length;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen(o => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const initials = currentUser?.name
    ? currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2)
    : 'SJ';

  return (
    <>
      <header className="h-16 px-3 sm:px-6 sticky top-0 z-30 flex items-center justify-between gap-2 sm:gap-4 border-b border-[var(--border-color)] bg-[var(--bg-topbar)] backdrop-blur-xl">
        {/* Breadcrumb trail */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Mobile navigation toggle */}
          <button
            onClick={() => setMobileNavOpen(true)}
            data-noglass
            className="lg:hidden shrink-0 w-9 h-9 grid place-items-center rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] transition-colors cursor-pointer"
            aria-label="Open navigation menu"
          >
            <span aria-hidden>☰</span>
          </button>

          <nav aria-label="Breadcrumb" className="flex items-center gap-2 min-w-0">
            <Link
              to="/"
              className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)] hover:text-[var(--accent-primary)] transition-colors shrink-0"
            >
              OMG
            </Link>
            {located?.domain && (
              <span className="hidden sm:flex items-center gap-2 min-w-0">
                <span className="text-[var(--text-muted)] text-[10px]" aria-hidden>
                  /
                </span>
                <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-secondary)] truncate">
                  {located.domain.label}
                </span>
              </span>
            )}
            {located?.module && (
              <span className="flex items-center gap-2 min-w-0">
                <span className="text-[var(--text-muted)] text-[10px]" aria-hidden>
                  /
                </span>
                <span className="text-[13px] font-bold text-[var(--text-primary)] truncate max-w-[8rem] sm:max-w-none">
                  {located.module.label}
                </span>
              </span>
            )}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Command palette trigger — full pill on desktop, icon-only on mobile */}
          <button
            onClick={() => setPaletteOpen(true)}
            data-noglass
            className="hidden md:flex items-center gap-2 pl-2.5 pr-2 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[11px] text-[var(--text-muted)] hover:border-[var(--accent-border)] hover:text-[var(--text-secondary)] transition-colors cursor-pointer"
            aria-label="Search governance modules"
          >
            <span aria-hidden>⌕</span>
            <span className="font-medium">Search modules</span>
            <kbd className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-subtle)]">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={() => setPaletteOpen(true)}
            data-noglass
            className="md:hidden w-9 h-9 grid place-items-center rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] transition-colors cursor-pointer"
            aria-label="Search governance modules"
          >
            <span aria-hidden>⌕</span>
          </button>

          {/* Governance alerts */}
          <button
            onClick={() => navigate('/governance-alerts')}
            title={`${alertCount} active governance alerts`}
            className="relative w-9 h-9 grid place-items-center rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm hover:border-[var(--accent-border)] transition-colors cursor-pointer"
            data-noglass
            aria-label={`Governance alerts: ${alertCount} active`}
          >
            <span aria-hidden>🔔</span>
            {alertCount > 0 && (
              <span
                className="tnum absolute -top-1 -right-1 min-w-[1.05rem] h-[1.05rem] px-1 grid place-items-center rounded-full text-[9px] font-extrabold text-white"
                style={{ background: 'var(--status-danger)' }}
              >
                {alertCount > 99 ? '99+' : alertCount}
              </span>
            )}
          </button>

          <div className="hidden md:block">
            <ModeToggle />
          </div>
          <ThemeSwitcher />

          {/* Identity */}
          <div className="relative pl-1.5 sm:pl-2.5 ml-0 sm:ml-0.5 sm:border-l border-[var(--border-color)]">
            <button
              onClick={() => setMenuOpen(o => !o)}
              className="flex items-center gap-2.5 cursor-pointer group"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
            >
              <span
                className="w-9 h-9 rounded-xl grid place-items-center text-white font-bold text-[11px] shadow-md shrink-0"
                style={{ background: 'var(--grad-brand)' }}
                aria-hidden
              >
                {initials}
              </span>
              <span className="hidden sm:flex flex-col text-left leading-tight">
                <span className="text-[12px] font-bold text-[var(--text-primary)]">
                  {currentUser?.name || 'Sarah Jenkins'}
                </span>
                <span className="text-[10px] font-extrabold text-[var(--accent-primary)]">
                  {currentPersona?.title || 'Super Admin'}
                </span>
              </span>
              <span className="hidden sm:inline text-[9px] text-[var(--text-muted)]" aria-hidden>
                ▼
              </span>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                  role="presentation"
                />
                <div
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-72 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-[var(--border-color)] bg-[var(--bg-modal)] shadow-[var(--shadow-lg)] p-4 animate-rise-in"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Signed in as
                  </p>
                  <p className="text-sm font-bold text-[var(--text-primary)] mt-1">
                    {currentUser?.name}
                  </p>
                  <p className="text-[11px] text-[var(--text-secondary)] break-all">{currentUser?.email}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                    {currentUser?.department}
                  </p>

                  <div className="my-3.5 border-t border-[var(--border-subtle)]" />

                  <label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                    Governance Persona
                  </label>
                  <select
                    value={currentUser?.role || 'SUPER_ADMIN'}
                    onChange={e => switchPersona(e.target.value as UserRole)}
                    className="mt-1.5 w-full px-2.5 py-2 rounded-lg bg-[var(--bg-input)] border border-[var(--border-color)] text-[12px] font-semibold text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-focus)] cursor-pointer"
                  >
                    {DEMO_PERSONAS.map(p => (
                      <option key={p.role} value={p.role}>
                        {p.icon} {p.title}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-[var(--text-muted)] mt-2 leading-relaxed">
                    {currentPersona?.description}
                  </p>

                  {/* Mode toggle relocated here on mobile, where the topbar hides it */}
                  <div className="md:hidden mt-3.5 pt-3.5 border-t border-[var(--border-subtle)]">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                      Experience Mode
                    </label>
                    <div className="mt-1.5">
                      <ModeToggle />
                    </div>
                  </div>

                  <div className="my-3.5 border-t border-[var(--border-subtle)]" />

                  <button
                    onClick={() => {
                      logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-semibold text-[var(--status-danger)] hover:bg-[var(--status-danger-bg)] transition-colors cursor-pointer"
                  >
                    Sign out of OMG
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
    </>
  );
};
