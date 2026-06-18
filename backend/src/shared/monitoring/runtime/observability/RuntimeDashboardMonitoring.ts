import type { GetDashboardMonitoringQuery } from '../../application';
import { GetDashboardMonitoringUseCase } from '../../application';

// Ce fichier declare le runtime de tableau de bord Monitoring.

export class RuntimeDashboardMonitoring {
  constructor(private readonly useCase: GetDashboardMonitoringUseCase) {}

  public async lire(commande: GetDashboardMonitoringQuery) {
    return this.useCase.executer(commande);
  }
}
