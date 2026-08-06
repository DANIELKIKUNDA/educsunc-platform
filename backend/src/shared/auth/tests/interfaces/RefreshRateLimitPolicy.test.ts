import test from 'node:test';
import assert from 'node:assert/strict';
import { RateLimitMiddleware } from 'shared/auth/interfaces/http/middlewares/RateLimitMiddleware';
import { RefreshRateLimitPolicy } from 'shared/auth/interfaces/http/middlewares/RefreshRateLimitPolicy';

test('limite chaque session sans mutualiser le quota de tous les appareils', () => {
  const policy = new RefreshRateLimitPolicy(new RateLimitMiddleware());

  for (let index = 0; index < 10; index += 1) {
    policy.verifier({
      adresseIp: '10.0.0.1',
      corps: { sessionId: 'session-a' },
      headers: {},
    });
  }

  assert.throws(() => policy.verifier({
    adresseIp: '10.0.0.1',
    corps: { sessionId: 'session-a' },
    headers: {},
  }));
  assert.doesNotThrow(() => policy.verifier({
    adresseIp: '10.0.0.1',
    corps: { sessionId: 'session-b' },
    headers: {},
  }));
});

test('conserve une protection globale pour une adresse qui multiplie les sessions', () => {
  const policy = new RefreshRateLimitPolicy(new RateLimitMiddleware());

  for (let index = 0; index < 60; index += 1) {
    policy.verifier({
      adresseIp: '10.0.0.2',
      corps: { sessionId: `session-${index}` },
      headers: {},
    });
  }

  assert.throws(() => policy.verifier({
    adresseIp: '10.0.0.2',
    corps: { sessionId: 'session-61' },
    headers: {},
  }));
});

test('reconnait le meme appareil depuis le header ou le corps', () => {
  const policy = new RefreshRateLimitPolicy(new RateLimitMiddleware());

  for (let index = 0; index < 10; index += 1) {
    policy.verifier({
      adresseIp: '10.0.0.3',
      corps: {},
      headers: { 'x-session-id': 'session-partagee' },
    });
  }

  assert.throws(() => policy.verifier({
    adresseIp: '10.0.0.3',
    corps: { sessionId: 'session-partagee' },
    headers: {},
  }));
});
