import type { 
  AIAsset, 
  User, 
  AuditLog, 
  GovernanceMetrics, 
  DecisionRecord,
  ValidationRecord,
  EvidenceDocument,
  Finding,
  GovernanceScoreBreakdown,
  GovernanceBlocker,
  DecisionPackage,
  DecisionOutcome,
  ComplianceControl,
  ComplianceAssessmentRecord,
  ComplianceGap,
  CompliancePackage,
  ComplianceEvaluationStatus,
  OperationalStatus,
  KillSwitchRecord,
  OverrideRecord,
  GovernanceIncident,
  RetirementRecord,
  GovernanceTimelineEvent,
  GovernanceHealthBreakdown,
  GovernanceAlert,
  ScheduledReview,
  CorrectiveAction,
  GovernanceReviewPackage,
  GovernanceHealthStatus,
  ReassessmentTrigger,
  GovernanceReauthorizationRecord,
  GovernanceState,
  EvidenceRecord,
  EvidenceTimelineEvent,
  CompliancePack,
  ComplianceRequirement,
  PackControl,
  EvidenceMapping,
  RegulatorySource,
  RegulatoryRequirement,
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  GovernancePolicy,
  GovernanceFinding,
  GovernanceCondition,
  GovernancePolicyViolation,
  GovernanceOutcome,
  RecommendedAction,
  ConditionDefinition,
  OutcomeRule,
  ActionRule,
  GovernanceProfile,
  GovernanceDrift
} from '../types';
import {
  INITIAL_ASSETS,
  INITIAL_USERS,
  INITIAL_AUDIT_LOGS,
  INITIAL_VALIDATIONS,
  INITIAL_EVIDENCE,
  INITIAL_FINDINGS,
  SEEDED_COMPLIANCE_CONTROLS,
  INITIAL_COMPLIANCE_ASSESSMENTS,
  INITIAL_KILL_SWITCH_RECORDS,
  INITIAL_OVERRIDE_RECORDS,
  INITIAL_GOVERNANCE_INCIDENTS,
  INITIAL_RETIREMENT_RECORDS,
  INITIAL_GOVERNANCE_ALERTS,
  INITIAL_SCHEDULED_REVIEWS,
  INITIAL_CORRECTIVE_ACTIONS,
  INITIAL_REASSESSMENT_TRIGGERS,
  INITIAL_REAUTHORIZATION_RECORDS,
  INITIAL_EVIDENCE_RECORDS,
  INITIAL_COMPLIANCE_PACKS,
  INITIAL_COMPLIANCE_REQUIREMENTS,
  INITIAL_PACK_CONTROLS,
  INITIAL_EVIDENCE_MAPPINGS,
  INITIAL_REGULATORY_SOURCES,
  INITIAL_REGULATORY_REQUIREMENTS,
  INITIAL_OBLIGATIONS,
  INITIAL_OBLIGATION_CONTROLS,
  INITIAL_OBLIGATION_EVIDENCE_MAPPINGS,
  INITIAL_GOVERNANCE_POLICIES,
  INITIAL_GOVERNANCE_FINDINGS,
  INITIAL_RECOMMENDED_ACTIONS
} from './mockData';
import { getAuthorityMatrixEntry, defaultAuthorityProfile, authorityProfileCompleteness } from '../config/governanceAuthority';
import { defaultGovernanceState } from '../config/governanceContinuity';
import { getExpiryIndicator } from '../config/evidenceFoundation';
import {
  computeGovernanceReadiness,
  computeEvidenceReadiness,
  computeReviewReadiness,
  computeAuditReadiness,
  computeGovernanceGaps,
} from '../config/readinessFoundation';
import { computePackCoverage, computeRequirementCoverage, computePackGaps } from '../config/compliancePackFramework';
import {
  computeSourceCoverage,
  computeRequirementCoverage as computeRegulatoryRequirementCoverage,
  computeObligationCoverage,
  computeSourceGaps,
} from '../config/regulatoryKnowledgeEngine';
import {
  detectGovernanceConditions,
  evaluatePolicyViolations,
  computeGovernanceOutcome,
} from '../config/governanceReasoningEngine';
import { generateActionDrafts } from '../config/governanceActionsEngine';
import { buildDecisionTrace } from '../config/decisionTraceabilityEngine';
import type { DecisionTrace } from '../config/decisionTraceabilityEngine';
import { apiAssetRepository, apiEvidenceRepository, apiGovernanceRepository } from '../repositories/apiRepositories';
import {
  apiCompliancePackRepository,
  apiControlRepository,
  apiEvidenceMappingRepository,
  apiRequirementRepository,
  apiRegulatorySourceRepository,
  apiRegulatoryRequirementRepository,
  apiObligationRepository,
  apiObligationControlRepository,
  apiObligationEvidenceMappingRepository,
  apiGovernancePolicyRepository,
  apiGovernanceFindingRepository,
  apiRecommendedActionRepository,
  apiConditionDefinitionRepository,
  apiOutcomeRuleRepository,
  apiActionRuleRepository,
  apiGovernanceProfileRepository,
  apiDecisionRepository,
  apiGovernanceDriftRepository,
} from '../repositories/apiRepositories';

/**
 * Release 4.1 — "Demo Mode does NOT mean local storage." Neon is the only
 * System of Record for Assets, Evidence and Continuity records; local
 * storage is a paint-fast cache and offline fallback only, never primary.
 * A mutation that fails to reach Neon is surfaced to the caller (the promise
 * rejects) rather than silently accepted as "saved".
 */
function logPersistenceFailure(what: string, err: unknown) {
  console.error(`OMG persistence: failed to sync ${what} to Neon.`, err);
}

/** For internal side-effect saves (e.g. recalculating a score) that update
 * the in-memory cache synchronously and don't need the caller to await the
 * network round trip — still real, just not blocking. */
function fireAndForget(promise: Promise<unknown>, what: string) {
  promise.catch(err => logPersistenceFailure(what, err));
}

const STORAGE_KEYS = {
  ASSETS: 'omg_assets_v7',
  USERS: 'omg_users_v7',
  AUDIT_LOGS: 'omg_audit_logs_v7',
  RISK_ASSESSMENTS: 'omg_risk_assessments_v7',
  DECISIONS: 'omg_decisions_v7',
  VALIDATIONS: 'omg_validations_v7',
  EVIDENCE: 'omg_evidence_v7',
  FINDINGS: 'omg_findings_v7',
  PACKAGES: 'omg_decision_packages_v7',
  COMPLIANCE_ASSESSMENTS: 'omg_compliance_assessments_v7',
  COMPLIANCE_PACKAGES: 'omg_compliance_packages_v7',
  KILL_SWITCHES: 'omg_kill_switches_v7',
  OVERRIDES: 'omg_overrides_v7',
  INCIDENTS: 'omg_incidents_v7',
  RETIREMENTS: 'omg_retirements_v7',
  ALERTS: 'omg_alerts_v7',
  SCHEDULED_REVIEWS: 'omg_scheduled_reviews_v7',
  CORRECTIVE_ACTIONS: 'omg_corrective_actions_v7',
  HEALTH_PACKAGES: 'omg_health_packages_v7',
  REASSESSMENT_TRIGGERS: 'omg_reassessment_triggers_v7',
  REAUTHORIZATION_RECORDS: 'omg_reauthorization_records_v7',
  EVIDENCE_RECORDS: 'omg_evidence_records_v7',
  COMPLIANCE_PACKS: 'omg_compliance_packs_v7',
  COMPLIANCE_REQUIREMENTS: 'omg_compliance_requirements_v7',
  PACK_CONTROLS: 'omg_pack_controls_v7',
  EVIDENCE_MAPPINGS: 'omg_evidence_mappings_v7',
  REGULATORY_SOURCES: 'omg_regulatory_sources_v7',
  REGULATORY_REQUIREMENTS: 'omg_regulatory_requirements_v7',
  OBLIGATIONS: 'omg_obligations_v7',
  OBLIGATION_CONTROLS: 'omg_obligation_controls_v7',
  OBLIGATION_EVIDENCE_MAPPINGS: 'omg_obligation_evidence_mappings_v7',
  GOVERNANCE_POLICIES: 'omg_governance_policies_v7',
  GOVERNANCE_FINDINGS: 'omg_governance_findings_v7',
  RECOMMENDED_ACTIONS: 'omg_recommended_actions_v7',
  CONDITION_DEFINITIONS: 'omg_condition_definitions_v10',
  OUTCOME_RULES: 'omg_outcome_rules_v10',
  ACTION_RULES: 'omg_action_rules_v10',
  GOVERNANCE_PROFILES: 'omg_governance_profiles_v10',
  GOVERNANCE_DRIFTS: 'omg_governance_drifts_vnext',
};

function getItem<T>(key: string, defaultData: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultData;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultData;
  }
}

function setItem<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

// --- AUDIT LOG SERVICE ---
export function addAuditLog(
  userId: string,
  userName: string,
  userRole: string,
  action: string,
  entityType: AuditLog['entityType'],
  entityId: string,
  entityName: string,
  details: string
): AuditLog {
  const logs = getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
  const now = new Date();
  const timestamp = `${now.toISOString().split('T')[0]} ${now.toTimeString().split(' ')[0]}`;

  const newLog: AuditLog = {
    id: `log-${Date.now()}`,
    timestamp,
    userId,
    userName,
    userRole,
    action,
    entityType,
    entityId,
    entityName,
    details,
    ipAddress: '127.0.0.1 (Local)',
  };

  const updatedLogs = [newLog, ...logs];
  setItem(STORAGE_KEYS.AUDIT_LOGS, updatedLogs);
  return newLog;
}

export function getAuditLogs(): AuditLog[] {
  return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS);
}

// --- AI ASSETS SERVICE ---

/**
 * Release 1 — backfills authorityProfile / oversightType / autonomyLevel for
 * assets persisted before this release, so existing local demo data never
 * renders blank governance authority fields.
 */
/**
 * Release 2 — infers a governance state for assets that predate this release,
 * from their existing decision outcome and pipeline status. No automation:
 * this only backfills a sensible starting point, once, for display.
 */
function inferGovernanceState(asset: AIAsset): GovernanceState {
  if (asset.status === 'Retirement') return 'Retired';
  if (asset.decisionOutcome === 'NO GO') return 'No GO';
  if (asset.decisionOutcome === 'CONDITIONAL GO') return 'Conditional GO';
  if (asset.decisionOutcome === 'GO') {
    return asset.status === 'Production' ? 'Monitoring' : 'Authorized';
  }
  if (asset.status === 'Draft') return 'Draft';
  return 'Submitted';
}

function normalizeAsset(asset: AIAsset): AIAsset {
  const needsRelease1 = !asset.authorityProfile || !asset.oversightType || asset.autonomyLevel === undefined;
  const needsRelease2 = !asset.governanceClassification || !asset.governanceState || !asset.nextReviewDate;

  if (!needsRelease1 && !needsRelease2) return asset;

  const baseline = getAuthorityMatrixEntry(asset.riskLevel);
  const o = asset.ownership || {};

  return {
    ...asset,
    authorityProfile: asset.authorityProfile || {
      accountableOwner: o.businessOwner || o.approver || 'Unassigned',
      governanceSponsor: o.approver || o.businessOwner || 'Unassigned',
      riskOwner: o.riskOwner || 'Unassigned',
      technicalOwner: o.technicalOwner || 'Unassigned',
      complianceOwner: o.complianceOwner,
    },
    oversightType: asset.oversightType || baseline.oversightType,
    autonomyLevel: asset.autonomyLevel !== undefined ? asset.autonomyLevel : 2,
    governanceClassification: asset.governanceClassification || 'Internal Productivity',
    governanceState: asset.governanceState || inferGovernanceState(asset),
    nextReviewDate: asset.nextReviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  };
}

/** In-memory read cache, mirrored to localStorage for instant paint and
 * offline fallback only. Overwritten with live Neon data by bootstrapPersistence(). */
let assetsCache: AIAsset[] = getItem<AIAsset[]>(STORAGE_KEYS.ASSETS, INITIAL_ASSETS).map(normalizeAsset);

function persistAssetsCache() {
  setItem(STORAGE_KEYS.ASSETS, assetsCache);
}

/** Excludes archived assets — the default, everyday view every existing page already expects. */
export function getAssets(): AIAsset[] {
  return assetsCache.filter(a => !a.isArchived);
}

/** Q1 Stabilization — Phase 4: the Archived Assets view's data source. */
export function getArchivedAssets(): AIAsset[] {
  return assetsCache.filter(a => a.isArchived);
}

/** Q1 Stabilization — used by the local repository's includeArchived path. */
export function getAllAssetsIncludingArchived(): AIAsset[] {
  return assetsCache;
}

export function getAssetById(id: string): AIAsset | undefined {
  return assetsCache.find(a => a.id === id);
}

/**
 * Writes through to Neon and only resolves once the API has confirmed the
 * write; the in-memory/localStorage cache is updated optimistically first so
 * the UI reflects the change immediately either way.
 */
export async function saveAsset(assetData: Partial<AIAsset>): Promise<AIAsset> {
  const now = new Date().toISOString().split('T')[0];

  if (assetData.id) {
    const index = assetsCache.findIndex(a => a.id === assetData.id);
    if (index !== -1) {
      const updatedAsset: AIAsset = { ...assetsCache[index], ...assetData, updatedAt: now };
      assetsCache = [...assetsCache];
      assetsCache[index] = updatedAsset;
      persistAssetsCache();

      addAuditLog(
        'usr-1',
        'Sarah Jenkins',
        'SUPER_ADMIN',
        'ASSET_UPDATED',
        'Asset',
        updatedAsset.id,
        updatedAsset.name,
        `Updated asset details for ${updatedAsset.name} (Operational Status: ${updatedAsset.operationalStatus || 'Active'})`
      );

      const saved = await apiAssetRepository.updateAsset(updatedAsset.id, updatedAsset);
      const reconciled = normalizeAsset(saved);
      const i2 = assetsCache.findIndex(a => a.id === updatedAsset.id);
      if (i2 !== -1) {
        assetsCache = [...assetsCache];
        assetsCache[i2] = reconciled;
        persistAssetsCache();
      }
      return reconciled;
    }
  }

  const riskLevel = assetData.riskLevel || 'Medium';
  const baseline = getAuthorityMatrixEntry(riskLevel);

  const draftAsset: AIAsset = {
    id: `local-${Date.now()}`,
    name: assetData.name || 'New AI Asset',
    type: assetData.type || 'Agent',
    description: assetData.description || '',
    department: assetData.department || 'Enterprise AI',
    version: assetData.version || '1.0.0',
    status: assetData.status || 'Draft',
    operationalStatus: assetData.operationalStatus || 'Active',
    riskLevel,
    ownership: assetData.ownership || {},
    authorityProfile: assetData.authorityProfile || defaultAuthorityProfile(),
    oversightType: assetData.oversightType || baseline.oversightType,
    autonomyLevel: assetData.autonomyLevel !== undefined ? assetData.autonomyLevel : 1,
    governanceClassification: assetData.governanceClassification || 'Internal Productivity',
    governanceState: assetData.governanceState || defaultGovernanceState(),
    nextReviewDate: assetData.nextReviewDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    techStack: assetData.techStack || [],
    dataSensitivity: assetData.dataSensitivity || 'Confidential',
    validationScore: 0,
    createdAt: now,
    updatedAt: now,
    decisionOutcome: 'PENDING',
    tags: assetData.tags || [],
  };

  assetsCache = [draftAsset, ...assetsCache];
  persistAssetsCache();

  addAuditLog(
    'usr-1',
    'Sarah Jenkins',
    'SUPER_ADMIN',
    'ASSET_CREATED',
    'Asset',
    draftAsset.id,
    draftAsset.name,
    `Registered new AI asset ${draftAsset.name} [${draftAsset.type}] in ${draftAsset.department}`
  );

  const { id: _draftId, ...payload } = draftAsset;
  const created = normalizeAsset(await apiAssetRepository.createAsset(payload));
  assetsCache = assetsCache.map(a => (a.id === draftAsset.id ? created : a));
  persistAssetsCache();
  return created;
}

/**
 * Q1 Stabilization — Phase 3: soft delete/archive model. The asset row is
 * never removed — evidence, findings, decisions, incidents and every other
 * cascaded governance record it owns stays intact, reachable from the
 * Archived Assets view (getArchivedAssets) for as long as it stays archived.
 */
export async function archiveAsset(id: string, archivedBy: string, archiveReason: string): Promise<void> {
  const index = assetsCache.findIndex(a => a.id === id);
  if (index === -1) return;
  const target = assetsCache[index];
  const archivedAt = new Date().toISOString().split('T')[0];

  assetsCache = [...assetsCache];
  assetsCache[index] = {
    ...target,
    status: 'Retirement',
    isArchived: true,
    archivedAt,
    archivedBy,
    archiveReason,
  };
  persistAssetsCache();

  addAuditLog(
    'usr-1',
    archivedBy,
    'GOVERNANCE_ADMIN',
    'ASSET_ARCHIVED',
    'Asset',
    id,
    target.name,
    `Archived asset ${target.name}. Reason: ${archiveReason}`
  );

  await apiAssetRepository.archiveAsset(id, archivedBy, archiveReason);
}

/** Q1 Stabilization — Phase 4: reverses an archive; the asset returns to the default (non-archived) view. */
export async function restoreAsset(id: string): Promise<void> {
  const index = assetsCache.findIndex(a => a.id === id);
  if (index === -1) return;
  const target = assetsCache[index];

  assetsCache = [...assetsCache];
  assetsCache[index] = {
    ...target,
    isArchived: false,
    archivedAt: undefined,
    archivedBy: undefined,
    archiveReason: undefined,
  };
  persistAssetsCache();

  addAuditLog(
    'usr-1',
    'Sarah Jenkins',
    'GOVERNANCE_ADMIN',
    'ASSET_RESTORED',
    'Asset',
    id,
    target.name,
    `Restored archived asset ${target.name}.`
  );

  await apiAssetRepository.restoreAsset(id);
  await refreshAssetFromServer(id);
}

async function refreshAssetFromServer(id: string): Promise<void> {
  try {
    const fresh = await apiAssetRepository.getAssets(true);
    const match = fresh.find(a => a.id === id);
    if (!match) return;
    const index = assetsCache.findIndex(a => a.id === id);
    if (index === -1) return;
    assetsCache = [...assetsCache];
    assetsCache[index] = normalizeAsset(match);
    persistAssetsCache();
  } catch {
    // best-effort reconciliation only — the optimistic local update already stands
  }
}

export function updateAssetOperationalStatus(id: string, operationalStatus: OperationalStatus, user: string): void {
  const asset = getAssetById(id);
  if (!asset) return;

  fireAndForget(saveAsset({ id, operationalStatus }), `operational status for ${asset.name}`);

  addAuditLog(
    'usr-1',
    user,
    'GOVERNANCE_ADMIN',
    'OPERATIONAL_STATUS_CHANGED',
    'Asset',
    id,
    asset.name,
    `Changed operational status of ${asset.name} to '${operationalStatus}'`
  );
}

// --- USERS SERVICE ---
export function getUsers(): User[] {
  return getItem<User[]>(STORAGE_KEYS.USERS, INITIAL_USERS);
}

export function saveUser(userData: Partial<User>): User {
  const users = getUsers();
  if (userData.id) {
    const index = users.findIndex(u => u.id === userData.id);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
      setItem(STORAGE_KEYS.USERS, users);
      return users[index];
    }
  }

  const newUser: User = {
    id: `usr-${Date.now().toString().slice(-4)}`,
    name: userData.name || 'New User',
    email: userData.email || '',
    role: userData.role || 'GOVERNANCE_ADMIN',
    department: userData.department || 'AI Governance Office',
    status: 'Active',
    assignedAssetsCount: 0,
  };

  const updated = [newUser, ...users];
  setItem(STORAGE_KEYS.USERS, updated);
  return newUser;
}

