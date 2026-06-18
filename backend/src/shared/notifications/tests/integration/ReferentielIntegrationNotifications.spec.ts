import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsReferentielIntegrationOrchestrator } from 'shared/notifications';
import { EvenementNotificationsTest } from '../support/NotificationsTestSupport';

test('le pont referentiel-academique traduit une publication de referentiel en communication interne', async () => {
  const orchestrateur = new NotificationsReferentielIntegrationOrchestrator();
  const evenement = new EvenementNotificationsTest('VersionReferentielPubliee', {
    obtenirIdVersionReferentielProgramme: () => ({
      obtenirValeur: () => 'version-ref-1',
    }),
  });

  const resultat = await orchestrateur.traiterEvenement({
    evenement,
    organisationId: 'org-1',
  });

  assert.ok(resultat);
  assert.equal(resultat?.intention.type, 'COMMUNIQUE');
  assert.equal(resultat?.referenceMetier, 'version-ref-1');
});
