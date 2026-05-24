import type { AuditInterfaceAuthorizationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceWorkersSecurity {
  public static administration(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['workers.manage'],
      scopes: ['ORGANISATION', 'ECOLE', 'MONITORING'],
      restreindreTenant: true,
    };
  }
}