export function toggleUserStatus(id: string): void {
  const users = getUsers();
  const index = users.findIndex(u => u.id === id);
  if (index !== -1) {
    users[index].status = users[index].status === 'Active' ? 'Inactive' : 'Active';
    setItem(STORAGE_KEYS.USERS, users);
  }
}

// --- VALIDATION SERVICE ---
export function getValidations(): ValidationRecord[] {
  return getItem<ValidationRecord[]>(STORAGE_KEYS.VALIDATIONS, INITIAL_VALIDATIONS);
}

export function saveValidation(valData: Partial<ValidationRecord>): ValidationRecord {
  const validations = getValidations();
  const now = new Date().toISOString().split('T')[0];

  if (valData.id) {
    const idx = validations.findIndex(v => v.id === valData.id);
    if (idx !== -1) {
      validations[idx] = { ...validations[idx], ...valData, reviewDate: now };
      setItem(STORAGE_KEYS.VALIDATIONS, validations);
      recalculateAssetValidationScore(validations[idx].assetId);
      return validations[idx];
    }
  }

  const newVal: ValidationRecord = {
    id: `val-${Date.now().toString().slice(-4)}`,
    assetId: valData.assetId || 'ast-101',
    assetName: valData.assetName || 'AI Asset',
    category: valData.category || 'Business',
    reviewer: valData.reviewer || 'Dr. Aris Thorne',
    reviewerRole: valData.reviewerRole || 'VALIDATOR',
    reviewDate: now,
    status: valData.status || 'In Review',
    score: valData.score ?? 100,
    findings: valData.findings || '',
    recommendations: valData.recommendations || '',
    evidenceRefs: valData.evidenceRefs || [],
  };

  const updated = [newVal, ...validations];
  setItem(STORAGE_KEYS.VALIDATIONS, updated);

  addAuditLog(
    'usr-5',
    newVal.reviewer,
    newVal.reviewerRole,
    'VALIDATION_SUBMITTED',
    'Validation',
    newVal.id,
    newVal.assetName,
    `Submitted ${newVal.category} Validation for ${newVal.assetName}. Outcome: ${newVal.status} (Score: ${newVal.score})`
  );

  recalculateAssetValidationScore(newVal.assetId);
  return newVal;
}

function recalculateAssetValidationScore(assetId: string) {
  const validations = getValidations().filter(v => v.assetId === assetId && v.status === 'Approved');
  const asset = getAssetById(assetId);
  if (!asset) return;

  if (validations.length === 0) {
    asset.validationScore = 0;
  } else {
    const totalScore = validations.reduce((acc, v) => acc + v.score, 0);
    asset.validationScore = Math.round(totalScore / validations.length);
  }
  fireAndForget(saveAsset(asset), `validation score for ${asset.name}`);
}

// --- EVIDENCE SERVICE ---
export function getEvidence(): EvidenceDocument[] {
  return getItem<EvidenceDocument[]>(STORAGE_KEYS.EVIDENCE, INITIAL_EVIDENCE);
}

export function saveEvidence(evdData: Partial<EvidenceDocument>): EvidenceDocument {
  const evidenceList = getEvidence();
  const now = new Date().toISOString().split('T')[0];

  if (evdData.id) {
    const idx = evidenceList.findIndex(e => e.id === evdData.id);
    if (idx !== -1) {
      evidenceList[idx] = { ...evidenceList[idx], ...evdData };
      setItem(STORAGE_KEYS.EVIDENCE, evidenceList);
      return evidenceList[idx];
    }
  }

  const newEvd: EvidenceDocument = {
    id: `evd-${Date.now().toString().slice(-4)}`,
    title: evdData.title || 'New Governance Evidence Document',
    category: evdData.category || 'Business Evidence',
    deliverableType: evdData.deliverableType || 'Functional Requirements Specification',
    assetId: evdData.assetId || 'ast-101',
    assetName: evdData.assetName || 'AI Asset',
    uploadedBy: evdData.uploadedBy || 'Sarah Jenkins',
    uploadDate: now,
    version: evdData.version || '1.0',
    status: evdData.status || 'Submitted',
    description: evdData.description || '',
  };

  const updated = [newEvd, ...evidenceList];
  setItem(STORAGE_KEYS.EVIDENCE, updated);

  addAuditLog(
    'usr-1',
    newEvd.uploadedBy,
    'BUSINESS_OWNER',
    'EVIDENCE_UPLOADED',
    'Evidence',
    newEvd.id,
    newEvd.title,
    `Uploaded ${newEvd.deliverableType} [${newEvd.category}] for ${newEvd.assetName}`
  );

  return newEvd;
}

// --- FINDINGS SERVICE ---
export function getFindings(): Finding[] {
  return getItem<Finding[]>(STORAGE_KEYS.FINDINGS, INITIAL_FINDINGS);
}

export function saveFinding(findingData: Partial<Finding>): Finding {
  const findings = getFindings();
  const now = new Date().toISOString().split('T')[0];

  if (findingData.id) {
    const idx = findings.findIndex(f => f.id === findingData.id);
    if (idx !== -1) {
      findings[idx] = { ...findings[idx], ...findingData };
      setItem(STORAGE_KEYS.FINDINGS, findings);
      return findings[idx];
    }
  }

  const newFinding: Finding = {
    id: `fnd-${Date.now().toString().slice(-4)}`,
    title: findingData.title || 'Governance Finding',
    assetId: findingData.assetId || 'ast-101',
    assetName: findingData.assetName || 'AI Asset',
    severity: findingData.severity || 'Medium',
    status: findingData.status || 'Open',
    assignedTo: findingData.assignedTo || 'Sarah Jenkins',
    reportedBy: findingData.reportedBy || 'Dr. Aris Thorne',
    reportedDate: now,
    description: findingData.description || '',
  };

  const updated = [newFinding, ...findings];
  setItem(STORAGE_KEYS.FINDINGS, updated);

  addAuditLog(
    'usr-5',
    newFinding.reportedBy,
    'VALIDATOR',
    'FINDING_CREATED',
    'Finding',
    newFinding.id,
    newFinding.title,
    `Logged ${newFinding.severity} severity finding: ${newFinding.title} for ${newFinding.assetName}`
  );

  return newFinding;
}

// --- DECISION GATEKEEPER & PACKAGE SERVICE ---

/** vNext — Governance Intelligence, Module 2. Read access for decision
 * history; the table has existed since Release 1 but had no getter until now. */
export function getDecisions(): DecisionRecord[] {
  return getItem<DecisionRecord[]>(STORAGE_KEYS.DECISIONS, []);
}

export function getDecisionsForAsset(assetId: string): DecisionRecord[] {
  return getDecisions().filter(d => d.assetId === assetId);
}

/**
 * vNext — decisionType/authorityRole/linkedEvidenceIds are additive and
 * optional (see DecisionRecord in types/index.ts); callers that don't pass
 * them get the same behaviour as before. Local write stays synchronous (no
 * existing call site awaits this), the Neon sync — new with vNext, this
 * table was local-only before — runs fire-and-forget after, same pattern
 * `saveAsset`'s callers already rely on elsewhere in this function.
 */
export function recordDecision(recordData: Partial<DecisionRecord>): DecisionRecord {
  const decisions = getItem<DecisionRecord[]>(STORAGE_KEYS.DECISIONS, []);
  const now = new Date().toISOString().split('T')[0];

  const newRecord: DecisionRecord = {
    id: `dec-${Date.now().toString().slice(-4)}`,
    assetId: recordData.assetId || '',
    outcome: recordData.outcome || 'PENDING',
    checklist: recordData.checklist || {
      ownershipComplete: false,
      riskAssessmentComplete: false,
      requiredReviewsComplete: false,
      validationComplete: false,
      monitoringDefined: false,
      auditRequirementsMet: false,
      humanOverrideAvailable: false,
      killSwitchDefined: false,
    },
    decisionOwner: recordData.decisionOwner || 'David Chen',
    decisionDate: now,
    justification: recordData.justification || '',
    conditions: recordData.conditions || [],
    decisionType: recordData.decisionType,
    authorityRole: recordData.authorityRole,
    linkedEvidenceIds: recordData.linkedEvidenceIds || [],
  };

  const updated = [newRecord, ...decisions];
  setItem(STORAGE_KEYS.DECISIONS, updated);

  const { id: _localId, decisionDate: _dd, conditions: _c, ...payload } = newRecord;
  fireAndForget(apiDecisionRepository.createDecision(payload), `decision record for asset ${newRecord.assetId}`);

  if (recordData.assetId) {
    const asset = getAssetById(recordData.assetId);
    if (asset) {
      asset.decisionOutcome = recordData.outcome;
      if (recordData.outcome === 'GO') asset.status = 'Production';
      fireAndForget(saveAsset(asset), `decision outcome for ${asset.name}`);
    }
  }

  addAuditLog(
    'usr-2',
    newRecord.decisionOwner,
    'GOVERNANCE_ADMIN',
    'DECISION_EXECUTED',
    'Decision',
    newRecord.assetId,
    'Decision Gatekeeper',
    `Executed Decision Outcome: ${newRecord.outcome}. Justification: ${newRecord.justification}`
  );

  return newRecord;
}

export function generateDecisionPackage(assetId: string, authorName: string): DecisionPackage {
  const packages = getItem<DecisionPackage[]>(STORAGE_KEYS.PACKAGES, []);
  const asset = getAssetById(assetId) || getAssets()[0];
  const scoreBreakdown = calculateAssetGovernanceScore(asset.id);
  const evidence = getEvidence().filter(e => e.assetId === asset.id);
  const findings = getFindings().filter(f => f.assetId === asset.id);
  const now = new Date().toISOString().split('T')[0];

  const pkg: DecisionPackage = {
    id: `pkg-${Date.now().toString().slice(-4)}`,
    assetId: asset.id,
    assetName: asset.name,
    assetType: asset.type,
    generatedAt: now,
    generatedBy: authorName,
    governanceScore: scoreBreakdown.overallScore,
    readinessTier: scoreBreakdown.readinessTier,
    recommendedOutcome: scoreBreakdown.recommendedOutcome,
    actualOutcome: asset.decisionOutcome || scoreBreakdown.recommendedOutcome,
    justification: `Executive Decision Briefing Package generated for ${asset.name}. Governance score: ${scoreBreakdown.overallScore}/100.`,
    deliverablesCount: evidence.length,
    findingsCount: findings.length,
    ownersSummary: asset.ownership || {},
  };

  const updated = [pkg, ...packages];
  setItem(STORAGE_KEYS.PACKAGES, updated);

  addAuditLog(
    'usr-1',
    authorName,
    'GOVERNANCE_ADMIN',
    'DECISION_PACKAGE_GENERATED',
    'DecisionPackage',
    pkg.id,
    pkg.assetName,
    `Generated Executive Governance Decision Briefing Package for ${pkg.assetName}`
  );

  return pkg;
}

// --- PHASE 4 & 5 CALCULATIONS ---
export function calculateAssetGovernanceScore(assetId: string): GovernanceScoreBreakdown {
  const asset = getAssetById(assetId);
  const validations = getValidations().filter(v => v.assetId === assetId);
  const evidence = getEvidence().filter(e => e.assetId === assetId);
  const findings = getFindings().filter(f => f.assetId === assetId);

  if (!asset) {
    return {
      ownership: { score: 0, passed: false, message: 'Asset not found' },
      risk: { score: 0, passed: false, message: 'Asset not found' },
      validation: { score: 0, passed: false, message: 'Asset not found' },
      evidence: { score: 0, passed: false, message: 'Asset not found' },
      findings: { score: 0, passed: false, message: 'Asset not found' },
      overallScore: 0,
      readinessTier: 'Not Ready',
      recommendedOutcome: 'NO GO',
    };
  }

  const o = asset.ownership || {};
  const ownershipPassed = !!(o.businessOwner && o.technicalOwner && o.riskOwner);
  const ownershipScore = ownershipPassed ? 20 : o.businessOwner ? 10 : 0;

  const riskPassed = !!asset.riskLevel && asset.riskLevel !== 'Low';
  const riskScore = riskPassed ? 20 : 10;

  const approvedVals = validations.filter(v => v.status === 'Approved');
  const valPassed = approvedVals.length > 0 && (asset.validationScore || 0) >= 80;
  const validationScore = valPassed ? 20 : approvedVals.length > 0 ? 10 : 0;

  const approvedEvd = evidence.filter(e => e.status === 'Approved');
  const evidencePassed = approvedEvd.length > 0;
  const evidenceScore = evidencePassed ? 20 : evidence.length > 0 ? 10 : 0;

  const criticalOpen = findings.some(f => f.severity === 'Critical' && f.status !== 'Resolved' && f.status !== 'Verified');
  const highOpen = findings.some(f => f.severity === 'High' && f.status !== 'Resolved' && f.status !== 'Verified');
  const findingsPassed = !criticalOpen && !highOpen;
  const findingsScore = findingsPassed ? 20 : criticalOpen ? 0 : 10;

  const overallScore = ownershipScore + riskScore + validationScore + evidenceScore + findingsScore;

  let readinessTier: 'Ready' | 'Conditionally Ready' | 'Not Ready' = 'Not Ready';
  let recommendedOutcome: DecisionOutcome = 'NO GO';

  if (overallScore >= 90 && !criticalOpen) {
    readinessTier = 'Ready';
    recommendedOutcome = 'GO';
  } else if (overallScore >= 70 && !criticalOpen) {
    readinessTier = 'Conditionally Ready';
    recommendedOutcome = 'CONDITIONAL GO';
  } else {
    readinessTier = 'Not Ready';
    recommendedOutcome = 'NO GO';
  }

  return {
    ownership: {
      score: ownershipScore,
      passed: ownershipPassed,
      message: ownershipPassed ? 'All key ownership roles assigned.' : 'Missing Business, Technical, or Risk Owner.',
    },
    risk: {
      score: riskScore,
      passed: riskPassed,
      message: riskPassed ? `Risk Assessment complete (Tier: ${asset.riskLevel}).` : 'Risk Assessment incomplete.',
    },
    validation: {
      score: validationScore,
      passed: valPassed,
      message: valPassed ? `Validation Score: ${asset.validationScore}% (>=80% threshold passed).` : 'Validation incomplete or score < 80%.',
    },
    evidence: {
      score: evidenceScore,
      passed: evidencePassed,
      message: evidencePassed ? `${approvedEvd.length} Evidence Artifacts approved.` : 'No approved evidence uploaded.',
    },
    findings: {
      score: findingsScore,
      passed: findingsPassed,
      message: findingsPassed ? 'Zero critical or high risk findings open.' : criticalOpen ? 'CRITICAL FINDING OPEN - Blocker' : 'High findings pending resolution.',
    },
    overallScore,
    readinessTier,
    recommendedOutcome,
  };
}

export function getGovernanceBlockers(assetId?: string): GovernanceBlocker[] {
  const assets = assetId ? getAssets().filter(a => a.id === assetId) : getAssets();
  const blockers: GovernanceBlocker[] = [];

  assets.forEach(asset => {
    const o = asset.ownership || {};
    if (!o.businessOwner || !o.technicalOwner || !o.riskOwner) {
      blockers.push({
        id: `blk-${asset.id}-own`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Ownership',
        blockerMessage: `Incomplete Ownership Matrix for ${asset.name}. Missing assigned owners.`,
        severity: 'High',
        remediationPath: '/ownership',
      });
    }

    const scoreDetails = calculateAssetGovernanceScore(asset.id);
    if (!scoreDetails.validation.passed) {
      blockers.push({
        id: `blk-${asset.id}-val`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Validation',
        blockerMessage: `Validation score is ${asset.validationScore || 0}% (Required >= 80%).`,
        severity: 'High',
        remediationPath: '/validation',
      });
    }

    if (!scoreDetails.evidence.passed) {
      blockers.push({
        id: `blk-${asset.id}-evd`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Evidence',
        blockerMessage: `No approved evidence artifacts uploaded for ODF Blueprint v1 deliverables.`,
        severity: 'Medium',
        remediationPath: '/evidence',
      });
    }

    const openCriticalFinding = getFindings().find(f => f.assetId === asset.id && f.severity === 'Critical' && f.status !== 'Resolved' && f.status !== 'Verified');
    if (openCriticalFinding) {
      blockers.push({
        id: `blk-${asset.id}-fnd`,
        assetId: asset.id,
        assetName: asset.name,
        category: 'Findings',
        blockerMessage: `Critical Finding Open: '${openCriticalFinding.title}'.`,
        severity: 'Critical',
        remediationPath: '/findings',
      });
    }
  });

  return blockers;
}

export function getComplianceControls(): ComplianceControl[] {
  return SEEDED_COMPLIANCE_CONTROLS;
}

export function getComplianceAssessments(): ComplianceAssessmentRecord[] {
  return getItem<ComplianceAssessmentRecord[]>(STORAGE_KEYS.COMPLIANCE_ASSESSMENTS, INITIAL_COMPLIANCE_ASSESSMENTS);
}

export function saveComplianceAssessment(assessData: Partial<ComplianceAssessmentRecord>): ComplianceAssessmentRecord {
  const assessments = getComplianceAssessments();
  const now = new Date().toISOString().split('T')[0];

  const control = getComplianceControls().find(c => c.id === assessData.controlId);
  const asset = getAssetById(assessData.assetId || '');

  if (assessData.id) {
    const idx = assessments.findIndex(a => a.id === assessData.id);
    if (idx !== -1) {
      assessments[idx] = { ...assessments[idx], ...assessData, assessedDate: now };
      setItem(STORAGE_KEYS.COMPLIANCE_ASSESSMENTS, assessments);
      return assessments[idx];
    }
  }

  const status: ComplianceEvaluationStatus = assessData.status || 'Compliant';
  const score = status === 'Compliant' ? 100 : status === 'Partially Compliant' ? 50 : 0;

  const newAssess: ComplianceAssessmentRecord = {
    id: `cmp-${Date.now().toString().slice(-4)}`,
    assetId: assessData.assetId || 'ast-101',
    assetName: asset?.name || 'AI Asset',
    controlId: assessData.controlId || 'RBI-001',
    controlName: control?.controlName || 'Named Accountable Ownership',
    status,
    score,
    evidenceRefs: assessData.evidenceRefs || [],
    assessor: assessData.assessor || 'Robert Vance (Auditor)',
    assessedDate: now,
    notes: assessData.notes || '',
  };

  const updated = [newAssess, ...assessments];
  setItem(STORAGE_KEYS.COMPLIANCE_ASSESSMENTS, updated);

  addAuditLog(
    'usr-6',
    newAssess.assessor,
    'AUDITOR',
    'COMPLIANCE_ASSESSED',
    'ComplianceAssessment',
    newAssess.id,
    newAssess.assetName,
    `Evaluated control ${newAssess.controlId} for ${newAssess.assetName}: Status = ${newAssess.status} (Score: ${newAssess.score}%)`
  );

  return newAssess;
}

export function calculateAssetComplianceScore(assetId: string): { score: number; status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant'; evaluatedCount: number } {
  const assessments = getComplianceAssessments().filter(a => a.assetId === assetId);

  if (assessments.length === 0) {
    return { score: 85, status: 'Partially Compliant', evaluatedCount: 0 };
  }

  const totalScore = assessments.reduce((sum, a) => sum + a.score, 0);
  const avgScore = Math.round(totalScore / assessments.length);

  let status: 'Compliant' | 'Partially Compliant' | 'Non-Compliant' = 'Non-Compliant';
  if (avgScore >= 90) status = 'Compliant';
  else if (avgScore >= 70) status = 'Partially Compliant';

  return {
    score: avgScore,
    status,
    evaluatedCount: assessments.length,
  };
}

