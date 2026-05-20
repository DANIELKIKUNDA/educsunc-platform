import test from 'node:test';
import assert from 'node:assert/strict';
import { JwtAuthenticationMiddleware } from 'shared/auth/interfaces/http/middlewares/JwtAuthenticationMiddleware';
import { AuthenticationMiddleware } from 'shared/auth/infrastructure/middlewares/AuthenticationMiddleware';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';

test('JWT valide accepte', async () => {
  const jwt = new JwtTokenAdapter('secret');
  const token = await jwt.genererJwt({ sub: 'u1' });
  const middleware = new JwtAuthenticationMiddleware(new AuthenticationMiddleware(jwt));
  const payload = await middleware.authentifier({ authorization: `Bearer ${token}` });
  assert.equal(payload?.sub, 'u1');
});

test('JWT invalide ou expire refuse', async () => {
  const middleware = new JwtAuthenticationMiddleware(new AuthenticationMiddleware(new JwtTokenAdapter('secret')));
  await assert.rejects(() => middleware.authentifier({ authorization: 'Bearer faux.token' }));
});
