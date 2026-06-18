import type { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import type { DtoCommandeCreationNotification } from '../../application/dto';

// Ce fichier declare les types partages du pont entre le BC referentiel-academique et Notifications.

/** Cette interface represente une demande d'integration issue d'un evenement de referentiel. */
export interface NotificationReferentielIntegrationRequest {
  readonly evenement: EvenementDomaine;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly destinataires?: DtoCommandeCreationNotification['destinataires'];
  readonly titre?: string;
  readonly message?: string;
  readonly canaux?: DtoCommandeCreationNotification['canaux'];
  readonly metadonnees?: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une intention de notification derivee du BC referentiel-academique. */
export interface NotificationReferentielIntent {
  readonly typeEvenementReferentiel: string;
  readonly referenceMetier?: string;
  readonly intention: DtoCommandeCreationNotification;
  readonly publieLe: string;
}

/** Cette interface represente le snapshot local du pont referentiel-academique vers Notifications. */
export interface NotificationReferentielIntegrationSnapshot {
  readonly totalIntentions: number;
  readonly totalParEvenement: Readonly<Record<string, number>>;
  readonly totalParTypeNotification: Readonly<Record<string, number>>;
}
