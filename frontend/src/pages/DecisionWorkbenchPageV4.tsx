import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { 
  getAssets, 
  calculateAssetGovernanceScore, 
  recordDecision, 
  getEvidence
} from '../services/storageService';
import { DecisionPackageModal } from '../components/common/DecisionPackageModal';
import type { DecisionOutcome, DecisionReadinessChecklist } from '../types';

export const DecisionWorkbenchPageV4: React.FC = () => {
  const [assets, setAssets] = useState(() => getAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [outcome, setOutcome] = useState<DecisionOutcome>('GO');
  const [justification, setJustification] = useState<string>('');
  const [isPackageOpen, setIsPackageOpen] = useState(false);

  const selectedAsset = assets.find(a => a.id === selectedAssetId) || assets[0];
  const scoreBreakdown = calculateAssetGovernanceScore(selectedAssetId);
  const evidence = getEvidence().filter(e => e.assetId === selectedAssetId);

  const [checklist, setChecklist] = useState<DecisionReadinessChecklist>({
    ownershipComplete: scoreBreakdown.ownership.passed,
    riskAssessmentComplete: scoreBreakdown.risk.passed,
    requiredReviewsComplete: scoreBreakdown.validation.passed,
    validationComplete: scoreBreakdown.validation.passed,
    monitoringDefined: true,
    auditRequirementsMet: true,
    humanOverrideAvailable: true,
    killSwitchDefined: true,
  });

  const handleChecklistToggle = (key: keyof DecisionReadinessChecklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExecute = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !justification) return;

    recordDecision({
      assetId: selectedAssetId,
      outcome,
      justification,
      checklist,
      decisionOwner: 'David Chen (Governance Admin)',
    });
    setAssets(getAssets());
    alert(`Governance Decision '${outcome}' logged successfully for ${selectedAsset.name}!`);
    setJustification('');
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Decision Workbench</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            Single Screen Executive Decision Authority • System Recommends, Human Decides
          </p>
        </div>
        <Button onClick={() => setIsPackageOpen(true)} icon={<span>📄</span>}>
          Generate Decision Briefing Package
        </Button>
      </div>

      {/* Select AI Asset Selector */}
      <Card className="!p-4">
        <Select
          label="Select AI Asset for Decision Execution"
          value={selectedAssetId}
          onChange={e => setSelectedAssetId(e.target.value)}
          options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type}) — Current Decision: ${a.decisionOutcome || 'PENDING'}` }))}
        />
      </Card>

      {/* 2-Column Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Governance Scorecard & Evidence Trail */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <Card className="!p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
              <div>
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">System Governance Score</span>
                <h3 className="text-2xl font-black text-[var(--accent-primary)] mt-0.5">
                  {scoreBreakdown.overallScore} / 100
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-[var(--text-muted)] uppercase">System Recommendation</span>
                <span className="block text-sm font-black text-emerald-400 mt-0.5">
                  {scoreBreakdown.recommendedOutcome}
                </span>
              </div>
            </div>

            {/* 5-Pillar Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-muted)] uppercase block">1. Ownership (20%)</span>
                <span className={`font-black text-sm ${scoreBreakdown.ownership.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scoreBreakdown.ownership.score}/20 — {scoreBreakdown.ownership.message}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-muted)] uppercase block">2. Risk Assessment (20%)</span>
                <span className={`font-black text-sm ${scoreBreakdown.risk.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scoreBreakdown.risk.score}/20 — {scoreBreakdown.risk.message}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-muted)] uppercase block">3. Validation Review (20%)</span>
                <span className={`font-black text-sm ${scoreBreakdown.validation.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scoreBreakdown.validation.score}/20 — {scoreBreakdown.validation.message}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
                <span className="font-bold text-[var(--text-muted)] uppercase block">4. Evidence Trail (20%)</span>
                <span className={`font-black text-sm ${scoreBreakdown.evidence.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {scoreBreakdown.evidence.score}/20 — {scoreBreakdown.evidence.message}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs">
              <span className="font-bold text-[var(--text-muted)] uppercase block">5. Findings & Risk Blockers (20%)</span>
              <span className={`font-black text-sm ${scoreBreakdown.findings.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                {scoreBreakdown.findings.score}/20 — {scoreBreakdown.findings.message}
              </span>
            </div>
          </Card>

          {/* Evidence Summary Card */}
          <Card className="!p-4 flex flex-col gap-2">
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase">
              Submitted ODF v1 Evidence Deliverables ({evidence.length})
            </h4>
            <div className="flex flex-col gap-1 text-xs">
              {evidence.map(e => (
                <div key={e.id} className="p-2 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between">
                  <span className="font-semibold text-[var(--text-primary)]">{e.deliverableType}</span>
                  <span className="text-[10px] font-bold text-emerald-400">{e.status}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column: Decision Execution & Checklist Form */}
        <Card className="lg:col-span-6 flex flex-col gap-5 !p-6">
          <div>
            <h3 className="text-lg font-black text-[var(--text-primary)]">Human Decision Authority Execution</h3>
            <p className="text-xs text-[var(--text-secondary)] mt-0.5">
              Select final decision outcome and record mandatory compliance justification.
            </p>
          </div>

          <form onSubmit={handleExecute} className="flex flex-col gap-4">
            {/* Outcome Selection Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {(['GO', 'CONDITIONAL GO', 'NO GO'] as DecisionOutcome[]).map(opt => (
                <button
                  type="button"
                  key={opt}
                  onClick={() => setOutcome(opt)}
                  className={`p-3 rounded-xl font-extrabold text-xs transition-all border ${
                    outcome === opt
                      ? opt === 'GO'
                        ? 'bg-emerald-500 text-white border-emerald-400 shadow-md'
                        : opt === 'CONDITIONAL GO'
                        ? 'bg-amber-500 text-white border-amber-400 shadow-md'
                        : 'bg-red-500 text-white border-red-400 shadow-md'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* 8-Point Checklist */}
            <div className="flex flex-col gap-2 p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <span className="text-xs font-bold text-[var(--text-primary)] uppercase mb-1">
                8-Point Decision Readiness Checklist
              </span>
              {Object.entries(checklist).map(([key, val]) => (
                <label key={key} className="flex items-center gap-2 text-xs text-[var(--text-secondary)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={val}
                    onChange={() => handleChecklistToggle(key as keyof DecisionReadinessChecklist)}
                    className="rounded accent-[var(--accent-primary)]"
                  />
                  <span className={val ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </span>
                </label>
              ))}
            </div>

            {/* Justification Textarea */}
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold text-[var(--text-secondary)]">Mandatory Decision Justification</label>
              <textarea
                rows={4}
                required
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Provide executive justification, conditions, or risk mitigation rationale..."
                className="w-full p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-color)] text-sm text-[var(--text-primary)] focus:outline-none"
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Execute & Sign Governance Decision
            </Button>
          </form>
        </Card>
      </div>

      {/* Decision Package Modal */}
      {isPackageOpen && selectedAssetId && (
        <DecisionPackageModal
          isOpen={isPackageOpen}
          onClose={() => setIsPackageOpen(false)}
          assetId={selectedAssetId}
        />
      )}
    </div>
  );
};
