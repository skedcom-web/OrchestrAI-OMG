import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import type { DecisionTrace } from '../../config/decisionTraceabilityEngine';

interface DecisionEvidencePackModalProps {
  isOpen: boolean;
  onClose: () => void;
  trace: DecisionTrace;
}

/**
 * OMG Release 9 — Core Features 2 & 5, Decision Evidence Pack / Audit
 * Package Generation. A printable, structured reconstruction of one asset's
 * full decision trace — Condition through Human Decision — the artefact a
 * reviewer or regulator would ask for. Mirrors the existing
 * CompliancePackageModal / GovernanceReviewPackageModal pattern.
 */
export const DecisionEvidencePackModal: React.FC<DecisionEvidencePackModalProps> = ({ isOpen, onClose, trace }) => {
  const now = new Date().toISOString().split('T')[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Decision Evidence Pack"
      subtitle={`Full reasoning trace for ${trace.assetName}`}
      maxWidth="lg"
    >
      <div className="flex flex-col gap-6 py-2 text-[var(--text-primary)] font-sans">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-600/15 via-blue-600/15 to-teal-600/15 border border-[var(--accent-border)] flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-color)] pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                ORCHESTRAI MODEL GOVERNANCE • DECISION TRACEABILITY
              </span>
              <h2 className="text-2xl font-black mt-1 text-[var(--text-primary)]">{trace.assetName}</h2>
              <span className="text-xs text-[var(--text-muted)]">Asset ID: {trace.assetId}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] block">Traceability</span>
              <span className={`text-xl font-black ${trace.traceabilityComplete ? 'text-emerald-400' : 'text-amber-400'}`}>
                {trace.traceabilityComplete ? 'Complete' : 'Gap Detected'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Conditions</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{trace.conditionsTriggered.length}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Findings</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{trace.findingsGenerated.length}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Outcome</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{trace.outcome?.status || '—'}</p>
            </div>
            <div>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Human Decisions</span>
              <p className="font-extrabold text-[var(--text-primary)] mt-0.5">{trace.humanDecisions.length}</p>
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-2">
            Reasoning Chain — Condition → Outcome → Action
          </h4>
          <div className="flex flex-col gap-2">
            {trace.timeline.length === 0 ? (
              <span className="text-xs text-[var(--text-muted)] italic">No trace entries.</span>
            ) : (
              trace.timeline.map((entry, i) => (
                <div key={i} className="p-3 rounded-xl bg-[var(--bg-badge)] border border-[var(--border-color)] flex items-start gap-3 text-xs">
                  <span className="font-mono text-[var(--accent-primary)] shrink-0 w-24">{entry.stage}</span>
                  <div className="min-w-0">
                    <strong>{entry.label}</strong> — {entry.detail}
                    {(entry.timestamp || entry.actor) && (
                      <span className="text-[var(--text-muted)]"> ({[entry.timestamp, entry.actor].filter(Boolean).join(' · ')})</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black uppercase text-[var(--text-muted)] tracking-wider mb-1">
            Human Decisions on Record ({trace.humanDecisions.length})
          </h4>
          <ul className="list-disc pl-4 space-y-1 text-xs text-[var(--text-secondary)]">
            {trace.humanDecisions.length === 0 ? <li>No human decision recorded yet.</li> : trace.humanDecisions.map(a => (
              <li key={a.id}>
                <strong>{a.decidedBy}</strong> decided <strong>{a.status}</strong> on {a.name} ({a.decidedAt})
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
          <span className="text-[10px] text-[var(--text-muted)]">Decision Evidence Pack Generated: {now}</span>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={onClose}>Close</Button>
            <Button onClick={handlePrint} icon={<span>🖨️</span>}>Print / Export Audit Package</Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
