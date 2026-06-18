import type { ConfigurationSecurityIncident } from '../ConfigurationSecurityIntegrationTypes';

// Ce fichier declare le bridge forensic Security.

export class ConfigurationSecurityForensicBridge {
  private readonly incidents: ConfigurationSecurityIncident[] = [];

  public enregistrer(incident: ConfigurationSecurityIncident): void {
    this.incidents.push(incident);
  }

  public journal(): readonly ConfigurationSecurityIncident[] {
    return [...this.incidents];
  }
}
