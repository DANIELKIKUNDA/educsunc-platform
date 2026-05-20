import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
import { LoginSaga } from 'shared/auth/application/sagas/LoginSaga';
import { MoteurAuthentification } from 'shared/auth/domain/services/MoteurAuthentification';
import {
  SecurityAuthorizationPortMemoire,
  SecurityAuditPortMemoire,
  TransactionManagerMemoire,
  creerRepositoriesMemoire,
  creerUtilisateurAuth,
} from '../support/AuthTestSupport';

test('orchestration login complete avec audit, session et jetons', async () => {
  const repositories = creerRepositoriesMemoire();
  const audit = new SecurityAuditPortMemoire();
  const utilisateur = creerUtilisateurAuth();
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);

  const saga = new LoginSaga(
    new TransactionManagerMemoire(),
    repositories.depotUtilisateurAuth,
    repositories.depotContexteActifAuth,
    repositories.depotTentativeConnexion,
    new SecurityAuthorizationPortMemoire(['org-1'], ['ecole-1']),
    new AuditAuthApplicationService(audit),
    new MoteurAuthentification({
      verifierMotDePasse: () => true,
      genererJwt: () => 'jwt',
      genererRefreshTokenValue: () => 'refresh',
      hacherRefreshToken: () => 'hash:refresh',
    }),
  );

  const resultat = await saga.executer({ email: utilisateur.obtenirEmail().obtenirValeur(), motDePasse: 'ok', organisationActiveId: 'org-1', ecoleActiveId: 'ecole-1' });
  assert.equal(resultat.accessToken, 'jwt');
  assert.equal(resultat.refreshToken, 'refresh');
  assert.ok(audit.connexions.length > 0);
});
