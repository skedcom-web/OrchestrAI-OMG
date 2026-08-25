import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import {
  GovernanceOutcomeBadge,
  GovernancePolicySeverityBadge,
  GovernanceFindingStatusBadge,
  RecommendedActionStatusBadge,
} from '../components/ui/Badge';
import { getAssets, getDecisionTraceForAsset } from '../services/storageService';
import { DecisionEvidencePackModal } from '../components/common/DecisionEvidencePackModal';

type TraceView = 'summary' | 'timeline' | 'inputs' | 'policies' | 'findings' | 'outcomes' | 'actions' | 'humanDecisions';

const VIEWS: { key: TraceView; label: string; icon: string }[] = [
  { key: 'summary', label: 'Trace Summary', icon: '🧭' },
  { key: 'timeline', label: 'Timeline', icon: '⏱️' },
  { key: 'inputs', label: 'Inputs', icon: '📥' },
  { key: 'policies', label: 'Policies', icon: '📜' },
  { key: 'findings', label: 'Findings', icon: '🚩' },
  { key: 'outcomes', label: 'Outcomes', icon: '🧭' },
  { key: 'actions', label: 'Actions', icon: '🛠️' },
  { key: 'humanDecisions', label: 'Human Decisions', icon: '🖋️' },
];

/**
 * OMG Release 9 — Governance Decision Traceability Engine.
 *
 * Makes every governance decision reconstructable: Source → Requirement →
 * Obligation → Policy → Control → Evidence → Condition → Violation →
 * Finding → Outcome → Recommended Action → Human Decision. A reviewer can
 * open any asset here and understand exactly why an outcome occurred, who
 * acted, and what evidence supported it — Governance Replay in one screen.
 */
