// Ce fichier declare le port applicatif d'idempotence Notifications.

/** Cette interface isole la reservation et la verification d'idempotence. */
export interface PortIdempotenceNotification {
  /** Cette methode retourne vrai si la cle a deja ete traitee. */
  estDejaTraitee(cle: string): Promise<boolean>;

  /** Cette methode reserve une cle d'idempotence pour une operation. */
  enregistrerTraitement(cle: string, metadata?: Readonly<Record<string, unknown>>): Promise<void>;
}
