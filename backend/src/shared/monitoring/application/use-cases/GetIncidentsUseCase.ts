import type { GetIncidentsQuery } from '../queries';
import type { IncidentDto } from '../dto/output';
import { IncidentMapper } from '../mappers';
import type { MonitoringIncidentPort } from '../ports';

// Ce fichier declare le use case de lecture des incidents.

/** Cette classe orchestre la lecture applicative des incidents. */
export class GetIncidentsUseCase {
  constructor(
    private readonly incidentPort: MonitoringIncidentPort,
    private readonly mapper = new IncidentMapper(),
  ) {}

  /** Cette methode execute la lecture des incidents. */
  public async executer(_query: GetIncidentsQuery): Promise<readonly IncidentDto[]> {
    return (await this.incidentPort.listerIncidents()).map((incident) => this.mapper.versDto(incident));
  }
}
