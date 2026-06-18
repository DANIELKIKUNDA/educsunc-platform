import assert from 'node:assert/strict';
import test from 'node:test';
import { TentativeLivraison } from 'shared/notifications/domain';

test('une tentative de livraison suit un echec puis un succes de facon traçable', () => {
  const tentative = TentativeLivraison.creer(
    'tentative-1',
    'EMAIL',
    'provider-notification-email',
    'org-1',
    'ecole-1',
    0,
  );

  tentative.marquerEchec('smtp indisponible');
  assert.equal(tentative.obtenirStatut(), 'FAILED');
  assert.equal(tentative.obtenirCompteurRetry(), 1);
  assert.equal(tentative.erreur, 'smtp indisponible');

  tentative.marquerSucces('250 Accepted');
  assert.equal(tentative.obtenirStatut(), 'SENT');
  assert.equal(tentative.resultat, '250 Accepted');
});
