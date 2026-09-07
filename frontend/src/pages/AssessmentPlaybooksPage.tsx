import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { SectionHeader } from '../components/ui/SectionHeader';
import { GOVERNANCE_ASSESSMENT_PLAYBOOKS } from '../config/governanceAssessmentPlaybooks';
import { getPromptSet } from '../config/governancePromptLibrary';

/**
 * GACF, Initiative 1 (Playbooks) + Initiative 5 (Prompt Library, folded in
 * here rather than a separate nav entry — the blueprint's own Navigation
 * Updates section lists only five new menu entries and Prompt Library
 * isn't one of them; each playbook shows its own recommended prompts).
 */
export const AssessmentPlaybooksPage: React.FC = () => {
  const [expanded, setExpanded] = useState<string | null>(GOVERNANCE_ASSESSMENT_PLAYBOOKS[0]?.assessmentType ?? null);

  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Assessment Playbooks</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Structured guidance for each of the five assessment types — objective, scope, evaluation criteria, and how to read the resulting score.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {GOVERNANCE_ASSESSMENT_PLAYBOOKS.map(pb => {
          const isOpen = expanded === pb.assessmentType;
          const prompts = getPromptSet(pb.assessmentType);
          return (
            <Card key={pb.assessmentType} className="!p-0 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : pb.assessmentType)}
                className="w-full flex items-center justify-between gap-3 p-4 text-left cursor-pointer"
              >
                <span className="flex items-center gap-2 font-extrabold text-sm text-[var(--text-primary)]">
                  <span>{pb.icon}</span> {pb.assessmentType} Playbook
                </span>
                <span className="text-[var(--text-muted)] text-xs">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="p-4 pt-0 flex flex-col gap-4 border-t border-[var(--border-color)]">
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">Objective</p>
                    <p className="text-[13px] text-[var(--text-secondary)]">{pb.objective}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">Scope</p>
                    <p className="text-[13px] text-[var(--text-secondary)]">{pb.scope}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">Evaluation Criteria</p>
                    <ul className="flex flex-col gap-1">
                      {pb.evaluationCriteria.map((c, i) => (
                        <li key={i} className="text-[12.5px] text-[var(--text-secondary)]">— {c}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">Weighting Methodology</p>
                      <p className="text-[12.5px] text-[var(--text-secondary)]">{pb.weightingMethodology}</p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">Required Evidence</p>
                      <ul className="flex flex-col gap-0.5">
                        {pb.requiredEvidence.map((e, i) => (
                          <li key={i} className="text-[12.5px] text-[var(--text-secondary)]">— {e}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">Expected Outputs</p>
                    <div className="flex flex-wrap gap-1.5">
                      {pb.expectedOutputs.map((o, i) => (
                        <span key={i} className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-[var(--bg-badge)] border border-[var(--border-color)] text-[var(--text-secondary)]">{o}</span>
                      ))}
                    </div>
                  </div>
                  <Card className="!p-3.5 !bg-[var(--status-info-bg)] !border-[var(--status-info-border)]">
                    <p className="text-[11px] font-extrabold uppercase text-[var(--status-info)] mb-1">Scoring Interpretation Guidance</p>
                    <p className="text-[12.5px] text-[var(--text-primary)]">{pb.scoringInterpretationGuidance}</p>
                  </Card>
                  {prompts && (
                    <div>
                      <p className="text-[11px] font-bold uppercase text-[var(--text-muted)] mb-1">💡 Recommended Prompts</p>
                      <ul className="flex flex-col gap-1">
                        {prompts.questions.map((q, i) => (
                          <li key={i} className="text-[12.5px] text-[var(--text-secondary)]">— {q}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </Card>
          );
        })}
      </div>

      <SectionHeader eyebrow="GACF" title="Where to Assess" subtitle="Playbooks describe the method; the Assessment Center is where you apply it." icon="📝" />
    </div>
  );
};