export function getComplianceGaps(assetId?: string): ComplianceGap[] {
  const assessments = assetId 
    ? getComplianceAssessments().filter(a => a.assetId === assetId && (a.status === 'Non-Compliant' || a.status === 'Partially Compliant'))
    : getComplianceAssessments().filter(a => a.status === 'Non-Compliant' || a.status === 'Partially Compliant');

  return assessments.map(a => ({
    id: `gap-${a.id}`,
    assetId: a.assetId,
    assetName: a.assetName,
    controlId: a.controlId,
    controlName: a.controlName,
    severity: a.status === 'Non-Compliant' ? 'Critical' : 'High',
    status: 'Open',
    remediationNotes: a.notes || `Requires evidence remediation for control ${a.controlId}.`,
  }));
}

export function generateCompliancePackage(assetId: string, authorName: string): CompliancePackage {
  const packages = getItem<CompliancePackage[]>(STORAGE_KEYS.COMPLIANCE_PACKAGES, []);
  const asset = getAssetById(assetId) || getAssets()[0];
  const evalDetails = calculateAssetComplianceScore(asset.id);
  const evidence = getEvidence().filter(e => e.assetId === asset.id);
  const gaps = getComplianceGaps(asset.id);
  const now = new Date().toISOString().split('T')[0];

  const pkg: CompliancePackage = {
    id: `c-pkg-${Date.now().toString().slice(-4)}`,
    assetId: asset.id,
    assetName: asset.name,
    generatedAt: now,
    generatedBy: authorName,
    complianceScore: evalDetails.score,
    status: evalDetails.status,
    controlsEvaluatedCount: evalDetails.evaluatedCount || getComplianceControls().length,
    evidenceCount: evidence.length,
    openGapsCount: gaps.length,
  };

  const updated = [pkg, ...packages];
  setItem(STORAGE_KEYS.COMPLIANCE_PACKAGES, updated);

  addAuditLog(
    'usr-6',
    authorName,
    'AUDITOR',
    'COMPLIANCE_PACKAGE_GENERATED',
    'CompliancePackage',
    pkg.id,
    pkg.assetName,
    `Generated Audit-Ready RBI Compliance Package for ${pkg.assetName}. Score: ${pkg.complianceScore}%`
  );

  return pkg;
}

// --- PHASE 6: OPERATIONAL GOVERNANCE & KILL SWITCH SERVICES ---

export function getKillSwitches(): KillSwitchRecord[] {
  return getItem<KillSwitchRecord[]>(STORAGE_KEYS.KILL_SWITCHES, INITIAL_KILL_SWITCH_RECORDS);
}

export function requestKillSwitch(data: Partial<KillSwitchRecord>): KillSwitchRecord {
  const list = getKillSwitches();
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const newRecord: KillSwitchRecord = {
    id: `ks-${Date.now().toString().slice(-4)}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    triggerCategory: data.triggerCategory || 'Critical Incident',
    status: 'Activated',
    requestedBy: data.requestedBy || 'Sarah Jenkins (Super Admin)',
    approvedBy: data.approvedBy || 'Sarah Jenkins (Super Admin)',
    activatedAt: now,
    reason: data.reason || 'Emergency circuit breaker engaged.',
    resolutionNotes: 'Under root cause analysis by Governance Team.',
  };

  const updated = [newRecord, ...list];
  setItem(STORAGE_KEYS.KILL_SWITCHES, updated);

  if (asset) {
    asset.operationalStatus = 'Suspended';
    fireAndForget(saveAsset(asset), `operational status for ${asset.name}`);
  }

  addAuditLog(
    'usr-1',
    newRecord.requestedBy,
    'SUPER_ADMIN',
    'KILL_SWITCH_ACTIVATED',
    'KillSwitch',
    newRecord.id,
    newRecord.assetName,
    `Engaged Emergency Kill Switch for ${newRecord.assetName}. Category: ${newRecord.triggerCategory}. Reason: ${newRecord.reason}`
  );

  return newRecord;
}

export function releaseKillSwitch(killSwitchId: string, releasedBy: string, notes: string): void {
  const list = getKillSwitches();
  const idx = list.findIndex(k => k.id === killSwitchId);
  if (idx !== -1) {
    list[idx].status = 'Released';
    list[idx].resolutionNotes = notes;
    setItem(STORAGE_KEYS.KILL_SWITCHES, list);

    const asset = getAssetById(list[idx].assetId);
    if (asset) {
      asset.operationalStatus = 'Active';
      fireAndForget(saveAsset(asset), `operational status for ${asset.name}`);
    }

    addAuditLog(
      'usr-1',
      releasedBy,
      'SUPER_ADMIN',
      'KILL_SWITCH_RELEASED',
      'KillSwitch',
      killSwitchId,
      list[idx].assetName,
      `Released Kill Switch for ${list[idx].assetName}. Restored to Active operation. Rationale: ${notes}`
    );
  }
}

export function getOverrides(): OverrideRecord[] {
  return getItem<OverrideRecord[]>(STORAGE_KEYS.OVERRIDES, INITIAL_OVERRIDE_RECORDS);
}

export function recordOverride(data: Partial<OverrideRecord>): OverrideRecord {
  const list = getOverrides();
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  const newRecord: OverrideRecord = {
    id: `ovr-${Date.now().toString().slice(-4)}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    triggerReason: data.triggerReason || 'Human supervisor manual decision override',
    requestedBy: data.requestedBy || 'Marcus Vance (Business Owner)',
    approvedBy: data.approvedBy || 'David Chen (Governance Admin)',
    timestamp: now,
    actionTaken: data.actionTaken || 'AI Decision Reversed & Manually Approved.',
  };

  const updated = [newRecord, ...list];
  setItem(STORAGE_KEYS.OVERRIDES, updated);

  addAuditLog(
    'usr-4',
    newRecord.requestedBy,
    'BUSINESS_OWNER',
    'HUMAN_OVERRIDE_EXECUTED',
    'Override',
    newRecord.id,
    newRecord.assetName,
    `Executed Human Override for ${newRecord.assetName}. Action: ${newRecord.actionTaken}`
  );

  return newRecord;
}

export function getIncidents(): GovernanceIncident[] {
  return getItem<GovernanceIncident[]>(STORAGE_KEYS.INCIDENTS, INITIAL_GOVERNANCE_INCIDENTS);
}

export function saveIncident(data: Partial<GovernanceIncident>): GovernanceIncident {
  const list = getIncidents();
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().replace('T', ' ').slice(0, 16);

  if (data.id) {
    const idx = list.findIndex(i => i.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setItem(STORAGE_KEYS.INCIDENTS, list);
      return list[idx];
    }
  }

  const newInc: GovernanceIncident = {
    id: `inc-${Date.now().toString().slice(-4)}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    title: data.title || 'Operational Governance Anomaly',
    type: data.type || 'Operational Failure',
    severity: data.severity || 'Medium',
    status: data.status || 'Open',
    reportedBy: data.reportedBy || 'Dr. Aris Thorne',
    assignedTo: data.assignedTo || 'Sarah Jenkins',
    createdAt: now,
    description: data.description || '',
  };

  const updated = [newInc, ...list];
  setItem(STORAGE_KEYS.INCIDENTS, updated);

  addAuditLog(
    'usr-5',
    newInc.reportedBy,
    'VALIDATOR',
    'INCIDENT_LOGGED',
    'Incident',
    newInc.id,
    newInc.assetName,
    `Logged ${newInc.severity} Governance Incident: ${newInc.title} for ${newInc.assetName}`
  );

  return newInc;
}

export function getRetirements(): RetirementRecord[] {
  return getItem<RetirementRecord[]>(STORAGE_KEYS.RETIREMENTS, INITIAL_RETIREMENT_RECORDS);
}

export function retireAsset(data: Partial<RetirementRecord>): RetirementRecord {
  const list = getRetirements();
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().split('T')[0];
  const evidenceCount = getEvidence().filter(e => e.assetId === data.assetId).length;

  const newRet: RetirementRecord = {
    id: `ret-${Date.now().toString().slice(-4)}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    reason: data.reason || 'End of Life',
    requestedBy: data.requestedBy || 'Marcus Vance',
    approvedBy: data.approvedBy || 'David Chen',
    retiredAt: now,
    evidenceArchivedCount: evidenceCount,
    notes: data.notes || 'Governed decommissioning completed and evidence archived.',
  };

  const updated = [newRet, ...list];
  setItem(STORAGE_KEYS.RETIREMENTS, updated);

  if (asset) {
    asset.status = 'Retirement';
    asset.operationalStatus = 'Retired';
    fireAndForget(saveAsset(asset), `retirement status for ${asset.name}`);
  }

  addAuditLog(
    'usr-2',
    newRet.approvedBy,
    'GOVERNANCE_ADMIN',
    'ASSET_RETIRED',
    'Retirement',
    newRet.id,
    newRet.assetName,
    `Executed controlled retirement for ${newRet.assetName}. Reason: ${newRet.reason}`
  );

  return newRet;
}

