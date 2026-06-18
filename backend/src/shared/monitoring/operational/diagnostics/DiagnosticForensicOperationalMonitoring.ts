import type { MonitoringSecurityEvenement } from '../../integration';
import type { InitialiseurRuntimeMonitoring } from '../../runtime';

// Ce fichier declare le diagnostic forensic operationnel du module Monitoring.

export class DiagnosticForensicOperationalMonitoring {
  constructor(private readonly runtime: ReturnType<InitialiseurRuntimeMonitoring['initialiser']>) {}

  public enregistrer(evenement: MonitoringSecurityEvenement): void {
    this.runtime.diagnostics.forensic.enregistrer(evenement);
  }

  public lister() {
    return this.runtime.diagnostics.forensic.lister();
  }
}
