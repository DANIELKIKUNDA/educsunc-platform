import assert from 'node:assert/strict';
import test from 'node:test';
import { ControleurDiagnosticsRealtimeHttp, FacadeInfrastructureRealtime } from 'shared/realtime';

test('ControleurDiagnosticsRealtimeHttp expose une meta de duree exploitable', async () => {
  const controleur = new ControleurDiagnosticsRealtimeHttp(new FacadeInfrastructureRealtime());

  const reponse = await controleur.consulter({
    headers: { 'x-correlation-id': 'corr-latence-1' },
  });

  assert.equal(reponse.meta.correlationId, 'corr-latence-1');
  assert.equal(typeof reponse.meta.dureeMillisecondes, 'number');
  assert.equal(reponse.meta.dureeMillisecondes >= 0, true);
});
