import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getGovernanceAssessmentRecords,
  recordGovernanceAssessment,
  recordConfidenceAssessment,
  getConfidenceForAssessmentRecord,
  bootstrapPersistence,
} from '../services/storageService';
import { getPlaybook } from '../config/governanceAssessmentPlaybooks';
import { getPromptSet } from '../config/governancePromptLibrary';
import { getScoringTemplate } from '../config/governanceScoringTemplates';
import {
  GOVERNANCE_ASSESSMENT_CATEGORIES,
  MATURITY_LEVEL_LABELS,
  type ConfidenceLevel,
  type GovernanceAssessmentCategoryScores,
  type GovernanceAssessmentRecord,
  type GovernanceAssessmentType,
  type GovernanceMaturityLevel,
} from '../types';

const ASSESSMENT_TYPES: GovernanceAssessmentType[] = ['Effectiveness', 'Maturity', 'ROI', 'Benchmarking', 'Regulatory Readiness'];
const CONFIDENCE_LEVELS: ConfidenceLevel[] = ['High', 'Medium', 'Low'];

/** Mirrors the backend's @Roles list on POST /governance-assessment-records
 * exactly (SUPER_ADMIN, GOVERNANCE_ADMIN, VALIDATOR — the "Reviewer" role
 * the blueprint's suggested RBAC maps onto). No dedicated ActionKey exists
 * yet for this action, so gated inline — same accepted pattern
 * DecisionWorkbenchPageV4 uses for its own un-matrixed write action. */
const ASSESSMENT_WRITE_ROLES = ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR'];

function defaultScores(): GovernanceAssessmentCategoryScores {
  const scores: GovernanceAssessmentCategoryScores = {};
  for (const c of GOVERNANCE_ASSESSMENT_CATEGORIES) scores[c] = 3;
  return scores;
}

/**
 * GACF hub — the only interactive surface across the six initiatives.
 * Recording an assessment here is what gives Variance & Reliability
 * Analysis real data to work with; everything else in GACF is reference
 * content. Advisory only, like every other assessment in this codebase —
 * nothing here blocks any workflow regardless of score.
 */
