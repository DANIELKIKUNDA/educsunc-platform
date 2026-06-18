import type { MonitoringConfigurationProjection } from '../MonitoringConfigurationIntegrationTypes';

// Ce fichier declare le pont runtime Configuration vers Monitoring.

export class MonitoringConfigurationRuntimeBridge {
  private projection: MonitoringConfigurationProjection = {
    thresholds: {},
    retentionDays: 30,
    runtime: {},
  };

  public appliquerProjection(projection: MonitoringConfigurationProjection): void {
    this.projection = {
      thresholds: { ...projection.thresholds },
      retentionDays: projection.retentionDays,
      runtime: { ...projection.runtime },
    };
  }

  public lireProjection(): MonitoringConfigurationProjection {
    return {
      thresholds: { ...this.projection.thresholds },
      retentionDays: this.projection.retentionDays,
      runtime: { ...this.projection.runtime },
    };
  }
}
