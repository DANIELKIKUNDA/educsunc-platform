import { EtatSanteProviderNotification } from '../providers';

// Ce fichier declare les types techniques du bloc monitoring Notifications.

/** Cette interface represente un signal de monitoring interne du moteur Notifications. */
export interface SignalMonitoringNotification {
  readonly nom: string;
  readonly horodatage: Date;
  readonly valeurs: Readonly<Record<string, unknown>>;
}

/** Cette interface represente une vue de supervision des files Notifications. */
export interface VueSurveillanceFilesNotifications {
  readonly totalDispatch: number;
  readonly totalRetry: number;
  readonly totalReplay: number;
  readonly totalEscalade: number;
  readonly totalDeadLetter: number;
  readonly saturationDetectee: boolean;
}

/** Cette interface represente une vue de supervision des providers Notifications. */
export interface VueSurveillanceProvidersNotifications {
  readonly totalProviders: number;
  readonly totalSains: number;
  readonly totalDegrades: number;
  readonly totalIndisponibles: number;
  readonly fournisseurs: ReadonlyArray<{
    readonly fournisseur: string;
    readonly canal: string;
    readonly etat: EtatSanteProviderNotification;
  }>;
}

/** Cette interface represente un snapshot global du monitoring technique. */
export interface SnapshotMonitoringNotification {
  readonly signauxRecents: readonly SignalMonitoringNotification[];
  readonly files: VueSurveillanceFilesNotifications;
  readonly providers: VueSurveillanceProvidersNotifications;
  readonly collecteLe: Date;
}
