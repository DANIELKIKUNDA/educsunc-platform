import { EnregistrementNotificationMemoire } from '../persistence';
import { EntreeReplayNotification } from '../replay';

// Ce fichier declare les types techniques du bloc storage Notifications.

/** Cette interface represente une archive technique de notification. */
export interface EnregistrementArchiveNotification {
  readonly identifiantNotification: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly snapshot: EnregistrementNotificationMemoire;
  readonly archiveLe: Date;
  readonly raisonArchivage?: string;
}

/** Cette interface represente un enregistrement forensic consolide. */
export interface EnregistrementForensicNotification {
  readonly identifiantNotification: string;
  readonly correlationId?: string;
  readonly requestId?: string;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly chronologyCount: number;
  readonly totalRetries: number;
  readonly totalReplays: number;
  readonly misAJourLe: Date;
}

/** Cette interface represente l'etat de stockage replay d'une notification. */
export interface EnregistrementStockageReplayNotification {
  readonly identifiantNotification: string;
  readonly historiques: readonly EntreeReplayNotification[];
  readonly misAJourLe: Date;
}

/** Cette interface represente un snapshot global du cycle de vie de stockage. */
export interface SnapshotCycleVieStockageNotifications {
  readonly totalActives: number;
  readonly totalArchivees: number;
  readonly totalForensic: number;
  readonly totalReplay: number;
  readonly collecteLe: Date;
}
