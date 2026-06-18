import {
  RuntimeMonitoringNotifications,
  RuntimeSupervisionNotifications,
} from '../../runtime';
import { HealthcheckNotifications } from '../health/HealthcheckNotifications';

// Ce fichier expose les commandes locales de monitoring du module Notifications.

/** Cette classe propose des lectures operationnelles du monitoring et de la sante locale. */
export class ScriptMonitoringNotifications {
  /** Ce constructeur relie le script au monitoring runtime, a la supervision et au healthcheck. */
  constructor(
    private readonly runtimeMonitoringNotifications: RuntimeMonitoringNotifications,
    private readonly runtimeSupervisionNotifications: RuntimeSupervisionNotifications,
    private readonly healthcheckNotifications: HealthcheckNotifications,
  ) {}

  /** Cette methode retourne le snapshot brut de monitoring runtime. */
  public async observerMonitoring(): Promise<Awaited<ReturnType<RuntimeMonitoringNotifications['observer']>>> {
    return this.runtimeMonitoringNotifications.observer();
  }

  /** Cette methode retourne une vue supervision deja interpretee. */
  public async superviser(): Promise<Awaited<ReturnType<RuntimeSupervisionNotifications['superviser']>>> {
    return this.runtimeSupervisionNotifications.superviser();
  }

  /** Cette methode retourne le healthcheck operationnel complet. */
  public async verifierSante(): Promise<Awaited<ReturnType<HealthcheckNotifications['verifier']>>> {
    return this.healthcheckNotifications.verifier();
  }
}
