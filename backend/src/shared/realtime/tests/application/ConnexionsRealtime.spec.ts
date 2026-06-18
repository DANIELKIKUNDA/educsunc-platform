import assert from 'node:assert/strict';
import test from 'node:test';
import { OuvrirConnexionTempsReelUseCase } from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeTestSupport } from '../support/RealtimeTestSupport';

test('OuvrirConnexionTempsReelUseCase ouvre une connexion active', async () => {
  const environnement = RealtimeTestSupport.creerEnvironnement();
  const useCase = new OuvrirConnexionTempsReelUseCase(environnement.services.connexions);
  const resultat = await useCase.executer(RealtimeCommandFactory.connexion());
  assert.equal(resultat.statut, 'ACTIVE');
});