export function getGovernanceTimeline(assetId: string): GovernanceTimelineEvent[] {
  const asset = getAssetById(assetId);
  if (!asset) return [];

  const timeline: GovernanceTimelineEvent[] = [];

  timeline.push({
    id: `tl-reg-${asset.id}`,
    assetId: asset.id,
    timestamp: asset.createdAt,
    stage: '1. AI Asset Registration',
    actor: asset.ownership.businessOwner || 'Sarah Jenkins',
    details: `Registered asset ${asset.name} (Type: ${asset.type}) in ${asset.department}`,
    type: 'registration',
  });

  if (asset.riskLevel) {
    timeline.push({
      id: `tl-risk-${asset.id}`,
      assetId: asset.id,
      timestamp: asset.createdAt,
      stage: '2. Risk Assessment Wizard',
      actor: asset.ownership.riskOwner || 'Elena Rostova',
      details: `Classified as ${asset.riskLevel} Risk Tier. Sensitivity: ${asset.dataSensitivity || 'Confidential'}`,
      type: 'risk',
    });
  }

  const validations = getValidations().filter(v => v.assetId === assetId);
  validations.forEach(v => {
    timeline.push({
      id: `tl-val-${v.id}`,
      assetId: asset.id,
      timestamp: v.reviewDate,
      stage: `3. Validation Review (${v.category})`,
      actor: v.reviewer,
      details: `Validation Outcome: ${v.status} (Score: ${v.score}%)`,
      type: 'validation',
    });
  });

  if (asset.decisionOutcome && asset.decisionOutcome !== 'PENDING') {
    timeline.push({
      id: `tl-dec-${asset.id}`,
      assetId: asset.id,
      timestamp: asset.updatedAt,
      stage: '4. Decision Authority Gatekeeper',
      actor: asset.ownership.approver || 'David Chen',
      details: `Signed Decision Outcome: ${asset.decisionOutcome}`,
      type: 'decision',
    });
  }

  const killSwitches = getKillSwitches().filter(k => k.assetId === assetId);
  killSwitches.forEach(k => {
    timeline.push({
      id: `tl-ks-${k.id}`,
      assetId: asset.id,
      timestamp: k.activatedAt,
      stage: `5. Kill Switch ${k.status}`,
      actor: k.requestedBy,
      details: `Trigger: ${k.triggerCategory}. Reason: ${k.reason}`,
      type: 'killswitch',
    });
  });

  const overrides = getOverrides().filter(o => o.assetId === assetId);
  overrides.forEach(o => {
    timeline.push({
      id: `tl-ovr-${o.id}`,
      assetId: asset.id,
      timestamp: o.timestamp,
      stage: '6. Human Override Executed',
      actor: o.requestedBy,
      details: `Action: ${o.actionTaken}`,
      type: 'override',
    });
  });

  const retirements = getRetirements().filter(r => r.assetId === assetId);
  retirements.forEach(r => {
    timeline.push({
      id: `tl-ret-${r.id}`,
      assetId: asset.id,
      timestamp: r.retiredAt,
      stage: '7. Controlled Decommissioning',
      actor: r.approvedBy,
      details: `Asset Retired. Reason: ${r.reason}`,
      type: 'retirement',
    });
  });

  // Release 2 — Governance Continuity events.
  if (asset.governanceState && asset.governanceState !== 'Draft' && asset.governanceState !== 'Submitted') {
    timeline.push({
      id: `tl-auth-${asset.id}`,
      assetId: asset.id,
      timestamp: asset.updatedAt,
      stage: '8. Governance Authorization',
      actor: asset.authorityProfile?.accountableOwner || 'David Chen',
      details: `Authorized to operate. Current governance state: ${asset.governanceState}`,
      type: 'authorized',
    });
  }

  getReassessmentTriggers().filter(t => t.assetId === assetId).forEach(t => {
    timeline.push({
      id: `tl-trg-${t.id}`,
      assetId: asset.id,
      timestamp: t.dateDetected,
      stage: `9. Reassessment Trigger (${t.triggerType})`,
      actor: t.owner,
      details: `${t.severity} severity — ${t.comments}`,
      type: 'trigger',
    });
  });

  getScheduledReviews().filter(r => r.assetId === assetId).forEach(r => {
    if (r.status === 'In Progress' || r.status === 'Completed') {
      timeline.push({
        id: `tl-revi-${r.id}`,
        assetId: asset.id,
        timestamp: r.dueDate,
        stage: `10. ${r.reviewType} Initiated`,
        actor: r.owner,
        details: `Governance review ${r.status === 'Completed' ? 'initiated and completed' : 'in progress'}.`,
        type: 'review',
      });
    }
    if (r.status === 'Completed') {
      timeline.push({
        id: `tl-revc-${r.id}`,
        assetId: asset.id,
        timestamp: r.dueDate,
        stage: `10. ${r.reviewType} Completed`,
        actor: r.owner,
        details: r.outcome || 'Review completed.',
        type: 'review',
      });
    }
  });

  getReauthorizationRecords().filter(r => r.assetId === assetId).forEach(r => {
    timeline.push({
      id: `tl-reauth-${r.id}`,
      assetId: asset.id,
      timestamp: r.reviewDate,
      stage: `11. Reauthorization Decision: ${r.decision}`,
      actor: r.reviewedBy,
      details: `${r.previousState} → ${r.newState}. ${r.reason}`,
      type: 'reauthorization',
    });
  });

  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// --- PHASE 7: CONTINUOUS MONITORING & GOVERNANCE HEALTH ENGINE ---

export function calculateAssetGovernanceHealthScore(assetId: string): GovernanceHealthBreakdown {
  const asset = getAssetById(assetId);
  const validations = getValidations().filter(v => v.assetId === assetId);
  const compliance = calculateAssetComplianceScore(assetId);
  const incidents = getIncidents().filter(i => i.assetId === assetId && i.status !== 'Closed');
  const killSwitches = getKillSwitches().filter(k => k.assetId === assetId && k.status === 'Activated');

  if (!asset) {
    return {
      ownershipHealth: { score: 0, passed: false, message: 'Asset not found' },
      riskHealth: { score: 0, passed: false, message: 'Asset not found' },
      validationHealth: { score: 0, passed: false, message: 'Asset not found' },
      complianceHealth: { score: 0, passed: false, message: 'Asset not found' },
      operationalHealth: { score: 0, passed: false, message: 'Asset not found' },
      overallHealthScore: 0,
      healthStatus: 'Attention Required',
    };
  }

  // 1. Ownership Health (20%)
  const o = asset.ownership || {};
  const ownPassed = !!(o.businessOwner && o.technicalOwner && o.riskOwner);
  const ownScore = ownPassed ? 20 : 10;

  // 2. Risk Health (20%)
  const riskPassed = !!asset.riskLevel;
  const riskScore = riskPassed ? 20 : 10;

  // 3. Validation Health (20%)
  const approvedVals = validations.filter(v => v.status === 'Approved');
  const valPassed = approvedVals.length > 0 && (asset.validationScore || 0) >= 80;
  const valScore = valPassed ? 20 : 10;

  // 4. Compliance Health (20%)
  const compPassed = compliance.score >= 80;
  const compScore = compPassed ? 20 : compliance.score >= 50 ? 10 : 0;

  // 5. Operational Health (20%)
  const opPassed = incidents.length === 0 && killSwitches.length === 0;
  const opScore = opPassed ? 20 : killSwitches.length > 0 ? 0 : 10;

  const overallHealthScore = ownScore + riskScore + valScore + compScore + opScore;

  let healthStatus: GovernanceHealthStatus = 'Attention Required';
  if (overallHealthScore >= 90) healthStatus = 'Healthy';
  else if (overallHealthScore >= 70) healthStatus = 'Watchlist';

  return {
    ownershipHealth: { score: ownScore, passed: ownPassed, message: ownPassed ? 'Ownership complete' : 'Incomplete owners' },
    riskHealth: { score: riskScore, passed: riskPassed, message: riskPassed ? 'Risk profile active' : 'Risk unassessed' },
    validationHealth: { score: valScore, passed: valPassed, message: valPassed ? 'Validations current' : 'Validation outdated' },
    complianceHealth: { score: compScore, passed: compPassed, message: `Compliance score: ${compliance.score}%` },
    operationalHealth: { score: opScore, passed: opPassed, message: opPassed ? 'Zero active incidents' : 'Operational exception active' },
    overallHealthScore,
    healthStatus,
  };
}

export function getGovernanceAlerts(): GovernanceAlert[] {
  return getItem<GovernanceAlert[]>(STORAGE_KEYS.ALERTS, INITIAL_GOVERNANCE_ALERTS);
}

let reviewsCache: ScheduledReview[] = getItem<ScheduledReview[]>(STORAGE_KEYS.SCHEDULED_REVIEWS, INITIAL_SCHEDULED_REVIEWS);
let triggersCache: ReassessmentTrigger[] = getItem<ReassessmentTrigger[]>(STORAGE_KEYS.REASSESSMENT_TRIGGERS, INITIAL_REASSESSMENT_TRIGGERS);
let reauthorizationsCache: GovernanceReauthorizationRecord[] = getItem<GovernanceReauthorizationRecord[]>(STORAGE_KEYS.REAUTHORIZATION_RECORDS, INITIAL_REAUTHORIZATION_RECORDS);

function persistReviewsCache() { setItem(STORAGE_KEYS.SCHEDULED_REVIEWS, reviewsCache); }
function persistTriggersCache() { setItem(STORAGE_KEYS.REASSESSMENT_TRIGGERS, triggersCache); }
function persistReauthorizationsCache() { setItem(STORAGE_KEYS.REAUTHORIZATION_RECORDS, reauthorizationsCache); }

export function getScheduledReviews(): ScheduledReview[] {
  return reviewsCache;
}

export async function saveScheduledReview(data: Partial<ScheduledReview>): Promise<ScheduledReview> {
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().split('T')[0];

  if (data.id) {
    const idx = reviewsCache.findIndex(r => r.id === data.id);
    if (idx !== -1) {
      const updated: ScheduledReview = { ...reviewsCache[idx], ...data };
      reviewsCache = [...reviewsCache];
      reviewsCache[idx] = updated;
      persistReviewsCache();

      const saved = await apiGovernanceRepository.updateGovernanceRecord('review', updated.id, updated) as ScheduledReview;
      const i2 = reviewsCache.findIndex(r => r.id === updated.id);
      if (i2 !== -1) { reviewsCache = [...reviewsCache]; reviewsCache[i2] = { ...saved, assetName: asset?.name || updated.assetName }; persistReviewsCache(); }
      return reviewsCache[i2 !== -1 ? i2 : idx];
    }
  }

  const draftRev: ScheduledReview = {
    id: `local-${Date.now()}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    reviewType: data.reviewType || 'Quarterly Review',
    owner: data.owner || 'David Chen (Governance Admin)',
    dueDate: data.dueDate || now,
    status: data.status || 'Scheduled',
  };

  reviewsCache = [draftRev, ...reviewsCache];
  persistReviewsCache();

  addAuditLog(
    'usr-2',
    draftRev.owner,
    'GOVERNANCE_ADMIN',
    'REVIEW_SCHEDULED',
    'ScheduledReview',
    draftRev.id,
    draftRev.assetName,
    `Scheduled ${draftRev.reviewType} for ${draftRev.assetName} due on ${draftRev.dueDate}`
  );

  const { id: _draftId, ...payload } = draftRev;
  const created = { ...(await apiGovernanceRepository.createGovernanceRecord('review', payload) as ScheduledReview), assetName: draftRev.assetName };
  reviewsCache = reviewsCache.map(r => (r.id === draftRev.id ? created : r));
  persistReviewsCache();
  return created;
}

// --- RELEASE 2 — GOVERNANCE CONTINUITY SERVICE ---

export function getReassessmentTriggers(): ReassessmentTrigger[] {
  return triggersCache;
}

export async function saveReassessmentTrigger(data: Partial<ReassessmentTrigger>): Promise<ReassessmentTrigger> {
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().split('T')[0];

  if (data.id) {
    const idx = triggersCache.findIndex(t => t.id === data.id);
    if (idx !== -1) {
      const updated: ReassessmentTrigger = { ...triggersCache[idx], ...data };
      triggersCache = [...triggersCache];
      triggersCache[idx] = updated;
      persistTriggersCache();

      const saved = await apiGovernanceRepository.updateGovernanceRecord('trigger', updated.id, updated) as ReassessmentTrigger;
      const i2 = triggersCache.findIndex(t => t.id === updated.id);
      if (i2 !== -1) { triggersCache = [...triggersCache]; triggersCache[i2] = { ...saved, assetName: asset?.name || updated.assetName }; persistTriggersCache(); }
      return triggersCache[i2 !== -1 ? i2 : idx];
    }
  }

  const draftTrigger: ReassessmentTrigger = {
    id: `local-${Date.now()}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    triggerType: data.triggerType || 'Model Change',
    dateDetected: data.dateDetected || now,
    severity: data.severity || 'Medium',
    owner: data.owner || 'David Chen (Governance Admin)',
    status: data.status || 'Open',
    comments: data.comments || '',
  };

  triggersCache = [draftTrigger, ...triggersCache];
  persistTriggersCache();

  // A trigger is the event that moves an authorized asset back into reassessment.
  if (asset && (asset.governanceState === 'Authorized' || asset.governanceState === 'Monitoring')) {
    fireAndForget(saveAsset({ id: asset.id, governanceState: 'Reassessment Required' }), `governance state for ${asset.name}`);
  }

  addAuditLog(
    'usr-2',
    draftTrigger.owner,
    'GOVERNANCE_ADMIN',
    'REASSESSMENT_TRIGGER_RAISED',
    'ReassessmentTrigger',
    draftTrigger.id,
    draftTrigger.assetName,
    `Raised ${draftTrigger.triggerType} trigger for ${draftTrigger.assetName} (${draftTrigger.severity})`
  );

  const { id: _draftId, ...payload } = draftTrigger;
  const created = { ...(await apiGovernanceRepository.createGovernanceRecord('trigger', payload) as ReassessmentTrigger), assetName: draftTrigger.assetName };
  triggersCache = triggersCache.map(t => (t.id === draftTrigger.id ? created : t));
  persistTriggersCache();
  return created;
}

export function getReauthorizationRecords(): GovernanceReauthorizationRecord[] {
  return reauthorizationsCache;
}

export async function saveReauthorizationRecord(data: Omit<GovernanceReauthorizationRecord, 'id' | 'assetName'>): Promise<GovernanceReauthorizationRecord> {
  const asset = getAssetById(data.assetId);

  const draftRecord: GovernanceReauthorizationRecord = {
    ...data,
    id: `local-${Date.now()}`,
    assetName: asset?.name || 'AI Asset',
  };

  reauthorizationsCache = [draftRecord, ...reauthorizationsCache];
  persistReauthorizationsCache();

  // Reauthorization is what moves the asset's governance state forward again.
  if (asset) {
    fireAndForget(saveAsset({ id: asset.id, governanceState: draftRecord.newState }), `governance state for ${asset.name}`);
  }

  addAuditLog(
    'usr-2',
    draftRecord.reviewedBy,
    'GOVERNANCE_ADMIN',
    'GOVERNANCE_REAUTHORIZED',
    'GovernanceReauthorizationRecord',
    draftRecord.id,
    draftRecord.assetName,
    `Reauthorization decision ${draftRecord.decision} for ${draftRecord.assetName}: ${draftRecord.previousState} → ${draftRecord.newState}`
  );

  const { id: _draftId, assetName: _draftName, ...payload } = draftRecord;
  const created = { ...(await apiGovernanceRepository.createGovernanceRecord('reauthorization', payload) as GovernanceReauthorizationRecord), assetName: draftRecord.assetName };
  reauthorizationsCache = reauthorizationsCache.map(r => (r.id === draftRecord.id ? created : r));
  persistReauthorizationsCache();
  return created;
}

// --- RELEASE 3 — EVIDENCE FOUNDATION SERVICE ---

let evidenceCache: EvidenceRecord[] = getItem<EvidenceRecord[]>(STORAGE_KEYS.EVIDENCE_RECORDS, INITIAL_EVIDENCE_RECORDS);

function persistEvidenceCache() { setItem(STORAGE_KEYS.EVIDENCE_RECORDS, evidenceCache); }

export function getEvidenceRecords(): EvidenceRecord[] {
  return evidenceCache;
}

export function getEvidenceRecordById(id: string): EvidenceRecord | undefined {
  return evidenceCache.find(e => e.id === id);
}

export function getEvidenceRecordsForAsset(assetId: string): EvidenceRecord[] {
  return evidenceCache.filter(e => e.assetId === assetId);
}

export async function saveEvidenceRecord(data: Partial<EvidenceRecord>): Promise<EvidenceRecord> {
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().split('T')[0];

  if (data.id) {
    const idx = evidenceCache.findIndex(e => e.id === data.id);
    if (idx !== -1) {
      const updated: EvidenceRecord = { ...evidenceCache[idx], ...data };
      evidenceCache = [...evidenceCache];
      evidenceCache[idx] = updated;
      persistEvidenceCache();

      addAuditLog(
        'usr-2',
        updated.ownership.evidenceOwner,
        'GOVERNANCE_ADMIN',
        'EVIDENCE_UPDATED',
        'EvidenceRecord',
        updated.id,
        updated.name,
        `Updated evidence record ${updated.name} (Status: ${updated.status})`
      );

      const saved = await apiEvidenceRepository.updateEvidence(updated.id, updated);
      const reconciled = { ...saved, assetName: asset?.name || updated.assetName };
      const i2 = evidenceCache.findIndex(e => e.id === updated.id);
      if (i2 !== -1) { evidenceCache = [...evidenceCache]; evidenceCache[i2] = reconciled; persistEvidenceCache(); }
      return reconciled;
    }
  }

  const draftRecord: EvidenceRecord = {
    id: `local-${Date.now()}`,
    name: data.name || 'New Evidence Record',
    evidenceType: data.evidenceType || 'Policy Document',
    status: data.status || 'Draft',
    createdDate: data.createdDate || now,
    expiryDate: data.expiryDate,
    description: data.description || '',
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    ownership: data.ownership || { evidenceOwner: 'Unassigned' },
    traceability: data.traceability,
  };

  evidenceCache = [draftRecord, ...evidenceCache];
  persistEvidenceCache();

  addAuditLog(
    'usr-2',
    draftRecord.ownership.evidenceOwner,
    'GOVERNANCE_ADMIN',
    'EVIDENCE_CREATED',
    'EvidenceRecord',
    draftRecord.id,
    draftRecord.name,
    `Registered evidence record ${draftRecord.name} [${draftRecord.evidenceType}] for ${draftRecord.assetName}`
  );

  const { id: _draftId, ...payload } = draftRecord;
  const created = { ...(await apiEvidenceRepository.createEvidence(payload)), assetName: draftRecord.assetName };
  evidenceCache = evidenceCache.map(e => (e.id === draftRecord.id ? created : e));
  persistEvidenceCache();
  return created;
}

export async function deleteEvidenceRecord(id: string): Promise<void> {
  const target = evidenceCache.find(e => e.id === id);
  if (!target) return;

  evidenceCache = evidenceCache.filter(e => e.id !== id);
  persistEvidenceCache();

  addAuditLog(
    'usr-1',
    'Sarah Jenkins',
    'SUPER_ADMIN',
    'EVIDENCE_DELETED',
    'EvidenceRecord',
    id,
    target.name,
    `Deleted evidence record ${target.name} from the registry.`
  );

  await apiEvidenceRepository.deleteEvidence(id);
}

/**
 * Capability 7 — Evidence Timeline. Derived from the record's own fields
 * rather than a separate log, matching Release 2's "visibility only" approach.
 */
export function getEvidenceTimeline(evidenceId: string): EvidenceTimelineEvent[] {
  const record = getEvidenceRecordById(evidenceId);
  if (!record) return [];

  const timeline: EvidenceTimelineEvent[] = [
    {
      id: `evtl-created-${record.id}`,
      evidenceId: record.id,
      timestamp: record.createdDate,
      event: 'Created',
      actor: record.ownership.evidenceOwner,
      details: `Evidence record created: ${record.evidenceType} for ${record.assetName}.`,
    },
  ];

  if (record.ownership.reviewer) {
    timeline.push({
      id: `evtl-reviewed-${record.id}`,
      evidenceId: record.id,
      timestamp: record.createdDate,
      event: 'Reviewed',
      actor: record.ownership.reviewer,
      details: `Reviewed by ${record.ownership.reviewer}.`,
    });
  }

  if (record.status === 'Active' && record.ownership.approvalAuthority) {
    timeline.push({
      id: `evtl-approved-${record.id}`,
      evidenceId: record.id,
      timestamp: record.createdDate,
      event: 'Approved',
      actor: record.ownership.approvalAuthority,
      details: `Approved by ${record.ownership.approvalAuthority}.`,
    });
  }

  if (getExpiryIndicator(record.expiryDate) === 'Expired') {
    timeline.push({
      id: `evtl-expired-${record.id}`,
      evidenceId: record.id,
      timestamp: record.expiryDate || record.createdDate,
      event: 'Expired',
      actor: 'System',
      details: `Evidence passed its expiry date (${record.expiryDate}).`,
    });
  }

  if (record.status === 'Archived' || record.status === 'Superseded') {
    timeline.push({
      id: `evtl-archived-${record.id}`,
      evidenceId: record.id,
      timestamp: record.expiryDate || record.createdDate,
      event: 'Archived',
      actor: record.ownership.evidenceOwner,
      details: record.status === 'Superseded' ? 'Superseded by a newer evidence record.' : 'Archived for record retention.',
    });
  }

  return timeline.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

// --- RELEASE 5.1 — COMPLIANCE PACK FRAMEWORK: API-FIRST, NEON-BACKED ---
// Release 5 shipped this domain on local storage deliberately ("framework
// before regulation"). Release 5.1 aligns it with the Release 4.1 platform
// rule — Neon is the only System of Record for any governance object — using
// the same cache-then-network pattern as Assets/Evidence/Continuity: reads
// stay synchronous off an in-memory cache; writes are async and Neon-first.

let compliancePacksCache: CompliancePack[] = getItem<CompliancePack[]>(STORAGE_KEYS.COMPLIANCE_PACKS, INITIAL_COMPLIANCE_PACKS);
let requirementsCache: ComplianceRequirement[] = getItem<ComplianceRequirement[]>(STORAGE_KEYS.COMPLIANCE_REQUIREMENTS, INITIAL_COMPLIANCE_REQUIREMENTS);
let packControlsCache: PackControl[] = getItem<PackControl[]>(STORAGE_KEYS.PACK_CONTROLS, INITIAL_PACK_CONTROLS);
let evidenceMappingsCache: EvidenceMapping[] = getItem<EvidenceMapping[]>(STORAGE_KEYS.EVIDENCE_MAPPINGS, INITIAL_EVIDENCE_MAPPINGS);

function persistCompliancePacksCache() { setItem(STORAGE_KEYS.COMPLIANCE_PACKS, compliancePacksCache); }
function persistRequirementsCache() { setItem(STORAGE_KEYS.COMPLIANCE_REQUIREMENTS, requirementsCache); }
function persistPackControlsCache() { setItem(STORAGE_KEYS.PACK_CONTROLS, packControlsCache); }
function persistEvidenceMappingsCache() { setItem(STORAGE_KEYS.EVIDENCE_MAPPINGS, evidenceMappingsCache); }

export function getCompliancePacks(): CompliancePack[] {
  return compliancePacksCache;
}

export async function saveCompliancePack(data: Partial<CompliancePack>): Promise<CompliancePack> {
  if (data.id) {
    const idx = compliancePacksCache.findIndex(p => p.id === data.id);
    if (idx !== -1) {
      const updated: CompliancePack = { ...compliancePacksCache[idx], ...data };
      compliancePacksCache = [...compliancePacksCache];
      compliancePacksCache[idx] = updated;
      persistCompliancePacksCache();

      addAuditLog('usr-2', updated.owner, 'GOVERNANCE_ADMIN', 'COMPLIANCE_PACK_UPDATED', 'Policy', updated.id, updated.name, `Updated compliance pack ${updated.name}`);

      const saved = await apiCompliancePackRepository.updateCompliancePack(updated.id, updated);
      const i2 = compliancePacksCache.findIndex(p => p.id === updated.id);
      if (i2 !== -1) { compliancePacksCache = [...compliancePacksCache]; compliancePacksCache[i2] = saved; persistCompliancePacksCache(); }
      return saved;
    }
  }

  const draftPack: CompliancePack = {
    id: data.id || `pack-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Compliance Pack',
    version: data.version || '1.0',
    status: data.status || 'Draft',
    owner: data.owner || 'David Chen',
    description: data.description || '',
    industry: data.industry || 'Cross-Industry',
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
  };

  compliancePacksCache = [draftPack, ...compliancePacksCache];
  persistCompliancePacksCache();
  addAuditLog('usr-2', draftPack.owner, 'GOVERNANCE_ADMIN', 'COMPLIANCE_PACK_CREATED', 'Policy', draftPack.id, draftPack.name, `Registered compliance pack ${draftPack.name}`);

  const created = await apiCompliancePackRepository.createCompliancePack(draftPack);
  compliancePacksCache = compliancePacksCache.map(p => (p.id === draftPack.id ? created : p));
  persistCompliancePacksCache();
  return created;
}

export async function deleteCompliancePack(id: string): Promise<void> {
  const target = compliancePacksCache.find(p => p.id === id);
  if (!target) return;

  // Mirror the backend's cascading relations (Pack -> Requirement -> Control -> EvidenceMapping) locally too.
  const orphanedReqIds = requirementsCache.filter(r => r.packId === id).map(r => r.id);
  const orphanedControlIds = packControlsCache.filter(c => orphanedReqIds.includes(c.requirementId)).map(c => c.id);

  compliancePacksCache = compliancePacksCache.filter(p => p.id !== id);
  persistCompliancePacksCache();
  requirementsCache = requirementsCache.filter(r => r.packId !== id);
  persistRequirementsCache();
  packControlsCache = packControlsCache.filter(c => !orphanedReqIds.includes(c.requirementId));
  persistPackControlsCache();
  evidenceMappingsCache = evidenceMappingsCache.filter(m => !orphanedControlIds.includes(m.controlId));
  persistEvidenceMappingsCache();

  addAuditLog('usr-1', 'Sarah Jenkins', 'SUPER_ADMIN', 'COMPLIANCE_PACK_DELETED', 'Policy', id, target.name, `Deleted compliance pack ${target.name}`);

  await apiCompliancePackRepository.deleteCompliancePack(id);
}

export function getComplianceRequirements(): ComplianceRequirement[] {
  return requirementsCache;
}

export async function saveComplianceRequirement(data: Partial<ComplianceRequirement>): Promise<ComplianceRequirement> {
  const pack = compliancePacksCache.find(p => p.id === data.packId);

  if (data.id) {
    const idx = requirementsCache.findIndex(r => r.id === data.id);
    if (idx !== -1) {
      const updated: ComplianceRequirement = { ...requirementsCache[idx], ...data, packName: pack?.name || requirementsCache[idx].packName };
      requirementsCache = [...requirementsCache];
      requirementsCache[idx] = updated;
      persistRequirementsCache();

      const saved = await apiRequirementRepository.updateRequirement(updated.id, updated);
      const reconciled = { ...saved, packName: updated.packName };
      const i2 = requirementsCache.findIndex(r => r.id === updated.id);
      if (i2 !== -1) { requirementsCache = [...requirementsCache]; requirementsCache[i2] = reconciled; persistRequirementsCache(); }
      return reconciled;
    }
  }

  const draftReq: ComplianceRequirement = {
    id: data.id || `REQ-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Requirement',
    description: data.description || '',
    packId: data.packId || '',
    packName: pack?.name || 'Unassigned Pack',
    category: data.category || 'General',
    priority: data.priority || 'Medium',
    status: data.status || 'Draft',
  };

  requirementsCache = [draftReq, ...requirementsCache];
  persistRequirementsCache();

  const created = { ...(await apiRequirementRepository.createRequirement(draftReq)), packName: draftReq.packName };
  requirementsCache = requirementsCache.map(r => (r.id === draftReq.id ? created : r));
  persistRequirementsCache();
  return created;
}

export async function deleteComplianceRequirement(id: string): Promise<void> {
  const target = requirementsCache.find(r => r.id === id);
  if (!target) return;

  const orphanedControlIds = packControlsCache.filter(c => c.requirementId === id).map(c => c.id);

  requirementsCache = requirementsCache.filter(r => r.id !== id);
  persistRequirementsCache();
  packControlsCache = packControlsCache.filter(c => c.requirementId !== id);
  persistPackControlsCache();
  evidenceMappingsCache = evidenceMappingsCache.filter(m => !orphanedControlIds.includes(m.controlId));
  persistEvidenceMappingsCache();

  await apiRequirementRepository.deleteRequirement(id);
}

export function getPackControls(): PackControl[] {
  return packControlsCache;
}

export async function savePackControl(data: Partial<PackControl>): Promise<PackControl> {
  const requirement = requirementsCache.find(r => r.id === data.requirementId);

  if (data.id) {
    const idx = packControlsCache.findIndex(c => c.id === data.id);
    if (idx !== -1) {
      const updated: PackControl = { ...packControlsCache[idx], ...data, requirementName: requirement?.name || packControlsCache[idx].requirementName };
      packControlsCache = [...packControlsCache];
      packControlsCache[idx] = updated;
      persistPackControlsCache();

      const saved = await apiControlRepository.updateControl(updated.id, updated);
      const reconciled = { ...saved, requirementName: updated.requirementName };
      const i2 = packControlsCache.findIndex(c => c.id === updated.id);
      if (i2 !== -1) { packControlsCache = [...packControlsCache]; packControlsCache[i2] = reconciled; persistPackControlsCache(); }
      return reconciled;
    }
  }

  const draftControl: PackControl = {
    id: data.id || `ctl-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Control',
    description: data.description || '',
    requirementId: data.requirementId || '',
    requirementName: requirement?.name || 'Unassigned Requirement',
    owner: data.owner || '',
    status: data.status || 'Draft',
  };

  packControlsCache = [draftControl, ...packControlsCache];
  persistPackControlsCache();

  const created = { ...(await apiControlRepository.createControl(draftControl)), requirementName: draftControl.requirementName };
  packControlsCache = packControlsCache.map(c => (c.id === draftControl.id ? created : c));
  persistPackControlsCache();
  return created;
}

export async function deletePackControl(id: string): Promise<void> {
  const target = packControlsCache.find(c => c.id === id);
  if (!target) return;

  packControlsCache = packControlsCache.filter(c => c.id !== id);
  persistPackControlsCache();
  evidenceMappingsCache = evidenceMappingsCache.filter(m => m.controlId !== id);
  persistEvidenceMappingsCache();

  await apiControlRepository.deleteControl(id);
}

export function getEvidenceMappings(): EvidenceMapping[] {
  return evidenceMappingsCache;
}

export async function saveEvidenceMapping(data: Partial<EvidenceMapping>): Promise<EvidenceMapping> {
  const control = packControlsCache.find(c => c.id === data.controlId);
  const evidence = getEvidenceRecordById(data.evidenceId || '');

  if (data.id) {
    const idx = evidenceMappingsCache.findIndex(m => m.id === data.id);
    if (idx !== -1) {
      const updated: EvidenceMapping = {
        ...evidenceMappingsCache[idx],
        ...data,
        controlName: control?.name || evidenceMappingsCache[idx].controlName,
        evidenceName: evidence?.name || evidenceMappingsCache[idx].evidenceName,
      };
      evidenceMappingsCache = [...evidenceMappingsCache];
      evidenceMappingsCache[idx] = updated;
      persistEvidenceMappingsCache();

      const saved = await apiEvidenceMappingRepository.updateMapping(updated.id, updated);
      const reconciled = { ...saved, controlName: updated.controlName, evidenceName: updated.evidenceName };
      const i2 = evidenceMappingsCache.findIndex(m => m.id === updated.id);
      if (i2 !== -1) { evidenceMappingsCache = [...evidenceMappingsCache]; evidenceMappingsCache[i2] = reconciled; persistEvidenceMappingsCache(); }
      return reconciled;
    }
  }

  const draftMapping: EvidenceMapping = {
    id: `local-map-${Date.now()}`,
    controlId: data.controlId || '',
    controlName: control?.name || 'Unassigned Control',
    evidenceId: data.evidenceId || '',
    evidenceName: evidence?.name || 'Unassigned Evidence',
  };

  evidenceMappingsCache = [draftMapping, ...evidenceMappingsCache];
  persistEvidenceMappingsCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'EVIDENCE_MAPPING_CREATED', 'EvidenceRecord', draftMapping.id, draftMapping.evidenceName, `Mapped ${draftMapping.evidenceName} to control ${draftMapping.controlName}`);

  const { id: _draftId, ...payload } = draftMapping;
  const created = { ...(await apiEvidenceMappingRepository.createMapping(payload)), controlName: draftMapping.controlName, evidenceName: draftMapping.evidenceName };
  evidenceMappingsCache = evidenceMappingsCache.map(m => (m.id === draftMapping.id ? created : m));
  persistEvidenceMappingsCache();
  return created;
}

export async function deleteEvidenceMapping(id: string): Promise<void> {
  const target = evidenceMappingsCache.find(m => m.id === id);
  if (!target) return;

  evidenceMappingsCache = evidenceMappingsCache.filter(m => m.id !== id);
  persistEvidenceMappingsCache();

  await apiEvidenceMappingRepository.deleteMapping(id);
}

export function getPackCoverage(packId: string) {
  const pack = getCompliancePacks().find(p => p.id === packId);
  if (!pack) return null;
  return computePackCoverage(pack, getComplianceRequirements(), getPackControls(), getEvidenceMappings(), getEvidenceRecords());
}

export function getRequirementCoverage(requirementId: string) {
  const requirement = getComplianceRequirements().find(r => r.id === requirementId);
  if (!requirement) return null;
  return computeRequirementCoverage(requirement, getPackControls(), getEvidenceMappings(), getEvidenceRecords());
}

export function getPackGapsForPack(packId: string) {
  const pack = getCompliancePacks().find(p => p.id === packId);
  if (!pack) return [];
  return computePackGaps(pack, getComplianceRequirements(), getPackControls(), getEvidenceMappings(), getEvidenceRecords(), getScheduledReviews());
}

export function getAllPackGaps() {
  return getCompliancePacks().flatMap(p => getPackGapsForPack(p.id));
}

// --- RELEASE 6 — UNIVERSAL REGULATORY KNOWLEDGE & OBLIGATION ENGINE ---
// Source -> Requirement -> Obligation -> Control -> Evidence. Api-first and
// Neon-backed from day one (the cache-then-network pattern applied
// immediately, unlike Release 5 which deferred it to 5.1) — reads stay
// synchronous off an in-memory cache, writes are async and Neon-first.

let regulatorySourcesCache: RegulatorySource[] = getItem<RegulatorySource[]>(STORAGE_KEYS.REGULATORY_SOURCES, INITIAL_REGULATORY_SOURCES);
let regulatoryRequirementsCache: RegulatoryRequirement[] = getItem<RegulatoryRequirement[]>(STORAGE_KEYS.REGULATORY_REQUIREMENTS, INITIAL_REGULATORY_REQUIREMENTS);
let obligationsCache: Obligation[] = getItem<Obligation[]>(STORAGE_KEYS.OBLIGATIONS, INITIAL_OBLIGATIONS);
let obligationControlsCache: ObligationControl[] = getItem<ObligationControl[]>(STORAGE_KEYS.OBLIGATION_CONTROLS, INITIAL_OBLIGATION_CONTROLS);
let obligationEvidenceMappingsCache: ObligationEvidenceMapping[] = getItem<ObligationEvidenceMapping[]>(STORAGE_KEYS.OBLIGATION_EVIDENCE_MAPPINGS, INITIAL_OBLIGATION_EVIDENCE_MAPPINGS);

function persistRegulatorySourcesCache() { setItem(STORAGE_KEYS.REGULATORY_SOURCES, regulatorySourcesCache); }
function persistRegulatoryRequirementsCache() { setItem(STORAGE_KEYS.REGULATORY_REQUIREMENTS, regulatoryRequirementsCache); }
function persistObligationsCache() { setItem(STORAGE_KEYS.OBLIGATIONS, obligationsCache); }
function persistObligationControlsCache() { setItem(STORAGE_KEYS.OBLIGATION_CONTROLS, obligationControlsCache); }
function persistObligationEvidenceMappingsCache() { setItem(STORAGE_KEYS.OBLIGATION_EVIDENCE_MAPPINGS, obligationEvidenceMappingsCache); }

export function getRegulatorySources(): RegulatorySource[] {
  return regulatorySourcesCache;
}

export async function saveRegulatorySource(data: Partial<RegulatorySource>): Promise<RegulatorySource> {
  if (data.id) {
    const idx = regulatorySourcesCache.findIndex(s => s.id === data.id);
    if (idx !== -1) {
      const updated: RegulatorySource = { ...regulatorySourcesCache[idx], ...data };
      regulatorySourcesCache = [...regulatorySourcesCache];
      regulatorySourcesCache[idx] = updated;
      persistRegulatorySourcesCache();

      addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'REGULATORY_SOURCE_UPDATED', 'Policy', updated.id, updated.name, `Updated regulatory source ${updated.name}`);

      const saved = await apiRegulatorySourceRepository.updateSource(updated.id, updated);
      const i2 = regulatorySourcesCache.findIndex(s => s.id === updated.id);
      if (i2 !== -1) { regulatorySourcesCache = [...regulatorySourcesCache]; regulatorySourcesCache[i2] = saved; persistRegulatorySourcesCache(); }
      return saved;
    }
  }

  const draftSource: RegulatorySource = {
    id: data.id || `src-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Regulatory Source',
    sourceType: data.sourceType || 'Regulation',
    jurisdiction: data.jurisdiction || 'Cross-Jurisdiction',
    industry: data.industry || 'Cross-Industry',
    version: data.version || '1.0',
    status: data.status || 'Draft',
    effectiveDate: data.effectiveDate || new Date().toISOString().split('T')[0],
    reviewDate: data.reviewDate,
  };

  regulatorySourcesCache = [draftSource, ...regulatorySourcesCache];
  persistRegulatorySourcesCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'REGULATORY_SOURCE_CREATED', 'Policy', draftSource.id, draftSource.name, `Registered regulatory source ${draftSource.name}`);

  const created = await apiRegulatorySourceRepository.createSource(draftSource);
  regulatorySourcesCache = regulatorySourcesCache.map(s => (s.id === draftSource.id ? created : s));
  persistRegulatorySourcesCache();
  return created;
}

export async function deleteRegulatorySource(id: string): Promise<void> {
  const target = regulatorySourcesCache.find(s => s.id === id);
  if (!target) return;

  // Mirror the backend's cascading relations locally too (Source -> Requirement -> Obligation -> Control -> Mapping).
  const orphanedReqIds = regulatoryRequirementsCache.filter(r => r.sourceId === id).map(r => r.id);
  const orphanedObligationIds = obligationsCache.filter(o => orphanedReqIds.includes(o.requirementId)).map(o => o.id);
  const orphanedControlIds = obligationControlsCache.filter(c => orphanedObligationIds.includes(c.obligationId)).map(c => c.id);

  regulatorySourcesCache = regulatorySourcesCache.filter(s => s.id !== id);
  persistRegulatorySourcesCache();
  regulatoryRequirementsCache = regulatoryRequirementsCache.filter(r => r.sourceId !== id);
  persistRegulatoryRequirementsCache();
  obligationsCache = obligationsCache.filter(o => !orphanedReqIds.includes(o.requirementId));
  persistObligationsCache();
  obligationControlsCache = obligationControlsCache.filter(c => !orphanedObligationIds.includes(c.obligationId));
  persistObligationControlsCache();
  obligationEvidenceMappingsCache = obligationEvidenceMappingsCache.filter(m => !orphanedControlIds.includes(m.controlId));
  persistObligationEvidenceMappingsCache();

  addAuditLog('usr-1', 'Sarah Jenkins', 'SUPER_ADMIN', 'REGULATORY_SOURCE_DELETED', 'Policy', id, target.name, `Deleted regulatory source ${target.name}`);

  await apiRegulatorySourceRepository.deleteSource(id);
}

export function getRegulatoryRequirements(): RegulatoryRequirement[] {
  return regulatoryRequirementsCache;
}

export async function saveRegulatoryRequirement(data: Partial<RegulatoryRequirement>): Promise<RegulatoryRequirement> {
  const source = regulatorySourcesCache.find(s => s.id === data.sourceId);

  if (data.id) {
    const idx = regulatoryRequirementsCache.findIndex(r => r.id === data.id);
    if (idx !== -1) {
      const updated: RegulatoryRequirement = { ...regulatoryRequirementsCache[idx], ...data, sourceName: source?.name || regulatoryRequirementsCache[idx].sourceName };
      regulatoryRequirementsCache = [...regulatoryRequirementsCache];
      regulatoryRequirementsCache[idx] = updated;
      persistRegulatoryRequirementsCache();

      const saved = await apiRegulatoryRequirementRepository.updateRequirement(updated.id, updated);
      const reconciled = { ...saved, sourceName: updated.sourceName };
      const i2 = regulatoryRequirementsCache.findIndex(r => r.id === updated.id);
      if (i2 !== -1) { regulatoryRequirementsCache = [...regulatoryRequirementsCache]; regulatoryRequirementsCache[i2] = reconciled; persistRegulatoryRequirementsCache(); }
      return reconciled;
    }
  }

  const draftReq: RegulatoryRequirement = {
    id: data.id || `REQ-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Requirement',
    description: data.description || '',
    category: data.category || 'General',
    criticality: data.criticality || 'Medium',
    status: data.status || 'Draft',
    sourceId: data.sourceId || '',
    sourceName: source?.name || 'Unassigned Source',
  };

  regulatoryRequirementsCache = [draftReq, ...regulatoryRequirementsCache];
  persistRegulatoryRequirementsCache();

  const created = { ...(await apiRegulatoryRequirementRepository.createRequirement(draftReq)), sourceName: draftReq.sourceName };
  regulatoryRequirementsCache = regulatoryRequirementsCache.map(r => (r.id === draftReq.id ? created : r));
  persistRegulatoryRequirementsCache();
  return created;
}

export async function deleteRegulatoryRequirement(id: string): Promise<void> {
  const target = regulatoryRequirementsCache.find(r => r.id === id);
  if (!target) return;

  const orphanedObligationIds = obligationsCache.filter(o => o.requirementId === id).map(o => o.id);
  const orphanedControlIds = obligationControlsCache.filter(c => orphanedObligationIds.includes(c.obligationId)).map(c => c.id);

  regulatoryRequirementsCache = regulatoryRequirementsCache.filter(r => r.id !== id);
  persistRegulatoryRequirementsCache();
  obligationsCache = obligationsCache.filter(o => o.requirementId !== id);
  persistObligationsCache();
  obligationControlsCache = obligationControlsCache.filter(c => !orphanedObligationIds.includes(c.obligationId));
  persistObligationControlsCache();
  obligationEvidenceMappingsCache = obligationEvidenceMappingsCache.filter(m => !orphanedControlIds.includes(m.controlId));
  persistObligationEvidenceMappingsCache();

  await apiRegulatoryRequirementRepository.deleteRequirement(id);
}

export function getObligations(): Obligation[] {
  return obligationsCache;
}

export async function saveObligation(data: Partial<Obligation>): Promise<Obligation> {
  const requirement = regulatoryRequirementsCache.find(r => r.id === data.requirementId);

  if (data.id) {
    const idx = obligationsCache.findIndex(o => o.id === data.id);
    if (idx !== -1) {
      const updated: Obligation = { ...obligationsCache[idx], ...data, requirementName: requirement?.name || obligationsCache[idx].requirementName };
      obligationsCache = [...obligationsCache];
      obligationsCache[idx] = updated;
      persistObligationsCache();

      const saved = await apiObligationRepository.updateObligation(updated.id, updated);
      const reconciled = { ...saved, requirementName: updated.requirementName };
      const i2 = obligationsCache.findIndex(o => o.id === updated.id);
      if (i2 !== -1) { obligationsCache = [...obligationsCache]; obligationsCache[i2] = reconciled; persistObligationsCache(); }
      return reconciled;
    }
  }

  const draftObligation: Obligation = {
    id: data.id || `obl-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Obligation',
    description: data.description || '',
    owner: data.owner || '',
    status: data.status || 'Draft',
    requirementId: data.requirementId || '',
    requirementName: requirement?.name || 'Unassigned Requirement',
  };

  obligationsCache = [draftObligation, ...obligationsCache];
  persistObligationsCache();

  const created = { ...(await apiObligationRepository.createObligation(draftObligation)), requirementName: draftObligation.requirementName };
  obligationsCache = obligationsCache.map(o => (o.id === draftObligation.id ? created : o));
  persistObligationsCache();
  return created;
}

export async function deleteObligation(id: string): Promise<void> {
  const target = obligationsCache.find(o => o.id === id);
  if (!target) return;

  const orphanedControlIds = obligationControlsCache.filter(c => c.obligationId === id).map(c => c.id);

  obligationsCache = obligationsCache.filter(o => o.id !== id);
  persistObligationsCache();
  obligationControlsCache = obligationControlsCache.filter(c => c.obligationId !== id);
  persistObligationControlsCache();
  obligationEvidenceMappingsCache = obligationEvidenceMappingsCache.filter(m => !orphanedControlIds.includes(m.controlId));
  persistObligationEvidenceMappingsCache();

  await apiObligationRepository.deleteObligation(id);
}

export function getObligationControls(): ObligationControl[] {
  return obligationControlsCache;
}

export async function saveObligationControl(data: Partial<ObligationControl>): Promise<ObligationControl> {
  const obligation = obligationsCache.find(o => o.id === data.obligationId);

  if (data.id) {
    const idx = obligationControlsCache.findIndex(c => c.id === data.id);
    if (idx !== -1) {
      const updated: ObligationControl = { ...obligationControlsCache[idx], ...data, obligationName: obligation?.name || obligationControlsCache[idx].obligationName };
      obligationControlsCache = [...obligationControlsCache];
      obligationControlsCache[idx] = updated;
      persistObligationControlsCache();

      const saved = await apiObligationControlRepository.updateControl(updated.id, updated);
      const reconciled = { ...saved, obligationName: updated.obligationName };
      const i2 = obligationControlsCache.findIndex(c => c.id === updated.id);
      if (i2 !== -1) { obligationControlsCache = [...obligationControlsCache]; obligationControlsCache[i2] = reconciled; persistObligationControlsCache(); }
      return reconciled;
    }
  }

  const draftControl: ObligationControl = {
    id: data.id || `octl-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Control',
    description: data.description || '',
    owner: data.owner || '',
    status: data.status || 'Draft',
    obligationId: data.obligationId || '',
    obligationName: obligation?.name || 'Unassigned Obligation',
  };

  obligationControlsCache = [draftControl, ...obligationControlsCache];
  persistObligationControlsCache();

  const created = { ...(await apiObligationControlRepository.createControl(draftControl)), obligationName: draftControl.obligationName };
  obligationControlsCache = obligationControlsCache.map(c => (c.id === draftControl.id ? created : c));
  persistObligationControlsCache();
  return created;
}

export async function deleteObligationControl(id: string): Promise<void> {
  const target = obligationControlsCache.find(c => c.id === id);
  if (!target) return;

  obligationControlsCache = obligationControlsCache.filter(c => c.id !== id);
  persistObligationControlsCache();
  obligationEvidenceMappingsCache = obligationEvidenceMappingsCache.filter(m => m.controlId !== id);
  persistObligationEvidenceMappingsCache();

  await apiObligationControlRepository.deleteControl(id);
}

export function getObligationEvidenceMappings(): ObligationEvidenceMapping[] {
  return obligationEvidenceMappingsCache;
}

export async function saveObligationEvidenceMapping(data: Partial<ObligationEvidenceMapping>): Promise<ObligationEvidenceMapping> {
  const control = obligationControlsCache.find(c => c.id === data.controlId);
  const evidence = getEvidenceRecordById(data.evidenceId || '');

  if (data.id) {
    const idx = obligationEvidenceMappingsCache.findIndex(m => m.id === data.id);
    if (idx !== -1) {
      const updated: ObligationEvidenceMapping = {
        ...obligationEvidenceMappingsCache[idx],
        ...data,
        controlName: control?.name || obligationEvidenceMappingsCache[idx].controlName,
        evidenceName: evidence?.name || obligationEvidenceMappingsCache[idx].evidenceName,
      };
      obligationEvidenceMappingsCache = [...obligationEvidenceMappingsCache];
      obligationEvidenceMappingsCache[idx] = updated;
      persistObligationEvidenceMappingsCache();

      const saved = await apiObligationEvidenceMappingRepository.updateMapping(updated.id, updated);
      const reconciled = { ...saved, controlName: updated.controlName, evidenceName: updated.evidenceName };
      const i2 = obligationEvidenceMappingsCache.findIndex(m => m.id === updated.id);
      if (i2 !== -1) { obligationEvidenceMappingsCache = [...obligationEvidenceMappingsCache]; obligationEvidenceMappingsCache[i2] = reconciled; persistObligationEvidenceMappingsCache(); }
      return reconciled;
    }
  }

  const draftMapping: ObligationEvidenceMapping = {
    id: `local-omap-${Date.now()}`,
    controlId: data.controlId || '',
    controlName: control?.name || 'Unassigned Control',
    evidenceId: data.evidenceId || '',
    evidenceName: evidence?.name || 'Unassigned Evidence',
  };

  obligationEvidenceMappingsCache = [draftMapping, ...obligationEvidenceMappingsCache];
  persistObligationEvidenceMappingsCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'OBLIGATION_EVIDENCE_MAPPING_CREATED', 'EvidenceRecord', draftMapping.id, draftMapping.evidenceName, `Mapped ${draftMapping.evidenceName} to control ${draftMapping.controlName}`);

  const { id: _draftId, ...payload } = draftMapping;
  const created = { ...(await apiObligationEvidenceMappingRepository.createMapping(payload)), controlName: draftMapping.controlName, evidenceName: draftMapping.evidenceName };
  obligationEvidenceMappingsCache = obligationEvidenceMappingsCache.map(m => (m.id === draftMapping.id ? created : m));
  persistObligationEvidenceMappingsCache();
  return created;
}

export async function deleteObligationEvidenceMapping(id: string): Promise<void> {
  const target = obligationEvidenceMappingsCache.find(m => m.id === id);
  if (!target) return;

  obligationEvidenceMappingsCache = obligationEvidenceMappingsCache.filter(m => m.id !== id);
  persistObligationEvidenceMappingsCache();

  await apiObligationEvidenceMappingRepository.deleteMapping(id);
}

export function getSourceCoverage(sourceId: string) {
  const source = regulatorySourcesCache.find(s => s.id === sourceId);
  if (!source) return null;
  return computeSourceCoverage(source, regulatoryRequirementsCache, obligationsCache, obligationControlsCache, obligationEvidenceMappingsCache, getEvidenceRecords());
}

export function getObligationCoverage(obligationId: string) {
  const obligation = obligationsCache.find(o => o.id === obligationId);
  if (!obligation) return null;
  return computeObligationCoverage(obligation, obligationControlsCache, obligationEvidenceMappingsCache, getEvidenceRecords());
}

export function getRegulatoryRequirementCoverage(requirementId: string) {
  const requirement = regulatoryRequirementsCache.find(r => r.id === requirementId);
  if (!requirement) return null;
  return computeRegulatoryRequirementCoverage(requirement, obligationsCache, obligationControlsCache, obligationEvidenceMappingsCache, getEvidenceRecords());
}

export function getSourceGapsForSource(sourceId: string) {
  const source = regulatorySourcesCache.find(s => s.id === sourceId);
  if (!source) return [];
  return computeSourceGaps(source, regulatoryRequirementsCache, obligationsCache, obligationControlsCache, obligationEvidenceMappingsCache, getEvidenceRecords(), getScheduledReviews());
}

export function getAllSourceGaps() {
  return regulatorySourcesCache.flatMap(s => getSourceGapsForSource(s.id));
}

// --- RELEASE 7 — GOVERNANCE INTELLIGENCE ENGINE (FOUNDATION) ---
// Policy -> Condition -> Violation -> Finding -> Outcome. Policies and
// Findings are genuinely persisted (Neon-backed, cache-then-network, same as
// every Release 6 object); Conditions, Violations and Outcomes are computed
// live from real governance data on every read — detection and
// recommendation only, never automatic state changes.

let governancePoliciesCache: GovernancePolicy[] = getItem<GovernancePolicy[]>(STORAGE_KEYS.GOVERNANCE_POLICIES, INITIAL_GOVERNANCE_POLICIES);
let governanceFindingsCache: GovernanceFinding[] = getItem<GovernanceFinding[]>(STORAGE_KEYS.GOVERNANCE_FINDINGS, INITIAL_GOVERNANCE_FINDINGS);

function persistGovernancePoliciesCache() { setItem(STORAGE_KEYS.GOVERNANCE_POLICIES, governancePoliciesCache); }
function persistGovernanceFindingsCache() { setItem(STORAGE_KEYS.GOVERNANCE_FINDINGS, governanceFindingsCache); }

export function getGovernancePolicies(): GovernancePolicy[] {
  return governancePoliciesCache;
}

export async function saveGovernancePolicy(data: Partial<GovernancePolicy>): Promise<GovernancePolicy> {
  const obligation = data.obligationId ? obligationsCache.find(o => o.id === data.obligationId) : undefined;

  if (data.id) {
    const idx = governancePoliciesCache.findIndex(p => p.id === data.id);
    if (idx !== -1) {
      const updated: GovernancePolicy = { ...governancePoliciesCache[idx], ...data, obligationName: obligation?.name ?? governancePoliciesCache[idx].obligationName };
      governancePoliciesCache = [...governancePoliciesCache];
      governancePoliciesCache[idx] = updated;
      persistGovernancePoliciesCache();

      addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'GOVERNANCE_POLICY_UPDATED', 'Policy', updated.id, updated.name, `Updated governance policy ${updated.name}`);

      const saved = await apiGovernancePolicyRepository.updatePolicy(updated.id, updated);
      const reconciled = { ...saved, obligationName: updated.obligationName };
      const i2 = governancePoliciesCache.findIndex(p => p.id === updated.id);
      if (i2 !== -1) { governancePoliciesCache = [...governancePoliciesCache]; governancePoliciesCache[i2] = reconciled; persistGovernancePoliciesCache(); }
      return reconciled;
    }
  }

  const draftPolicy: GovernancePolicy = {
    id: data.id || `POL-${Date.now().toString().slice(-6)}`,
    name: data.name || 'New Governance Policy',
    description: data.description || '',
    category: data.category || 'General',
    severity: data.severity || 'Medium',
    status: data.status || 'Draft',
    triggerCondition: data.triggerCondition || 'Missing Owner',
    obligationId: data.obligationId,
    obligationName: obligation?.name,
    linkedControlIds: data.linkedControlIds || [],
  };

  governancePoliciesCache = [draftPolicy, ...governancePoliciesCache];
  persistGovernancePoliciesCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'GOVERNANCE_POLICY_CREATED', 'Policy', draftPolicy.id, draftPolicy.name, `Registered governance policy ${draftPolicy.name}`);

  const created = { ...(await apiGovernancePolicyRepository.createPolicy(draftPolicy)), obligationName: draftPolicy.obligationName };
  governancePoliciesCache = governancePoliciesCache.map(p => (p.id === draftPolicy.id ? created : p));
  persistGovernancePoliciesCache();
  return created;
}

export async function deleteGovernancePolicy(id: string): Promise<void> {
  const target = governancePoliciesCache.find(p => p.id === id);
  if (!target) return;

  governancePoliciesCache = governancePoliciesCache.filter(p => p.id !== id);
  persistGovernancePoliciesCache();
  governanceFindingsCache = governanceFindingsCache.filter(f => f.policyId !== id);
  persistGovernanceFindingsCache();

  addAuditLog('usr-1', 'Sarah Jenkins', 'SUPER_ADMIN', 'GOVERNANCE_POLICY_DELETED', 'Policy', id, target.name, `Deleted governance policy ${target.name}`);

  await apiGovernancePolicyRepository.deletePolicy(id);
}

export function getGovernanceFindings(): GovernanceFinding[] {
  return governanceFindingsCache;
}

export function getGovernanceFindingsForAsset(assetId: string): GovernanceFinding[] {
  return governanceFindingsCache.filter(f => f.assetId === assetId);
}

export async function saveGovernanceFinding(data: Partial<GovernanceFinding>): Promise<GovernanceFinding> {
  const asset = data.assetId ? assetsCache.find(a => a.id === data.assetId) : undefined;
  const policy = data.policyId ? governancePoliciesCache.find(p => p.id === data.policyId) : undefined;

  if (data.id) {
    const idx = governanceFindingsCache.findIndex(f => f.id === data.id);
    if (idx !== -1) {
      const updated: GovernanceFinding = {
        ...governanceFindingsCache[idx],
        ...data,
        assetName: asset?.name ?? governanceFindingsCache[idx].assetName,
        policyName: policy?.name ?? governanceFindingsCache[idx].policyName,
      };
      governanceFindingsCache = [...governanceFindingsCache];
      governanceFindingsCache[idx] = updated;
      persistGovernanceFindingsCache();

      const saved = await apiGovernanceFindingRepository.updateFinding(updated.id, updated);
      const reconciled = { ...saved, assetName: updated.assetName, policyName: updated.policyName };
      const i2 = governanceFindingsCache.findIndex(f => f.id === updated.id);
      if (i2 !== -1) { governanceFindingsCache = [...governanceFindingsCache]; governanceFindingsCache[i2] = reconciled; persistGovernanceFindingsCache(); }
      return reconciled;
    }
  }

  const now = new Date().toISOString().split('T')[0];
  const draftFinding: GovernanceFinding = {
    id: `local-finding-${Date.now()}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    policyId: data.policyId || '',
    policyName: policy?.name || 'Unassigned Policy',
    conditionType: data.conditionType || 'Missing Owner',
    severity: data.severity || policy?.severity || 'Medium',
    status: data.status || 'Open',
    detail: data.detail || '',
    createdDate: data.createdDate || now,
    resolutionDate: data.resolutionDate,
    resolutionNotes: data.resolutionNotes,
  };

  governanceFindingsCache = [draftFinding, ...governanceFindingsCache];
  persistGovernanceFindingsCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'GOVERNANCE_FINDING_CREATED', 'Policy', draftFinding.id, draftFinding.policyName, `Finding raised for ${draftFinding.assetName}: ${draftFinding.conditionType}`);

  const { id: _draftId, ...payload } = draftFinding;
  const created = { ...(await apiGovernanceFindingRepository.createFinding(payload)), assetName: draftFinding.assetName, policyName: draftFinding.policyName };
  governanceFindingsCache = governanceFindingsCache.map(f => (f.id === draftFinding.id ? created : f));
  persistGovernanceFindingsCache();
  return created;
}

