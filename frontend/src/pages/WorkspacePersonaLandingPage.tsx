import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { DEMO_PERSONAS } from '../services/mockData';
import type { UserRole } from '../types';

/** Release 18.1 Patch, Module 1 — Workspace Persona Landing. The 6 evaluation lenses only; Super Admin is a platform role, not an evaluation perspective. */
const WORKSPACE_PERSONA_ROLES: UserRole[] = ['GOVERNANCE_ADMIN', 'RISK_OFFICER', 'BUSINESS_OWNER', 'VALIDATOR', 'AUDITOR', 'VIEWER'];

export const WorkspacePersonaLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentWorkspace, currentWorkspaceUser, currentPersona, switchPersona } = useAuth();

  if (!currentWorkspace || !currentWorkspaceUser) {
    return (
      <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
        No active workspace session. Sign in through Workspace Login first.
      </Card>
    );
  }

  const handleSelect = (role: UserRole) => {
    switchPersona(role);
    navigate('/workspace-dashboard');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Choose Your Governance Perspective</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Welcome to {currentWorkspace.name}, {currentWorkspaceUser.name}. Pick the perspective you want to evaluate
          OMG from first — you can switch to any of the others at any time from the Topbar Persona Switcher.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {WORKSPACE_PERSONA_ROLES.map(role => {
          const persona = DEMO_PERSONAS.find(p => p.role === role);
          if (!persona) return null;
          const isCurrent = currentPersona?.role === role;
          return (
            <Card
              key={role}
              onClick={() => handleSelect(role)}
              glowOnHover
              className={`!p-5 flex flex-col gap-2 ${isCurrent ? 'border-[var(--accent-border)]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-2xl">{persona.icon}</span>
                {isCurrent && <span className="text-[9.5px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">Default</span>}
              </div>
              <h3 className="text-sm font-bold text-[var(--text-primary)]">{persona.title}</h3>
              <p className="text-[11.5px] text-[var(--text-secondary)] leading-relaxed">{persona.description}</p>
              <span className="text-[11px] font-bold text-[var(--accent-primary)] mt-auto">Evaluate as {persona.title} →</span>
            </Card>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--text-muted)] text-center">
        No RBAC redesign — this is the same 6-persona switcher used everywhere else in OMG, just surfaced once up front.
      </p>
    </div>
  );
};
