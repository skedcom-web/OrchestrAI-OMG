/**
 * OMG Phase 9 — Policy Governance Engine.
 *
 * Workstreams 3, 4 and 5: the Policy Registry, Policy Mapping and Policy
 * Violation Management.
 *
 * Violations come from two sources:
 *   1. Logged violations — recorded by governance staff, fully editable.
 *   2. Detected violations — evaluated continuously against live governance
 *      state via a policy's enforcement rule. These cannot be edited away;
 *      they clear only when the underlying governance state is corrected.
 */

import {
  addAuditLog,
  getAssets,
  getEvidence,
  getKillSwitches,
  getOverrides,
  getScheduledReviews,
  getValidations,
} from './storageService';
import {
  INITIAL_POLICIES,
  INITIAL_POLICY_MAPPINGS,
  INITIAL_POLICY_VIOLATIONS,
} from './policySeedData';
import type {
  AIAsset,
  Policy,
  PolicyMapping,
  PolicyViolation,
  PolicyViolationSeverity,
  PolicyViolationStatus,
} from '../types';

const KEYS = {
  POLICIES: 'omg_policies_v9',
  MAPPINGS: 'omg_policy_mappings_v9',
  VIOLATIONS: 'omg_policy_violations_v9',
};

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return fallback;
  }
}

