import { SecurityAuditPort } from '../../../application/ports/security/SecurityAuditPort';

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

  public async publierAuditSecurite(params: {
    action: string;
    utilisateurId?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await this.enregistrer(params);
  }

  public async journaliserConnexion(params: {
    utilisateurId: string;
    sessionId: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    estOffline: boolean;
  }): Promise<void> {
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
  }): Promise<void> {
    await this.enregistrer({
      action: 'AUTH_FAILURE',
      utilisateurId: params.utilisateurId,
      succes: false,
      details: params,
    });
  }
}
