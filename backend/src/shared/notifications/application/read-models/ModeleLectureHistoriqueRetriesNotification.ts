// Ce fichier decrit le modele de lecture d'historique de retries.

/** Cette interface represente une entree projetee d'historique de retry. */
export interface ElementHistoriqueRetryNotification {
  readonly compteur: number;
  readonly raison?: string;
  readonly horodatage: Date;
  readonly initiateur?: string;
}

/** Cette interface represente l'historique de retry d'une notification. */
export interface ModeleLectureHistoriqueRetriesNotification {
  readonly identifiantNotification: string;
  readonly retries: readonly ElementHistoriqueRetryNotification[];
}
