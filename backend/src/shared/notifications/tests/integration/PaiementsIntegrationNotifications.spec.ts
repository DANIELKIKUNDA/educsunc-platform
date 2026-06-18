import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsPaiementsIntegrationOrchestrator } from 'shared/notifications';
import { EvenementNotificationsTest } from '../support/NotificationsTestSupport';

test('le pont paiements-facturation traduit un paiement valide en intention de notification', async () => {
  const orchestrateur = new NotificationsPaiementsIntegrationOrchestrator();
  const evenement = new EvenementNotificationsTest('PaiementValide', {
    idPaiement: 'paiement-1',
    idEleve: 'eleve-1',
    idEcole: 'ecole-1',
  });

  const resultat = await orchestrateur.traiterEvenement({
    evenement,
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
  });

  assert.ok(resultat);
  assert.equal(resultat?.intention.type, 'PAIEMENT_RECU');
  assert.equal(resultat?.referenceMetier, 'paiement-1');
});
