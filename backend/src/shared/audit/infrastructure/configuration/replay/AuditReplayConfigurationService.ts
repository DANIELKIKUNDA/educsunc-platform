import type { AuditReplayConfiguration } from '../ConfigurationTypes';

export class AuditReplayConfigurationService {
  public obtenirParDefaut(): AuditReplayConfiguration {
    return {
      replayBatch: 100,
      replayWindowHours: 24,
      replayDepth: 1_000,
      replayThrottlePerMinute: 60,
    };
  }

  public normaliser(partiel?: Partial<AuditReplayConfiguration>): AuditReplayConfiguration {
    return {
      ...this.obtenirParDefaut(),
      ...partiel,
    };
  }
}
