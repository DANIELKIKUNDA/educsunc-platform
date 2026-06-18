// Ce fichier declare les fixtures communes des tests Monitoring.

export const FIXTURE_MONITORING_CONTEXT = {
  organisationId: 'org-monitoring-test',
  ecoleId: 'ecole-monitoring-test',
  utilisateurId: 'user-monitoring-test',
  module: 'shared-monitoring',
  composant: 'runtime-monitoring',
  correlationId: 'corr-monitoring-test',
} as const;

export const FIXTURE_ALERT_COMMAND = {
  alertId: 'alert-monitoring-test',
  indicateur: 'api_latency_ms',
  warning: 500,
  critical: 1200,
  unite: 'ms',
  valeurObservee: 1300,
  message: 'Latence critique detectee',
  contexte: FIXTURE_MONITORING_CONTEXT,
  correlationId: FIXTURE_MONITORING_CONTEXT.correlationId,
} as const;

export const FIXTURE_INCIDENT_COMMAND = {
  incidentId: 'incident-monitoring-test',
  resume: 'Incident critique de supervision',
  niveau: 'CRITICAL' as const,
  contexte: FIXTURE_MONITORING_CONTEXT,
  correlationId: FIXTURE_MONITORING_CONTEXT.correlationId,
} as const;

export const FIXTURE_TRACE_COMMAND = {
  traceId: 'trace-monitoring-test',
  type: 'REQUEST' as const,
  operation: 'GET /api/v1/monitoring/state',
  succes: false,
  dureeMillisecondes: 842,
  message: 'Timeout simule',
  contexte: FIXTURE_MONITORING_CONTEXT,
  correlationId: FIXTURE_MONITORING_CONTEXT.correlationId,
} as const;
