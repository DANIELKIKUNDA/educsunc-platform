const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function collectTestFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectTestFiles(fullPath));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

const testsRoot = path.join(__dirname, '..', 'src', 'shared', 'audit', 'tests');
const testFiles = collectTestFiles(testsRoot);

if (testFiles.length === 0) {
  console.error('Aucun test shared/audit/tests n a ete trouve.');
  process.exit(1);
}

const tsxCliPath = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const result = spawnSync(process.execPath, [tsxCliPath, '--test', ...testFiles], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests Audit n a pas retourne de code de sortie.');
  if (result.error) {
    console.error(result.error);
  }
  process.exit(1);
}

process.exit(result.status);
