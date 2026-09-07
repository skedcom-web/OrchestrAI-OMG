import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuth } from '../contexts/AuthContext';
import {
  getAssets,
  getUsers,
  getGovernanceAssessmentRecords,
  getConsensusAssessments,
  startConsensusAssessment,
  submitConsensusParticipantScore,
  recordGovernanceAssessment,
  bootstrapPersistence,
} from '../services/storageService';
import { getScoringTemplate } from '../config/governanceScoringTemplates';
import { computeDispersion } from '../config/governanceVarianceEngine';
import {
  GOVERNANCE_ASSESSMENT_CATEGORIES,
  MATURITY_LEVEL_LABELS,
  type ConsensusAssessment,
  type GovernanceAssessmentCategoryScores,
  type GovernanceAssessmentRecord,
  type GovernanceAssessmentType,
  type GovernanceMaturityLevel,
} from '../types';

const ASSESSMENT_TYPES: GovernanceAssessmentType[] = ['Effectiveness', 'Maturity', 'ROI', 'Benchmarking', 'Regulatory Readiness'];
/** Mirrors the backend @Roles list on POST /consensus-assessments and the
 * existing Assessment Center's write gate — opening a round or submitting
 * an independent score is subject to the same governance-write RBAC as
 * every other assessment action. */
const CONSENSUS_WRITE_ROLES = ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR'];

function defaultScores(): GovernanceAssessmentCategoryScores {
  const scores: GovernanceAssessmentCategoryScores = {};
  for (const c of GOVERNANCE_ASSESSMENT_CATEGORIES) scores[c] = 3;
  return scores;
}

/** Compact per-category scoring form for one participant's independent
 * submission to a consensus round — same categories/scale as the
 * Assessment Center, kept local to this file since it's only ever used
 * inline, once per round card. */
const ParticipantScoringForm: React.FC<{ round: ConsensusAssessment; onSubmitted: () => void; onCancel: () => void }> = ({ round, onSubmitted, onCancel }) => {
  const { currentUser } = useAuth();
  const [scores, setScores] = useState<GovernanceAssessmentCategoryScores>(defaultScores());
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const overallScore = useMemo(() => {
    const values = Object.values(scores).filter((v): v is GovernanceMaturityLevel => v !== undefined);
    return values.length ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 10) / 10 : 0;
  }, [scores]);

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      await recordGovernanceAssessment({
        assetId: round.assetId,
        assessmentType: round.assessmentType,
        assessorName: currentUser.name,
        assessorRole: currentUser.role,
        categoryScores: scores,
        overallScore,
        evidenceNotes: notes,
        consensusAssessmentId: round.id,
      });
      await submitConsensusParticipantScore(round.id, currentUser.name);
      onSubmitted();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-[var(--text-primary)] uppercase">Your Independent Score</span>
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
      <textarea
        rows={2}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Evidence notes for your independent score..."
        className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
      />
      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting…' : 'Submit Independent Score'}</Button>
        <Button variant="ghost" onClick={onCancel} disabled={submitting}>Cancel</Button>
      </div>
    </div>
  );
};

