import React, { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import {
  getAssets,
  getGovernanceTimeline,
  getDecisionReconstruction,
  getGovernanceStory,
  getGovernanceValueSummary,
} from '../services/storageService';
import type { GovernanceTimelineEvent } from '../types';

type JourneyTab = 'timeline' | 'decision' | 'story' | 'value';

const TABS: { key: JourneyTab; label: string; icon: string }[] = [
  { key: 'timeline', label: 'Timeline', icon: '🧭' },
  { key: 'decision', label: 'Decision Reconstruction', icon: '⚖️' },
  { key: 'story', label: 'Governance Story', icon: '📖' },
  { key: 'value', label: 'Governance Value', icon: '📈' },
];

const EVENT_TONE: Record<GovernanceTimelineEvent['type'], string> = {
  registration: 'var(--accent-primary)',
  risk: 'var(--status-warning)',
  validation: 'var(--status-info)',
  decision: 'var(--status-success)',
  compliance: 'var(--status-info)',
  override: 'var(--status-warning)',
  killswitch: 'var(--status-danger)',
  retirement: 'var(--text-muted)',
  authorized: 'var(--status-success)',
  trigger: 'var(--status-warning)',
  review: 'var(--status-info)',
  reauthorization: 'var(--status-success)',
  evidence: 'var(--accent-primary)',
  finding: 'var(--status-danger)',
  'corrective-action': 'var(--status-warning)',
  certification: 'var(--status-success)',
  incident: 'var(--status-danger)',
};

function formatDate(value?: string): string {
  if (!value) return 'Not recorded';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const Pill: React.FC<{ children: React.ReactNode; tone?: string }> = ({ children, tone = 'var(--text-muted)' }) => (
  <span
    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold border"
    style={{ color: tone, borderColor: tone, background: 'color-mix(in srgb, ' + tone + ' 12%, transparent)' }}
  >
    {children}
  </span>
);

export const GovernanceJourneyExplorerPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets] = useState(() => getAssets());
  const [searchParams] = useSearchParams();
  const preselected = searchParams.get('assetId');
  const [assetId, setAssetId] = useState<string>(
    (preselected && assets.some(a => a.id === preselected)) ? preselected : (assets[0]?.id || '')
  );
  const [activeTab, setActiveTab] = useState<JourneyTab>('timeline');
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const asset = assets.find(a => a.id === assetId);
  const timeline = useMemo(() => (assetId ? getGovernanceTimeline(assetId) : []), [assetId]);
  const decision = useMemo(() => (assetId ? getDecisionReconstruction(assetId) : null), [assetId]);
  const story = useMemo(() => (assetId ? getGovernanceStory(assetId) : null), [assetId]);
  const value = useMemo(() => getGovernanceValueSummary(), []);

  return (
    <div className="flex flex-col gap-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Journey Explorer</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          One operational governance narrative, assembled live from records already on file — ownership, risk, evidence, approvals, reassessments, findings, corrective actions and certification.
        </p>
      </div>

      {assets.length === 0 ? (
        <Card className="!p-8 text-center text-sm text-[var(--text-muted)]">
          No AI assets are registered yet. Register an asset to build its governance journey.
        </Card>
      ) : (
        <>
          <Card className="!p-4 border-[var(--accent-border)]">
            <Select
              label="Select AI System"
              value={assetId}
              onChange={e => { setAssetId(e.target.value); setExpandedEventId(null); }}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type}) — Dept: ${a.department}` }))}
            />
          </Card>

          <Card className="!p-0 overflow-hidden">
            <div className="flex items-center gap-1 px-5 pt-3 border-b border-[var(--border-color)] overflow-x-auto">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-3.5 py-2 rounded-t-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer border-b-2 ${
                    activeTab === tab.key
                      ? 'border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            <div className="p-5">
              {/* ============== TIMELINE ============== */}
              {activeTab === 'timeline' && (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{asset?.name}</h3>
                      <span className="text-xs text-[var(--text-muted)]">Asset ID: {asset?.id} · Operational Status: {asset?.operationalStatus || 'Active'}</span>
                    </div>
                    <span className="text-xs font-black px-3 py-1 rounded-full bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                      {timeline.length} Governance Events
                    </span>
                  </div>

                  {timeline.length === 0 ? (
                    <p className="text-sm text-[var(--text-muted)] text-center py-6">No governance events recorded yet for this asset.</p>
                  ) : (
                    <div className="relative pl-6 border-l-2 border-[var(--border-color)] flex flex-col gap-1">
                      {timeline.map(event => {
                        const isOpen = expandedEventId === event.id;
                        const tone = EVENT_TONE[event.type] || 'var(--text-muted)';
                        return (
                          <div key={event.id} className="relative pb-4">
                            <div
                              className="absolute -left-[31px] top-1 w-4 h-4 rounded-full border-2 border-[var(--bg-card)] shadow"
                              style={{ background: tone }}
                            />
                            <button
                              onClick={() => setExpandedEventId(isOpen ? null : event.id)}
                              className="w-full text-left rounded-xl px-3 py-2 -ml-3 hover:bg-[var(--bg-sunken)] transition-colors cursor-pointer"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <span className="text-xs font-black uppercase tracking-wider" style={{ color: tone }}>{event.stage}</span>
                                <span className="text-[10px] text-[var(--text-muted)] font-mono shrink-0">{formatDate(event.timestamp)}</span>
                              </div>
                              <p className="text-xs font-semibold text-[var(--text-primary)] mt-0.5">{event.details}</p>
                              {isOpen && (
                                <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] flex flex-col gap-1">
                                  <span className="text-[10.5px] text-[var(--text-secondary)]">Actor: <strong className="text-[var(--text-primary)]">{event.actor}</strong></span>
                                  <span className="text-[10.5px] text-[var(--text-muted)]">Event type: {event.type}</span>
                                </div>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* ============== DECISION RECONSTRUCTION ============== */}
              {activeTab === 'decision' && decision && (
                <div className="flex flex-col gap-5">
                  <Card className="!p-5">
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Primary Decision</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div><p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Outcome</p><p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{decision.primaryDecision.outcome}</p></div>
                      <div><p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Approver</p><p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{decision.primaryDecision.approver}</p></div>
                      <div><p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Approval Date</p><p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{formatDate(decision.primaryDecision.approvalDate)}</p></div>
                      <div><p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Risk Rating</p><p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{decision.primaryDecision.riskRating}</p></div>
                      <div><p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Evidence Used</p><p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{decision.primaryDecision.evidenceUsed.length} record{decision.primaryDecision.evidenceUsed.length === 1 ? '' : 's'}</p></div>
                      <div><p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Linked Documents</p><p className="text-sm font-semibold text-[var(--text-primary)] mt-0.5">{decision.primaryDecision.linkedDocuments.length} document{decision.primaryDecision.linkedDocuments.length === 1 ? '' : 's'}</p></div>
                    </div>
                    {decision.primaryDecision.conditionsApplied && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
                        <p className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Conditions Applied</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-0.5">{decision.primaryDecision.conditionsApplied}</p>
                      </div>
                    )}
                    {decision.primaryDecision.evidenceUsed.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-wrap gap-1.5">
                        {decision.primaryDecision.evidenceUsed.map(e => (
                          <button key={e.id} onClick={() => navigate('/evidence-registry')} className="text-[10.5px] px-2 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:border-[var(--accent-border)] cursor-pointer">
                            {e.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>

                  <div>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-2">Reassessment View</p>
                    {decision.reassessments.length === 0 ? (
                      <Card className="!p-5 text-center text-xs text-[var(--text-muted)]">No reassessments have been triggered for this asset.</Card>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {decision.reassessments.map(r => (
                          <Card key={r.trigger.id} className="!p-4">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                              <span className="text-xs font-bold text-[var(--text-primary)]">{r.trigger.triggerType}</span>
                              <div className="flex items-center gap-1.5">
                                <Pill tone="var(--status-warning)">{r.trigger.severity}</Pill>
                                <Pill tone={r.trigger.status === 'Open' ? 'var(--status-danger)' : 'var(--status-success)'}>{r.trigger.status}</Pill>
                              </div>
                            </div>
                            <p className="text-[11px] text-[var(--text-secondary)] mt-1">Source: {r.trigger.owner} · Detected {formatDate(r.trigger.dateDetected)}</p>
                            <p className="text-xs text-[var(--text-secondary)] mt-1.5">{r.trigger.comments}</p>
                            {r.correctiveActions.length > 0 && (
                              <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
                                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Corrective Actions</p>
                                {r.correctiveActions.map(ca => (
                                  <p key={ca.id} className="text-[11px] text-[var(--text-secondary)]">• {ca.title} — <span className="font-semibold">{ca.status}</span></p>
                                ))}
                              </div>
                            )}
                            {r.outcome ? (
                              <div className="mt-2.5 pt-2.5 border-t border-[var(--border-subtle)]">
                                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] mb-1">Decision Taken</p>
                                <p className="text-[11px] text-[var(--text-secondary)]">{r.outcome.previousState} → <strong className="text-[var(--text-primary)]">{r.outcome.newState}</strong> ({r.outcome.decision}) by {r.outcome.reviewedBy} on {formatDate(r.outcome.reviewDate)}</p>
                              </div>
                            ) : (
                              <p className="text-[11px] text-[var(--text-muted)] mt-2.5 pt-2.5 border-t border-[var(--border-subtle)]">No reauthorization decision recorded yet.</p>
                            )}
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ============== GOVERNANCE STORY ============== */}
              {activeTab === 'story' && story && (
                <Card className="!p-6 max-w-2xl">
                  <h3 className="text-xl font-extrabold text-[var(--text-primary)]">{story.asset.name}</h3>
                  <div className="mt-4 flex flex-col gap-2.5">
                    {[
                      ['Owner', story.owner],
                      ['Risk', story.risk],
                      ['Evidence', `${story.evidenceCount} Artifact${story.evidenceCount === 1 ? '' : 's'}`],
                      ['Approval', formatDate(story.approvalDate)],
                      ['Deployment', story.deploymentStatus],
                      ['Finding', story.openFinding ? `${story.openFinding.title} (${story.openFinding.severity})` : 'None open'],
                      ['Corrective Action', story.openCorrectiveAction ? `${story.openCorrectiveAction.title} (${story.openCorrectiveAction.status})` : 'None open'],
                      ['Current Status', story.currentStatus],
                    ].map(([label, val]) => (
                      <div key={label} className="flex items-baseline gap-3 py-1.5 border-b border-[var(--border-subtle)] last:border-0">
                        <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--text-muted)] w-36 shrink-0">{label}</span>
                        <span className="text-sm text-[var(--text-primary)]">{val}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[10.5px] text-[var(--text-muted)] mt-4">
                    Every field above is drawn from this asset's own governance records — executive, auditor and board-friendly by construction, not by rewrite.
                  </p>
                </Card>
              )}

              {/* ============== GOVERNANCE VALUE ============== */}
              {activeTab === 'value' && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      ['Assets Under Governance', value.totalAssets],
                      ['Fully Owned Assets', value.assetsWithCompleteOwnership],
                      ['Evidence Records', value.totalEvidenceRecords],
                      ['Reauthorization Decisions', value.totalReauthorizations],
                      ['Open Findings', value.openFindings],
                      ['Resolved Findings', value.resolvedFindings],
                      ['Active Certifications', value.activeCertifications],
                      ['Open Reassessment Triggers', value.openReassessmentTriggers],
                    ].map(([label, num]) => (
                      <Card key={label as string} className="!p-4">
                        <p className="text-2xl font-extrabold text-[var(--text-primary)] tnum">{num}</p>
                        <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">{label}</p>
                      </Card>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="!p-5">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Before OMG</p>
                      <ul className="flex flex-col gap-2">
                        {['Multiple systems searched', 'Manual evidence collection', 'Manual audit preparation'].map(item => (
                          <li key={item} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[var(--status-danger)]" aria-hidden>✕</span>{item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                    <Card className="!p-5 border-[var(--accent-border)]">
                      <p className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--accent-primary)] mb-3">With OMG</p>
                      <ul className="flex flex-col gap-2">
                        {['Unified governance view', 'Linked evidence chain', 'Decision reconstruction available', 'Continuous governance visibility'].map(item => (
                          <li key={item} className="text-xs text-[var(--text-secondary)] flex items-start gap-2">
                            <span className="text-[var(--status-success)]" aria-hidden>✓</span>{item}
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
