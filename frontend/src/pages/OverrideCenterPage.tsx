import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { getAssets, getOverrides, recordOverride } from '../services/storageService';
import type { OverrideRecord } from '../types';

export const OverrideCenterPage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [records, setRecords] = useState<OverrideRecord[]>(() => getOverrides());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [triggerReason, setTriggerReason] = useState<string>('');
  const [actionTaken, setActionTaken] = useState<string>('');

  const handleRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !triggerReason || !actionTaken) return;

    recordOverride({
      assetId: selectedAssetId,
      triggerReason,
      actionTaken,
      requestedBy: 'Marcus Vance (Business Owner)',
      approvedBy: 'David Chen (Governance Admin)',
    });
    setRecords(getOverrides());
    alert('👤 Human Override recorded successfully with audit trail!');
    setTriggerReason('');
    setActionTaken('');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Human Override Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Human Oversight & Decision Reversal Tracker • RBI Control RBI-004 Audit Trail
        </p>
      </div>

      {/* Record New Override Form */}
      <Card className="!p-6 flex flex-col gap-4 border-[var(--accent-border)]">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">Record Human Intervention & Decision Override</h3>
        
        <form onSubmit={handleRecord} className="flex flex-col gap-4">
          <Select
            label="Select AI System"
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
            options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
          />

          <Input
            label="Trigger Reason / Anomaly Rationale"
            required
            value={triggerReason}
            onChange={e => setTriggerReason(e.target.value)}
            placeholder="e.g. Wire transfer false positive flagged during system migration window..."
          />

          <Input
            label="Action Taken / Reversal Details"
            required
            value={actionTaken}
            onChange={e => setActionTaken(e.target.value)}
            placeholder="e.g. Human Supervisor approved transaction override after manual customer call..."
          />

          <Button type="submit" className="w-full">
            Log Human Override Record
          </Button>
        </form>
      </Card>

      {/* Override History List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Human Override Execution History ({records.length})
        </h3>

        {records.map(rec => (
          <Card key={rec.id} className="!p-4 border-[var(--border-color)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--text-primary)]">{rec.assetName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                  Override Logged
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--text-muted)]">{rec.timestamp}</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)]"><strong>Trigger:</strong> {rec.triggerReason}</p>
            <p className="text-xs text-emerald-400 font-bold"><strong>Action:</strong> {rec.actionTaken}</p>
            <span className="text-[10px] text-[var(--text-muted)]">
              Requested By: {rec.requestedBy} | Approved By: {rec.approvedBy}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};
