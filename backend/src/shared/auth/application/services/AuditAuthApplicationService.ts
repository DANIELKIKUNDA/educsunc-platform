import { SecurityAuditPort } from '../ports/security/SecurityAuditPort';

// Ce service applicatif centralise la publication des audits AUTH.
export class AuditAuthApplicationService {
  constructor(private readonly securityAuditPort: SecurityAuditPort) {}

  // Cette methode journalise une connexion reussie.
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
    await this.securityAuditPort.journaliserConnexion(params);
  }

  // Cette methode journalise un echec d'authentification ou de securite.
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
    await this.securityAuditPort.journaliserEchec(params);
  }

  // Cette methode publie un audit generique de securite.
  public async publierAuditSecurite(params: {
    action: string;
    utilisateurId?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void> {
    await this.securityAuditPort.publierAuditSecurite(params);
  }
}
