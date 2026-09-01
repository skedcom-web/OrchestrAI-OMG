import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getAssets,
  getEvidenceRecordsForAsset,
  getCompliancePacks,
  getComplianceRequirements,
  getPackControls,
  getEvidenceMappings,
  getEvidenceRecords,
  getRegulatorySources,
  getRegulatoryRequirements,
  getObligations,
  getObligationControls,
  getObligationEvidenceMappings,
  getScheduledReviews,
  bootstrapPersistence,
} from '../services/storageService';
import { computeAuditReadinessIntelligence, type AuditReadinessIntelligenceResult } from '../config/auditReadinessIntelligenceEngine';

function compute(): AuditReadinessIntelligenceResult {
  return computeAuditReadinessIntelligence(
    getAssets(),
    getEvidenceRecordsForAsset,
    getCompliancePacks(),
    getComplianceRequirements(),
    getPackControls(),
    getEvidenceMappings(),
    getEvidenceRecords(),
    getRegulatorySources(),
    getRegulatoryRequirements(),
    getObligations(),
    getObligationControls(),
    getObligationEvidenceMappings(),
    getScheduledReviews()
  );
}

/**
 * Release 12 — Regulatory Intelligence, Capability 5: Audit Readiness
 * Intelligence. "What evidence supports compliance — are we audit-ready?"
 * A rollup of existing readiness/coverage computations, not a new score —
 * see auditReadinessIntelligenceEngine.ts.
 */
export const AuditReadinessIntelligencePage: React.FC = () => {
  const [result, setResult] = useState<AuditReadinessIntelligenceResult>(() => compute());

  useEffect(() => {
    bootstrapPersistence().then(() => setResult(compute()));
  }, []);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Audit Readiness Intelligence</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          What evidence supports compliance today — asset-level and framework-level readiness, combined.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Assets Audit-Ready" value={`${result.assetsReadyPct}%`} caption={`${result.assetsNotReadyCount} not ready`} icon="🗂️" tone="info" progress={result.assetsReadyPct} />
        <KpiCard label="Compliance Pack Coverage" value={`${result.packCoveragePct}%`} icon="🧩" tone="info" progress={result.packCoveragePct} />
        <KpiCard label="Regulatory Source Coverage" value={`${result.sourceCoveragePct}%`} icon="🌐" tone="info" progress={result.sourceCoveragePct} />
      </div>

      <SectionHeader eyebrow="Release 12" title="Top Evidence Gaps" subtitle="Missing or expired evidence across every active framework." icon="📄" />
      <div className="flex flex-col gap-2">
        {result.topEvidenceGaps.map((g, i) => (
          <Card key={i} className="!p-3.5 flex items-center gap-3">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--status-warning-bg)] text-[var(--status-warning)]">{g.framework}</span>
            <span className="text-[12px] text-[var(--text-secondary)]">{g.detail}</span>
          </Card>
        ))}
        {result.topEvidenceGaps.length === 0 && (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No evidence gaps across active frameworks.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
