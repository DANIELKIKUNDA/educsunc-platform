const { mkdirSync } = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.join(__dirname, '..');
const coverageEnabled = process.argv.includes('--coverage');
const tests = [
  'src/app/tests/health.routes.test.ts',
  'src/app/tests/http-route-authentication-policy.test.ts',
  'src/app/tests/journalisation.plugin.test.ts',
  'src/app/tests/observabilite-http.plugin.test.ts',
  'src/app/tests/observability-deployment.test.ts',
  'src/app/tests/openapi.plugin.test.ts',
];
const args = ['--import', 'tsx', '--test', '--test-force-exit'];

if (coverageEnabled) {
  const coverageDirectory = path.join(projectRoot, 'coverage', 'observability');
  mkdirSync(coverageDirectory, { recursive: true });
  args.push(
    '--experimental-test-coverage',
    '--test-coverage-include=src/app/plugins/journalisation.plugin.ts',
    '--test-coverage-include=src/app/plugins/observabilite-http.plugin.ts',
    '--test-coverage-include=src/app/plugins/openapi.plugin.ts',
    '--test-coverage-include=src/app/routes/health.routes.ts',
    '--test-coverage-include=src/app/security/HttpRouteAuthenticationPolicy.ts',
    '--test-coverage-include=src/shared/infrastructure/logger/PinoLogger.ts',
    '--test-coverage-lines=80',
    '--test-coverage-functions=80',
    '--test-coverage-branches=75',
    '--test-reporter=spec',
    '--test-reporter-destination=stdout',
    '--test-reporter=lcov',
    `--test-reporter-destination=${path.join(coverageDirectory, 'lcov.info')}`,
  );
}

args.push(...tests);

const result = spawnSync(process.execPath, args, {
  stdio: 'inherit',
  cwd: projectRoot,
  env: {
    ...process.env,
    APP_ENV: 'test',
  },
});

if (typeof result.status !== 'number') {
  console.error('Le lanceur des tests d observabilite n a pas retourne de code de sortie.');
  if (result.error) console.error(result.error);
  process.exit(1);
}

process.exit(result.status);
