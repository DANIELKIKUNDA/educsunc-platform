import type { AuditInterfaceAuthorizationPolicy, AuditInterfaceThrottlingPolicy } from '../SecurityInterfaceTypes';
import { AuditInterfaceThrottlingSecurity } from '../throttling/AuditInterfaceThrottlingSecurity';

export class AuditInterfaceReplaySecurity {
  public static autorisation(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['replay.execute'],
      scopes: ['ORGANISATION', 'ECOLE', 'REPLAY'],
      restreindreTenant: true,
    };
  }

  public static throttling(): AuditInterfaceThrottlingPolicy {
    return AuditInterfaceThrottlingSecurity.creerPolicy('REPLAY');
  }
}

