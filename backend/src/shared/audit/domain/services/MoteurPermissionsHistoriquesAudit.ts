import { randomUUID } from 'node:crypto';
import { AuditPermissionContext } from '../entities';

// Ce moteur capture les rôles, permissions et scopes exacts au moment historique.
export class MoteurPermissionsHistoriquesAudit {
  public construire(rolesActifs: string[], permissionsActives: string[], scopesActifs: string[]): AuditPermissionContext {
    return new AuditPermissionContext({
      idAuditPermissionContext: randomUUID(),
      rolesActifs,
      permissionsActives,
      scopesActifs,
    });
  }
}
