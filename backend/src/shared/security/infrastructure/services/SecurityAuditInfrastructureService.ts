import type { AuditSecurityPort } from '../../application';
import { SecurityAuditIntegrationOrchestrator } from '../../integration';
import { obtenirMemoireSecurityStore } from '../persistence/postgres/repositories/_memoireSecurityStore';

// Ce service journalise les actions critiques de SECURITY dans un stockage technique simple.
export class SecurityAuditInfrastructureService implements AuditSecurityPort {
  private static orchestrateur: SecurityAuditIntegrationOrchestrator | null = null;

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
    await SecurityAuditInfrastructureService.obtenirOrchestrateur().publier(params);

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

  private static obtenirOrchestrateur(): SecurityAuditIntegrationOrchestrator {
    if (!this.orchestrateur) {
      this.orchestrateur = new SecurityAuditIntegrationOrchestrator();
    }

    return this.orchestrateur;
  }
}
