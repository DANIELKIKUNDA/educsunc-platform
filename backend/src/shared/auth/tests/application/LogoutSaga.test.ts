import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
import { LogoutSaga } from 'shared/auth/application/sagas/LogoutSaga';
import {
  SecurityAuditPortMemoire,
  SessionCachePortMemoire,
  TransactionManagerMemoire,
  creerRefreshToken,
  creerRepositoriesMemoire,
  creerSessionUtilisateur,
} from '../support/AuthTestSupport';

test('revocation complete avec invalidation cache et audit logout', async () => {
  const repositories = creerRepositoriesMemoire();
  const cache = new SessionCachePortMemoire();
  const audit = new SecurityAuditPortMemoire();
  const refreshToken = creerRefreshToken('utilisateur-1', 'refresh-1');
  const session = creerSessionUtilisateur({
    idUtilisateur: 'utilisateur-1',
    refreshTokenId: refreshToken.obtenirId(),
  });
  await repositories.depotRefreshToken.sauvegarder(refreshToken);
  await repositories.depotSessionUtilisateur.sauvegarder(session);

  const saga = new LogoutSaga(
    new TransactionManagerMemoire(),
    repositories.depotSessionUtilisateur,
    repositories.depotRefreshToken,
    cache,
    new AuditAuthApplicationService(audit),
  );
  await saga.executer({ sessionId: session.obtenirId() });
  await saga.executer({ sessionId: session.obtenirId() });
  assert.ok(audit.audits.some((entry) => entry.action === 'AUTH_LOGOUT'));
  assert.equal(
    (await repositories.depotRefreshToken.trouverParId(refreshToken.obtenirId()))?.obtenirRevoque(),
    true,
  );
});
