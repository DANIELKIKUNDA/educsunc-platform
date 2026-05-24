import type { AuditSynchronizationCheckpoint } from '../AuditSynchronizationIntegrationTypes';

const checkpoints = new Map<string, AuditSynchronizationCheckpoint>();

export class AuditSynchronizationCheckpointStore {
  public enregistrer(checkpoint: AuditSynchronizationCheckpoint): void {
    checkpoints.set(checkpoint.checkpointId, checkpoint);
  }

  public dernier(): AuditSynchronizationCheckpoint | null {
    return [...checkpoints.values()].at(-1) ?? null;
  }
}
