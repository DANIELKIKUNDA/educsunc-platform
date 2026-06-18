import type {
  DiagnosticIncident,
  FiltreMonitoring,
  IncidentSysteme,
  PortRepositoryIncident,
} from '../../domain';
import type { MonitoringIncidentPort } from '../../application';
import { StockageIncidentsMonitoringMemoire } from '../persistence';

// Ce fichier declare le repository memoire des incidents Monitoring.

/** Cette classe represente l implementation memoire des incidents et diagnostics. */
export class RepositoryIncidentMonitoringMemoire implements PortRepositoryIncident, MonitoringIncidentPort {
  constructor(private readonly stockage = new StockageIncidentsMonitoringMemoire()) {}

  /** Cette methode persiste un incident dans le stockage local. */
  public async sauvegarder(incident: IncidentSysteme): Promise<void> {
    this.stockage.enregistrerIncident(incident);
  }

  /** Cette methode recherche des incidents selon un filtre simple. */
  public async rechercherParFiltre(_filtre: FiltreMonitoring): Promise<readonly IncidentSysteme[]> {
    return this.stockage.listerIncidents();
  }

  /** Cette methode enregistre un incident via le port applicatif. */
  public async enregistrerIncident(incident: IncidentSysteme): Promise<void> {
    await this.sauvegarder(incident);
  }

  /** Cette methode retrouve un incident par identifiant. */
  public async retrouverIncident(incidentId: string): Promise<IncidentSysteme | null> {
    return this.stockage.lireIncident(incidentId);
  }

  /** Cette methode liste les incidents stockes. */
  public async listerIncidents(): Promise<readonly IncidentSysteme[]> {
    return this.stockage.listerIncidents();
  }

  /** Cette methode enregistre un diagnostic rattache a un incident. */
  public async enregistrerDiagnostic(diagnostic: DiagnosticIncident): Promise<void> {
    this.stockage.enregistrerDiagnostic(diagnostic);
  }

  /** Cette methode liste les diagnostics stockes. */
  public async listerDiagnostics(): Promise<readonly DiagnosticIncident[]> {
    return this.stockage.listerDiagnostics();
  }

  /** Cette methode expose le stockage sous-jacent. */
  public stockageMemoire(): StockageIncidentsMonitoringMemoire {
    return this.stockage;
  }
}
