import assert from 'node:assert/strict';
import test from 'node:test';
import { PropagateurConfiguration } from 'shared/configuration';

test('PropagateurConfiguration journalise les propagations', async () => {
  const propagateur = new PropagateurConfiguration();
  await propagateur.propagerConfiguration('config-1', ['notifications']);

  assert.equal(propagateur.journal().length, 1);
  assert.equal(propagateur.journal()[0]?.type, 'CONFIGURATION');
});
