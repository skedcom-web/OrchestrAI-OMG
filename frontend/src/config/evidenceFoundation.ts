/**
 * OMG Release 3 — Evidence Foundation.
 *
 * Reference data for the universal Evidence Registry: baseline evidence
 * types, lifecycle states, and expiry tracking. Descriptive only — no
 * scoring, no workflow automation in Release 3.
 */

import type { EvidenceExpiryIndicator, EvidenceRecord, EvidenceRecordStatus, EvidenceRecordType } from '../types';

/* ===================== Capability 2 — Evidence Types ===================== */

export interface EvidenceTypeDefinition {
  type: EvidenceRecordType;
  icon: string;
}

export const EVIDENCE_TYPES: EvidenceTypeDefinition[] = [
  { type: 'Policy Document', icon: '📕' },
  { type: 'Risk Assessment', icon: '⚡' },
  { type: 'Validation Report', icon: '🧪' },
  { type: 'Approval Record', icon: '🖋️' },
  { type: 'Governance Review', icon: '🧭' },
  { type: 'Audit Finding', icon: '⚠️' },
  { type: 'Incident Report', icon: '🚨' },
  { type: 'Control Assessment', icon: '🧱' },
  { type: 'Training Record', icon: '🎓' },
  { type: 'Third-Party Assessment', icon: '🤝' },
];

/* ==================== Capability 5 — Evidence Lifecycle =================== */

export interface EvidenceStatusDefinition {
  status: EvidenceRecordStatus;
  icon: string;
  tone: 'neutral' | 'success' | 'warning' | 'danger';
  description: string;
}

export const EVIDENCE_STATUSES: EvidenceStatusDefinition[] = [
  { status: 'Draft', icon: '📝', tone: 'neutral', description: 'Being prepared; not yet in force.' },
  { status: 'Active', icon: '✅', tone: 'success', description: 'Current and in force.' },
  { status: 'Expired', icon: '⌛', tone: 'danger', description: 'Past its expiry date; needs renewal.' },
  { status: 'Archived', icon: '📦', tone: 'neutral', description: 'Retained for record; no longer active.' },
  { status: 'Superseded', icon: '🔁', tone: 'warning', description: 'Replaced by a newer evidence record.' },
];

export function getEvidenceStatusDefinition(status: EvidenceRecordStatus): EvidenceStatusDefinition {
  return EVIDENCE_STATUSES.find(s => s.status === status) || EVIDENCE_STATUSES[0];
}

/* ================ Capability 6 — Evidence Expiry Tracking ================= */

export function daysRemaining(expiryDate?: string): number | null {
  if (!expiryDate) return null;
  const diffMs = new Date(expiryDate).getTime() - new Date().setHours(0, 0, 0, 0);
  return Math.ceil(diffMs / (24 * 60 * 60 * 1000));
}

/** Expiring Soon = within 30 days. */
export function getExpiryIndicator(expiryDate?: string): EvidenceExpiryIndicator {
  const remaining = daysRemaining(expiryDate);
  if (remaining === null) return 'No Expiry Set';
  if (remaining < 0) return 'Expired';
  if (remaining <= 30) return 'Expiring Soon';
  return 'Valid';
}

export const EXPIRY_INDICATOR_TONE: Record<EvidenceExpiryIndicator, string> = {
  'Valid': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30',
  'Expiring Soon': 'bg-amber-500/15 text-amber-500 border-amber-500/40 font-bold',
  'Expired': 'bg-red-500/15 text-red-500 border-red-500/40 font-bold',
  'No Expiry Set': 'bg-slate-500/10 text-slate-400 border-slate-500/30',
};

/**
 * R20.1 — Evidence Registry polymorphic refactor. Resolves whichever of
 * assetId/entityId + assetName/entityName is set on a record — the one
 * place every consumer should read "what this evidence is filed against",
 * so the optionality introduced here doesn't leak into every caller.
 */
export function evidenceEntityRef(e: Pick<EvidenceRecord, 'assetId' | 'assetName' | 'entityType' | 'entityId' | 'entityName'>): { type: string; id: string; name: string } {
  if (e.assetId) return { type: 'Asset', id: e.assetId, name: e.assetName || e.assetId };
  return { type: e.entityType || 'Unknown', id: e.entityId || '', name: e.entityName || e.entityId || 'Unknown' };
}
