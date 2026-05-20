import test from 'node:test';
import assert from 'node:assert/strict';
import { LoginController } from 'shared/auth/interfaces/http/controllers/LoginController';

test('POST /auth/login retourne JWT, refresh token, session et contexte actif', async () => {
  const controller = new LoginController({
    executer: async () => ({
      accessToken: 'jwt',
      refreshToken: 'refresh',
      sessionId: 'session-1',
      utilisateur: { idUtilisateur: 'u1', nomComplet: 'Jean', email: 'jean@test.cd', etatCompte: 'ACTIVE' },
      organisationActiveId: 'org-1',
      ecoleActiveId: 'ecole-1',
    }),
  } as never);

  const resultat = await controller.login({ email: 'jean@test.cd', motDePasse: 'secret' }, {});
  const donnee = resultat.donnee as Record<string, unknown>;
  assert.equal(donnee.accessToken, 'jwt');
  assert.equal(donnee.refreshToken, 'refresh');
  assert.equal(donnee.sessionId, 'session-1');
});
