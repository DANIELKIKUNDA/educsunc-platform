const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function collectTestFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'support' && entry.name !== 'fixtures' && entry.name !== 'factories') {
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
const testsRoot = path.join(projectRoot, 'src', 'shared', 'monitoring', 'tests');
const testFiles = collectTestFiles(testsRoot);
const realtimeMonitoringTest = path.join(projectRoot, 'src', 'shared', 'realtime', 'tests', 'integration', 'MonitoringIntegrationRealtime.spec.ts');
if (fs.existsSync(realtimeMonitoringTest)) testFiles.push(realtimeMonitoringTest);
testFiles.sort();
if (testFiles.length === 0) {
  console.error('Aucun test shared/monitoring/tests n a ete trouve.');
  process.exit(1);
}
const tsxCliPath = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const testEnvironment = {
  ...process.env,
  EDUCSYN_REDIS_MODE: process.env.EDUCSYN_MONITORING_TEST_REDIS_MODE ?? 'simulation',
};
const preparationScript = path.join(
  projectRoot,
  'src',
  'scripts',
  'monitoring',
  'PreparerTestsMonitoring.ts',
);
const preparation = spawnSync(process.execPath, [tsxCliPath, preparationScript], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: testEnvironment,
});
if (preparation.status !== 0) {
  console.error('La preparation PostgreSQL des tests Monitoring a echoue.');
  process.exit(typeof preparation.status === 'number' ? preparation.status : 1);
}
const result = spawnSync(process.execPath, [tsxCliPath, '--test', '--test-concurrency=4', ...testFiles], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: testEnvironment,
});
if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests Monitoring n a pas retourne de code de sortie.');
  if (result.error) console.error(result.error);
  process.exit(1);
}
process.exit(result.status);
