import type { AuditRuntimeConfiguration } from '../ConfigurationTypes';

export class AuditRuntimeConfigurationService {
  public obtenirParDefaut(): AuditRuntimeConfiguration {
    return {
      batchSize: 250,
      retryLimit: 5,
      replayLimit: 5,
      retentionDays: 365,
      queueSize: 10_000,
      exportExpirationHours: 72,
      monitoringThresholds: {
        latencyMs: 5_000,
        queueDepth: 5_000,
      },
    };
  }

  public normaliser(partiel?: Partial<AuditRuntimeConfiguration>): AuditRuntimeConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
      monitoringThresholds: {
        ...this.obtenirParDefaut().monitoringThresholds,
        ...partiel?.monitoringThresholds,
      },
    };
  }
}
