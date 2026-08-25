import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { StatusBadge } from '../components/ui/StatusBadge';
import { RiskBadge } from '../components/ui/Badge';
import {
  getArchivedAssets,
  restoreAsset,
  getEvidenceRecordsForAsset,
  getGovernanceFindingsForAsset,
  getRecommendedActionsForAsset,
  getDecisionTraceForAsset,
} from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { AIAsset } from '../types';

/**
 * Q1 Stabilization — Phase 3/4: the Archive Audit History view. Every asset
 * here was archived, never physically deleted — this page exists specifically
 * to demonstrate that its evidence, findings, actions and decision trail
 * survived the archive intact (D-1 from the QA report).
 */
export const ArchivedAssetsPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [archived, setArchived] = useState<AIAsset[]>(() => getArchivedAssets());
  const [detailAsset, setDetailAsset] = useState<AIAsset | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const refresh = () => setArchived(getArchivedAssets());

  const handleRestore = async (asset: AIAsset) => {
    if (!confirm(`Restore "${asset.name}" to the active registry?`)) return;
    setRestoring(asset.id);
    try {
      await restoreAsset(asset.id);
      refresh();
      if (detailAsset?.id === asset.id) setDetailAsset(null);
    } catch (err) {
      alert(`Could not restore this asset: ${(err as Error).message}`);
    } finally {
      setRestoring(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Archived Assets</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Soft-deleted assets — nothing here was ever physically removed. Evidence, findings, actions and the
          decision trail for every archived asset remain fully intact and reachable below.
        </p>
      </div>

      {archived.length === 0 ? (
        <Card className="!p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No assets are currently archived.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-3">
          {archived.map(asset => (
            <Card key={asset.id} className="!p-4 border-[var(--border-color)] flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{asset.name}</span>
                    <RiskBadge level={asset.riskLevel} />
                    <StatusBadge status={asset.status} />
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)] text-[var(--status-warning)]">
                      Archived
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)]">{asset.department} · {asset.type}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    Archived {asset.archivedAt} by {asset.archivedBy || 'Unknown'}
                    {asset.archiveReason ? ` — “${asset.archiveReason}”` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => setDetailAsset(asset)}>
                    View Preserved History
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleRestore(asset)}
                    disabled={!canPerform('asset:restore') || restoring === asset.id}
                    title={!canPerform('asset:restore') ? 'Your governance role does not permit restoring archived assets.' : undefined}
                  >
                    {restoring === asset.id ? 'Restoring…' : 'Restore'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {detailAsset && (
        <Modal
          isOpen={!!detailAsset}
          onClose={() => setDetailAsset(null)}
          title={detailAsset.name}
          subtitle="Preserved Governance History — nothing was lost when this asset was archived"
          maxWidth="lg"
        >
          <div className="flex flex-col gap-4 py-2">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Evidence Records', value: getEvidenceRecordsForAsset(detailAsset.id).length },
                { label: 'Governance Findings', value: getGovernanceFindingsForAsset(detailAsset.id).length },
                { label: 'Recommended Actions', value: getRecommendedActionsForAsset(detailAsset.id).length },
                { label: 'Decision Trace', value: getDecisionTraceForAsset(detailAsset.id) ? 'Reconstructable' : '—' },
              ].map(stat => (
                <div key={stat.label} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-center">
                  <div className="text-lg font-extrabold text-[var(--text-primary)]">{stat.value}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs text-[var(--text-secondary)]">
              <p><strong className="text-[var(--text-primary)]">Archived:</strong> {detailAsset.archivedAt} by {detailAsset.archivedBy || 'Unknown'}</p>
              {detailAsset.archiveReason && (
                <p className="mt-1"><strong className="text-[var(--text-primary)]">Reason:</strong> {detailAsset.archiveReason}</p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--border-color)]">
              <Button variant="ghost" onClick={() => setDetailAsset(null)}>
                Close
              </Button>
              <Button
                onClick={() => handleRestore(detailAsset)}
                disabled={!canPerform('asset:restore') || restoring === detailAsset.id}
                title={!canPerform('asset:restore') ? 'Your governance role does not permit restoring archived assets.' : undefined}
              >
                {restoring === detailAsset.id ? 'Restoring…' : 'Restore to Active Registry'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
