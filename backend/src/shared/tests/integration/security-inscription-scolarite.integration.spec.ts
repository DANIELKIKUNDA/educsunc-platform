import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationInscriptionCompleteAdapter } from '../../../app/adapters/AutorisationInscriptionCompleteAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve l inscription scolaire complete au caissier de la bonne ecole', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const admin = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const prefet = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PREFET,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const autreCaissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA2,
  });
  const adapter = new AutorisationInscriptionCompleteAdapter();

  await assert.doesNotReject(() => adapter.verifierCreationInscriptionComplete({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adapter.verifierCreationInscriptionComplete({
    idUtilisateur: admin.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adapter.verifierCreationInscriptionComplete({
    idUtilisateur: prefet.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adapter.verifierCreationInscriptionComplete({
    idUtilisateur: autreCaissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));
});