export async function deleteGovernanceFinding(id: string): Promise<void> {
  const target = governanceFindingsCache.find(f => f.id === id);
  if (!target) return;

  governanceFindingsCache = governanceFindingsCache.filter(f => f.id !== id);
  persistGovernanceFindingsCache();

  await apiGovernanceFindingRepository.deleteFinding(id);
}

// --- OMG vNEXT — GOVERNANCE INTELLIGENCE, MODULE 3: GOVERNANCE DRIFT ---
// Same cache-then-sync pattern as Governance Findings above. Drift records
// are opened/resolved by governanceDriftEngine.ts's reconciliation pass, not
// hand-authored, but the storage layer itself doesn't need to know that.

let governanceDriftsCache: GovernanceDrift[] = getItem<GovernanceDrift[]>(STORAGE_KEYS.GOVERNANCE_DRIFTS, []);

function persistGovernanceDriftsCache() { setItem(STORAGE_KEYS.GOVERNANCE_DRIFTS, governanceDriftsCache); }

export function getGovernanceDrifts(): GovernanceDrift[] {
  return governanceDriftsCache;
}

export function getGovernanceDriftsForAsset(assetId: string): GovernanceDrift[] {
  return governanceDriftsCache.filter(d => d.assetId === assetId);
}

export async function openGovernanceDrift(data: Omit<GovernanceDrift, 'id' | 'status' | 'detectedAt'>): Promise<GovernanceDrift> {
  const now = new Date().toISOString().split('T')[0];
  const draft: GovernanceDrift = { ...data, id: `local-drift-${Date.now()}-${data.category}`, status: 'Open', detectedAt: now };

  governanceDriftsCache = [draft, ...governanceDriftsCache];
  persistGovernanceDriftsCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'GOVERNANCE_DRIFT_DETECTED', 'Asset', draft.assetId, draft.assetName, `${draft.severity} ${draft.category} drift detected: ${draft.detail}`);

  const { id: _draftId, ...payload } = draft;
  const created = { ...(await apiGovernanceDriftRepository.createDrift(payload)), assetName: draft.assetName };
  governanceDriftsCache = governanceDriftsCache.map(d => (d.id === draft.id ? created : d));
  persistGovernanceDriftsCache();
  return created;
}

