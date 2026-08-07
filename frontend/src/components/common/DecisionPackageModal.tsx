import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { calculateAssetGovernanceScore, getAssetById, getEvidence, getFindings } from '../../services/storageService';

interface DecisionPackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
}

export const DecisionPackageModal: React.FC<DecisionPackageModalProps> = ({
  isOpen,
  onClose,
  assetId,
}) => {
  const asset = getAssetById(assetId);
  const scoreBreakdown = calculateAssetGovernanceScore(assetId);
  const evidence = getEvidence().filter(e => e.assetId === assetId);
  const findings = getFindings().filter(f => f.assetId === assetId);
  const now = new Date().toISOString().split('T')[0];

  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Executive Decision Briefing Package`}
      subtitle={`Formal Governance Certificate for ${asset.name} (v${asset.version})`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 py-2 text-[var(--text-primary)] font-sans">
        {/* Printable Executive Certificate Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/15 via-purple-600/15 to-pink-600/15 border border-[var(--accent-border)] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-primary)]">
                ORCHESTRAI MODEL GOVERNANCE • DECISION CERTIFICATE
              </span>
              <h2 className="text-2xl font-black mt-1 text-[var(--text-primary)]">{asset.name}</h2>
              <span className="text-xs text-[var(--text-muted)]">ID: {asset.id} | Department: {asset.department} | Type: {asset.type}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Governance Score</span>
              <span className="text-3xl font-black text-[var(--accent-primary)]">{scoreBreakdown.overallScore}/100</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Readiness Tier</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{scoreBreakdown.readinessTier}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Recommendation</span>
              <p className="font-extrabold text-[var(--accent-primary)] mt-0.5">{scoreBreakdown.recommendedOutcome}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Risk Level</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{asset.riskLevel}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Decision Outcome</span>
              <p className="font-black text-emerald-400 mt-0.5">{asset.decisionOutcome || 'PENDING'}</p>
            </div>
          </div>
        </div>

        {/* 5-Pillar Score Rating Grid */}
        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
            5-Pillar Governance Evaluation (20% x 5 = 100 Points)
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {[
              { label: '1. Ownership', detail: scoreBreakdown.ownership },
              { label: '2. Risk', detail: scoreBreakdown.risk },
              { label: '3. Validation', detail: scoreBreakdown.validation },
              { label: '4. Evidence', detail: scoreBreakdown.evidence },
              { label: '5. Findings', detail: scoreBreakdown.findings },
            ].map(p => (
              <div key={p.label} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex flex-col gap-1 text-center">
                <span className="text-[10px] font-bold text-[var(--text-muted)]">{p.label}</span>
                <span className={`text-base font-black ${p.detail.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {p.detail.score}/20
                </span>
                <span className="text-[9px] text-[var(--text-secondary)] line-clamp-1">{p.detail.message}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Accountable Owners */}
        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
            RACIS Accountable Ownership Matrix
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] block">Business Owner</span>
              <span className="font-bold text-[var(--text-primary)]">{asset.ownership.businessOwner || 'Unassigned'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] block">Technical Owner</span>
              <span className="font-bold text-[var(--text-primary)]">{asset.ownership.technicalOwner || 'Unassigned'}</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)]">
              <span className="text-[10px] font-bold text-[var(--text-muted)] block">Risk Owner</span>
              <span className="font-bold text-[var(--text-primary)]">{asset.ownership.riskOwner || 'Unassigned'}</span>
            </div>
          </div>
        </div>

        {/* Evidence & Findings Summaries */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <h4 className="font-black uppercase text-[var(--text-muted)] mb-1">Approved Evidence Artifacts ({evidence.length})</h4>
            <ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)]">
              {evidence.length === 0 ? <li>No evidence uploaded</li> : evidence.map(e => (
                <li key={e.id}>{e.deliverableType} (v{e.version})</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-black uppercase text-[var(--text-muted)] mb-1">Governance Findings ({findings.length})</h4>
            <ul className="list-disc pl-4 space-y-1 text-[var(--text-secondary)]">
              {findings.length === 0 ? <li>Zero open findings</li> : findings.map(f => (
                <li key={f.id} className={f.severity === 'Critical' ? 'text-red-400 font-bold' : ''}>
                  [{f.severity}] {f.title}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)]">Package Generated: {now} | ODF Blueprint v1.0</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} icon={<span>🖨️</span>}>Print / Export PDF Briefing</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
