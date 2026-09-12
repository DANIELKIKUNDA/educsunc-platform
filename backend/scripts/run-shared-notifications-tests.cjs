const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function collectTestFiles(directory) {
  const files = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!['support', 'fixtures', 'factories'].includes(entry.name)) {
        files.push(...collectTestFiles(fullPath));
      }
      continue;
    }
    if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts'))) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

const projectRoot = path.join(__dirname, '..');
const testsRoot = path.join(projectRoot, 'src', 'shared', 'notifications', 'tests');
const testFiles = collectTestFiles(testsRoot);
const realtimeTest = path.join(
  projectRoot,
  'src',
  'shared',
  'realtime',
  'tests',
  'integration',
  'NotificationsIntegrationRealtime.spec.ts',
);

if (fs.existsSync(realtimeTest)) testFiles.push(realtimeTest);
testFiles.sort();

if (testFiles.length === 0) {
  console.error('Aucun test shared/notifications/tests n a ete trouve.');
  process.exit(1);
}

const tsxCliPath = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const testEnvironment = {
  ...process.env,
  EDUCSYN_REDIS_MODE: process.env.EDUCSYN_NOTIFICATIONS_TEST_REDIS_MODE ?? 'simulation',
};
const result = spawnSync(
  process.execPath,
  [tsxCliPath, '--test', '--test-force-exit', '--test-concurrency=4', ...testFiles],
  {
    stdio: 'inherit',
    cwd: projectRoot,
    env: testEnvironment,
  },
);

if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests Notifications n a pas retourne de code de sortie.');
  if (result.error) console.error(result.error);
  process.exit(1);
}

process.exit(result.status);
