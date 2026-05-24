import type { AuditInterfaceAuthorizationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceAnomaliesSecurity {
  public static lecture(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['monitoring.read', 'anomalies.read'],
      scopes: ['ORGANISATION', 'ECOLE', 'MONITORING'],
      restreindreTenant: true,
    };
  }
}

