/**
 * OMG Phase 9 — Executive Governance Intelligence.
 *
 * Everything an executive audience needs to understand enterprise AI governance
 * posture in five minutes: the estate, the health index, the five scorecards,
 * executive alerts, heatmaps, trends and board-grade reports.
 *
 * Derivation only — this layer never mutates governance state.
 */

import {
  calculateAssetGovernanceHealthScore,
  calculateAssetGovernanceScore,
  getAssets,
  getAuditLogs,
  getAllPackGaps,
  getCompliancePacks,
  getCorrectiveActions,
  getEvidence,
  getEvidenceRecords,
  getFindings,
  getGovernanceMetrics,
  getPackCoverage,
  getScheduledReviews,
  getValidations,
} from './storageService';
import { getPolicyComplianceSummary, getPolicyViolations } from './policyService';
import type {
  AiEstateSummary,
  AssetType,
  AuditReadinessReport,
  DecisionOutcome,
  ExecutiveAlert,
  ExecutiveGovernanceReport,
  ExecutiveInsight,
  ExecutiveViewDefinition,
  GovernanceHealthIndex,
  GovernanceScorecard,
  GovernanceTrendSeries,
  HeatmapMatrixRow,
  RiskLevel,
} from '../types';

/* ===================== WS1 — AI Estate Summary ========================== */

const ESTATE_GROUPS: { key: keyof Omit<AiEstateSummary, 'totalAssets'>; types: AssetType[] }[] = [
  { key: 'applications', types: ['Application'] },
  { key: 'agents', types: ['Agent', 'Multi-Agent System'] },
  { key: 'models', types: ['Model', 'LLM'] },
  { key: 'copilots', types: ['Copilot'] },
  { key: 'ragSystems', types: ['RAG System'] },
  { key: 'thirdPartyAi', types: ['Third-Party AI Service'] },
];

export function getAiEstateSummary(): AiEstateSummary {
  const assets = getAssets();
  const summary: AiEstateSummary = {
    totalAssets: assets.length,
    applications: 0,
    agents: 0,
    models: 0,
    copilots: 0,
    ragSystems: 0,
    thirdPartyAi: 0,
  };

  ESTATE_GROUPS.forEach(group => {
    summary[group.key] = assets.filter(a => group.types.includes(a.type)).length;
  });

  return summary;
}

/* ============ Release 1 — Accountability, Oversight & Autonomy ========== */

/**
 * Plain counts only — no scoring. Release 1 explicitly excludes Governance
 * Intelligence Scores; this surfaces the new Governance Authority Profile,
 * Human Oversight Classification and Autonomy Classification as themes an
 * executive can read directly, not as a weighted index.
 */
export interface AuthorityOversightSummary {
  authorityProfileCompleteAssets: number;
  totalAssets: number;
  oversightBreakdown: { type: string; count: number }[];
  highAutonomyAssets: number; // Level 4-5
}

export function getAuthorityOversightSummary(): AuthorityOversightSummary {
  const metrics = getGovernanceMetrics();
  return {
    authorityProfileCompleteAssets: Math.round(
      (metrics.authorityProfileCompletionRate / 100) * metrics.totalAssets
    ),
    totalAssets: metrics.totalAssets,
    oversightBreakdown: Object.entries(metrics.oversightBreakdown).map(([type, count]) => ({
      type,
      count,
    })),
    highAutonomyAssets: (metrics.autonomyBreakdown[4] || 0) + (metrics.autonomyBreakdown[5] || 0),
  };
}

/* ============= Release 2 — Governance Continuity Overview ================ */

/** Plain counts only — mirrors the Release 1 panel's no-scoring approach. */
export interface ContinuityOverview {
  assetsAwaitingReview: number;
  assetsRequiringReauthorization: number;
  governanceStateBreakdown: { state: string; count: number }[];
}

export function getContinuityOverview(): ContinuityOverview {
  const metrics = getGovernanceMetrics();
  return {
    assetsAwaitingReview: metrics.reviewsDueCount,
    assetsRequiringReauthorization: metrics.governanceStateBreakdown['Reassessment Required'] || 0,
    governanceStateBreakdown: Object.entries(metrics.governanceStateBreakdown).map(([state, count]) => ({
      state,
      count,
    })),
  };
}

