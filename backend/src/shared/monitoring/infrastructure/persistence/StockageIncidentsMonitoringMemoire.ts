import type { DiagnosticIncident, IncidentSysteme } from '../../domain';
import type {
  EntreeStockageDiagnosticMonitoring,
  EntreeStockageIncidentMonitoring,
} from './TypesPersistenceMonitoring';

// Ce fichier declare le stockage memoire des incidents Monitoring.

/** Cette classe represente le stockage local des incidents et diagnostics. */
export class StockageIncidentsMonitoringMemoire {
  private readonly incidents = new Map<string, EntreeStockageIncidentMonitoring>();
  private readonly diagnostics = new Map<string, EntreeStockageDiagnosticMonitoring[]>();

  /** Cette methode enregistre un incident dans le stockage local. */
  public enregistrerIncident(incident: IncidentSysteme): void {
    this.incidents.set(incident.details().identifiant, {
      incident,
      sauvegardeLe: new Date(),
    });
  }

  /** Cette methode enregistre un diagnostic rattache a un incident. */
  public enregistrerDiagnostic(diagnostic: DiagnosticIncident): void {
    const incidentId = diagnostic.valeur().incidentId;
    const groupe = this.diagnostics.get(incidentId) ?? [];
    groupe.push({
      diagnostic,
      sauvegardeLe: new Date(),
    });
    this.diagnostics.set(incidentId, groupe);
  }

  /** Cette methode retourne un incident par identifiant. */
  public lireIncident(identifiant: string): IncidentSysteme | null {
    return this.incidents.get(identifiant)?.incident ?? null;
  }

  /** Cette methode retourne tous les incidents stockes. */
  public listerIncidents(): readonly IncidentSysteme[] {
    return [...this.incidents.values()].map((entree) => entree.incident);
  }

  /** Cette methode retourne tous les diagnostics stockes. */
  public listerDiagnostics(): readonly DiagnosticIncident[] {
    return [...this.diagnostics.values()].flatMap((groupe) => groupe.map((entree) => entree.diagnostic));
  }
}
