import type { AuditInterfaceAuthorizationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceIncidentsSecurity {
  public static lecture(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['forensic.read', 'incidents.read'],
      scopes: ['ORGANISATION', 'ECOLE', 'FORENSIC'],
      restreindreTenant: true,
    };
  }
}