export const AssessmentCenterPage: React.FC = () => {
  const { currentUser } = useAuth();
  const canRecordAssessment = !!currentUser && ASSESSMENT_WRITE_ROLES.includes(currentUser.role);
  const [assets, setAssets] = useState(() => getAssets());
  const [records, setRecords] = useState<GovernanceAssessmentRecord[]>(() => getGovernanceAssessmentRecords());
  const [assetId, setAssetId] = useState('');
  const [assessmentType, setAssessmentType] = useState<GovernanceAssessmentType>('Effectiveness');
  const [scores, setScores] = useState<GovernanceAssessmentCategoryScores>(defaultScores());
  const [notes, setNotes] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState<ConfidenceLevel>('Medium');
  const [confidenceReason, setConfidenceReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    bootstrapPersistence().then(() => {
      setAssets(getAssets());
      setRecords(getGovernanceAssessmentRecords());
    });
  }, []);

  useEffect(() => {
    if (!assetId && assets.length > 0) setAssetId(assets[0].id);
  }, [assets, assetId]);

  const playbook = getPlaybook(assessmentType);
  const prompts = getPromptSet(assessmentType);
  const overallScore = useMemo(() => {
    const values = Object.values(scores).filter((v): v is GovernanceMaturityLevel => v !== undefined);
    return values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : 0;
  }, [scores]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assetId || !canRecordAssessment) return;
    setSubmitting(true);
    try {
      const created = await recordGovernanceAssessment({
        assetId,
        assessmentType,
        assessorName: currentUser?.name || 'Unknown Assessor',
        assessorRole: currentUser?.role || 'UNKNOWN',
        categoryScores: scores,
        overallScore,
        evidenceNotes: notes,
      });
      if (confidenceReason.trim()) {
        await recordConfidenceAssessment({ assessmentRecordId: created.id, confidenceLevel, confidenceReason });
      }
      setRecords(getGovernanceAssessmentRecords());
      setNotes('');
      setConfidenceLevel('Medium');
      setConfidenceReason('');
      setScores(defaultScores());
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Assessment Center</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Record a standardized governance assessment — ten categories, one 1-5 scale, every time. Advisory only.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Assessments Recorded" value={records.length} icon="📝" tone="info" />
        <KpiCard label="Assets Assessed" value={new Set(records.map(r => r.assetId)).size} caption={`of ${assets.length} in the registry`} icon="🗂️" tone="info" />
        <KpiCard label="Assessment Types Used" value={new Set(records.map(r => r.assessmentType)).size} caption="of 5 playbooks" icon="📚" tone="info" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 flex flex-col gap-4">
          <Card className="!p-4">
            <Select label="Assessment Type" value={assessmentType} onChange={e => setAssessmentType(e.target.value as GovernanceAssessmentType)} options={ASSESSMENT_TYPES.map(t => ({ value: t, label: t }))} />
          </Card>
          {playbook && (
            <Card className="!p-4 flex flex-col gap-2">
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase">{playbook.icon} Playbook Objective</p>
              <p className="text-[13px] text-[var(--text-secondary)]">{playbook.objective}</p>
            </Card>
          )}
          {prompts && (
            <Card className="!p-4 flex flex-col gap-2">
              <p className="text-xs font-bold text-[var(--text-primary)] uppercase">💡 Recommended Prompts</p>
              <ul className="flex flex-col gap-1.5">
                {prompts.questions.map((q, i) => (
                  <li key={i} className="text-[12.5px] text-[var(--text-secondary)] leading-snug">— {q}</li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <Card className="lg:col-span-7 flex flex-col gap-5 !p-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Select
              label="AI Asset"
              value={assetId}
              onChange={e => setAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />

            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--text-primary)] uppercase">Category Scores</span>
                <span className="tnum text-sm font-extrabold text-[var(--accent-primary)]">{overallScore} / 5 overall</span>
              </div>
              {GOVERNANCE_ASSESSMENT_CATEGORIES.map(category => {
                const template = getScoringTemplate(category);
                const level = scores[category] ?? 3;
                return (
                  <div key={category} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-[12px]">
                      <span className="font-semibold text-[var(--text-primary)]" title={template?.levels[level]}>{template?.icon} {category}</span>
                      <span className="text-[11px] font-bold text-[var(--text-muted)]">{level} — {MATURITY_LEVEL_LABELS[level]}</span>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      step={1}
                      value={level}
                      onChange={e => setScores(prev => ({ ...prev, [category]: Number(e.target.value) as GovernanceMaturityLevel }))}
                      className="w-full accent-[var(--accent-primary)]"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Evidence Notes</label>
              <textarea
                rows={3}
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Cite the specific record behind each score — a document, a review date, a named gap..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase">Confidence Scoring — Optional</span>
              <p className="text-[11px] text-[var(--text-muted)] -mt-2">Identical scores can carry different confidence — capture how sure you are, and why, so a reader can tell a well-evidenced 3 from a guessed one.</p>
              <Select
                label="Confidence Level"
                value={confidenceLevel}
                onChange={e => setConfidenceLevel(e.target.value as ConfidenceLevel)}
                options={CONFIDENCE_LEVELS.map(l => ({ value: l, label: l }))}
              />
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-[var(--text-secondary)]">Confidence Rationale</label>
                <textarea
                  rows={2}
                  value={confidenceReason}
                  onChange={e => setConfidenceReason(e.target.value)}
                  placeholder="Why this confidence level — e.g. limited evidence available, or fully corroborated by three independent sources..."
                  className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              disabled={submitting || !assetId || !canRecordAssessment}
              title={!canRecordAssessment ? 'Your governance role does not permit recording an assessment. Reviewers, Governance Admins and Super Admins can record assessments.' : undefined}
            >
              {submitting ? 'Recording…' : 'Record Assessment'}
            </Button>
            {!canRecordAssessment && (
              <p className="text-[11px] text-[var(--text-muted)] text-center -mt-2">
                Your role has read-only access to assessments. Playbooks, the Calibration Library and Variance Analysis remain fully available.
              </p>
            )}
          </form>
        </Card>
      </div>

      {records.length > 0 && (
        <section className="flex flex-col gap-4">
          <SectionHeader eyebrow="GACF" title="Recent Assessments" subtitle="Most recent first." icon="🗂️" />
          <div className="flex flex-col gap-2">
            {records.slice(0, 8).map(r => {
              const confidence = getConfidenceForAssessmentRecord(r.id);
              return (
                <Card key={r.id} className="!p-3.5 flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)]">{r.assessmentType}</span>
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">{r.assetName}</span>
                  <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">{r.overallScore}/5</span>
                  {confidence && (
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                      style={{
                        background: confidence.confidenceLevel === 'High' ? 'var(--success-light, #dcfce7)' : confidence.confidenceLevel === 'Low' ? 'var(--danger-light, #fee2e2)' : 'var(--warning-light, #fef9c3)',
                        color: confidence.confidenceLevel === 'High' ? 'var(--success, #16a34a)' : confidence.confidenceLevel === 'Low' ? 'var(--danger, #dc2626)' : 'var(--warning, #ca8a04)',
                      }}
                      title={confidence.confidenceReason}
                    >
                      {confidence.confidenceLevel} Confidence
                    </span>
                  )}
                  {r.consensusAssessmentId && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--bg-sunken)] text-[var(--text-muted)]">Consensus Round</span>
                  )}
                  <span className="text-[11px] text-[var(--text-muted)]">by {r.assessorName} ({r.assessorRole}) · {r.createdAt}</span>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
};
