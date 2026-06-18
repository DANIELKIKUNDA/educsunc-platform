import type { NotificationContext } from '../../../context';
import type {
  NotificationSecurityDecision,
  NotificationSecurityForensicRecord,
} from '../NotificationsSecurityIntegrationTypes';

// Ce fichier produit des traces forensic de securite pour les actions Notifications.

/** Cette classe construit un historique forensic local des decisions de securite appliquees a Notifications. */
export class NotificationSecurityForensicBridge {
  private readonly records: NotificationSecurityForensicRecord[] = [];

  /** Ce constructeur fixe une retention memoire simple pour les traces forensic. */
  constructor(private readonly retentionMaximale = 300) {}

  /** Cette methode enregistre une decision dans le journal forensic local. */
  public enregistrerDecision(
    decision: NotificationSecurityDecision,
    contexteNotification: NotificationContext,
  ): NotificationSecurityForensicRecord {
    const record: NotificationSecurityForensicRecord = {
      action: decision.action,
      notificationId: contexteNotification.notificationId,
      organisationId: decision.organisationId,
      ecoleId: decision.ecoleId,
      correlationId: decision.correlationId,
      requestId: decision.requestId,
      acteurId: decision.acteurId,
      autorise: decision.autorise,
      raisonRefus: decision.raisonRefus,
      metadata: { ...decision.metadata },
      observeLe: new Date().toISOString(),
    };
    this.records.push(record);

    if (this.records.length > this.retentionMaximale) {
      this.records.splice(0, this.records.length - this.retentionMaximale);
    }

    return record;
  }

  /** Cette methode retourne les traces forensic les plus recentes. */
  public listerRecentes(limite = 100): NotificationSecurityForensicRecord[] {
    return this.records.slice(-limite);
  }
}
