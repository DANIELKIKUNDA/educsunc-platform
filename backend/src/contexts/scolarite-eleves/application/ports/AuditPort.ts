// Ce fichier definit le port applicatif d'audit.
export interface ActionAuditScolarite {
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
  action: string;
  referenceMetier?: string;
}

/**
 * Ce port journalise les actions critiques hors du domaine.
 */
export interface AuditPort {
  journaliserAction(action: ActionAuditScolarite): Promise<void>;
}
