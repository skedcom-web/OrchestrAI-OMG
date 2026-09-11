import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';
import { getGovernabilityConfig, saveGovernabilityConfigEntry } from '../services/storageService';
import type { GovernabilityConfigArea, GovernabilityConfigEntry } from '../types';

const AREAS: GovernabilityConfigArea[] = ['Evidence Threshold', 'Authority Review Period', 'Admissibility Rule', 'Reassessment Rule', 'Escalation Rule'];
const LIVE_WIRED_AREAS = new Set<GovernabilityConfigArea>(['Evidence Threshold', 'Authority Review Period']);

export const GovernabilityStudioPage: React.FC = () => {
  const { currentUser, canPerform } = useAuth();
  const canEdit = canPerform('governabilityConfig:edit');
  const [config, setConfig] = useState(() => getGovernabilityConfig());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftValue, setDraftValue] = useState('');

  const startEdit = (entry: GovernabilityConfigEntry) => {
    setEditingId(entry.id);
    setDraftValue(entry.value);
  };

  const commitEdit = (id: string) => {
    saveGovernabilityConfigEntry(id, draftValue, currentUser?.name || 'Super Admin');
    setConfig(getGovernabilityConfig());
    setEditingId(null);
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governability Studio</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Configure Evidence Thresholds, Authority Review Periods, Admissibility Rules, Reassessment Rules and
          Escalation Rules. Every change is versioned, audited and traceable.
        </p>
      </div>

      {!canEdit && (
        <Card className="!p-4 border-[var(--accent-border)]">
          <p className="text-[11.5px] text-[var(--text-muted)]">You can view this configuration but not edit it — editing is limited to Super Admin and Governance Admin.</p>
        </Card>
      )}

      {AREAS.map(area => (
        <div key={area}>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">{area}</p>
            {LIVE_WIRED_AREAS.has(area) ? (
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">Live — read by the Governability Engine</span>
            ) : (
              <span className="text-[9.5px] font-bold px-2 py-0.5 rounded-full bg-[var(--bg-sunken)] text-[var(--text-muted)] border border-[var(--border-subtle)]">Reference — not yet parsed by the engine</span>
            )}
          </div>
          <div className="flex flex-col gap-2.5">
            {config.filter(c => c.configArea === area).map(entry => (
              <Card key={entry.id} className="!p-4">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">{entry.label}</span>
                    <p className="text-[10.5px] text-[var(--text-muted)] mt-0.5">v{entry.version} · updated {entry.updatedAt} by {entry.updatedBy}</p>
                  </div>
                  {editingId === entry.id ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <input
                        value={draftValue}
                        onChange={e => setDraftValue(e.target.value)}
                        className="w-28 px-2.5 py-1.5 rounded-lg bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-xs"
                        autoFocus
                      />
                      <button onClick={() => commitEdit(entry.id)} className="text-xs font-bold text-[var(--accent-primary)] cursor-pointer">Save</button>
                      <button onClick={() => setEditingId(null)} className="text-xs font-semibold text-[var(--text-muted)] cursor-pointer">Cancel</button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-bold text-[var(--text-primary)] tnum">{entry.value}</span>
                      {canEdit && (
                        <button onClick={() => startEdit(entry)} className="text-xs font-bold text-[var(--accent-primary)] hover:underline cursor-pointer">Edit</button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
