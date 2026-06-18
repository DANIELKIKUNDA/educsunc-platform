import type { GetCapacityQuery } from '../queries';
import type { CapacityDto } from '../dto/output';
import type { MonitoringMetricsPort } from '../ports';

// Ce fichier declare le use case de lecture des capacites.

/** Cette classe orchestre la lecture applicative des capacites. */
export class GetCapacityUseCase {
  constructor(private readonly metricsPort: MonitoringMetricsPort) {}

  /** Cette methode execute la lecture des capacites. */
  public async executer(_query: GetCapacityQuery): Promise<readonly CapacityDto[]> {
    return (await this.metricsPort.listerCapacites()).map((capacite) => capacite.valeur());
  }
}
