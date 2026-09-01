import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getGovernanceFindings, bootstrapPersistence } from '../services/storageService';
import { getPolicyViolations } from '../services/policyService';
import { getChangeRequests } from '../services/changeManagementService';
import { computeComplianceImpact, type ComplianceImpactEntry } from '../config/complianceImpactEngine';

function compute(): ComplianceImpactEntry[] {
  return computeComplianceImpact(getChangeRequests(), getGovernanceFindings(), getPolicyViolations());
}

const IMPACT_TONE: Record<string, string> = {
  'Critical Impact': 'var(--status-danger)',
  'High Impact': 'var(--status-warning)',
  'Medium Impact': 'var(--status-info)',
};

/**
 * Release 12 — Regulatory Intelligence, Capability 3: Compliance Impact
 * Analysis. "What changed recently, and what's the compliance impact?"
 * Reuses the Phase 10 Change Request register's existing Compliance impact
 * rating verbatim — no new change-tracking mechanism.
 */
export const ComplianceImpactAnalysisPage: React.FC = () => {
  const [results, setResults] = useState<ComplianceImpactEntry[]>(() => compute());

  useEffect(() => {
    bootstrapPersistence().then(() => setResults(compute()));
  }, []);

  const criticalOrHigh = results.filter(r => r.change.impact?.Compliance === 'Critical Impact' || r.change.impact?.Compliance === 'High Impact').length;

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Compliance Impact Analysis</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Changes with a meaningful compliance impact rating, cross-referenced against the affected asset's current governance posture.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard label="Changes With Compliance Impact" value={results.length} icon="🔁" tone="warning" />
        <KpiCard label="High / Critical Impact" value={criticalOrHigh} icon="🚨" tone={criticalOrHigh > 0 ? 'danger' : 'success'} />
      </div>

      <SectionHeader eyebrow="Release 12" title="Impacted Changes" subtitle="Most recent first." icon="🔁" />
      <div className="flex flex-col gap-3">
        {results.map(r => (
          <Card key={r.change.id} className="!p-4 flex flex-col sm:flex-row sm:items-center gap-4">
            <span
              className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg"
              style={{ background: `color-mix(in srgb, ${IMPACT_TONE[r.change.impact!.Compliance] ?? 'var(--text-muted)'} 15%, transparent)`, color: IMPACT_TONE[r.change.impact!.Compliance] ?? 'var(--text-muted)' }}
            >
              {r.change.impact!.Compliance}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-[var(--text-primary)]">
                {r.change.changeRef}: {r.change.title}
              </p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">
                {r.change.assetName} · requested {r.change.requestedDate} · {r.change.status}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                {r.openFindingsForAsset} open finding{r.openFindingsForAsset === 1 ? '' : 's'}
              </span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                {r.openViolationsForAsset} open violation{r.openViolationsForAsset === 1 ? '' : 's'}
              </span>
            </div>
          </Card>
        ))}
        {results.length === 0 && (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No change requests currently carry a meaningful compliance impact rating.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
