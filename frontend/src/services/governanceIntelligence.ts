/**
 * OMG Phase 8 — Governance Intelligence Engine
 *
 * Derives the enterprise-level views that the Command Center and the Asset
 * Lifecycle module render: the eight-stage governance journey, executive KPIs,
 * portfolio readiness scoring, compliance readiness and the risk heatmap.
 *
 * This layer is purely derivational — it reads from the governance store and
 * never mutates it.
 */

import {
  getAssets,
  getGovernanceBlockers,
  getGovernanceMetrics,
  calculateAssetGovernanceScore,
  calculateAssetGovernanceHealthScore,
  calculateAssetComplianceScore,
} from './storageService';
import type {
  AIAsset,
  AssetJourneyPosition,
  AssetType,
  ExecutiveKpiSnapshot,
  GovernanceBlocker,
  GovernanceJourneyStage,
  JourneyStageKey,
  JourneyStageState,
  RiskLevel,
} from '../types';

export const JOURNEY_STAGES: {
  key: JourneyStageKey;
  label: string;
  icon: string;
  purpose: string;
}[] = [
  { key: 'asset', label: 'AI Asset', icon: '🗂️', purpose: 'Registered in the enterprise AI inventory.' },
  { key: 'ownership', label: 'Ownership', icon: '👥', purpose: 'Named accountability assigned across all five roles.' },
  { key: 'risk', label: 'Risk Review', icon: '⚡', purpose: 'Risk tier and data sensitivity formally classified.' },
  { key: 'validation', label: 'Validation', icon: '🧪', purpose: 'Independent validation performed and approved.' },
  { key: 'evidence', label: 'Evidence', icon: '📄', purpose: 'Governance deliverables filed and audit ready.' },
  { key: 'decision', label: 'Decision', icon: '⚖️', purpose: 'GO / CONDITIONAL GO / NO GO decision on record.' },
  { key: 'production', label: 'Production', icon: '🚀', purpose: 'Approved and operating in production.' },
  { key: 'monitoring', label: 'Monitoring', icon: '📡', purpose: 'Under continuous governance health monitoring.' },
];

function stageStatesForAsset(asset: AIAsset): Record<JourneyStageKey, JourneyStageState> {
  const score = calculateAssetGovernanceScore(asset.id);
  const health = calculateAssetGovernanceHealthScore(asset.id);
  const blockers = getGovernanceBlockers(asset.id);

  const blockedIn = (category: GovernanceBlocker['category']) =>
    blockers.some(b => b.category === category && (b.severity === 'Critical' || b.severity === 'High'));

  const pillarState = (
    passed: boolean,
    category: GovernanceBlocker['category']
  ): JourneyStageState => (passed ? 'approved' : blockedIn(category) ? 'blocked' : 'pending');

  const outcome = asset.decisionOutcome || 'PENDING';
  const decision: JourneyStageState =
    outcome === 'GO' || outcome === 'CONDITIONAL GO'
      ? 'approved'
      : outcome === 'NO GO'
        ? 'blocked'
        : 'pending';

  const opStatus = asset.operationalStatus || 'Active';
  const production: JourneyStageState =
    asset.status === 'Production' && opStatus === 'Active'
      ? 'approved'
      : opStatus === 'Suspended'
        ? 'blocked'
        : 'pending';

  const monitoring: JourneyStageState =
    health.healthStatus === 'Healthy'
      ? 'approved'
      : health.healthStatus === 'Attention Required'
        ? 'blocked'
        : 'pending';

  return {
    asset: 'approved',
    ownership: pillarState(score.ownership.passed, 'Ownership'),
    risk: pillarState(score.risk.passed, 'Risk'),
    validation: pillarState(score.validation.passed, 'Validation'),
    evidence: pillarState(score.evidence.passed, 'Evidence'),
    decision,
    production,
    monitoring,
  };
}

