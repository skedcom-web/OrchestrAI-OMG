/**
 * OMG Release 5 — Universal Compliance Pack Framework.
 *
 * Pure, derivable coverage and gap computation — Requirement → Control →
 * Evidence. No regulation content lives here (that's Release 6+); this is
 * the reusable architecture every future pack plugs into as data. No
 * percentages, no maturity or trust scores, per Capability 5.
 */

import { getExpiryIndicator } from './evidenceFoundation';
import type {
  CompliancePack,
  ComplianceCoverageResult,
  ComplianceRequirement,
  EvidenceMapping,
  EvidenceRecord,
  PackControl,
  PackGap,
  ScheduledReview,
} from '../types';

/**
 * Resolves a mapping to the evidence record it points at. Tries the id first
 * (the normal case), then falls back to matching on the mapping's own
 * denormalized evidenceName — evidence ids aren't stable across a Neon
 * bootstrap re-seeding the same demo records with new ids, but the names are.
 */
function resolveMappedEvidence(mapping: EvidenceMapping, evidence: EvidenceRecord[]): EvidenceRecord | undefined {
  return evidence.find(e => e.id === mapping.evidenceId) || evidence.find(e => e.name === mapping.evidenceName);
}

/** A control is covered if it has at least one mapped evidence record that is not expired. */
export function computeControlCoverage(control: PackControl, mappings: EvidenceMapping[], evidence: EvidenceRecord[]): boolean {
  const controlMappings = mappings.filter(m => m.controlId === control.id);
  if (controlMappings.length === 0) return false;
  return controlMappings.some(m => {
    const record = resolveMappedEvidence(m, evidence);
    return !!record && getExpiryIndicator(record.expiryDate) !== 'Expired';
  });
}

/** Rolls control coverage up to a requirement, then a whole pack. */
export function computePackCoverage(
  pack: CompliancePack,
  requirements: ComplianceRequirement[],
  controls: PackControl[],
  mappings: EvidenceMapping[],
  evidence: EvidenceRecord[]
): ComplianceCoverageResult {
  const packRequirementIds = requirements.filter(r => r.packId === pack.id).map(r => r.id);
  const packControls = controls.filter(c => packRequirementIds.includes(c.requirementId));

  if (packControls.length === 0) {
    return { status: 'Not Applicable', controlsTotal: 0, controlsCovered: 0 };
  }

  const controlsCovered = packControls.filter(c => computeControlCoverage(c, mappings, evidence)).length;

  const status =
    controlsCovered === packControls.length ? 'Covered' : controlsCovered === 0 ? 'Not Covered' : 'Partially Covered';

  return { status, controlsTotal: packControls.length, controlsCovered };
}

export function computeRequirementCoverage(
  requirement: ComplianceRequirement,
  controls: PackControl[],
  mappings: EvidenceMapping[],
  evidence: EvidenceRecord[]
): ComplianceCoverageResult {
  const reqControls = controls.filter(c => c.requirementId === requirement.id);
  if (reqControls.length === 0) {
    return { status: 'Not Applicable', controlsTotal: 0, controlsCovered: 0 };
  }
  const controlsCovered = reqControls.filter(c => computeControlCoverage(c, mappings, evidence)).length;
  const status =
    controlsCovered === reqControls.length ? 'Covered' : controlsCovered === 0 ? 'Not Covered' : 'Partially Covered';
  return { status, controlsTotal: reqControls.length, controlsCovered };
}

/** Capability 6 — Compliance Gap Register. */
export function computePackGaps(
  pack: CompliancePack,
  requirements: ComplianceRequirement[],
  controls: PackControl[],
  mappings: EvidenceMapping[],
  evidence: EvidenceRecord[],
  reviews: ScheduledReview[]
): PackGap[] {
  const gaps: PackGap[] = [];
  const packRequirements = requirements.filter(r => r.packId === pack.id);

  if (packRequirements.length === 0) return gaps;

  packRequirements.forEach(req => {
    const reqControls = controls.filter(c => c.requirementId === req.id);

    if (reqControls.length === 0) {
      gaps.push({
        packId: pack.id,
        packName: pack.name,
        requirementId: req.id,
        gapType: 'Missing Control',
        detail: `${req.name} has no control defined.`,
      });
      return;
    }

    reqControls.forEach(control => {
      if (!control.owner) {
        gaps.push({
          packId: pack.id,
          packName: pack.name,
          requirementId: req.id,
          controlId: control.id,
          gapType: 'Missing Owner',
          detail: `${control.name} has no owner assigned.`,
        });
      }

      const controlMappings = mappings.filter(m => m.controlId === control.id);
      if (controlMappings.length === 0) {
        gaps.push({
          packId: pack.id,
          packName: pack.name,
          requirementId: req.id,
          controlId: control.id,
          gapType: 'Missing Evidence',
          detail: `${control.name} has no evidence mapped.`,
        });
      } else {
        const allExpired = controlMappings.every(m => {
          const record = resolveMappedEvidence(m, evidence);
          return record && getExpiryIndicator(record.expiryDate) === 'Expired';
        });
        if (allExpired) {
          gaps.push({
            packId: pack.id,
            packName: pack.name,
            requirementId: req.id,
            controlId: control.id,
            gapType: 'Expired Evidence',
            detail: `${control.name}'s mapped evidence has expired.`,
          });
        }
      }
    });
  });

  const hasReview = reviews.some(r => r.reviewType.toLowerCase().includes('compliance') || r.reviewType.toLowerCase().includes(pack.name.toLowerCase()));
  if (!hasReview) {
    gaps.push({
      packId: pack.id,
      packName: pack.name,
      gapType: 'Missing Review',
      detail: `No governance review on record referencing ${pack.name}.`,
    });
  }

  return gaps;
}