export const ConsensusAssessmentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const canInitiate = !!currentUser && CONSENSUS_WRITE_ROLES.includes(currentUser.role);
  const [assets, setAssets] = useState(() => getAssets());
  const [users, setUsers] = useState(() => getUsers());
  const [records, setRecords] = useState<GovernanceAssessmentRecord[]>(() => getGovernanceAssessmentRecords());
  const [rounds, setRounds] = useState<ConsensusAssessment[]>(() => getConsensusAssessments());
  const [creating, setCreating] = useState(false);
  const [assetId, setAssetId] = useState('');
  const [assessmentType, setAssessmentType] = useState<GovernanceAssessmentType>('Effectiveness');
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [scoringRoundId, setScoringRoundId] = useState<string | null>(null);

  const refresh = () => {
    setRecords(getGovernanceAssessmentRecords());
    setRounds(getConsensusAssessments());
  };

  useEffect(() => {
    bootstrapPersistence().then(() => {
      setAssets(getAssets());
      setUsers(getUsers());
      refresh();
    });
  }, []);

  useEffect(() => {
    if (!assetId && assets.length > 0) setAssetId(assets[0].id);
  }, [assets, assetId]);

  const openRounds = rounds.filter(r => r.status === 'Open');
  const closedRounds = rounds.filter(r => r.status === 'Closed');
  const averageVariance = useMemo(() => {
    const withVariance = closedRounds.filter(r => typeof r.varianceScore === 'number');
    if (withVariance.length === 0) return null;
    return Math.round((withVariance.reduce((s, r) => s + (r.varianceScore || 0), 0) / withVariance.length) * 100) / 100;
  }, [closedRounds]);

  const handleCreateRound = async () => {
    if (!currentUser || !assetId || selectedUserIds.length < 2) return;
    setSubmitting(true);
    try {
      const participants = users.filter(u => selectedUserIds.includes(u.id)).map(u => ({ name: u.name, role: u.role }));
      await startConsensusAssessment({ assetId, assessmentType, initiatedBy: currentUser.name, participants });
      refresh();
      setCreating(false);
      setSelectedUserIds([]);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Multi-Assessor Consensus</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Multiple assessors independently score the same asset — scores stay hidden from each other until every participant has submitted, then the round closes with a consensus report. Advisory only.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Open Rounds" value={openRounds.length} icon="🔓" tone="info" />
        <KpiCard label="Closed Rounds" value={closedRounds.length} icon="🔒" tone="neutral" />
        <KpiCard label="Avg. Variance (Closed Rounds)" value={averageVariance ?? '—'} caption="Consensus Variance Trend — standard deviation across closed rounds" icon="σ" tone="neutral" />
      </div>

      {!canInitiate && (
        <Card className="!p-4">
          <p className="text-[12.5px] text-[var(--text-secondary)]">Your role has read-only access here — you can view rounds and reports, but only Super Admin, Governance Admin and Validator can open a new consensus round.</p>
        </Card>
      )}

      {canInitiate && !creating && (
        <Card className="!p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-extrabold text-sm text-[var(--text-primary)]">Start a Consensus Round</p>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Invite two or more assessors to independently score the same asset.</p>
          </div>
          <Button onClick={() => setCreating(true)}>Start Round</Button>
        </Card>
      )}

      {canInitiate && creating && (
        <Card className="!p-6 flex flex-col gap-4">
          <SectionHeader eyebrow="New Round" title="Consensus Assessment Setup" icon="👥" />
          <Select label="AI Asset" value={assetId} onChange={e => setAssetId(e.target.value)} options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))} />
          <Select label="Assessment Type" value={assessmentType} onChange={e => setAssessmentType(e.target.value as GovernanceAssessmentType)} options={ASSESSMENT_TYPES.map(t => ({ value: t, label: t }))} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Invite Participants (2 or more)</label>
            <p className="text-[11px] text-[var(--text-muted)] -mt-1">Limited to roles that can record an assessment — inviting anyone else would leave the round unable to close.</p>
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto p-2 rounded-xl border border-[var(--border-color)]">
              {users.filter(u => CONSENSUS_WRITE_ROLES.includes(u.role)).map(u => (
                <label key={u.id} className="flex items-center gap-2 text-[12.5px] text-[var(--text-primary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={e => setSelectedUserIds(prev => e.target.checked ? [...prev, u.id] : prev.filter(id => id !== u.id))}
                  />
                  {u.name} <span className="text-[var(--text-muted)]">({u.role})</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleCreateRound} disabled={submitting || !assetId || selectedUserIds.length < 2}>{submitting ? 'Opening…' : 'Open Round'}</Button>
            <Button variant="ghost" onClick={() => setCreating(false)} disabled={submitting}>Cancel</Button>
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader eyebrow="GACF Phase 2" title="Consensus Rounds" subtitle="Most recent first." icon="🗂️" />
        {rounds.length === 0 ? (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No consensus rounds opened yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-3">
            {rounds.map(round => {
              const isParticipant = !!currentUser && round.participants.some(p => p.name === currentUser.name);
              const myEntry = round.participants.find(p => p.name === currentUser?.name);
              const canSubmit = round.status === 'Open' && isParticipant && myEntry && !myEntry.submitted && !!currentUser && CONSENSUS_WRITE_ROLES.includes(currentUser.role);
              const linkedScores = records.filter(r => r.consensusAssessmentId === round.id);
              const dispersion = round.status === 'Closed' ? computeDispersion(linkedScores.map(r => r.overallScore)) : null;

              return (
                <Card key={round.id} className="!p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                      style={{ background: round.status === 'Open' ? 'var(--status-info-bg)' : 'var(--status-neutral-bg)', color: round.status === 'Open' ? 'var(--status-info)' : 'var(--status-neutral)' }}
                    >
                      {round.status}
                    </span>
                    <span className="text-[13px] font-bold text-[var(--text-primary)]">{round.assetName}</span>
                    <span className="text-[11px] font-bold text-[var(--accent-primary)]">{round.assessmentType}</span>
                    <span className="text-[11px] text-[var(--text-muted)]">initiated by {round.initiatedBy} · {round.createdAt}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {round.participants.map(p => (
                      <span key={p.name} className="text-[11px] px-2 py-1 rounded-lg bg-[var(--bg-badge)] text-[var(--text-secondary)] border border-[var(--border-color)]">
                        {p.submitted ? '✅' : '⏳'} {p.name} ({p.role})
                      </span>
                    ))}
                  </div>

                  {canSubmit && scoringRoundId !== round.id && (
                    <Button size="sm" className="self-start" onClick={() => setScoringRoundId(round.id)}>Submit My Independent Score</Button>
                  )}
                  {scoringRoundId === round.id && (
                    <ParticipantScoringForm round={round} onSubmitted={() => { refresh(); setScoringRoundId(null); }} onCancel={() => setScoringRoundId(null)} />
                  )}

                  {round.status === 'Closed' && dispersion && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-1">
                      <KpiCard label="Average Score" value={dispersion.mean} icon="μ" tone="neutral" />
                      <KpiCard label="Median Score" value={dispersion.median} icon="⚖" tone="neutral" />
                      <KpiCard label="Score Spread" value={dispersion.range} caption={`${dispersion.min}–${dispersion.max}`} icon="↔" tone="neutral" />
                      <KpiCard label="Variance (σ)" value={dispersion.standardDeviation} icon="σ" tone="neutral" />
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
