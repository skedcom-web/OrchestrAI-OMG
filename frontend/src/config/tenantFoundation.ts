/**
 * OMG Release 16 — Tenant Awareness Foundation.
 *
 * Prepares the data architecture for future customer onboarding while
 * keeping today's single-tenant demo operation unchanged. The Tenant
 * Context Service always resolves to the Demo Tenant today — no tenant
 * switching, tenant-specific security isolation, or tenant-scoped data
 * partitioning is introduced in this release (see the Release 15-17 Master
 * Blueprint's "Explicit Out of Scope" section). Bank Alpha and Insurance
 * Beta below are illustrative seed records only — no live customer data.
 *
 * Release 18+ recommendation (recorded, not yet actioned): `id` here is a
 * stable, hand-authored string, adequate for seeded, read-only registries.
 * Once real Tenant creation/isolation is introduced, adopt
 * `crypto.randomUUID()` as the canonical internal identifier and keep
 * human-readable codes like `tnt-bank-alpha` as a separate display/reference
 * field. Future governance entities (Assets, Evidence, Findings,
 * Certifications, Reassessments, etc.) should reference this Tenant
 * abstraction rather than assuming a single global data set, so isolation
 * can be introduced later with minimal refactoring.
 */
import type { TenantRecord } from '../types';

export const TENANT_REGISTRY: TenantRecord[] = [
  {
    id: 'tnt-demo',
    name: 'Demo Tenant',
    status: 'Active',
    description: 'The single shared tenant every persona and seeded record in OMG operates under today.',
    industry: 'Cross-Industry Demonstration',
    environmentTier: 'DEV',
    createdAt: '2024-01-15',
  },
  {
    id: 'tnt-bank-alpha',
    name: 'Bank Alpha',
    status: 'Planned',
    description: 'Illustrative future banking tenant, for demonstration purposes only — no live data.',
    industry: 'Banking',
    environmentTier: 'DEV',
    createdAt: '2026-09-11',
  },
  {
    id: 'tnt-insurance-beta',
    name: 'Insurance Beta',
    status: 'Planned',
    description: 'Illustrative future insurance tenant, for demonstration purposes only — no live data.',
    industry: 'Insurance',
    environmentTier: 'DEV',
    createdAt: '2026-09-11',
  },
];

export function getTenants(): TenantRecord[] {
  return TENANT_REGISTRY;
}

/** Tenant Context Service — resolves the tenant the current session runs under. Always the Demo Tenant today; the real seam future per-request tenant resolution plugs into. */
export function getCurrentTenant(): TenantRecord {
  return TENANT_REGISTRY.find(t => t.status === 'Active') || TENANT_REGISTRY[0];
}
