/**
 * Governance Assessment Calibration & Consistency Framework (GACF).
 * Initiative 6 — Assessment Academy. Lightweight guidance content per the
 * blueprint's own instruction ("may initially be implemented using
 * lightweight guidance content rather than a full LMS") — no course
 * platform, no video hosting, no progress tracking; just the seven topics
 * the blueprint specifies, as structured reference content.
 */

export interface AcademyTopic {
  title: string;
  icon: string;
  summary: string;
  keyPoints: string[];
}

export const GOVERNANCE_ASSESSMENT_ACADEMY: AcademyTopic[] = [
  {
    title: 'Governance Assessment Concepts',
    icon: '🎓',
    summary: 'What a governance assessment is, and what it is not: it measures whether governance activity happened and holds up to scrutiny — never whether the underlying AI system performed well technically.',
    keyPoints: [
      'An assessment is a structured, evidenced judgment — not a technical performance benchmark.',
      'OMG assessments are advisory: a low score informs a human decision, it never blocks one.',
      'Every assessment belongs to exactly one playbook (Effectiveness, Maturity, ROI, Benchmarking, or Regulatory Readiness) — see the Playbooks page for which applies.',
    ],
  },
  {
    title: 'Scoring Methodology',
    icon: '🧮',
    summary: 'All ten standardized categories share one 1-5 scale (Reactive through Optimized) so a score means the same thing regardless of who gave it or which category it describes.',
    keyPoints: [
      'Ten categories, one scale — see the Calibration Library\'s Scoring Templates.',
      'A score is a judgment about the process, not the outcome — a process can be Optimized even after a bad outcome, if it was followed correctly.',
      'Weighting is equal across categories by default; a documented, deliberate reason is required before weighting one higher.',
    ],
  },
  {
    title: 'Evidence Expectations',
    icon: '📄',
    summary: 'Every score should be traceable to a specific, named piece of evidence — a document, a record, a dated review — not a general impression.',
    keyPoints: [
      'Cite the evidence in the assessment\'s notes field, not just in memory.',
      'If no evidence exists for a category, the honest score is low, not "unknown."',
      'Evidence that has expired counts the same as evidence that never existed.',
    ],
  },
  {
    title: 'Assessment Workflow',
    icon: '🔁',
    summary: 'Select the asset and playbook, review the recommended prompts, score each of the ten categories, and record supporting notes — in that order.',
    keyPoints: [
      'Read the playbook\'s Evaluation Criteria before scoring, not after.',
      'Use the Prompt Library\'s questions to challenge your own first instinct on a score.',
      'Record the assessment even when every category is a 5 — a complete record is itself evidence of a mature process.',
    ],
  },
  {
    title: 'Calibration Examples',
    icon: '📚',
    summary: 'The Calibration Library exists so two different assessors, looking at a similar scenario, land on similar scores for similar reasons.',
    keyPoints: [
      'These are calibration examples, not benchmark standards — they show reasoning, not a target.',
      'Read the score explanation, not just the score — the reasoning is what transfers to your own assessment.',
      'A real asset rarely matches an example exactly; use it to calibrate judgment, not to look up an answer.',
    ],
  },
  {
    title: 'Variance Interpretation',
    icon: '📊',
    summary: 'Variance analysis reports observed dispersion in recorded scores — it does not define what dispersion is acceptable, because no fixed threshold has been formally approved.',
    keyPoints: [
      'High variance across assessors scoring the same asset suggests the rubric was applied inconsistently — a rubric-clarity problem, not necessarily an asset problem.',
      'High variance across assets in the portfolio may be entirely legitimate — different assets carry different risk and maturity.',
      'Do not treat a variance number as a pass/fail gate; it is a prompt to ask why, not a verdict.',
    ],
  },
  {
    title: 'Best Practices',
    icon: '✅',
    summary: 'A handful of habits that most reduce assessment inconsistency in practice.',
    keyPoints: [
      'Score against the written rubric, not against how the last asset felt.',
      'When in doubt between two adjacent levels, score the lower one and note why — optimism compounds across a portfolio.',
      'Re-assess on a fixed cadence, not only when something goes wrong.',
    ],
  },
];
