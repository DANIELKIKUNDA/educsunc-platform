import '../../config/variables-environnement.config';

import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../plugins/request-context.plugin';
import { authenticationPlugin } from '../plugins/authentication.plugin';
import { securityPlugin } from '../plugins/security.plugin';
import { tenancyPlugin } from '../plugins/tenancy.plugin';
import { construireIdUtilisateurDeveloppeur, routeAuth, sessionDeveloppeurDisponible } from '../routes/auth.routes';

test('l identite developpeur reste stable apres un redemarrage du backend', () => {
  const premierId = construireIdUtilisateurDeveloppeur('MANAGER_SYSTEME');

  assert.equal(premierId, construireIdUtilisateurDeveloppeur('MANAGER_SYSTEME'));
  assert.match(premierId, /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-a[0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.notEqual(premierId, construireIdUtilisateurDeveloppeur('OPERATEUR_SYSTEME'));
});

test('la session developpeur reste interdite hors developpement', () => {
  assert.equal(sessionDeveloppeurDisponible('development'), true);
  assert.equal(sessionDeveloppeurDisponible('test'), false);
  assert.equal(sessionDeveloppeurDisponible('production'), false);
});

test('POST /api/auth/dev/session ouvre une vraie session backend reutilisable', async () => {
  const serveur = Fastify();

  try {
    await requestContextPlugin(serveur, {});
    await authenticationPlugin(serveur, {});
    await securityPlugin(serveur, {});
    await tenancyPlugin(serveur, {});
    await routeAuth(serveur, {});

    const ouverture = await serveur.inject({
      method: 'POST',
      url: '/api/auth/dev/session',
      payload: {
        actorCode: 'MANAGER_SYSTEME',
        organisationActiveId: 'org-archedu',
        ecoleActiveId: 'ecole-saint-raphael',
        deviceId: 'test-device',
      },
    });

    assert.equal(ouverture.statusCode, 200, ouverture.body);
    const corpsOuverture = ouverture.json() as {
      accessToken: string;
      sessionId: string;
      utilisateur: { idUtilisateur: string };
    };

    assert.ok(corpsOuverture.accessToken);
    assert.ok(corpsOuverture.sessionId);
    assert.ok(corpsOuverture.utilisateur.idUtilisateur);

    const session = await serveur.inject({
      method: 'GET',
      url: '/api/auth/session',
      headers: {
        authorization: `Bearer ${corpsOuverture.accessToken}`,
        'x-session-id': corpsOuverture.sessionId,
      },
    });

    assert.equal(session.statusCode, 200);
    const corpsSession = session.json() as {
      sessionId: string;
      utilisateurId: string;
      organisationActiveId?: string;
      ecoleActiveId?: string;
    };

    assert.equal(corpsSession.sessionId, corpsOuverture.sessionId);
    assert.equal(corpsSession.utilisateurId, corpsOuverture.utilisateur.idUtilisateur);
    assert.equal(corpsSession.organisationActiveId, 'org-archedu');
    assert.equal(corpsSession.ecoleActiveId, 'ecole-saint-raphael');
  } finally {
    await serveur.close();
  }
});

test('MANAGER_SYSTEME peut changer d organisation avec sa portee plateforme', async () => {
  const serveur = Fastify();

  try {
    await requestContextPlugin(serveur, {});
    await authenticationPlugin(serveur, {});
    await securityPlugin(serveur, {});
    await tenancyPlugin(serveur, {});
    await routeAuth(serveur, {});

    const ouverture = await serveur.inject({
      method: 'POST',
      url: '/api/auth/dev/session',
      payload: {
        actorCode: 'MANAGER_SYSTEME',
        organisationActiveId: 'org-archedu',
        ecoleActiveId: 'ecole-saint-raphael',
        deviceId: 'test-platform-scope',
      },
    });
    assert.equal(ouverture.statusCode, 200, ouverture.body);
    const session = ouverture.json() as { accessToken: string; sessionId: string };

    const changement = await serveur.inject({
      method: 'PUT',
      url: '/api/auth/contexte/organisation-active',
      headers: {
        authorization: `Bearer ${session.accessToken}`,
        'x-session-id': session.sessionId,
      },
      payload: { organisationActiveId: 'organisation-cible-plateforme' },
    });

    assert.equal(changement.statusCode, 200);
    assert.equal(changement.json().organisationActiveId, 'organisation-cible-plateforme');
  } finally {
    await serveur.close();
  }
});
