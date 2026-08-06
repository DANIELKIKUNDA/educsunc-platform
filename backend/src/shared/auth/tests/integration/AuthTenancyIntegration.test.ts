import test from 'node:test';
import assert from 'node:assert/strict';
import { ChangerContexteActifSaga } from 'shared/auth/application/sagas/ChangerContexteActifSaga';
import { ContexteActifApplicationService } from 'shared/auth/application/services/ContexteActifApplicationService';
import { SessionApplicationService } from 'shared/auth/application/services/SessionApplicationService';
import { MoteurContexteActif } from 'shared/auth/domain/services/MoteurContexteActif';
import {
  SecurityAuthorizationPortMemoire,
  SessionCachePortMemoire,
  TenantContextPortMemoire,
  TransactionManagerMemoire,
  creerContexteActifAuth,
  creerRepositoriesMemoire,
  creerSessionUtilisateur,
} from '../support/AuthTestSupport';

test('tenant actif, ecole active et changement contexte sont propages', async () => {
  const repositories = creerRepositoriesMemoire();
  const session = creerSessionUtilisateur({ idUtilisateur: 'u1' });
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await repositories.depotContexteActifAuth.sauvegarder(creerContexteActifAuth('u1'));
  const service = new ContexteActifApplicationService(
    repositories.depotContexteActifAuth,
    new SecurityAuthorizationPortMemoire(['org-1'], ['ecole-1']),
    new TenantContextPortMemoire(true),
    new MoteurContexteActif(),
  );
  const sessionService = new SessionApplicationService(
    repositories.depotSessionUtilisateur,
    repositories.depotRefreshToken,
    new SessionCachePortMemoire(),
  );
  const saga = new ChangerContexteActifSaga(
    new TransactionManagerMemoire(),
    service,
    sessionService,
  );

  await saga.changerOrganisationActive(session.obtenirId(), 'u1', 'org-1');
  const resultat = await saga.changerEcoleActive(session.obtenirId(), 'u1', 'ecole-1');
  assert.equal(resultat.organisationActiveId, 'org-1');
  assert.equal(resultat.ecoleActiveId, 'ecole-1');
});
