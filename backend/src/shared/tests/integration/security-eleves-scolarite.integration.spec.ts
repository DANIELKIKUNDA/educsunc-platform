import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationEleveAdapter } from '../../../app/adapters/AutorisationEleveAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY applique la doctrine locale des eleves hors inscription', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const caissier = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.CAISSIER,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const directeur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.DIRECTEUR_ETUDES,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationEleveAdapter();

  await assert.doesNotReject(() => adaptateur.verifierLectureEleve({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.doesNotReject(() => adaptateur.verifierMutationEleve({
    idUtilisateur: caissier.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierLectureEleve({
    idUtilisateur: directeur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));

  await assert.rejects(() => adaptateur.verifierMutationEleve({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
    idEcole: TENANT_FIXTURES.ecoleA1,
  }));
});
