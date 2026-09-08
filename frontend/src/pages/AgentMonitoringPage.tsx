import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { getAssets, saveAsset } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { AgentBehaviorStatus, AIAsset } from '../types';

const AGENT_TYPES = ['Agent', 'Multi-Agent System'];

const STATUS_OPTIONS: { value: AgentBehaviorStatus; label: string }[] = [
  { value: 'Normal', label: 'Normal' },
  { value: 'Watchlist', label: 'Watchlist' },
  { value: 'Alert', label: 'Alert' },
];

const STATUS_TONE: Record<AgentBehaviorStatus, string> = {
  'Normal': 'var(--status-success)',
  'Watchlist': 'var(--status-warning)',
  'Alert': 'var(--status-danger)',
};

/**
 * R16 — Agent Governance. Behavior signal per agent — feeds the existing
 * portfolio-wide Governance Monitoring view rather than replacing it
 * (Architecture Package Blueprint 5: "Monitor-stage sub-loop").
 */
export const AgentMonitoringPage: React.FC = () => {
  const navigate = useNavigate();
  const { canPerform } = useAuth();
  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets().filter(a => AGENT_TYPES.includes(a.type)));

  const refresh = () => setAssets(getAssets().filter(a => AGENT_TYPES.includes(a.type)));

  const handleStatusChange = async (asset: AIAsset, status: AgentBehaviorStatus) => {
    await saveAsset({ id: asset.id, behaviorMonitoringStatus: status });
    refresh();
  };

  const alertCount = assets.filter(a => a.behaviorMonitoringStatus === 'Alert').length;
  const watchlistCount = assets.filter(a => a.behaviorMonitoringStatus === 'Watchlist').length;

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Agent Monitoring"
        subtitle="Behavior signal for every autonomous agent — feeds the portfolio-wide Governance Monitoring view."
        icon="📡"
        action={
          <Button variant="ghost" size="sm" onClick={() => navigate('/governance-monitoring')}>
            Open Governance Monitoring →
          </Button>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-success)' }}>{assets.length - alertCount - watchlistCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Normal</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-warning)' }}>{watchlistCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Watchlist</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-danger)' }}>{alertCount}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Alert</p></Card>
      </div>

      <div className="flex flex-col gap-3">
        {assets.map(asset => {
          const status = asset.behaviorMonitoringStatus || 'Normal';
          return (
            <Card key={asset.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-bold text-[var(--text-primary)]">{asset.name}</p>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full" style={{ color: STATUS_TONE[status], background: 'var(--bg-badge)', border: `1px solid ${STATUS_TONE[status]}40` }}>
                    {status}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-1">{asset.type} · Autonomy Level {asset.autonomyLevel ?? '—'} · {asset.oversightType || 'Oversight not classified'}</p>
              </div>
              {canPerform('asset:edit') && (
                <Select value={status} onChange={e => handleStatusChange(asset, e.target.value as AgentBehaviorStatus)} options={STATUS_OPTIONS} className="sm:max-w-[10rem]" />
              )}
            </Card>
          );
        })}

        {assets.length === 0 && <p className="text-center text-sm text-[var(--text-muted)] py-10">No agent-type assets are currently registered.</p>}
      </div>
    </div>
  );
};
