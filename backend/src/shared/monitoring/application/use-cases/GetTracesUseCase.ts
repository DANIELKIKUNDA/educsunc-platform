import type { GetTracesQuery } from '../queries';
import type { TraceDto } from '../dto/output';
import { TraceMapper } from '../mappers';
import type { MonitoringTracingPort } from '../ports';

// Ce fichier declare le use case de lecture des traces.

/** Cette classe orchestre la lecture applicative des traces. */
export class GetTracesUseCase {
  constructor(
    private readonly tracingPort: MonitoringTracingPort,
    private readonly mapper = new TraceMapper(),
  ) {}

  /** Cette methode execute la lecture des traces. */
  public async executer(query: GetTracesQuery): Promise<readonly TraceDto[]> {
    const traces = query.correlationId
      ? await this.tracingPort.retrouverTraces()
      : await this.tracingPort.listerTraces();

    return traces
      .filter((trace) => !query.correlationId || trace.valeur().correlation.correlationId === query.correlationId)
      .map((trace) => this.mapper.versDto(trace));
  }
}
