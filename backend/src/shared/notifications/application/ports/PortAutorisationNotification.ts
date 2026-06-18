// Ce fichier declare le port applicatif de controle d'autorisation Notifications.

/** Cette interface isole les verifications d'autorisation et de scope. */
export interface PortAutorisationNotification {
  /** Cette methode verifie qu'une action est autorisee pour un acteur et un tenant. */
  estAutorise(action: string, contexte: Readonly<Record<string, unknown>>): Promise<boolean>;
}
