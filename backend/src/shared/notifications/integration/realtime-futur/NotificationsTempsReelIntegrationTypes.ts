import type { MessageTempsReelNotification } from '../../infrastructure/realtime-futur';

// Ce fichier declare les types partages du pont entre Notifications et le futur temps reel transverse.

/** Cette interface represente une demande logique de diffusion temps reel issue de Notifications. */
export interface NotificationTempsReelIntegrationRequest {
  readonly sujet: string;
  readonly notificationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly acteurId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly typeEvenement:
    | 'NOTIFICATION_CREEE'
    | 'NOTIFICATION_DIFFUSEE'
    | 'NOTIFICATION_LIVREE'
    | 'NOTIFICATION_RETRY'
    | 'NOTIFICATION_REPLAY'
    | 'NOTIFICATION_ESCALADEE'
    | 'NOTIFICATION_ARCHIVEE'
    | 'NOTIFICATION_MONITORING';
  readonly donnees: Readonly<Record<string, unknown>>;
}

/** Cette interface represente l'enregistrement local d'une publication temps reel d'integration. */
export interface NotificationTempsReelIntegrationRecord {
  readonly sujet: string;
  readonly typeEvenement: NotificationTempsReelIntegrationRequest['typeEvenement'];
  readonly notificationId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly acteurId?: string;
  readonly donnees: Readonly<Record<string, unknown>>;
  readonly publieLe: string;
}

/** Cette interface represente un evenement recu depuis un canal temps reel futur. */
export interface NotificationTempsReelEvent {
  readonly type: 'CAPABILITES_ANNONCEES' | 'PUBLICATION_CONFIRMEE' | 'PUBLICATION_ECHOUEE';
  readonly sujet: string;
  readonly metadata: Readonly<Record<string, unknown>>;
}

/** Cette interface represente les capacites du pont temps reel de Notifications. */
export interface NotificationTempsReelCapabilitiesSnapshot {
  readonly publicationActive: boolean;
  readonly sseDisponible: boolean;
  readonly webSocketDisponible: boolean;
  readonly totalPublications: number;
}

/** Cette interface represente le snapshot global du pont temps reel de Notifications. */
export interface NotificationTempsReelIntegrationSnapshot {
  readonly capabilities: NotificationTempsReelCapabilitiesSnapshot;
  readonly dernieresPublications: readonly NotificationTempsReelIntegrationRecord[];
  readonly derniersMessagesTechniques: readonly MessageTempsReelNotification[];
  readonly totalErreursPublication: number;
}
