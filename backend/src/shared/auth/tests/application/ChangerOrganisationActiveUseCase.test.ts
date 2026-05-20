import test from 'node:test';
import assert from 'node:assert/strict';
import { ChangerOrganisationActiveUseCase } from 'shared/auth/application/use-cases/ChangerOrganisationActiveUseCase';
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

test('changement organisation active valide met a jour le contexte actif', async () => {
  const repositories = creerRepositoriesMemoire();
  const session = creerSessionUtilisateur({ idUtilisateur: 'utilisateur-1' });
  const contexte = creerContexteActifAuth('utilisateur-1');
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await repositories.depotContexteActifAuth.sauvegarder(contexte);

  const contexteService = new ContexteActifApplicationService(
    repositories.depotContexteActifAuth,
    new SecurityAuthorizationPortMemoire(['org-1']),
    new TenantContextPortMemoire(true),
    new MoteurContexteActif(),
  );
  const useCase = new ChangerOrganisationActiveUseCase(
    new SessionApplicationService(repositories.depotSessionUtilisateur, repositories.depotRefreshToken, new SessionCachePortMemoire()),
    new ChangerContexteActifSaga(new TransactionManagerMemoire(), contexteService),
  );

  const resultat = await useCase.executer({ sessionId: session.obtenirId(), organisationActiveId: 'org-1' });
  assert.equal(resultat.organisationActiveId, 'org-1');
});

test('organisation interdite rejetee', async () => {
  const repositories = creerRepositoriesMemoire();
  const session = creerSessionUtilisateur({ idUtilisateur: 'utilisateur-1' });
  await repositories.depotSessionUtilisateur.sauvegarder(session);

  const contexteService = new ContexteActifApplicationService(
    repositories.depotContexteActifAuth,
    new SecurityAuthorizationPortMemoire([]),
    new TenantContextPortMemoire(true),
    new MoteurContexteActif(),
  );
  const useCase = new ChangerOrganisationActiveUseCase(
    new SessionApplicationService(repositories.depotSessionUtilisateur, repositories.depotRefreshToken, new SessionCachePortMemoire()),
    new ChangerContexteActifSaga(new TransactionManagerMemoire(), contexteService),
  );

  await assert.rejects(() => useCase.executer({ sessionId: session.obtenirId(), organisationActiveId: 'org-1' }));
});
