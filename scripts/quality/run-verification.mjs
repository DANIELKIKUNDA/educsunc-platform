import path from 'node:path';
import {
  qualityArtifacts,
  repositoryRoot,
  runNode,
  runNpm,
  runNpmCli,
  runParallel,
  runRootNpm,
  writeJson,
} from './lib/runner.mjs';

const mode = process.argv[2];
const component = process.argv[3];
const validModes = new Set(['fast', 'code', 'security', 'e2e', 'performance', 'all']);
if (!validModes.has(mode)) {
  throw new Error(`Vérification inconnue : ${mode ?? 'aucune'}.`);
}

const reportFile = path.join(qualityArtifacts, mode, 'summary.json');

function rootLint() {
  return runRootNpm('eslint', 'lint');
}

function backendTypecheck() {
  return runNpm('typecheck-backend', 'backend', 'typecheck:strict');
}

function frontendTypecheck() {
  return runNpmCli('typecheck-frontend', ['exec', 'vue-tsc', '--', '--noEmit'], {
    cwd: path.join(repositoryRoot, 'frontend'),
  });
}

async function verifyFast() {
  return runParallel('Vérification rapide', [
    () => runNode(
      'secrets-index',
      path.join(repositoryRoot, 'scripts', 'quality', 'verify-secrets.mjs'),
      ['staged'],
    ),
    rootLint,
    backendTypecheck,
    frontendTypecheck,
  ]);
}

async function verifyCode() {
  const results = [];
  results.push(...await runParallel('Qualité statique', [
    rootLint,
    backendTypecheck,
    frontendTypecheck,
  ]));
  results.push(...await runParallel('Tests automatisés', [
    () => runNpm('tests-backend-globaux', 'backend', 'test:global'),
    () => runNpm('tests-backend-sécurité', 'backend', 'test:security'),
    () => runNpm('tests-backend-audit', 'backend', 'test:audit'),
    () => runNpm('tests-backend-ci', 'backend', 'test:ci'),
    () => runNpm('couverture-backend-observabilite', 'backend', 'test:coverage'),
    () => runNpm('tests-frontend', 'frontend', 'test'),
  ]));
  results.push(...await runParallel('Compilations', [
    () => runNpm('build-backend', 'backend', 'build'),
    () => runNpm('build-frontend', 'frontend', 'build'),
  ]));
  results.push(await runNode(
    'tests-postgresql-isolés',
    path.join(repositoryRoot, 'scripts', 'quality', 'verify-postgres.mjs'),
  ));
  return results;
}

async function verifySecurity() {
  return [await runNode(
    'sécurité',
    path.join(repositoryRoot, 'scripts', 'quality', 'run-security.mjs'),
    component ? [component] : [],
  )];
}

async function verifyE2e() {
  return [await runNpm('certification-e2e', 'backend', 'certification:security')];
}

async function verifyPerformance() {
  return [await runNode(
    'performance',
    path.join(repositoryRoot, 'scripts', 'quality', 'run-performance.mjs'),
  )];
}

const verifiers = {
  fast: verifyFast,
  code: verifyCode,
  security: verifySecurity,
  e2e: verifyE2e,
  performance: verifyPerformance,
};

async function verifyAll() {
  const results = [];
  for (const step of ['code', 'security', 'e2e', 'performance']) {
    process.stdout.write(`\n\n######## ${step.toUpperCase()} ########\n`);
    results.push(...await verifiers[step]());
  }
  return results;
}

const startedAt = new Date();
let status = 'passed';
let results = [];
let failure;

try {
  results = mode === 'all' ? await verifyAll() : await verifiers[mode]();
} catch (error) {
  status = 'failed';
  failure = error;
  if (error.verificationResult) results.push(error.verificationResult);
  if (error.verificationResults) results.push(...error.verificationResults);
} finally {
  const finishedAt = new Date();
  writeJson(reportFile, {
    verification: mode,
    status,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    results,
  });
}

if (failure) throw failure;
