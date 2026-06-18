import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ExceptionDiffusionRealtimeRefusee,
  PublierEvenementTempsReelUseCase,
} from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeTestSupport } from '../support/RealtimeTestSupport';

test('PublierEvenementTempsReelUseCase refuse une diffusion cross-ecole', async () => {
  const environnement = RealtimeTestSupport.creerEnvironnement();
  const useCase = new PublierEvenementTempsReelUseCase(environnement.services.diffusion);

  await assert.rejects(
    () =>
      useCase.executer(
        RealtimeCommandFactory.publication({
          ecoleId: 'ecole-a',
          contexte: {
            organisationId: 'org-1',
            ecoleId: 'ecole-b',
            utilisateurId: 'user-1',
            sessionId: 'session-1',
            permissions: ['notifications.read'],
            emittedAt: new Date().toISOString(),
          },
        }),
      ),
    ExceptionDiffusionRealtimeRefusee,
  );
});
