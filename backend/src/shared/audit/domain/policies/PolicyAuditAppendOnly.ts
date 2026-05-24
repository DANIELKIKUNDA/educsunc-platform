import { AuditAppendOnlyViolationException } from '../exceptions';

// Cette policy interdit toute logique qui voudrait réécrire le registre audit.
export class PolicyAuditAppendOnly {
  public static verifierOperation(operation: 'INSERT' | 'UPDATE' | 'DELETE'): void {
    if (operation !== 'INSERT') {
      throw new AuditAppendOnlyViolationException(`Operation append-only interdite: ${operation}`);
    }
  }
}