export const DecisionTraceabilityPage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [activeView, setActiveView] = useState<TraceView>('summary');
  const [isPackOpen, setIsPackOpen] = useState(false);

  const trace = selectedAssetId ? getDecisionTraceForAsset(selectedAssetId) : null;
  const assetOptions = assets.map(a => ({ value: a.id, label: a.name }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Decision Traceability</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Condition → Policy → Violation → Finding → Outcome → Recommended Action → Human Decision — every decision reconstructable end-to-end.
          </p>
        </div>
        <div className="w-full sm:w-72">
          <Select options={assetOptions} value={selectedAssetId} onChange={e => setSelectedAssetId(e.target.value)} />
        </div>
      </div>

      {!trace && assets.length === 0 && (
        <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
          No AI assets registered yet — there is no decision trace to reconstruct.
        </Card>
      )}

      {trace && (
        <Card className="!p-0 overflow-hidden">
          <div className="p-5 border-b border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">{trace.assetName}</h3>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                {trace.traceabilityComplete ? '✓ Fully traceable' : '⚠ Reasoning gap — condition detected but never addressed'}
              </p>
            </div>
            <Button size="sm" onClick={() => setIsPackOpen(true)}>Generate Decision Evidence Pack</Button>
          </div>

          <div className="flex items-center gap-1 px-5 pt-3 border-b border-[var(--border-color)] overflow-x-auto">
            {VIEWS.map(view => (
              <button
                key={view.key}
                onClick={() => setActiveView(view.key)}
                className={`px-3.5 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                  activeView === view.key
                    ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                    : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
              >
                {view.icon} {view.label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeView === 'summary' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Conditions Triggered</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.conditionsTriggered.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Violations Detected</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.violationsDetected.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Findings Generated</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.findingsGenerated.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Actions Recommended</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.actionsRecommended.length}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-2 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Recommended Outcome</span>
                  {trace.outcome ? <GovernanceOutcomeBadge status={trace.outcome.status} size="sm" /> : <span className="text-xs text-[var(--text-muted)] italic">No outcome computed.</span>}
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1 sm:col-span-2">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Human Decisions Taken</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.humanDecisions.length}</span>
                </div>
              </div>
            )}

            {activeView === 'timeline' && (
              <div className="flex flex-col gap-2">
                {trace.timeline.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No trace entries for this asset.</span>
                ) : (
                  trace.timeline.map((entry, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-start gap-3">
                      <span className="text-[10px] font-mono text-[var(--text-muted)] w-24 shrink-0 pt-0.5">{entry.stage}</span>
                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-sm text-[var(--text-primary)]">{entry.label}</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{entry.detail}</p>
                        {(entry.timestamp || entry.actor) && (
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {entry.timestamp ? entry.timestamp : ''}{entry.actor ? ` • ${entry.actor}` : ''}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeView === 'inputs' && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Evidence Records</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.inputsEvaluated.evidenceCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Scheduled Reviews</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.inputsEvaluated.reviewCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Validations</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.inputsEvaluated.validationCount}</span>
                </div>
                <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Reauthorizations</span>
                  <span className="text-lg font-black text-[var(--text-primary)]">{trace.inputsEvaluated.reauthorizationCount}</span>
                </div>
              </div>
            )}

            {activeView === 'policies' && (
              <div className="flex flex-col gap-2">
                {trace.policiesEvaluated.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No active policies evaluated.</span>
                ) : (
                  trace.policiesEvaluated.map(p => {
                    const violated = trace.violationsDetected.some(v => v.policyId === p.id);
                    return (
                      <div key={p.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                        <div>
                          <span className="font-bold text-sm text-[var(--text-primary)]">{p.name}</span>
                          <p className="text-xs text-[var(--text-secondary)] mt-0.5">Watches: {p.triggerCondition}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <GovernancePolicySeverityBadge severity={p.severity} size="sm" />
                          <span className={`text-[10px] font-bold uppercase ${violated ? 'text-red-500' : 'text-emerald-500'}`}>{violated ? 'Violated' : 'Satisfied'}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {activeView === 'findings' && (
              <div className="flex flex-col gap-2">
                {trace.findingsGenerated.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No findings generated for this asset.</span>
                ) : (
                  trace.findingsGenerated.map(f => (
                    <div key={f.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-sm text-[var(--text-primary)]">{f.policyName}</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{f.conditionType} — {f.detail}</p>
                        <span className="text-[10px] text-[var(--text-muted)]">Created {f.createdDate}</span>
                      </div>
                      <GovernanceFindingStatusBadge status={f.status} size="sm" />
                    </div>
                  ))
                )}
              </div>
            )}

            {activeView === 'outcomes' && (
              <div className="flex flex-col gap-3">
                {trace.outcome ? (
                  <>
                    <div className="p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Recommended Outcome</span>
                      <GovernanceOutcomeBadge status={trace.outcome.status} />
                    </div>
                    <ol className="flex flex-col gap-2">
                      {trace.outcome.reasons.map((reason, i) => (
                        <li key={i} className="text-xs p-2.5 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">
                          <span className="font-mono text-[var(--text-muted)] mr-2">{i + 1}.</span>{reason}
                        </li>
                      ))}
                    </ol>
                  </>
                ) : (
                  <span className="text-sm text-[var(--text-muted)] italic">No outcome computed.</span>
                )}
              </div>
            )}

            {activeView === 'actions' && (
              <div className="flex flex-col gap-2">
                {trace.actionsRecommended.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No actions recommended for this asset.</span>
                ) : (
                  trace.actionsRecommended.map(a => (
                    <div key={a.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-sm text-[var(--text-primary)]">{a.name}</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{a.actionType} • {a.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <GovernancePolicySeverityBadge severity={a.priority} size="sm" />
                        <RecommendedActionStatusBadge status={a.status} size="sm" />
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeView === 'humanDecisions' && (
              <div className="flex flex-col gap-2">
                {trace.humanDecisions.length === 0 ? (
                  <span className="text-sm text-[var(--text-muted)] italic">No human decision recorded yet — actions remain open.</span>
                ) : (
                  trace.humanDecisions.map(a => (
                    <div key={a.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between gap-3">
                      <div>
                        <span className="font-bold text-sm text-[var(--text-primary)]">{a.name}</span>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{a.decidedBy} decided {a.status} on {a.decidedAt}</p>
                      </div>
                      <RecommendedActionStatusBadge status={a.status} size="sm" />
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Card>
      )}

      {trace && (
        <DecisionEvidencePackModal isOpen={isPackOpen} onClose={() => setIsPackOpen(false)} trace={trace} />
      )}
    </div>
  );
};
