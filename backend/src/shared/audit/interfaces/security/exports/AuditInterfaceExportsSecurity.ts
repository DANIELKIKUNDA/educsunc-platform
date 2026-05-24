import type { AuditInterfaceAuthorizationPolicy, AuditInterfaceThrottlingPolicy } from '../SecurityInterfaceTypes';
import { AuditInterfaceThrottlingSecurity } from '../throttling/AuditInterfaceThrottlingSecurity';

export class AuditInterfaceExportsSecurity {
  public static generation(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['exports.generate'],
      scopes: ['ORGANISATION', 'ECOLE', 'EXPORTS'],
      restreindreTenant: true,
    };
  }

  public static throttling(): AuditInterfaceThrottlingPolicy {
    return AuditInterfaceThrottlingSecurity.creerPolicy('EXPORTS');
  }
}

