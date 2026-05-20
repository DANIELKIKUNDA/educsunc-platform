import type { SecurityNotificationPort } from '../../../application';

type GestionnaireNotification = (params: {
  idUtilisateur: string;
  action: string;
  details?: Record<string, unknown>;
}) => Promise<void>;

// Cet adaptateur transmet les notifications critiques de SECURITY vers un canal externe.
export class SecurityNotificationAdapter implements SecurityNotificationPort {
  constructor(private readonly gestionnaireNotification?: GestionnaireNotification) {}

  public async notifierAccesSensible(params: {
    idUtilisateur: string;
    action: string;
    details?: Record<string, unknown>;
  }): Promise<void> {
    if (this.gestionnaireNotification) {
      await this.gestionnaireNotification(params);
    }
  }
}
