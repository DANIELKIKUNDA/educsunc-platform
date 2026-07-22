const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { Pool } = require('pg');

const backendRoot = path.resolve(__dirname, '..');
const repositoryRoot = path.resolve(backendRoot, '..');
const frontendRoot = path.join(repositoryRoot, 'frontend');
const artifactRoot = path.join(repositoryRoot, 'artifacts', 'security-production-certification');
const schema = process.env.SECURITY_CERT_SCHEMA || 'educsyn_security_certification';
const backendPort = Number(process.env.SECURITY_CERT_BACKEND_PORT || 3107);
const frontendPort = Number(process.env.SECURITY_CERT_FRONTEND_PORT || 4277);
const backendUrl = `http://127.0.0.1:${backendPort}`;
const frontendUrl = `http://127.0.0.1:${frontendPort}`;
const children = new Set();

if (!/^[a-z][a-z0-9_]{2,62}$/u.test(schema)) {
  throw new Error(`Nom de schema de certification invalide: ${schema}`);
}

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

loadDotEnv(path.join(backendRoot, '.env'));

const database = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'educsyn',
};

function timestamp() {
  return new Date().toISOString();
}

function writeLog(name, content) {
  fs.mkdirSync(artifactRoot, { recursive: true });
  fs.appendFileSync(path.join(artifactRoot, name), content, 'utf8');
}

function spawnLogged(command, args, options, logName) {
  const child = spawn(command, args, {
    ...options,
    windowsHide: true,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  children.add(child);
  const capture = (source, label) => source.on('data', (chunk) => {
    const text = `[${timestamp()}] [${label}] ${chunk.toString()}`;
    writeLog(logName, text);
    process.stdout.write(text);
  });
  capture(child.stdout, 'OUT');
  capture(child.stderr, 'ERR');
  child.once('exit', () => children.delete(child));
  return child;
}

function npmInvocation(args) {
  if (process.platform !== 'win32') return { command: 'npm', args };
  return {
    command: process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe',
    args: ['/d', '/s', '/c', 'npm', ...args],
  };
}

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawnLogged(command, args, options, options.logName || 'commands.log');
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} a echoue avec le code ${code}.`));
    });
  });
}

async function stopTree(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    await new Promise((resolve) => {
      const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true, stdio: 'ignore' });
      killer.once('exit', resolve);
      killer.once('error', resolve);
    });
  } else {
    child.kill('SIGTERM');
  }
}

async function waitFor(url, timeoutMs = 900000, processToWatch) {
  const deadline = Date.now() + timeoutMs;
  let lastError = 'service indisponible';
  while (Date.now() < deadline) {
    if (processToWatch && processToWatch.exitCode !== null) {
      throw new Error(`${url} ne peut pas demarrer: le processus a quitte avec le code ${processToWatch.exitCode}.`);
    }
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error.message;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error(`${url} n'est pas pret: ${lastError}`);
}

function backendEnvironment() {
  return {
    ...process.env,
    APP_ENV: 'development',
    NODE_ENV: 'development',
    HOST: '127.0.0.1',
    PORT: String(backendPort),
    PGOPTIONS: `-c search_path=${schema}`,
    EDUCSYN_REDIS_MODE: 'simulation',
    EDUCSYN_REDIS_PREFIX: `educsyn:certification:security:${schema}`,
    EDUCSYN_CORS_ADDITIONAL_ORIGINS: frontendUrl,
  };
}

function startBackend(logName) {
  return spawnLogged(
    process.execPath,
    ['--import', 'tsx', 'src/main.ts'],
    { cwd: backendRoot, env: backendEnvironment() },
    logName,
  );
}

function startFrontend() {
  const npm = npmInvocation(['run', 'dev', '--', '--host', '127.0.0.1', '--port', String(frontendPort), '--strictPort']);
  return spawnLogged(
    npm.command,
    npm.args,
    {
      cwd: frontendRoot,
      env: {
        ...process.env,
        VITE_API_URL: backendUrl,
        VITE_AUTH_ENTRY_MODE: 'login',
      },
    },
    'frontend.log',
  );
}

async function recreateSchema(adminPool) {
  await adminPool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
  await adminPool.query(`CREATE SCHEMA ${schema} AUTHORIZATION CURRENT_USER`);
}