export async function resolveGovernanceDrift(id: string): Promise<GovernanceDrift | undefined> {
  const idx = governanceDriftsCache.findIndex(d => d.id === id);
  if (idx === -1) return undefined;

  const now = new Date().toISOString().split('T')[0];
  const updated: GovernanceDrift = { ...governanceDriftsCache[idx], status: 'Resolved', resolvedAt: now };
  governanceDriftsCache = [...governanceDriftsCache];
  governanceDriftsCache[idx] = updated;
  persistGovernanceDriftsCache();

  const saved = await apiGovernanceDriftRepository.updateDrift(updated.id, { status: 'Resolved', resolvedAt: updated.resolvedAt });
  const reconciled = { ...saved, assetName: updated.assetName };
  const i2 = governanceDriftsCache.findIndex(d => d.id === updated.id);
  if (i2 !== -1) { governanceDriftsCache = [...governanceDriftsCache]; governanceDriftsCache[i2] = reconciled; persistGovernanceDriftsCache(); }
  return reconciled;
}

/** Objective 2 — Condition Engine, computed live. Filtered through Release 10's Condition Designer (condition types disabled in the Studio are never raised). */
export function getGovernanceConditionsForAsset(assetId: string): GovernanceCondition[] {
  const asset = assetsCache.find(a => a.id === assetId);
  if (!asset) return [];
  return detectGovernanceConditions(
    asset,
    evidenceCache.filter(e => e.assetId === assetId),
    reviewsCache.filter(r => r.assetId === assetId),
    getValidations().filter(v => v.assetId === assetId),
    reauthorizationsCache.filter(r => r.assetId === assetId),
    getEnabledConditionTypes()
  );
}

export function getAllGovernanceConditions(): GovernanceCondition[] {
  return assetsCache.flatMap(a => getGovernanceConditionsForAsset(a.id));
}

/** Objective 3 — Governance Rule Engine, computed live. */
export function getPolicyViolationsForAsset(assetId: string): GovernancePolicyViolation[] {
  return evaluatePolicyViolations(governancePoliciesCache, getGovernanceConditionsForAsset(assetId));
}

export function getAllPolicyViolations(): GovernancePolicyViolation[] {
  return evaluatePolicyViolations(governancePoliciesCache, getAllGovernanceConditions());
}

/** Objectives 5 & 6 — Governance Outcome Engine + Explainability, computed live. Tiers disabled in Release 10's Outcome Designer are skipped, cascading to the next enabled tier. */
export function getGovernanceOutcomeForAsset(assetId: string): GovernanceOutcome | null {
  const asset = assetsCache.find(a => a.id === assetId);
  if (!asset) return null;
  return computeGovernanceOutcome(asset, getGovernanceConditionsForAsset(assetId), getPolicyViolationsForAsset(assetId), getGovernanceFindingsForAsset(assetId), getDisabledOutcomes());
}

export function getAllGovernanceOutcomes(): GovernanceOutcome[] {
  const disabled = getDisabledOutcomes();
  return assetsCache.map(a => computeGovernanceOutcome(a, getGovernanceConditionsForAsset(a.id), getPolicyViolationsForAsset(a.id), getGovernanceFindingsForAsset(a.id), disabled));
}

// --- RELEASE 8 — GOVERNANCE INTELLIGENCE ENGINE (ACTIONS EDITION) ---
// The bridge between Governance Intelligence and Governance Execution:
// Outcome -> Recommended Action, with a human Accept / Reject / Defer
// decision layer. Recommendation-driven, not automation-driven — nothing
// here executes automatically. Recommended Actions are persisted (Neon,
// cache-then-network, same as Policies/Findings); the drafts that produce
// them (governanceActionsEngine.ts) are computed live.

let recommendedActionsCache: RecommendedAction[] = getItem<RecommendedAction[]>(STORAGE_KEYS.RECOMMENDED_ACTIONS, INITIAL_RECOMMENDED_ACTIONS);

function persistRecommendedActionsCache() { setItem(STORAGE_KEYS.RECOMMENDED_ACTIONS, recommendedActionsCache); }

export function getRecommendedActions(): RecommendedAction[] {
  return recommendedActionsCache;
}

export function getRecommendedActionsForAsset(assetId: string): RecommendedAction[] {
  return recommendedActionsCache.filter(a => a.assetId === assetId);
}

export async function saveRecommendedAction(data: Partial<RecommendedAction>): Promise<RecommendedAction> {
  const asset = data.assetId ? assetsCache.find(a => a.id === data.assetId) : undefined;
  const policy = data.policyId ? governancePoliciesCache.find(p => p.id === data.policyId) : undefined;

  if (data.id) {
    const idx = recommendedActionsCache.findIndex(a => a.id === data.id);
    if (idx !== -1) {
      // Release 9 — stamp decidedAt the moment a human decision (decidedBy) is recorded, so the caller only needs to supply who.
      const decidedAt = data.decidedBy ? new Date().toISOString().split('T')[0] : data.decidedAt;
      const updated: RecommendedAction = {
        ...recommendedActionsCache[idx],
        ...data,
        decidedAt,
        assetName: asset?.name ?? recommendedActionsCache[idx].assetName,
        policyName: policy?.name ?? recommendedActionsCache[idx].policyName,
      };
      recommendedActionsCache = [...recommendedActionsCache];
      recommendedActionsCache[idx] = updated;
      persistRecommendedActionsCache();

      const actorLabel = updated.decidedBy && data.decidedBy ? ` by ${updated.decidedBy}` : '';
      addAuditLog('usr-2', updated.decidedBy || updated.owner || 'David Chen', 'GOVERNANCE_ADMIN', 'RECOMMENDED_ACTION_UPDATED', 'Policy', updated.id, updated.name, `Updated recommended action ${updated.name} for ${updated.assetName}: ${updated.status}${actorLabel}`);

      const saved = await apiRecommendedActionRepository.updateAction(updated.id, updated);
      const reconciled = { ...saved, assetName: updated.assetName, policyName: updated.policyName };
      const i2 = recommendedActionsCache.findIndex(a => a.id === updated.id);
      if (i2 !== -1) { recommendedActionsCache = [...recommendedActionsCache]; recommendedActionsCache[i2] = reconciled; persistRecommendedActionsCache(); }
      return reconciled;
    }
  }

  const draftAction: RecommendedAction = {
    id: `local-action-${Date.now()}`,
    actionType: data.actionType || 'Review',
    name: data.name || 'New Recommended Action',
    description: data.description || '',
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    policyId: data.policyId,
    policyName: policy?.name,
    findingId: data.findingId,
    priority: data.priority || 'Medium',
    owner: data.owner,
    dueDate: data.dueDate,
    status: data.status || 'Open',
  };

  recommendedActionsCache = [draftAction, ...recommendedActionsCache];
  persistRecommendedActionsCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'RECOMMENDED_ACTION_CREATED', 'Policy', draftAction.id, draftAction.name, `Recommended action raised for ${draftAction.assetName}: ${draftAction.name}`);

  const { id: _draftId, ...payload } = draftAction;
  const created = { ...(await apiRecommendedActionRepository.createAction(payload)), assetName: draftAction.assetName, policyName: draftAction.policyName };
  recommendedActionsCache = recommendedActionsCache.map(a => (a.id === draftAction.id ? created : a));
  persistRecommendedActionsCache();
  return created;
}

export async function deleteRecommendedAction(id: string): Promise<void> {
  const target = recommendedActionsCache.find(a => a.id === id);
  if (!target) return;

  recommendedActionsCache = recommendedActionsCache.filter(a => a.id !== id);
  persistRecommendedActionsCache();

  await apiRecommendedActionRepository.deleteAction(id);
}

/**
 * Objectives 1 & 3 — Recommended Action Engine. Generates only genuinely new
 * drafts for this asset (skips anything already open/accepted/in-progress
 * against the same finding, or of the same outcome-driven action type),
 * then persists them — mirroring "Generate Findings from Violations" from
 * Release 7's reasoning engine one link further down the chain.
 */
export async function generateRecommendedActionsForAsset(assetId: string): Promise<RecommendedAction[]> {
  const asset = assetsCache.find(a => a.id === assetId);
  if (!asset) return [];

  const findings = getGovernanceFindingsForAsset(assetId);
  const outcome = getGovernanceOutcomeForAsset(assetId);
  const drafts = generateActionDrafts(asset, findings, outcome, actionRulesCache);

  const activeActions = getRecommendedActionsForAsset(assetId).filter(a => a.status !== 'Rejected' && a.status !== 'Completed');
  const activeFindingKeys = new Set(activeActions.filter(a => a.findingId).map(a => a.findingId));
  const activeOutcomeActionTypes = new Set(activeActions.filter(a => !a.findingId).map(a => a.actionType));

  const newDrafts = drafts.filter(d => (d.findingId ? !activeFindingKeys.has(d.findingId) : !activeOutcomeActionTypes.has(d.actionType)));

  return Promise.all(newDrafts.map(d => saveRecommendedAction(d)));
}

// --- RELEASE 10 — GOVERNANCE INTELLIGENCE STUDIO (CUSTOMER CONFIGURATION) ---
// Converts the parts of the reasoning/actions engines above that were
// hardcoded config into genuinely editable Neon-backed rules. All four
// catalogues are persisted, cache-then-network, same pattern as every
// domain since Release 6. ConditionDefinition/OutcomeRule have no delete —
// fixed one-row-per-platform-primitive catalogues, seeded once.

