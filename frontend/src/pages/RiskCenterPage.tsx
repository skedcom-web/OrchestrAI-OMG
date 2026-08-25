import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { RiskBadge } from '../components/ui/Badge';
import { getAssets, saveAsset } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { AIAsset, RiskLevel } from '../types';

export const RiskCenterPage: React.FC = () => {
  const { canPerform } = useAuth();
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('assetId') || '';

  const [assets, setAssets] = useState<AIAsset[]>(() => getAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(initialAssetId);

  // Wizard Step (1 to 6)
  const [step, setStep] = useState<number>(1);

  // Form State
  const [context, setContext] = useState<'Internal Support' | 'Customer Facing' | 'Autonomous Decision' | 'Safety Critical'>('Internal Support');
  const [dataSensitivity, setDataSensitivity] = useState<'Public' | 'Internal' | 'Confidential' | 'Restricted' | 'PII/Sensitive'>('Confidential');
  const [decisionImpact, setDecisionImpact] = useState<'Low' | 'Moderate' | 'High' | 'Critical'>('Moderate');
  const [operationalImpact, setOperationalImpact] = useState<'Low' | 'Moderate' | 'High' | 'Critical'>('Moderate');
  const [controlOversight, setControlOversight] = useState<'Automated' | 'Human-in-the-loop' | 'Human-on-the-loop' | 'Full Manual Override'>('Human-in-the-loop');

  useEffect(() => {
    if (!selectedAssetId && assets.length > 0) {
      setSelectedAssetId(assets[0].id);
    }
  }, [assets, selectedAssetId]);

  const selectedAsset = assets.find(a => a.id === selectedAssetId);

  // Calculate calculated risk tier based on selections
  const calculateRiskTier = (): RiskLevel => {
    let score = 0;
    if (context === 'Customer Facing') score += 2;
    if (context === 'Autonomous Decision') score += 3;
    if (context === 'Safety Critical') score += 4;

    if (dataSensitivity === 'Confidential') score += 2;
    if (dataSensitivity === 'Restricted') score += 3;
    if (dataSensitivity === 'PII/Sensitive') score += 4;

    if (decisionImpact === 'Moderate') score += 1;
    if (decisionImpact === 'High') score += 3;
    if (decisionImpact === 'Critical') score += 4;

    if (operationalImpact === 'High') score += 2;
    if (operationalImpact === 'Critical') score += 3;

    if (controlOversight === 'Automated') score += 3;

    if (score >= 11) return 'Critical';
    if (score >= 7) return 'High';
    if (score >= 4) return 'Medium';
    return 'Low';
  };

  const calculatedTier = calculateRiskTier();

  const handleCompleteAssessment = async () => {
    if (!selectedAsset) return;

    try {
      await saveAsset({
        ...selectedAsset,
        riskLevel: calculatedTier,
        dataSensitivity,
      });
      setAssets(getAssets());
      alert(`Risk Assessment Complete! Asset '${selectedAsset.name}' risk tier updated to ${calculatedTier.toUpperCase()}.`);
    } catch (err) {
      setAssets(getAssets()); // reflect the optimistic local update even though sync failed
      alert(`Risk profile saved to the local cache but could not be synced to Neon: ${(err as Error).message}. It will not be visible on other devices until sync succeeds.`);
    }
  };

  const assetOptions = assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }));

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Risk Center Assessment Wizard</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Phase 2 Guided 6-Step Model & Asset Risk Classification Engine
        </p>
      </div>

      {/* Asset Selector */}
      <Card className="!p-4 flex items-center justify-between gap-4">
        <div className="flex-1">
          <Select
            label="Select AI Asset for Risk Evaluation"
            options={assetOptions}
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
          />
        </div>
        {selectedAsset && (
          <div className="flex items-center gap-3 pt-6">
            <span className="text-xs font-semibold text-[var(--text-muted)]">Current Risk:</span>
            <RiskBadge level={selectedAsset.riskLevel} />
          </div>
        )}
      </Card>

      {/* Wizard Progress Steps Bar */}
      <div className="grid grid-cols-6 gap-2">
        {['1. Context', '2. Data', '3. Decision', '4. Operations', '5. Oversight', '6. Summary'].map((label, idx) => {
          const stepNum = idx + 1;
          const isActive = step === stepNum;
          const isDone = step > stepNum;
          return (
            <button
              key={label}
              onClick={() => setStep(stepNum)}
              className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                isActive
                  ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)] shadow-md'
                  : isDone
                  ? 'bg-[var(--bg-badge)] text-emerald-400 border-emerald-500/30'
                  : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-color)]'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Step Content Panels */}
      <Card className="flex flex-col gap-6 p-8">
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Step 1: Asset Context & Purpose</h3>
            <p className="text-xs text-[var(--text-secondary)]">Evaluate the operational deployment context and user exposure of this AI asset.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['Internal Support', 'Customer Facing', 'Autonomous Decision', 'Safety Critical'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setContext(opt)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                    context === opt
                      ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-primary)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Step 2: Data Sensitivity & Classification</h3>
            <p className="text-xs text-[var(--text-secondary)]">Identify the highest classification of data processed or stored by this AI system.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {(['Public', 'Internal', 'Confidential', 'Restricted', 'PII/Sensitive'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDataSensitivity(opt)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                    dataSensitivity === opt
                      ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-primary)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Step 3: Financial & Legal Decision Impact</h3>
            <p className="text-xs text-[var(--text-secondary)]">What is the potential impact if the AI asset produces an erroneous output or recommendation?</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['Low', 'Moderate', 'High', 'Critical'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setDecisionImpact(opt)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                    decisionImpact === opt
                      ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-primary)]'
                  }`}
                >
                  {opt} Impact
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Step 4: Operational Disruption Potential</h3>
            <p className="text-xs text-[var(--text-secondary)]">Assess core business dependency and operational downtime risks.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['Low', 'Moderate', 'High', 'Critical'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setOperationalImpact(opt)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                    operationalImpact === opt
                      ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-primary)]'
                  }`}
                >
                  {opt} Operational Risk
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)]">Step 5: Control & Human Oversight Level</h3>
            <p className="text-xs text-[var(--text-secondary)]">Specify the human oversight paradigm operating alongside this AI asset.</p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              {(['Automated', 'Human-in-the-loop', 'Human-on-the-loop', 'Full Manual Override'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setControlOversight(opt)}
                  className={`p-4 rounded-xl border text-left text-sm font-semibold transition-all ${
                    controlOversight === opt
                      ? 'bg-[var(--accent-light)] border-[var(--accent-primary)] text-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-primary)]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="flex flex-col gap-6">
            <div>
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Step 6: Assessment Summary & Calculated Risk Profile</h3>
              <p className="text-xs text-[var(--text-secondary)]">Review evaluated risk dimensions and confirm tier classification.</p>
            </div>

            <div className="p-6 rounded-2xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <span className="text-xs uppercase font-bold text-[var(--text-muted)]">Calculated Risk Tier</span>
                <div className="mt-1 flex items-center gap-3">
                  <RiskBadge level={calculatedTier} size="md" />
                </div>
              </div>

              <div className="flex flex-wrap gap-4 text-xs text-[var(--text-secondary)]">
                <div><strong>Context:</strong> {context}</div>
                <div><strong>Data:</strong> {dataSensitivity}</div>
                <div><strong>Decision:</strong> {decisionImpact}</div>
                <div><strong>Oversight:</strong> {controlOversight}</div>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleCompleteAssessment}
              disabled={!canPerform('asset:edit')}
              title={!canPerform('asset:edit') ? 'Your governance role does not permit updating an asset’s risk profile.' : undefined}
            >
              Apply & Update Asset Risk Profile
            </Button>
          </div>
        )}

        {/* Wizard Controls */}
        <div className="flex items-center justify-between pt-6 border-t border-[var(--border-color)]">
          <Button variant="ghost" disabled={step === 1} onClick={() => setStep(s => Math.max(1, s - 1))}>
            ← Previous Step
          </Button>
          {step < 6 && (
            <Button onClick={() => setStep(s => Math.min(6, s + 1))}>
              Next Step →
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
