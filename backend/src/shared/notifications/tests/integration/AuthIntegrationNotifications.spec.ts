import assert from 'node:assert/strict';
import test from 'node:test';
import { NotificationsAuthIntegrationOrchestrator } from 'shared/notifications';

test('le pont auth memorise le contexte actif et repond aux autorisations', async () => {
  const orchestrateur = new NotificationsAuthIntegrationOrchestrator();

  await orchestrateur.synchroniserContexteActif({
    utilisateur: {
      idUtilisateur: 'user-1',
      nomComplet: 'User Test',
      email: 'user@test.local',
      etatCompte: 'ACTIF',
    } as never,
    contexteActif: {
      idOrganisationActive: 'org-1',
      idEcoleActive: 'ecole-1',
    } as never,
    session: {
      sessionId: 'session-1',
      utilisateurId: 'user-1',
      organisationActiveId: 'org-1',
      ecoleActiveId: 'ecole-1',
      estOffline: false,
    } as never,
    acteurId: 'acteur-1',
  });
  await orchestrateur.synchroniserPermissions({
    utilisateurId: 'user-1',
    actionsAutorisees: ['notifications.create'],
  });

  const autorise = await orchestrateur.estAutorise('notifications.create', {
    utilisateurId: 'user-1',
    organisationId: 'org-1',
    ecoleId: 'ecole-1',
  });
  const contexte = await orchestrateur.rechercherContexteActif({
    utilisateurId: 'user-1',
  });
  const preferences = await orchestrateur.construirePreferencesAuth({
    utilisateurId: 'user-1',
    metadata: {
      canalPrefere: 'EMAIL',
    },
  });

  assert.equal(autorise, true);
  assert.equal(contexte?.utilisateurId, 'user-1');
  assert.equal(preferences.canalPrefere, 'EMAIL');
});
