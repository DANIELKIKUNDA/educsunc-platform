import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import {
  creerRoutesAlertesMonitoring,
  creerRoutesCapaciteMonitoring,
  creerRoutesDiagnosticsMonitoring,
  creerRoutesHealthMonitoring,
  creerRoutesIncidentsMonitoring,
  creerRoutesMonitoring,
  creerRoutesTracesMonitoring,
} from '../../../monitoring';

test('les routes monitoring exposent les 17 workflows reels du module', async () => {
  const serveur = Fastify();
  const dependances = {
    controleurMonitoringHttp: {
      async consulterEtat() { return { statutHttp: 200, corps: { ok: true } }; },
      async consulterTableauBord() { return { statutHttp: 200, corps: { dashboard: true } }; },
      async consulterObservabilite() { return { statutHttp: 200, corps: { observability: true } }; },
    },
    controleurHealthMonitoringHttp: {
      async consulterEtat() { return { statutHttp: 200, corps: { health: true } }; },
      async consulterSnapshot() { return { statutHttp: 200, corps: { snapshot: true } }; },
    },
    controleurIncidentsMonitoringHttp: {
      async lister() { return { statutHttp: 200, corps: [] }; },
      async ouvrir() { return { statutHttp: 201, corps: { id: 'incident-1' } }; },
      async escalader() { return { statutHttp: 200, corps: { escalade: true } }; },
    },
    controleurAlertesMonitoringHttp: {
      async lister() { return { statutHttp: 200, corps: [] }; },
      async creer() { return { statutHttp: 201, corps: { id: 'alert-1' } }; },
      async resoudre() { return { statutHttp: 200, corps: { resolue: true } }; },
    },
    controleurDiagnosticsMonitoringHttp: {
      async lister() { return { statutHttp: 200, corps: [] }; },
      async generer() { return { statutHttp: 201, corps: { id: 'diag-1' } }; },
    },
    controleurCapaciteMonitoringHttp: {
      async lister() { return { statutHttp: 200, corps: [] }; },
      async calculerCapacite() { return { statutHttp: 201, corps: { id: 'cap-1' } }; },
      async calculerSaturation() { return { statutHttp: 201, corps: { id: 'sat-1' } }; },
    },
    controleurTracesMonitoringHttp: {
      async lister() { return { statutHttp: 200, corps: [] }; },
      async capturer() { return { statutHttp: 201, corps: { id: 'trace-1' } }; },
    },
  } as never;

  await serveur.register(creerRoutesMonitoring(dependances));
  await serveur.register(creerRoutesHealthMonitoring(dependances));
  await serveur.register(creerRoutesIncidentsMonitoring(dependances));
  await serveur.register(creerRoutesAlertesMonitoring(dependances));
  await serveur.register(creerRoutesDiagnosticsMonitoring(dependances));
  await serveur.register(creerRoutesCapaciteMonitoring(dependances));
  await serveur.register(creerRoutesTracesMonitoring(dependances));

  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/state' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/dashboard' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/observability' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/health' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/health/snapshot' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/incidents' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/incidents', payload: {} })).statusCode, 201);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/incidents/incident-1/escalate', payload: {} })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/alerts' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/alerts', payload: {} })).statusCode, 201);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/alerts/alert-1/resolve', payload: {} })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/diagnostics' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/incidents/incident-1/diagnostics', payload: {} })).statusCode, 201);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/capacity' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/capacity', payload: {} })).statusCode, 201);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/capacity/saturation', payload: {} })).statusCode, 201);
  assert.equal((await serveur.inject({ method: 'GET', url: '/api/v1/monitoring/traces' })).statusCode, 200);
  assert.equal((await serveur.inject({ method: 'POST', url: '/api/v1/monitoring/traces', payload: {} })).statusCode, 201);

  await serveur.close();
});
