/**
 * OMG Release 6 — Universal Regulatory Knowledge & Obligation Engine
 * (Foundation Edition).
 *
 * Pure, derivable coverage and gap computation — Source → Requirement →
 * Obligation → Control → Evidence. No regulation content lives here (RBI /
 * ISO 42001 / EU AI Act / NIST land as data in Release 9+); this is the
 * reusable foundation every future regulatory source plugs into. No
 * percentages, no maturity or trust scores, mirroring Release 5's Compliance
 * Coverage / Gap engines one layer deeper.
 */

import { getExpiryIndicator } from './evidenceFoundation';
import type {
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  EvidenceRecord,
  RegulatoryCoverageResult,
  RegulatoryGap,
  RegulatoryRequirement,
  RegulatorySource,
  ScheduledReview,
} from '../types';

/**
 * Resolves a mapping to the evidence record it points at. Tries the id
 * first, then falls back to the mapping's own denormalized evidenceName —
 * evidence ids aren't stable across a Neon bootstrap re-seeding the same
 * demo records with new ids, but the names are (same reasoning as Release
 * 5's resolveMappedEvidence()).
 */
function resolveMappedEvidence(mapping: ObligationEvidenceMapping, evidence: EvidenceRecord[]): EvidenceRecord | undefined {
  return evidence.find(e => e.id === mapping.evidenceId) || evidence.find(e => e.name === mapping.evidenceName);
}

/** A control is covered if it has at least one mapped evidence record that is not expired. */
export function computeObligationControlCoverage(control: ObligationControl, mappings: ObligationEvidenceMapping[], evidence: EvidenceRecord[]): boolean {
  const controlMappings = mappings.filter(m => m.controlId === control.id);
  if (controlMappings.length === 0) return false;
  return controlMappings.some(m => {
    const record = resolveMappedEvidence(m, evidence);
    return !!record && getExpiryIndicator(record.expiryDate) !== 'Expired';
  });
}

/** Rolls control coverage up to an obligation. */
export function computeObligationCoverage(
  obligation: Obligation,
  controls: ObligationControl[],
  mappings: ObligationEvidenceMapping[],
  evidence: EvidenceRecord[]
): RegulatoryCoverageResult {
  const obligationControls = controls.filter(c => c.obligationId === obligation.id);
  if (obligationControls.length === 0) {
    return { status: 'Not Applicable', controlsTotal: 0, controlsCovered: 0 };
  }
  const controlsCovered = obligationControls.filter(c => computeObligationControlCoverage(c, mappings, evidence)).length;
  const status =
    controlsCovered === obligationControls.length ? 'Covered' : controlsCovered === 0 ? 'Not Covered' : 'Partially Covered';
  return { status, controlsTotal: obligationControls.length, controlsCovered };
}

/** Rolls obligation coverage up to a requirement. */
export function computeRequirementCoverage(
  requirement: RegulatoryRequirement,
  obligations: Obligation[],
  controls: ObligationControl[],
  mappings: ObligationEvidenceMapping[],
  evidence: EvidenceRecord[]
): RegulatoryCoverageResult {
  const reqObligations = obligations.filter(o => o.requirementId === requirement.id);
  const reqControls = controls.filter(c => reqObligations.some(o => o.id === c.obligationId));
  if (reqControls.length === 0) {
    return { status: 'Not Applicable', controlsTotal: 0, controlsCovered: 0 };
  }
  const controlsCovered = reqControls.filter(c => computeObligationControlCoverage(c, mappings, evidence)).length;
  const status =
    controlsCovered === reqControls.length ? 'Covered' : controlsCovered === 0 ? 'Not Covered' : 'Partially Covered';
  return { status, controlsTotal: reqControls.length, controlsCovered };
}

/** Rolls requirement coverage up to a whole regulatory source. */
export function computeSourceCoverage(
  source: RegulatorySource,
  requirements: RegulatoryRequirement[],
  obligations: Obligation[],
  controls: ObligationControl[],
  mappings: ObligationEvidenceMapping[],
  evidence: EvidenceRecord[]
): RegulatoryCoverageResult {
  const sourceRequirementIds = requirements.filter(r => r.sourceId === source.id).map(r => r.id);
  const sourceObligations = obligations.filter(o => sourceRequirementIds.includes(o.requirementId));
  const sourceControls = controls.filter(c => sourceObligations.some(o => o.id === c.obligationId));

  if (sourceControls.length === 0) {
    return { status: 'Not Applicable', controlsTotal: 0, controlsCovered: 0 };
  }

  const controlsCovered = sourceControls.filter(c => computeObligationControlCoverage(c, mappings, evidence)).length;
  const status =
    controlsCovered === sourceControls.length ? 'Covered' : controlsCovered === 0 ? 'Not Covered' : 'Partially Covered';

  return { status, controlsTotal: sourceControls.length, controlsCovered };
}

/** Capability 7 — Regulatory Gap Register. */
export function computeSourceGaps(
  source: RegulatorySource,
  requirements: RegulatoryRequirement[],
  obligations: Obligation[],
  controls: ObligationControl[],
  mappings: ObligationEvidenceMapping[],
  evidence: EvidenceRecord[],
  reviews: ScheduledReview[]
): RegulatoryGap[] {
  const gaps: RegulatoryGap[] = [];
  const sourceRequirements = requirements.filter(r => r.sourceId === source.id);

  if (sourceRequirements.length === 0) return gaps;

  sourceRequirements.forEach(req => {
    const reqObligations = obligations.filter(o => o.requirementId === req.id);

    if (reqObligations.length === 0) {
      gaps.push({
        sourceId: source.id,
        sourceName: source.name,
        requirementId: req.id,
        gapType: 'Missing Control',
        detail: `${req.name} has no obligations defined.`,
      });
      return;
    }

    reqObligations.forEach(obligation => {
      const obligationControls = controls.filter(c => c.obligationId === obligation.id);

      if (obligationControls.length === 0) {
        gaps.push({
          sourceId: source.id,
          sourceName: source.name,
          requirementId: req.id,
          obligationId: obligation.id,
          gapType: 'Missing Control',
          detail: `${obligation.name} has no control mapped.`,
        });
        return;
      }

      obligationControls.forEach(control => {
        if (!control.owner) {
          gaps.push({
            sourceId: source.id,
            sourceName: source.name,
            requirementId: req.id,
            obligationId: obligation.id,
            controlId: control.id,
            gapType: 'Missing Ownership',
            detail: `${control.name} has no owner assigned.`,
          });
        }

        const controlMappings = mappings.filter(m => m.controlId === control.id);
        if (controlMappings.length === 0) {
          gaps.push({
            sourceId: source.id,
            sourceName: source.name,
            requirementId: req.id,
            obligationId: obligation.id,
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
              sourceId: source.id,
              sourceName: source.name,
              requirementId: req.id,
              obligationId: obligation.id,
              controlId: control.id,
              gapType: 'Missing Approval',
              detail: `${control.name}'s mapped evidence has expired.`,
            });
          }
        }
      });
    });
  });

  const hasReview = reviews.some(r => r.reviewType.toLowerCase().includes('regulatory') || r.reviewType.toLowerCase().includes(source.name.toLowerCase()));
  if (!hasReview) {
    gaps.push({
      sourceId: source.id,
      sourceName: source.name,
      gapType: 'Missing Review',
      detail: `No governance review on record referencing ${source.name}.`,
    });
  }

  return gaps;
}
