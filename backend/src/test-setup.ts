/**
 * Q1 Stabilization — Phase 5 (Test Automation) jest global setup.
 *
 * These integration tests run against the one live Neon database (no
 * separate test environment exists — see test/test-app.ts for the
 * tag-and-clean-up discipline every suite follows). Nothing global to
 * configure beyond the per-suite testTimeout already set in package.json's
 * jest config; this file exists because setupFilesAfterEnv requires one.
 */
