const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

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

const testsRoot = path.join(__dirname, '..', 'src', 'shared', 'tests', 'workflows');
const specFiles = collectSpecFiles(testsRoot);
const projectRoot = path.join(__dirname, '..');

if (specFiles.length === 0) {
  console.error('Aucun test de workflow partage n a ete trouve.');
  process.exit(1);
}

const tsxCliPath = path.join(__dirname, '..', 'node_modules', 'tsx', 'dist', 'cli.mjs');

for (const specFile of specFiles) {
  const specPath = path.relative(projectRoot, specFile);
  const result = spawnSync(process.execPath, [tsxCliPath, '--test', specPath], {
    stdio: 'inherit',
    cwd: projectRoot,
  });

  if (typeof result.status !== 'number') {
    console.error(`Le lanceur des tests de workflows n a pas retourne de code de sortie pour ${specPath}.`);
    if (result.error) {
      console.error(result.error);
    }
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status);
  }
}
