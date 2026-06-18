import type { EvenementDomaine } from '../../../../shared/domain/DomainEvent';
import type { DtoCommandeCreationNotification } from '../../application/dto';

// Ce fichier declare les types partages du pont entre le BC bulletins-evaluations et Notifications.

/** Cette interface represente une demande d'integration issue d'un evenement pedagogique. */
export interface NotificationBulletinsIntegrationRequest {
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

/** Cette interface represente une intention de notification derivee du BC bulletins-evaluations. */
export interface NotificationBulletinsIntent {
  readonly typeEvenementBulletins: string;
  readonly referenceMetier?: string;
  readonly intention: DtoCommandeCreationNotification;
  readonly publieLe: string;
}

/** Cette interface represente le snapshot local du pont bulletins-evaluations vers Notifications. */
export interface NotificationBulletinsIntegrationSnapshot {
  readonly totalIntentions: number;
  readonly totalParEvenement: Readonly<Record<string, number>>;
  readonly totalParTypeNotification: Readonly<Record<string, number>>;
}
