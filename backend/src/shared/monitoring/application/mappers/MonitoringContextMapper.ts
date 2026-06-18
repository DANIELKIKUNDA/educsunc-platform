import { ContexteMonitoring, CorrelationMonitoring } from '../../domain';
import type { MonitoringContextInputDto } from '../dto/input';

// Ce fichier declare le mapper de contexte Monitoring.

/** Cette classe transforme les DTO d entree en objets valeur Monitoring. */
export class MonitoringContextMapper {
  /** Cette methode projette un DTO d entree en contexte Monitoring. */
  public versContexte(dto: MonitoringContextInputDto): ContexteMonitoring {
    return ContexteMonitoring.creer(dto);
  }

  /** Cette methode projette un identifiant de correlation en objet valeur. */
  public versCorrelation(correlationId: string): CorrelationMonitoring {
    return new CorrelationMonitoring({ correlationId });
  }
}
