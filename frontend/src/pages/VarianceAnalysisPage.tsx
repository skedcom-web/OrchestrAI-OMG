import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getAssets, getGovernanceAssessmentRecords, getConfidenceAssessments, bootstrapPersistence } from '../services/storageService';
import { computeCrossSectionalVariance, computeInterRaterReliability } from '../config/governanceVarianceEngine';
import type { ConfidenceAssessment, ConfidenceLevel, GovernanceAssessmentRecord } from '../types';

const CONFIDENCE_WEIGHT: Record<ConfidenceLevel, number> = { High: 3, Medium: 2, Low: 1 };

/** GACF Phase 2, Reporting Enhancement — Assessment Confidence Index.
 * Weighted average of recorded confidence levels (High=3, Medium=2, Low=1),
 * displayed back as the nearest label rather than a bare number, since
 * "2.4" means nothing to a reader on its own. Also flags every High-Risk
 * asset carrying a Low-confidence assessment — the one combination the
 * blueprint specifically calls out as worth surfacing. */
function computeConfidenceIndex(
  confidenceAssessments: ConfidenceAssessment[],
  assessmentRecords: GovernanceAssessmentRecord[],
  highRiskAssetIds: Set<string>
) {
  const byRecordId = new Map(confidenceAssessments.map(c => [c.assessmentRecordId, c]));
  const levels = confidenceAssessments.map(c => c.confidenceLevel);
  const weighted = levels.length ? levels.reduce((s, l) => s + CONFIDENCE_WEIGHT[l], 0) / levels.length : null;
  const nearestLabel: ConfidenceLevel | null =
    weighted === null ? null : weighted >= 2.5 ? 'High' : weighted >= 1.5 ? 'Medium' : 'Low';
  const lowConfidenceCount = levels.filter(l => l === 'Low').length;

  const highRiskLowConfidence = assessmentRecords.filter(r => {
    const confidence = byRecordId.get(r.id);
    return confidence?.confidenceLevel === 'Low' && highRiskAssetIds.has(r.assetId);
  });

  return { averageWeighted: weighted, nearestLabel, lowConfidenceCount, totalRated: levels.length, highRiskLowConfidence };
}

function compute(records: GovernanceAssessmentRecord[]) {
  return {
    crossSectional: computeCrossSectionalVariance(records),
    interRater: computeInterRaterReliability(records),
  };
}

/**
 * GACF, Initiative 4: Variance & Reliability Analysis. Reports observed
 * dispersion only — no "acceptable variance" threshold is assumed or
 * displayed anywhere on this page, per the blueprint's explicit
 * instruction not to introduce an unsupported statistical claim.
 */
