// Ce fichier decrit le modele de lecture de chronologie d'une notification.

/** Cette interface represente une entree projetee de chronologie. */
export interface ElementChronologieNotification {
  readonly identifiant: string;
  readonly typeEvenement: string;
  readonly statutAvant?: string;
  readonly statutApres: string;
  readonly horodatage: Date;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteur?: string;
  readonly metadonnees: Readonly<Record<string, unknown>>;
}

/** Cette interface represente la chronologie projetee d'une notification. */
export interface ModeleLectureChronologieNotification {
  readonly identifiantNotification: string;
  readonly elements: readonly ElementChronologieNotification[];
}
