import test from 'node:test';
import assert from 'node:assert/strict';
import { LogoutController } from 'shared/auth/interfaces/http/controllers/LogoutController';

test('POST /auth/logout supprime la session', async () => {
  let sessionIdRecu = '';
  const controller = new LogoutController({
    executer: async ({ sessionId }: { sessionId: string }) => { sessionIdRecu = sessionId; },
  } as never);

  const resultat = await controller.logout({}, { 'x-session-id': 'session-1' });
  assert.equal(sessionIdRecu, 'session-1');
  assert.deepEqual(resultat.donnee, { succes: true });
});
