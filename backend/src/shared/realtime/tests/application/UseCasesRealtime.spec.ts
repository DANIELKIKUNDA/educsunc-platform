import assert from 'node:assert/strict';
import test from 'node:test';
import { PublierEvenementTempsReelUseCase } from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeTestSupport } from '../support/RealtimeTestSupport';

test('PublierEvenementTempsReelUseCase persiste un evenement diffusable', async () => {
  const environnement = RealtimeTestSupport.creerEnvironnement();
  const useCase = new PublierEvenementTempsReelUseCase(environnement.services.diffusion);
  const resultat = await useCase.executer(RealtimeCommandFactory.publication());
  assert.equal(resultat.diffusable, true);
});