export const VarianceAnalysisPage: React.FC = () => {
  const [records, setRecords] = useState<GovernanceAssessmentRecord[]>(() => getGovernanceAssessmentRecords());
  const [confidenceAssessments, setConfidenceAssessments] = useState<ConfidenceAssessment[]>(() => getConfidenceAssessments());
  const [highRiskAssetIds, setHighRiskAssetIds] = useState<Set<string>>(() => new Set(getAssets().filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').map(a => a.id)));

  useEffect(() => {
    bootstrapPersistence().then(() => {
      setRecords(getGovernanceAssessmentRecords());
      setConfidenceAssessments(getConfidenceAssessments());
      setHighRiskAssetIds(new Set(getAssets().filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').map(a => a.id)));
    });
  }, []);

  const { crossSectional, interRater } = compute(records);
  const confidenceIndex = useMemo(() => computeConfidenceIndex(confidenceAssessments, records, highRiskAssetIds), [confidenceAssessments, records, highRiskAssetIds]);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Variance &amp; Reliability Analysis</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Observed dispersion in recorded assessment scores. No acceptable-variance threshold is assumed here — these are raw statistics for you to interpret, not a pass/fail gate.
        </p>
      </div>

      {records.length === 0 ? (
        <Card className="!p-8 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No assessments recorded yet — record one in the Assessment Center to see variance analysis here.</p>
        </Card>
      ) : (
        <>
          <SectionHeader eyebrow="Cross-Sectional" title="Dispersion by Assessment Type" subtitle="Across different assets — high dispersion here may be legitimate; different assets carry different risk." icon="📊" />
          {crossSectional.map(v => (
            <Card key={v.assessmentType} className="!p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <p className="font-extrabold text-sm text-[var(--text-primary)]">{v.assessmentType}</p>
                <span className="text-[11px] text-[var(--text-muted)]">{v.overallScoreDispersion.count} assessment(s)</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <KpiCard label="Mean" value={v.overallScoreDispersion.mean} icon="μ" tone="neutral" />
                <KpiCard label="Std. Deviation" value={v.overallScoreDispersion.standardDeviation} icon="σ" tone="neutral" />
                <KpiCard label="Range" value={v.overallScoreDispersion.range} caption={`${v.overallScoreDispersion.min}–${v.overallScoreDispersion.max}`} icon="↔" tone="neutral" />
                <KpiCard label="Coefficient of Variation" value={v.overallScoreDispersion.coefficientOfVariationPct !== null ? `${v.overallScoreDispersion.coefficientOfVariationPct}%` : '—'} icon="%" tone="neutral" />
                <KpiCard label="Sample Size" value={v.overallScoreDispersion.count} icon="n" tone="neutral" />
              </div>
              {v.categoryDispersion.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Per-Category Dispersion (Std. Dev.)</p>
                  {v.categoryDispersion
                    .slice()
                    .sort((a, b) => b.dispersion.standardDeviation - a.dispersion.standardDeviation)
                    .map(c => (
                      <div key={c.category} className="flex items-center gap-3 text-[12px]">
                        <span className="w-44 shrink-0 text-[var(--text-secondary)]">{c.category}</span>
                        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-sunken)' }}>
                          <div className="h-full rounded-full bg-[var(--accent-primary)]" style={{ width: `${Math.min(100, (c.dispersion.standardDeviation / 2) * 100)}%` }} />
                        </div>
                        <span className="tnum font-bold text-[var(--text-primary)] w-10 text-right">{c.dispersion.standardDeviation}</span>
                      </div>
                    ))}
                </div>
              )}
            </Card>
          ))}

          <SectionHeader
            eyebrow="Inter-Rater Reliability"
            title="Dispersion for the Same Asset"
            subtitle="Only assets with 2 or more recorded assessments — this is the more direct read on assessor-to-assessor consistency."
            icon="🎯"
          />
          {interRater.length === 0 ? (
            <Card className="!p-6 text-center">
              <p className="text-sm text-[var(--text-secondary)]">No asset has been assessed more than once yet — record a second assessment for the same asset to see inter-rater reliability here.</p>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              {interRater.map(a => (
                <Card key={a.assetId} className="!p-4 flex items-center gap-4 flex-wrap">
                  <p className="font-extrabold text-sm text-[var(--text-primary)] flex-1 min-w-[160px]">{a.assetName}</p>
                  <span className="text-[11px] text-[var(--text-muted)]">{a.assessmentCount} assessments</span>
                  <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">mean {a.overallScoreDispersion.mean}</span>
                  <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">σ {a.overallScoreDispersion.standardDeviation}</span>
                  <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">range {a.overallScoreDispersion.min}–{a.overallScoreDispersion.max}</span>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      <SectionHeader
        eyebrow="GACF Phase 2"
        title="Assessment Confidence Index"
        subtitle="How sure assessors were, not just what they scored — from the optional Confidence Scoring on each assessment."
        icon="🧭"
      />
      {confidenceIndex.totalRated === 0 ? (
        <Card className="!p-6 text-center">
          <p className="text-sm text-[var(--text-secondary)]">No assessment has recorded a confidence rating yet — it's an optional field in the Assessment Center.</p>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <KpiCard label="Confidence Index" value={confidenceIndex.nearestLabel || '—'} caption={`weighted average ${confidenceIndex.averageWeighted}/3 across ${confidenceIndex.totalRated} rated assessment(s)`} icon="🧭" tone="info" />
            <KpiCard label="Low Confidence Assessments" value={confidenceIndex.lowConfidenceCount} icon="⚠️" tone="warning" />
            <KpiCard label="High Risk + Low Confidence" value={confidenceIndex.highRiskLowConfidence.length} caption="Assessments needing a second look" icon="🚩" tone="danger" />
          </div>
          {confidenceIndex.highRiskLowConfidence.length > 0 && (
            <div className="flex flex-col gap-2">
              {confidenceIndex.highRiskLowConfidence.map(r => (
                <Card key={r.id} className="!p-3.5 flex items-center gap-3 flex-wrap">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[var(--status-danger-bg)] text-[var(--status-danger)]">High/Critical Risk</span>
                  <span className="text-[13px] font-bold text-[var(--text-primary)]">{r.assetName}</span>
                  <span className="tnum text-[12px] font-bold text-[var(--text-secondary)]">{r.overallScore}/5</span>
                  <span className="text-[11px] text-[var(--text-muted)]">by {r.assessorName} · {r.createdAt}</span>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