/** Phase 8C — portfolio position across the eight-stage governance journey. */
export function getGovernanceJourney(): GovernanceJourneyStage[] {
  const assets = getAssets();
  const states = assets.map(stageStatesForAsset);

  return JOURNEY_STAGES.map(meta => {
    let approved = 0;
    let pending = 0;
    let blocked = 0;

    states.forEach(state => {
      const value = state[meta.key];
      if (value === 'approved') approved++;
      else if (value === 'blocked') blocked++;
      else pending++;
    });

    const total = assets.length;
    return {
      ...meta,
      total,
      approved,
      pending,
      blocked,
      clearanceRate: total > 0 ? Math.round((approved / total) * 100) : 0,
    };
  });
}

/** Per-asset lifecycle position — powers the Asset Lifecycle module. */
export function getAssetJourneyPositions(): AssetJourneyPosition[] {
  return getAssets().map(asset => {
    const stageStates = stageStatesForAsset(asset);
    const score = calculateAssetGovernanceScore(asset.id);
    const health = calculateAssetGovernanceHealthScore(asset.id);

    // Furthest consecutively cleared stage.
    let currentStageIndex = 0;
    for (let i = 0; i < JOURNEY_STAGES.length; i++) {
      if (stageStates[JOURNEY_STAGES[i].key] === 'approved') currentStageIndex = i;
      else break;
    }

    return {
      assetId: asset.id,
      assetName: asset.name,
      assetType: asset.type,
      riskLevel: asset.riskLevel,
      currentStageIndex,
      currentStageLabel: JOURNEY_STAGES[currentStageIndex].label,
      stageStates,
      governanceScore: score.overallScore,
      healthScore: health.overallHealthScore,
      blockerCount: getGovernanceBlockers(asset.id).length,
    };
  });
}

/** Phase 8B — the eight executive KPIs surfaced on the Command Center. */
export function getExecutiveKpis(): ExecutiveKpiSnapshot {
  const metrics = getGovernanceMetrics();
  const assets = getAssets();

  const productionApproved = assets.filter(
    a => a.status === 'Production' && (a.operationalStatus || 'Active') === 'Active'
  ).length;

  const activeDecisions =
    metrics.decisionBreakdown['PENDING'] + metrics.decisionBreakdown['CONDITIONAL GO'];

  // Audit readiness blends evidence coverage, decision coverage and compliance,
  // then applies a penalty for unresolved findings.
  const evidenceCoverage =
    assets.length > 0
      ? Math.min(100, Math.round((metrics.totalEvidenceCount / (assets.length * 3)) * 100))
      : 0;
  const decisionCoverage =
    assets.length > 0
      ? Math.round(((assets.length - metrics.decisionBreakdown['PENDING']) / assets.length) * 100)
      : 0;
  const findingsPenalty = Math.min(30, metrics.openFindingsCount * 3);
  const auditReadiness = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        evidenceCoverage * 0.35 +
          decisionCoverage * 0.45 +
          metrics.tenantComplianceScore * 0.2 -
          findingsPenalty
      )
    )
  );

  return {
    totalGovernedAssets: metrics.totalAssets,
    productionApprovedAssets: productionApproved,
    highRiskAssets: metrics.riskBreakdown['High'] + metrics.riskBreakdown['Critical'],
    pendingReviews: metrics.pendingReviewsCount + metrics.upcomingReviewsCount,
    governanceBlockers: metrics.totalBlockersCount,
    activeDecisions,
    complianceHealth: metrics.tenantComplianceScore,
    auditReadiness,
  };
}

/**
 * Phase 8F — Governance Readiness Score.
 * Readiness = Ownership + Risk + Validation + Evidence + Decision, scored 0–100.
 */
