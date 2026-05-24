import type { AuditSynchronizationCheckpointDto } from '../dto';

export class AuditSynchronizationCheckpointsInterface {
  public static creer(sortie?: Partial<AuditSynchronizationCheckpointDto>): AuditSynchronizationCheckpointDto {
    return {
      dernierEvenement: sortie?.dernierEvenement,
      derniereProjection: sortie?.derniereProjection,
      dernierReplay: sortie?.dernierReplay,
      derniereQueue: sortie?.derniereQueue,
      derniereSynchronisationValide: sortie?.derniereSynchronisationValide,
    };
  }
}

