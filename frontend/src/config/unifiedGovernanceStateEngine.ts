/**
 * OMG Release 19 — Domain D: Unified Governance State Engine.
 *
 * Superseded under Release 19.1 — Governance State Harmonisation. The
 * original three-signal composition here (Governability + Reliance Basis +
 * AGP) was itself circular once Reauthorisation needed to be a fourth
 * input signal — Reauthorisation depended on this engine's output, and
 * this engine would have needed Reauthorisation's output. The Governance
 * State Resolution Layer (`governanceStateResolutionLayer.ts`) replaces it:
 * same six canonical states, same "advisory only" posture, but resolved
 * from six raw signal providers directly (Authority Currency, Reliance
 * Basis, Evidence Sufficiency, Admissibility, Reauthorisation, Governance
 * Continuity) rather than through a pre-composed intermediate.
 *
 * Kept only so nothing importing the old name breaks; storageService.ts no
 * longer calls this — it calls `resolveGovernanceState` directly.
 */
export { resolveGovernanceState as computeUnifiedGovernanceState } from './governanceStateResolutionLayer';
