import type { EscalateIncidentCommand } from '../commands';
import type { IncidentDto } from '../dto/output';
import { ApplicationIncidentMonitoringService } from '../services';

// Ce fichier declare le use case d escalade d incident.

/** Cette classe orchestre l escalade applicative d un incident. */
export class EscalateIncidentUseCase {
  constructor(private readonly service: ApplicationIncidentMonitoringService) {}

  /** Cette methode execute l escalade applicative. */
  public async executer(commande: EscalateIncidentCommand): Promise<IncidentDto> {
    return this.service.escalader(commande);
  }
}
