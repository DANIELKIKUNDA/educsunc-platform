import type { MonitoringSecurityEvenement } from '../../integration';
import { MonitoringSecurityForensicBridge } from '../../integration';

// Ce fichier declare le runtime de diagnostics forensic.

export class RuntimeForensicDiagnosticsMonitoring {
  constructor(private readonly bridge = new MonitoringSecurityForensicBridge()) {}

  public enregistrer(evenement: MonitoringSecurityEvenement): void {
    this.bridge.enregistrer(evenement);
  }

  public lister(): readonly MonitoringSecurityEvenement[] {
    return this.bridge.lister();
  }
}