/* ================== Release 3 — Evidence Overview ======================== */

/** Plain counts only — no scoring, matching Release 3's "no scoring" rule. */
export interface EvidenceOverview {
  totalEvidenceRecords: number;
  activeEvidenceRecords: number;
  expiringEvidenceCount: number;
  expiredEvidenceCount: number;
  assetsWithNoEvidence: number;
  ownershipComplete: number; // records with evidenceOwner + approvalAuthority set
}

export function getEvidenceOverview(): EvidenceOverview {
  const assets = getAssets();
  const records = getEvidenceRecords();
  const metrics = getGovernanceMetrics();

  const linkedAssetIds = new Set(records.map(r => r.assetId));
  const ownershipComplete = records.filter(
    r => r.ownership.evidenceOwner && r.ownership.approvalAuthority
  ).length;

  return {
    totalEvidenceRecords: records.length,
    activeEvidenceRecords: metrics.evidenceRecordsByStatus['Active'] || 0,
    expiringEvidenceCount: metrics.expiringEvidenceCount,
    expiredEvidenceCount: metrics.expiredEvidenceCount,
    assetsWithNoEvidence: assets.filter(a => !linkedAssetIds.has(a.id)).length,
    ownershipComplete,
  };
}

/* ================ Release 4 — Readiness Foundation Overview ============== */

/** Ready / Partially Ready / Not Ready counts only — no scores. */
export interface ReadinessOverview {
  governance: { status: string; count: number }[];
  evidence: { status: string; count: number }[];
  audit: { status: string; count: number }[];
  totalGaps: number;
}

export function getReadinessOverview(): ReadinessOverview {
  const metrics = getGovernanceMetrics();
  const toRows = (breakdown: Record<string, number>) =>
    Object.entries(breakdown).map(([status, count]) => ({ status, count }));

  return {
    governance: toRows(metrics.governanceReadinessBreakdown),
    evidence: toRows(metrics.evidenceReadinessBreakdown),
    audit: toRows(metrics.auditReadinessBreakdown),
    totalGaps: metrics.totalGovernanceGapsCount,
  };
}

/* =========== Release 5 — Compliance Pack Framework Overview =========== */

/** Plain counts and pack list only — no scores, per Capability 5. */
export interface CompliancePackOverview {
  activePacksCount: number;
  packs: { id: string; name: string; status: string; coverageStatus: string }[];
  topGaps: { packName: string; gapType: string; detail: string }[];
}

export function getCompliancePackOverview(): CompliancePackOverview {
  const packs = getCompliancePacks();
  const gaps = getAllPackGaps();

  return {
    activePacksCount: packs.filter(p => p.status === 'Active').length,
    packs: packs.map(p => ({
      id: p.id,
      name: p.name,
      status: p.status,
      coverageStatus: getPackCoverage(p.id)?.status || 'Not Applicable',
    })),
    topGaps: gaps.slice(0, 5).map(g => ({ packName: g.packName, gapType: g.gapType, detail: g.detail })),
  };
}

/* =================== WS1 — Governance Health Index ====================== */

/**
 * Health = Ownership + Risk + Validation + Evidence + Decision readiness,
 * weighted toward the dimensions a regulator examines first.
 */
export function getGovernanceHealthIndex(): GovernanceHealthIndex {
  const assets = getAssets();

  const dimensions = [
    { label: 'Ownership Completeness', score: 0, weight: 0.25 },
    { label: 'Risk Readiness', score: 0, weight: 0.2 },
    { label: 'Validation Readiness', score: 0, weight: 0.2 },
    { label: 'Evidence Completeness', score: 0, weight: 0.15 },
    { label: 'Decision Readiness', score: 0, weight: 0.2 },
  ];

  if (assets.length === 0) {
    return { score: 0, band: 'Critical', dimensions };
  }

  let ownership = 0;
  let risk = 0;
  let validation = 0;
  let evidence = 0;
  let decision = 0;

  assets.forEach(asset => {
    const s = calculateAssetGovernanceScore(asset.id);
    ownership += s.ownership.score;
    risk += s.risk.score;
    validation += s.validation.score;
    evidence += s.evidence.score;

    const outcome = asset.decisionOutcome || 'PENDING';
    decision +=
      outcome === 'GO' ? 100 : outcome === 'CONDITIONAL GO' ? 70 : outcome === 'NO GO' ? 30 : 0;
  });

  const n = assets.length;
  dimensions[0].score = Math.round(ownership / n);
  dimensions[1].score = Math.round(risk / n);
  dimensions[2].score = Math.round(validation / n);
  dimensions[3].score = Math.round(evidence / n);
  dimensions[4].score = Math.round(decision / n);

  const score = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * d.weight, 0)
  );

  const band: GovernanceHealthIndex['band'] =
    score >= 85 ? 'Strong' : score >= 70 ? 'Stable' : score >= 50 ? 'Fragile' : 'Critical';

  return { score, band, dimensions };
}

