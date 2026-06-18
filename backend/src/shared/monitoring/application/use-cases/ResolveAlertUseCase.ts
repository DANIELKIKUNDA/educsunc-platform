import type { ResolveAlertCommand } from '../commands';
import type { AlertDto } from '../dto/output';
import { ApplicationAlertMonitoringService } from '../services';

// Ce fichier declare le use case de resolution d une alerte.

/** Cette classe orchestre la resolution applicative d une alerte. */
export class ResolveAlertUseCase {
  constructor(private readonly service: ApplicationAlertMonitoringService) {}

  /** Cette methode execute la resolution applicative. */
  public async executer(commande: ResolveAlertCommand): Promise<AlertDto> {
    return this.service.resoudre(commande);
  }
}
