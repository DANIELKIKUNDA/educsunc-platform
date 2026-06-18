import assert from 'node:assert/strict';
import test from 'node:test';
import { MappeurEvenementVersIntentionNotification } from 'shared/notifications/application';

test('le mappeur d evenement produit un DTO de creation avec ses valeurs par defaut', () => {
  const dto = MappeurEvenementVersIntentionNotification.convertir({
    type: 'INFORMATION_GENERALE',
    portee: 'USER',
    source: 'SYSTEM_EVENT',
    message: 'Message mappe',
  });

  assert.equal(dto.priorite, 'NORMAL');
  assert.equal(dto.temporalite, 'IMMEDIATE');
  assert.equal(dto.visibilite, 'PRIVATE');
  assert.deepEqual(dto.canaux, ['IN_APP']);
  assert.equal(dto.message, 'Message mappe');
});
