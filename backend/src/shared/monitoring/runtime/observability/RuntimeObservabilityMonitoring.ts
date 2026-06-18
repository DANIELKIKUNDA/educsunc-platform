import type { GetObservabilitySnapshotQuery } from '../../application';
import { GetObservabilitySnapshotUseCase } from '../../application';

// Ce fichier declare le runtime d observabilite Monitoring.

export class RuntimeObservabilityMonitoring {
  constructor(private readonly useCase: GetObservabilitySnapshotUseCase) {}

  public async lire(commande: GetObservabilitySnapshotQuery) {
    return this.useCase.executer(commande);
  }
}
