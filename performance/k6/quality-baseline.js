import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const baseUrl = __ENV.EDUCSYN_PERF_BASE_URL;
const email = __ENV.EDUCSYN_PERF_EMAIL;
const motDePasse = __ENV.EDUCSYN_PERF_PASSWORD;
const organisationA = __ENV.EDUCSYN_PERF_ORGANISATION_A;
const organisationB = __ENV.EDUCSYN_PERF_ORGANISATION_B;
const reportPath = __ENV.EDUCSYN_PERF_SUMMARY_PATH || 'artifacts/quality/performance/k6-summary.json';
const serverErrors = new Rate('http_5xx');

export const options = {
  scenarios: {
    authentification: {
      executor: 'shared-iterations',
      exec: 'authentifier',
      vus: 1,
      iterations: 5,
      maxDuration: '30s',
    },
    lectures: {
      executor: 'constant-vus',
      exec: 'lireDonnees',
      vus: 3,
      duration: '20s',
      startTime: '1s',
    },
    ecriturePreference: {
      executor: 'shared-iterations',
      exec: 'ecrirePreference',
      vus: 1,
      iterations: 10,
      startTime: '2s',
      maxDuration: '30s',
    },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    http_5xx: ['rate==0'],
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
  },
  summaryTrendStats: ['med', 'p(95)', 'p(99)', 'avg', 'min', 'max'],
  noConnectionReuse: false,
  userAgent: 'EduSync-k6-baseline/1.0',
};

export function setup() {
  const session = ouvrirSession('initialisation');
  check(session, {
    'session de baseline ouverte': (value) => value.accessToken.length > 0,
  });
  return session;
}

export function authentifier() {
  const session = ouvrirSession('authentification');
  check(session, {
    'authentification reussie': (value) => value.accessToken.length > 0,
  });
  sleep(0.2);
}

export function lireDonnees(session) {
  const headers = entetes(session.accessToken);
  verifierReponse(
    http.get(`${baseUrl}/health`, { tags: { scenario_metier: 'sante' } }),
    [200],
    'sante',
  );
  verifierReponse(
    http.get(`${baseUrl}/api/organisations?page=1&taillePage=20`, {
      headers,
      tags: { scenario_metier: 'liste-paginee' },
    }),
    [200],
    'liste paginee des organisations',
  );
  verifierReponse(
    http.get(`${baseUrl}/api/organisations/${organisationA}/ecoles`, {
      headers,
      tags: { scenario_metier: 'organisation-a' },
    }),
    [200],
    'ecoles organisation A',
  );
  verifierReponse(
    http.get(`${baseUrl}/api/organisations/${organisationB}/ecoles`, {
      headers,
      tags: { scenario_metier: 'organisation-b' },
    }),
    [200],
    'ecoles organisation B',
  );
  verifierReponse(
    http.get(`${baseUrl}/api/organisations/${organisationA}/indicateurs`, {
      headers,
      tags: { scenario_metier: 'tableau-de-bord' },
    }),
    [200],
    'indicateurs organisation',
  );
  verifierReponse(
    http.get(`${baseUrl}/api/v1/configuration/me/theme`, {
      headers,
      tags: { scenario_metier: 'preference-utilisateur' },
    }),
    [200],
    'preference utilisateur',
  );
  sleep(0.15);
}

export function ecrirePreference(session) {
  const response = http.put(
    `${baseUrl}/api/v1/configuration/me/theme`,
    JSON.stringify({ theme: __ITER % 2 === 0 ? 'light' : 'system' }),
    {
      headers: entetes(session.accessToken),
      tags: { scenario_metier: 'ecriture' },
    },
  );
  verifierReponse(response, [200], 'ecriture preference');
  sleep(0.2);
}

export function teardown(session) {
  if (!session?.accessToken) return;
  http.put(
    `${baseUrl}/api/v1/configuration/me/theme`,
    JSON.stringify({ theme: 'system' }),
    { headers: entetes(session.accessToken), tags: { scenario_metier: 'restauration' } },
  );
}

export function handleSummary(data) {
  return {
    [reportPath]: JSON.stringify(data, null, 2),
    stdout: `\nBaseline EduSync: ${data.metrics.http_reqs?.values?.count ?? 0} requetes, p95 ${
      data.metrics.http_req_duration?.values?.['p(95)'] ?? 'n/a'
    } ms, p99 ${data.metrics.http_req_duration?.values?.['p(99)'] ?? 'n/a'} ms.\n`,
  };
}

function ouvrirSession(tag) {
  const response = http.post(
    `${baseUrl}/api/auth/login`,
    JSON.stringify({
      email,
      motDePasse,
      deviceId: `k6-${tag}-${__VU}-${__ITER}`,
    }),
    {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      tags: { scenario_metier: 'authentification' },
    },
  );
  verifierReponse(response, [200], 'authentification');
  const donnees = response.json();
  return { accessToken: typeof donnees?.accessToken === 'string' ? donnees.accessToken : '' };
}

function entetes(accessToken) {
  return {
    Authorization: `Bearer ${accessToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

function verifierReponse(response, statutsAcceptes, libelle) {
  serverErrors.add(response.status >= 500);
  check(response, {
    [`${libelle}: statut attendu`]: (value) => statutsAcceptes.includes(value.status),
  });
}
