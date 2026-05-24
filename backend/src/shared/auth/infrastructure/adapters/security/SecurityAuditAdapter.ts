import { SecurityAuditPort } from '../../../application/ports/security/SecurityAuditPort';
import { AuthAuditIntegrationOrchestrator } from '../../../integration';

type EvenementAuditAuth = {
  action: string;
  utilisateurId?: string;
  succes: boolean;
  details?: Record<string, unknown>;
};

// Cet adaptateur publie les evenements d'audit AUTH vers un systeme technique externe.
export class SecurityAuditAdapter implements SecurityAuditPort {
  constructor(
    private readonly enregistrer: (evenement: EvenementAuditAuth) => Promise<void> = async () => undefined,
  ) {}

  private static orchestrateur: AuthAuditIntegrationOrchestrator | null = null;

  public async publierAuditSecurite(params: {
    action: string;
    utilisateurId?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await SecurityAuditAdapter.obtenirOrchestrateur().publierAction(params);
    await this.enregistrer(params);
  }

  public async journaliserConnexion(params: {
    utilisateurId: string;
    sessionId: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    estOffline: boolean;
    deviceId?: string;
    adresseIp?: string;
    userAgent?: string;
  }): Promise<void> {
    await SecurityAuditAdapter.obtenirOrchestrateur().publierConnexion(params);
    await this.enregistrer({
      action: 'AUTH_LOGIN',
      utilisateurId: params.utilisateurId,
      succes: true,
      details: params,
    });
  }

  public async journaliserEchec(params: {
    email?: string;
    utilisateurId?: string;
    raison: string;
    sessionId?: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    deviceId?: string;
    adresseIp?: string;
    userAgent?: string;
  }): Promise<void> {
    await SecurityAuditAdapter.obtenirOrchestrateur().publierEchec(params);
    await this.enregistrer({
      action: 'AUTH_FAILURE',
      utilisateurId: params.utilisateurId,
      succes: false,
      details: params,
    });
  }

  private static obtenirOrchestrateur(): AuthAuditIntegrationOrchestrator {
    if (!this.orchestrateur) {
      this.orchestrateur = new AuthAuditIntegrationOrchestrator();
    }

    return this.orchestrateur;
  }
}