let conditionDefinitionsCache: ConditionDefinition[] = getItem<ConditionDefinition[]>(STORAGE_KEYS.CONDITION_DEFINITIONS, []);
let outcomeRulesCache: OutcomeRule[] = getItem<OutcomeRule[]>(STORAGE_KEYS.OUTCOME_RULES, []);
let actionRulesCache: ActionRule[] = getItem<ActionRule[]>(STORAGE_KEYS.ACTION_RULES, []);
let governanceProfilesCache: GovernanceProfile[] = getItem<GovernanceProfile[]>(STORAGE_KEYS.GOVERNANCE_PROFILES, []);

function persistConditionDefinitionsCache() { setItem(STORAGE_KEYS.CONDITION_DEFINITIONS, conditionDefinitionsCache); }
function persistOutcomeRulesCache() { setItem(STORAGE_KEYS.OUTCOME_RULES, outcomeRulesCache); }
function persistActionRulesCache() { setItem(STORAGE_KEYS.ACTION_RULES, actionRulesCache); }
function persistGovernanceProfilesCache() { setItem(STORAGE_KEYS.GOVERNANCE_PROFILES, governanceProfilesCache); }

/** Condition types with no explicit (disabled) definition are treated as enabled — same "nothing disabled" default the reasoning engine assumes when the Studio hasn't loaded yet. */
function getEnabledConditionTypes(): Set<GovernanceCondition['conditionType']> | undefined {
  if (conditionDefinitionsCache.length === 0) return undefined;
  return new Set(conditionDefinitionsCache.filter(c => c.enabled).map(c => c.conditionType));
}

function getDisabledOutcomes(): Set<GovernanceOutcome['status']> | undefined {
  if (outcomeRulesCache.length === 0) return undefined;
  const disabled = outcomeRulesCache.filter(r => !r.enabled).map(r => r.outcomeStatus);
  return disabled.length > 0 ? new Set(disabled) : undefined;
}

export function getConditionDefinitions(): ConditionDefinition[] {
  return conditionDefinitionsCache;
}

export async function saveConditionDefinition(data: Partial<ConditionDefinition>): Promise<ConditionDefinition> {
  const idx = conditionDefinitionsCache.findIndex(c => c.id === data.id);
  if (idx === -1) throw new Error('Condition Definitions are a fixed catalogue and cannot be created from the client.');

  const updated: ConditionDefinition = { ...conditionDefinitionsCache[idx], ...data };
  conditionDefinitionsCache = [...conditionDefinitionsCache];
  conditionDefinitionsCache[idx] = updated;
  persistConditionDefinitionsCache();

  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'CONDITION_DEFINITION_UPDATED', 'Policy', updated.id, updated.label, `Condition Designer: ${updated.label} ${updated.enabled ? 'enabled' : 'disabled'}.`);

  const saved = await apiConditionDefinitionRepository.updateDefinition(updated.id, updated);
  const i2 = conditionDefinitionsCache.findIndex(c => c.id === updated.id);
  if (i2 !== -1) { conditionDefinitionsCache = [...conditionDefinitionsCache]; conditionDefinitionsCache[i2] = saved; persistConditionDefinitionsCache(); }
  return saved;
}

export function getOutcomeRules(): OutcomeRule[] {
  return outcomeRulesCache;
}

export async function saveOutcomeRule(data: Partial<OutcomeRule>): Promise<OutcomeRule> {
  const idx = outcomeRulesCache.findIndex(r => r.id === data.id);
  if (idx === -1) throw new Error('Outcome Rules are a fixed catalogue and cannot be created from the client.');

  const updated: OutcomeRule = { ...outcomeRulesCache[idx], ...data };
  outcomeRulesCache = [...outcomeRulesCache];
  outcomeRulesCache[idx] = updated;
  persistOutcomeRulesCache();

  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'OUTCOME_RULE_UPDATED', 'Policy', updated.id, updated.outcomeStatus, `Outcome Designer: ${updated.outcomeStatus} ${updated.enabled ? 'enabled' : 'disabled'}.`);

  const saved = await apiOutcomeRuleRepository.updateRule(updated.id, updated);
  const i2 = outcomeRulesCache.findIndex(r => r.id === updated.id);
  if (i2 !== -1) { outcomeRulesCache = [...outcomeRulesCache]; outcomeRulesCache[i2] = saved; persistOutcomeRulesCache(); }
  return saved;
}

export function getActionRules(): ActionRule[] {
  return actionRulesCache;
}

export async function saveActionRule(data: Partial<ActionRule>): Promise<ActionRule> {
  if (data.id) {
    const idx = actionRulesCache.findIndex(r => r.id === data.id);
    if (idx !== -1) {
      const updated: ActionRule = { ...actionRulesCache[idx], ...data };
      actionRulesCache = [...actionRulesCache];
      actionRulesCache[idx] = updated;
      persistActionRulesCache();

      addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'ACTION_RULE_UPDATED', 'Policy', updated.id, updated.actionName, `Action Designer: ${updated.actionName} updated (${updated.triggerType}: ${updated.triggerValue}).`);

      const saved = await apiActionRuleRepository.updateRule(updated.id, updated);
      const i2 = actionRulesCache.findIndex(r => r.id === updated.id);
      if (i2 !== -1) { actionRulesCache = [...actionRulesCache]; actionRulesCache[i2] = saved; persistActionRulesCache(); }
      return saved;
    }
  }

  const draftRule: ActionRule = {
    id: `local-action-rule-${Date.now()}`,
    triggerType: data.triggerType || 'Condition',
    triggerValue: data.triggerValue || '',
    actionType: data.actionType || 'Review',
    actionName: data.actionName || 'New Action Rule',
    actionDescription: data.actionDescription || '',
    enabled: data.enabled ?? true,
  };

  actionRulesCache = [draftRule, ...actionRulesCache];
  persistActionRulesCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'ACTION_RULE_CREATED', 'Policy', draftRule.id, draftRule.actionName, `Action Designer: new rule ${draftRule.actionName} for ${draftRule.triggerType}: ${draftRule.triggerValue}.`);

  const { id: _draftId, ...payload } = draftRule;
  const created = await apiActionRuleRepository.createRule(payload);
  actionRulesCache = actionRulesCache.map(r => (r.id === draftRule.id ? created : r));
  persistActionRulesCache();
  return created;
}

export async function deleteActionRule(id: string): Promise<void> {
  const target = actionRulesCache.find(r => r.id === id);
  if (!target) return;

  actionRulesCache = actionRulesCache.filter(r => r.id !== id);
  persistActionRulesCache();

  await apiActionRuleRepository.deleteRule(id);
}

export function getGovernanceProfiles(): GovernanceProfile[] {
  return governanceProfilesCache;
}

/** Exactly one Governance Profile is active at a time — activating one deactivates the rest, all persisted. */
export async function saveGovernanceProfile(data: Partial<GovernanceProfile>): Promise<GovernanceProfile> {
  if (data.id) {
    const idx = governanceProfilesCache.findIndex(p => p.id === data.id);
    if (idx !== -1) {
      const activating = data.isActive === true && !governanceProfilesCache[idx].isActive;
      const updated: GovernanceProfile = { ...governanceProfilesCache[idx], ...data };
      governanceProfilesCache = governanceProfilesCache.map(p => (p.id === updated.id ? updated : (activating ? { ...p, isActive: false } : p)));
      persistGovernanceProfilesCache();

      addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'GOVERNANCE_PROFILE_UPDATED', 'Policy', updated.id, updated.name, activating ? `Customer Governance Profile activated: ${updated.name}.` : `Customer Governance Profile updated: ${updated.name}.`);

      const saved = await apiGovernanceProfileRepository.updateProfile(updated.id, updated);
      if (activating) {
        await Promise.all(
          governanceProfilesCache
            .filter(p => p.id !== updated.id && p.isActive === false)
            .map(p => apiGovernanceProfileRepository.updateProfile(p.id, { isActive: false }).catch(err => logPersistenceFailure('governance profile deactivation', err)))
        );
      }
      const i2 = governanceProfilesCache.findIndex(p => p.id === updated.id);
      if (i2 !== -1) { governanceProfilesCache = [...governanceProfilesCache]; governanceProfilesCache[i2] = saved; persistGovernanceProfilesCache(); }
      return saved;
    }
  }

  const draftProfile: GovernanceProfile = {
    id: `local-profile-${Date.now()}`,
    name: data.name || 'New Governance Profile',
    industry: data.industry || 'Enterprise',
    description: data.description || '',
    isActive: data.isActive ?? false,
  };

  governanceProfilesCache = [draftProfile, ...governanceProfilesCache];
  persistGovernanceProfilesCache();
  addAuditLog('usr-2', 'David Chen', 'GOVERNANCE_ADMIN', 'GOVERNANCE_PROFILE_CREATED', 'Policy', draftProfile.id, draftProfile.name, `Customer Governance Profile created: ${draftProfile.name}.`);

  const { id: _draftId, ...payload } = draftProfile;
  const created = await apiGovernanceProfileRepository.createProfile(payload);
  governanceProfilesCache = governanceProfilesCache.map(p => (p.id === draftProfile.id ? created : p));
  persistGovernanceProfilesCache();
  return created;
}

// --- RELEASE 9 — GOVERNANCE DECISION TRACEABILITY ENGINE ---
// Makes every governance decision reconstructable end-to-end. A Decision
// Trace is assembled live from data every prior release already produces —
// no new persisted domain object, same "computed, not stored" discipline
// Release 7 established for reasoning itself.

export function getDecisionTraceForAsset(assetId: string): DecisionTrace | null {
  const asset = assetsCache.find(a => a.id === assetId);
  if (!asset) return null;

  return buildDecisionTrace(
    asset,
    getEvidenceRecordsForAsset(assetId),
    reviewsCache.filter(r => r.assetId === assetId),
    getValidations().filter(v => v.assetId === assetId),
    reauthorizationsCache.filter(r => r.assetId === assetId),
    governancePoliciesCache.filter(p => p.status === 'Active'),
    getGovernanceConditionsForAsset(assetId),
    getPolicyViolationsForAsset(assetId),
    getGovernanceFindingsForAsset(assetId),
    getGovernanceOutcomeForAsset(assetId),
    getRecommendedActionsForAsset(assetId)
  );
}

export function getAllDecisionTraces(): DecisionTrace[] {
  return assetsCache.map(a => getDecisionTraceForAsset(a.id)).filter((t): t is DecisionTrace => t !== null);
}

export function getCorrectiveActions(): CorrectiveAction[] {
  return getItem<CorrectiveAction[]>(STORAGE_KEYS.CORRECTIVE_ACTIONS, INITIAL_CORRECTIVE_ACTIONS);
}

export function saveCorrectiveAction(data: Partial<CorrectiveAction>): CorrectiveAction {
  const list = getCorrectiveActions();
  const asset = getAssetById(data.assetId || '');
  const now = new Date().toISOString().split('T')[0];

  if (data.id) {
    const idx = list.findIndex(a => a.id === data.id);
    if (idx !== -1) {
      list[idx] = { ...list[idx], ...data };
      setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, list);
      return list[idx];
    }
  }

  const newAct: CorrectiveAction = {
    id: `act-${Date.now().toString().slice(-4)}`,
    assetId: data.assetId || '',
    assetName: asset?.name || 'AI Asset',
    title: data.title || 'Governance Remediation Task',
    status: data.status || 'Open',
    severity: data.severity || 'Medium',
    assignedTo: data.assignedTo || 'Sarah Jenkins',
    dueDate: data.dueDate || now,
    description: data.description || '',
  };

  const updated = [newAct, ...list];
  setItem(STORAGE_KEYS.CORRECTIVE_ACTIONS, updated);

  addAuditLog(
    'usr-2',
    newAct.assignedTo,
    'GOVERNANCE_ADMIN',
    'CORRECTIVE_ACTION_CREATED',
    'CorrectiveAction',
    newAct.id,
    newAct.assetName,
    `Assigned ${newAct.severity} Corrective Action: ${newAct.title} to ${newAct.assignedTo}`
  );

  return newAct;
}

export function generateGovernanceReviewPackage(assetId: string, authorName: string): GovernanceReviewPackage {
  const packages = getItem<GovernanceReviewPackage[]>(STORAGE_KEYS.HEALTH_PACKAGES, []);
  const asset = getAssetById(assetId) || getAssets()[0];
  const healthDetails = calculateAssetGovernanceHealthScore(asset.id);
  const incidents = getIncidents().filter(i => i.assetId === asset.id && i.status !== 'Closed');
  const actions = getCorrectiveActions().filter(a => a.assetId === asset.id && a.status !== 'Completed');
  const now = new Date().toISOString().split('T')[0];

  const pkg: GovernanceReviewPackage = {
    id: `h-pkg-${Date.now().toString().slice(-4)}`,
    assetId: asset.id,
    assetName: asset.name,
    generatedAt: now,
    generatedBy: authorName,
    healthScore: healthDetails.overallHealthScore,
    healthStatus: healthDetails.healthStatus,
    openIncidentsCount: incidents.length,
    openActionsCount: actions.length,
  };

  const updated = [pkg, ...packages];
  setItem(STORAGE_KEYS.HEALTH_PACKAGES, updated);

  addAuditLog(
    'usr-2',
    authorName,
    'GOVERNANCE_ADMIN',
    'HEALTH_PACKAGE_GENERATED',
    'GovernanceReviewPackage',
    pkg.id,
    pkg.assetName,
    `Generated Governance Health Review Package for ${pkg.assetName}. Score: ${pkg.healthScore}/100`
  );

  return pkg;
}

// --- METRICS WITH PHASE 7 EXTENSIONS ---
// --- RELEASE 4 — READINESS FOUNDATION SERVICE ---

export function getGovernanceReadiness(assetId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return null;
  return computeGovernanceReadiness(asset);
}

export function getEvidenceReadiness(assetId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return null;
  return computeEvidenceReadiness(asset, getEvidenceRecordsForAsset(assetId));
}

export function getReviewReadiness(assetId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return null;
  const reviews = getScheduledReviews().filter(r => r.assetId === assetId);
  const triggers = getReassessmentTriggers().filter(t => t.assetId === assetId);
  return computeReviewReadiness(asset, reviews, triggers);
}

export function getAuditReadiness(assetId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return null;
  return computeAuditReadiness(asset, getEvidenceRecordsForAsset(assetId));
}

export function getGovernanceGapsForAsset(assetId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return [];
  const evidence = getEvidenceRecordsForAsset(assetId);
  const reviews = getScheduledReviews().filter(r => r.assetId === assetId);
  const reauthorizations = getReauthorizationRecords().filter(r => r.assetId === assetId);
  return computeGovernanceGaps(asset, evidence, reviews, reauthorizations);
}

export function getAllGovernanceGaps() {
  return getAssets().flatMap(a => getGovernanceGapsForAsset(a.id));
}

/**
 * vNext — Prevention-First: per-asset lookup helpers for the Governance
 * Readiness Score. Deliberately NOT a full score wrapper here — computing
 * the "Controls Defined" pillar needs `getPoliciesForAsset` from
 * policyService.ts, which itself imports from this file; adding that import
 * here would create a circular dependency. Callers (GovernanceReadinessDashboardPage,
 * DecisionWorkbenchPageV4) import policyService directly and call
 * computeGovernanceReadinessScore themselves — see governanceReadinessScore.ts.
 */
export function getGovernanceReadinessInputs(assetId: string) {
  const asset = getAssetById(assetId);
  if (!asset) return null;
  return {
    asset,
    evidence: getEvidenceRecordsForAsset(assetId),
    reviews: getScheduledReviews().filter(r => r.assetId === assetId),
    triggers: getReassessmentTriggers().filter(t => t.assetId === assetId),
  };
}

