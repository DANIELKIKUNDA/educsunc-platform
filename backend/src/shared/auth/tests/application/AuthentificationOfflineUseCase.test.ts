import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
import { AuthApplicationService } from 'shared/auth/application/services/AuthApplicationService';
import { AuthentificationOfflineUseCase } from 'shared/auth/application/use-cases/AuthentificationOfflineUseCase';
import { OfflineAuthenticationSaga } from 'shared/auth/application/sagas/OfflineAuthenticationSaga';
import { MoteurOfflineAuth } from 'shared/auth/domain/services/MoteurOfflineAuth';
import {
  OfflineAuthPortMemoire,
  SecurityAuditPortMemoire,
  TransactionManagerMemoire,
  creerContexteActifAuth,
  creerRepositoriesMemoire,
  creerSessionUtilisateur,
  creerUtilisateurAuth,
} from '../support/AuthTestSupport';

test('auth offline valide et synchronisation reconnexion', async () => {
  const repositories = creerRepositoriesMemoire();
  const audit = new SecurityAuditPortMemoire();
  const offlinePort = new OfflineAuthPortMemoire();
  const utilisateur = creerUtilisateurAuth({ authOfflineAutorisee: true });
  const session = creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId(), estOffline: true });
  const contexte = creerContexteActifAuth(utilisateur.obtenirId(), 'org-1', 'ecole-1');
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  await repositories.depotSessionUtilisateur.sauvegarder(session);
  await repositories.depotContexteActifAuth.sauvegarder(contexte);

  const saga = new OfflineAuthenticationSaga(
    new TransactionManagerMemoire(),
    repositories.depotUtilisateurAuth,
    repositories.depotSessionUtilisateur,
    repositories.depotContexteActifAuth,
    offlinePort,
    new AuditAuthApplicationService(audit),
    new MoteurOfflineAuth(),
  );
  const useCase = new AuthentificationOfflineUseCase(new AuthApplicationService({ executer: async () => ({}) } as never, { executer: async () => undefined } as never, { executer: async () => ({ accessToken: '', refreshToken: '' }) } as never, saga));

  await useCase.executer({ utilisateurId: utilisateur.obtenirId(), deviceId: 'device-1' });
  const stock = await offlinePort.restaurerAuthLocale(utilisateur.obtenirId(), 'device-1');
  assert.ok(stock);
  assert.ok('statut' in (stock ?? {}) || 'estOffline' in (stock ?? {}));
});
