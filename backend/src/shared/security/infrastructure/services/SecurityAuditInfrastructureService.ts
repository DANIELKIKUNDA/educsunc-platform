import type { AuditSecurityPort } from '../../application';
import { obtenirMemoireSecurityStore } from '../persistence/postgres/repositories/_memoireSecurityStore';

// Ce service journalise les actions critiques de SECURITY dans un stockage technique simple.
export class SecurityAuditInfrastructureService implements AuditSecurityPort {
  public async journaliser(params: {
    action: string;
    idUtilisateur?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void> {
    const store = obtenirMemoireSecurityStore();
    const entree = {
      id_log: `security-log-${store.securityAccessLogs.length + 1}`,
      action: params.action,
      id_utilisateur: params.idUtilisateur ?? null,
      succes: params.succes,
      details: params.details ?? null,
      cree_le: new Date().toISOString(),
    };

    store.securityAccessLogs.push(entree);

    if (!params.succes) {
      store.securityPermissionDeniedLogs.push({
        id_log: `security-denied-${store.securityPermissionDeniedLogs.length + 1}`,
        action: params.action,
        id_utilisateur: params.idUtilisateur ?? null,
        details: params.details ?? null,
        cree_le: entree.cree_le,
      });
    }
  }
}
