import React from 'react';
import { Card } from '../components/ui/Card';
import { GOVERNANCE_ASSESSMENT_ACADEMY } from '../config/governanceAssessmentAcademy';

/**
 * GACF, Initiative 6: Assessment Academy. Lightweight guidance content per
 * the blueprint's own instruction — no course platform, no video hosting,
 * no progress tracking.
 */
export const AssessmentAcademyPage: React.FC = () => {
  return (
    <div className="flex flex-col gap-7 pb-4">
      <div>
        <h1 className="text-2xl font-extrabold text-[var(--text-primary)]">Assessment Academy</h1>
        <p className="text-[13px] text-[var(--text-secondary)] mt-1 max-w-2xl">
          Seven topics covering how to conduct a consistent, well-evidenced governance assessment.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {GOVERNANCE_ASSESSMENT_ACADEMY.map((topic, i) => (
          <Card key={topic.title} className="!p-5 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="tnum text-[11px] font-black text-[var(--text-muted)]">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-xl" aria-hidden>{topic.icon}</span>
              <p className="font-extrabold text-sm text-[var(--text-primary)]">{topic.title}</p>
            </div>
            <p className="text-[13px] text-[var(--text-secondary)]">{topic.summary}</p>
            <ul className="flex flex-col gap-1">
              {topic.keyPoints.map((k, idx) => (
                <li key={idx} className="text-[12px] text-[var(--text-secondary)]">— {k}</li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </div>
  );
};
