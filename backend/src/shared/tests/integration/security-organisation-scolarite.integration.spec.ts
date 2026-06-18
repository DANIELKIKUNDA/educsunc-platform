import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationOrganisationScolariteAdapter } from '../../../app/adapters/AutorisationOrganisationScolariteAdapter';
import { ROLE_FIXTURES, TENANT_FIXTURES } from '../fixtures/GlobalFixtures';
import { GlobalTestBootstrap } from '../setup/GlobalTestBootstrap';

test('SECURITY reserve la lecture organisationnelle de scolarite au promoteur de la meme organisation', async () => {
  const bootstrap = new GlobalTestBootstrap();
  const promoteur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.PROMOTEUR_ORGANISATION,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });
  const administrateur = await bootstrap.creerActeur({
    ...ROLE_FIXTURES.ADMIN_ECOLE,
    organisationId: TENANT_FIXTURES.organisationA,
    ecoleId: TENANT_FIXTURES.ecoleA1,
  });

  const adaptateur = new AutorisationOrganisationScolariteAdapter();

  await assert.doesNotReject(() => adaptateur.verifierLectureOrganisationScolarite({
    idUtilisateur: promoteur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
  }));

  await assert.rejects(() => adaptateur.verifierLectureOrganisationScolarite({
    idUtilisateur: promoteur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationB,
  }));

  await assert.rejects(() => adaptateur.verifierLectureOrganisationScolarite({
    idUtilisateur: administrateur.utilisateurId,
    idOrganisation: TENANT_FIXTURES.organisationA,
  }));

  await adaptateur.fermer();
});
