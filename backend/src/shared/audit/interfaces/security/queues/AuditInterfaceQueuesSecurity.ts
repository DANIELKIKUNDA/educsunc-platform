import type { AuditInterfaceAuthorizationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceQueuesSecurity {
  public static administration(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['queues.manage'],
      scopes: ['ORGANISATION', 'ECOLE', 'MONITORING'],
      restreindreTenant: true,
    };
  }
}

