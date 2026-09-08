import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { getModels, saveModel } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { LifecycleStage, Model } from '../types';

const STAGES: LifecycleStage[] = ['Register', 'Assess', 'Approve', 'Operate', 'Monitor', 'Reassess', 'Retire'];

const STAGE_TONE: Record<LifecycleStage, string> = {
  Register: 'var(--text-muted)',
  Assess: 'var(--status-info)',
  Approve: 'var(--accent-primary)',
  Operate: 'var(--status-success)',
  Monitor: 'var(--status-info)',
  Reassess: 'var(--status-warning)',
  Retire: 'var(--text-muted)',
};

/**
 * R13 — Model Governance. The universal Register → Assess → Approve →
 * Operate → Monitor → Reassess → Retire lifecycle (Architecture Package §9),
 * applied to models specifically — retraining cadence and drift are the
 * model-specific signals layered on top of the shared stage vocabulary.
 */
export const ModelLifecyclePage: React.FC = () => {
  const { canPerform } = useAuth();
  const [models, setModels] = useState<Model[]>(() => getModels());
  const refresh = () => setModels(getModels());

  const handleStageChange = async (model: Model, stage: LifecycleStage) => {
    await saveModel({ id: model.id, lifecycleStage: stage });
    refresh();
  };

  const driftFlagged = models.filter(m => m.driftDetected);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Model Lifecycle"
        subtitle="Stage, retraining schedule and drift signal for every governed model."
        icon="🔄"
      />

      {driftFlagged.length > 0 && (
        <Card className="!border-red-500/30 !bg-red-500/5">
          <p className="text-xs font-extrabold uppercase tracking-wider text-red-500 mb-2">⚠ Drift flagged — {driftFlagged.length} model{driftFlagged.length > 1 ? 's' : ''}</p>
          <div className="flex flex-col gap-2">
            {driftFlagged.map(m => (
              <div key={m.id} className="text-xs text-[var(--text-secondary)]">
                <span className="font-bold text-[var(--text-primary)]">{m.name}</span> — {m.driftNotes || 'Flagged by continuous monitoring.'}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {models.map(model => (
          <Card key={model.id} className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-sm font-bold text-[var(--text-primary)] truncate">{model.name}</p>
                <p className="text-xs text-[var(--text-muted)]">{model.modelType} · {model.vendor || 'In-House'}</p>
              </div>
              <span
                className="shrink-0 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full"
                style={{ color: STAGE_TONE[model.lifecycleStage], background: 'var(--bg-badge)', border: `1px solid ${STAGE_TONE[model.lifecycleStage]}40` }}
              >
                {model.lifecycleStage}
              </span>
            </div>

            <div className="flex items-center gap-1">
              {STAGES.map((stage, i) => {
                const currentIdx = STAGES.indexOf(model.lifecycleStage);
                const reached = i <= currentIdx;
                return (
                  <div key={stage} title={stage} className="flex-1 h-1.5 rounded-full" style={{ background: reached ? STAGE_TONE[model.lifecycleStage] : 'var(--border-subtle)' }} />
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold mb-0.5">Retraining Cadence</p>
                <p className="text-[var(--text-secondary)]">{model.retrainingCadence || '—'}</p>
              </div>
              <div>
                <p className="text-[var(--text-muted)] uppercase tracking-wider text-[10px] font-bold mb-0.5">Last Retrained</p>
                <p className="text-[var(--text-secondary)]">{model.lastRetrainedAt ? String(model.lastRetrainedAt).split('T')[0] : 'Never'}</p>
              </div>
            </div>

            {canPerform('model:edit') && (
              <Select
                label="Move to stage"
                value={model.lifecycleStage}
                onChange={e => handleStageChange(model, e.target.value as LifecycleStage)}
                options={STAGES.map(s => ({ value: s, label: s }))}
              />
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
