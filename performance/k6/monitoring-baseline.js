import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

const baseUrl = __ENV.EDUCSYN_PERF_BASE_URL;
const email = __ENV.EDUCSYN_PERF_EMAIL;
const motDePasse = __ENV.EDUCSYN_PERF_PASSWORD;
const accessTokenCertification = __ENV.EDUCSYN_PERF_ACCESS_TOKEN;
const reportPath = __ENV.EDUCSYN_MONITORING_PERF_SUMMARY_PATH || 'artifacts/quality/performance/monitoring-k6-summary.json';
const serverErrors = new Rate('monitoring_http_5xx');

export const options = {
  scenarios: {
    monitoring_cockpit: { executor: 'constant-vus', exec: 'lireCockpit', vus: 3, duration: '20s' },
    monitoring_health: { executor: 'constant-arrival-rate', exec: 'lireHealth', rate: 2, timeUnit: '1s', duration: '20s', preAllocatedVUs: 2, maxVUs: 5 },
  },
  thresholds: {
    checks: ['rate>0.99'],
    http_req_failed: ['rate<0.01'],
    monitoring_http_5xx: ['rate==0'],
    'http_req_duration{module:monitoring}': ['p(95)<1500', 'p(99)<3000'],
  },
  summaryTrendStats: ['med', 'p(95)', 'p(99)', 'avg', 'min', 'max'],
  noConnectionReuse: false,
  userAgent: 'EduSync-k6-monitoring/1.0',
};

export function setup() {
  if (accessTokenCertification) return { accessToken: accessTokenCertification };
  const response = http.post(`${baseUrl}/api/auth/login`, JSON.stringify({ email, motDePasse, deviceId: 'k6-monitoring' }), {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, tags: { module: 'monitoring', operation: 'login' },
  });
  verifier(response, [200], 'authentification monitoring');
  const body = response.json();
  return { accessToken: typeof body?.accessToken === 'string' ? body.accessToken : '' };
}

export function lireCockpit(session) {
  const headers = entetes(session.accessToken);
  for (const [path, operation] of [
    ['/api/v1/monitoring/state', 'state'],
    ['/api/v1/monitoring/dashboard', 'dashboard'],
    ['/api/v1/monitoring/observability', 'observability'],
  ]) verifier(http.get(`${baseUrl}${path}`, { headers, tags: { module: 'monitoring', operation } }), [200], operation);
  sleep(0.25);
}

export function lireHealth(session) {
  verifier(http.get(`${baseUrl}/api/v1/monitoring/health`, { headers: entetes(session.accessToken), tags: { module: 'monitoring', operation: 'health' } }), [200], 'health');
}

export function handleSummary(data) {
  return { [reportPath]: JSON.stringify(data, null, 2), stdout: `\nMonitoring: ${data.metrics.http_reqs?.values?.count ?? 0} requetes; p95 ${data.metrics.http_req_duration?.values?.['p(95)'] ?? 'n/a'} ms.\n` };
}

function entetes(token) { return { Authorization: `Bearer ${token}`, Accept: 'application/json' }; }
function verifier(response, statuses, label) {
  serverErrors.add(response.status >= 500);
  check(response, { [`${label}: statut attendu`]: (value) => statuses.includes(value.status), [`${label}: payload borne`]: (value) => Number(value.body?.length ?? 0) < 2_000_000 });
}
