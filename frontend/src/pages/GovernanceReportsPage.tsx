import React, { useMemo, useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import {
  getAssets,
  getModels,
  getKnowledgeAssets,
  getPrompts,
  getTools,
  getGovernanceControls,
  getCertificationRecords,
  getEvidenceRecords,
  getGovernanceMetrics,
  getCertificationReadinessFor,
  getAgentToolGrants,
} from '../services/storageService';
import { computeReauthorizationStatus, REAUTHORIZATION_STATUS_TONE } from '../config/governanceContinuity';
import { evidenceEntityRef } from '../config/evidenceFoundation';

type ReportKind =
  | 'coverage'
  | 'readiness'
  | 'evidence'
  | 'control'
  | 'certification'
  | 'continuity'
  | 'accountability';

const REPORT_OPTIONS: { value: ReportKind; label: string }[] = [
  { value: 'coverage', label: 'Governance Coverage Report' },
  { value: 'readiness', label: 'Governance Readiness Report' },
  { value: 'evidence', label: 'Evidence Completeness Report' },
  { value: 'control', label: 'Control Effectiveness Report' },
  { value: 'certification', label: 'Certification Readiness Report' },
  { value: 'continuity', label: 'Governance Continuity Report' },
  { value: 'accountability', label: 'Accountability Coverage Report' },
];

const AGENT_TYPES = ['Agent', 'Multi-Agent System'];

function Stat({ label, value, tone }: { label: string; value: React.ReactNode; tone?: string }) {
  return (
    <Card className="!p-4">
      <p className="text-2xl font-extrabold tnum" style={tone ? { color: tone } : undefined}>{value}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">{label}</p>
    </Card>
  );
}

/**
 * R20.1 — Cross-Domain Reporting (Part 5). Seven executive reports, all
 * thin views over compute functions and getters every prior release already
 * built (readinessFoundation.ts, governanceContinuity.ts, the Ownership
 * Matrix, the Control/Certification domains) — no new scoring engine, no
 * new governance domain. Relationship visibility itself (Asset↔Model,
 * Agent↔Tool, Control↔Entity, etc.) already lives on each domain's own
 * traceability screen (Model Analytics, Knowledge Traceability, Agent
 * Accountability, Control Mapping, Certification Records, Evidence
 * Registry) — this page is the roll-up, not a duplicate of those.
 */
export const GovernanceReportsPage: React.FC = () => {
  const [report, setReport] = useState<ReportKind>('coverage');
  const assets = useMemo(() => getAssets(), []);
  const models = useMemo(() => getModels(), []);
  const knowledgeAssets = useMemo(() => getKnowledgeAssets(), []);
  const prompts = useMemo(() => getPrompts(), []);
  const tools = useMemo(() => getTools(), []);
  const controls = useMemo(() => getGovernanceControls(), []);
  const certRecords = useMemo(() => getCertificationRecords(), []);
  const evidence = useMemo(() => getEvidenceRecords(), []);
  const metrics = useMemo(() => getGovernanceMetrics(), []);
  const grants = useMemo(() => getAgentToolGrants(), []);

  const agents = assets.filter(a => AGENT_TYPES.includes(a.type));

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Governance Reports"
        subtitle="Seven executive report views, each a roll-up over an existing governance engine — not a new one."
        icon="📊"
      />

      <Select value={report} onChange={e => setReport(e.target.value as ReportKind)} options={REPORT_OPTIONS} className="sm:max-w-md" />

      {report === 'coverage' && (() => {
        const modelsLinked = models.filter(m => m.usedByAssetIds.length > 0).length;
        const knowledgeLinked = knowledgeAssets.filter(k => k.usedByAssetIds.length > 0).length;
        const promptsLinked = prompts.filter(p => p.usedByAssetIds.length > 0).length;
        const agentsWithTools = agents.filter(a => grants.some(g => g.assetId === a.id)).length;
        const entitiesWithControls = new Set(controls.flatMap(c => (c.attachments || []).map(a => `${a.entityType}:${a.entityId}`))).size;
        const entitiesWithCertifications = new Set(certRecords.map(r => `${r.entityType}:${r.entityId}`)).size;
        const entitiesWithEvidence = new Set(evidence.map(e => { const r = evidenceEntityRef(e); return `${r.type}:${r.id}`; })).size;
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Models Linked to an Asset" value={`${modelsLinked}/${models.length}`} />
              <Stat label="Knowledge Linked to an Asset" value={`${knowledgeLinked}/${knowledgeAssets.length}`} />
              <Stat label="Prompts Linked to an Asset" value={`${promptsLinked}/${prompts.length}`} />
              <Stat label="Agents with Tool Grants" value={`${agentsWithTools}/${agents.length}`} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Stat label="Entities with a Control Attached" value={entitiesWithControls} />
              <Stat label="Entities with a Certification" value={entitiesWithCertifications} />
              <Stat label="Entities with Evidence Filed" value={entitiesWithEvidence} />
            </div>
          </div>
        );
      })()}

      {report === 'readiness' && (() => {
        const b = metrics.governanceReadinessBreakdown;
        const notReady = assets.filter(a => !a.governanceState || !['Authorized', 'Monitoring', 'Conditional GO'].includes(a.governanceState));
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Ready" value={b.Ready} tone="var(--status-success)" />
              <Stat label="Partially Ready" value={b['Partially Ready']} tone="var(--status-warning)" />
              <Stat label="Not Ready" value={b['Not Ready']} tone="var(--status-danger)" />
            </div>
            <Card>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Assets Without a Valid Governance State</p>
              {notReady.length === 0 ? <p className="text-xs text-[var(--text-muted)]">All assets hold a valid authorization state.</p> : (
                <div className="flex flex-col gap-1.5">
                  {notReady.map(a => <div key={a.id} className="text-xs text-[var(--text-primary)] font-semibold">{a.name} <span className="text-[var(--text-muted)] font-normal">— {a.governanceState || 'No state set'}</span></div>)}
                </div>
              )}
            </Card>
          </div>
        );
      })()}

      {report === 'evidence' && (() => {
        const b = metrics.evidenceReadinessBreakdown;
        const allEntities: { type: string; id: string; name: string }[] = [
          ...assets.map(a => ({ type: 'Asset', id: a.id, name: a.name })),
          ...models.map(m => ({ type: 'Model', id: m.id, name: m.name })),
          ...knowledgeAssets.map(k => ({ type: 'KnowledgeAsset', id: k.id, name: k.name })),
          ...prompts.map(p => ({ type: 'Prompt', id: p.id, name: p.name })),
          ...tools.map(t => ({ type: 'Tool', id: t.id, name: t.name })),
        ];
        const evidencedKeys = new Set(evidence.map(e => { const r = evidenceEntityRef(e); return `${r.type}:${r.id}`; }));
        const withoutEvidence = allEntities.filter(e => !evidencedKeys.has(`${e.type}:${e.id}`));
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Total Evidence Records" value={evidence.length} />
              <Stat label="Ready" value={b.Ready} tone="var(--status-success)" />
              <Stat label="Partially Ready" value={b['Partially Ready']} tone="var(--status-warning)" />
              <Stat label="Not Ready" value={b['Not Ready']} tone="var(--status-danger)" />
            </div>
            <Card>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Governed Entities with No Evidence Filed ({withoutEvidence.length}/{allEntities.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {withoutEvidence.slice(0, 30).map(e => (
                  <span key={`${e.type}:${e.id}`} className="text-[11px] px-2.5 py-1 rounded-full bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{e.type}: {e.name}</span>
                ))}
              </div>
            </Card>
          </div>
        );
      })()}

      {report === 'control' && (() => {
        const byRating = { EFFECTIVE: 0, PARTIALLY_EFFECTIVE: 0, INEFFECTIVE: 0, NOT_YET_TESTED: 0 };
        controls.forEach(c => byRating[c.effectivenessRating]++);
        const totalTests = controls.reduce((s, c) => s + (c.attachments || []).reduce((s2, a) => s2 + (a.testResults?.length || 0), 0), 0);
        const failedTests = controls.reduce((s, c) => s + (c.attachments || []).reduce((s2, a) => s2 + (a.testResults?.filter(t => t.outcome === 'FAIL').length || 0), 0), 0);
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Stat label="Effective" value={byRating.EFFECTIVE} tone="var(--status-success)" />
              <Stat label="Partially Effective" value={byRating.PARTIALLY_EFFECTIVE} tone="var(--status-warning)" />
              <Stat label="Ineffective" value={byRating.INEFFECTIVE} tone="var(--status-danger)" />
              <Stat label="Not Yet Tested" value={byRating.NOT_YET_TESTED} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Total Tests Recorded" value={totalTests} />
              <Stat label="Failed Tests" value={failedTests} tone={failedTests > 0 ? 'var(--status-danger)' : undefined} />
            </div>
          </div>
        );
      })()}

      {report === 'certification' && (() => {
        const readinessResults = [
          ...assets.map(a => getCertificationReadinessFor('Asset', a.id)),
          ...models.map(m => getCertificationReadinessFor('Model', m.id)),
          ...tools.map(t => getCertificationReadinessFor('Tool', t.id)),
        ];
        const ready = readinessResults.filter(r => r.status === 'Ready').length;
        const partial = readinessResults.filter(r => r.status === 'Partially Ready').length;
        const notReady = readinessResults.filter(r => r.status === 'Not Ready').length;
        const byStatus = { ACTIVE: 0, EXPIRED: 0, REVOKED: 0 };
        certRecords.forEach(r => byStatus[r.status]++);
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Ready" value={ready} tone="var(--status-success)" />
              <Stat label="Partially Ready" value={partial} tone="var(--status-warning)" />
              <Stat label="Not Ready" value={notReady} tone="var(--status-danger)" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Active Certifications" value={byStatus.ACTIVE} tone="var(--status-success)" />
              <Stat label="Expired" value={byStatus.EXPIRED} tone="var(--status-danger)" />
              <Stat label="Revoked" value={byStatus.REVOKED} tone="var(--text-muted)" />
            </div>
          </div>
        );
      })()}

      {report === 'continuity' && (() => {
        const statuses = assets.map(a => computeReauthorizationStatus(a.nextReviewDate));
        const counts = { Active: 0, 'Due Soon': 0, Overdue: 0, Expired: 0 };
        statuses.forEach(s => counts[s]++);
        const freqCounts: Record<string, number> = {};
        assets.forEach(a => { const f = a.reviewFrequency || 'Not Set'; freqCounts[f] = (freqCounts[f] || 0) + 1; });
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(counts) as (keyof typeof counts)[]).map(k => (
                <Stat key={k} label={k} value={counts[k]} tone={REAUTHORIZATION_STATUS_TONE[k]} />
              ))}
            </div>
            <Card>
              <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Review Frequency Distribution</p>
              <div className="flex flex-col gap-1.5 text-xs">
                {Object.entries(freqCounts).map(([freq, count]) => (
                  <div key={freq} className="flex justify-between"><span className="text-[var(--text-secondary)]">{freq}</span><span className="font-bold text-[var(--text-primary)] tnum">{count}</span></div>
                ))}
              </div>
            </Card>
          </div>
        );
      })()}

      {report === 'accountability' && (() => {
        const completeness = assets.map(a => {
          const o = a.ownership || {};
          return [o.businessOwner, o.technicalOwner, o.riskOwner, o.complianceOwner, o.approver].filter(Boolean).length;
        });
        const fullyComplete = completeness.filter(c => c === 5).length;
        const avgCompleteness = assets.length > 0 ? Math.round((completeness.reduce((s, c) => s + c, 0) / (assets.length * 5)) * 100) : 0;
        const incompleteAgents = agents.filter(a => {
          const o = a.ownership || {};
          return !(o.businessOwner && o.technicalOwner && o.riskOwner && o.approver);
        });
        return (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Fully Assigned (5/5 Roles)" value={`${fullyComplete}/${assets.length}`} tone="var(--status-success)" />
              <Stat label="Average Completeness" value={`${avgCompleteness}%`} />
              <Stat label="Agents Missing Accountability" value={incompleteAgents.length} tone={incompleteAgents.length > 0 ? 'var(--status-danger)' : 'var(--status-success)'} />
            </div>
            {incompleteAgents.length > 0 && (
              <Card>
                <p className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] mb-3">Agents with Incomplete Accountability Mapping</p>
                <div className="flex flex-col gap-1.5">
                  {incompleteAgents.map(a => <div key={a.id} className="text-xs font-semibold text-[var(--text-primary)]">{a.name}</div>)}
                </div>
              </Card>
            )}
          </div>
        );
      })()}
    </div>
  );
};
