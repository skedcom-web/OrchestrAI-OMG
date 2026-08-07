import React from 'react';
import type {
  ApprovalDecision,
  ChangeMagnitude,
  ChangeStatus,
  ImpactOutcome,
  ReassessmentRequirement,
} from '../../types/changeManagement';

export const CHANGE_STATUS_TONE: Record<ChangeStatus, string> = {
  Draft: 'var(--status-neutral)',
  Submitted: 'var(--status-info)',
  'Under Review': 'var(--status-warning)',
  Approved: 'var(--status-success)',
  Rejected: 'var(--status-danger)',
  Implemented: 'var(--accent-primary)',
  Closed: 'var(--text-muted)',
};

export const MAGNITUDE_TONE: Record<ChangeMagnitude, string> = {
  Minor: 'var(--risk-low)',
  Moderate: 'var(--risk-medium)',
  Major: 'var(--risk-high)',
  Critical: 'var(--risk-critical)',
};

export const IMPACT_TONE: Record<ImpactOutcome, string> = {
  'No Impact': 'var(--status-neutral)',
  'Low Impact': 'var(--risk-low)',
  'Medium Impact': 'var(--risk-medium)',
  'High Impact': 'var(--risk-high)',
  'Critical Impact': 'var(--risk-critical)',
};

export const DECISION_TONE: Record<ApprovalDecision, string> = {
  Pending: 'var(--status-warning)',
  Approved: 'var(--status-success)',
  Rejected: 'var(--status-danger)',
};

export const REASSESSMENT_TONE: Record<ReassessmentRequirement, string> = {
  'No Reassessment': 'var(--status-success)',
  'Risk Review Required': 'var(--status-warning)',
  'Full Governance Review': 'var(--risk-high)',
  'Executive Approval Required': 'var(--status-danger)',
};

interface PillProps {
  label: string;
  tone: string;
  title?: string;
  size?: 'sm' | 'md';
}

/** Compact status token used throughout the change governance surfaces. */
export const Pill: React.FC<PillProps> = ({ label, tone, title, size = 'sm' }) => (
  <span
    data-noglass
    title={title}
    className={`inline-block font-extrabold uppercase rounded-md border whitespace-nowrap ${
      size === 'sm' ? 'text-[9.5px] px-2 py-1' : 'text-[11px] px-2.5 py-1'
    }`}
    style={{
      color: tone,
      borderColor: `color-mix(in srgb, ${tone} 45%, transparent)`,
      background: `color-mix(in srgb, ${tone} 12%, transparent)`,
    }}
  >
    {label}
  </span>
);
