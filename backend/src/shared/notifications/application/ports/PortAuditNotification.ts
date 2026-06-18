// Ce fichier declare le port applicatif d'integration Audit.

/** Cette interface isole l'emission d'un signal Audit associe aux workflows Notifications. */
export interface PortAuditNotification {
  /** Cette methode enregistre une trace Audit metier ou technique. */
  enregistrer(action: string, donnees?: Readonly<Record<string, unknown>>): Promise<void>;
}
