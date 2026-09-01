/**
 * OMG Release 12 — Regulatory Intelligence, Capability 2: Cross-Framework
 * Mapping. "What controls satisfy multiple frameworks?"
 *
 * The platform has always had two parallel evidence-mapping chains —
 * CompliancePack → PackControl → EvidenceMapping (Release 5) and
 * RegulatorySource → ObligationControl → ObligationEvidenceMapping
 * (Release 6) — that share only one thing: the same EvidenceRecord table.
 * This engine is the first place anything cross-references them. No new
 * mapping store: it reads both existing chains and joins on EvidenceRecord.
 */

import type {
  CompliancePack,
  ComplianceRequirement,
  EvidenceMapping,
  EvidenceRecord,
  Obligation,
  ObligationControl,
  ObligationEvidenceMapping,
  PackControl,
  RegulatoryRequirement,
  RegulatorySource,
} from '../types';

export interface FrameworkCoverage {
  type: 'Compliance Pack' | 'Regulatory Source';
  name: string;
}

export interface EvidenceFrameworkReuse {
  evidenceId: string;
  evidenceName: string;
  frameworks: FrameworkCoverage[];
}

function resolveEvidence(id: string, name: string, evidence: EvidenceRecord[]): EvidenceRecord | undefined {
  return evidence.find(e => e.id === id) || evidence.find(e => e.name === name);
}

/** Evidence records covering 2+ distinct frameworks — where reuse is already happening. */
export function computeCrossFrameworkReuse(
  evidence: EvidenceRecord[],
  evidenceMappings: EvidenceMapping[],
  packControls: PackControl[],
  complianceRequirements: ComplianceRequirement[],
  compliancePacks: CompliancePack[],
  obligationEvidenceMappings: ObligationEvidenceMapping[],
  obligationControls: ObligationControl[],
  obligations: Obligation[],
  regulatoryRequirements: RegulatoryRequirement[],
  regulatorySources: RegulatorySource[]
): EvidenceFrameworkReuse[] {
  return evidence
    .map(e => {
      const packFrameworks: FrameworkCoverage[] = evidenceMappings
        .filter(m => resolveEvidence(m.evidenceId, m.evidenceName, evidence)?.id === e.id)
        .map(m => packControls.find(c => c.id === m.controlId))
        .filter((c): c is PackControl => !!c)
        .map(c => complianceRequirements.find(r => r.id === c.requirementId))
        .filter((r): r is ComplianceRequirement => !!r)
        .map(r => compliancePacks.find(p => p.id === r.packId))
        .filter((p): p is CompliancePack => !!p)
        .map(p => ({ type: 'Compliance Pack' as const, name: p.name }));

      const sourceFrameworks: FrameworkCoverage[] = obligationEvidenceMappings
        .filter(m => resolveEvidence(m.evidenceId, m.evidenceName, evidence)?.id === e.id)
        .map(m => obligationControls.find(c => c.id === m.controlId))
        .filter((c): c is ObligationControl => !!c)
        .map(c => obligations.find(o => o.id === c.obligationId))
        .filter((o): o is Obligation => !!o)
        .map(o => regulatoryRequirements.find(r => r.id === o.requirementId))
        .filter((r): r is RegulatoryRequirement => !!r)
        .map(r => regulatorySources.find(s => s.id === r.sourceId))
        .filter((s): s is RegulatorySource => !!s)
        .map(s => ({ type: 'Regulatory Source' as const, name: s.name }));

      const seen = new Set<string>();
      const frameworks = [...packFrameworks, ...sourceFrameworks].filter(f => {
        const key = `${f.type}:${f.name}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      return { evidenceId: e.id, evidenceName: e.name, frameworks };
    })
    .filter(r => r.frameworks.length >= 2)
    .sort((a, b) => b.frameworks.length - a.frameworks.length);
}
