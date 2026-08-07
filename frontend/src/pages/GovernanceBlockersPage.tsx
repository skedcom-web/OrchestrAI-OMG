import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getGovernanceBlockers } from '../services/storageService';
import type { GovernanceBlocker } from '../types';

export const GovernanceBlockersPage: React.FC = () => {
  const navigate = useNavigate();
  const [blockers] = useState<GovernanceBlocker[]>(() => getGovernanceBlockers());

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Blockers Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Executive Root Cause Blocker Visibility • What prevents AI deployment approval today?
        </p>
      </div>

      {/* Summary Metrics Banner */}
      <Card className="!p-6 bg-gradient-to-r from-purple-600/10 via-red-600/10 to-amber-600/10 border-[var(--accent-border)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-black uppercase text-red-400 tracking-wider">Active Approval Blockers</span>
            <h3 className="text-2xl font-black text-[var(--text-primary)] mt-1">
              {blockers.length} Active Blockers Identified
            </h3>
            <p className="text-xs text-[var(--text-secondary)] mt-1 max-w-xl">
              Executives can immediately understand why an AI asset cannot receive a GO decision until governance requirements are satisfied.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">Critical Severity</span>
              <p className="text-xl font-black text-purple-400">
                {blockers.filter(b => b.severity === 'Critical').length}
              </p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] text-center">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)]">High Severity</span>
              <p className="text-xl font-black text-red-400">
                {blockers.filter(b => b.severity === 'High').length}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Blockers Table / Cards */}
      <div className="flex flex-col gap-3">
        {blockers.length === 0 ? (
          <Card className="!p-8 text-center text-emerald-400 font-bold">
            🎉 Zero Governance Blockers! All AI assets satisfy readiness requirements.
          </Card>
        ) : (
          blockers.map(b => (
            <Card key={b.id} className="!p-4 border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">
                  {b.severity === 'Critical' ? '🚨' : b.severity === 'High' ? '⚠️' : '⚡'}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{b.assetName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-muted)]">
                      {b.category}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      b.severity === 'Critical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {b.severity} Blocker
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">{b.blockerMessage}</p>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => navigate(b.remediationPath)}
                icon={<span>🛠️</span>}
              >
                Resolve Blocker
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
