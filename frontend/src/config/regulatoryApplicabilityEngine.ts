/**
 * OMG Release 12 — Regulatory Intelligence, Capability 1: Applicability.
 * "Which regulations apply to us?"
 *
 * Zero new data: reuses RegulatorySource.industry (Release 6) against the
 * tenant's active GovernanceProfile.industry (Release 10) — the same
 * "industry is configuration, not core logic" pattern the platform already
 * uses for compliance packs and benchmarking. No new mapping store.
 */

import type { GovernanceProfile, RegulatorySource } from '../types';

export interface ApplicabilityResult {
  source: RegulatorySource;
  applies: boolean;
  reason: string;
}

export function computeRegulatoryApplicability(sources: RegulatorySource[], profiles: GovernanceProfile[]): ApplicabilityResult[] {
  const activeProfile = profiles.find(p => p.isActive);

  return sources.map(source => {
    if (source.status === 'Retired') {
      return { source, applies: false, reason: 'Retired — no longer in force.' };
    }
    if (!activeProfile) {
      return { source, applies: true, reason: 'No Governance Profile configured yet — showing all in-force sources.' };
    }
    if (source.industry === activeProfile.industry || source.industry === 'Cross-Industry') {
      return { source, applies: true, reason: `Matches the active Governance Profile (${activeProfile.industry}).` };
    }
    return { source, applies: false, reason: `Scoped to ${source.industry}, not the active ${activeProfile.industry} profile.` };
  });
}
