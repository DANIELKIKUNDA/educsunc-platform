import type { ConfigurationRuntimeSignal } from '../ConfigurationRuntimeIntegrationTypes';

// Ce fichier declare le listener Runtime.

export class ConfigurationRuntimeEventListener {
  private readonly journalSignals: ConfigurationRuntimeSignal[] = [];

  public async consommer(signal: ConfigurationRuntimeSignal): Promise<void> {
    this.journalSignals.push(signal);
  }

  public journal(): readonly ConfigurationRuntimeSignal[] {
    return [...this.journalSignals];
  }
}
