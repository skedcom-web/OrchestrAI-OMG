import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { StatusBadge } from '../components/ui/StatusBadge';
import { getAssets, recordDecision } from '../services/storageService';
import type { AIAsset, DecisionOutcome } from '../types';

export const DecisionGovernancePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('assetId') || '';

  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId);

  const [outcome, setOutcome] = useState<DecisionOutcome>('GO');
  const [justification, setJustification] = useState('');

  // 8-Point Decision Readiness Checklist State
  const [checklist, setChecklist] = useState({
    ownershipComplete: true,
    riskAssessmentComplete: true,
    requiredReviewsComplete: true,
    validationComplete: true,
    monitoringDefined: true,
    auditRequirementsMet: true,
    humanOverrideAvailable: true,
    killSwitchDefined: true,
  });

  useEffect(() => {
    if (!selectedAssetId && assets.length > 0) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Update checklist based on selected asset automatically
  useEffect(() => {
    if (selectedAsset) {
      const o = selectedAsset.ownership || {};
      const ownershipFilled = Boolean(o.businessOwner && o.technicalOwner && o.riskOwner && o.complianceOwner);
      
      setChecklist(prev => ({
        ...prev,
        ownershipComplete: ownershipFilled,
        riskAssessmentComplete: selectedAsset.riskLevel !== undefined,
        validationComplete: (selectedAsset.validationScore || 0) >= 80,
      }));
    }
  }, [selectedAsset]);

  const checklistItems = [
    { key: 'ownershipComplete', label: '1. Ownership Matrix Complete (All Roles Assigned)' },
    { key: 'riskAssessmentComplete', label: '2. Risk Assessment Wizard Completed' },
    { key: 'requiredReviewsComplete', label: '3. Technical & Compliance Reviews Passed' },
    { key: 'validationComplete', label: '4. Validation & Test Evidence Uploaded (>80% Score)' },
    { key: 'monitoringDefined', label: '5. Real-Time Observability & Monitoring Defined' },
    { key: 'auditRequirementsMet', label: '6. Immutable Audit Trail Enabled' },
    { key: 'humanOverrideAvailable', label: '7. Human Override & Escalation Path Defined' },
    { key: 'killSwitchDefined', label: '8. Emergency Kill Switch / Suspend Protocol Ready' },
  ];

  const handleExecuteDecision = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !justification) return;

    recordDecision(selectedAssetId, outcome, justification, checklist);
    setAssets(getAssets());
    alert(`Governance Decision '${outcome}' logged successfully for asset ID: ${selectedAssetId}!`);
    setJustification('');
  };

  const assetOptions = assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Decision Governance Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Single Decision Authority Gatekeeper • Preventing Governance Debt
        </p>
      </div>

      {/* Strategic Principle Banner */}
      <Card className="!p-6 bg-gradient-to-r from-[var(--bg-card)] via-[var(--bg-card)] to-[var(--accent-light)] border-[var(--accent-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[var(--accent-primary)]">
              Core Strategic Governance Question
            </span>
            <h2 className="text-2xl font-black text-[var(--text-primary)] mt-1">
              "Can this AI asset move forward today?"
            </h2>
            <p className="text-xs text-[var(--text-secondary)] mt-1">
              No admissible decision = No AI movement into production.
            </p>
          </div>

          {selectedAsset && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]">
              <div className="flex flex-col text-right">
                <span className="text-xs font-bold text-[var(--text-primary)]">{selectedAsset.name}</span>
                <span className="text-[10px] text-[var(--text-muted)]">Status: {selectedAsset.status}</span>
              </div>
              <StatusBadge status={selectedAsset.decisionOutcome || 'PENDING'} />
            </div>
          )}
        </div>
      </Card>

      {/* Main Grid: Checklist & Decision Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: 8-Point Readiness Checklist */}
        <Card className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-[var(--text-primary)]">Decision Readiness Checklist</h3>
              <p className="text-xs text-[var(--text-secondary)]">Verify 8 mandatory enterprise readiness requirements</p>
            </div>
            <Select
              label=""
              options={assetOptions}
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              className="!w-64"
            />
          </div>

          <div className="flex flex-col gap-3">
            {checklistItems.map(item => {
              const isChecked = (checklist as any)[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => setChecklist({ ...checklist, [item.key]: !isChecked })}
                  className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-[var(--text-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-muted)]'
                  }`}
                >
                  <span className="text-xs font-semibold">{item.label}</span>
                  <span className={`text-sm font-bold ${isChecked ? 'text-emerald-400' : 'text-red-400'}`}>
                    {isChecked ? '✓ PASSED' : '✕ INCOMPLETE'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: Decision Execution Form */}
        <Card className="flex flex-col gap-6">
          <div>
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Execute Decision Authority</h3>
            <p className="text-xs text-[var(--text-secondary)]">Log final governance decision & justification</p>
          </div>

          <form onSubmit={handleExecuteDecision} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                Decision Outcome
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['GO', 'CONDITIONAL GO', 'NO GO'] as DecisionOutcome[]).map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setOutcome(opt)}
                    className={`py-3 px-2 rounded-xl text-xs font-black transition-all border ${
                      outcome === opt
                        ? opt === 'GO'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-md'
                          : opt === 'CONDITIONAL GO'
                          ? 'bg-cyan-500 text-white border-cyan-500 shadow-md'
                          : 'bg-red-600 text-white border-red-600 shadow-md'
                        : 'bg-[var(--bg-badge)] text-[var(--text-secondary)] border-[var(--border-color)]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-xs flex flex-col gap-1">
              <span className="text-[10px] text-[var(--text-muted)] uppercase font-semibold">Decision Authority</span>
              <span className="font-bold text-[var(--text-primary)]">Sarah Jenkins (Super Admin)</span>
              <span className="text-[10px] text-[var(--text-muted)]">Date: {new Date().toISOString().split('T')[0]}</span>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase">
                Decision Justification & Notes
              </label>
              <textarea
                rows={4}
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)] transition-all"
                value={justification}
                onChange={e => setJustification(e.target.value)}
                placeholder="Provide detailed governance justification for this outcome..."
              />
            </div>

            <Button type="submit" size="lg" className="w-full">
              Record Governed Decision
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
