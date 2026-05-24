import type { AuditRetryConfiguration } from '../ConfigurationTypes';

export class AuditRetryConfigurationService {
  public obtenirParDefaut(): AuditRetryConfiguration {
    return {
      retryLimit: 5,
      retryBackoffMs: 5_000,
      retryThrottlePerMinute: 120,
      deadLetterAfter: 5,
    };
  }

  public normaliser(partiel?: Partial<AuditRetryConfiguration>): AuditRetryConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
