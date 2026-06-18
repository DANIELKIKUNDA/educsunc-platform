import { GranulariteChronologie } from '../../domain';

// Ce fichier declare les types techniques du bloc chronology Notifications.

/** Cette interface represente une ligne technique de chronology projetee. */
export interface LigneChronologieTechniqueNotification {
  readonly identifiant: string;
  readonly identifiantNotification: string;
  readonly typeEvenement: string;
  readonly statutAvant?: string;
  readonly statutApres: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteur?: string;
  readonly horodatage: Date;
  readonly granularite: GranulariteChronologie;
  readonly appendOnly: boolean;
  readonly metadonnees: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le resultat d'une reconstruction de chronology. */
export interface ResultatReconstructionChronologieNotification {
  readonly identifiantNotification: string;
  readonly totalEntrees: number;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly granularite: GranulariteChronologie;
  readonly reconstruiteLe: Date;
}
