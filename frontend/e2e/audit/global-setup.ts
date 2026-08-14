import type { FullConfig } from '@playwright/test';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import g1GlobalSetup from '../g1/global-setup';

export default async function auditGlobalSetup(config: FullConfig): Promise<void> {
  await g1GlobalSetup(config);
  const frontendRoot = path.resolve(__dirname, '../..');
  const backendRoot = path.resolve(frontendRoot, '../backend');
  const result = spawnSync(
    process.execPath,
    [
      '--require',
      './scripts/load-optional-local-env.cjs',
      '--import',
      'tsx',
      'scripts/prepare-audit-e2e-dataset.ts',
    ],
    {
      cwd: backendRoot,
      env: process.env,
      encoding: 'utf8',
      timeout: 120_000,
    },
  );
  if (result.status !== 0) {
    throw new Error(
      `L6_AUDIT_DATASET_ECHOUE: ${result.stderr || result.stdout || result.error?.message || 'cause inconnue'}`,
    );
  }
}
