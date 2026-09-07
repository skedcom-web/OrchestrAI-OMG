import React, { useEffect, useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { OrchestraiLogo } from '../common/OrchestraiLogo';
import { useAuth } from '../../contexts/AuthContext';
import { useExperience } from '../../contexts/ExperienceContext';
import {
  COMMAND_CENTER,
  EXECUTIVE_DASHBOARD,
  EXECUTIVE_NAV,
  FUTURE_MODULES,
  NAV_DOMAINS,
  OMG_OVERVIEW,
} from '../../config/navigation';
import type { NavDomain, NavModule } from '../../config/navigation';

/** A single Level 3 navigation row. Active state drives the gradient rail in globals.css. */
const NavRow: React.FC<{ module: NavModule }> = ({ module }) => {
  const location = useLocation();
  const isActive = location.pathname === module.path;

  return (
    <NavLink
      to={module.path}
      title={module.description}
      data-active={isActive}
      className={`nav-item flex items-center justify-between gap-2 rounded-lg pl-3 pr-2.5 py-2 text-[13px] ${
        isActive
          ? ''
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
      }`}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span className="text-[13px] w-4 text-center shrink-0 opacity-90" aria-hidden>
          {module.icon}
        </span>
        <span className="truncate font-medium">{module.label}</span>
      </span>
      {module.badge && (
        <span
          data-noglass
          className={`shrink-0 text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
            isActive
              ? 'bg-[var(--accent-primary)] text-white'
              : 'bg-[var(--bg-badge)] text-[var(--text-muted)] border border-[var(--border-subtle)]'
          }`}
        >
          {module.badge}
        </span>
      )}
    </NavLink>
  );
};

/** Icon-only row for the collapsed rail, with a hover/focus tooltip carrying the full label. */
const RailIcon: React.FC<{
  icon: string;
  label: string;
  to?: string;
  isActive?: boolean;
  onClick?: () => void;
}> = ({ icon, label, to, isActive, onClick }) => {
  const inner = (
    <>
      <span aria-hidden>{icon}</span>
      <span className="rail-tip" role="tooltip">
        {label}
      </span>
    </>
  );
  const className = `rail-item relative w-10 h-10 grid place-items-center rounded-lg text-[15px] transition-colors cursor-pointer ${
    isActive
      ? 'bg-[var(--nav-active-bg)] text-[var(--nav-active-text)]'
      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
  }`;

  if (to) {
    return (
      <NavLink to={to} aria-label={label} className={className}>
        {inner}
      </NavLink>
    );
  }
  return (
    <button type="button" aria-label={label} onClick={onClick} className={className}>
      {inner}
    </button>
  );
};

interface FilteredDomain extends Omit<NavDomain, 'groups' | 'modules'> {
  groups: { label: string; modules: NavModule[] }[];
  moduleCount: number;
}

export const Sidebar: React.FC = () => {
  const { hasPermission, currentPersona } = useAuth();
  const {
    isExecutive,
    openDomainId,
    setOpenDomainId,
    toggleDomain,
    sidebarCollapsed,
    setSidebarCollapsed,
    mobileNavOpen,
    setMobileNavOpen,
  } = useExperience();
  const location = useLocation();
  const [filter, setFilter] = useState('');

  // Close the mobile drawer whenever the route changes or Escape is pressed.
  useEffect(() => {
    setMobileNavOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the pathname should retrigger this
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileNavOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileNavOpen, setMobileNavOpen]);

  const query = filter.trim().toLowerCase();

  const matches = (m: NavModule) =>
    !query ||
    m.label.toLowerCase().includes(query) ||
    m.description.toLowerCase().includes(query) ||
    (m.keywords || []).some(k => k.includes(query));

  const domains = useMemo<FilteredDomain[]>(
    () =>
      NAV_DOMAINS.map(d => {
        const groups = d.groups
          .map(group => ({
            label: group.label,
            modules: group.modules.filter(m => hasPermission(m.path) && matches(m)),
          }))
          .filter(group => group.modules.length > 0);
        return { ...d, groups, moduleCount: groups.reduce((n, g) => n + g.modules.length, 0) };
      }).filter(d => d.groups.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasPermission, query, currentPersona]
  );

  const executiveGroups = useMemo(
    () =>
      EXECUTIVE_NAV.map(group => ({
        ...group,
        modules: group.modules.filter(m => hasPermission(m.path) && matches(m)),
      })).filter(g => g.modules.length > 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasPermission, query, currentPersona]
  );

  const totalAuthorized = domains.reduce((n, d) => n + d.moduleCount, 0);
  const collapsed = sidebarCollapsed && !isExecutive;

  const openDomainAndExpand = (domainId: string) => {
    setSidebarCollapsed(false);
    setOpenDomainId(domainId);
  };

  return (
    <>
      {/* Mobile backdrop — dismisses the drawer, never shown at lg and above */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          role="presentation"
        />
      )}

      <aside
        data-open={mobileNavOpen}
        data-collapsed={collapsed}
        className={`sidebar-rail mobile-drawer w-[17.5rem] shrink-0 h-screen fixed inset-y-0 left-0 top-0 flex flex-col border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] z-40 lg:sticky lg:z-20 ${
          mobileNavOpen ? 'shadow-[var(--shadow-lg)]' : ''
        }`}
      >
        {/* ============ COLLAPSED ICON RAIL (desktop only) ============ */}
        <div className={`flex-col items-center h-full py-4 hidden ${collapsed ? 'lg:flex' : ''}`}>
          <div className="mb-4">
            <OrchestraiLogo size="sm" iconOnly />
          </div>

          <button
            type="button"
            onClick={() => setSidebarCollapsed(false)}
            aria-label="Expand navigation"
            className="rail-item relative w-10 h-10 grid place-items-center rounded-lg mb-3 text-[13px] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
          >
            <span aria-hidden>»</span>
            <span className="rail-tip" role="tooltip">Expand sidebar</span>
          </button>

          <div className="flex flex-col gap-1.5 pt-2 border-t border-[var(--border-subtle)] w-full items-center">
            {[OMG_OVERVIEW, COMMAND_CENTER, EXECUTIVE_DASHBOARD]
              .filter(m => hasPermission(m.path))
              .map(m => (
                <RailIcon
                  key={m.path}
                  icon={m.icon}
                  label={m.label}
                  to={m.path}
                  isActive={location.pathname === m.path}
                />
              ))}
          </div>

          <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 pt-3 mt-2 border-t border-[var(--border-subtle)] w-full items-center">
            {domains.map(d => (
              <RailIcon
                key={d.id}
                icon={d.icon}
                label={d.label}
                isActive={openDomainId === d.id}
                onClick={() => openDomainAndExpand(d.id)}
              />
            ))}
          </div>
        </div>

        {/* ============ EXPANDED SIDEBAR ============ */}
        <div className={`flex-col h-full min-h-0 flex ${collapsed ? 'lg:hidden' : ''}`}>
          {/* Brand */}
          <div className="px-5 pt-5 pb-4 border-b border-[var(--border-subtle)] flex items-start justify-between gap-2">
            <OrchestraiLogo size="md" showTagline={true} />
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => setSidebarCollapsed(true)}
                className="hidden lg:grid shrink-0 w-8 h-8 place-items-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                aria-label="Collapse navigation"
                title="Collapse sidebar"
              >
                «
              </button>
              <button
                onClick={() => setMobileNavOpen(false)}
                className="lg:hidden shrink-0 w-8 h-8 grid place-items-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                aria-label="Close navigation"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Experience context strip */}
          <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                {isExecutive ? 'Executive Mode' : 'Governance Mode'}
              </p>
              <p className="text-[11px] font-bold text-[var(--text-primary)] truncate">
                {currentPersona?.title || 'Super Admin'}
              </p>
            </div>
            <span
              data-noglass
              className="shrink-0 text-[9px] font-extrabold px-1.5 py-1 rounded-md bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]"
            >
              {isExecutive ? 'EXEC' : `${totalAuthorized} MODULES`}
            </span>
          </div>

          {/* Module filter */}
          <div className="px-4 py-3">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-muted)] pointer-events-none">
                ⌕
              </span>
              <input
                value={filter}
                onChange={e => setFilter(e.target.value)}
                placeholder="Filter modules"
                aria-label="Filter governance modules"
                className="w-full pl-7 pr-2 py-1.5 rounded-lg text-[12px] bg-[var(--bg-input)] border border-[var(--border-color)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--border-focus)] transition-colors"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-1">
            {/* Always-present command surfaces */}
            <div className="flex flex-col gap-0.5 mb-3">
              {[OMG_OVERVIEW, COMMAND_CENTER, EXECUTIVE_DASHBOARD]
                .filter(m => hasPermission(m.path) && matches(m))
                .map(m => (
                  <NavRow key={m.path} module={m} />
                ))}
            </div>

            {isExecutive ? (
              executiveGroups.map(group => (
                <div key={group.label} className="mb-2">
                  <p className="px-3 mb-1.5 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                    {group.label}
                  </p>
                  <div className="flex flex-col gap-0.5">
                    {group.modules
                      .filter(
                        m =>
                          m.path !== OMG_OVERVIEW.path &&
                          m.path !== COMMAND_CENTER.path &&
                          m.path !== EXECUTIVE_DASHBOARD.path
                      )
                      .map(m => (
                        <NavRow key={m.path} module={m} />
                      ))}
                  </div>
                </div>
              ))
            ) : (
              // Level 1 — workspaces. Accordion: only one open at a time, unless a search query forces all matches open.
              domains.map(d => {
                const isOpen = query ? true : openDomainId === d.id;
                return (
                  <div key={d.id} className="mb-1.5">
                    <button
                      onClick={() => toggleDomain(d.id)}
                      title={d.question}
                      className="w-full group flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer"
                      aria-expanded={isOpen}
                    >
                      <span
                        className="nav-group-caret text-[9px] text-[var(--text-muted)]"
                        data-open={isOpen}
                        aria-hidden
                      >
                        ▸
                      </span>
                      <span className="text-[12px]" aria-hidden>
                        {d.icon}
                      </span>
                      <span className="flex-1 text-left text-[10px] font-extrabold uppercase tracking-[0.11em] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] truncate">
                        {d.label}
                      </span>
                      <span className="tnum text-[9px] font-bold text-[var(--text-muted)]">
                        {d.moduleCount}
                      </span>
                    </button>

                    {isOpen && (
                      <div className="mt-0.5 ml-2 pl-2 border-l border-[var(--border-subtle)] flex flex-col gap-2">
                        {d.groups.map(group => (
                          <div key={group.label} className="flex flex-col gap-0.5">
                            <p className="px-2 pt-1 text-[9.5px] font-bold uppercase tracking-[0.09em] text-[var(--text-muted)] opacity-80">
                              {group.label}
                            </p>
                            {group.modules.map(m => (
                              <NavRow key={m.path} module={m} />
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Future governance architecture — routed and ready, not yet built */}
            {!isExecutive && !query && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <p className="px-2 mb-2 text-[9px] font-extrabold uppercase tracking-[0.14em] text-[var(--text-muted)]">
                  Governance Roadmap
                </p>
                <div className="flex flex-col gap-0.5">
                  {FUTURE_MODULES.map(m => (
                    <NavLink
                      key={m.path}
                      to={m.path}
                      title={m.description}
                      className={({ isActive }) =>
                        `flex items-center justify-between gap-2 rounded-lg pl-3 pr-2 py-[0.45rem] text-[12px] transition-colors ${
                          isActive
                            ? 'bg-[var(--bg-card-hover)] text-[var(--text-primary)]'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                        }`
                      }
                    >
                      <span className="flex items-center gap-2.5 min-w-0">
                        <span className="w-4 text-center text-[12px] opacity-60" aria-hidden>
                          {m.icon}
                        </span>
                        <span className="truncate">{m.label}</span>
                      </span>
                      <span
                        data-noglass
                        className="shrink-0 text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-muted)]"
                      >
                        {m.phase}
                      </span>
                    </NavLink>
                  ))}
                </div>
              </div>
            )}

            {domains.length === 0 && executiveGroups.length === 0 && (
              <p className="px-3 py-6 text-[12px] text-[var(--text-muted)] text-center">
                No modules match “{filter}”.
              </p>
            )}
          </nav>

          {/* Engine status */}
          <div className="px-4 pb-4 pt-3 border-t border-[var(--border-subtle)]">
            <div
              data-noglass
              className="rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] px-3.5 py-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-[var(--text-secondary)]">
                  Governance Engine
                </span>
                <span
                  className="flex items-center gap-1.5 text-[10px] font-extrabold"
                  style={{ color: 'var(--status-success)' }}
                >
                  <span className="status-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">
                Enterprise Governance Command Center
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
