import test from 'node:test';
import assert from 'node:assert/strict';
import { RefreshTokenController } from 'shared/auth/interfaces/http/controllers/RefreshTokenController';

test('POST /auth/refresh retourne de nouveaux tokens', async () => {
  const controller = new RefreshTokenController({
    executer: async () => ({ accessToken: 'jwt-2', refreshToken: 'refresh-2', sessionId: 'session-1' }),
  } as never);

  const resultat = await controller.rafraichir({ refreshToken: 'refresh-1', sessionId: 'session-1' }, {});
  const donnee = resultat.donnee as Record<string, unknown>;
  assert.equal(donnee.accessToken, 'jwt-2');
  assert.equal(donnee.refreshToken, 'refresh-2');
});
