import type { AuditInterfaceAuthorizationPolicy } from '../SecurityInterfaceTypes';

export class AuditInterfaceForensicSecurity {
  public static consultation(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['forensic.read'],
      scopes: ['ORGANISATION', 'ECOLE', 'FORENSIC'],
      restreindreTenant: true,
    };
  }

  public static exportation(): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: ['forensic.read', 'forensic.export'],
      scopes: ['ORGANISATION', 'ECOLE', 'FORENSIC', 'EXPORTS'],
      restreindreTenant: true,
    };
  }
}

