import assert from 'node:assert/strict';
import test from 'node:test';
import {
  ExceptionDiffusionRealtimeRefusee,
  PublierEvenementTempsReelUseCase,
} from 'shared/realtime';
import { RealtimeCommandFactory } from '../factories/RealtimeCommandFactory';
import { RealtimeTestSupport } from '../support/RealtimeTestSupport';

test('PublierEvenementTempsReelUseCase refuse une audience sans permissions autorisees', async () => {
  const environnement = RealtimeTestSupport.creerEnvironnement();
  const useCase = new PublierEvenementTempsReelUseCase(environnement.services.diffusion);

  await assert.rejects(
    () =>
      useCase.executer(
        RealtimeCommandFactory.publication({
          permissionsRequises: ['notifications.read'],
          contexte: {
            organisationId: 'org-1',
            ecoleId: 'ecole-1',
            utilisateurId: 'user-1',
            sessionId: 'session-1',
            permissions: ['bulletins.read'],
            emittedAt: new Date().toISOString(),
          },
        }),
      ),
    ExceptionDiffusionRealtimeRefusee,
  );
});

test('PublierEvenementTempsReelUseCase refuse un contexte sans session active', async () => {
  const environnement = RealtimeTestSupport.creerEnvironnement();
  const useCase = new PublierEvenementTempsReelUseCase(environnement.services.diffusion);

  await assert.rejects(
    () =>
      useCase.executer(
        RealtimeCommandFactory.publication({
          contexte: {
            organisationId: 'org-1',
            ecoleId: 'ecole-1',
            utilisateurId: 'user-1',
            permissions: ['notifications.read'],
            emittedAt: new Date().toISOString(),
          },
        }),
      ),
    ExceptionDiffusionRealtimeRefusee,
  );
});
