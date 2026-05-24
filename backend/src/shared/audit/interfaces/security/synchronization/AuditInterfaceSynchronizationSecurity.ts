import type { AuditInterfaceAuthorizationPolicy, AuditInterfaceThrottlingPolicy } from '../SecurityInterfaceTypes';
import { AuditInterfaceThrottlingSecurity } from '../throttling/AuditInterfaceThrottlingSecurity';

export class AuditInterfaceSynchronizationSecurity {
  public static autorisation(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['synchronization.manage'],
      scopes: ['ORGANISATION', 'ECOLE'],
      restreindreTenant: true,
    };
  }

  public static throttling(): AuditInterfaceThrottlingPolicy {
    return AuditInterfaceThrottlingSecurity.creerPolicy('SYNCHRONIZATION');
  }
}