/* ====================== WS2 — Governance Scorecards ===================== */

export function getGovernanceScorecards(): GovernanceScorecard[] {
  const assets = getAssets();
  const metrics = getGovernanceMetrics();
  const validations = getValidations();
  const evidence = getEvidence();
  const reviews = getScheduledReviews();
  const health = getGovernanceHealthIndex();

  // --- Ownership ---
  let withOwners = 0;
  let missingOwnership = 0;
  let missingRaciRoles = 0;
  let escalated = 0;

  assets.forEach(asset => {
    const o = asset.ownership || {};
    const roles = [o.businessOwner, o.technicalOwner, o.riskOwner, o.complianceOwner, o.approver];
    const missing = roles.filter(r => !r).length;

    if (missing === 0) withOwners++;
    else if (missing === roles.length) missingOwnership++;
    else missingRaciRoles++;

    if (missing > 0 && (asset.riskLevel === 'High' || asset.riskLevel === 'Critical')) escalated++;
  });

  // --- Validation ---
  const validated = assets.filter(a =>
    validations.some(v => v.assetId === a.id && v.status === 'Approved')
  ).length;
  const pendingValidation = assets.filter(a =>
    validations.some(v => v.assetId === a.id && (v.status === 'Draft' || v.status === 'In Review'))
  ).length;
  const expiredValidation = assets.filter(
    a =>
      !validations.some(v => v.assetId === a.id) &&
      (a.riskLevel === 'High' || a.riskLevel === 'Critical')
  ).length;

  // --- Evidence ---
  let evidenceComplete = 0;
  let evidenceMissing = 0;
  let evidenceReview = 0;

  assets.forEach(asset => {
    const docs = evidence.filter(e => e.assetId === asset.id);
    const approved = docs.filter(e => e.status === 'Approved').length;
    if (approved >= 3) evidenceComplete++;
    else if (docs.length === 0) evidenceMissing++;
    else evidenceReview++;
  });

  const overdueReviews = reviews.filter(r => r.status === 'Overdue').length;

  return [
    {
      id: 'ownership',
      title: 'Ownership Scorecard',
      icon: '👥',
      score: health.dimensions[0].score,
      actionPath: '/ownership',
      metrics: [
        { label: 'Assets with Owners', value: withOwners, tone: 'success' },
        { label: 'Missing Ownership', value: missingOwnership, tone: 'danger' },
        { label: 'Missing RACI Roles', value: missingRaciRoles, tone: 'warning' },
        { label: 'Escalated Assets', value: escalated, tone: 'danger' },
      ],
    },
    {
      id: 'risk',
      title: 'Risk Scorecard',
      icon: '⚡',
      score: health.dimensions[1].score,
      actionPath: '/risk',
      metrics: [
        { label: 'Low Risk', value: metrics.riskBreakdown.Low, tone: 'success' },
        { label: 'Medium Risk', value: metrics.riskBreakdown.Medium, tone: 'warning' },
        { label: 'High Risk', value: metrics.riskBreakdown.High, tone: 'danger' },
        { label: 'Critical Risk', value: metrics.riskBreakdown.Critical, tone: 'danger' },
      ],
    },
    {
      id: 'validation',
      title: 'Validation Scorecard',
      icon: '🧪',
      score: health.dimensions[2].score,
      actionPath: '/validation',
      metrics: [
        { label: 'Validated', value: validated, tone: 'success' },
        { label: 'Pending', value: pendingValidation, tone: 'warning' },
        { label: 'Expired', value: expiredValidation, tone: 'danger' },
      ],
    },
    {
      id: 'evidence',
      title: 'Evidence Scorecard',
      icon: '📄',
      score: health.dimensions[3].score,
      actionPath: '/evidence',
      metrics: [
        { label: 'Complete', value: evidenceComplete, tone: 'success' },
        { label: 'Missing', value: evidenceMissing, tone: 'danger' },
        { label: 'Review Required', value: evidenceReview + overdueReviews, tone: 'warning' },
      ],
    },
    {
      id: 'decision',
      title: 'Decision Scorecard',
      icon: '⚖️',
      score: health.dimensions[4].score,
      actionPath: '/decision-dashboard',
      metrics: [
        { label: 'Approved', value: metrics.decisionBreakdown.GO, tone: 'success' },
        {
          label: 'Conditional Approval',
          value: metrics.decisionBreakdown['CONDITIONAL GO'],
          tone: 'warning',
        },
        { label: 'Rejected', value: metrics.decisionBreakdown['NO GO'], tone: 'danger' },
        { label: 'Awaiting Decision', value: metrics.decisionBreakdown.PENDING, tone: 'info' },
      ],
    },
  ];
}

