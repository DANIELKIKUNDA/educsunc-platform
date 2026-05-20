import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
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

test('auth offline, synchronisation et reprise connexion', async () => {
  const repositories = creerRepositoriesMemoire();
  const audit = new SecurityAuditPortMemoire();
  const offline = new OfflineAuthPortMemoire();
  const utilisateur = creerUtilisateurAuth({ authOfflineAutorisee: true });
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  await repositories.depotSessionUtilisateur.sauvegarder(creerSessionUtilisateur({ idUtilisateur: utilisateur.obtenirId(), estOffline: true }));
  await repositories.depotContexteActifAuth.sauvegarder(creerContexteActifAuth(utilisateur.obtenirId(), 'org-1', 'ecole-1'));

  const saga = new OfflineAuthenticationSaga(
    new TransactionManagerMemoire(),
    repositories.depotUtilisateurAuth,
    repositories.depotSessionUtilisateur,
    repositories.depotContexteActifAuth,
    offline,
    new AuditAuthApplicationService(audit),
    new MoteurOfflineAuth(),
  );

  await saga.executer({ utilisateurId: utilisateur.obtenirId(), deviceId: 'device-1' });
  assert.ok(await offline.restaurerAuthLocale(utilisateur.obtenirId(), 'device-1'));
  assert.ok(audit.audits.some((entry) => entry.action === 'AUTH_OFFLINE_PREPAREE'));
});
