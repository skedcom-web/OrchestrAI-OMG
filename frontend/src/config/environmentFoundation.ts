/**
 * OMG Release 15 — Environment Management Foundation.
 *
 * Establishes the architecture for DEV / QA / PROD environment separation
 * without redesigning anything that exists today. DEV is the current,
 * fully-seeded Neon-hosted environment this app already runs on; QA and
 * PROD are prepared as placeholders carrying no live data.
 *
 * No production hardening, real environment isolation, or actual data-source
 * switching is introduced in this release (see the Release 15-17 Master
 * Blueprint's "Explicit Out of Scope" section). Selecting QA or PROD in the
 * Environment Selector previews that environment's planned metadata only —
 * it never changes which data source the running app actually reads from.
 *
 * Release 18+ recommendation (recorded, not yet actioned): `id` here is a
 * stable, hand-authored string, adequate for seeded, read-only registries.
 * Once real Environment creation/isolation is introduced, adopt
 * `crypto.randomUUID()` as the canonical internal identifier and keep
 * human-readable codes like `env-dev` as a separate display/reference field.
 */
import type { EnvironmentRecord, EnvironmentTier } from '../types';

export const ENVIRONMENT_REGISTRY: EnvironmentRecord[] = [
  {
    id: 'env-dev',
    tier: 'DEV',
    name: 'Development (Seeded Demo)',
    status: 'Active',
    description: 'The current Neon-hosted, fully seeded environment every OMG evaluator explores today.',
    seedStatus: 'Fully Seeded',
    health: 'Healthy',
    createdAt: '2024-01-15',
  },
  {
    id: 'env-qa',
    tier: 'QA',
    name: 'Quality Assurance',
    status: 'Planned',
    description: 'Reserved for future pre-production validation once a customer engagement requires it.',
    seedStatus: 'Not Applicable',
    health: 'Not Provisioned',
    createdAt: '2026-09-11',
  },
  {
    id: 'env-prod',
    tier: 'PROD',
    name: 'Production',
    status: 'Planned',
    description: 'Reserved for a live customer deployment, delivered through ODF onboarding.',
    seedStatus: 'Not Applicable',
    health: 'Not Provisioned',
    createdAt: '2026-09-11',
  },
];

export function getEnvironments(): EnvironmentRecord[] {
  return ENVIRONMENT_REGISTRY;
}

export function getEnvironmentByTier(tier: EnvironmentTier): EnvironmentRecord | undefined {
  return ENVIRONMENT_REGISTRY.find(e => e.tier === tier);
}

/** The environment the running app is actually backed by today — always DEV until a real Production release exists. */
export function getActiveEnvironment(): EnvironmentRecord {
  return ENVIRONMENT_REGISTRY.find(e => e.status === 'Active') || ENVIRONMENT_REGISTRY[0];
}
