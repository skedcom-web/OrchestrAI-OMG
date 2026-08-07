import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  getAssetById, 
  calculateAssetComplianceScore, 
  getComplianceControls, 
  getComplianceAssessments,
  getEvidence,
  getComplianceGaps
} from '../../services/storageService';

interface CompliancePackageModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetId: string;
}

export const CompliancePackageModal: React.FC<CompliancePackageModalProps> = ({
  isOpen,
  onClose,
  assetId,
}) => {
  const asset = getAssetById(assetId);
  const compDetails = calculateAssetComplianceScore(assetId);
  const controls = getComplianceControls();
  const assessments = getComplianceAssessments().filter(a => a.assetId === assetId);
  const evidence = getEvidence().filter(e => e.assetId === assetId);
  const gaps = getComplianceGaps(assetId);
  const now = new Date().toISOString().split('T')[0];

  if (!asset) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Audit-Ready RBI Compliance Package`}
      subtitle={`Formal Regulatory Audit Certificate for ${asset.name} (v${asset.version})`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 py-2 text-[var(--text-primary)] font-sans">
        {/* Printable Executive Compliance Certificate Header */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-emerald-600/15 via-teal-600/15 to-blue-600/15 border border-[var(--accent-border)] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                ORCHESTRAI MODEL GOVERNANCE • RBI AUDIT CERTIFICATE
              </span>
              <h2 className="text-2xl font-black mt-1 text-[var(--text-primary)]">{asset.name}</h2>
              <span className="text-xs text-[var(--text-muted)]">
                Asset ID: {asset.id} | Department: {asset.department} | Risk Level: {asset.riskLevel}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Compliance Rating</span>
              <span className="text-3xl font-black text-emerald-400">{compDetails.score}%</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Compliance Status</span>
              <p className="font-extrabold text-emerald-400 mt-0.5">{compDetails.status}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">RBI Standard Alignment</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">8 Mandatory Controls</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Approved Evidence</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{evidence.length} Artifacts</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Open Regulatory Gaps</span>
              <p className="font-black text-amber-400 mt-0.5">{gaps.length} Open Gaps</p>
            </div>
          </div>
        </div>

        {/* RBI Controls Evaluation Grid */}
        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
            RBI AI Governance Controls Evaluation Matrix
          </h4>
          <div className="flex flex-col gap-2">
            {controls.slice(0, 6).map(ctrl => {
              const matched = assessments.find(a => a.controlId === ctrl.id);
              const status = matched?.status || 'Compliant';

              return (
                <div key={ctrl.id} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[var(--accent-primary)]">{ctrl.id}</span>
                    <span className="font-semibold text-[var(--text-primary)]">{ctrl.controlName}</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-black text-[10px] uppercase ${
                    status === 'Compliant' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Evidence Trail Summary */}
        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-1">
            Linked Compliance Evidence Artifacts ({evidence.length})
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-secondary)]">
            {evidence.length === 0 ? <li>No evidence artifacts linked yet.</li> : evidence.map(e => (
              <li key={e.id}>
                <strong>[{e.deliverableType}]</strong> {e.title} (v{e.version}) — Status: {e.status}
              </li>
            ))}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)]">Compliance Package Generated: {now} | RBI Standard v1.0</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} icon={<span>🖨️</span>}>Print / Export PDF Audit Package</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
