import test from 'node:test';
import assert from 'node:assert/strict';
import { AuditAuthApplicationService } from 'shared/auth/application/services/AuditAuthApplicationService';
import { AuthApplicationService } from 'shared/auth/application/services/AuthApplicationService';
import { LoginUseCase } from 'shared/auth/application/use-cases/LoginUseCase';
import { LoginSaga } from 'shared/auth/application/sagas/LoginSaga';
import { MoteurAuthentification } from 'shared/auth/domain/services/MoteurAuthentification';
import {
  SecurityAuthorizationPortMemoire,
  SecurityAuditPortMemoire,
  TransactionManagerMemoire,
  creerRepositoriesMemoire,
  creerUtilisateurAuth,
} from '../support/AuthTestSupport';

function creerLoginUseCase(autorisation = new SecurityAuthorizationPortMemoire()) {
  const transactionManager = new TransactionManagerMemoire();
  const auditPort = new SecurityAuditPortMemoire();
  const auditService = new AuditAuthApplicationService(auditPort);
  const repositories = creerRepositoriesMemoire();
  const saga = new LoginSaga(
    transactionManager,
    repositories.depotUtilisateurAuth,
    repositories.depotSessionUtilisateur,
    repositories.depotRefreshToken,
    repositories.depotContexteActifAuth,
    repositories.depotTentativeConnexion,
    autorisation,
    auditService,
    new MoteurAuthentification({
      verifierMotDePasse: (clair, hash) => clair === 'secret' && hash === 'hash-correct',
      genererJwt: (payload) => `jwt:${String(payload.sub)}`,
      genererRefreshTokenValue: () => 'refresh-brut',
      hacherRefreshToken: (valeur) => `hash:${valeur}`,
      calculerExpirationSession: () => new Date(Date.now() + 60_000),
    }),
  );

  return {
    repositories,
    auditPort,
    useCase: new LoginUseCase(new AuthApplicationService(
      saga,
      { executer: async () => undefined } as never,
      { executer: async () => ({ accessToken: '', refreshToken: '' }) } as never,
      { executer: async () => undefined } as never,
    )),
  };
}

test('login utilisateur valide retourne JWT, refresh token, session et contexte actif', async () => {
  const { repositories, useCase } = creerLoginUseCase();
  const utilisateur = creerUtilisateurAuth();
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);

  const resultat = await useCase.executer({
    email: utilisateur.obtenirEmail().obtenirValeur(),
    motDePasse: 'secret',
    organisationActiveId: 'org-1',
    ecoleActiveId: 'ecole-1',
  });

  assert.ok(resultat.accessToken.startsWith('jwt:'));
  assert.equal(resultat.refreshToken, 'refresh-brut');
  assert.ok(resultat.sessionId);
  assert.equal(resultat.organisationActiveId, 'org-1');
  assert.equal(resultat.ecoleActiveId, 'ecole-1');
});

test('mauvais mot de passe, compte suspendu et compte desactive sont rejetes', async () => {
  const setup = creerLoginUseCase();
  const utilisateur = creerUtilisateurAuth();
  await setup.repositories.depotUtilisateurAuth.sauvegarder(utilisateur);
  await assert.rejects(() => setup.useCase.executer({ email: utilisateur.obtenirEmail().obtenirValeur(), motDePasse: 'mauvais' }));

  const suspendu = creerUtilisateurAuth({ email: 'suspendu@test.cd' });
  suspendu.suspendreCompte();
  await setup.repositories.depotUtilisateurAuth.sauvegarder(suspendu);
  await assert.rejects(() => setup.useCase.executer({ email: suspendu.obtenirEmail().obtenirValeur(), motDePasse: 'secret' }));

  const desactive = creerUtilisateurAuth({ email: 'desactive@test.cd' });
  desactive.desactiverCompte();
  await setup.repositories.depotUtilisateurAuth.sauvegarder(desactive);
  await assert.rejects(() => setup.useCase.executer({ email: desactive.obtenirEmail().obtenirValeur(), motDePasse: 'secret' }));
});

test('organisation et ecole interdites sont rejetees', async () => {
  const { repositories, useCase } = creerLoginUseCase(new SecurityAuthorizationPortMemoire([], []));
  const utilisateur = creerUtilisateurAuth();
  await repositories.depotUtilisateurAuth.sauvegarder(utilisateur);

  await assert.rejects(() => useCase.executer({
    email: utilisateur.obtenirEmail().obtenirValeur(),
    motDePasse: 'secret',
    organisationActiveId: 'org-1',
  }));

  await assert.rejects(() => useCase.executer({
    email: utilisateur.obtenirEmail().obtenirValeur(),
    motDePasse: 'secret',
    ecoleActiveId: 'ecole-1',
  }));
});
