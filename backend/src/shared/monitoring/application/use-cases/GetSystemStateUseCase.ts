import type { GetSystemStateQuery } from '../queries';
import type { SystemStateDto } from '../dto/output';
import { ApplicationHealthMonitoringService } from '../services';

// Ce fichier declare le use case de lecture d etat systeme.

/** Cette classe orchestre la lecture applicative de l etat systeme. */
export class GetSystemStateUseCase {
  constructor(private readonly service: ApplicationHealthMonitoringService) {}

  /** Cette methode execute la lecture applicative. */
  public async executer(query: GetSystemStateQuery): Promise<SystemStateDto> {
    return this.service.calculerEtat(query.contexte);
  }
}
