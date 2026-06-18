// Ce fichier declare les cles de correlation du domaine Monitoring.

/** Cette interface represente une correlation metier et technique. */
export interface CorrelationMonitoringProps {
  readonly correlationId: string;
  readonly requestId?: string;
  readonly traceId?: string;
  readonly causationId?: string;
}

/** Cette classe represente la correlation partagee entre signaux et traces. */
export class CorrelationMonitoring {
  constructor(private readonly props: CorrelationMonitoringProps) {}

  /** Cette methode retourne la correlation serialisable. */
  public valeur(): CorrelationMonitoringProps {
    return { ...this.props };
  }
}