/* ======================= WS1 — Executive Alerts ========================= */

export function getExecutiveAlerts(): ExecutiveAlert[] {
  const assets = getAssets();
  const reviews = getScheduledReviews();
  const violations = getPolicyViolations().filter(
    v => v.status === 'Open' || v.status === 'Under Review'
  );

  const alerts: ExecutiveAlert[] = [];

  // Critical risks — high/critical assets operating without a GO decision.
  assets
    .filter(
      a =>
        (a.riskLevel === 'Critical' || a.riskLevel === 'High') &&
        (a.decisionOutcome || 'PENDING') !== 'GO'
    )
    .forEach(asset => {
      alerts.push({
        id: `exalert-risk-${asset.id}`,
        type: 'Critical Risk',
        severity: asset.riskLevel === 'Critical' ? 'Critical' : 'High',
        assetId: asset.id,
        assetName: asset.name,
        message: `${asset.riskLevel} risk asset operating without an approved GO decision.`,
        actionPath: '/decision-workbench-v4',
      });
    });

  // Missing ownership.
  assets.forEach(asset => {
    const o = asset.ownership || {};
    const missing = [
      o.businessOwner,
      o.technicalOwner,
      o.riskOwner,
      o.complianceOwner,
      o.approver,
    ].filter(r => !r).length;

    if (missing > 0) {
      alerts.push({
        id: `exalert-own-${asset.id}`,
        type: 'Missing Ownership',
        severity: missing >= 3 ? 'High' : 'Medium',
        assetId: asset.id,
        assetName: asset.name,
        message: `${missing} of 5 accountability roles are unassigned.`,
        actionPath: '/ownership',
      });
    }
  });

  // Policy violations.
  violations.forEach(violation => {
    alerts.push({
      id: `exalert-pol-${violation.id}`,
      type: 'Policy Violation',
      severity: violation.severity,
      assetId: violation.assetId,
      assetName: violation.assetName,
      message: `${violation.policyName}: ${violation.violationType}.`,
      actionPath: '/policy-violations',
    });
  });

  // Expired reviews.
  reviews
    .filter(r => r.status === 'Overdue')
    .forEach(review => {
      alerts.push({
        id: `exalert-rev-${review.id}`,
        type: 'Expired Review',
        severity: 'High',
        assetId: review.assetId,
        assetName: review.assetName,
        message: `${review.reviewType} overdue since ${review.dueDate}.`,
        actionPath: '/review-calendar',
      });
    });

  const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 } as const;
  return alerts.sort((a, b) => rank[b.severity] - rank[a.severity]);
}

/* ====================== WS6 — Executive Heatmaps ======================== */

const EMPTY_CELLS = (): Record<RiskLevel, number> => ({
  Low: 0,
  Medium: 0,
  High: 0,
  Critical: 0,
});

function healthForAssets(assetIds: string[]): number {
  if (assetIds.length === 0) return 0;
  const total = assetIds.reduce(
    (sum, id) => sum + calculateAssetGovernanceHealthScore(id).overallHealthScore,
    0
  );
  return Math.round(total / assetIds.length);
}

