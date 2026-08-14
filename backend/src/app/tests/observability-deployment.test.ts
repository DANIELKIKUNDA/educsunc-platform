import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const racine = path.basename(process.cwd()) === 'backend'
  ? path.resolve(process.cwd(), '..')
  : process.cwd();
const lire = (relatif: string) => readFileSync(path.join(racine, relatif), 'utf8');

test('Prometheus scrape /metrics avec un secret fichier et sans labels a cardinalite massive', () => {
  const config = lire('docker/observability/prometheus/prometheus.yml');
  const plugin = lire('backend/src/app/plugins/observabilite-http.plugin.ts');

  assert.match(config, /metrics_path:\s*\/metrics/u);
  assert.match(config, /credentials_file:\s*\/run\/secrets\/edusync_metrics_token/u);
  assert.match(plugin, /labelNames:\s*\['method', 'route', 'status_code'\]/u);
  assert.doesNotMatch(plugin, /labelNames:[^\n]*(userId|eventId|correlationId|requestId)/u);
});

test('les regles Prometheus versionnees ne contiennent pas de seuil metier arbitraire', () => {
  const regles = lire('docker/observability/prometheus/rules/monitoring.rules.yml');
  assert.match(regles, /up\{job="edusync-backend"\}\s*==\s*0/u);
  assert.doesNotMatch(regles, /http_request_duration|5\.\.|heap|queue/u);
});

test('Grafana provisionne Prometheus et Loki et le dashboard utilise les metriques EduSync', () => {
  const sources = lire('docker/observability/grafana/provisioning/datasources/datasources.yml');
  const dashboard = lire('docker/observability/grafana/dashboards/edusync-overview.json');

  assert.match(sources, /type:\s*prometheus/u);
  assert.match(sources, /type:\s*loki/u);
  assert.match(dashboard, /edusync_http_requests_total/u);
  assert.match(dashboard, /edusync_http_request_duration_seconds_bucket/u);
});

test('Loki possede une retention explicite et aucun secret n est versionne dans la composition', () => {
  const loki = lire('docker/observability/loki/loki.yml');
  const compose = lire('docker/observability/docker-compose.observability.yml');

  assert.match(loki, /retention_period:\s*168h/u);
  assert.match(compose, /GF_SECURITY_ADMIN_PASSWORD:\s*\$\{GRAFANA_ADMIN_PASSWORD:\?required\}/u);
  assert.match(compose, /EDUCSYN_METRICS_TOKEN_FILE/u);
  assert.doesNotMatch(compose, /password:\s*["']?[A-Za-z0-9_-]{8,}/iu);
});
