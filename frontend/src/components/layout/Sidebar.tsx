import React from 'react';
import { NavLink } from 'react-router-dom';
import { OrchestraiLogo } from '../common/OrchestraiLogo';
import { useAuth } from '../../contexts/AuthContext';

export const Sidebar: React.FC = () => {
  const { hasPermission, currentPersona } = useAuth();

  const allNavItems = [
    { path: '/', label: 'OMG Home', icon: '🏠', badge: 'Core' },
    { path: '/dashboard', label: 'Executive Dashboard', icon: '📊', badge: 'Live' },
    { path: '/assets', label: 'AI Asset Registry', icon: '🗂️', badge: 'Inventory' },
    { path: '/ownership', label: 'Ownership Matrix', icon: '👥', badge: 'RACIS' },
    { path: '/risk', label: 'Risk Center', icon: '⚡', badge: 'Phase 2' },
    { path: '/validation', label: 'Validation Center', icon: '🧪', badge: 'Phase 3' },
    { path: '/evidence', label: 'Evidence Center', icon: '📄', badge: 'ODF v1' },
    { path: '/review-workbench', label: 'Review Workbench', icon: '🧰', badge: 'Reviewer' },
    { path: '/findings', label: 'Findings Tracker', icon: '⚠️', badge: 'Defects' },
    { path: '/decision-intelligence', label: 'Decision Intelligence', icon: '⚖️', badge: 'Phase 4' },
    { path: '/governance-blockers', label: 'Governance Blockers', icon: '🧱', badge: 'Blockers' },
    { path: '/decision-workbench-v4', label: 'Decision Authority', icon: '🖋️', badge: 'Workbench' },
    { path: '/compliance-center', label: 'Compliance Center', icon: '🏛️', badge: 'Phase 5' },
    { path: '/regulatory-library', label: 'Regulatory Library', icon: '📚', badge: 'RBI' },
    { path: '/compliance-assessment', label: 'Compliance Tool', icon: '📋', badge: 'Audit' },
    { path: '/compliance-findings', label: 'Compliance Gaps', icon: '🚨', badge: 'Gaps' },
    { path: '/compliance-dashboard', label: 'Compliance Dashboard', icon: '📈', badge: 'RBI Score' },
    { path: '/operations-center', label: 'Operations Center', icon: '🎛️', badge: 'Phase 6' },
    { path: '/kill-switch', label: 'Kill Switch Console', icon: '🚨', badge: 'Emergency' },
    { path: '/override-center', label: 'Human Override', icon: '👤', badge: 'Intervention' },
    { path: '/incidents', label: 'Incident Management', icon: '⚡', badge: 'Anomalies' },
    { path: '/operations-dashboard', label: 'Operations Dashboard', icon: '📉', badge: 'Runtime' },
    { path: '/retirement', label: 'Asset Retirement', icon: '📦', badge: 'Archive' },
    { path: '/governance-timeline', label: 'Governance Timeline', icon: '⏱️', badge: 'Lifecycle' },
    { path: '/users', label: 'User Management', icon: '🔐', badge: 'RBAC' },
    { path: '/audit-logs', label: 'Audit Logs', icon: '📜', badge: 'Day 1' },
  ];

  const visibleNavItems = allNavItems.filter(item => hasPermission(item.path));

  const futureModules = [
    { label: 'Continuous Monitoring', icon: '👁️' },
  ];

  return (
    <aside className="w-72 shrink-0 h-screen sticky top-0 flex flex-col justify-between p-5 border-r border-[var(--border-color)] bg-[var(--bg-sidebar)] transition-all z-20 overflow-y-auto">
      <div>
        {/* Brand Header */}
        <div className="pb-6 mb-6 border-b border-[var(--border-color)]">
          <OrchestraiLogo size="md" showTagline={true} />
        </div>

        {/* Active Navigation */}
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              Authorized Modules
            </p>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
              {currentPersona?.title || 'SUPER_ADMIN'}
            </span>
          </div>

          {visibleNavItems.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--accent-primary)] text-white shadow-md font-semibold'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/20 text-white/90">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </div>

        {/* Future Modules */}
        <div className="mt-8 flex flex-col gap-1">
          <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
            Future Enterprise Modules
          </p>
          {futureModules.map(item => (
            <div
              key={item.label}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-[var(--text-muted)] opacity-60 cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </div>
              <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-color)]">
                Phase 7
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer System Status Card */}
      <div className="mt-6 p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[var(--text-secondary)]">Governance Engine</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Phase 6 Engine
          </span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] mt-1">
          Active Role: {currentPersona?.title || 'Super Admin'}
        </p>
      </div>
    </aside>
  );
};
