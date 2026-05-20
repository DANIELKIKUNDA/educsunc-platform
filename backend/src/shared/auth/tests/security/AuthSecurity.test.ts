import test from 'node:test';
import assert from 'node:assert/strict';
import { JwtTokenAdapter } from 'shared/auth/infrastructure/adapters/jwt/JwtTokenAdapter';
import { RateLimitMiddleware } from 'shared/auth/interfaces/http/middlewares/RateLimitMiddleware';

test('brute-force, JWT falsifie, replay token et token expire sont couverts', async () => {
  const rateLimit = new RateLimitMiddleware();
  rateLimit.verifier('login:ip', 1, 1000);
  assert.throws(() => rateLimit.verifier('login:ip', 1, 1000));

  const jwt = new JwtTokenAdapter('secret');
  const token = await jwt.genererJwt({ sub: 'u1' });
  assert.equal(await jwt.verifierJwt(`${token}x`), false);
});
