import { CanalNotification, StatutNotification, TypeNotification } from '../../domain';

// Ce fichier declare les types techniques internes du bloc persistence Notifications.

/** Cette interface represente un snapshot technique minimal d'une notification. */
export interface EnregistrementNotificationMemoire {
  readonly identifiant: string;
  readonly type: TypeNotification;
  readonly statut: StatutNotification;
  readonly priorite: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  readonly canaux: readonly CanalNotification[];
  readonly titre?: string;
  readonly message: string;
  readonly placeholders: Readonly<Record<string, string>>;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly compteurRetry: number;
  readonly compteurReplay: number;
  readonly dateArchivage?: Date;
  readonly raisonArchivage?: string;
  readonly creeLe: Date;
  readonly misAJourLe: Date;
}

/** Cette interface represente un enregistrement de dead letter technique. */
export interface EnregistrementDeadLetterNotificationMemoire {
  readonly identifiantNotification: string;
  readonly raison: string;
  readonly dateEntree: Date;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
}

/** Cette interface represente une vue technique consolidee par tenant. */
export interface VueTenantNotificationMemoire {
  readonly organisationId: string;
  readonly ecoleId?: string;
  readonly totalNotifications: number;
  readonly totalArchivees: number;
  readonly totalDeadLetters: number;
  readonly totalEnEchec: number;
  readonly dateObservation: Date;
}
