import { AuditInvalidActionException } from '../exceptions';
import { ActionAudit } from '../value-objects';

// Cette policy empêche la création d'un audit sans action explicite.
export class PolicyAuditActionObligatoire {
  public static verifier(actionAudit?: ActionAudit): void {
    if (!actionAudit) {
      throw new AuditInvalidActionException("Une entree audit doit toujours porter une action.");
    }
  }
}
