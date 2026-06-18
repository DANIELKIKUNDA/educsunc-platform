import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { authenticationPlugin } from '../../app/plugins/authentication.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeAuth } from '../../app/routes/auth.routes';
import { PasswordHashAdapter, PostgresContexteActifAuthRepository, PostgresUtilisateurAuthRepository } from '../../shared/auth/infrastructure';
import {
  creerContexteActifAuth,
  creerUtilisateurAuth,
  reinitialiserMemoireAuth,
} from '../../shared/auth/tests/support/AuthTestSupport';
import {
  creerAffectationUtilisateur,
  creerRole,
  reinitialiserMemoireSecurity,
} from '../../shared/security/tests/support/SecurityTestSupport';
import {
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
} from '../../shared/security/infrastructure';

test('les routes globales exposent le login AUTH et la lecture de session', async () => {
  reinitialiserMemoireAuth();
  reinitialiserMemoireSecurity();

  const passwordHashAdapter = new PasswordHashAdapter();
  const utilisateur = creerUtilisateurAuth({
    email: 'auth.integration@educsync.test',
  });
  utilisateur.changerMotDePasse(await passwordHashAdapter.hacherMotDePasse('secret-123'));

  const role = creerRole({
    codeRole: 'ADMINISTRATEUR_ECOLE',
    nomRole: 'Administrateur Ecole',
    permissions: ['eleves.read'],
    niveauAcces: 'ECOLE',
  });
  const affectation = creerAffectationUtilisateur({
    idUtilisateur: utilisateur.obtenirId(),
    idRole: role.obtenirId(),
    niveauAcces: 'ECOLE',
    idOrganisation: 'org-auth-1',
    idEcole: 'ecole-auth-1',
  });
  affectation.ajouterScope('ORGANISATION', 'org-auth-1');
  affectation.ajouterScope('ECOLE', 'ecole-auth-1');

  await new PostgresUtilisateurAuthRepository().sauvegarder(utilisateur);
  await new PostgresContexteActifAuthRepository().sauvegarder(
    creerContexteActifAuth(utilisateur.obtenirId(), 'org-auth-1', 'ecole-auth-1'),
  );
  await new PostgresRoleRepository().sauvegarder(role);
  await new PostgresAffectationUtilisateurRepository().sauvegarder(affectation);

  const serveur = Fastify();
  await serveur.register(async (instance) => {
    await requestContextPlugin(instance, {});
    await authenticationPlugin(instance, {});
    await securityPlugin(instance, {});
    await tenancyPlugin(instance, {});
    await instance.register(routeAuth);
  });

  const login = await serveur.inject({
    method: 'POST',
    url: '/api/auth/login',
    headers: {
      'x-device-id': 'device-auth-1',
    },
    payload: {
      email: 'auth.integration@educsync.test',
      motDePasse: 'secret-123',
      organisationActiveId: 'org-auth-1',
      ecoleActiveId: 'ecole-auth-1',
    },
  });

  assert.equal(login.statusCode, 200, login.body);
  const corpsLogin = login.json();
  assert.equal(corpsLogin.utilisateur.email, 'auth.integration@educsync.test');
  assert.equal(corpsLogin.organisationActiveId, 'org-auth-1');
  assert.equal(corpsLogin.ecoleActiveId, 'ecole-auth-1');

  const session = await serveur.inject({
    method: 'GET',
    url: '/api/auth/session',
    headers: {
      authorization: `Bearer ${corpsLogin.accessToken}`,
      'x-session-id': corpsLogin.sessionId,
    },
  });

  assert.equal(session.statusCode, 200, session.body);
  assert.equal(session.json().sessionId, corpsLogin.sessionId);

  await serveur.close();
});
