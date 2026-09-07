/**
 * Governance Assessment Calibration & Consistency Framework (GACF).
 * Initiative 3 — Reference Assessment Library. Calibration examples, not
 * benchmark standards — the blueprint is explicit that these exist to show
 * how a score was reasoned about, not to define a target score any real
 * asset should hit.
 */

import type { AssetType, GovernanceAssessmentCategory, GovernanceClassification, GovernanceMaturityLevel, RiskLevel } from '../types';

export interface CalibrationExample {
  scenario: string;
  icon: string;
  description: string;
  rationale: string;
  exampleEvidence: string[];
  categoryScore: { category: GovernanceAssessmentCategory; level: GovernanceMaturityLevel };
  scoreExplanation: string;
  /** GACF Phase 2 ("Release 13 Extension") — dimension tags used by the
   * Assessor Certification benchmark (this scenario's categoryScore.level
   * becomes the accuracy target) and the Benchmark Recommendation Engine
   * (matched against a selected Use Case / Risk Category / Asset Type).
   * Optional, additive: no existing consumer of CalibrationExample reads
   * these fields. */
  assetType?: AssetType;
  riskCategory?: RiskLevel;
  useCase?: GovernanceClassification;
}

export const GOVERNANCE_CALIBRATION_LIBRARY: CalibrationExample[] = [
  {
    scenario: 'Internal Chatbot',
    icon: '💬',
    description: 'An internal-only Q&A chatbot answering employee questions about HR policy documents, with no access to personal or customer data.',
    rationale: 'Low decision impact and no sensitive data access argue for lighter-touch governance — the calibration question is whether "lighter touch" was a deliberate, documented decision or simply an oversight.',
    exampleEvidence: ['Asset registered with department and intended purpose', 'Data sensitivity marked Internal, not Confidential or PII'],
    categoryScore: { category: 'Risk Management', level: 3 },
    scoreExplanation: 'Scored 3 (Defined, not higher) — risk was assessed using the standard method, but only because the asset happened to go through the standard intake, not because a risk-tiering decision was deliberately applied to internal-only tools. A 4 would require evidence that low-risk internal tools are deliberately fast-tracked by policy, not by accident.',
    assetType: 'Agent',
    riskCategory: 'Low',
    useCase: 'Internal Productivity',
  },
  {
    scenario: 'HR Screening Solution',
    icon: '📋',
    description: 'An AI system that scores job applicant resumes to shortlist candidates for human recruiter review.',
    rationale: 'Direct impact on individuals\' employment opportunities places this firmly in higher-risk, higher-oversight territory regardless of technical sophistication.',
    exampleEvidence: ['Bias testing results on file', 'Human-in-the-loop oversight classification recorded', 'Adverse-impact review evidence'],
    categoryScore: { category: 'Auditability', level: 2 },
    scoreExplanation: 'Scored 2 (Managed) — an audit trail exists for the shortlisting decisions, but it was assembled manually after a candidate inquiry, not captured automatically at decision time. This is exactly the gap Auditability level 3+ requires closing: capture at the time of decision, not reconstruction after the fact.',
    assetType: 'Model',
    riskCategory: 'High',
    useCase: 'Decision Support',
  },
  {
    scenario: 'Customer Support Assistant',
    icon: '🎧',
    description: 'A customer-facing AI assistant that answers support questions and can access order history to personalize responses.',
    rationale: 'Customer-facing with access to personal order data, but decisions are informational rather than consequential — a wrong answer is correctable, not a lasting harm.',
    exampleEvidence: ['Evidence Registry entries for the assistant\'s response accuracy testing', 'Escalation path to a human agent, evidenced and tested'],
    categoryScore: { category: 'Escalation', level: 4 },
    scoreExplanation: 'Scored 4 (Measured) — escalation to a human agent is defined and consistently actioned (every low-confidence response routes to a human), but the timeliness of that handoff is not itself tracked as a metric, which is what a 5 would require.',
    assetType: 'Copilot',
    riskCategory: 'Medium',
    useCase: 'Customer Facing',
  },
  {
    scenario: 'KYC Verification Workflow',
    icon: '🪪',
    description: 'An AI-assisted Know Your Customer identity verification workflow used during account opening at a regulated financial institution.',
    rationale: 'Directly regulated activity with legal consequence for both the institution and the customer — this is a strong candidate for the platform\'s highest oversight tier regardless of the asset\'s own risk self-assessment.',
    exampleEvidence: ['Mapped regulatory obligations from an active Regulatory Source', 'Evidence Registry entries for verification accuracy and false-rejection-rate testing', 'A named Compliance Owner, not just a Technical Owner'],
    categoryScore: { category: 'Regulatory Alignment', level: 5 },
    scoreExplanation: 'Scored 5 (Optimized) — mapping is current, gaps are tracked and actively closed, and the asset appears in the Regulatory Change Readiness ranking with no open gaps. This is the calibration example for what a 5 actually requires: not just "mapped," but monitored for change readiness.',
    assetType: 'AI Workflow',
    riskCategory: 'Critical',
    useCase: 'Regulated AI',
  },
  {
    scenario: 'Credit Underwriting Solution',
    icon: '💳',
    description: 'A model that scores creditworthiness to inform loan approval decisions, with a human underwriter making the final call.',
    rationale: 'High decision impact (credit access), a protected-characteristics fairness dimension, and a regulated domain combine to demand the platform\'s most rigorous governance posture.',
    exampleEvidence: ['Full Governance Authority Profile including a named Risk Owner', 'Disparate-impact testing evidence, refreshed on a defined cadence', 'Human decision authority recorded via the Decision Workbench for every approval tier'],
    categoryScore: { category: 'Change Governance', level: 3 },
    scoreExplanation: 'Scored 3 (Defined) — reassessment triggers are defined for major model retraining events, but a change to the underlying data source (a common and material change for a credit model) was not covered by the same trigger set. A 4 would require the trigger categories to cover data source changes explicitly, not just model changes.',
    assetType: 'Model',
    riskCategory: 'Critical',
    useCase: 'Decision Support',
  },
];
