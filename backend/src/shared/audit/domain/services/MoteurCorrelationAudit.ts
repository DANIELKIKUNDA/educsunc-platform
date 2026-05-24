import { AuditCorrelation } from '../entities';
import { CorrelationId } from '../value-objects';

// Ce moteur construit le lien de corrélation entre plusieurs audits liés.
export class MoteurCorrelationAudit {
  public construire(correlationId?: string, workflowId?: string, operationGlobale?: string): AuditCorrelation | undefined {
    if (!correlationId && !workflowId && !operationGlobale) {
      return undefined;
    }
    return new AuditCorrelation({
      idAuditCorrelation: correlationId ?? workflowId ?? operationGlobale ?? 'correlation-audit',
      correlationId: new CorrelationId(correlationId),
      workflowId,
      operationGlobale,
    });
  }
}