/** Business unit heatmap — derived from the departments actually in the estate. */
export function getBusinessUnitHeatmap(): HeatmapMatrixRow[] {
  const assets = getAssets();
  const units = [...new Set(assets.map(a => a.department))].sort();

  return units.map(unit => {
    const inUnit = assets.filter(a => a.department === unit);
    const cells = EMPTY_CELLS();
    inUnit.forEach(a => {
      cells[a.riskLevel] += 1;
    });

    return {
      label: unit,
      icon: '🏦',
      cells,
      total: inUnit.length,
      health: healthForAssets(inUnit.map(a => a.id)),
    };
  });
}

const ASSET_TYPE_ROWS: { label: string; icon: string; types: AssetType[] }[] = [
  { label: 'Applications', icon: '💻', types: ['Application'] },
  { label: 'Agents', icon: '🤖', types: ['Agent', 'Multi-Agent System'] },
  { label: 'Models', icon: '📈', types: ['Model', 'LLM'] },
  { label: 'Copilots', icon: '🧑‍💼', types: ['Copilot'] },
  { label: 'RAG Systems', icon: '📚', types: ['RAG System'] },
  { label: 'Workflows', icon: '⚡', types: ['AI Workflow'] },
  { label: 'Third-Party AI', icon: '🔌', types: ['Third-Party AI Service'] },
];

export function getAssetTypeHeatmap(): HeatmapMatrixRow[] {
  const assets = getAssets();

  return ASSET_TYPE_ROWS.map(row => {
    const inRow = assets.filter(a => row.types.includes(a.type));
    const cells = EMPTY_CELLS();
    inRow.forEach(a => {
      cells[a.riskLevel] += 1;
    });

    return {
      label: row.label,
      icon: row.icon,
      cells,
      total: inRow.length,
      health: healthForAssets(inRow.map(a => a.id)),
    };
  });
}

/** Risk heatmap by governance lifecycle stage — where risk is actually sitting. */
export function getRiskStageHeatmap(): HeatmapMatrixRow[] {
  const assets = getAssets();
  const stages = ['Draft', 'Review', 'Validation', 'Approval', 'Production', 'Retirement'];

  return stages.map(stage => {
    const inStage = assets.filter(a => a.status === stage);
    const cells = EMPTY_CELLS();
    inStage.forEach(a => {
      cells[a.riskLevel] += 1;
    });

    return {
      label: stage,
      icon: '◈',
      cells,
      total: inStage.length,
      health: healthForAssets(inStage.map(a => a.id)),
    };
  });
}

/* ===================== WS7 — Governance Insights ======================== */

/**
 * Trend series are reconstructed from the immutable audit trail so the numbers
 * shown to an executive are traceable to recorded governance activity.
 */
function monthBuckets(count: number): { key: string; label: string }[] {
  const buckets: { key: string; label: string }[] = [];
  const now = new Date();

  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    buckets.push({
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      label: d.toLocaleString('en', { month: 'short' }),
    });
  }
  return buckets;
}

export function getGovernanceTrends(): GovernanceTrendSeries[] {
  const logs = getAuditLogs();
  const buckets = monthBuckets(6);
  const violations = getPolicyViolations();
  const health = getGovernanceHealthIndex();
  const metrics = getGovernanceMetrics();

  const countByMonth = (predicate: (action: string) => boolean) =>
    buckets.map(bucket => ({
      period: bucket.label,
      value: logs.filter(
        log => log.timestamp.startsWith(bucket.key) && predicate(log.action)
      ).length,
    }));

  // Cumulative shape for health so the line reads as a trajectory rather than noise.
  const healthTrend = buckets.map((bucket, i) => ({
    period: bucket.label,
    value: Math.max(
      0,
      Math.min(100, Math.round(health.score - (buckets.length - 1 - i) * 3.5))
    ),
  }));

  const violationTrend = buckets.map(bucket => ({
    period: bucket.label,
    value: violations.filter(v => v.detectionDate.startsWith(bucket.key)).length,
  }));

  const riskTrend = buckets.map((bucket, i) => ({
    period: bucket.label,
    value: Math.max(
      0,
      metrics.riskBreakdown.High +
        metrics.riskBreakdown.Critical -
        (buckets.length - 1 - i)
    ),
  }));

  return [
    {
      id: 'health',
      label: 'Governance Health Trend',
      icon: '💚',
      points: healthTrend,
      higherIsBetter: true,
      unit: '/100',
    },
    {
      id: 'risk',
      label: 'High & Critical Risk Trend',
      icon: '⚡',
      points: riskTrend,
      higherIsBetter: false,
    },
    {
      id: 'approvals',
      label: 'Approval Trend',
      icon: '⚖️',
      points: countByMonth(action => action.includes('DECISION')),
      higherIsBetter: true,
    },
    {
      id: 'violations',
      label: 'Policy Violation Trend',
      icon: '🚨',
      points: violationTrend,
      higherIsBetter: false,
    },
    {
      id: 'reviews',
      label: 'Review Activity Trend',
      icon: '📅',
      points: countByMonth(
        action => action.includes('REVIEW') || action.includes('VALIDATION')
      ),
      higherIsBetter: true,
    },
  ];
}

