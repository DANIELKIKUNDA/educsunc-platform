import { defineConfig, devices } from '@playwright/test';
import path from 'node:path';

const frontendRoot = path.resolve(__dirname, '../..');
const frontendUrl = process.env.EDUCSYN_OFFLINE_FRONTEND_URL ?? 'http://127.0.0.1:4187';

export default defineConfig({
  testDir: '.',
  testMatch: 'offline-shell.spec.ts',
  outputDir: path.join(frontendRoot, 'artifacts', 'offline-playwright-results'),
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [['line']],
  use: {
    ...devices['Desktop Chrome'],
    channel: process.env.CI ? undefined : 'chrome',
    baseURL: frontendUrl,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4187',
    cwd: frontendRoot,
    url: frontendUrl,
    reuseExistingServer: false,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
