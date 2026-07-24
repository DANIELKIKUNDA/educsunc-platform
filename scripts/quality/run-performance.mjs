import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {
  ensureDirectory,
  qualityArtifacts,
  repositoryRoot,
  runCommand,
  writeJson,
} from './lib/runner.mjs';

const require = createRequire(path.join(repositoryRoot, 'backend', 'package.json'));
const { Pool } = require('pg');
const backendRoot = path.join(repositoryRoot, 'backend');
const reportDirectory = path.join(qualityArtifacts, 'performance');
const schema = `educsyn_performance_${process.pid}_${Date.now()}`.toLowerCase();
const port = Number(process.env.EDUCSYN_PERF_BACKEND_PORT ?? 3108);
const baseUrl = `http://127.0.0.1:${port}`;
const email = 'manager.performance@cert.educsyn.cd';
const motDePasse = 'Performance#2026!';
const organisationA = '73000000-0000-4000-8000-000000000001';
const organisationB = '73000000-0000-4000-8000-000000000002';

loadDotEnv(path.join(backendRoot, '.env'));
ensureDirectory(reportDirectory);

const database = {
  host: process.env.DB_HOST ?? '127.0.0.1',
  port: Number(process.env.DB_PORT ?? 5432),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'educsyn',
};

const adminPool = new Pool(database);
let backend;
const startedAt = new Date();
let status = 'passed';
let failure;
let k6Result;

try {
  await adminPool.query(`CREATE SCHEMA ${schema} AUTHORIZATION CURRENT_USER`);
  backend = startBackend();
  await waitForHealth(backend);
  await initializePlatform();
  await seedScopeData();

  k6Result = await runCommand({
    id: 'k6-baseline',
    command: process.platform === 'win32' ? 'k6.exe' : 'k6',
    args: [
      'run',
      '--summary-export',
      path.join(reportDirectory, 'summary-export.json'),
      path.join(repositoryRoot, 'performance', 'k6', 'quality-baseline.js'),
    ],
    env: {
      EDUCSYN_PERF_BASE_URL: baseUrl,
      EDUCSYN_PERF_EMAIL: email,
      EDUCSYN_PERF_PASSWORD: motDePasse,
      EDUCSYN_PERF_ORGANISATION_A: organisationA,
      EDUCSYN_PERF_ORGANISATION_B: organisationB,
      EDUCSYN_PERF_SUMMARY_PATH: path.join(reportDirectory, 'k6-summary.json'),
    },
    outputFile: path.join(reportDirectory, 'k6.log'),
  });
} catch (error) {
  status = 'failed';
  failure = error;
} finally {
  await stopTree(backend);
  await adminPool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`).catch(() => undefined);
  await adminPool.end();
  const finishedAt = new Date();
  writeJson(path.join(reportDirectory, 'report.json'), {
    verification: 'performance',
    status,
    schema,
    baseUrl,
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    durationMs: finishedAt.getTime() - startedAt.getTime(),
    result: k6Result,
  });
}

if (failure) throw failure;

function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, 'utf8').split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separator = line.indexOf('=');
    if (separator < 1) continue;
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function startBackend() {
  const child = spawn(process.execPath, ['--import', 'tsx', 'src/main.ts'], {
    cwd: backendRoot,
    detached: process.platform !== 'win32',
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
    env: {
      ...process.env,
      APP_ENV: 'development',
      NODE_ENV: 'development',
      HOST: '127.0.0.1',
      PORT: String(port),
      PGOPTIONS: `-c search_path=${schema}`,
      EDUCSYN_REDIS_MODE: 'simulation',
      EDUCSYN_REDIS_PREFIX: `educsyn:performance:${schema}`,
    },
  });
  const log = fs.createWriteStream(path.join(reportDirectory, 'backend.log'), { flags: 'a' });
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  return child;
}

async function waitForHealth(processToWatch) {
  const deadline = Date.now() + 300_000;
  let lastError = 'service indisponible';
  while (Date.now() < deadline) {
    if (processToWatch.exitCode !== null) {
      throw new Error(`Le backend de performance a quitte avec le code ${processToWatch.exitCode}.`);
    }
    try {
      const response = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(3000) });
      if (response.ok) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`Le backend de performance n est pas pret : ${lastError}.`);
}

async function initializePlatform() {
  const response = await fetch(`${baseUrl}/api/auth/initialisation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      nom: 'Manager',
      postnom: 'Performance',
      prenom: 'EduSync',
      email,
      motDePasse,
      confirmationMotDePasse: motDePasse,
      deviceId: 'performance-bootstrap',
    }),
  });
  if (![201, 409].includes(response.status)) {
    throw new Error(`Initialisation de la baseline refusee : HTTP ${response.status}.`);
  }
}

async function seedScopeData() {
  const pool = new Pool({ ...database, options: `-c search_path=${schema}` });
  const organisations = [
    [organisationA, 'PERF-ORG-A', 'Organisation Performance A'],
    [organisationB, 'PERF-ORG-B', 'Organisation Performance B'],
  ];
  const schools = [
    ['74000000-0000-4000-8000-000000000001', organisationA, 'PERF-ECOLE-A', 'Ecole Performance A'],
    ['74000000-0000-4000-8000-000000000002', organisationB, 'PERF-ECOLE-B', 'Ecole Performance B'],
  ];
  try {
    for (const [id, code, nom] of organisations) {
      await pool.query(
        `INSERT INTO organisations(id,code,nom,type_organisation,actif,description,cree_par,version)
         VALUES($1,$2,$3,'RESEAU',TRUE,'Perimetre isole de performance','performance-baseline',1)`,
        [id, code, nom],
      );
    }
    for (const [id, organisationId, code, nom] of schools) {
      await pool.query(
        `INSERT INTO ecoles(id,id_organisation,code,nom,sigle,mode_exploitation,actif,cree_par,version)
         VALUES($1,$2,$3,$4,$5,'SYNC',TRUE,'performance-baseline',1)`,
        [id, organisationId, code, nom, code],
      );
    }
  } finally {
    await pool.end();
  }
}

async function stopTree(child) {
  if (!child?.pid || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
        windowsHide: true,
        stdio: 'ignore',
      });
      killer.once('exit', resolve);
      killer.once('error', resolve);
    });
    return;
  }
  try {
    process.kill(-child.pid, 'SIGTERM');
  } catch (error) {
    if (error.code !== 'ESRCH') throw error;
  }
}
