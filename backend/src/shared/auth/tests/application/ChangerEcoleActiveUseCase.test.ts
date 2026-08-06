import test from 'node:test';
import assert from 'node:assert/strict';
import { ChangerEcoleActiveUseCase } from 'shared/auth/application/use-cases/ChangerEcoleActiveUseCase';
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

test('changement ecole active valide avec coherence tenant', async () => {
  const repositories = creerRepositoriesMemoire();
  const session = creerSessionUtilisateur({ idUtilisateur: 'utilisateur-1' });
  const contexte = creerContexteActifAuth('utilisateur-1', 'org-1');
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await repositories.depotContexteActifAuth.sauvegarder(contexte);

  const contexteService = new ContexteActifApplicationService(
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
  const useCase = new ChangerEcoleActiveUseCase(
    sessionService,
    new ChangerContexteActifSaga(
      new TransactionManagerMemoire(),
      contexteService,
      sessionService,
    ),
  );

  const resultat = await useCase.executer({ sessionId: session.obtenirId(), ecoleActiveId: 'ecole-1' });
  assert.equal(resultat.ecoleActiveId, 'ecole-1');
  const sessionRelue = await repositories.depotSessionUtilisateur.trouverSessionActive(
    session.obtenirId(),
  );
  assert.equal(sessionRelue?.obtenirOrganisationActiveId(), 'org-1');
  assert.equal(sessionRelue?.obtenirEcoleActiveId(), 'ecole-1');
});

test('ecole interdite ou incoherente rejetee', async () => {
  const repositories = creerRepositoriesMemoire();
  const session = creerSessionUtilisateur({ idUtilisateur: 'utilisateur-1' });
  const contexte = creerContexteActifAuth('utilisateur-1', 'org-1');
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await repositories.depotContexteActifAuth.sauvegarder(contexte);

  const sessionService = new SessionApplicationService(
    repositories.depotSessionUtilisateur,
    repositories.depotRefreshToken,
    new SessionCachePortMemoire(),
  );
  const interdit = new ChangerEcoleActiveUseCase(
    sessionService,
    new ChangerContexteActifSaga(
      new TransactionManagerMemoire(),
      new ContexteActifApplicationService(
        repositories.depotContexteActifAuth,
        new SecurityAuthorizationPortMemoire(['org-1'], []),
        new TenantContextPortMemoire(true),
        new MoteurContexteActif(),
      ),
      sessionService,
    ),
  );
  await assert.rejects(() => interdit.executer({ sessionId: session.obtenirId(), ecoleActiveId: 'ecole-1' }));
});
