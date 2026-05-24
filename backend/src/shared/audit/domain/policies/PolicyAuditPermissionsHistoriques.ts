import { AuditPermissionHistoryMissingException } from '../exceptions';
import { AuditPermissionContext } from '../entities';

// Cette policy impose la conservation des permissions réelles sur les actions sensibles.
export class PolicyAuditPermissionsHistoriques {
  public static verifier(contextePermissions?: AuditPermissionContext, actionSensible = false): void {
    if (actionSensible && !contextePermissions) {
      throw new AuditPermissionHistoryMissingException("Les permissions historiques sont obligatoires pour cette action sensible.");
    }
  }
}
