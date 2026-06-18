import type { NotificationContext } from '../../../context';
import type { NotificationSecurityAnomaly } from '../NotificationsSecurityIntegrationTypes';

// Ce fichier detecte et memorise les anomalies de securite reliees a Notifications.

/** Cette classe centralise les anomalies de securite observees par le pont Notifications/Security. */
export class NotificationSecurityAnomalyBridge {
  private readonly anomalies: NotificationSecurityAnomaly[] = [];

  /** Ce constructeur fixe une retention memoire simple pour les anomalies. */
  constructor(private readonly retentionMaximale = 200) {}

  /** Cette methode enregistre une anomalie et retourne l'entree memorisee. */
  public enregistrer(params: {
    readonly code: string;
    readonly severite: NotificationSecurityAnomaly['severite'];
    readonly message: string;
    readonly contexteNotification: NotificationContext;
    readonly metadata?: Readonly<Record<string, unknown>>;
  }): NotificationSecurityAnomaly {
    const anomalie: NotificationSecurityAnomaly = {
      code: params.code,
      severite: params.severite,
      message: params.message,
      contexteNotification: { ...params.contexteNotification },
      metadata: { ...(params.metadata ?? {}) },
      detecteeLe: new Date(),
    };
    this.anomalies.push(anomalie);

    if (this.anomalies.length > this.retentionMaximale) {
      this.anomalies.splice(0, this.anomalies.length - this.retentionMaximale);
    }

    return anomalie;
  }

  /** Cette methode retourne les anomalies les plus recentes. */
  public listerRecentes(limite = 100): NotificationSecurityAnomaly[] {
    return this.anomalies.slice(-limite);
  }
}
