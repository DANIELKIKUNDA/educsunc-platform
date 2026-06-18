import type { CreateAlertCommand } from '../commands';
import type { AlertDto } from '../dto/output';
import { ApplicationAlertMonitoringService } from '../services';

// Ce fichier declare le use case de creation d une alerte.

/** Cette classe orchestre la creation applicative d une alerte. */
export class CreateAlertUseCase {
  constructor(private readonly service: ApplicationAlertMonitoringService) {}

  /** Cette methode execute la creation applicative. */
  public async executer(commande: CreateAlertCommand): Promise<AlertDto> {
    return this.service.creer(commande);
  }
}
