import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { getAssets, getRetirements, retireAsset } from '../services/storageService';
import type { RetirementRecord, RetirementReason } from '../types';

export const RetirementCenterPage: React.FC = () => {
  const [assets] = useState(() => getAssets().filter(a => a.status !== 'Retirement'));
  const [retirements, setRetirements] = useState<RetirementRecord[]>(() => getRetirements());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [reason, setReason] = useState<RetirementReason>('End of Life');
  const [notes, setNotes] = useState<string>('');

  const handleRetire = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !notes) return;

    retireAsset({
      assetId: selectedAssetId,
      reason,
      notes,
      requestedBy: 'Marcus Vance (Business Owner)',
      approvedBy: 'David Chen (Governance Admin)',
    });
    setRetirements(getRetirements());
    alert('📦 Controlled Decommissioning & Retirement completed successfully!');
    setNotes('');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Asset Retirement Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Controlled Decommissioning Workflow • Evidence Archival & End-of-Life Governance
        </p>
      </div>

      {/* Form Card */}
      <Card className="!p-6 flex flex-col gap-4 border-[var(--accent-border)]">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">Execute Governed Asset Decommissioning</h3>

        <form onSubmit={handleRetire} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Select AI System to Retire"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />

            <Select
              label="Decommissioning Rationale"
              value={reason}
              onChange={e => setReason(e.target.value as RetirementReason)}
              options={[
                { value: 'End of Life', label: 'End of Life' },
                { value: 'Regulatory Requirement', label: 'Regulatory Requirement' },
                { value: 'Business Decision', label: 'Business Decision' },
                { value: 'Technology Replacement', label: 'Technology Replacement' },
                { value: 'Risk Decision', label: 'Risk Decision' },
              ]}
            />
          </div>

          <Input
            label="Retirement Notes & Evidence Archival Location"
            required
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="e.g. Replaced by Retail Credit Scoring Engine (ast-102). Evidence archived in S3 Glacier..."
          />

          <Button type="submit" variant="danger" className="w-full">
            📦 Approve & Retire AI System
          </Button>
        </form>
      </Card>

      {/* Retired Assets History */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Retired Assets Audit Directory ({retirements.length})
        </h3>

        {retirements.map(rec => (
          <Card key={rec.id} className="!p-4 border-[var(--border-color)] flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[var(--text-primary)]">{rec.assetName}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-muted)]">
                  {rec.reason}
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-gray-500/20 text-gray-400">
                  Retired
                </span>
              </div>
              <span className="text-xs font-medium text-[var(--text-muted)]">{rec.retiredAt}</span>
            </div>

            <p className="text-xs text-[var(--text-secondary)]">{rec.notes}</p>
            <span className="text-[10px] text-[var(--text-muted)]">
              Approved By: {rec.approvedBy} | Evidence Archived: {rec.evidenceArchivedCount} Artifacts
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
};
