/**
 * OMG Release 2 — Governance Continuity Foundation.
 *
 * Reference data for Governance Classification (Release 1 carry-forward),
 * the Governance State Model, and the Reassessment Trigger Framework.
 * Descriptive only — no scoring, no workflow automation in Release 2.
 */

import type {
  GovernanceClassification,
  GovernanceState,
  ReassessmentTriggerType,
  ReauthorizationStatus,
} from '../types';

/* ============ Release 1 carry-forward — Governance Classification ======= */

export interface GovernanceClassificationDefinition {
  value: GovernanceClassification;
  icon: string;
  description: string;
}

export const GOVERNANCE_CLASSIFICATIONS: GovernanceClassificationDefinition[] = [
  { value: 'Internal Productivity', icon: '🧑‍💻', description: 'Improves internal team efficiency; no external customer exposure.' },
  { value: 'Customer Facing', icon: '🗣️', description: 'Interacts directly with customers or is visible to them.' },
  { value: 'Decision Support', icon: '🧭', description: 'Informs a human decision without acting on its own.' },
  { value: 'Operational Automation', icon: '⚙️', description: 'Automates an operational process end to end.' },
  { value: 'Agentic Workflow', icon: '🤖', description: 'Plans and executes multi-step actions with some independence.' },
  { value: 'Regulated AI', icon: '🏛️', description: 'Operates in a domain subject to specific regulatory obligations.' },
];

export function getClassificationDefinition(value: GovernanceClassification): GovernanceClassificationDefinition {
  return GOVERNANCE_CLASSIFICATIONS.find(c => c.value === value) || GOVERNANCE_CLASSIFICATIONS[0];
}

/* =================== Capability 1 — Governance State Model ============== */

export interface GovernanceStateDefinition {
  state: GovernanceState;
  icon: string;
  tone: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  description: string;
}

/** Ordered to match the Capability 2 continuity lifecycle. */
export const GOVERNANCE_STATES: GovernanceStateDefinition[] = [
  { state: 'Draft', icon: '📝', tone: 'neutral', description: 'Registered but not yet submitted for authorization.' },
  { state: 'Submitted', icon: '📤', tone: 'info', description: 'Submitted and awaiting a governance decision.' },
  { state: 'Authorized', icon: '✅', tone: 'success', description: 'Authorized to operate — the asset holds a valid GO decision.' },
  { state: 'Monitoring', icon: '📡', tone: 'success', description: 'Authorized and operating; governance continuity is being watched.' },
  { state: 'Reassessment Required', icon: '🔁', tone: 'warning', description: 'A meaningful change was detected — authorization must be re-earned.' },
  { state: 'Conditional GO', icon: '🟡', tone: 'warning', description: 'Reauthorized with conditions attached.' },
  { state: 'No GO', icon: '⛔', tone: 'danger', description: 'Not authorized to operate.' },
  { state: 'Retired', icon: '📦', tone: 'neutral', description: 'Decommissioned; no longer in active governance.' },
];

export function getGovernanceStateDefinition(state: GovernanceState): GovernanceStateDefinition {
  return GOVERNANCE_STATES.find(s => s.state === state) || GOVERNANCE_STATES[0];
}

/**
 * A conservative starting state for a newly registered asset — Release 2
 * introduces no automation, so this is a default, not an enforced rule.
 */
export function defaultGovernanceState(): GovernanceState {
  return 'Draft';
}

/* ============= Capability 3 — Reassessment Trigger Framework ============ */

/**
 * R20.1 — Governance Continuity hardening. Reauthorization currency, derived
 * from nextReviewDate — same "computed, not stored" discipline as the
 * Evidence Registry's own expiry indicator (see evidenceFoundation.ts).
 * Due Soon mirrors that module's 30-day threshold for consistency; Expired
 * is set at 90 days past due so "Overdue" has room to mean something before
 * escalating to "Expired".
 */
export function computeReauthorizationStatus(nextReviewDate?: string): ReauthorizationStatus {
  if (!nextReviewDate) return 'Active';
  const remaining = Math.ceil((new Date(nextReviewDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (24 * 60 * 60 * 1000));
  if (remaining < -90) return 'Expired';
  if (remaining < 0) return 'Overdue';
  if (remaining <= 30) return 'Due Soon';
  return 'Active';
}

export const REAUTHORIZATION_STATUS_TONE: Record<ReauthorizationStatus, string> = {
  'Active': 'var(--status-success)',
  'Due Soon': 'var(--status-warning)',
  'Overdue': 'var(--status-danger)',
  'Expired': 'var(--status-danger)',
};

export const REVIEW_FREQUENCY_DAYS: Record<string, number> = {
  'Monthly': 30, 'Quarterly': 90, 'Semi Annual': 182, 'Annual': 365,
};

/** Advances nextReviewDate by the asset's review frequency from a given completion date — used when a review is marked complete. */
export function computeNextReviewDate(fromDate: string, frequency?: string): string {
  const days = (frequency && REVIEW_FREQUENCY_DAYS[frequency]) || 90;
  return new Date(new Date(fromDate).getTime() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
}

export const REASSESSMENT_TRIGGER_TYPES: { type: ReassessmentTriggerType; icon: string }[] = [
  { type: 'Model Change', icon: '🧠' },
  { type: 'Prompt Change', icon: '✏️' },
  { type: 'Agent Behavior Change', icon: '🤖' },
  { type: 'New Integration', icon: '🔌' },
  { type: 'New Tool', icon: '🧰' },
  { type: 'Data Source Change', icon: '🗄️' },
  { type: 'Permission Change', icon: '🔑' },
  { type: 'Access Scope Change', icon: '🚪' },
  { type: 'Control Failure', icon: '🧱' },
  { type: 'Risk Threshold Breach', icon: '⚡' },
  { type: 'Performance Drift', icon: '📉' },
  { type: 'Regulatory Change', icon: '🏛️' },
  { type: 'Policy Change', icon: '📕' },
  // Release 18 — Governability Foundation
  { type: 'Vendor Change', icon: '🏭' },
  { type: 'Ownership Change', icon: '👤' },
];