function write<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error writing ${key} to localStorage:`, error);
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

/* ========================== WS3 — Policy Registry ========================= */

export function getPolicies(): Policy[] {
  return read<Policy[]>(KEYS.POLICIES, INITIAL_POLICIES);
}

export function getPolicyById(id: string): Policy | undefined {
  return getPolicies().find(p => p.id === id);
}

export function savePolicy(data: Partial<Policy>, actorName = 'Governance Admin'): Policy {
  const policies = getPolicies();
  const existingIndex = data.id ? policies.findIndex(p => p.id === data.id) : -1;

  if (existingIndex >= 0) {
    const updated: Policy = { ...policies[existingIndex], ...data } as Policy;
    policies[existingIndex] = updated;
    write(KEYS.POLICIES, policies);

    addAuditLog(
      'usr-2',
      actorName,
      'GOVERNANCE_ADMIN',
      'POLICY_UPDATED',
      'Policy',
      updated.id,
      updated.name,
      `Updated policy ${updated.policyRef} (${updated.category}). Status: ${updated.status}.`
    );

    // Keep denormalised policy names on mappings and violations in step.
    syncPolicyName(updated);
    return updated;
  }

  const created: Policy = {
    id: `pol-${Date.now()}`,
    policyRef: data.policyRef || `POL-NEW-${policies.length + 1}`,
    name: data.name || 'Untitled Policy',
    category: data.category || 'Governance Policies',
    owner: data.owner || actorName,
    ownerRole: data.ownerRole || 'Governance Admin',
    effectiveDate: data.effectiveDate || today(),
    reviewDate: data.reviewDate || today(),
    status: data.status || 'Draft',
    description: data.description || '',
    mandatory: data.mandatory ?? false,
    enforcementRule: data.enforcementRule,
  };

  write(KEYS.POLICIES, [created, ...policies]);

  addAuditLog(
    'usr-2',
    actorName,
    'GOVERNANCE_ADMIN',
    'POLICY_CREATED',
    'Policy',
    created.id,
    created.name,
    `Registered policy ${created.policyRef} in the ${created.category} category.`
  );

  return created;
}

export function retirePolicy(id: string, actorName = 'Governance Admin'): void {
  const policy = getPolicyById(id);
  if (!policy) return;
  savePolicy({ ...policy, status: 'Retired' }, actorName);
}

function syncPolicyName(policy: Policy): void {
  const mappings = getPolicyMappings().map(m =>
    m.policyId === policy.id ? { ...m, policyName: policy.name } : m
  );
  write(KEYS.MAPPINGS, mappings);

  const violations = read<PolicyViolation[]>(KEYS.VIOLATIONS, INITIAL_POLICY_VIOLATIONS).map(v =>
    v.policyId === policy.id ? { ...v, policyName: policy.name } : v
  );
  write(KEYS.VIOLATIONS, violations);
}

/* ========================== WS4 — Policy Mapping ========================= */

export function getPolicyMappings(): PolicyMapping[] {
  return read<PolicyMapping[]>(KEYS.MAPPINGS, INITIAL_POLICY_MAPPINGS);
}

export function getMappingsForPolicy(policyId: string): PolicyMapping[] {
  return getPolicyMappings().filter(m => m.policyId === policyId);
}

/** Every policy that binds a given asset, directly or via type / business unit. */
export function getPoliciesForAsset(asset: AIAsset): Policy[] {
  const mappings = getPolicyMappings();
  const policies = getPolicies();

  const boundIds = new Set(
    mappings
      .filter(m => {
        if (m.targetType === 'AI Asset') return m.targetId === asset.id;
        if (m.targetType === 'Asset Type') return m.targetId === asset.type;
        if (m.targetType === 'Business Unit') return m.targetId === asset.department;
        return false;
      })
      .map(m => m.policyId)
  );

  return policies.filter(p => boundIds.has(p.id));
}

export function savePolicyMapping(
  data: Partial<PolicyMapping>,
  actorName = 'Governance Admin'
): PolicyMapping {
  const mappings = getPolicyMappings();
  const policy = getPolicyById(data.policyId || '');

  const created: PolicyMapping = {
    id: data.id || `pmap-${Date.now()}`,
    policyId: data.policyId || '',
    policyName: policy?.name || data.policyName || 'Unknown Policy',
    targetType: data.targetType || 'AI Asset',
    targetId: data.targetId || '',
    targetName: data.targetName || data.targetId || '',
    mappedBy: data.mappedBy || actorName,
    mappedDate: data.mappedDate || today(),
    notes: data.notes,
  };

  const existingIndex = mappings.findIndex(m => m.id === created.id);
  if (existingIndex >= 0) mappings[existingIndex] = created;
  else mappings.unshift(created);

  write(KEYS.MAPPINGS, mappings);

  addAuditLog(
    'usr-2',
    actorName,
    'GOVERNANCE_ADMIN',
    'POLICY_MAPPED',
    'PolicyMapping',
    created.id,
    created.policyName,
    `Mapped policy "${created.policyName}" to ${created.targetType}: ${created.targetName}.`
  );

  return created;
}

export function deletePolicyMapping(id: string, actorName = 'Governance Admin'): void {
  const mappings = getPolicyMappings();
  const target = mappings.find(m => m.id === id);
  if (!target) return;

  write(
    KEYS.MAPPINGS,
    mappings.filter(m => m.id !== id)
  );

  addAuditLog(
    'usr-2',
    actorName,
    'GOVERNANCE_ADMIN',
    'POLICY_MAPPING_REMOVED',
    'PolicyMapping',
    target.id,
    target.policyName,
    `Removed mapping of "${target.policyName}" from ${target.targetType}: ${target.targetName}.`
  );
}

/* ==================== WS5 — Policy Violation Management ================== */

function getLoggedViolations(): PolicyViolation[] {
  return read<PolicyViolation[]>(KEYS.VIOLATIONS, INITIAL_POLICY_VIOLATIONS);
}

/**
 * Evaluates every mandatory policy that carries an enforcement rule against the
 * live governance state of each asset it binds.
 */
export function detectPolicyViolations(): PolicyViolation[] {
  const assets = getAssets();
  const policies = getPolicies().filter(p => p.status === 'Active' && p.enforcementRule);
  const validations = getValidations();
  const evidence = getEvidence();
  const reviews = getScheduledReviews();
  const killSwitches = getKillSwitches();
  const overrides = getOverrides();

  const detected: PolicyViolation[] = [];

  const ownerOf = (asset: AIAsset) =>
    asset.ownership?.riskOwner || asset.ownership?.businessOwner || 'Unassigned';

  assets.forEach(asset => {
    const bound = getPoliciesForAsset(asset);
    const isHighRisk = asset.riskLevel === 'High' || asset.riskLevel === 'Critical';

    policies.forEach(policy => {
      // A policy applies if it is mapped to the asset, or is an enterprise-wide
      // mandatory governance policy with no explicit mapping at all.
      const explicitlyMapped = bound.some(p => p.id === policy.id);
      const hasAnyMapping = getMappingsForPolicy(policy.id).length > 0;
      if (!explicitlyMapped && hasAnyMapping) return;
      if (!explicitlyMapped && !policy.mandatory) return;

      const push = (
        violationType: string,
        severity: PolicyViolationSeverity,
        description: string
      ) => {
        detected.push({
          id: `pv-auto-${policy.id}-${asset.id}`,
          policyId: policy.id,
          policyName: policy.name,
          violationType,
          assetId: asset.id,
          assetName: asset.name,
          severity,
          owner: ownerOf(asset),
          detectionDate: today(),
          status: 'Open',
          description,
          autoDetected: true,
        });
      };

      switch (policy.enforcementRule) {
        case 'REQUIRE_FULL_OWNERSHIP': {
          const o = asset.ownership || {};
          const missing = (
            [
              ['Business Owner', o.businessOwner],
              ['Technical Owner', o.technicalOwner],
              ['Risk Owner', o.riskOwner],
              ['Compliance Owner', o.complianceOwner],
              ['Approver', o.approver],
            ] as [string, string | undefined][]
          )
            .filter(([, value]) => !value)
            .map(([label]) => label);

          if (missing.length > 0) {
            push(
              'Incomplete Accountability Matrix',
              missing.length >= 3 ? 'High' : 'Medium',
              `Missing named ${missing.join(', ')}. The asset cannot demonstrate accountable ownership.`
            );
          }
          break;
        }

        case 'REQUIRE_DECISION_BEFORE_PRODUCTION': {
          const outcome = asset.decisionOutcome || 'PENDING';
          if (asset.status === 'Production' && (outcome === 'PENDING' || outcome === 'NO GO')) {
            push(
              'Production Without Decision Authority',
              'Critical',
              `Asset is in production with a ${outcome} decision state. No authorised GO decision is on record.`
            );
          }
          break;
        }

        case 'REQUIRE_VALIDATION_FOR_HIGH_RISK': {
          if (!isHighRisk) break;
          const approved = validations.some(
            v => v.assetId === asset.id && v.status === 'Approved'
          );
          if (!approved) {
            push(
              'High Risk AI Without Approved Validation',
              'High',
              `${asset.riskLevel} risk asset has no approved independent validation review on record.`
            );
          }
          break;
        }

        case 'REQUIRE_EVIDENCE_FOR_PRODUCTION': {
          if (asset.status !== 'Production') break;
          const filed = evidence.filter(
            e => e.assetId === asset.id && e.status !== 'Rejected'
          ).length;
          if (filed < 3) {
            push(
              'Incomplete Governance Evidence Pack',
              filed === 0 ? 'High' : 'Medium',
              `Production asset holds ${filed} of the 3 minimum governance deliverables required for examination readiness.`
            );
          }
          break;
        }

        case 'REQUIRE_HUMAN_OVERSIGHT_HIGH_RISK': {
          if (!isHighRisk) break;
          const hasKillSwitch = killSwitches.some(k => k.assetId === asset.id);
          const hasOverride = overrides.some(o => o.assetId === asset.id);
          if (!hasKillSwitch && !hasOverride) {
            push(
              'No Human Oversight Control Evidenced',
              'Critical',
              `${asset.riskLevel} risk asset has neither a kill switch protocol nor a recorded human override capability.`
            );
          }
          break;
        }

        case 'REQUIRE_PERIODIC_REVIEW': {
          const overdue = reviews.some(r => r.assetId === asset.id && r.status === 'Overdue');
          const scheduled = reviews.some(r => r.assetId === asset.id);
          if (overdue) {
            push(
              'Governance Review Overdue',
              isHighRisk ? 'High' : 'Medium',
              'A scheduled governance review for this asset has passed its due date without completion.'
            );
          } else if (!scheduled && isHighRisk) {
            push(
              'No Review Cadence Established',
              'Medium',
              `${asset.riskLevel} risk asset has no scheduled governance review, breaching the quarterly cadence requirement.`
            );
          }
          break;
        }

        case 'REQUIRE_VENDOR_REVIEW': {
          if (asset.type !== 'Third-Party AI Service') break;
          const hasVendorEvidence = evidence.some(
            e => e.assetId === asset.id && /vendor|third.party|supplier/i.test(e.title)
          );
          if (!hasVendorEvidence) {
            push(
              'Vendor Assurance Evidence Absent',
              'High',
              'Third-party AI service has no vendor security or data residency assurance evidence on file.'
            );
          }
          break;
        }

        default:
          break;
      }
    });
  });

  return detected;
}

/**
 * The full violation register: logged violations plus live detections.
 * A logged violation for the same policy and asset suppresses the detection,
 * so remediation work recorded by a human is never duplicated by the engine.
 */
export function getPolicyViolations(): PolicyViolation[] {
  const logged = getLoggedViolations();
  const loggedKeys = new Set(logged.map(v => `${v.policyId}::${v.assetId}`));

  const detected = detectPolicyViolations().filter(
    v => !loggedKeys.has(`${v.policyId}::${v.assetId}`)
  );

  const severityRank: Record<PolicyViolationSeverity, number> = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };
  const openFirst = (v: PolicyViolation) =>
    v.status === 'Open' ? 0 : v.status === 'Under Review' ? 1 : 2;

  return [...logged, ...detected].sort(
    (a, b) =>
      openFirst(a) - openFirst(b) || severityRank[b.severity] - severityRank[a.severity]
  );
}

export function getOpenPolicyViolations(): PolicyViolation[] {
  return getPolicyViolations().filter(
    v => v.status === 'Open' || v.status === 'Under Review'
  );
}

export function savePolicyViolation(
  data: Partial<PolicyViolation>,
  actorName = 'Governance Admin'
): PolicyViolation {
  const violations = getLoggedViolations();
  const policy = getPolicyById(data.policyId || '');
  const asset = getAssets().find(a => a.id === data.assetId);

  const record: PolicyViolation = {
    id: data.id && !data.id.startsWith('pv-auto-') ? data.id : `pv-${Date.now()}`,
    policyId: data.policyId || '',
    policyName: policy?.name || data.policyName || 'Unknown Policy',
    violationType: data.violationType || 'Policy Breach',
    assetId: data.assetId || '',
    assetName: asset?.name || data.assetName || 'Unknown Asset',
    severity: data.severity || 'Medium',
    owner: data.owner || actorName,
    detectionDate: data.detectionDate || today(),
    status: data.status || 'Open',
    description: data.description || '',
    remediationNotes: data.remediationNotes,
  };

  const existingIndex = violations.findIndex(v => v.id === record.id);
  const isNew = existingIndex < 0;
  if (isNew) violations.unshift(record);
  else violations[existingIndex] = record;

  write(KEYS.VIOLATIONS, violations);

  addAuditLog(
    'usr-2',
    actorName,
    'GOVERNANCE_ADMIN',
    isNew ? 'POLICY_VIOLATION_LOGGED' : 'POLICY_VIOLATION_UPDATED',
    'PolicyViolation',
    record.id,
    record.assetName,
    `${isNew ? 'Logged' : 'Updated'} ${record.severity} violation of "${record.policyName}" on ${record.assetName}. Status: ${record.status}.`
  );

  return record;
}

/** Transitions a violation through its lifecycle, promoting detections on write. */
export function setViolationStatus(
  violation: PolicyViolation,
  status: PolicyViolationStatus,
  notes: string,
  actorName = 'Governance Admin'
): PolicyViolation {
  return savePolicyViolation(
    {
      ...violation,
      // A detected violation becomes a tracked record once a human acts on it.
      id: violation.autoDetected ? undefined : violation.id,
      status,
      remediationNotes: notes || violation.remediationNotes,
    },
    actorName
  );
}

/* ====================== Policy compliance analytics ====================== */

export interface PolicyComplianceSummary {
  totalPolicies: number;
  activePolicies: number;
  draftPolicies: number;
  underReviewPolicies: number;
  retiredPolicies: number;
  mandatoryPolicies: number;
  totalMappings: number;
  openViolations: number;
  criticalViolations: number;
  remediatedViolations: number;
  /** Share of active policies with no open violation, 0-100. */
  complianceRate: number;
  /** Active policies that are past their review date. */
  policiesDueForReview: number;
}

export function getPolicyComplianceSummary(): PolicyComplianceSummary {
  const policies = getPolicies();
  const violations = getPolicyViolations();
  const active = policies.filter(p => p.status === 'Active');
  const open = violations.filter(v => v.status === 'Open' || v.status === 'Under Review');

  const breachedPolicyIds = new Set(open.map(v => v.policyId));
  const compliantActive = active.filter(p => !breachedPolicyIds.has(p.id)).length;

  const now = today();

  return {
    totalPolicies: policies.length,
    activePolicies: active.length,
    draftPolicies: policies.filter(p => p.status === 'Draft').length,
    underReviewPolicies: policies.filter(p => p.status === 'Under Review').length,
    retiredPolicies: policies.filter(p => p.status === 'Retired').length,
    mandatoryPolicies: policies.filter(p => p.mandatory).length,
    totalMappings: getPolicyMappings().length,
    openViolations: open.length,
    criticalViolations: open.filter(v => v.severity === 'Critical').length,
    remediatedViolations: violations.filter(
      v => v.status === 'Remediated' || v.status === 'Closed'
    ).length,
    complianceRate: active.length > 0 ? Math.round((compliantActive / active.length) * 100) : 100,
    policiesDueForReview: active.filter(p => p.reviewDate < now).length,
  };
}
