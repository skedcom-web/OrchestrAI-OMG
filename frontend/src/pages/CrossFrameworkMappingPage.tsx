import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import {
  getEvidenceRecords,
  getEvidenceMappings,
  getPackControls,
  getComplianceRequirements,
  getCompliancePacks,
  getObligationEvidenceMappings,
  getObligationControls,
  getObligations,
  getRegulatoryRequirements,
  getRegulatorySources,
  bootstrapPersistence,
} from '../services/storageService';
import { computeCrossFrameworkReuse, type EvidenceFrameworkReuse } from '../config/crossFrameworkMappingEngine';

function compute(): EvidenceFrameworkReuse[] {
  return computeCrossFrameworkReuse(
    getEvidenceRecords(),
    getEvidenceMappings(),
    getPackControls(),
    getComplianceRequirements(),
    getCompliancePacks(),
    getObligationEvidenceMappings(),
    getObligationControls(),
    getObligations(),
    getRegulatoryRequirements(),
    getRegulatorySources()
  );
}

/**
 * Release 12 — Regulatory Intelligence, Capability 2: Cross-Framework
 * Mapping. "What controls satisfy multiple frameworks?" First place the
 * platform cross-references the Compliance Pack chain and the Regulatory
 * Source chain — see crossFrameworkMappingEngine.ts.
 */
export const CrossFrameworkMappingPage: React.FC = () => {
  const [results, setResults] = useState<EvidenceFrameworkReuse[]>(() => compute());

  useEffect(() => {
    bootstrapPersistence().then(() => setResults(compute()));
  }, []);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Cross-Framework Mapping</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Evidence already doing double duty — one record satisfying obligations across more than one framework.
        </p>
      </div>

      <KpiCard
        label="Evidence Records Reused Across Frameworks"
        value={results.length}
        caption="Satisfying 2 or more distinct compliance packs / regulatory sources"
        icon="🔗"
        tone="success"
      />

      <SectionHeader eyebrow="Release 12" title="Reuse Detail" subtitle="Each record, and every framework it satisfies." icon="🧩" />
      <div className="flex flex-col gap-3">
        {results.map(r => (
          <Card key={r.evidenceId} className="!p-4 flex flex-col gap-2">
            <p className="font-extrabold text-sm text-[var(--text-primary)]">{r.evidenceName}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.frameworks.map((f, i) => (
                <span
                  key={`${f.type}-${f.name}-${i}`}
                  className="text-[10px] font-bold px-2 py-1 rounded-lg border"
                  style={{ color: 'var(--accent-primary)', borderColor: 'var(--accent-border)', background: 'var(--accent-light)' }}
                >
                  {f.type}: {f.name}
                </span>
              ))}
            </div>
          </Card>
        ))}
        {results.length === 0 && (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">
              No evidence record currently satisfies more than one framework — map existing evidence to additional
              controls in the Mapping Workspace or Compliance Pack Framework to start reusing it.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};
