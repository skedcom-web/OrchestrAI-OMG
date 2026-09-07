import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { GOVERNANCE_SCORING_TEMPLATES } from '../config/governanceScoringTemplates';
import { GOVERNANCE_CALIBRATION_LIBRARY } from '../config/governanceCalibrationLibrary';
import { MATURITY_LEVEL_LABELS, type GovernanceMaturityLevel } from '../types';

const LEVELS: GovernanceMaturityLevel[] = [1, 2, 3, 4, 5];

/**
 * GACF, Initiative 2 (Standardized Scoring Templates) + Initiative 3
 * (Reference Assessment Library) — grouped on one page since calibration
 * examples exist specifically to show the scoring templates applied to a
 * real scenario, and the blueprint's Navigation Updates section lists
 * "Calibration Library" as a single nav entry, not two.
 */
export const CalibrationLibraryPage: React.FC = () => {
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Calibration Library</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          The standardized scoring rubric, and worked examples of it applied to real assessment scenarios. Calibration examples, not benchmark standards.
        </p>
      </div>

      <SectionHeader eyebrow="Initiative 2" title="Scoring Templates" subtitle="Ten categories, one 1-5 scale — click a category for its full rubric." icon="🧮" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {GOVERNANCE_SCORING_TEMPLATES.map(t => {
          const isOpen = openCategory === t.category;
          return (
            <Card key={t.category} className="!p-0 overflow-hidden">
              <button onClick={() => setOpenCategory(isOpen ? null : t.category)} className="w-full flex items-center justify-between gap-2 p-3.5 text-left cursor-pointer">
                <span className="font-bold text-sm text-[var(--text-primary)]">{t.icon} {t.category}</span>
                <span className="text-[var(--text-muted)] text-xs">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="p-3.5 pt-0 flex flex-col gap-2 border-t border-[var(--border-color)]">
                  {LEVELS.map(level => (
                    <div key={level} className="flex gap-2 text-[12px]">
                      <span className="tnum font-extrabold text-[var(--accent-primary)] shrink-0 w-16">{level} — {MATURITY_LEVEL_LABELS[level]}</span>
                      <span className="text-[var(--text-secondary)]">{t.levels[level]}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <SectionHeader eyebrow="Initiative 3" title="Reference Assessment Library" subtitle="Five scenarios, showing how a score was reasoned about." icon="📚" />
      <div className="flex flex-col gap-3">
        {GOVERNANCE_CALIBRATION_LIBRARY.map(ex => (
          <Card key={ex.scenario} className="!p-4 flex flex-col gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden>{ex.icon}</span>
              <p className="font-extrabold text-sm text-[var(--text-primary)]">{ex.scenario}</p>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">{ex.description}</p>
            <p className="text-[12px] text-[var(--text-muted)] italic">{ex.rationale}</p>
            <div className="flex flex-wrap gap-1.5">
              {ex.exampleEvidence.map((e, i) => (
                <span key={i} className="text-[10.5px] font-semibold px-2 py-1 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{e}</span>
              ))}
            </div>
            <Card className="!p-3 !bg-[var(--accent-light)] !border-[var(--accent-border)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-extrabold uppercase text-[var(--accent-primary)]">{ex.categoryScore.category}</span>
                <span className="tnum text-sm font-extrabold text-[var(--accent-primary)]">{ex.categoryScore.level} / 5 — {MATURITY_LEVEL_LABELS[ex.categoryScore.level]}</span>
              </div>
              <p className="text-[12px] text-[var(--text-primary)]">{ex.scoreExplanation}</p>
            </Card>
          </Card>
        ))}
      </div>
    </div>
  );
};
