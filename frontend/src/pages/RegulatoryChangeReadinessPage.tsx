import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getRegulatorySources,
  getRegulatoryRequirements,
  getObligations,
  getObligationControls,
  getObligationEvidenceMappings,
  getEvidenceRecords,
  getScheduledReviews,
  bootstrapPersistence,
} from '../services/storageService';
import { computeRegulatoryChangeReadiness, type RegulatoryChangeReadinessResult, type ReadinessTier } from '../config/regulatoryChangeReadinessEngine';

function compute(): RegulatoryChangeReadinessResult[] {
  return computeRegulatoryChangeReadiness(
    getRegulatorySources(),
    getRegulatoryRequirements(),
    getObligations(),
    getObligationControls(),
    getObligationEvidenceMappings(),
    getEvidenceRecords(),
    getScheduledReviews()
  );
}

const TIER_TONE: Record<ReadinessTier, string> = {
  'Ready': 'var(--status-success)',
  'Partially Ready': 'var(--status-warning)',
  'Not Ready': 'var(--status-danger)',
};

/**
 * Release 12 — Regulatory Intelligence, Capability 4: Regulatory Change
 * Readiness. "Are we ready when a regulation changes?" A portfolio-wide
 * ranking on top of Release 6's existing per-source coverage/gap engine —
 * see regulatoryChangeReadinessEngine.ts.
 */
export const RegulatoryChangeReadinessPage: React.FC = () => {
  const [results, setResults] = useState<RegulatoryChangeReadinessResult[]>(() => compute());

  useEffect(() => {
    bootstrapPersistence().then(() => setResults(compute()));
  }, []);

  const readyCount = results.filter(r => r.tier === 'Ready').length;
  const notReadyCount = results.filter(r => r.tier === 'Not Ready').length;

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Regulatory Change Readiness</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Active regulatory sources, ranked by how ready this organization is if that regulation changed tomorrow.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Active Sources" value={results.length} icon="🌐" tone="info" />
        <KpiCard label="Ready" value={readyCount} icon="✅" tone="success" />
        <KpiCard label="Not Ready" value={notReadyCount} icon="🚨" tone={notReadyCount > 0 ? 'danger' : 'success'} />
      </div>

      <SectionHeader eyebrow="Release 12" title="Readiness Ranking" subtitle="Weakest coverage first." icon="📶" />
      <div className="flex flex-col gap-3">
        {results.map(r => (
          <Card key={r.source.id} className="!p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <span
              className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg"
              style={{ background: `color-mix(in srgb, ${TIER_TONE[r.tier]} 15%, transparent)`, color: TIER_TONE[r.tier] }}
            >
              {r.tier}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-[var(--text-primary)]">{r.source.name}</p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                {r.coveragePct}% control coverage · {r.gapCount} open gap{r.gapCount === 1 ? '' : 's'}
                {r.reviewOverdue ? ' · review overdue' : ''}
              </p>
            </div>
            <div className="h-1.5 w-32 shrink-0 rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
              <div className="h-full rounded-full" style={{ width: `${r.coveragePct}%`, background: TIER_TONE[r.tier] }} />
            </div>
          </Card>
        ))}
        {results.length === 0 && (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No active regulatory sources on record.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
