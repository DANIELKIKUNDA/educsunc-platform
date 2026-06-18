import { CanalNotification, StatutNotification, TypeNotification } from '../../../domain';

// Ce fichier expose le DTO stable des details d'une notification.

/** Cette interface represente la vue detail complete d'une notification. */
export interface DtoDetailsNotification {
  readonly identifiant: string;
  readonly type: TypeNotification;
  readonly statut: StatutNotification;
  readonly priorite: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  readonly canaux: readonly CanalNotification[];
  readonly titre?: string;
  readonly message: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly creeLe: string;
  readonly misAJourLe: string;
}
