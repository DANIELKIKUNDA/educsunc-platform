import type { GetDiagnosticsQuery } from '../queries';
import type { DiagnosticDto } from '../dto/output';
import { DiagnosticMapper } from '../mappers';
import type { MonitoringIncidentPort } from '../ports';

// Ce fichier declare le use case de lecture des diagnostics.

/** Cette classe orchestre la lecture applicative des diagnostics. */
export class GetDiagnosticsUseCase {
  constructor(
    private readonly incidentPort: MonitoringIncidentPort,
    private readonly mapper = new DiagnosticMapper(),
  ) {}

  /** Cette methode execute la lecture des diagnostics. */
  public async executer(_query: GetDiagnosticsQuery): Promise<readonly DiagnosticDto[]> {
    return (await this.incidentPort.listerDiagnostics()).map((diagnostic) => this.mapper.versDto(diagnostic));
  }
}
