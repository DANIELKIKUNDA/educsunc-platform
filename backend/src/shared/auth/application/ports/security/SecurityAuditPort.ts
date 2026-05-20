// Ce port relie AUTH au systeme d'audit de securite.
export interface SecurityAuditPort {
  publierAuditSecurite(params: {
    action: string;
    utilisateurId?: string;
    succes: boolean;
    details?: Record<string, unknown>;
  }): Promise<void>;
  journaliserConnexion(params: {
    utilisateurId: string;
    sessionId: string;
    organisationActiveId?: string;
    ecoleActiveId?: string;
    estOffline: boolean;
  }): Promise<void>;
  journaliserEchec(params: {
    email?: string;
    utilisateurId?: string;
    raison: string;
  }): Promise<void>;
}
