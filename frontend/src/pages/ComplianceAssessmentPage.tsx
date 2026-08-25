import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { 
  getAssets, 
  getComplianceControls, 
  getComplianceAssessments, 
  saveComplianceAssessment,
  calculateAssetComplianceScore 
} from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { ComplianceEvaluationStatus } from '../types';

export const ComplianceAssessmentPage: React.FC = () => {
  // Q1 Stabilization — Phase 2: this legacy RBI ComplianceControl assessment has no dedicated
  // ActionKey in roleActionMatrix.ts (it predates the compliancePack/complianceRequirement
  // framework), so it is gated with the safe !isReadOnly fallback.
  const { isReadOnly } = useAuth();
  const [assets] = useState(() => getAssets());
  const [controls] = useState(() => getComplianceControls());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [assessments, setAssessments] = useState(() => getComplianceAssessments());

  const compScoreDetails = calculateAssetComplianceScore(selectedAssetId);

  const refreshAssessments = () => {
    setAssessments(getComplianceAssessments());
  };

  const handleAssessmentChange = (controlId: string, status: ComplianceEvaluationStatus, notes: string) => {
    saveComplianceAssessment({
      assetId: selectedAssetId,
      controlId,
      status,
      assessor: 'Robert Vance (Auditor)',
      notes,
    });
    refreshAssessments();
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Compliance Assessment Tool</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Interactive Evaluation Workbench for Compliance Officers & Auditors • RBI Control Assessment
        </p>
      </div>

      {/* Select AI Asset Selector Banner */}
      <Card className="!p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-[var(--accent-border)]">
        <div className="w-full sm:w-2/3">
          <Select
            label="Select AI Asset to Assess Against RBI Standard"
            value={selectedAssetId}
            onChange={e => setSelectedAssetId(e.target.value)}
            options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type}) — Dept: ${a.department}` }))}
          />
        </div>

        <div className="flex items-center gap-4 text-right">
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Current Rating</span>
            <p className="text-2xl font-black text-emerald-400">{compScoreDetails.score}%</p>
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase text-[var(--text-muted)]">Status</span>
            <p className="text-xs font-extrabold text-[var(--text-primary)]">{compScoreDetails.status}</p>
          </div>
        </div>
      </Card>

      {/* Controls Evaluation List */}
      <div className="flex flex-col gap-4">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          RBI & Enterprise Control Evaluation ({controls.length} Controls)
        </h3>

        {controls.map(ctrl => {
          const matched = assessments.find(a => a.assetId === selectedAssetId && a.controlId === ctrl.id);
          const currentStatus = matched?.status || 'Compliant';
          const currentNotes = matched?.notes || '';

          return (
            <Card key={ctrl.id} className="!p-5 flex flex-col gap-4 border-[var(--border-color)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-[var(--accent-primary)] px-2.5 py-0.5 rounded bg-[var(--accent-light)] border border-[var(--accent-border)]">
                    {ctrl.id}
                  </span>
                  <div>
                    <h4 className="text-sm font-extrabold text-[var(--text-primary)]">{ctrl.controlName}</h4>
                    <span className="text-[10px] text-[var(--text-muted)]">{ctrl.source} • Category: {ctrl.category}</span>
                  </div>
                </div>

                {/* Status Toggle Buttons */}
                <div className="flex items-center gap-2">
                  {(['Compliant', 'Partially Compliant', 'Non-Compliant'] as ComplianceEvaluationStatus[]).map(st => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => handleAssessmentChange(ctrl.id, st, currentNotes)}
                      disabled={isReadOnly}
                      title={isReadOnly ? 'Your governance role does not permit updating a control assessment.' : undefined}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border disabled:opacity-50 disabled:cursor-not-allowed ${
                        currentStatus === st
                          ? st === 'Compliant'
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-sm'
                            : st === 'Partially Compliant'
                            ? 'bg-amber-500 text-white border-amber-400 shadow-sm'
                            : 'bg-red-500 text-white border-red-400 shadow-sm'
                          : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-xs text-[var(--text-secondary)] leading-relaxed bg-[var(--bg-badge)] p-3 rounded-xl border border-[var(--border-color)]">
                <strong>Control Requirement:</strong> {ctrl.description}
              </p>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
