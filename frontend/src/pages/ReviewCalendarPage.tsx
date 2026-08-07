import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { getAssets, getScheduledReviews, saveScheduledReview } from '../services/storageService';
import type { ScheduledReview, ReviewType, ReviewStatus } from '../types';

export const ReviewCalendarPage: React.FC = () => {
  const [assets] = useState(() => getAssets());
  const [reviews, setReviews] = useState<ScheduledReview[]>(() => getScheduledReviews());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(assets[0]?.id || '');
  const [reviewType, setReviewType] = useState<ReviewType>('Quarterly Review');
  const [owner, setOwner] = useState<string>('Elena Rostova (Risk Officer)');
  const [dueDate, setDueDate] = useState<string>('');

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssetId || !dueDate) return;

    saveScheduledReview({
      assetId: selectedAssetId,
      reviewType,
      owner,
      dueDate,
    });
    setReviews(getScheduledReviews());
    alert('📅 Governance Review scheduled successfully!');
    setDueDate('');
  };

  const handleStatusChange = (id: string, newStatus: ReviewStatus) => {
    saveScheduledReview({ id, status: newStatus });
    setReviews(getScheduledReviews());
  };

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-[var(--text-primary)]">Review Calendar Center</h1>
        <p className="text-sm text-[var(--text-secondary)] mt-1">
          Governance Re-Assessment Scheduler • Monthly, Quarterly, & Executive Oversight Cadence
        </p>
      </div>

      {/* Schedule Review Card */}
      <Card className="!p-6 flex flex-col gap-4 border-[var(--accent-border)]">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">Schedule New Governance Review</h3>

        <form onSubmit={handleSchedule} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Select AI System"
              value={selectedAssetId}
              onChange={e => setSelectedAssetId(e.target.value)}
              options={assets.map(a => ({ value: a.id, label: `${a.name} (${a.type})` }))}
            />

            <Select
              label="Review Cadence / Type"
              value={reviewType}
              onChange={e => setReviewType(e.target.value as ReviewType)}
              options={[
                { value: 'Monthly Review', label: 'Monthly Review' },
                { value: 'Quarterly Review', label: 'Quarterly Review' },
                { value: 'Annual Review', label: 'Annual Review' },
                { value: 'Incident Review', label: 'Incident Review' },
                { value: 'Executive Review', label: 'Executive Review' },
              ]}
            />

            <Input
              label="Review Due Date"
              type="date"
              required
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>

          <Input
            label="Assigned Review Lead / Owner"
            required
            value={owner}
            onChange={e => setOwner(e.target.value)}
            placeholder="e.g. Elena Rostova (Risk Officer)"
          />

          <Button type="submit" className="w-full">
            📅 Schedule Governance Review
          </Button>
        </form>
      </Card>

      {/* Review Calendar List */}
      <div className="flex flex-col gap-3">
        <h3 className="text-base font-extrabold text-[var(--text-primary)]">
          Scheduled & Overdue Reviews Directory ({reviews.length})
        </h3>

        {reviews.map(rev => (
          <Card key={rev.id} className="!p-4 border-[var(--border-color)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl shrink-0">📅</span>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm text-[var(--text-primary)]">{rev.assetName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--accent-light)] text-[var(--accent-primary)] border border-[var(--accent-border)]">
                    {rev.reviewType}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    rev.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {rev.status}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-secondary)] mt-1">Review Lead: {rev.owner}</span>
                <span className="text-[10px] text-[var(--text-muted)] mt-0.5">Due Date: {rev.dueDate}</span>
              </div>
            </div>

            {/* Workflow Action Buttons */}
            <div className="flex items-center gap-1 shrink-0">
              {(['Scheduled', 'In Progress', 'Completed', 'Overdue'] as ReviewStatus[]).map(st => (
                <button
                  key={st}
                  type="button"
                  onClick={() => handleStatusChange(rev.id, st)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all border ${
                    rev.status === st
                      ? 'bg-[var(--accent-primary)] text-white border-[var(--accent-primary)]'
                      : 'bg-[var(--bg-badge)] border-[var(--border-color)] text-[var(--text-muted)] hover:bg-[var(--bg-card-hover)]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
