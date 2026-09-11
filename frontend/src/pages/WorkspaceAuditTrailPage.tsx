import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getWorkspaceAuditTrail } from '../services/storageService';

const ACTION_TONE: Record<string, string> = {
  'Created Asset': 'var(--accent-primary)',
  'Uploaded Evidence': 'var(--accent-primary)',
  'Created Finding': 'var(--status-warning)',
  'Triggered Reassessment': 'var(--status-warning)',
  'Exported Governance Pack': 'var(--status-success)',
  'Changed Persona': 'var(--text-muted)',
  'Cloned Workspace': 'var(--status-success)',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border shrink-0"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const WorkspaceAuditTrailPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const [entries] = useState(() => (currentWorkspace ? getWorkspaceAuditTrail(currentWorkspace.id) : []));

  if (!currentWorkspace) {
    return (
      <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
        No active workspace session. Sign in through Workspace Login first.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Workspace Audit Trail</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Every governance action taken inside {currentWorkspace.name} — who did it, as which persona, and when.
        </p>
      </div>

      {entries.length === 0 ? (
        <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
          No workspace actions recorded yet. Upload an asset, create a finding, switch persona, or export a pack to see entries here.
        </Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {entries.map(e => (
            <Card key={e.id} className="!p-4">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Pill tone={ACTION_TONE[e.action] || 'var(--text-muted)'}>{e.action}</Pill>
                    <span className="text-sm font-bold text-[var(--text-primary)]">{e.entityName}</span>
                  </div>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">
                    {e.userName} · as {e.persona} · {e.entityType}
                  </p>
                </div>
                <span className="text-[10.5px] font-mono text-[var(--text-muted)] shrink-0">{new Date(e.timestamp).toLocaleString()}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
