import type { DtoCommandeCreationNotification } from '../../application/dto';

export interface NotificationScolariteEvenementLike {
  readonly idEvenement: string;
  readonly typeEvenement: string;
  readonly idOrganisation?: string;
  readonly idEcole?: string;
  readonly declenchePar?: string;
  readonly referenceMetier?: string;
}

export interface NotificationScolariteCommunicationPayload {
  readonly destinataire: string;
  readonly sujet: string;
  readonly message: string;
}

// Ce fichier declare les types partages du pont entre le BC scolarite-eleves et Notifications.

/** Cette interface represente une demande d'integration issue d'un evenement de scolarite. */
export interface NotificationScolariteIntegrationRequest {
  readonly evenement: NotificationScolariteEvenementLike;
  readonly destinataires?: DtoCommandeCreationNotification['destinataires'];
  readonly titre?: string;
  readonly message?: string;
  readonly canaux?: DtoCommandeCreationNotification['canaux'];
  readonly metadonnees?: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une intention de notification derivee du BC scolarite-eleves. */
export interface NotificationScolariteIntent {
  readonly typeEvenementScolarite: string;
  readonly referenceMetier?: string;
  readonly intention: DtoCommandeCreationNotification;
  readonly publieLe: string;
}

/** Cette interface represente une demande legacy de communication venant de la saga de scolarite. */
export interface NotificationScolariteCommunicationRequest {
  readonly notification: NotificationScolariteCommunicationPayload;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly metadonnees?: Readonly<Record<string, unknown>>;
}

/** Cette interface represente le snapshot local du pont scolarite-eleves vers Notifications. */
export interface NotificationScolariteIntegrationSnapshot {
  readonly totalIntentions: number;
  readonly totalDemandesLegacy: number;
  readonly totalParEvenement: Readonly<Record<string, number>>;
  readonly totalParTypeNotification: Readonly<Record<string, number>>;
}
