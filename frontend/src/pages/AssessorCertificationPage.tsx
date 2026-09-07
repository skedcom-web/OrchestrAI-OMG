import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { useAuth } from '../contexts/AuthContext';
import { getAssessorCertifications, getLatestCertificationByAssessor, recordAssessorCertification, bootstrapPersistence } from '../services/storageService';
import { GOVERNANCE_CALIBRATION_LIBRARY } from '../config/governanceCalibrationLibrary';
import { computeCalibrationAccuracy, statusForAccuracy, computeExpiryDate, type CertificationAttemptScore } from '../config/governanceAssessorCertificationEngine';
import type { AssessorCertification, AssessorCertificationStatus, GovernanceMaturityLevel } from '../types';

/** GACF Phase 2's own RBAC list — Super Admin, Governance Admin, Auditor,
 * Validator may attempt certification; every other role sees this page
 * read-only (the leaderboard below), per the blueprint's "Read-only
 * visibility for other roles." Enforced server-side too — see
 * @Roles on POST /assessor-certifications. */
const CERTIFICATION_ATTEMPT_ROLES = ['SUPER_ADMIN', 'GOVERNANCE_ADMIN', 'VALIDATOR', 'AUDITOR'];

const STATUS_TONE: Record<AssessorCertificationStatus, 'success' | 'warning' | 'danger'> = {
  'Certified Assessor': 'success',
  'Provisionally Certified': 'warning',
  'Needs Recalibration': 'danger',
};

