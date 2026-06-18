import type { DiagnosticIncident, IncidentSysteme } from '../../domain';

// Ce fichier declare le port applicatif de gestion des incidents.

/** Cette interface represente le pont vers les incidents et diagnostics. */
export interface MonitoringIncidentPort {
  enregistrerIncident(incident: IncidentSysteme): Promise<void>;
  retrouverIncident(incidentId: string): Promise<IncidentSysteme | null>;
  listerIncidents(): Promise<readonly IncidentSysteme[]>;
  enregistrerDiagnostic(diagnostic: DiagnosticIncident): Promise<void>;
  listerDiagnostics(): Promise<readonly DiagnosticIncident[]>;
}
