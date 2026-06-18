import type { OpenIncidentCommand } from '../commands';
import type { IncidentDto } from '../dto/output';
import { ApplicationIncidentMonitoringService } from '../services';

// Ce fichier declare le use case d ouverture d incident.

/** Cette classe orchestre l ouverture applicative d un incident. */
export class OpenIncidentUseCase {
  constructor(private readonly service: ApplicationIncidentMonitoringService) {}

  /** Cette methode execute l ouverture applicative. */
  public async executer(commande: OpenIncidentCommand): Promise<IncidentDto> {
    return this.service.ouvrir(commande);
  }
}
