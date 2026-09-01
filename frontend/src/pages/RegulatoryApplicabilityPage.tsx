import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getRegulatorySources, getGovernanceProfiles, bootstrapPersistence } from '../services/storageService';
import { computeRegulatoryApplicability, type ApplicabilityResult } from '../config/regulatoryApplicabilityEngine';

function compute(): ApplicabilityResult[] {
  return computeRegulatoryApplicability(getRegulatorySources(), getGovernanceProfiles());
}

/**
 * Release 12 — Regulatory Intelligence, Capability 1: Applicability.
 * "Which regulations apply?" Zero new data — see regulatoryApplicabilityEngine.ts.
 */
export const RegulatoryApplicabilityPage: React.FC = () => {
  const [results, setResults] = useState<ApplicabilityResult[]>(() => compute());

  useEffect(() => {
    bootstrapPersistence().then(() => setResults(compute()));
  }, []);

  const applicable = results.filter(r => r.applies);
  const notApplicable = results.filter(r => !r.applies);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Regulatory Applicability</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Which regulations apply to this tenant, scoped by the active Governance Profile.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <KpiCard label="Applicable Sources" value={applicable.length} caption={`of ${results.length} in-force sources`} icon="✅" tone="success" />
        <KpiCard label="Out of Scope" value={notApplicable.length} caption="Not applicable to the active profile" icon="⭕" tone="neutral" />
      </div>

      <SectionHeader eyebrow="Release 12" title="Regulatory Sources" subtitle="Applicability, computed against the active Governance Profile." icon="🌐" />
      <div className="flex flex-col gap-3">
        {results.map(r => (
          <Card key={r.source.id} className="!p-4 flex items-center gap-4">
            <span
              className="shrink-0 text-[10px] font-black uppercase px-2.5 py-1 rounded-lg"
              style={{
                background: r.applies ? 'var(--status-success-bg)' : 'var(--status-neutral-bg)',
                color: r.applies ? 'var(--status-success)' : 'var(--text-muted)',
              }}
            >
              {r.applies ? 'Applies' : 'Not Applicable'}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-extrabold text-sm text-[var(--text-primary)]">
                {r.source.name} <span className="text-[11px] font-semibold text-[var(--text-muted)]">({r.source.jurisdiction} · {r.source.industry})</span>
              </p>
              <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">{r.reason}</p>
            </div>
          </Card>
        ))}
        {results.length === 0 && (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No regulatory sources registered yet.</p>
          </Card>
        )}
      </div>
    </div>
  );
};
