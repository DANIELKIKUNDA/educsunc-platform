const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.join(__dirname, '..');
const tsxCliPath = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const testFile = path.join(
  projectRoot,
  'src',
  'tests',
  'postgres',
  'notifications-persistence-postgres.integration.test.ts',
);
const result = spawnSync(process.execPath, [tsxCliPath, '--test', testFile], {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

process.exit(typeof result.status === 'number' ? result.status : 1);