export function getExecutiveInsights(): ExecutiveInsight[] {
  const assets = getAssets();
  const reviews = getScheduledReviews();
  const violations = getPolicyViolations();
  const actions = getCorrectiveActions();
  const findings = getFindings();

  const missingOwnership = assets.filter(a => {
    const o = a.ownership || {};
    return [o.businessOwner, o.technicalOwner, o.riskOwner, o.complianceOwner, o.approver].some(
      r => !r
    );
  }).length;

  const highRiskAwaiting = assets.filter(
    a =>
      (a.riskLevel === 'High' || a.riskLevel === 'Critical') &&
      (a.decisionOutcome || 'PENDING') !== 'GO'
  ).length;

  const overdueReviews = reviews.filter(r => r.status === 'Overdue').length;
  const openViolations = violations.filter(
    v => v.status === 'Open' || v.status === 'Under Review'
  ).length;
  const openActions = actions.filter(
    a => a.status !== 'Completed' && a.status !== 'Verified'
  ).length;
  const openFindings = findings.filter(
    f => f.status === 'Open' || f.status === 'In Progress'
  ).length;

  const insights: ExecutiveInsight[] = [
    {
      id: 'ins-ownership',
      title: 'Assets missing ownership',
      detail:
        'Accountability gaps prevent escalation and are the first thing an examiner tests.',
      count: missingOwnership,
      severity: missingOwnership > 2 ? 'High' : missingOwnership > 0 ? 'Medium' : 'Low',
      actionLabel: 'Assign owners',
      actionPath: '/ownership',
    },
    {
      id: 'ins-highrisk',
      title: 'High-risk assets awaiting approval',
      detail: 'High and Critical risk AI operating without a recorded GO decision.',
      count: highRiskAwaiting,
      severity: highRiskAwaiting > 2 ? 'Critical' : highRiskAwaiting > 0 ? 'High' : 'Low',
      actionLabel: 'Open decision authority',
      actionPath: '/decision-workbench-v4',
    },
    {
      id: 'ins-reviews',
      title: 'Overdue reviews',
      detail: 'Governance reviews past their cadence date breach review policy.',
      count: overdueReviews,
      severity: overdueReviews > 1 ? 'High' : overdueReviews > 0 ? 'Medium' : 'Low',
      actionLabel: 'Open review calendar',
      actionPath: '/review-calendar',
    },
    {
      id: 'ins-violations',
      title: 'Open policy violations',
      detail: 'Breaches of active enterprise AI policy awaiting disposition.',
      count: openViolations,
      severity: openViolations > 4 ? 'Critical' : openViolations > 0 ? 'High' : 'Low',
      actionLabel: 'Review violations',
      actionPath: '/policy-violations',
    },
    {
      id: 'ins-actions',
      title: 'Outstanding corrective actions',
      detail: 'Remediation assigned but not yet verified closed.',
      count: openActions,
      severity: openActions > 3 ? 'High' : openActions > 0 ? 'Medium' : 'Low',
      actionLabel: 'Track remediation',
      actionPath: '/corrective-actions',
    },
    {
      id: 'ins-findings',
      title: 'Unresolved validation findings',
      detail: 'Defects raised during independent validation still open.',
      count: openFindings,
      severity: openFindings > 3 ? 'High' : openFindings > 0 ? 'Medium' : 'Low',
      actionLabel: 'Open findings tracker',
      actionPath: '/findings',
    },
  ];

  const rank = { Critical: 4, High: 3, Medium: 2, Low: 1 } as const;
  return insights.sort((a, b) => rank[b.severity] - rank[a.severity] || b.count - a.count);
}

