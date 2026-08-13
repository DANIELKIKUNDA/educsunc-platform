const path = require('node:path');
const { spawnSync } = require('node:child_process');

const tsxCliPath = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const testPath = path.join(__dirname, '..', 'src', 'shared', 'audit', 'tests', 'integration', 'AuditL5Postgres.integration.test.ts');
const result = spawnSync(process.execPath, [tsxCliPath, '--test', testPath], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: { ...process.env, EDUCSYN_AUDIT_L5_POSTGRES_TESTS: '1' },
});
process.exit(typeof result.status === 'number' ? result.status : 1);
