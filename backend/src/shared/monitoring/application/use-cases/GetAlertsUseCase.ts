import type { GetAlertsQuery } from '../queries';
import type { AlertDto } from '../dto/output';
import { AlertMapper } from '../mappers';
import type { MonitoringAlertPort } from '../ports';

// Ce fichier declare le use case de lecture des alertes.

/** Cette classe orchestre la lecture applicative des alertes. */
export class GetAlertsUseCase {
  constructor(
    private readonly alertPort: MonitoringAlertPort,
    private readonly mapper = new AlertMapper(),
  ) {}

  /** Cette methode execute la lecture des alertes. */
  public async executer(_query: GetAlertsQuery): Promise<readonly AlertDto[]> {
    return (await this.alertPort.listerAlertes()).map((alerte) => this.mapper.versDto(alerte));
  }
}
