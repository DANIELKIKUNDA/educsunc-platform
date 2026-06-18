// Ce fichier decrit la requete applicative de chronologie d'une notification.

/** Cette interface porte les informations minimales pour lire la chronologie d'une notification. */
export interface RequeteChronologieNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly granularite?: 'BASIC' | 'DETAILED' | 'FORENSIC';
}
