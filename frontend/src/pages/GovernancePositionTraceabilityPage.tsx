import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { getAssets, getGovernancePositionTraceability } from '../services/storageService';
import type { GovernancePositionTraceability } from '../types';

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

const NODE_STAGES = [
  'Authority',
  'Governance Position Intake',
  'Authorised Governance Position',
  'Governance Position Contract',
  'Runtime Activity',
  'Evidence',
  'Changed Condition',
  'Reassessment Request',
  'Authority',
] as const;

export const GovernancePositionTraceabilityPage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [assetId, setAssetId] = useState(assets[0]?.id || '');
  const [trace, setTrace] = useState<GovernancePositionTraceability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!assetId) return;
    setLoading(true);
    getGovernancePositionTraceability(assetId).then(t => { setTrace(t); setLoading(false); }).catch(() => setLoading(false));
  }, [assetId]);

  const stageStatus = (stage: typeof NODE_STAGES[number], index: number): 'done' | 'empty' => {
    if (!trace) return 'empty';
    switch (stage) {
      case 'Authority': return index === 0 ? (trace.position?.authorityProvenanceRef || trace.intake ? 'done' : 'empty') : (trace.reassessmentRequests.some(r => r.status === 'Routed' || r.status === 'Acknowledged' || r.status === 'Resolved') ? 'done' : 'empty');
      case 'Governance Position Intake': return trace.intake ? 'done' : 'empty';
      case 'Authorised Governance Position': return trace.position ? 'done' : 'empty';
      case 'Governance Position Contract': return trace.contracts.length > 0 ? 'done' : 'empty';
      case 'Runtime Activity': return trace.runtimeGovernanceState ? 'done' : 'empty';
      case 'Evidence': return trace.evidenceLinks.length > 0 ? 'done' : 'empty';
      case 'Changed Condition': return trace.changedConditions.length > 0 ? 'done' : 'empty';
      case 'Reassessment Request': return trace.reassessmentRequests.length > 0 ? 'done' : 'empty';
      default: return 'empty';
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Position Traceability</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1 max-w-2xl">
          Release 20, Capability 6 — Cross-Layer Traceability. One asset's governance position, walked end to end:
          Authority → Intake → Authorised Position → Contract → Runtime Activity → Evidence → Changed Condition →
          Reassessment Request → Authority. Every node below reads an existing OMG record — nothing here is computed
          new for this view.
        </p>
      </div>

      <Select label="Asset" value={assetId} onChange={e => setAssetId(e.target.value)} options={assets.map(a => ({ value: a.id, label: a.name }))} />

      {loading ? (
        <p className="text-sm text-[var(--text-muted)]">Loading traceability…</p>
      ) : !trace ? (
        <Card className="!p-5"><p className="text-sm text-[var(--text-muted)]">No traceability data for this asset.</p></Card>
      ) : (
        <>
          <Card className="!p-5 border-[var(--accent-border)]">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Lifecycle Chain</p>
            <div className="flex items-center gap-1 flex-wrap">
              {NODE_STAGES.map((stage, i) => (
                <React.Fragment key={`${stage}-${i}`}>
                  <Pill tone={stageStatus(stage, i) === 'done' ? 'var(--status-success)' : 'var(--text-faint)'}>{stage}</Pill>
                  {i < NODE_STAGES.length - 1 && <span className="text-[var(--text-faint)] text-xs">→</span>}
                </React.Fragment>
              ))}
            </div>
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="!p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Authority &amp; Provenance</p>
              {trace.intake ? (
                <>
                  <p className="text-[11.5px] font-semibold text-[var(--text-primary)]">{trace.intake.sourceAuthority}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">via {trace.intake.sourceSystem} — reference {trace.intake.authorityReference}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Origin: External Intake</p>
                </>
              ) : trace.position?.authorityProvenanceRef ? (
                <>
                  <p className="text-[11.5px] font-semibold text-[var(--text-primary)]">{trace.position.authorityProvenanceRef}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Origin: Internal</p>
                </>
              ) : (
                <p className="text-[11px] text-[var(--text-muted)]">No authority provenance reference on file for this position.</p>
              )}
            </Card>

            <Card className="!p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Conditions &amp; Obligations</p>
              {trace.position ? (
                <>
                  <p className="text-[11px] text-[var(--text-muted)]"><b className="text-[var(--text-primary)]">Conditions:</b> {trace.position.conditions.join('; ') || 'None'}</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1"><b className="text-[var(--text-primary)]">Obligations:</b> {trace.position.obligations.join('; ') || 'None'}</p>
                </>
              ) : (
                <p className="text-[11px] text-[var(--text-muted)]">No Authorised Governance Position on file.</p>
              )}
            </Card>

            <Card className="!p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Evidence</p>
              {trace.evidenceLinks.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {trace.evidenceLinks.map(e => (
                    <p key={e.id} className="text-[11px] text-[var(--text-muted)]">{e.linkType} — {e.evidenceRecordRef || e.relianceEventRef || 'unreferenced'}</p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-muted)]">No runtime evidence or reliance events linked to this position yet.</p>
              )}
            </Card>

            <Card className="!p-5">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Reassessment History</p>
              {trace.reassessmentRequests.length > 0 || trace.reauthorisationRequests.length > 0 ? (
                <div className="flex flex-col gap-1.5">
                  {trace.reassessmentRequests.map(r => (
                    <p key={r.id} className="text-[11px] text-[var(--text-muted)]"><Pill tone="var(--status-warning)">{r.status}</Pill> {r.triggerReason}</p>
                  ))}
                  {trace.reauthorisationRequests.map(r => (
                    <p key={r.id} className="text-[11px] text-[var(--text-muted)]"><Pill tone="var(--status-warning)">{r.status}</Pill> {r.governanceImpactSummary}</p>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-[var(--text-muted)]">No reassessment or reauthorisation requests filed for this position.</p>
              )}
            </Card>
          </div>

          {trace.changedConditions.length > 0 && (
            <Card className="!p-5 border-[var(--status-warning)]">
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Changed Conditions Detected (Capability 4)</p>
              <div className="flex gap-2 flex-wrap">
                {trace.changedConditions.map(c => <Pill key={c} tone="var(--status-warning)">{c}</Pill>)}
              </div>
              <p className="text-[10.5px] text-[var(--text-muted)] mt-2">Advisory only — file a Reassessment or Reauthorisation Request from the Governance Position page to route this back to authority.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
