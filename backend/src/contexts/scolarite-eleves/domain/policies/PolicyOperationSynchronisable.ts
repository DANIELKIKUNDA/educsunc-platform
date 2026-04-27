import { ErreurIdempotence } from '../exceptions/ErreurIdempotence';

// Ce fichier contient la regle qui determine si une operation peut etre synchronisee.
/**
 * Cette policy protege le mode offline/online contre les operations non rejouables.
 */
export class PolicyOperationSynchronisable {
  /** Verifie que l'operation peut etre rejouee de maniere fiable pendant la synchronisation. */
  public verifierOperationSynchronisable(operationSynchronisable: boolean): void {
    if (!operationSynchronisable) {
      throw new ErreurIdempotence('Cette operation ne peut pas etre synchronisee.');
    }
  }
}
