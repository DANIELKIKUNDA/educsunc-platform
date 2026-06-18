// Ce fichier decrit le modele de lecture des dead letters Notifications.

/** Cette interface represente une entree dead letter projetee. */
export interface ElementDeadLetterNotification {
  readonly identifiantNotification: string;
  readonly raison: string;
  readonly dateEntree: Date;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

/** Cette interface represente un resultat pagine de dead letters Notifications. */
export interface ModeleLectureDeadLettersNotifications {
  readonly elements: readonly ElementDeadLetterNotification[];
  readonly page: number;
  readonly taillePage: number;
  readonly total: number;
}
