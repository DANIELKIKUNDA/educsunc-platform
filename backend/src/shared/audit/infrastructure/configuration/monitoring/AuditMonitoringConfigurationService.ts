import type { AuditMonitoringConfiguration } from '../ConfigurationTypes';

export class AuditMonitoringConfigurationService {
  public obtenirParDefaut(): AuditMonitoringConfiguration {
    return {
      thresholds: {
        queueDepth: 5_000,
        latencyMs: 5_000,
      },
      alertLimit: 1_000,
      retentionMonitoringJours: 90,
      volumetrieMax: 1_000_000,
      healthRules: ['QUEUE_DEPTH', 'ERROR_RATE', 'SYNC_LAG'],
      anomalyThresholds: {
        errorRate: 5,
        retryStorm: 50,
      },
    };
  }

  public normaliser(partiel?: Partial<AuditMonitoringConfiguration>): AuditMonitoringConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
      thresholds: {
        ...this.obtenirParDefaut().thresholds,
        ...partiel?.thresholds,
      },
      anomalyThresholds: {
        ...this.obtenirParDefaut().anomalyThresholds,
        ...partiel?.anomalyThresholds,
      },
      healthRules: [...new Set(partiel?.healthRules ?? this.obtenirParDefaut().healthRules)],
    };
  }
}
