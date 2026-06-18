const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

// Ce script lance tous les tests globaux du backend places dans src/tests.
function collectSpecFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSpecFiles(fullPath));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.spec.ts') || entry.name.endsWith('.test.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

const testsRoot = path.join(__dirname, '..', 'src', 'tests');
const specFiles = collectSpecFiles(testsRoot);

if (specFiles.length === 0) {
  console.error('Aucun test global src/tests n a ete trouve.');
  process.exit(1);
}

const tsxCliPath = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');
const result = spawnSync(process.execPath, [tsxCliPath, '--test', ...specFiles], {
  stdio: 'inherit',
  cwd: path.join(__dirname, '..'),
});

if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests globaux n a pas retourne de code de sortie.');
  if (result.error) {
    console.error(result.error);
  }
  process.exit(1);
}

process.exit(result.status);
