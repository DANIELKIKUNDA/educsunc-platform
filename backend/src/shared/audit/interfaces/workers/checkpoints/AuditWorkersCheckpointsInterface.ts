import type { AuditWorkerCheckpointDto } from '../dto';
export class AuditWorkersCheckpointsInterface {
  public static creer(): AuditWorkerCheckpointDto {
    return { replayCheckpoint: 'replay-0', syncCheckpoint: 'sync-0', projectionCheckpoint: 'projection-0', exportCheckpoint: 'export-0' };
  }
}

