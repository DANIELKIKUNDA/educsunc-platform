import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsScolariteIntegrationOrchestrator } from 'shared/notifications';
import type { NotificationScolariteEvenementLike } from '../../integration/scolarite-eleves/NotificationsScolariteIntegrationTypes';

test('le pont scolarite-eleves traduit une inscription validee en notification scolaire', async () => {
  const orchestrateur = new NotificationsScolariteIntegrationOrchestrator();
  const evenement: NotificationScolariteEvenementLike = {
    idEvenement: 'evt-inscription-1',
    typeEvenement: 'INSCRIPTION_VALIDEE',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    declenchePar: 'acteur-1',
    referenceMetier: 'inscription-1',
  };

  const resultat = await orchestrateur.traiterEvenement({
    evenement,
  });

  assert.ok(resultat);
  assert.equal(resultat?.intention.type, 'INSCRIPTION_VALIDEE');
});