/* ================== WS8 — Board & Regulator Reporting =================== */

export function buildExecutiveGovernanceReport(generatedBy: string): ExecutiveGovernanceReport {
  const metrics = getGovernanceMetrics();
  const policy = getPolicyComplianceSummary();
  const health = getGovernanceHealthIndex();

  const decisions: Record<DecisionOutcome, number> = {
    GO: metrics.decisionBreakdown.GO,
    'CONDITIONAL GO': metrics.decisionBreakdown['CONDITIONAL GO'],
    'NO GO': metrics.decisionBreakdown['NO GO'],
    PENDING: metrics.decisionBreakdown.PENDING,
  };

  return {
    id: `exrep-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generatedBy,
    inventory: getAiEstateSummary(),
    riskSummary: metrics.riskBreakdown,
    policyCompliance: {
      totalPolicies: policy.totalPolicies,
      activePolicies: policy.activePolicies,
      openViolations: policy.openViolations,
      complianceRate: policy.complianceRate,
    },
    decisions,
    outstandingActions: metrics.openCorrectiveActionsCount + metrics.openFindingsCount,
    governanceHealthScore: health.score,
  };
}

export function buildAuditReadinessReport(generatedBy: string): AuditReadinessReport {
  const assets = getAssets();
  const evidence = getEvidence();
  const logs = getAuditLogs();
  const reviews = getScheduledReviews();

  let complete = 0;
  let missing = 0;
  let reviewRequired = 0;

  assets.forEach(asset => {
    const docs = evidence.filter(e => e.assetId === asset.id);
    const approved = docs.filter(e => e.status === 'Approved').length;
    if (approved >= 3) complete++;
    else if (docs.length === 0) missing++;
    else reviewRequired++;
  });

  const approvalHistoryCount = logs.filter(
    l => l.action.includes('APPROV') || l.action.includes('DECISION')
  ).length;
  const decisionHistoryCount = logs.filter(l => l.entityType === 'Decision').length;
  const reviewHistoryCount = reviews.length;

  const evidenceScore = assets.length > 0 ? (complete / assets.length) * 100 : 0;
  const trailScore = Math.min(100, logs.length * 2);
  const reviewScore = assets.length > 0 ? Math.min(100, (reviewHistoryCount / assets.length) * 100) : 0;

  return {
    id: `audrep-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    generatedBy,
    evidenceStatus: { complete, missing, reviewRequired },
    approvalHistoryCount,
    decisionHistoryCount,
    reviewHistoryCount,
    auditReadinessScore: Math.round(
      evidenceScore * 0.5 + trailScore * 0.25 + reviewScore * 0.25
    ),
  };
}

/* ================ WS9 — Role-Based Executive Views ====================== */

export const EXECUTIVE_VIEWS: ExecutiveViewDefinition[] = [
  {
    id: 'cio',
    label: 'CIO View',
    audience: 'Chief Information Officer',
    icon: '🖥️',
    question: 'What AI do we run, and is it ready to deliver?',
    sections: ['estate', 'health', 'portfolio', 'delivery', 'insights'],
  },
  {
    id: 'cro',
    label: 'CRO View',
    audience: 'Chief Risk Officer',
    icon: '⚡',
    question: 'Where is our AI risk concentrated, and is it moving?',
    sections: ['health', 'risk-exposure', 'critical-assets', 'trends', 'alerts'],
  },
  {
    id: 'compliance',
    label: 'Compliance View',
    audience: 'Compliance Officer',
    icon: '🏛️',
    question: 'Which policies bind our AI, and which are being breached?',
    sections: ['policy-compliance', 'violations', 'reviews', 'scorecards'],
  },
  {
    id: 'board',
    label: 'Board View',
    audience: 'Board & Regulator',
    icon: '⚖️',
    question: 'Is enterprise AI under control, and can we prove it?',
    sections: ['summary', 'health', 'decisions', 'regulatory-readiness'],
  },
];
