import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ControleurRealtimeHttp,
  DiffuserMessageTempsReelUseCase,
  ObtenirEtatRealtimeUseCase,
  PublierEvenementTempsReelUseCase,
  VerifierDiffusabiliteRealtimeUseCase,
} from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeTestSupport } from '../support/RealtimeTestSupport';

test('ControleurRealtimeHttp enveloppe une publication avec meta HTTP', async () => {
  const environnement = RealtimeTestSupport.creerEnvironnement();
  const controleur = new ControleurRealtimeHttp(
    new PublierEvenementTempsReelUseCase(environnement.services.diffusion),
    new DiffuserMessageTempsReelUseCase(environnement.services.diffusion),
    new ObtenirEtatRealtimeUseCase(environnement.services.etat),
    new VerifierDiffusabiliteRealtimeUseCase(environnement.services.diffusion),
  );
  const reponse = await controleur.publier({
    body: RealtimeCommandFactory.publication(),
    headers: { 'x-correlation-id': 'corr-1' },
  });
  assert.equal(reponse.statutHttp, 202);
  assert.equal(reponse.meta.correlationId, 'corr-1');
});