export const AssessorCertificationPage: React.FC = () => {
  const { currentUser } = useAuth();
  const canAttempt = !!currentUser && CERTIFICATION_ATTEMPT_ROLES.includes(currentUser.role);
  const [certifications, setCertifications] = useState<AssessorCertification[]>(() => getAssessorCertifications());
  const [attempting, setAttempting] = useState(false);
  const [scores, setScores] = useState<Record<number, GovernanceMaturityLevel>>(() =>
    Object.fromEntries(GOVERNANCE_CALIBRATION_LIBRARY.map((_, i) => [i, 3 as GovernanceMaturityLevel]))
  );
  const [submitting, setSubmitting] = useState(false);
  const [lastResult, setLastResult] = useState<AssessorCertification | null>(null);

  useEffect(() => {
    bootstrapPersistence().then(() => setCertifications(getAssessorCertifications()));
  }, []);

  const latestByAssessor = useMemo(() => getLatestCertificationByAssessor(), [certifications]);
  const counts = useMemo(() => {
    const values = Array.from(latestByAssessor.values());
    return {
      certified: values.filter(c => c.certificationStatus === 'Certified Assessor').length,
      provisional: values.filter(c => c.certificationStatus === 'Provisionally Certified').length,
      needsRecalibration: values.filter(c => c.certificationStatus === 'Needs Recalibration').length,
    };
  }, [latestByAssessor]);

  const handleSubmitAttempt = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    try {
      const attempts: CertificationAttemptScore[] = GOVERNANCE_CALIBRATION_LIBRARY.map((_, scenarioIndex) => ({
        scenarioIndex,
        scoredLevel: scores[scenarioIndex],
      }));
      const calibrationAccuracy = computeCalibrationAccuracy(attempts);
      const certificationStatus = statusForAccuracy(calibrationAccuracy);
      const result = await recordAssessorCertification({
        assessorName: currentUser.name,
        assessorRole: currentUser.role,
        certificationStatus,
        calibrationAccuracy,
        scenariosAttempted: attempts.length,
        expiryDate: computeExpiryDate(new Date().toISOString().split('T')[0]),
      });
      setLastResult(result);
      setCertifications(getAssessorCertifications());
      setAttempting(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Assessor Certification</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Score the Calibration Library's benchmark scenarios and see how closely your judgment matches the calibrated reference score. Informational only — no workflow is gated by certification status.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Certified Assessors" value={counts.certified} icon="🏅" tone="success" />
        <KpiCard label="Provisionally Certified" value={counts.provisional} icon="🟡" tone="warning" />
        <KpiCard label="Needs Recalibration" value={counts.needsRecalibration} icon="🔁" tone="danger" caption="Recalibration Requirement Count" />
      </div>

      {!canAttempt && (
        <Card className="!p-4">
          <p className="text-[12.5px] text-[var(--text-secondary)]">
            Your role has read-only access to certification — the leaderboard below stays fully visible. Super Admin, Governance Admin, Validator and Auditor roles can attempt certification.
          </p>
        </Card>
      )}

      {canAttempt && !attempting && (
        <Card className="!p-5 flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="font-extrabold text-sm text-[var(--text-primary)]">Attempt Certification</p>
            <p className="text-[12px] text-[var(--text-secondary)] mt-0.5">Score {GOVERNANCE_CALIBRATION_LIBRARY.length} benchmark scenarios from the Calibration Library — one category each.</p>
          </div>
          <Button onClick={() => { setLastResult(null); setAttempting(true); }}>Start Attempt</Button>
        </Card>
      )}

      {canAttempt && attempting && (
        <Card className="!p-6 flex flex-col gap-5">
          <SectionHeader eyebrow="Certification Attempt" title="Score Each Benchmark Scenario" subtitle="Expected reference levels are hidden until you submit — this is a calibration check, not a lookup." icon="🎯" />
          {GOVERNANCE_CALIBRATION_LIBRARY.map((scenario, i) => (
            <div key={scenario.scenario} className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <p className="text-sm font-bold text-[var(--text-primary)]">{scenario.icon} {scenario.scenario}</p>
              <p className="text-[12.5px] text-[var(--text-secondary)]">{scenario.description}</p>
              <div className="flex items-center justify-between text-[12px] mt-1">
                <span className="font-semibold text-[var(--text-primary)]">Score: {scenario.categoryScore.category}</span>
                <span className="text-[11px] font-bold text-[var(--text-muted)]">{scores[i]}</span>
              </div>
              <input
                type="range"
                min={1}
                max={5}
                step={1}
                value={scores[i]}
                onChange={e => setScores(prev => ({ ...prev, [i]: Number(e.target.value) as GovernanceMaturityLevel }))}
                className="w-full accent-[var(--accent-primary)]"
              />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <Button onClick={handleSubmitAttempt} disabled={submitting}>{submitting ? 'Scoring…' : 'Submit Attempt'}</Button>
            <Button variant="ghost" onClick={() => setAttempting(false)} disabled={submitting}>Cancel</Button>
          </div>
        </Card>
      )}

      {lastResult && (
        <Card className="!p-6 flex flex-col gap-4">
          <SectionHeader eyebrow="Result" title="Certification Attempt Result" subtitle="Expected reference levels, revealed now that scoring is complete." icon="📊" />
          <div className="flex items-center gap-4 flex-wrap">
            <KpiCard label="Calibration Accuracy" value={`${lastResult.calibrationAccuracy}%`} tone={STATUS_TONE[lastResult.certificationStatus]} icon="🎯" />
            <span
              className="text-xs font-black uppercase px-3 py-1.5 rounded-lg"
              style={{ background: `var(--status-${STATUS_TONE[lastResult.certificationStatus]}-bg)`, color: `var(--status-${STATUS_TONE[lastResult.certificationStatus]})` }}
            >
              {lastResult.certificationStatus}
            </span>
          </div>
          <div className="flex flex-col gap-1.5">
            {GOVERNANCE_CALIBRATION_LIBRARY.map((scenario, i) => (
              <div key={scenario.scenario} className="flex items-center gap-3 text-[12px]">
                <span className="w-48 shrink-0 text-[var(--text-secondary)]">{scenario.icon} {scenario.scenario}</span>
                <span className="text-[var(--text-muted)]">you scored <b className="text-[var(--text-primary)]">{scores[i]}</b> · calibrated reference <b className="text-[var(--text-primary)]">{scenario.categoryScore.level}</b></span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <SectionHeader eyebrow="GACF" title="Certification History" subtitle="Most recent attempt first." icon="🗂️" />
        {certifications.length === 0 ? (
          <Card className="!p-8 text-center">
            <p className="text-sm text-[var(--text-secondary)]">No certification attempts recorded yet.</p>
          </Card>
        ) : (
          <div className="flex flex-col gap-2">
            {certifications.slice(0, 12).map(c => (
              <Card key={c.id} className="!p-3.5 flex items-center gap-3 flex-wrap">
                <span
                  className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                  style={{ background: `var(--status-${STATUS_TONE[c.certificationStatus]}-bg)`, color: `var(--status-${STATUS_TONE[c.certificationStatus]})` }}
                >
                  {c.certificationStatus}
                </span>
                <span className="text-[13px] font-bold text-[var(--text-primary)]">{c.assessorName}</span>
                <span className="text-[11px] text-[var(--text-muted)]">({c.assessorRole})</span>
                <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">{c.calibrationAccuracy}% accuracy</span>
                <span className="text-[11px] text-[var(--text-muted)]">{c.scenariosAttempted} scenarios · {c.certificationDate} → expires {c.expiryDate}</span>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
