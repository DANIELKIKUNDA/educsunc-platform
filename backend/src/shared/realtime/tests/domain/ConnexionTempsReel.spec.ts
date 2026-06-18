import assert from 'node:assert/strict';
import test from 'node:test';
import { ContexteTempsReel, ConnexionTempsReel, RealtimeId, StatutConnexionRealtime } from 'shared/realtime';

test('ConnexionTempsReel passe en CLOSED quand on la ferme', () => {
  const connexion = new ConnexionTempsReel(
    new RealtimeId('conn-1'),
    'user-1',
    new ContexteTempsReel({
      permissions: ['notifications.read'],
      emittedAt: new Date().toISOString(),
    }),
  );
  connexion.fermer();
  assert.equal(connexion.obtenirStatut(), StatutConnexionRealtime.CLOSED);
});
