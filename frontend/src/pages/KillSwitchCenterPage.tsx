import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { getAssets, getKillSwitches, requestKillSwitch, releaseKillSwitch } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { KillSwitchTriggerCategory } from '../types';

export const KillSwitchCenterPage: React.FC = () => {
  // Q1 Stabilization — Phase 2/4: dedicated ActionKeys (killSwitch:engage/release), scoped to
  // Super Admin/Governance Admin/Risk Officer — tighter than the generic !isReadOnly fallback,
  // since over-permissioning an emergency stop is a worse failure mode than ordinary CRUD.
  const { canPerform } = useAuth();
  const canEngage = canPerform('killSwitch:engage');
  const canRelease = canPerform('killSwitch:release');
  const [assets] = useState(() => getAssets());
  const [records, setRecords] = useState(() => getKillSwitches());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [triggerCategory, setTriggerCategory] = useState<KillSwitchTriggerCategory>('Critical Incident');
  const [reason, setReason] = useState<string>('');

  const handleEngage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !reason) return;

    requestKillSwitch({
      assetId: selectedAssetId,
      triggerCategory,
      reason,
      requestedBy: 'Sarah Jenkins (Super Admin)',
    });
    setRecords(getKillSwitches());
    alert('🚨 EMERGENCY KILL SWITCH ENGAGED! Asset suspended immediately.');
    setReason('');
  };

  const handleRelease = (id: string) => {
    const notes = prompt('Enter release rationale & restoration authorization notes:');
    if (!notes) return;

    releaseKillSwitch(id, 'Sarah Jenkins (Super Admin)', notes);
    setRecords(getKillSwitches());
    alert('✅ Kill Switch released. Asset restored to Active operational status.');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Emergency Kill Switch Console</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Governed Circuit Breaker Protocol • Controlled Suspension Authority for Autonomous AI Systems
        </p>
      </div>

      {/* Engage Kill Switch Card */}
      <Card className="!p-6 bg-gradient-to-r from-red-600/15 via-pink-600/15 to-purple-600/15 border-red-500/40 flex flex-col gap-4">
        <div className="flex items-center gap-3 border-b border-red-500/20 pb-3">
          <span className="text-3xl">🚨</span>
          <div>
            <h3 className="text-lg font-black text-[var(--text-primary)]">Engage Emergency Circuit Breaker</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              Instantly suspends AI execution and logs an immutable governance emergency audit log.
            </p>
          </div>
        </div>

        <form onSubmit={handleEngage} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select AI System to Suspend"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type}) — Status: ${a.operationalStatus || 'Active'}` }))}
            />

            <Select
              label="Kill Switch Trigger Category"
              value={triggerCategory}
              onChange={e => setTriggerCategory(e.target.value as KillSwitchTriggerCategory)}
              options={[
                { value: 'Critical Incident', label: 'Critical Incident' },
                { value: 'Compliance Violation', label: 'Compliance Violation' },
                { value: 'Security Breach', label: 'Security Breach' },
                { value: 'Model Failure', label: 'Model Failure' },
                { value: 'Unauthorized Behavior', label: 'Unauthorized Behavior' },
                { value: 'Executive Directive', label: 'Executive Directive' },
              ]}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-[var(--text-secondary)]">Emergency Rationale / Incident Rationale</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Describe emergency trigger reason, unauthorized behavior, or breach details..."
              className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
            />
          </div>

          <Button
            type="submit"
            variant="danger"
            size="lg"
            className="w-full"
            disabled={!canEngage}
            title={!canEngage ? 'Your governance role does not permit activating the kill switch.' : undefined}
          >
            🚨 ENGAGE EMERGENCY KILL SWITCH IMMEDIATELY
          </Button>
        </form>
      </Card>

      {/* Active & Historical Kill Switch Events */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Kill Switch Audit Log & Active Suspensions ({records.length})
        </h3>

        {records.length === 0 ? (
          <Card className="!p-8 text-center text-[var(--text-muted)]">
            No kill switch events recorded.
          </Card>
        ) : (
        records.map(rec => (
          <Card key={rec.id} className="!p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[var(--border-color)]">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">{rec.status === 'Activated' ? '🚨' : '✅'}</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{rec.assetName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-muted)]">
                    {rec.triggerCategory}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    rec.status === 'Activated' ? 'bg-red-500/20 text-red-400 animate-pulse' : 'bg-emerald-500/20 text-emerald-400'
                  }`}>
                    {rec.status}
                  </span>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mt-1">{rec.reason}</p>
                <span className="text-[10px] text-[var(--text-muted)] mt-1">
                  Activated At: {rec.activatedAt} | Requested By: {rec.requestedBy}
                </span>
              </div>
            </div>

            {rec.status === 'Activated' && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleRelease(rec.id)}
                disabled={!canRelease}
                title={!canRelease ? 'Your governance role does not permit releasing the kill switch.' : undefined}
              >
                Release Kill Switch
              </Button>
            )}
          </Card>
        ))
        )}
      </div>
    </div>
  );
};
