import { MonitoringConfigurationMapper } from '../mappers/MonitoringConfigurationMapper';
import { MonitoringConfigurationRuntimeBridge } from '../runtime/MonitoringConfigurationRuntimeBridge';
import type {
  MonitoringConfigurationEvenement,
  MonitoringConfigurationProjection,
} from '../MonitoringConfigurationIntegrationTypes';

// Ce fichier orchestre le pont Configuration vers Monitoring.

export class MonitoringConfigurationIntegrationOrchestrator {
  public readonly runtime = new MonitoringConfigurationRuntimeBridge();

  public async synchroniserEvenement(evenement: MonitoringConfigurationEvenement): Promise<void> {
    const projection = MonitoringConfigurationMapper.appliquer(this.runtime.lireProjection(), evenement);
    this.runtime.appliquerProjection(projection);
  }

  public async projectionCourante(): Promise<MonitoringConfigurationProjection> {
    return this.runtime.lireProjection();
  }
}
