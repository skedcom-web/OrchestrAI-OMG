/**
 * OMG Release 19 — Domain A + B: Authority Provenance Registry & Authority
 * Currency Engine Enhancement.
 *
 * Strengthens the existing Authority Currency Engine (Release 18) with
 * traceability: not just "is authority current" but "where did this
 * authority come from, and is that grant itself still valid, or has it been
 * superseded, suspended, or left pending review." OMG records and
 * operationalizes authority provenance; it does not create authority
 * (Principle 1) — every record here is descriptive, supplied by whoever
 * files it, never independently derived.
 *
 * Advisory only, computed live from records already on file — nothing here
 * revokes, extends, or otherwise modifies a recorded grant of authority.
 */
import type { AuthorityGovernanceOutcome, AuthorityProvenanceRecord, AuthorityProvenanceResult } from '../types';

export function computeAuthorityProvenance(
  assetId: string,
  assetName: string,
  records: AuthorityProvenanceRecord[]
): AuthorityProvenanceResult {
  const assetRecords = records.filter(r => r.assetId === assetId);
  const reasons: string[] = [];

  if (assetRecords.length === 0) {
    return {
      assetId,
      assetName,
      outcome: 'Authority Invalid',
      activeRecordCount: 0,
      expiredRecordCount: 0,
      supersededRecordCount: 0,
      reasons: ['No authority provenance has ever been recorded for this asset.'],
    };
  }

  const now = Date.now();
  const isExpiredByDate = (r: AuthorityProvenanceRecord) => !!r.expiryDate && new Date(r.expiryDate).getTime() < now;

  const activeRecords = assetRecords.filter(r => r.status === 'Active' && !isExpiredByDate(r));
  const expiredRecords = assetRecords.filter(r => r.status === 'Expired' || isExpiredByDate(r));
  const supersededRecords = assetRecords.filter(r => r.status === 'Superseded');
  const suspendedRecords = assetRecords.filter(r => r.status === 'Suspended');
  const pendingRecords = assetRecords.filter(r => r.status === 'Pending Review');

  let outcome: AuthorityGovernanceOutcome;

  if (activeRecords.length === 0) {
    outcome = 'Authority Invalid';
    if (suspendedRecords.length > 0) reasons.push(`${suspendedRecords.length} authority record(s) are suspended and none are active.`);
    else if (expiredRecords.length > 0) reasons.push(`${expiredRecords.length} authority record(s) have expired and none are active.`);
    else reasons.push('No active authority record exists for this asset.');
  } else if (suspendedRecords.length > 0 || pendingRecords.length > 0) {
    outcome = 'Authority At Risk';
    if (suspendedRecords.length > 0) reasons.push(`${suspendedRecords.length} authority record(s) are suspended alongside the active grant.`);
    if (pendingRecords.length > 0) reasons.push(`${pendingRecords.length} authority record(s) are pending review.`);
  } else {
    const soonestExpiry = activeRecords
      .filter(r => r.expiryDate)
      .map(r => new Date(r.expiryDate as string).getTime())
      .sort((a, b) => a - b)[0];
    const daysToExpiry = soonestExpiry ? Math.floor((soonestExpiry - now) / (24 * 60 * 60 * 1000)) : null;
    if (daysToExpiry !== null && daysToExpiry <= 30) {
      outcome = 'Authority At Risk';
      reasons.push(`The active authority grant expires in ${daysToExpiry} day(s).`);
    } else {
      outcome = 'Authority Current';
      reasons.push(`${activeRecords.length} active, traceable authority record(s) on file, none expiring imminently.`);
    }
  }

  return {
    assetId,
    assetName,
    outcome,
    activeRecordCount: activeRecords.length,
    expiredRecordCount: expiredRecords.length,
    supersededRecordCount: supersededRecords.length,
    reasons,
  };
}
