const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.join(__dirname, '..');
const tests = [
  'src/app/tests/arret-gracieux.test.ts',
  'src/app/tests/cors.frontend.test.ts',
  'src/app/tests/http-route-authentication-policy.test.ts',
  'src/app/tests/http-security.plugin.test.ts',
];
const tsxCliPath = path.join(projectRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const result = spawnSync(process.execPath, [tsxCliPath, '--test', ...tests], {
  stdio: 'inherit',
  cwd: projectRoot,
  env: {
    ...process.env,
    APP_ENV: 'test',
  },
});

if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests HTTP transverses n a pas retourne de code de sortie.');
  if (result.error) console.error(result.error);
  process.exit(1);
}

process.exit(result.status);