export function getPortfolioReadinessScore(): {
  score: number;
  pillars: { label: string; score: number }[];
} {
  const assets = getAssets();
  const empty = ['Ownership', 'Risk', 'Validation', 'Evidence', 'Decision'].map(label => ({
    label,
    score: 0,
  }));

  if (assets.length === 0) return { score: 0, pillars: empty };

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
  const pillars = [
    { label: 'Ownership', score: Math.round(ownership / n) },
    { label: 'Risk', score: Math.round(risk / n) },
    { label: 'Validation', score: Math.round(validation / n) },
    { label: 'Evidence', score: Math.round(evidence / n) },
    { label: 'Decision', score: Math.round(decision / n) },
  ];

  return {
    score: Math.round(pillars.reduce((sum, p) => sum + p.score, 0) / pillars.length),
    pillars,
  };
}

/** Phase 8F — Compliance Readiness Meter buckets. */
export function getComplianceReadiness(): {
  auditReady: number;
  reviewRequired: number;
  nonCompliant: number;
} {
  let auditReady = 0;
  let reviewRequired = 0;
  let nonCompliant = 0;

  getAssets().forEach(asset => {
    const { status } = calculateAssetComplianceScore(asset.id);
    if (status === 'Compliant') auditReady++;
    else if (status === 'Partially Compliant') reviewRequired++;
    else nonCompliant++;
  });

  return { auditReady, reviewRequired, nonCompliant };
}

/** Phase 8B — Executive Risk Heatmap categories. */
export const HEATMAP_CATEGORIES: { label: string; icon: string; types: AssetType[] }[] = [
  { label: 'Applications', icon: '💻', types: ['Application'] },
  { label: 'Agents', icon: '🤖', types: ['Agent', 'Multi-Agent System'] },
  { label: 'Models', icon: '📈', types: ['Model', 'LLM'] },
  { label: 'Copilots', icon: '👥', types: ['Copilot'] },
  { label: 'RAG Systems', icon: '📚', types: ['RAG System'] },
  { label: 'Workflows & 3rd Party', icon: '🔌', types: ['AI Workflow', 'Third-Party AI Service'] },
];

export interface HeatmapRow {
  category: string;
  icon: string;
  cells: Record<RiskLevel, number>;
  total: number;
}

export function getRiskHeatmap(): HeatmapRow[] {
  const assets = getAssets();

  return HEATMAP_CATEGORIES.map(category => {
    const inCategory = assets.filter(a => category.types.includes(a.type));
    const cells: Record<RiskLevel, number> = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    inCategory.forEach(a => {
      cells[a.riskLevel] += 1;
    });
    return { category: category.label, icon: category.icon, cells, total: inCategory.length };
  });
}

/** Phase 8F — AI Portfolio Summary grouped the way executives think about it. */
export const PORTFOLIO_GROUPS: { label: string; icon: string; types: AssetType[] }[] = [
  { label: 'AI Applications', icon: '💻', types: ['Application'] },
  { label: 'Agents', icon: '🤖', types: ['Agent', 'Multi-Agent System'] },
  { label: 'Models', icon: '📈', types: ['Model'] },
  { label: 'Copilots', icon: '🧑‍💼', types: ['Copilot'] },
  { label: 'RAG Systems', icon: '📚', types: ['RAG System'] },
  { label: 'Third-Party AI', icon: '🔌', types: ['Third-Party AI Service'] },
  { label: 'LLMs & Workflows', icon: '🧠', types: ['LLM', 'AI Workflow'] },
];

export interface PortfolioGroupSummary {
  label: string;
  icon: string;
  count: number;
  production: number;
  highRisk: number;
  share: number;
}

export function getPortfolioSummary(): PortfolioGroupSummary[] {
  const assets = getAssets();
  const total = assets.length || 1;

  return PORTFOLIO_GROUPS.map(group => {
    const inGroup = assets.filter(a => group.types.includes(a.type));
    return {
      label: group.label,
      icon: group.icon,
      count: inGroup.length,
      production: inGroup.filter(a => a.status === 'Production').length,
      highRisk: inGroup.filter(a => a.riskLevel === 'High' || a.riskLevel === 'Critical').length,
      share: Math.round((inGroup.length / total) * 100),
    };
  });
}
