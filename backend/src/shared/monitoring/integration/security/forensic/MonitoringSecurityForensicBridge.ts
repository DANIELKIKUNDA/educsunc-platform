import type { MonitoringSecurityEvenement } from '../MonitoringSecurityIntegrationTypes';

// Ce fichier declare le pont forensic Security vers Monitoring.

export class MonitoringSecurityForensicBridge {
  private readonly evenements: MonitoringSecurityEvenement[] = [];

  public enregistrer(evenement: MonitoringSecurityEvenement): void {
    this.evenements.push(evenement);
  }

  public lister(): readonly MonitoringSecurityEvenement[] {
    return [...this.evenements];
  }
}
