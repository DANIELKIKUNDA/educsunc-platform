import test from 'node:test';
import assert from 'node:assert/strict';
import { ChangerContexteActifSaga } from 'shared/auth/application/sagas/ChangerContexteActifSaga';
import { ContexteActifApplicationService } from 'shared/auth/application/services/ContexteActifApplicationService';
import { MoteurContexteActif } from 'shared/auth/domain/services/MoteurContexteActif';
import { SecurityAuthorizationPortMemoire, TenantContextPortMemoire, TransactionManagerMemoire, creerContexteActifAuth, creerRepositoriesMemoire } from '../support/AuthTestSupport';

test('tenant actif, ecole active et changement contexte sont propages', async () => {
  const repositories = creerRepositoriesMemoire();
  await repositories.depotContexteActifAuth.sauvegarder(creerContexteActifAuth('u1'));
  const service = new ContexteActifApplicationService(
    repositories.depotContexteActifAuth,
    new SecurityAuthorizationPortMemoire(['org-1'], ['ecole-1']),
    new TenantContextPortMemoire(true),
    new MoteurContexteActif(),
  );
  const saga = new ChangerContexteActifSaga(new TransactionManagerMemoire(), service);

  await saga.changerOrganisationActive('u1', 'org-1');
  const resultat = await saga.changerEcoleActive('u1', 'ecole-1');
  assert.equal(resultat.organisationActiveId, 'org-1');
  assert.equal(resultat.ecoleActiveId, 'ecole-1');
});
