import '../../config/variables-environnement.config';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import Fastify from 'fastify';
import { authenticationPlugin } from '../../app/plugins/authentication.plugin';
import { requestContextPlugin } from '../../app/plugins/request-context.plugin';
import { securityPlugin } from '../../app/plugins/security.plugin';
import { tenancyPlugin } from '../../app/plugins/tenancy.plugin';
import { routeAuth } from '../../app/routes/auth.routes';
import { MigrateurPostgresAuth, PasswordHashAdapter, PostgresContexteActifAuthRepository, PostgresUtilisateurAuthRepository, obtenirPoolPostgresAuth } from '../../shared/auth/infrastructure';
import { MigrateurPostgresAudit } from '../../shared/audit/infrastructure';
import {
  creerContexteActifAuth,
  creerUtilisateurAuth,
  reinitialiserMemoireAuth,
} from '../../shared/auth/tests/support/AuthTestSupport';
import {
  creerAffectationUtilisateur,
  reinitialiserMemoireSecurity,
} from '../../shared/security/tests/support/SecurityTestSupport';
import {
  PostgresAffectationUtilisateurRepository,
  PostgresRoleRepository,
  MigrateurPostgresSecurity,
} from '../../shared/security/infrastructure';

test('les routes globales exposent le login AUTH et la lecture de session', async (contexteTest) => {
  reinitialiserMemoireAuth();
  reinitialiserMemoireSecurity();
  await new MigrateurPostgresAuth(obtenirPoolPostgresAuth()).executerToutes();
  await new MigrateurPostgresAudit(obtenirPoolPostgresAuth()).executerToutes();
  await new MigrateurPostgresSecurity(obtenirPoolPostgresAuth()).executerToutes();

  const passwordHashAdapter = new PasswordHashAdapter();
  const suffixe = randomUUID();
  const email = `auth.integration.${suffixe}@educsync.test`;
  const utilisateur = creerUtilisateurAuth({
    email,
  });
  contexteTest.after(async () => {
    const pool = obtenirPoolPostgresAuth();
    await pool.query('DELETE FROM security_affectations_utilisateurs WHERE id_utilisateur = $1', [utilisateur.obtenirId()]);
    await pool.query('DELETE FROM auth_sessions_utilisateurs WHERE id_utilisateur = $1', [utilisateur.obtenirId()]);
    await pool.query('DELETE FROM auth_contextes_actifs WHERE id_utilisateur = $1', [utilisateur.obtenirId()]);
    await pool.query('DELETE FROM auth_tentatives_connexion WHERE email = $1', [email]);
    await pool.query('DELETE FROM auth_refresh_tokens WHERE id_utilisateur = $1', [utilisateur.obtenirId()]);
    await pool.query('DELETE FROM auth_utilisateurs WHERE id_utilisateur = $1', [utilisateur.obtenirId()]);
  });
  utilisateur.changerMotDePasse(await passwordHashAdapter.hacherMotDePasse('secret-123'));

  const roleRepository = new PostgresRoleRepository();
  const role = await roleRepository.trouverParCode('ADMINISTRATEUR_ECOLE');
  assert.ok(role, 'Le rôle système ADMINISTRATEUR_ECOLE doit être initialisé par la migration Security.');
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
      email,
      motDePasse: 'secret-123',
      organisationActiveId: 'org-auth-1',
      ecoleActiveId: 'ecole-auth-1',
    },
  });

  assert.equal(login.statusCode, 200, login.body);
  const corpsLogin = login.json();
  assert.equal(corpsLogin.utilisateur.email, email);
  assert.equal(corpsLogin.organisationActiveId, 'org-auth-1');
  assert.equal(corpsLogin.ecoleActiveId, 'ecole-auth-1');

  const sessionAnonyme = await serveur.inject({
    method: 'GET',
    url: '/api/auth/session',
  });
  assert.equal(sessionAnonyme.statusCode, 401, sessionAnonyme.body);
  assert.equal(sessionAnonyme.json().code, 'AUTHENTICATION_REQUIRED');

  const contexteEtranger = await serveur.inject({
    method: 'GET',
    url: '/api/auth/session',
    headers: {
      authorization: `Bearer ${corpsLogin.accessToken}`,
      'x-session-id': corpsLogin.sessionId,
      'x-organisation-id': 'organisation-etrangere',
    },
  });
  assert.equal(contexteEtranger.statusCode, 403, contexteEtranger.body);
  assert.equal(contexteEtranger.json().code, 'ACTIVE_CONTEXT_MISMATCH');

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

  const logout = await serveur.inject({
    method: 'POST',
    url: '/api/auth/logout',
    headers: {
      authorization: `Bearer ${corpsLogin.accessToken}`,
      'x-session-id': corpsLogin.sessionId,
    },
    payload: { sessionId: corpsLogin.sessionId },
  });
  assert.equal(logout.statusCode, 200, logout.body);

  const sessionRevoquee = await serveur.inject({
    method: 'GET',
    url: '/api/auth/session',
    headers: {
      authorization: `Bearer ${corpsLogin.accessToken}`,
      'x-session-id': corpsLogin.sessionId,
    },
  });
  assert.equal(sessionRevoquee.statusCode, 401, sessionRevoquee.body);
  assert.equal(sessionRevoquee.json().code, 'AUTHENTICATION_INVALID');

  await serveur.close();
});
