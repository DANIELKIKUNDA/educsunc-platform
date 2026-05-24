import { PostgresForensicQueries } from '../../persistence/postgres/queries';
import { PostgresAuditForensicRepository, PostgresAuditOfflineRepository } from '../../persistence/postgres/repositories';
import type { AuditExportRequest } from '../ExportInfrastructureTypes';

// Le bundle forensic preserve corrélations, timelines, replay, retry, sync et appareil.
export class ForensicAuditExportBuilder {
  private readonly queries = new PostgresForensicQueries({
    forensicRepository: new PostgresAuditForensicRepository(),
    offlineRepository: new PostgresAuditOfflineRepository(),
  });

  public async construire(request: AuditExportRequest): Promise<Record<string, unknown>[]> {
    const trace = await this.queries.executer({
      correlationId: request.correlationId,
      incidentId: request.exportId,
      acteurId: request.acteurId,
    });

    return [
      {
        exportId: request.exportId,
        correlationId: request.correlationId,
        requestId: request.requestId,
        sessionId: request.sessionId,
        deviceId: request.deviceId,
        trace,
      },
    ];
  }
}
