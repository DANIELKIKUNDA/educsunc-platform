import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const ciPath = path.join(root, '.github', 'workflows', 'ci.yml');
const verificationPath = path.join(root, 'scripts', 'quality', 'run-verification.mjs');
const ci = fs.readFileSync(ciPath, 'utf8');
const verification = fs.readFileSync(verificationPath, 'utf8');

const requirements = [
  ['Node 24', /NODE_VERSION:\s*["']24["']/],
  ['PostgreSQL 16 service', /image:\s*postgres:16-alpine/],
  ['backend Monitoring tests', /npm --prefix backend run test:monitoring/],
  ['frontend Monitoring tests', /npm --prefix frontend run test:monitoring(?:\s|$)/m],
  ['frontend Monitoring realtime tests', /npm --prefix frontend run test:monitoring:realtime/],
  ['Monitoring E2E', /npm --prefix frontend run test:e2e:monitoring/],
  ['backend strict typecheck', /npm --prefix backend run typecheck:strict/],
  ['backend build', /npm --prefix backend run build/],
  ['frontend build', /npm --prefix frontend run build/],
  ['backend lint', /npm run lint:backend/],
  ['frontend lint', /npm run lint:frontend/],
  ['Semgrep', /verify:security:semgrep/],
  ['Gitleaks', /verify:security:gitleaks/],
  ['Trivy', /verify:security:trivy/],
  ['dependency audit', /verify:security:dependencies/],
  ['performance verification', /npm run verify:performance/],
];

const missing = requirements.filter(([, pattern]) => !pattern.test(ci)).map(([name]) => name);
const verificationMissing = [
  ['verify:code backend Monitoring', /tests-backend-monitoring/],
  ['verify:code frontend Monitoring', /tests-frontend-monitoring/],
  ['verify:code frontend realtime Monitoring', /tests-frontend-monitoring-realtime/],
].filter(([, pattern]) => !pattern.test(verification)).map(([name]) => name);

if (missing.length || verificationMissing.length) {
  console.error('MONITORING CI INCOMPLETE');
  for (const item of [...missing, ...verificationMissing]) console.error(`- ${item}`);
  process.exit(1);
}
console.log(`MONITORING CI CONTRACT PASS (${requirements.length + 3} controls)`);
