import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getValidations, getEvidence, getAssets, saveValidation } from '../services/storageService';

export const ReviewWorkbenchPage: React.FC = () => {
  const [validations, setValidations] = useState(() => getValidations());
  const [evidenceList] = useState(() => getEvidence());
  const [assets] = useState(() => getAssets());
  const [selectedValId, setSelectedValId] = useState<string>(validations[0]?.id || '');

  const refreshValidations = () => {
    setValidations(getValidations());
  };

  const selectedValidation = validations.find(v => v.id === selectedValId) || validations[0];
  const selectedAsset = assets.find(a => a.id === selectedValidation?.assetId);
  const relatedEvidence = evidenceList.filter(e => e.assetId === selectedValidation?.assetId);

  const handleAction = (status: 'Approved' | 'Rejected') => {
    if (!selectedValidation) return;
    saveValidation({
      ...selectedValidation,
      status,
      score: status === 'Approved' ? 100 : 0,
    });
    refreshValidations();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Review Workbench</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Single Interactive Workbench for Validators, Risk Officers & Governance Managers
        </p>
      </div>

      {/* Main 2-Column Split Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Validation Review Queue */}
        <Card className="lg:col-span-4 flex flex-col gap-3 !p-4">
          <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
            Review Queue ({validations.length})
          </h3>
          <div className="flex flex-col gap-2 max-h-[600px] overflow-y-auto pr-1">
            {validations.map(val => {
              const isSelected = val.id === selectedValidation?.id;
              return (
                <div
                  key={val.id}
                  onClick={() => setSelectedValId(val.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[var(--accent-primary)] bg-[var(--accent-light)] shadow-sm'
                      : 'border-[var(--border-color)] bg-[var(--bg-badge)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[var(--text-primary)] line-clamp-1">{val.assetName}</span>
                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded ${
                      val.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : val.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                    }`}>
                      {val.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mt-2">
                    <span>{val.category} Validation</span>
                    <span>Score: {val.score}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right Column: Workbench Inspector */}
        {selectedValidation ? (
          <Card className="lg:col-span-8 flex flex-col gap-6 !p-6">
            {/* Header Details */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border-color)]">
              <div>
                <span className="text-xs font-extrabold text-[var(--accent-primary)] uppercase">
                  {selectedValidation.category} Validation Review
                </span>
                <h2 className="text-2xl font-black text-[var(--text-primary)] mt-0.5">
                  {selectedValidation.assetName}
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                  Assigned Reviewer: {selectedValidation.reviewer} ({selectedValidation.reviewerRole})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="danger" onClick={() => handleAction('Rejected')}>
                  Reject Validation ❌
                </Button>
                <Button size="sm" onClick={() => handleAction('Approved')}>
                  Approve Validation ✅
                </Button>
              </div>
            </div>

            {/* Asset Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Risk Level</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedAsset?.riskLevel || 'Medium'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Asset Type</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedAsset?.type || 'Agent'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Data Sensitivity</span>
                <p className="text-sm font-bold text-[var(--text-primary)] mt-0.5">{selectedAsset?.dataSensitivity || 'Confidential'}</p>
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Decision Outcome</span>
                <p className="text-sm font-extrabold text-[var(--accent-primary)] mt-0.5">{selectedAsset?.decisionOutcome || 'PENDING'}</p>
              </div>
            </div>

            {/* Review Findings & Recommendations */}
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Review Findings</h4>
                <p className="text-sm text-[var(--text-primary)] mt-1 p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] leading-relaxed">
                  {selectedValidation.findings || 'No findings recorded.'}
                </p>
              </div>
              <div>
                <h4 className="text-xs font-extrabold uppercase text-[var(--text-muted)] tracking-wider">Recommendations</h4>
                <p className="text-sm text-[var(--text-primary)] mt-1 p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] leading-relaxed">
                  {selectedValidation.recommendations || 'No recommendations.'}
                </p>
              </div>
            </div>

            {/* Linked Governance Evidence Artifacts */}
            <div>
              <h4 className="text-xs font-extrabold uppercase text-[var(--text-muted)] tracking-wider mb-2">
                Linked Evidence Artifacts ({relatedEvidence.length})
              </h4>
              <div className="flex flex-col gap-2">
                {relatedEvidence.length === 0 ? (
                  <p className="text-xs text-[var(--text-muted)] italic">No evidence uploaded for this asset yet.</p>
                ) : (
                  relatedEvidence.map(evd => (
                    <div key={evd.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span>📄</span>
                        <div>
                          <span className="font-bold text-[var(--text-primary)]">{evd.title}</span>
                          <span className="text-[10px] text-[var(--text-muted)] block">{evd.deliverableType}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded font-bold ${evd.status === 'Approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {evd.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        ) : (
          <div className="lg:col-span-8 flex items-center justify-center p-12 text-center text-gray-400">
            Select a validation review item from the queue to start.
          </div>
        )}
      </div>
    </div>
  );
};
