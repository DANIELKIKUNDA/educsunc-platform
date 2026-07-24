import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import {
  qualityArtifacts,
  repositoryRoot,
  runNpm,
  writeJson,
} from './lib/runner.mjs';

const require = createRequire(import.meta.url);
const { Pool } = require(path.join(repositoryRoot, 'backend', 'node_modules', 'pg'));
const backendRoot = path.join(repositoryRoot, 'backend');
const schema = `educsyn_quality_${process.pid}_${Date.now()}`.toLowerCase();

loadDotEnv(path.join(backendRoot, '.env'));
const database = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'educsyn',
};

if (!/^[a-z][a-z0-9_]{2,62}$/u.test(schema)) throw new Error(`Schéma temporaire invalide : ${schema}`);

const report = {
  schemaVersion: 1,
  verification: 'postgres-isolated',
  schema,
  startedAt: new Date().toISOString(),
  finishedAt: null,
  steps: [],
  status: 'failed',
};
const reportPath = path.join(qualityArtifacts, 'postgres', 'report.json');
const pool = new Pool(database);

try {
  await pool.query(`CREATE SCHEMA ${schema} AUTHORIZATION CURRENT_USER`);
  const env = { PGOPTIONS: `-c search_path=${schema}` };
  for (const [id, script] of [
    ['migrations-référentiel', 'db:migrate:referentiel'],
    ['persistance-sécurité', 'security:certify:postgres'],
    ['gouvernance-multitenant', 'security:certify:governance'],
  ]) {
    report.steps.push(await runNpm(id, 'backend', script, { env }));
  }
  report.status = 'passed';
} finally {
  await pool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`).catch((error) => {
    report.cleanupError = error.message;
  });
  await pool.end();
  report.finishedAt = new Date().toISOString();
  writeJson(reportPath, report);
}

if (report.status !== 'passed') process.exitCode = 1;

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
