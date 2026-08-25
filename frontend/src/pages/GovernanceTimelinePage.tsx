import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { getAssets, getGovernanceTimeline } from '../services/storageService';

export const GovernanceTimelinePage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [searchParams] = useSearchParams();
  const preselectedAssetId = searchParams.get('assetId');
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    (preselectedAssetId && assets.some(a => a.id === preselectedAssetId)) ? preselectedAssetId : (assets[0]?.id || '')
  );

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const timelineEvents = getGovernanceTimeline(selectedAssetId);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Event Timeline</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Complete Asset Governance Audit Trail • From Registration to Decommissioning
        </p>
      </div>

      {assets.length === 0 ? (
        <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
          No AI assets are registered yet. Register an asset to begin building its governance timeline.
        </Card>
      ) : (
        <>
          {/* Select AI System Banner */}
          <Card className="!p-4 border-[var(--accent-border)]">
            <Select
              label="Select AI System for Complete Audit Timeline"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type}) — Dept: ${a.department}` }))}
            />
          </Card>

          {/* Vertical Timeline Card */}
          <Card className="!p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{selectedAsset?.name}</h3>
                <span className="text-xs text-[var(--text-muted)]">Asset ID: {selectedAsset?.id} | Operational Status: {selectedAsset?.operationalStatus || 'Active'}</span>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                {timelineEvents.length} Lifecycle Milestones
              </span>
            </div>

            {/* Timeline Events List */}
            {timelineEvents.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)] text-center py-6">
                No governance events recorded yet for this asset.
              </p>
            ) : (
              <div className="relative pl-6 border-l-2 border-[var(--border-color)] flex flex-col gap-6">
                {timelineEvents.map(event => (
                  <div key={event.id} className="relative flex flex-col gap-1">
                    {/* Bullet Node */}
                    <div className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-[var(--accent-primary)] border-2 border-[var(--bg-card)] shadow" />

                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[var(--accent-primary)] uppercase tracking-wider">{event.stage}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">{event.timestamp}</span>
                    </div>

                    <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{event.details}</p>
                    <span className="text-[10px] text-[var(--text-muted)]">Actor: {event.actor}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};
