import React from 'react';
import { Card } from '../ui/Card';
import { getUnifiedGovernanceStateForAsset, getActiveAgpForAsset } from '../../services/storageService';
import type { UnifiedGovernanceState } from '../../types';

/**
 * Release 19.1 — the platform-wide Governance Truth Card. "Provide a single
 * governance answer regardless of module": every surface that shows this
 * component is reading the exact same Governance State Resolution Layer
 * output, never a locally-derived approximation of it.
 */

const STATE_TONE: Record<UnifiedGovernanceState, string> = {
  'Governed': 'var(--status-success)',
  'Conditionally Governed': 'var(--status-warning)',
  'Governance At Risk': 'var(--status-warning)',
  'Governance Invalid': 'var(--status-danger)',
  'Pending Reauthorisation': 'var(--status-warning)',
  'Retired': 'var(--text-muted)',
};

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const GovernanceTruthCard: React.FC<{ assetId: string; compact?: boolean }> = ({ assetId, compact }) => {
  const result = getUnifiedGovernanceStateForAsset(assetId);
  const agp = getActiveAgpForAsset(assetId);
  if (!result) return null;

  if (compact) {
    return <Pill tone={STATE_TONE[result.state]}>Truth: {result.state}</Pill>;
  }

  return (
    <Card className="!p-5 border-[var(--accent-border)]">
      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Governance Truth Card</p>
      <div className="flex items-center gap-2 flex-wrap mb-2">
        <Pill tone={STATE_TONE[result.state]}>{result.state}</Pill>
        <span className="text-[10.5px] text-[var(--text-muted)]">
          Last evaluated {new Date(result.lastEvaluatedAt).toLocaleString()}
        </span>
      </div>
      <p className="text-[11px] text-[var(--text-muted)] mb-3">{result.reasons[0]}</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Governance Position</p>
          <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-0.5">{agp ? agp.authorisedGovernanceState : 'None'}</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Authority Currency</p>
          <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-0.5">{result.signalBreakdown.authorityCurrency}</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Reliance Status</p>
          <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-0.5">{result.signalBreakdown.relianceBasis}</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Evidence Sufficiency</p>
          <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-0.5">{result.signalBreakdown.evidenceSufficiency}</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Admissibility</p>
          <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-0.5">{result.signalBreakdown.admissibility}</p>
        </div>
        <div className="px-3 py-2 rounded-lg bg-[var(--bg-sunken)]">
          <p className="text-[9.5px] font-extrabold uppercase tracking-wider text-[var(--text-faint)]">Reauthorisation</p>
          <p className="text-[11.5px] font-semibold text-[var(--text-primary)] mt-0.5">{result.signalBreakdown.reauthorisation}</p>
        </div>
      </div>
    </Card>
  );
};
