import { HealthcheckMonitoringInfrastructure } from '../health';
import { PublisherSignauxMonitoring } from '../observability';
import {
  RepositoryAlerteMonitoringMemoire,
  RepositoryIncidentMonitoringMemoire,
  RepositoryMetriqueMonitoringMemoire,
  RepositoryTraceMonitoringMemoire,
} from '../repositories';

// Ce fichier declare le registre des composants techniques Monitoring.

/** Cette classe centralise les composants techniques locaux du module. */
export class RegistreInfrastructureMonitoring {
  public readonly alertes = new RepositoryAlerteMonitoringMemoire();
  public readonly incidents = new RepositoryIncidentMonitoringMemoire();
  public readonly traces = new RepositoryTraceMonitoringMemoire();
  public readonly metriques = new RepositoryMetriqueMonitoringMemoire();
  public readonly sante = new HealthcheckMonitoringInfrastructure();
  public readonly signaux = new PublisherSignauxMonitoring();
}
