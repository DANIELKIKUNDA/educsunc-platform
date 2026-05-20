import assert from 'node:assert/strict';
import test from 'node:test';

test('une perte reseau simulée reste detectable et rattrapable', async () => {
  let tentatives = 0;
  const operation = async (): Promise<string> => {
    tentatives += 1;
    if (tentatives < 2) {
      throw new Error('NETWORK_LOSS');
    }
    return 'OK';
  };

  await assert.rejects(operation(), /NETWORK_LOSS/);
  assert.equal(await operation(), 'OK');
});
