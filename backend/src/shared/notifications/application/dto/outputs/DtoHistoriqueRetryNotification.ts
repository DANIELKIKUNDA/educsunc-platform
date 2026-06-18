// Ce fichier expose le DTO stable de l'historique des retries.

/** Cette interface represente une entree serialisable d'historique de retry. */
export interface DtoHistoriqueRetryNotification {
  readonly compteur: number;
  readonly raison?: string;
  readonly horodatage: string;
  readonly initiateur?: string;
}
