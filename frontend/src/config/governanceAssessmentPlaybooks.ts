/**
 * Governance Assessment Calibration & Consistency Framework (GACF).
 * Initiative 1 — Governance Assessment Playbooks. Structured assessment
 * guidance for each of the five Release 11 assessment types. Static
 * reference content, not a stored entity — the same "config, not schema"
 * pattern governanceBenchmarks.ts already established for Release 11.
 */

import type { GovernanceAssessmentType } from '../types';

export interface GovernanceAssessmentPlaybook {
  assessmentType: GovernanceAssessmentType;
  icon: string;
  objective: string;
  scope: string;
  evaluationCriteria: string[];
  weightingMethodology: string;
  requiredEvidence: string[];
  expectedOutputs: string[];
  scoringInterpretationGuidance: string;
}

export const GOVERNANCE_ASSESSMENT_PLAYBOOKS: GovernanceAssessmentPlaybook[] = [
  {
    assessmentType: 'Effectiveness',
    icon: '🧮',
    objective: 'Determine whether governance activity is measurably improving governance performance over time, not just whether it occurred.',
    scope: 'One AI asset, assessed against the six Effectiveness sub-factors (Evidence Compliance, Review Compliance, Findings Reduction, Reassessment Timeliness, Policy Adherence, Drift Resolution) at a single point in time.',
    evaluationCriteria: [
      'Ownership — are all four mandatory governance roles named and current?',
      'Evidence Management — is evidence complete, owned, and unexpired?',
      'Monitoring — are scheduled reviews being completed on cadence?',
      'Escalation — are reassessment triggers being actioned, not left open?',
      'Regulatory Alignment — are mapped policy obligations free of open violations?',
    ],
    weightingMethodology: 'Equal-weighted across the ten standardized categories (10% each) — see governanceScoringTemplates.ts. No category is weighted higher by default; a tenant that needs a different emphasis should say so explicitly rather than have it assumed.',
    requiredEvidence: ['Current Governance Authority Profile', 'Evidence Registry entries for this asset', 'Scheduled review history', 'Open reassessment triggers, if any', 'Mapped policy violations, if any'],
    expectedOutputs: ['One overall score (1-5, averaged across the ten categories)', 'A per-category score', 'Written evidence notes citing what was reviewed'],
    scoringInterpretationGuidance: 'A score of 5 in every category is rare and should be evidenced, not assumed — cite the specific record that justifies it. A 1 or 2 should name the specific gap, not just the low number, so the next assessor can verify whether it has closed.',
  },
  {
    assessmentType: 'Maturity',
    icon: '📶',
    objective: 'Place the governance program itself — not any one asset — on the Reactive-to-Optimized scale, domain by domain.',
    scope: 'The whole governance program, assessed once per domain (Governance Program, Evidence Management, Decision Governance, Compliance Management, Accountability, Continuous Assurance).',
    evaluationCriteria: [
      'Is the capability present at all, or absent (Reactive)?',
      'Is it applied inconsistently, dependent on individual effort (Managed)?',
      'Is it documented and applied consistently across the portfolio (Defined)?',
      'Is it measured, with tracked metrics feeding decisions (Measured)?',
      'Is it continuously improved based on those metrics (Optimized)?',
    ],
    weightingMethodology: 'Not weighted — maturity is a level per domain, not a blended score. Report each domain\'s level separately; do not average domains into one number, since a strong Evidence Management practice does not compensate for a weak Accountability practice.',
    requiredEvidence: ['Portfolio-wide activity data for the domain being assessed (see governanceMaturityEngine.ts for what already feeds this automatically)', 'Any documented process/procedure for the domain', 'Trend versus the last recorded snapshot, if one exists'],
    expectedOutputs: ['One level (1-5) per domain', 'A stated rationale for why this level and not one above or below it'],
    scoringInterpretationGuidance: 'Maturity is about the process, not a single asset\'s outcome — a well-governed flagship asset next to five ungoverned ones is Reactive, not Optimized, at the program level.',
  },
  {
    assessmentType: 'ROI',
    icon: '💰',
    objective: 'Sanity-check the ROI Engine\'s output against what an assessor actually observes, since every ROI figure is an estimate built on a stated assumption, not a measurement.',
    scope: 'Portfolio-wide, at a single point in time.',
    evaluationCriteria: [
      'Are the underlying assumption constants (hours per review, hourly rate, exposure avoided per finding) still realistic for this organization?',
      'Do the operational-savings and risk-avoidance figures pass a basic plausibility check against known headcount and incident history?',
    ],
    weightingMethodology: 'Not a scored assessment — ROI is validated for plausibility, not rated 1-5. Use the evidence-notes field to record whether the current assumption set needs adjusting.',
    requiredEvidence: ['Current ROI Engine output (see /governance-roi)', 'Actual hours spent on governance activity this period, if tracked outside OMG'],
    expectedOutputs: ['A plausibility judgment, recorded as evidence notes', 'A recommended adjustment to the assumption constants, if any'],
    scoringInterpretationGuidance: 'The goal is not to make the ROI number bigger — it is to keep it honest. An assessor who cannot defend an assumption to a CFO should flag it, not accept it.',
  },
  {
    assessmentType: 'Benchmarking',
    icon: '📐',
    objective: 'Confirm the industry benchmark comparison is being read correctly and is still the right reference set for this engagement.',
    scope: 'Portfolio-wide Effectiveness Score versus the configured industry benchmark.',
    evaluationCriteria: [
      'Is the benchmark industry selected still the correct one for this tenant?',
      'Is the gap being read as a conversation starter, not a pass/fail grade — these are illustrative reference points, not audited industry statistics?',
    ],
    weightingMethodology: 'Not a scored assessment — benchmarking is a comparison, not a rating.',
    requiredEvidence: ['Current Benchmarking page output (see /governance-benchmarking)'],
    expectedOutputs: ['Confirmation the benchmark set is appropriate, or a note that it should change'],
    scoringInterpretationGuidance: 'A negative gap is a starting point for investment prioritization, not evidence of failure — and a positive gap is not license to stop improving.',
  },
  {
    assessmentType: 'Regulatory Readiness',
    icon: '🌐',
    objective: 'Confirm this organization is actually ready if a regulation it is scoped under changed, not just that the coverage percentage looks acceptable.',
    scope: 'One or more active Regulatory Sources, cross-referenced against Release 12\'s Regulatory Change Readiness ranking.',
    evaluationCriteria: [
      'Applicability — does this source genuinely apply, per the active Governance Profile?',
      'Coverage — what fraction of controls have current, unexpired evidence?',
      'Gaps — are the specific gaps (missing control, missing evidence, missing ownership, missing review) closable in a realistic timeframe?',
      'Review cadence — is the source\'s own review date current, not overdue?',
    ],
    weightingMethodology: 'Equal-weighted across the ten standardized categories, same as Effectiveness — Regulatory Alignment and Auditability carry the most direct signal for this playbook, but all ten are still scored for consistency across playbooks.',
    requiredEvidence: ['Regulatory Change Readiness ranking for the source (see /regulatory-change-readiness)', 'The source\'s open gap list', 'Evidence Registry entries mapped to the source\'s controls'],
    expectedOutputs: ['One overall score (1-5)', 'A per-category score', 'A list of the gaps that most affect the score, prioritized'],
    scoringInterpretationGuidance: 'A source with 100% coverage but an overdue review date is not ready — recency of review is as much a readiness signal as coverage percentage.',
  },
];

export function getPlaybook(assessmentType: GovernanceAssessmentType): GovernanceAssessmentPlaybook | undefined {
  return GOVERNANCE_ASSESSMENT_PLAYBOOKS.find(p => p.assessmentType === assessmentType);
}
