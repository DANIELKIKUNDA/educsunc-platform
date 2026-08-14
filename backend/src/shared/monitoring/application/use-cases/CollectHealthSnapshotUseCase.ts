import type { CollectHealthSnapshotCommand } from '../commands';
import type { HealthSnapshotDto } from '../dto/output';
import { ApplicationAlertingEngineService, ApplicationHealthMonitoringService } from '../services';

// Ce fichier declare le use case de collecte d un snapshot de sante.

/** Cette classe orchestre la collecte applicative d un snapshot de sante. */
export class CollectHealthSnapshotUseCase {
  constructor(
    private readonly service: ApplicationHealthMonitoringService,
    private readonly alerting?: ApplicationAlertingEngineService,
  ) {}

  /** Cette methode execute la collecte applicative. */
  public async executer(commande: CollectHealthSnapshotCommand): Promise<HealthSnapshotDto> {
    const snapshot = await this.service.produireSnapshot(commande.contexte);
    if (this.alerting) await this.alerting.reconciler(snapshot, commande.contexte);
    return snapshot;
  }
}
