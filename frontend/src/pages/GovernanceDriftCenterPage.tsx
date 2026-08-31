import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getAssets,
  getEvidenceRecordsForAsset,
  getScheduledReviews,
  getReassessmentTriggers,
  getGovernanceDrifts,
  openGovernanceDrift,
  resolveGovernanceDrift,
  bootstrapPersistence,
} from '../services/storageService';
import { getPoliciesForAsset } from '../services/policyService';
import { detectDrift, applyCompoundEscalation } from '../config/governanceDriftEngine';
import type { DriftSeverity, GovernanceDrift } from '../types';

const SEVERITY_TONE: Record<DriftSeverity, string> = {
  Critical: 'var(--status-danger)',
  High: 'var(--status-warning)',
  Medium: 'var(--status-info)',
  Low: 'var(--status-neutral)',
};

const SEVERITY_ORDER: DriftSeverity[] = ['Critical', 'High', 'Medium', 'Low'];

/**
 * OMG vNext — Governance Intelligence, Module 3: Governance Drift Center.
 * Detects degradation of governance *process* effectiveness — advisory
 * only. Scanning is an explicit action (never runs silently on mount) since
 * it writes reconciled Open/Resolved drift records; nothing here blocks any
 * workflow, approval or deployment.
 */
export const GovernanceDriftCenterPage: React.FC = () => {
  const [drifts, setDrifts] = useState<GovernanceDrift[]>(() => getGovernanceDrifts());
  const [scanning, setScanning] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const [assets, setAssets] = useState(() => getAssets());

  // bootstrapPersistence() fires on module load but resolves asynchronously;
  // a visit that lands before it completes would otherwise show whatever
  // this browser's own prior scans happened to leave in local storage, not
  // the shared Neon record. Refresh once real data has landed.
  useEffect(() => {
    bootstrapPersistence().then(() => {
      setAssets(getAssets());
      setDrifts(getGovernanceDrifts());
    });
  }, []);

  /**
   * Scanning writes to Neon (openGovernanceDrift/resolveGovernanceDrift), so
   * unlike the read-only KPI cards above it can't run against whatever the
   * asset cache happened to hold at mount — `bootstrapPersistence()` fires
   * on module load but resolves asynchronously, and scanning before it
   * lands would write against pre-bootstrap local IDs that don't exist as
   * rows in Neon, tripping the assetId foreign key. Awaiting it here and
   * re-reading getAssets() guarantees the scan always uses synced IDs.
   */
  const scanForDrift = async () => {
    setScanning(true);
    try {
      await bootstrapPersistence();
      const currentAssets = getAssets();
      for (const asset of currentAssets) {
        const evidence = getEvidenceRecordsForAsset(asset.id);
        const reviews = getScheduledReviews().filter(r => r.assetId === asset.id);
        const triggers = getReassessmentTriggers().filter(t => t.assetId === asset.id);
        const policies = getPoliciesForAsset(asset);
        const detected = applyCompoundEscalation(detectDrift(asset, evidence, reviews, triggers, policies));

        const existingOpen = getGovernanceDrifts().filter(d => d.assetId === asset.id && d.status === 'Open');

        for (const existing of existingOpen) {
          if (!detected.some(d => d.category === existing.category)) {
            await resolveGovernanceDrift(existing.id);
          }
        }
        for (const d of detected) {
          if (!existingOpen.some(e => e.category === d.category)) {
            await openGovernanceDrift({ assetId: asset.id, assetName: asset.name, category: d.category, severity: d.severity, detail: d.detail });
          }
        }
      }
    } finally {
      setAssets(getAssets());
      setDrifts(getGovernanceDrifts());
      setScanning(false);
    }
  };

  const handleResolve = async (id: string) => {
    setResolvingId(id);
    try {
      await resolveGovernanceDrift(id);
      setDrifts(getGovernanceDrifts());
    } finally {
      setResolvingId(null);
    }
  };

  const openDrifts = useMemo(
    () => [...drifts.filter(d => d.status === 'Open')].sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)),
    [drifts]
  );
  const resolvedDrifts = useMemo(() => drifts.filter(d => d.status === 'Resolved'), [drifts]);
  const criticalCount = openDrifts.filter(d => d.severity === 'Critical').length;
  const assetsWithOpenDrift = new Set(openDrifts.map(d => d.assetId)).size;
  const driftFreePct = assets.length ? Math.round(((assets.length - assetsWithOpenDrift) / assets.length) * 100) : 0;

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Drift Center</h1>
          <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
            Detects degradation of governance process effectiveness over time — ownership, review, evidence,
            reassessment, control and approval drift. Informational only; nothing here blocks any workflow.
          </p>
        </div>
        <Button onClick={scanForDrift} disabled={scanning} icon={<span>🔎</span>}>
          {scanning ? 'Scanning…' : 'Scan Portfolio for Drift'}
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Open Drift Issues" value={openDrifts.length} caption={`Across ${assetsWithOpenDrift} of ${assets.length} assets`} icon="📉" tone={openDrifts.length > 0 ? 'warning' : 'success'} />
        <KpiCard label="Critical Drift" value={criticalCount} caption="Compound or severe drift requiring attention" icon="🚨" tone={criticalCount > 0 ? 'danger' : 'success'} />
        <KpiCard label="Drift-Free Assets" value={`${driftFreePct}%`} caption="No active drift detected" icon="✅" tone="info" progress={driftFreePct} />
      </div>

      <section className="flex flex-col gap-4">
        <SectionHeader eyebrow="OMG vNext" title="Open Drift Issues" subtitle="Sorted by severity — Critical first." icon="📉" />
        {openDrifts.length === 0 ? (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No open drift detected. Run a scan to check current portfolio state.
            </p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {openDrifts.map(d => (
              <Card key={d.id} className="!p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <span
                  className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg"
                  style={{ background: `color-mix(in srgb, ${SEVERITY_TONE[d.severity]} 15%, transparent)`, color: SEVERITY_TONE[d.severity] }}
                >
                  {d.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{d.assetName}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{d.category} Drift</span>
                  </div>
                  <p className="text-[12px] text-[var(--text-secondary)] mt-1">{d.detail}</p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-1">Detected {d.detectedAt}</p>
                </div>
                <Button variant="secondary" onClick={() => handleResolve(d.id)} disabled={resolvingId === d.id}>
                  {resolvingId === d.id ? 'Resolving…' : 'Mark Resolved'}
                </Button>
              </Card>
            ))}
          </div>
        )}
      </section>

      {resolvedDrifts.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader eyebrow="History" title="Resolved Drift" subtitle={`${resolvedDrifts.length} previously detected issue(s), since resolved.`} icon="🗂️" />
          <div className="flex flex-col gap-2">
            {resolvedDrifts.map(d => (
              <Card key={d.id} className="!p-3.5 flex items-center gap-3 opacity-70">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--status-success-bg)] text-[var(--status-success)]">Resolved</span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">{d.assetName}</span>
                <span className="text-[11px] text-[var(--text-muted)]">{d.category} — {d.detail}</span>
                <span className="ml-auto text-[10px] text-[var(--text-muted)]">Resolved {d.resolvedAt}</span>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
