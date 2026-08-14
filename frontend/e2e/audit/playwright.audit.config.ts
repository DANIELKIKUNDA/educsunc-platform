import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const frontendUrl = process.env.EDUCSYN_FRONTEND_URL ?? 'http://127.0.0.1:4174';
const backendUrl = process.env.EDUCSYN_BACKEND_URL ?? 'http://127.0.0.1:3000';
const frontendRoot = path.resolve(__dirname, '../..');
const repositoryRoot = path.resolve(frontendRoot, '..');
const reuseLocalServices = !process.env.CI;

export default defineConfig({
  testDir: '.',
  testMatch: 'audit-platform.spec.ts',
  globalSetup: require.resolve('./global-setup'),
  outputDir: path.join(frontendRoot, 'artifacts', 'audit-playwright-results'),
  fullyParallel: false,
  workers: 1,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [['line'], ['html', { open: 'never', outputFolder: path.join(frontendRoot, 'artifacts', 'audit-playwright-report') }]],
  use: {
    ...devices['Desktop Chrome'],
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    viewport: { width: 1440, height: 1000 },
  },
  webServer: [
    {
      command: 'node --require ./scripts/load-optional-local-env.cjs --import tsx src/main.ts',
      cwd: path.join(repositoryRoot, 'backend'),
      env: { ...process.env, APP_ENV: 'development', NODE_ENV: 'development' },
      url: `${backendUrl}/api/auth/initialisation`,
      reuseExistingServer: reuseLocalServices,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
    {
      command: 'npm run dev -- --host 127.0.0.1 --port 4174',
      cwd: frontendRoot,
      env: { ...process.env, VITE_API_URL: backendUrl, VITE_AUTH_ENTRY_MODE: 'developer' },
      url: frontendUrl,
      reuseExistingServer: reuseLocalServices,
      timeout: 120_000,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  ],
});
