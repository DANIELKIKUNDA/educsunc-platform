import {
  RegistreRuntimeNotifications,
  RuntimeMonitoringNotifications,
  SanteRuntimeNotifications,
} from '../../runtime';

// Ce fichier expose le healthcheck local du module Notifications.

/** Cette classe assemble la sante runtime et le monitoring en un check operationnel unique. */
export class HealthcheckNotifications {
  /** Ce constructeur relie le healthcheck aux briques runtime deja stabilisees. */
  constructor(
    private readonly santeRuntimeNotifications: SanteRuntimeNotifications,
    private readonly runtimeMonitoringNotifications: RuntimeMonitoringNotifications,
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
  ) {}

  /** Cette methode retourne un healthcheck exploitable par un bootstrap ou un script local. */
  public async verifier(): Promise<{
    readonly statut: 'UP' | 'DEGRADED';
    readonly sante: Awaited<ReturnType<SanteRuntimeNotifications['observer']>>;
    readonly filesSaturees: boolean;
    readonly providersIndisponibles: number;
    readonly totalComposants: number;
    readonly collecteLe: Date;
  }> {
    const sante = await this.santeRuntimeNotifications.observer();
    const monitoring = await this.runtimeMonitoringNotifications.observer();
    const runtime = this.registreRuntimeNotifications.observer();

    return {
      statut: sante.sain ? 'UP' : 'DEGRADED',
      sante,
      filesSaturees: monitoring.files.saturationDetectee,
      providersIndisponibles: monitoring.providers.totalIndisponibles,
      totalComposants: runtime.composants.length,
      collecteLe: new Date(),
    };
  }
}
