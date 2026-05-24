import type { AuditInterfaceAuthorizationPolicy, AuditSecuritySurface } from '../SecurityInterfaceTypes';

const PERMISSIONS_BY_SURFACE: Record<AuditSecuritySurface, readonly string[]> = {
  AUTH: [],
  FORENSIC: ['forensic.read'],
  REPLAY: ['replay.execute'],
  RETRY: ['retry.execute'],
  SYNCHRONIZATION: ['synchronization.manage'],
  EXPORTS: ['exports.generate'],
  MONITORING: ['monitoring.read'],
  WORKERS: ['workers.manage'],
  QUEUES: ['queues.manage'],
  INCIDENTS: ['forensic.read', 'incidents.read'],
  ANOMALIES: ['monitoring.read', 'anomalies.read'],
  RETENTION: ['retention.manage'],
  RUNTIME: ['monitoring.read'],
};

export class AuditInterfacePermissionsSecurity {
  public static creerPolicy(surface: AuditSecuritySurface): AuditInterfaceAuthorizationPolicy {
    return {
      permissions: PERMISSIONS_BY_SURFACE[surface],
      scopes: [],
      restreindreTenant: surface !== 'AUTH',
    };
  }

  public static permissionsDe(surface: AuditSecuritySurface): readonly string[] {
    return this.creerPolicy(surface).permissions;
  }
}

