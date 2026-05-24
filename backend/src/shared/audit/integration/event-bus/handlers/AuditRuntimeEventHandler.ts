import type { SharedBusEventEnvelope } from '../../../../infrastructure/bus';
import type { AuditCreationApplicationService } from '../../../application/services/AuditCreationApplicationService';

// Ce handler convertit les evenements runtime en traces Audit applicatives sans toucher directement a SQL.
export class AuditRuntimeEventHandler {
  public constructor(private readonly creationService: AuditCreationApplicationService) {}

  public async handle(envelope: SharedBusEventEnvelope): Promise<void> {
    const resultat =
      /Failed|Locked|Denied/i.test(envelope.name)
        ? 'ECHEC'
        : 'SUCCES';

    await this.creationService.creerAuditSysteme({
      action: envelope.name,
      resultat,
      sourceSysteme: 'EVENT_BUS',
      contexte: {
        correlationId: envelope.metadata.correlationId,
        requestId: envelope.metadata.requestId,
        deviceId: envelope.metadata.deviceId,
        sessionId: envelope.metadata.sessionId,
      },
    });
  }
}
