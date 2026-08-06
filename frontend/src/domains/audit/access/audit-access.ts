import { sessionStore } from '../../../shared/auth/session.store';

export type AuditBackendPermission =
  | 'audit.read'
  | 'audit.timeline.read'
  | 'audit.history.read'
  | 'audit.analytics.read'
  | 'audit.security.read'
  | 'audit.finance.read'
  | 'audit.technical.read';

export const TITULARIAT_EFFECTIF = 'TITULAIRE_EFFECTIF' as const;

export function hasAuditPermission(permission: AuditBackendPermission): boolean {
  return sessionStore.state.permissions.includes(permission);
}

export function hasAnyAuditPermission(permissions: readonly AuditBackendPermission[]): boolean {
  return permissions.some((permission) => hasAuditPermission(permission));
}

export function hasTitulariatEffectif(): boolean {
  if (sessionStore.state.actorCode !== 'ENSEIGNANT') {
    return false;
  }

  return sessionStore.hasDerivedCapability(TITULARIAT_EFFECTIF);
}
