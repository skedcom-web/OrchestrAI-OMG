import React, { useState } from 'react';
import { SectionHeader } from '../components/ui/SectionHeader';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { getPrompts, reviewPromptVersion } from '../services/storageService';
import { useAuth } from '../contexts/AuthContext';
import type { Prompt, PromptReviewStatus, PromptVersion } from '../types';

const REVIEW_OPTIONS: { value: PromptReviewStatus; label: string }[] = [
  { value: 'Reviewed — Pass', label: 'Reviewed — Pass' },
  { value: 'Reviewed — Flagged', label: 'Reviewed — Flagged' },
];

const REVIEW_TONE: Record<PromptReviewStatus, string> = {
  'Reviewed — Pass': 'var(--status-success)',
  'Reviewed — Flagged': 'var(--status-danger)',
  'Not Reviewed': 'var(--text-muted)',
};

/**
 * R15 — Prompt Governance. Injection-control review, test transcripts and
 * sign-off recorded per version — a version can be re-reviewed after a
 * template change re-introduces risk a prior version didn't have.
 */
export const PromptEvidencePage: React.FC = () => {
  const { canPerform, currentUser } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>(() => getPrompts());
  const [reviewTarget, setReviewTarget] = useState<{ prompt: Prompt; version: PromptVersion } | null>(null);
  const [reviewStatus, setReviewStatus] = useState<PromptReviewStatus>('Reviewed — Pass');
  const [testTranscriptRef, setTestTranscriptRef] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const refresh = () => setPrompts(getPrompts());

  const allVersions = prompts.flatMap(p => p.versions.map(v => ({ prompt: p, version: v })));
  const notReviewed = allVersions.filter(x => x.version.reviewStatus === 'Not Reviewed');
  const flagged = allVersions.filter(x => x.version.reviewStatus === 'Reviewed — Flagged');

  const openReview = (prompt: Prompt, version: PromptVersion) => {
    setReviewTarget({ prompt, version });
    setReviewStatus('Reviewed — Pass');
    setTestTranscriptRef('');
    setReviewNotes('');
  };

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewTarget || !reviewNotes.trim()) return;
    setSaving(true);
    try {
      await reviewPromptVersion(reviewTarget.version.id, reviewStatus, currentUser?.name || 'Unknown', reviewNotes, testTranscriptRef || undefined);
      refresh();
      setReviewTarget(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      <SectionHeader
        title="Prompt Evidence"
        subtitle="Injection-control review, test transcripts and sign-off for every prompt version."
        icon="🧾"
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum text-[var(--text-primary)]">{allVersions.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Total Versions</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-warning)' }}>{notReviewed.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Awaiting Review</p></Card>
        <Card className="!p-4"><p className="text-2xl font-extrabold tnum" style={{ color: 'var(--status-danger)' }}>{flagged.length}</p><p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mt-1">Flagged</p></Card>
      </div>

      <div className="flex flex-col gap-3">
        {prompts.map(prompt => (
          <Card key={prompt.id} className="flex flex-col gap-3">
            <p className="text-sm font-bold text-[var(--text-primary)]">{prompt.name}</p>
            <div className="flex flex-col gap-2">
              {prompt.versions.map(v => (
                <div key={v.id} data-noglass className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-sunken)] px-3.5 py-3 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-[var(--text-primary)]">Version {v.versionNumber}</span>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full" style={{ color: REVIEW_TONE[v.reviewStatus], background: 'var(--bg-badge)', border: `1px solid ${REVIEW_TONE[v.reviewStatus]}40` }}>
                        {v.reviewStatus}
                      </span>
                      {v.testTranscriptRef && <span className="text-[10.5px] text-[var(--text-muted)] font-mono">{v.testTranscriptRef}</span>}
                    </div>
                    {v.reviewNotes && <p className="text-[11px] text-[var(--text-muted)] mt-1">{v.reviewNotes} {v.reviewedBy ? `— ${v.reviewedBy}` : ''}</p>}
                  </div>
                  {canPerform('promptVersion:review') && (
                    <Button variant="ghost" size="sm" onClick={() => openReview(prompt, v)} className="shrink-0 !px-2 !py-1 text-[11px]">
                      {v.reviewStatus === 'Not Reviewed' ? 'Record Review' : 'Re-review'}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <Modal
        isOpen={!!reviewTarget}
        onClose={() => setReviewTarget(null)}
        title={`Record Review — ${reviewTarget?.prompt.name || ''} v${reviewTarget?.version.versionNumber || ''}`}
        subtitle="Injection-control review evidence for this specific version."
        maxWidth="md"
      >
        <form onSubmit={handleReview} className="flex flex-col gap-4">
          <Select label="Outcome" value={reviewStatus} onChange={e => setReviewStatus(e.target.value as PromptReviewStatus)} options={REVIEW_OPTIONS} />
          <Input label="Test Transcript Reference (optional)" placeholder="transcript-set-2026-08-01" value={testTranscriptRef} onChange={e => setTestTranscriptRef(e.target.value)} />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider">Review Notes</label>
            <textarea required rows={4} value={reviewNotes} onChange={e => setReviewNotes(e.target.value)} placeholder="What was tested, and what was found…" className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg-input)] text-[var(--text-primary)] border border-[var(--border-color)] text-sm focus:outline-none focus:border-[var(--border-focus)]" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setReviewTarget(null)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Recording…' : 'Record Review'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
