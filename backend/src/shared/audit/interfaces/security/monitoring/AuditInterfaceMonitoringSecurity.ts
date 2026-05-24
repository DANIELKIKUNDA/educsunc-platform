import type { AuditInterfaceAuthorizationPolicy, AuditInterfaceThrottlingPolicy } from '../SecurityInterfaceTypes';
import { AuditInterfaceThrottlingSecurity } from '../throttling/AuditInterfaceThrottlingSecurity';

export class AuditInterfaceMonitoringSecurity {
  public static lecture(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['monitoring.read'],
      scopes: ['ORGANISATION', 'ECOLE', 'MONITORING'],
      restreindreTenant: true,
    };
  }

  public static throttling(): AuditInterfaceThrottlingPolicy {
    return AuditInterfaceThrottlingSecurity.creerPolicy('MONITORING');
  }
}

