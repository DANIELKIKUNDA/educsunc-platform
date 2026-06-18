import { CanalNotification, StatutNotification, TypeNotification } from '../../domain';

// Ce fichier decrit le modele de lecture detail d'une notification.

/** Cette interface represente la projection detaillee d'une notification. */
export interface ModeleLectureDetailsNotification {
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
  readonly creeLe: Date;
  readonly misAJourLe: Date;
}
