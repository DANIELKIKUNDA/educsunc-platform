import type { AuditInterfaceAuthorizationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceRecoverySecurity {
  public static administration(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['workers.manage', 'retention.manage'],
      scopes: ['ORGANISATION', 'ECOLE', 'MONITORING'],
      restreindreTenant: true,
    };
  }
}

