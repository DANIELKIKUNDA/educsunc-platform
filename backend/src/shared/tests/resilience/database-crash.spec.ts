import assert from 'node:assert/strict';
import test from 'node:test';

test('une erreur type crash DB remonte proprement et n est pas silencieuse', async () => {
  const operation = async (): Promise<void> => {
    throw new Error('DATABASE_CRASH');
  };
  await assert.rejects(operation, /DATABASE_CRASH/);
});
