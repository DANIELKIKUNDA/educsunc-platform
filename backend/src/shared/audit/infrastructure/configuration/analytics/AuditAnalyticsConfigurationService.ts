import type { AuditAnalyticsConfiguration } from '../ConfigurationTypes';

export class AuditAnalyticsConfigurationService {
  public obtenirParDefaut(): AuditAnalyticsConfiguration {
    return {
      frequenceAgregationMinutes: 15,
      seuilAnomalies: 10,
      retentionAnalyticsJours: 365,
      batchAnalytics: 1_000,
      refreshDashboardsMinutes: 5,
    };
  }

  public normaliser(partiel?: Partial<AuditAnalyticsConfiguration>): AuditAnalyticsConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