export function getGovernanceMetrics(): GovernanceMetrics {
  const assets = getAssets();
  const validations = getValidations();
  const findings = getFindings();
  const evidence = getEvidence();
  const blockers = getGovernanceBlockers();
  const assessments = getComplianceAssessments();
  const gaps = getComplianceGaps();
  const killSwitches = getKillSwitches();
  const overrides = getOverrides();
  const incidents = getIncidents();
  const retirements = getRetirements();
  const alerts = getGovernanceAlerts();
  const reviews = getScheduledReviews();
  const actions = getCorrectiveActions();
  const triggers = getReassessmentTriggers();
  const evidenceRecords = getEvidenceRecords();

  let readyCount = 0;
  let condReadyCount = 0;
  let notReadyCount = 0;

  let compliantCount = 0;
  let partCompliantCount = 0;
  let nonCompliantCount = 0;
  let totalCompScore = 0;

  let activeOpCount = 0;
  let suspendedOpCount = 0;
  let retiredOpCount = 0;

  let healthyCount = 0;
  let watchlistCount = 0;
  let attentionCount = 0;
  let totalHealthScore = 0;

  assets.forEach(asset => {
    const score = calculateAssetGovernanceScore(asset.id);
    if (score.readinessTier === 'Ready') readyCount++;
    else if (score.readinessTier === 'Conditionally Ready') condReadyCount++;
    else notReadyCount++;

    const compDetails = calculateAssetComplianceScore(asset.id);
    totalCompScore += compDetails.score;
    if (compDetails.status === 'Compliant') compliantCount++;
    else if (compDetails.status === 'Partially Compliant') partCompliantCount++;
    else nonCompliantCount++;

    const opStatus = asset.operationalStatus || 'Active';
    if (opStatus === 'Active') activeOpCount++;
    else if (opStatus === 'Suspended') suspendedOpCount++;
    else if (opStatus === 'Retired') retiredOpCount++;

    const healthDetails = calculateAssetGovernanceHealthScore(asset.id);
    totalHealthScore += healthDetails.overallHealthScore;
    if (healthDetails.healthStatus === 'Healthy') healthyCount++;
    else if (healthDetails.healthStatus === 'Watchlist') watchlistCount++;
    else attentionCount++;
  });

  const tenantCompScore = assets.length > 0 ? Math.round(totalCompScore / assets.length) : 0;
  const tenantHealthScore = assets.length > 0 ? Math.round(totalHealthScore / assets.length) : 0;
  const rbiAlignment = Math.min(100, Math.round((assessments.filter(a => a.status === 'Compliant').length / Math.max(1, SEEDED_COMPLIANCE_CONTROLS.length * assets.length)) * 100) + 75);

  const metrics: GovernanceMetrics = {
    totalAssets: assets.length,
    assetsByType: {
      'Application': 0, 'Agent': 0, 'Model': 0, 'LLM': 0,
      'Copilot': 0, 'RAG System': 0, 'AI Workflow': 0,
      'Multi-Agent System': 0, 'Third-Party AI Service': 0,
    },
    riskBreakdown: { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
    statusBreakdown: { 'Draft': 0, 'Review': 0, 'Validation': 0, 'Approval': 0, 'Production': 0, 'Retirement': 0 },
    pendingReviewsCount: 0,
    pendingValidationCount: 0,
    decisionBreakdown: { 'GO': 0, 'CONDITIONAL GO': 0, 'NO GO': 0, 'PENDING': 0 },
    ownershipCompletionRate: 0,
    highRiskUnapprovedCount: 0,
    totalValidations: validations.length,
    passedValidations: validations.filter(v => v.status === 'Approved').length,
    failedValidations: validations.filter(v => v.status === 'Rejected').length,
    openFindingsCount: findings.filter(f => f.status === 'Open' || f.status === 'In Progress').length,
    totalEvidenceCount: evidence.length,
    readyAssetsCount: readyCount,
    conditionallyReadyAssetsCount: condReadyCount,
    notReadyAssetsCount: notReadyCount,
    totalBlockersCount: blockers.length,
    tenantComplianceScore: tenantCompScore,
    rbiAlignmentPercentage: rbiAlignment,
    compliantAssetsCount: compliantCount,
    partiallyCompliantAssetsCount: partCompliantCount,
    nonCompliantAssetsCount: nonCompliantCount,
    openComplianceGapsCount: gaps.length,
    activeOperationalAssetsCount: activeOpCount,
    suspendedAssetsCount: suspendedOpCount,
    killSwitchEventsCount: killSwitches.length,
    overridesExecutedCount: overrides.length,
    openIncidentsCount: incidents.filter(i => i.status === 'Open' || i.status === 'Investigating').length,
    criticalIncidentsCount: incidents.filter(i => i.severity === 'Critical' && i.status !== 'Closed').length,
    retiredAssetsCount: retirements.length,
    tenantGovernanceHealthScore: tenantHealthScore,
    healthyAssetsCount: healthyCount,
    watchlistAssetsCount: watchlistCount,
    attentionRequiredAssetsCount: attentionCount,
    activeGovernanceAlertsCount: alerts.length,
    upcomingReviewsCount: reviews.filter(r => r.status === 'Scheduled' || r.status === 'In Progress').length,
    openCorrectiveActionsCount: actions.filter(a => a.status !== 'Completed' && a.status !== 'Verified').length,
    oversightBreakdown: {
      'Human-in-Command': 0,
      'Human-in-the-Loop': 0,
      'Human-on-the-Loop': 0,
      'Autonomous with Controls': 0,
    },
    autonomyBreakdown: { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    authorityProfileCompletionRate: 0,
    governanceStateBreakdown: {
      'Draft': 0,
      'Submitted': 0,
      'Authorized': 0,
      'Monitoring': 0,
      'Reassessment Required': 0,
      'Conditional GO': 0,
      'No GO': 0,
      'Retired': 0,
    },
    governanceClassificationBreakdown: {
      'Internal Productivity': 0,
      'Customer Facing': 0,
      'Decision Support': 0,
      'Operational Automation': 0,
      'Agentic Workflow': 0,
      'Regulated AI': 0,
    },
    reassessmentsDueCount: triggers.filter(t => t.status === 'Open' || t.status === 'Under Review').length,
    reviewsDueCount: reviews.filter(r => r.status !== 'Completed').length,
    evidenceRecordsByType: {
      'Policy Document': 0,
      'Risk Assessment': 0,
      'Validation Report': 0,
      'Approval Record': 0,
      'Governance Review': 0,
      'Audit Finding': 0,
      'Incident Report': 0,
      'Control Assessment': 0,
      'Training Record': 0,
      'Third-Party Assessment': 0,
    },
    evidenceRecordsByStatus: { 'Draft': 0, 'Active': 0, 'Expired': 0, 'Archived': 0, 'Superseded': 0 },
    expiringEvidenceCount: evidenceRecords.filter(e => getExpiryIndicator(e.expiryDate) === 'Expiring Soon').length,
    expiredEvidenceCount: evidenceRecords.filter(e => getExpiryIndicator(e.expiryDate) === 'Expired').length,
    governanceReadinessBreakdown: { 'Ready': 0, 'Partially Ready': 0, 'Not Ready': 0 },
    evidenceReadinessBreakdown: { 'Ready': 0, 'Partially Ready': 0, 'Not Ready': 0 },
    reviewReadinessBreakdown: { 'Ready': 0, 'Partially Ready': 0, 'Not Ready': 0 },
    auditReadinessBreakdown: { 'Ready': 0, 'Partially Ready': 0, 'Not Ready': 0 },
    totalGovernanceGapsCount: 0,
    activeCompliancePacksCount: getCompliancePacks().filter(p => p.status === 'Active').length,
    packCoverageBreakdown: { 'Covered': 0, 'Partially Covered': 0, 'Not Covered': 0, 'Not Applicable': 0 },
    totalPackGapsCount: getAllPackGaps().length,
    activeRegulatorySourcesCount: getRegulatorySources().filter(s => s.status === 'Active').length,
    requirementsByCategory: {},
    sourceCoverageBreakdown: { 'Covered': 0, 'Partially Covered': 0, 'Not Covered': 0, 'Not Applicable': 0 },
    totalRegulatoryGapsCount: getAllSourceGaps().length,
    topMissingControls: [],
    openGovernanceFindingsCount: 0,
    findingsBySeverity: { 'Low': 0, 'Medium': 0, 'High': 0, 'Critical': 0 },
    topTriggeredPolicies: [],
    assetsRequiringAttentionCount: 0,
    recommendedReviewsCount: 0,
    openActionsCount: 0,
    highPriorityActionsCount: 0,
    overdueActionsCount: 0,
    actionsByStatus: { 'Open': 0, 'Accepted': 0, 'Deferred': 0, 'Rejected': 0, 'In Progress': 0, 'Completed': 0 },
    actionsByOwner: [],
    traceRecordsCount: 0,
    topDecisionDrivers: [],
    humanDecisionStats: { accepted: 0, rejected: 0, deferred: 0 },
  };

  getCompliancePacks().forEach(pack => {
    const coverage = getPackCoverage(pack.id);
    if (coverage) metrics.packCoverageBreakdown[coverage.status]++;
  });

  getRegulatorySources().forEach(source => {
    const coverage = getSourceCoverage(source.id);
    if (coverage) metrics.sourceCoverageBreakdown[coverage.status]++;
  });

  getRegulatoryRequirements().forEach(req => {
    metrics.requirementsByCategory[req.category] = (metrics.requirementsByCategory[req.category] || 0) + 1;
  });

  metrics.topMissingControls = getAllSourceGaps()
    .filter(g => g.gapType === 'Missing Control')
    .slice(0, 5)
    .map(g => {
      const obligation = g.obligationId ? getObligations().find(o => o.id === g.obligationId) : undefined;
      const requirement = getRegulatoryRequirements().find(r => r.id === g.requirementId);
      return { name: obligation?.name || requirement?.name || 'Unnamed Requirement', requirementName: requirement?.name || '' };
    });

  const openFindings = getGovernanceFindings().filter(f => f.status === 'Open' || f.status === 'Under Review');
  metrics.openGovernanceFindingsCount = openFindings.length;
  openFindings.forEach(f => { metrics.findingsBySeverity[f.severity]++; });

  const violationCountsByPolicy = new Map<string, { policyName: string; count: number }>();
  getAllPolicyViolations().forEach(v => {
    const entry = violationCountsByPolicy.get(v.policyId) || { policyName: v.policyName, count: 0 };
    entry.count++;
    violationCountsByPolicy.set(v.policyId, entry);
  });
  metrics.topTriggeredPolicies = Array.from(violationCountsByPolicy.values()).sort((a, b) => b.count - a.count).slice(0, 5);

  const outcomes = getAllGovernanceOutcomes();
  metrics.assetsRequiringAttentionCount = outcomes.filter(o => o.status !== 'Compliant').length;
  metrics.recommendedReviewsCount = outcomes.filter(o => o.status === 'Review Required').length;

  const allActions = getRecommendedActions();
  const nonTerminalActions = allActions.filter(a => a.status !== 'Rejected' && a.status !== 'Completed');
  metrics.openActionsCount = allActions.filter(a => a.status === 'Open').length;
  metrics.highPriorityActionsCount = nonTerminalActions.filter(a => a.priority === 'High' || a.priority === 'Critical').length;
  const today = new Date();
  metrics.overdueActionsCount = nonTerminalActions.filter(a => a.dueDate && new Date(a.dueDate) < today).length;
  allActions.forEach(a => { metrics.actionsByStatus[a.status]++; });
  const actionCountsByOwner = new Map<string, number>();
  nonTerminalActions.filter(a => a.owner).forEach(a => { actionCountsByOwner.set(a.owner!, (actionCountsByOwner.get(a.owner!) || 0) + 1); });
  metrics.actionsByOwner = Array.from(actionCountsByOwner.entries()).map(([owner, count]) => ({ owner, count })).sort((a, b) => b.count - a.count);

  const allTraces = getAllDecisionTraces();
  metrics.traceRecordsCount = allTraces.filter(t => t.findingsGenerated.length > 0 || t.actionsRecommended.length > 0).length;
  const driverCounts = new Map<string, number>();
  allTraces.forEach(t => t.conditionsTriggered.forEach(c => { driverCounts.set(c.conditionType, (driverCounts.get(c.conditionType) || 0) + 1); }));
  metrics.topDecisionDrivers = Array.from(driverCounts.entries())
    .map(([conditionType, count]) => ({ conditionType: conditionType as GovernanceCondition['conditionType'], count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  allActions.filter(a => a.decidedBy).forEach(a => {
    if (a.status === 'Accepted') metrics.humanDecisionStats.accepted++;
    else if (a.status === 'Rejected') metrics.humanDecisionStats.rejected++;
    else if (a.status === 'Deferred') metrics.humanDecisionStats.deferred++;
  });

  let totalGaps = 0;
  assets.forEach(asset => {
    const assetEvidence = evidenceRecords.filter(e => e.assetId === asset.id);
    const assetReviews = reviews.filter(r => r.assetId === asset.id);
    const assetTriggers = triggers.filter(t => t.assetId === asset.id);
    const assetReauthorizations = getReauthorizationRecords().filter(r => r.assetId === asset.id);

    metrics.governanceReadinessBreakdown[computeGovernanceReadiness(asset).status]++;
    metrics.evidenceReadinessBreakdown[computeEvidenceReadiness(asset, assetEvidence).status]++;
    metrics.reviewReadinessBreakdown[computeReviewReadiness(asset, assetReviews, assetTriggers).status]++;
    metrics.auditReadinessBreakdown[computeAuditReadiness(asset, assetEvidence).status]++;
    totalGaps += computeGovernanceGaps(asset, assetEvidence, assetReviews, assetReauthorizations).length;
  });
  metrics.totalGovernanceGapsCount = totalGaps;

  evidenceRecords.forEach(e => {
    if (metrics.evidenceRecordsByType[e.evidenceType] !== undefined) metrics.evidenceRecordsByType[e.evidenceType]++;
    if (metrics.evidenceRecordsByStatus[e.status] !== undefined) metrics.evidenceRecordsByStatus[e.status]++;
  });

  let completeOwnershipCount = 0;
  let completeAuthorityCount = 0;

  assets.forEach(asset => {
    if (metrics.assetsByType[asset.type] !== undefined) metrics.assetsByType[asset.type]++;
    if (metrics.riskBreakdown[asset.riskLevel] !== undefined) metrics.riskBreakdown[asset.riskLevel]++;
    if (metrics.statusBreakdown[asset.status] !== undefined) metrics.statusBreakdown[asset.status]++;

    const outcome = asset.decisionOutcome || 'PENDING';
    if (metrics.decisionBreakdown[outcome] !== undefined) metrics.decisionBreakdown[outcome]++;

    if (asset.status === 'Review') metrics.pendingReviewsCount++;
    if (asset.status === 'Validation') metrics.pendingValidationCount++;

    const o = asset.ownership || {};
    if (o.businessOwner && o.technicalOwner && o.riskOwner && o.complianceOwner && o.approver) {
      completeOwnershipCount++;
    }

    if ((asset.riskLevel === 'High' || asset.riskLevel === 'Critical') && outcome !== 'GO') {
      metrics.highRiskUnapprovedCount++;
    }

    if (asset.oversightType && metrics.oversightBreakdown[asset.oversightType] !== undefined) {
      metrics.oversightBreakdown[asset.oversightType]++;
    }
    if (asset.autonomyLevel !== undefined && metrics.autonomyBreakdown[asset.autonomyLevel] !== undefined) {
      metrics.autonomyBreakdown[asset.autonomyLevel]++;
    }
    if (authorityProfileCompleteness(asset.authorityProfile) === 4) {
      completeAuthorityCount++;
    }
    if (asset.governanceState && metrics.governanceStateBreakdown[asset.governanceState] !== undefined) {
      metrics.governanceStateBreakdown[asset.governanceState]++;
    }
    if (asset.governanceClassification && metrics.governanceClassificationBreakdown[asset.governanceClassification] !== undefined) {
      metrics.governanceClassificationBreakdown[asset.governanceClassification]++;
    }
  });

  metrics.ownershipCompletionRate = assets.length > 0 ? Math.round((completeOwnershipCount / assets.length) * 100) : 0;
  metrics.authorityProfileCompletionRate = assets.length > 0 ? Math.round((completeAuthorityCount / assets.length) * 100) : 0;
  return metrics;
}

// --- RELEASE 4.1 — PERSISTENCE COMPLETION: BOOTSTRAP FROM NEON ---

let bootstrapPromise: Promise<void> | null = null;

/**
 * Replaces the read caches above with live Neon data. Runs once at module
 * load (see the call at the bottom of this file) so pages that read
 * getAssets()/getEvidenceRecords()/etc. synchronously see real System-of-
 * Record data as soon as it arrives, without every page having to become
 * async. If Neon is unreachable, the caches keep whatever they were
 * seeded with (localStorage, then INITIAL_ASSETS/etc.) — a fallback for
 * "UI cache, temporary state, future offline support" only, per Release 4.1's
 * clarification, never treated as the primary source once Neon answers.
 */
export function bootstrapPersistence(options?: { force?: boolean }): Promise<void> {
  if (bootstrapPromise && !options?.force) return bootstrapPromise;

  bootstrapPromise = (async () => {
    try {
      const [
        assets,
        evidence,
        governance,
        compliancePacks,
        requirements,
        packControls,
        evidenceMappings,
        regulatorySources,
        regulatoryRequirements,
        obligations,
        obligationControls,
        obligationEvidenceMappings,
        governancePolicies,
        governanceFindings,
        recommendedActions,
        conditionDefinitions,
        outcomeRules,
        actionRules,
        governanceProfiles,
      ] = await Promise.all([
        apiAssetRepository.getAssets(true), // Q1 Stabilization — include archived so the local cache is complete; getAssets()/getArchivedAssets() split the view.
        apiEvidenceRepository.getEvidence(),
        apiGovernanceRepository.getGovernanceData(),
        apiCompliancePackRepository.getCompliancePacks(),
        apiRequirementRepository.getRequirements(),
        apiControlRepository.getControls(),
        apiEvidenceMappingRepository.getMappings(),
        apiRegulatorySourceRepository.getSources(),
        apiRegulatoryRequirementRepository.getRequirements(),
        apiObligationRepository.getObligations(),
        apiObligationControlRepository.getControls(),
        apiObligationEvidenceMappingRepository.getMappings(),
        apiGovernancePolicyRepository.getPolicies(),
        apiGovernanceFindingRepository.getFindings(),
        apiRecommendedActionRepository.getActions(),
        apiConditionDefinitionRepository.getDefinitions(),
        apiOutcomeRuleRepository.getRules(),
        apiActionRuleRepository.getRules(),
        apiGovernanceProfileRepository.getProfiles(),
      ]);

      const assetNameById = new Map(assets.map(a => [a.id, a.name]));

      assetsCache = assets.map(normalizeAsset);
      persistAssetsCache();

      evidenceCache = evidence.map(e => ({ ...e, assetName: assetNameById.get(e.assetId) || e.assetName }));
      persistEvidenceCache();

      triggersCache = governance.triggers.map(t => ({ ...t, assetName: assetNameById.get(t.assetId) || t.assetName }));
      persistTriggersCache();

      reauthorizationsCache = governance.reauthorizations.map(r => ({ ...r, assetName: assetNameById.get(r.assetId) || r.assetName }));
      persistReauthorizationsCache();

      reviewsCache = governance.reviews.map(r => ({ ...r, assetName: assetNameById.get(r.assetId) || r.assetName }));
      persistReviewsCache();

      const packNameById = new Map(compliancePacks.map(p => [p.id, p.name]));
      requirementsCache = requirements.map(r => ({ ...r, packName: packNameById.get(r.packId) || r.packName }));
      const requirementNameById = new Map(requirementsCache.map(r => [r.id, r.name]));
      const evidenceNameById = new Map(evidence.map(e => [e.id, e.name]));

      compliancePacksCache = compliancePacks;
      persistCompliancePacksCache();
      persistRequirementsCache();
      packControlsCache = packControls.map(c => ({ ...c, requirementName: requirementNameById.get(c.requirementId) || c.requirementName }));
      persistPackControlsCache();
      const controlNameById = new Map(packControlsCache.map(c => [c.id, c.name]));
      evidenceMappingsCache = evidenceMappings.map(m => ({
        ...m,
        controlName: controlNameById.get(m.controlId) || m.controlName,
        evidenceName: evidenceNameById.get(m.evidenceId) || m.evidenceName,
      }));
      persistEvidenceMappingsCache();

      const sourceNameById = new Map(regulatorySources.map(s => [s.id, s.name]));
      regulatoryRequirementsCache = regulatoryRequirements.map(r => ({ ...r, sourceName: sourceNameById.get(r.sourceId) || r.sourceName }));
      const regReqNameById = new Map(regulatoryRequirementsCache.map(r => [r.id, r.name]));

      regulatorySourcesCache = regulatorySources;
      persistRegulatorySourcesCache();
      persistRegulatoryRequirementsCache();
      obligationsCache = obligations.map(o => ({ ...o, requirementName: regReqNameById.get(o.requirementId) || o.requirementName }));
      persistObligationsCache();
      const obligationNameById = new Map(obligationsCache.map(o => [o.id, o.name]));
      obligationControlsCache = obligationControls.map(c => ({ ...c, obligationName: obligationNameById.get(c.obligationId) || c.obligationName }));
      persistObligationControlsCache();
      const obligationControlNameById = new Map(obligationControlsCache.map(c => [c.id, c.name]));
      obligationEvidenceMappingsCache = obligationEvidenceMappings.map(m => ({
        ...m,
        controlName: obligationControlNameById.get(m.controlId) || m.controlName,
        evidenceName: evidenceNameById.get(m.evidenceId) || m.evidenceName,
      }));
      persistObligationEvidenceMappingsCache();

      governancePoliciesCache = governancePolicies.map(p => ({ ...p, obligationName: p.obligationId ? (obligationNameById.get(p.obligationId) || p.obligationName) : undefined }));
      persistGovernancePoliciesCache();
      const policyNameById = new Map(governancePoliciesCache.map(p => [p.id, p.name]));
      governanceFindingsCache = governanceFindings.map(f => ({
        ...f,
        assetName: assetNameById.get(f.assetId) || f.assetName,
        policyName: policyNameById.get(f.policyId) || f.policyName,
      }));
      persistGovernanceFindingsCache();

      recommendedActionsCache = recommendedActions.map(a => ({
        ...a,
        assetName: assetNameById.get(a.assetId) || a.assetName,
        policyName: a.policyId ? (policyNameById.get(a.policyId) || a.policyName) : undefined,
      }));
      persistRecommendedActionsCache();

      conditionDefinitionsCache = conditionDefinitions;
      persistConditionDefinitionsCache();
      outcomeRulesCache = outcomeRules;
      persistOutcomeRulesCache();
      actionRulesCache = actionRules;
      persistActionRulesCache();
      governanceProfilesCache = governanceProfiles;
      persistGovernanceProfilesCache();

      console.info(`OMG persistence: loaded ${assets.length} assets, ${evidence.length} evidence records, ${compliancePacks.length} compliance packs, ${regulatorySources.length} regulatory sources, ${governancePolicies.length} governance policies, ${recommendedActions.length} recommended actions, ${conditionDefinitions.length} condition definitions, ${outcomeRules.length} outcome rules, ${actionRules.length} action rules, ${governanceProfiles.length} governance profiles from Neon.`);
    } catch (err) {
      console.warn('OMG persistence: could not reach the governance API at startup; continuing with cached/local data until the next retry.', err);
      bootstrapPromise = null; // allow a later manual retry (e.g. from Tenant Settings)
    }
  })();

  return bootstrapPromise;
}

// Fire immediately on module load — non-blocking, so the app never hangs
// waiting on a cold-started backend, but real data lands as soon as it can.
bootstrapPersistence();
