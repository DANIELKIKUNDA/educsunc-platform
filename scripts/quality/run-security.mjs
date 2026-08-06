import fs from 'node:fs';
import path from 'node:path';
import {
  ensureDirectory,
  qualityArtifacts,
  repositoryRoot,
  runCommand,
  runNpmCli,
  runNode,
  runParallel,
  writeJson,
} from './lib/runner.mjs';

const requestedComponent = process.argv[2] ?? 'all';
const validComponents = new Set(['all', 'dependencies', 'semgrep', 'gitleaks', 'trivy']);
if (!validComponents.has(requestedComponent)) {
  throw new Error(`Composant de sécurité inconnu : ${requestedComponent}.`);
}

const reportDirectory = path.join(qualityArtifacts, 'security');
ensureDirectory(reportDirectory);

function resolveCommand(name) {
  return process.platform === 'win32' ? `${name}.exe` : name;
}

async function runDependencies() {
  const audits = await runParallel('Dépendances', [
    () => runNpmCli('audit-backend', ['audit', '--audit-level=high', '--json'], {
      cwd: path.join(repositoryRoot, 'backend'),
      outputFile: path.join(reportDirectory, 'npm-audit-backend.json'),
    }),
    () => runNpmCli('audit-frontend', ['audit', '--audit-level=high', '--json'], {
      cwd: path.join(repositoryRoot, 'frontend'),
      outputFile: path.join(reportDirectory, 'npm-audit-frontend.json'),
    }),
  ]);
  return audits;
}

async function runSemgrep() {
  const targets = ['backend/src', 'frontend/src', 'scripts'];
  const advisory = await runCommand({
    id: 'semgrep-advisory',
    command: resolveCommand('semgrep'),
    args: [
      'scan',
      '--config',
      '.semgrep.yml',
      '--metrics=off',
      '--json-output',
      path.join(reportDirectory, 'semgrep.json'),
      '--sarif-output',
      path.join(reportDirectory, 'semgrep.sarif'),
      ...targets,
    ],
  });
  const blocking = await runCommand({
    id: 'semgrep-blocking',
    command: resolveCommand('semgrep'),
    args: [
      'scan',
      '--config',
      '.semgrep.yml',
      '--severity',
      'ERROR',
      '--error',
      '--metrics=off',
      '--json-output',
      path.join(reportDirectory, 'semgrep-blocking.json'),
      '--sarif-output',
      path.join(reportDirectory, 'semgrep-blocking.sarif'),
      ...targets,
    ],
  });
  return [advisory, blocking];
}

async function runGitleaks() {
  return runCommand({
    id: 'gitleaks',
    command: resolveCommand('gitleaks'),
    args: [
      'git',
      '.',
      '--config',
      '.gitleaks.toml',
      '--redact',
      '--report-format',
      'json',
      '--report-path',
      path.join(reportDirectory, 'gitleaks.json'),
    ],
  });
}

async function runTrivy() {
  return runParallel('Trivy', [
    () => runCommand({
      id: 'trivy-fs',
      command: resolveCommand('trivy'),
      args: [
        'fs',
        '--config',
        'trivy.yaml',
        '--format',
        'json',
        '--output',
        path.join(reportDirectory, 'trivy-fs.json'),
        '.',
      ],
    }),
    () => runCommand({
      id: 'trivy-config',
      command: resolveCommand('trivy'),
      args: [
        'config',
        '--config',
        'trivy.yaml',
        '--format',
        'json',
        '--output',
        path.join(reportDirectory, 'trivy-config.json'),
        '.',
      ],
    }),
  ]);
}

const runners = {
  dependencies: runDependencies,
  semgrep: runSemgrep,
  gitleaks: runGitleaks,
  trivy: runTrivy,
};

const startedAt = new Date();
const results = [];
let status = 'passed';
let failure;

try {
  if (requestedComponent === 'all' || requestedComponent === 'dependencies') {
    results.push(await runNode(
      'vérification-pinning-ci',
      path.join(repositoryRoot, 'scripts', 'quality', 'verify-ci-pinning.mjs'),
    ));
  }
  if (requestedComponent === 'all' || requestedComponent === 'gitleaks') {
    results.push(await runNode(
      'détection-secrets-suivis',
      path.join(repositoryRoot, 'scripts', 'quality', 'verify-secrets.mjs'),
      ['tracked'],
    ));
  }

  const components = requestedComponent === 'all'
    ? Object.keys(runners)
    : [requestedComponent];
  for (const component of components) {
    const componentResult = await runners[component]();
    results.push(...(Array.isArray(componentResult) ? componentResult : [componentResult]));
  }
} catch (error) {
  status = 'failed';
  failure = error;
  if (error.verificationResult) results.push(error.verificationResult);
  if (error.verificationResults) results.push(...error.verificationResults);
} finally {
  const finishedAt = new Date();
  writeJson(path.join(reportDirectory, 'report.json'), {
    verification: 'security',
    component: requestedComponent,
    status,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    results,
    noteImage: fs.existsSync(path.join(repositoryRoot, 'Dockerfile'))
      ? 'Le contrôle de l’image est traité par la CI après construction.'
      : 'Aucune image de production n’existe encore : contrôle d’image non applicable.',
  });
}

if (failure) {
  const message = failure.code === 'ENOENT'
    ? `${failure.path ?? 'Un outil de sécurité'} est absent. Installez les outils officiels avant de relancer verify:security.`
    : failure.message;
  throw new Error(message, { cause: failure });
}
