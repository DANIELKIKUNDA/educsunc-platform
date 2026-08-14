import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const frontendUrl = process.env.EDUCSYN_FRONTEND_URL ?? 'http://127.0.0.1:4174';
const backendUrl = process.env.EDUCSYN_BACKEND_URL ?? 'http://127.0.0.1:3000';
const frontendRoot = path.resolve(__dirname, '../..');
const repositoryRoot = path.resolve(frontendRoot, '..');

export default defineConfig({
  testDir: '.',
  testMatch: 'monitoring.e2e.spec.ts',
  globalSetup: require.resolve('../g1/global-setup'),
  outputDir: path.join(frontendRoot, 'artifacts', 'monitoring-playwright-results'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['line'], ['html', { open: 'never', outputFolder: path.join(frontendRoot, 'artifacts', 'monitoring-playwright-report') }]],
  use: { ...devices['Desktop Chrome'], baseURL: frontendUrl, trace: 'retain-on-failure', screenshot: 'only-on-failure', video: 'retain-on-failure', viewport: { width: 1440, height: 1000 } },
  webServer: [
    { command: 'npm run start', cwd: path.join(repositoryRoot, 'backend'), env: { ...process.env, APP_ENV: 'development', NODE_ENV: 'development', EDUCSYN_REDIS_MODE: process.env.EDUCSYN_MONITORING_E2E_REDIS_MODE ?? 'simulation' }, url: `${backendUrl}/api/auth/initialisation`, reuseExistingServer: !process.env.CI, timeout: 420_000, stdout: 'ignore', stderr: 'pipe' },
    { command: 'npm run dev -- --host 127.0.0.1', cwd: frontendRoot, env: { ...process.env, VITE_API_URL: backendUrl, VITE_AUTH_ENTRY_MODE: 'developer' }, url: frontendUrl, reuseExistingServer: !process.env.CI, timeout: 120_000, stdout: 'ignore', stderr: 'pipe' },
  ],
});
