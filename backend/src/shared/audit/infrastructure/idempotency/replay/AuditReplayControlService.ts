import type { AuditIdempotencyKeyParts } from '../IdempotencyTypes';

// Le replay est volontaire, traçable et ne doit jamais mimer un nouvel evenement metier.
export class AuditReplayControlService {
  public preparer(parts: AuditIdempotencyKeyParts, replayId: string, raisonReplay?: string): AuditIdempotencyKeyParts {
    return {
      ...parts,
      replayId,
      sourceTraitement: raisonReplay ? `REPLAY:${raisonReplay}` : 'REPLAY_AUDIT',
    };
  }
}
