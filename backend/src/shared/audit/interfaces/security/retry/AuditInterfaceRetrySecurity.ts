import type { AuditInterfaceAuthorizationPolicy, AuditInterfaceThrottlingPolicy } from '../SecurityInterfaceTypes';
import { AuditInterfaceThrottlingSecurity } from '../throttling/AuditInterfaceThrottlingSecurity';

export class AuditInterfaceRetrySecurity {
  public static autorisation(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['retry.execute'],
      scopes: ['ORGANISATION', 'ECOLE', 'REPLAY'],
      restreindreTenant: true,
    };
  }

  public static throttling(): AuditInterfaceThrottlingPolicy {
    return AuditInterfaceThrottlingSecurity.creerPolicy('RETRY');
  }
}

