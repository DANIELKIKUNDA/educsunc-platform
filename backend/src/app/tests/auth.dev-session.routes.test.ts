import assert from 'node:assert/strict';
import test from 'node:test';
import Fastify from 'fastify';
import { requestContextPlugin } from '../plugins/request-context.plugin';
import { authenticationPlugin } from '../plugins/authentication.plugin';
import { securityPlugin } from '../plugins/security.plugin';
import { tenancyPlugin } from '../plugins/tenancy.plugin';
import { routeAuth } from '../routes/auth.routes';

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

    assert.equal(ouverture.statusCode, 200);
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
