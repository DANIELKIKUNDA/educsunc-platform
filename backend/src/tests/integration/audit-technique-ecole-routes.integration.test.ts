import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { auditPlugin } from '../../app/plugins/audit.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeAudit } from '../../app/routes/audit.routes';
import { neutraliserTraitementsAuditPourTest } from '../../shared/audit/tests/support/AuditRoutesTestSupport';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';
import { reinitialiserEtatAuditTests } from '../../shared/audit/tests/support/AuditTestSupport';
import { obtenirSharedEventBus } from '../../shared/infrastructure/bus';

test('les routes d audit technique ecole exposent uniquement les traces et metriques de l ecole active a ADMIN_SYSTEME_ECOLE', async () => {
  reinitialiserEtatAuditTests();

  await obtenirSharedEventBus().publier(
    'WorkerFailed',
    { workerId: 'worker-a', queueName: 'MONITORING' },
    {
      requestId: 'req-a',
      correlationId: 'corr-a',
      traceId: 'trace-a',
      organisationId: TENANT_FIXTURES.organisationA,
      ecoleId: TENANT_FIXTURES.ecoleA1,
      retryCount: 1,
    },
  );
  await obtenirSharedEventBus().publier(
    'WorkerFailed',
    { workerId: 'worker-b', queueName: 'MONITORING' },
    {
      requestId: 'req-b',
      correlationId: 'corr-b',
      traceId: 'trace-b',
      organisationId: TENANT_FIXTURES.organisationA,
      ecoleId: TENANT_FIXTURES.ecoleA2,
      retryCount: 1,
    },
  );

  const bootstrap = new GlobalTestBootstrap();
  const adminSystemeEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_SYSTEME_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const adminEcole = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await bootstrap.creerAuthenticationPlugin()(instance, {});
    await bootstrap.creerSecurityPlugin()(instance, {});
    await tenancyPlugin(instance, {});
    await auditPlugin(instance, {});
    neutraliserTraitementsAuditPourTest(instance.audit.routesDependances);
    await instance.register(routeAudit);
  });

  const traces = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/ecole/audit/technique/traces',
  });
  assert.equal(traces.statusCode, 200, traces.body);
  const tracesBody = JSON.parse(traces.body);
  assert.ok(tracesBody.donnee.data.traces.length >= 1);
  assert.ok(
    tracesBody.donnee.data.traces.every(
      (trace: { ecoleId?: string }) => trace.ecoleId === TENANT_FIXTURES.ecoleA1,
    ),
  );
  assert.ok(
    tracesBody.donnee.data.traces.some(
      (trace: { traceId?: string }) => trace.traceId === 'trace-a',
    ),
  );

  const metrics = await injecterCommeActeur(serveur, adminSystemeEcole, {
    method: 'GET',
    url: '/api/v1/ecole/audit/technique/metrics',
  });
  assert.equal(metrics.statusCode, 200, metrics.body);
  const metricsBody = JSON.parse(metrics.body);
  const totalTraces = metricsBody.donnee.data.metrics.find((metric: { nom: string; valeur: number }) => metric.nom === 'audit_school_traces_total');
  assert.ok((totalTraces?.valeur ?? 0) >= 1);

  const tracesAdminEcole = await injecterCommeActeur(serveur, adminEcole, {
    method: 'GET',
    url: '/api/v1/ecole/audit/technique/traces',
  });
  assert.equal(tracesAdminEcole.statusCode, 403, tracesAdminEcole.body);

  await serveur.close();
});
