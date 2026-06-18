// Ce fichier expose le DTO stable de chronologie de notification.

/** Cette interface represente une entree serialisable de chronologie. */
export interface DtoChronologieNotification {
  readonly identifiant: string;
  readonly typeEvenement: string;
  readonly statutAvant?: string;
  readonly statutApres: string;
  readonly horodatage: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteur?: string;
  readonly metadonnees?: Readonly<Record<string, unknown>>;
}
