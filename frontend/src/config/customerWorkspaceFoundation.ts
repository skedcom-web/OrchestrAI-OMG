/**
 * OMG Release 17 — Customer Workspace Foundation.
 *
 * Separates common OMG platform capability from customer-specific
 * extensions, so future ODF-driven customization has a real seam to plug
 * into instead of forcing changes into platform code. Workspaces,
 * extensions, blueprints and configuration entries below are illustrative
 * reference data — no customer-specific integration, workflow engine, or
 * runtime capability is implemented in this release (see the Release 15-17
 * Master Blueprint's "Explicit Out of Scope" section).
 *
 * Readiness below follows the same "informs, never blocks" convention as
 * computeGovernanceReadiness in readinessFoundation.ts — descriptive only.
 *
 * Release 18+ recommendation (recorded, not yet actioned): `id` here is a
 * stable, hand-authored string, adequate for seeded, read-only registries.
 * Once real Customer Workspace creation/onboarding is introduced, adopt
 * `crypto.randomUUID()` as the canonical internal identifier and keep
 * human-readable codes like `wsp-banking` as a separate display/reference
 * field, consistent with the same recommendation recorded in
 * environmentFoundation.ts and tenantFoundation.ts.
 */
import type {
  CustomerWorkspaceRecord,
  CustomerExtensionCatalogEntry,
  CustomerSolutionBlueprint,
  CustomerConfigurationEntry,
  CustomerReadinessStatus,
} from '../types';

export const CUSTOMER_WORKSPACE_REGISTRY: CustomerWorkspaceRecord[] = [
  { id: 'wsp-banking', name: 'Banking', industry: 'Banking', status: 'Planned', description: 'Illustrative workspace for a future banking customer engagement.', tenantId: 'tnt-bank-alpha', createdAt: '2026-09-11' },
  { id: 'wsp-insurance', name: 'Insurance', industry: 'Insurance', status: 'Planned', description: 'Illustrative workspace for a future insurance customer engagement.', tenantId: 'tnt-insurance-beta', createdAt: '2026-09-11' },
  { id: 'wsp-telecom', name: 'Telecom', industry: 'Telecom', status: 'Planned', description: 'Illustrative workspace for a future telecom customer engagement.', createdAt: '2026-09-11' },
];

export const CUSTOMER_EXTENSION_CATALOG: CustomerExtensionCatalogEntry[] = [
  { id: 'ext-sso', name: 'Identity Provider Integration', category: 'Identity', description: "Bind OMG RBAC roles to a customer's real identity provider (e.g. Entra ID, Okta).", deliveryLayer: 'ODF Implementation' },
  { id: 'ext-webhook', name: 'Governance Event Webhook', category: 'Integration', description: "Notify a customer's own tooling (ITSM, monitoring) when a governance state changes.", deliveryLayer: 'ODF Implementation' },
  { id: 'ext-approval-chain', name: 'Multi-Step Approval Chain', category: 'Workflow', description: "Organization-specific, multi-step approval routing beyond OMG's single decision-point model.", deliveryLayer: 'ODF Implementation' },
  { id: 'ext-regulatory-pack', name: 'Industry Regulatory Pack', category: 'Regulatory Pack', description: "Pre-mapped regulatory content for a specific industry, authored into OMG's existing compliance pack structure.", deliveryLayer: 'ODF Implementation' },
  { id: 'ext-custom-report', name: 'Custom Executive Report', category: 'Reporting', description: "A bespoke report layout for a specific customer's board or regulator.", deliveryLayer: 'Customer-Specific' },
];

export const CUSTOMER_SOLUTION_BLUEPRINTS: CustomerSolutionBlueprint[] = [
  { id: 'bp-banking-onboarding', workspaceId: 'wsp-banking', name: 'Banking Onboarding Blueprint', summary: 'Reference sequence for onboarding a banking customer: risk classification alignment, regulatory pack mapping, approval chain configuration.', status: 'Reference' },
  { id: 'bp-insurance-onboarding', workspaceId: 'wsp-insurance', name: 'Insurance Onboarding Blueprint', summary: 'Reference sequence for onboarding an insurance customer: claims-AI risk tiering, evidence requirements, certification program setup.', status: 'Reference' },
  { id: 'bp-telecom-onboarding', workspaceId: 'wsp-telecom', name: 'Telecom Onboarding Blueprint', summary: 'Reference sequence for onboarding a telecom customer: network-AI asset registration, tool governance, incident response alignment.', status: 'Reference' },
];

export const CUSTOMER_CONFIGURATION_LAYER: CustomerConfigurationEntry[] = [
  { id: 'cfg-banking-thresholds', workspaceId: 'wsp-banking', configArea: 'Risk Thresholds', description: 'Risk classification thresholds tuned to banking regulatory expectations.', status: 'Not Configured' },
  { id: 'cfg-insurance-thresholds', workspaceId: 'wsp-insurance', configArea: 'Risk Thresholds', description: 'Risk classification thresholds tuned to insurance regulatory expectations.', status: 'Not Configured' },
  { id: 'cfg-telecom-thresholds', workspaceId: 'wsp-telecom', configArea: 'Risk Thresholds', description: 'Risk classification thresholds tuned to telecom operational risk.', status: 'Not Configured' },
];

export function getCustomerWorkspaces(): CustomerWorkspaceRecord[] {
  return CUSTOMER_WORKSPACE_REGISTRY;
}

export function getCustomerExtensionCatalog(): CustomerExtensionCatalogEntry[] {
  return CUSTOMER_EXTENSION_CATALOG;
}

export function getCustomerSolutionBlueprints(workspaceId?: string): CustomerSolutionBlueprint[] {
  return workspaceId ? CUSTOMER_SOLUTION_BLUEPRINTS.filter(b => b.workspaceId === workspaceId) : CUSTOMER_SOLUTION_BLUEPRINTS;
}

export function getCustomerConfigurationLayer(workspaceId?: string): CustomerConfigurationEntry[] {
  return workspaceId ? CUSTOMER_CONFIGURATION_LAYER.filter(c => c.workspaceId === workspaceId) : CUSTOMER_CONFIGURATION_LAYER;
}

/** Customer Readiness Dashboard — descriptive only, never blocks. */
export function computeCustomerWorkspaceReadiness(workspaceId: string): CustomerReadinessStatus {
  const config = getCustomerConfigurationLayer(workspaceId);
  const blueprints = getCustomerSolutionBlueprints(workspaceId);
  if (blueprints.length === 0) return 'Not Ready';
  const configured = config.filter(c => c.status === 'Configured').length;
  if (config.length > 0 && configured === config.length) return 'Ready';
  if (configured > 0) return 'Partially Ready';
  return 'Not Ready';
}
