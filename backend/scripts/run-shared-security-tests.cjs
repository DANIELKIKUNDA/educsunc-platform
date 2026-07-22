const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function collectTestFiles(directory) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'support') files.push(...collectTestFiles(fullPath));
      continue;
    }

    if (entry.isFile() && (entry.name.endsWith('.test.ts') || entry.name.endsWith('.spec.ts'))) {
      files.push(fullPath);
    }
  }

  return files;
}

const projectRoot = path.join(__dirname, '..');
const testsRoot = path.join(projectRoot, 'src', 'shared', 'security', 'tests');
const testFiles = collectTestFiles(testsRoot);

if (testFiles.length === 0) {
  console.error('Aucun test shared/security/tests n a ete trouve.');
  process.exit(1);
}

const tsxCliPath = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const result = spawnSync(process.execPath, [tsxCliPath, '--test', ...testFiles], {
  stdio: 'inherit',
  cwd: projectRoot,
});

if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests Security n a pas retourne de code de sortie.');
  if (result.error) console.error(result.error);
  process.exit(1);
}

process.exit(result.status);
