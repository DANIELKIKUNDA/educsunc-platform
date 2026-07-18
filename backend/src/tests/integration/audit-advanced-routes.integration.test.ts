import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { auditPlugin } from '../../app/plugins/audit.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeAudit } from '../../app/routes/audit.routes';
import { TENANT_FIXTURES } from '../../shared/tests/fixtures/GlobalFixtures';
import { injecterCommeActeur } from '../../shared/tests/helpers/GlobalTestHelpers';
import { GlobalTestBootstrap } from '../../shared/tests/setup/GlobalTestBootstrap';

test("les surfaces avancees d'audit imposent bien les garde-fous admin et internal", async () => {
  const bootstrap = new GlobalTestBootstrap();
  const managerSysteme = await bootstrap.creerActeur({
    codeRole: 'MANAGER_SYSTEME',
    niveauAcces: 'PLATEFORME',
    permissions: [
      'audit.internal.rebuild',
      'audit.admin.recovery',
      'audit.export',
      'audit.export.read',
    ],
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const promoteurOrganisation = await bootstrap.creerActeur({
    codeRole: 'PROMOTEUR_ORGANISATION',
    niveauAcces: 'ORGANISATION',
    permissions: [
      'audit.admin.recovery',
    ],
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const administrateurEcole = await bootstrap.creerActeur({
    codeRole: 'ADMINISTRATEUR_ECOLE',
    niveauAcces: 'ECOLE',
    permissions: [
      'audit.internal.rebuild',
      'audit.export',
      'audit.export.read',
    ],
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

    const reponseNeutre = async () => ({
      donnee: { accepte: true },
      meta: {
        modeOffline: false,
        durationMs: 0,
      },
    });
    instance.audit.routesDependances.auditReplayController.rejouerProjectionsAudit = reponseNeutre;
    instance.audit.routesDependances.auditSynchronizationController.recupererSynchronisation = reponseNeutre;
    instance.audit.routesDependances.auditExportsController.exporterAudit = reponseNeutre;

    await instance.register(routeAudit);
  });

  const rebuildManager = await injecterCommeActeur(serveur, managerSysteme, {
    method: 'POST',
    url: '/api/v1/internal/rebuild/projections',
    payload: {
      projection: 'audit',
    },
  });
  assert.equal(rebuildManager.statusCode, 202, rebuildManager.body);

  const rebuildAdminEcole = await injecterCommeActeur(serveur, administrateurEcole, {
    method: 'POST',
    url: '/api/v1/internal/rebuild/projections',
    payload: {
      projection: 'audit',
    },
  });
  assert.equal(rebuildAdminEcole.statusCode, 403, rebuildAdminEcole.body);

  const recoveryManager = await injecterCommeActeur(serveur, managerSysteme, {
    method: 'POST',
    url: '/api/v1/admin/recovery',
    payload: {
      auditId: 'audit-1',
      resolution: 'REPRISE_COMPLETE',
    },
  });
  assert.equal(recoveryManager.statusCode, 202, recoveryManager.body);

  const recoveryPromoteur = await injecterCommeActeur(serveur, promoteurOrganisation, {
    method: 'POST',
    url: '/api/v1/admin/recovery',
    payload: {
      auditId: 'audit-1',
      resolution: 'REPRISE_COMPLETE',
    },
  });
  assert.equal(recoveryPromoteur.statusCode, 403, recoveryPromoteur.body);

  const exportEcole = await injecterCommeActeur(serveur, administrateurEcole, {
    method: 'POST',
    url: '/api/v1/exports/audit',
    payload: {
      format: 'PDF',
      filtres: {
        categorie: 'FINANCIER',
      },
    },
  });
  assert.equal(exportEcole.statusCode, 202, exportEcole.body);

  await serveur.close();
});
