import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const frontendUrl = process.env.EDUCSYN_FRONTEND_URL ?? 'http://127.0.0.1:4174';
const backendUrl = process.env.EDUCSYN_BACKEND_URL ?? 'http://127.0.0.1:3000';
const frontendRoot = path.resolve(__dirname, '../..');
const repositoryRoot = path.resolve(frontendRoot, '..');

export default defineConfig({
  testDir: '.',
  testMatch: 'center-entry.e2e.spec.ts',
  globalSetup: require.resolve('../g1/global-setup'),
  outputDir: path.join(frontendRoot, 'artifacts', 'center-entry-playwright-results'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 20_000 },
  reporter: [['line']],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: frontendUrl,
    serviceWorkers: 'block',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: [
    {
      command: 'npm run start',
      cwd: path.join(repositoryRoot, 'backend'),
      env: {
        ...process.env,
        APP_ENV: 'development',
        NODE_ENV: 'development',
        EDUCSYN_REDIS_MODE: process.env.EDUCSYN_CENTER_ENTRY_E2E_REDIS_MODE ?? 'simulation',
      },
      url: `${backendUrl}/api/auth/initialisation`,
      reuseExistingServer: !process.env.CI,
      timeout: 420_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4174',
      cwd: frontendRoot,
      env: {
        ...process.env,
        VITE_API_URL: backendUrl,
        VITE_AUTH_ENTRY_MODE: 'developer',
      },
      url: frontendUrl,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
