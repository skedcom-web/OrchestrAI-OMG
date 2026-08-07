import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  getAssetById, 
  calculateAssetGovernanceHealthScore,
  getIncidents,
  getCorrectiveActions
} from '../../services/storageService';

interface GovernanceReviewPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
}

export const GovernanceReviewPackageModal: React.FC<GovernanceReviewPackageModalProps> = ({
  isOpen,
  onClose,
  assetId,
}) => {
  const asset = getAssetById(assetId);
  const healthDetails = calculateAssetGovernanceHealthScore(assetId);
  const incidents = getIncidents().filter(i => i.assetId === assetId && i.status !== 'Closed');
  const actions = getCorrectiveActions().filter(a => a.assetId === assetId && a.status !== 'Completed');
  const now = new Date().toISOString().split('T')[0];

  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Governance Health Review Package`}
      subtitle={`Formal Governance Re-Assessment Certificate for ${asset.name} (v${asset.version})`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 py-2 text-[var(--text-primary)] font-sans">
        {/* Header Certificate Banner */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/15 via-teal-600/15 to-emerald-600/15 border border-[var(--accent-border)] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">
                ORCHESTRAI MODEL GOVERNANCE • HEALTH REVIEW REPORT
              </span>
              <h2 className="text-2xl font-black mt-1 text-[var(--text-primary)]">{asset.name}</h2>
              <span className="text-xs text-[var(--text-muted)]">
                Asset ID: {asset.id} | Department: {asset.department} | Operational Status: {asset.operationalStatus || 'Active'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Health Score</span>
              <span className="text-3xl font-black text-[var(--accent-primary)]">{healthDetails.overallHealthScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Governance Health</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{healthDetails.healthStatus}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Active Incidents</span>
              <p className="font-extrabold text-amber-400 mt-0.5">{incidents.length} Open Incidents</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Remediation Tasks</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{actions.length} Pending Actions</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Risk Level</span>
              <p className="font-black text-purple-400 mt-0.5">{asset.riskLevel}</p>
            </div>
          </div>
        </div>

        {/* 5-Pillar Health Score Ratings Grid */}
        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
            5-Pillar Continuous Governance Health Evaluation (20% x 5 = 100 Points)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-center">
            {[
              { label: 'Ownership', detail: healthDetails.ownershipHealth },
              { label: 'Risk Profile', detail: healthDetails.riskHealth },
              { label: 'Validation', detail: healthDetails.validationHealth },
              { label: 'Compliance', detail: healthDetails.complianceHealth },
              { label: 'Operations', detail: healthDetails.operationalHealth },
            ].map(p => (
              <div key={p.label} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">{p.label}</span>
                <span className={`text-base font-black ${p.detail.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {p.detail.score}/20
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{p.detail.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)]">Review Package Generated: {now} | ODF Phase 7 Standard</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} icon={<span>🖨️</span>}>Print / Export PDF Health Report</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