async function seedScopeData() {
  const pool = new Pool({ ...database, options: `-c search_path=${schema}` });
  const organisations = [
    ['71000000-0000-4000-8000-000000000001', 'CERT-ORG-A', 'Organisation Certification A'],
    ['71000000-0000-4000-8000-000000000002', 'CERT-ORG-B', 'Organisation Certification B'],
  ];
  const schools = [
    ['72000000-0000-4000-8000-000000000001', organisations[0][0], 'CERT-ECOLE-A1', 'Ecole Certification A1'],
    ['72000000-0000-4000-8000-000000000002', organisations[0][0], 'CERT-ECOLE-A2', 'Ecole Certification A2'],
    ['72000000-0000-4000-8000-000000000003', organisations[1][0], 'CERT-ECOLE-B1', 'Ecole Certification B1'],
  ];
  try {
    for (const [id, code, nom] of organisations) {
      await pool.query(
        `INSERT INTO organisations(id,code,nom,type_organisation,actif,description,cree_par,version)
         VALUES($1,$2,$3,'RESEAU',TRUE,'Perimetre isole de certification','security-certification',1)
         ON CONFLICT (id) DO NOTHING`,
        [id, code, nom],
      );
    }
    for (const [id, organisationId, code, nom] of schools) {
      await pool.query(
        `INSERT INTO ecoles(id,id_organisation,code,nom,sigle,mode_exploitation,actif,cree_par,version)
         VALUES($1,$2,$3,$4,$5,'SYNC',TRUE,'security-certification',1)
         ON CONFLICT (id) DO NOTHING`,
        [id, organisationId, code, nom, code],
      );
    }
  } finally {
    await pool.end();
  }
}

async function initializePlatform() {
  const response = await fetch(`${backendUrl}/api/auth/initialisation`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      nom: 'Manager',
      postnom: 'Certification',
      prenom: 'EduSync',
      email: 'manager.certification@cert.educsyn.cd',
      motDePasse: 'Certification#2026!',
      confirmationMotDePasse: 'Certification#2026!',
      deviceId: 'security-certification-bootstrap',
    }),
  });
  if (![201, 409].includes(response.status)) {
    throw new Error(`Initialisation Plateforme de certification refusee: HTTP ${response.status} ${await response.text()}`);
  }
}

async function runBrowserPhase(phase) {
  await run(
    process.execPath,
    [path.join(frontendRoot, 'scripts', 'certify-security-center-production-browser.cjs'), phase],
    {
      cwd: frontendRoot,
      env: {
        ...process.env,
        SECURITY_CERT_BASE_URL: frontendUrl,
        SECURITY_CERT_API_URL: backendUrl,
        SECURITY_CERT_ARTIFACT_DIR: artifactRoot,
      },
      logName: `browser-${phase}.log`,
    },
  );
}

async function main() {
  fs.mkdirSync(artifactRoot, { recursive: true });
  fs.writeFileSync(path.join(artifactRoot, 'orchestrator.json'), JSON.stringify({ startedAt: timestamp(), schema, backendUrl, frontendUrl }, null, 2));
  const adminPool = new Pool(database);
  let backend;
  let frontend;
  try {
    const backendTypecheck = npmInvocation(['run', 'typecheck']);
    const backendTests = npmInvocation(['run', 'test:security']);
    const frontendBuild = npmInvocation(['run', 'build']);
    if (process.env.SECURITY_CERT_SKIP_STATIC !== '1') {
      await run(backendTypecheck.command, backendTypecheck.args, { cwd: backendRoot, logName: 'backend-typecheck.log' });
      await run(backendTests.command, backendTests.args, { cwd: backendRoot, logName: 'backend-security-tests.log' });
      await run(frontendBuild.command, frontendBuild.args, { cwd: frontendRoot, logName: 'frontend-build.log' });
    }

    await recreateSchema(adminPool);
    backend = startBackend('backend-before-restart.log');
    await waitFor(`${backendUrl}/health`, 900000, backend);
    await initializePlatform();
    await seedScopeData();
    frontend = startFrontend();
    await waitFor(frontendUrl, 180000, frontend);
    await runBrowserPhase('main');

    await stopTree(backend);
    backend = startBackend('backend-after-restart.log');
    await waitFor(`${backendUrl}/health`, 900000, backend);
    await runBrowserPhase('restart');

    fs.writeFileSync(path.join(artifactRoot, 'verdict.txt'), 'CENTRE SECURITE - CERTIFIE PRODUCTION\n', 'utf8');
    process.stdout.write('\nCENTRE SECURITE - CERTIFIE PRODUCTION\n');
  } finally {
    await stopTree(frontend);
    await stopTree(backend);
    for (const child of [...children]) await stopTree(child);
    await adminPool.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`).catch((error) => writeLog('cleanup.log', `${error.stack || error}\n`));
    await adminPool.end();
  }
}

main().catch((error) => {
  writeLog('fatal.log', `${error.stack || error}\n`);
  process.stderr.write(`\nCENTRE SECURITE - CERTIFICATION ECHOUEE\n${error.stack || error}\n`);
  process.exitCode = 1;
});
