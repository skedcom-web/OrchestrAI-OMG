import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { getComplianceGaps } from '../services/storageService';
import type { ComplianceGap } from '../types';

export const ComplianceFindingsPage: React.FC = () => {
  const [gaps] = useState<ComplianceGap[]>(() => getComplianceGaps());

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Compliance Findings & Regulatory Gaps</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Regulatory Gap Tracker • Unresolved RBI Control Non-Compliance Action Items
        </p>
      </div>

      {/* Summary Banner */}
      <Card className="!p-5 bg-gradient-to-r from-red-600/10 via-amber-600/10 to-purple-600/10 border-[var(--accent-border)] flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase text-red-400">Open Regulatory Gaps</span>
          <h3 className="text-2xl font-black text-[var(--text-primary)] mt-0.5">
            {gaps.length} Open Compliance Gaps Identified
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Every regulatory gap must be remediated or supported by an approved waiver prior to audit inspection.
          </p>
        </div>
      </Card>

      {/* Gaps List / Cards */}
      <div className="flex flex-col gap-3">
        {gaps.length === 0 ? (
          <Card className="!p-8 text-center text-emerald-400 font-bold">
            🎉 Zero Regulatory Gaps! 100% RBI AI Governance Alignment Achieved.
          </Card>
        ) : (
          gaps.map(gap => (
            <Card key={gap.id} className="!p-4 border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">🏛️</span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{gap.assetName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                      Control {gap.controlId}
                    </span>
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-500/20 text-red-400">
                      {gap.severity} Gap
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[var(--text-primary)] mt-1">{gap.controlName}</span>
                  <p className="text-xs text-[var(--text-secondary)] mt-0.5">{gap.remediationNotes}</p>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
