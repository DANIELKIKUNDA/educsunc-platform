import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsBulletinsIntegrationOrchestrator } from 'shared/notifications';
import { EvenementNotificationsTest } from '../support/NotificationsTestSupport';

test('le pont bulletins-evaluations traduit un bulletin genere en notification disponible', async () => {
  const orchestrateur = new NotificationsBulletinsIntegrationOrchestrator();
  const evenement = new EvenementNotificationsTest('BulletinGenere', {
    idBulletinEleve: 'bulletin-1',
    idEleve: 'eleve-1',
  });

  const resultat = await orchestrateur.traiterEvenement({
    evenement,
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
  });

  assert.ok(resultat);
  assert.equal(resultat?.intention.type, 'BULLETIN_DISPONIBLE');
  assert.equal(resultat?.referenceMetier, 'bulletin-1');
});
