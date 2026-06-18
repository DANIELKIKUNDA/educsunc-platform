import { RuntimeMonitoringNotifications } from './RuntimeMonitoringNotifications';

// Ce fichier expose une vue de supervision runtime consolidee du moteur Notifications.

/** Cette classe derive une supervision exploitable a partir du monitoring technique. */
export class RuntimeSupervisionNotifications {
  /** Ce constructeur relie la supervision au runtime de monitoring. */
  constructor(private readonly runtimeMonitoringNotifications: RuntimeMonitoringNotifications) {}

  /** Cette methode calcule un diagnostic simple de supervision runtime. */
  public async superviser(): Promise<{
    readonly sain: boolean;
    readonly saturationDetectee: boolean;
    readonly providersIndisponibles: number;
    readonly collecteLe: Date;
  }> {
    const snapshot = await this.runtimeMonitoringNotifications.observer();
    return {
      sain: !snapshot.files.saturationDetectee && snapshot.providers.totalIndisponibles === 0,
      saturationDetectee: snapshot.files.saturationDetectee,
      providersIndisponibles: snapshot.providers.totalIndisponibles,
      collecteLe: snapshot.collecteLe,
    };
  }
}
