import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getGovernanceAlerts } from '../services/storageService';
import type { GovernanceAlert } from '../types';

export const GovernanceAlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alerts] = useState<GovernanceAlert[]>(() => getGovernanceAlerts());

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Governance Alerts Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Automated Exception Detection • Overdue Reviews, Expired Validations, & Active Risk Alerts
        </p>
      </div>

      {/* Summary Banner */}
      <Card className="!p-5 bg-gradient-to-r from-red-600/10 via-amber-600/10 to-purple-600/10 border-[var(--accent-border)] flex items-center justify-between">
        <div>
          <span className="text-xs font-black uppercase text-red-400">Active Governance Exceptions</span>
          <h3 className="text-2xl font-black text-[var(--text-primary)] mt-0.5">
            {alerts.length} Active Governance Alerts
          </h3>
          <p className="text-xs text-[var(--text-secondary)] mt-0.5">
            Exceptions require immediate remediation or executive review to prevent governance health deterioration.
          </p>
        </div>
      </Card>

      {/* Alerts Cards */}
      <div className="flex flex-col gap-3">
        {alerts.length === 0 ? (
          <Card className="!p-8 text-center text-emerald-400 font-bold">
            🎉 Zero Active Governance Alerts! Portfolio health is operating within approved boundaries.
          </Card>
        ) : (
          alerts.map(alt => (
            <Card key={alt.id} className="!p-4 border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl shrink-0">
                  {alt.severity === 'Critical' ? '🚨' : '⚡'}
                </span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-[var(--text-primary)]">{alt.assetName}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                      {alt.alertType}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      alt.severity === 'Critical' ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {alt.severity} Severity
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-secondary)] mt-1">{alt.message}</p>
                  <span className="text-[10px] text-[var(--text-muted)] mt-1">Alert Triggered: {alt.createdAt}</span>
                </div>
              </div>

              <Button
                size="sm"
                onClick={() => navigate(alt.resolutionPath)}
                icon={<span>🛠️</span>}
              >
                Resolve Exception
              </Button>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
