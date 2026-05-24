import { AuditExecutionContextInvalidException } from '../exceptions';
import { AuditExecutionContext } from '../entities';

// Cette policy impose un contexte d'exécution cohérent pour l'investigation future.
export class PolicyAuditExecutionContext {
  public static verifier(contexte?: AuditExecutionContext): void {
    if (!contexte || !contexte.obtenirModeExecution() || !contexte.obtenirOrigineExecution()) {
      throw new AuditExecutionContextInvalidException("Le contexte d'execution audit est incomplet.");
    }
  }
}
