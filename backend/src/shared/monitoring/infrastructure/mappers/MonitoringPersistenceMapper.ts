import type { Alerte, IncidentSysteme, TraceOperation } from '../../domain';

// Ce fichier declare le mapper de persistence Monitoring.

/** Cette classe projette les objets domaine en vues de persistence locales. */
export class MonitoringPersistenceMapper {
  /** Cette methode projette une alerte en vue persistable. */
  public versVueAlerte(alerte: Alerte): ReturnType<Alerte['valeur']> {
    return alerte.valeur();
  }

  /** Cette methode projette un incident en vue persistable. */
  public versVueIncident(incident: IncidentSysteme): ReturnType<IncidentSysteme['details']> {
    return incident.details();
  }

  /** Cette methode projette une trace en vue persistable. */
  public versVueTrace(trace: TraceOperation): ReturnType<TraceOperation['valeur']> {
    return trace.valeur();
  }
}
