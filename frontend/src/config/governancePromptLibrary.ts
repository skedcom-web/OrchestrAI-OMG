/**
 * Governance Assessment Calibration & Consistency Framework (GACF).
 * Initiative 5 — Prompt Library. "Prompt" here means a structured set of
 * questions a HUMAN reviewer works through while scoring an assessment —
 * not an instruction fed to an AI model. OMG is a governance and
 * accountability platform, not a runtime AI execution platform (see the
 * platform's own certification findings on this point); nothing in this
 * release changes that. Users may still write their own notes freeform —
 * these are a recommended starting point, per the blueprint's own wording.
 */

import type { GovernanceAssessmentType } from '../types';

export interface AssessmentPrompt {
  assessmentType: GovernanceAssessmentType;
  questions: string[];
}

export const GOVERNANCE_PROMPT_LIBRARY: AssessmentPrompt[] = [
  {
    assessmentType: 'Effectiveness',
    questions: [
      'Which of the six Effectiveness sub-factors changed the most since the last recorded snapshot, and why?',
      'Is there a specific piece of evidence — not a general impression — behind each category score you are about to give?',
      'If this asset\'s effectiveness score halved next quarter, which category would most likely be the cause?',
    ],
  },
  {
    assessmentType: 'Maturity',
    questions: [
      'For this domain, describe what "Optimized" would concretely look like for this organization — then compare today\'s state against that description.',
      'Is the current level dependent on one person\'s effort, or is it built into a repeatable process?',
      'What is the single next action that would move this domain up one level?',
    ],
  },
  {
    assessmentType: 'ROI',
    questions: [
      'Would the hours-saved assumption survive being read aloud to the team that actually does this work?',
      'Is the blended hourly rate still realistic for this organization\'s actual governance staffing?',
      'Does the risk-avoidance figure correspond to a real historical incident, or is it purely hypothetical?',
    ],
  },
  {
    assessmentType: 'Benchmarking',
    questions: [
      'Is the selected industry benchmark still the most relevant comparison for this organization\'s current regulatory footprint?',
      'What would explain a large gap in either direction — is it a real capability difference, or a difference in how the two are measured?',
    ],
  },
  {
    assessmentType: 'Regulatory Readiness',
    questions: [
      'If this regulation changed tomorrow, which specific gap would first surface — and is it already known and tracked?',
      'Is coverage recent, or is it evidence that has technically not expired but has not been re-verified in a long time?',
      'Does the source\'s own review cadence match how frequently this regulation actually changes in practice?',
    ],
  },
];

export function getPromptSet(assessmentType: GovernanceAssessmentType): AssessmentPrompt | undefined {
  return GOVERNANCE_PROMPT_LIBRARY.find(p => p.assessmentType === assessmentType);
}
