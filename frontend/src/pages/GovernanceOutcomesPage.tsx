import React, { useEffect, useState } from 'react';
import { Card } from '../components/ui/Card';
import { KpiCard } from '../components/ui/KpiCard';
import { SectionHeader } from '../components/ui/SectionHeader';
import { getGovernanceFindings, getGovernanceDrifts, bootstrapPersistence } from '../services/storageService';
import { getPolicyViolations } from '../services/policyService';
import { computeGovernanceOutcomes, type GovernanceOutcomesResult } from '../config/governanceOutcomesEngine';

function computeCurrentOutcomes(): GovernanceOutcomesResult {
  return computeGovernanceOutcomes(getGovernanceFindings(), getPolicyViolations(), getGovernanceDrifts());
}

/**
 * Release 11, Capability 5: Governance Outcomes Dashboard. Shifts the
 * framing from activity ("reviews completed") to outcomes ("risks
 * prevented") — the executive question "what value did governance
 * deliver?" Pure aggregation over existing findings/violations/drift data.
 */
export const GovernanceOutcomesPage: React.FC = () => {
  const [outcomes, setOutcomes] = useState<GovernanceOutcomesResult>(() => computeCurrentOutcomes());

  useEffect(() => {
    bootstrapPersistence().then(() => setOutcomes(computeCurrentOutcomes()));
  }, []);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Governance Outcomes</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          What value did governance deliver? Not activity counts — the risks and gaps it actually closed.
        </p>
      </div>

      <SectionHeader eyebrow="Release 11" title="Executive View" subtitle="Outcomes achieved, not tasks performed." icon="🎯" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Governance Risks Prevented" value={outcomes.governanceRisksPrevented} icon="🛡️" tone="success" />
        <KpiCard label="Governance Drift Events Resolved" value={outcomes.governanceDriftEventsResolved} icon="📉" tone="success" />
        <KpiCard label="Missing Evidence Cases Closed" value={outcomes.missingEvidenceCasesClosed} icon="📄" tone="success" />
        <KpiCard label="Expired Approvals Identified" value={outcomes.expiredApprovalsIdentified} icon="⏳" tone="info" />
        <KpiCard label="Policy Violations Corrected" value={outcomes.policyViolationsCorrected} icon="🚨" tone="success" />
        <KpiCard label="Accountability Gaps Eliminated" value={outcomes.accountabilityGapsEliminated} icon="👥" tone="success" />
      </div>

      <Card className="!p-5 flex flex-col gap-2">
        <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">
          Each figure above is a closed case, not an open task — see the Governance Drift Center, Findings and
          Policy Violations pages for the underlying record behind each count.
        </p>
      </Card>
    </div>
  );
};
