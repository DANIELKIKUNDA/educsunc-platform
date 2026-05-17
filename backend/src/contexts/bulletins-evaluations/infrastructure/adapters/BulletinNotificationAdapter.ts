// Cette interface simple permet de brancher plus tard un emetteur de notifications sans coupler le BC.
export interface NotificationBulletin {
  sujet: string;
  message: string;
  destinataires?: string[];
}

// Ce fichier porte l'adaptateur documentaire de notification du BC.
export class BulletinNotificationAdapter {
  // Ce constructeur accepte un emetteur concret facultatif pour rester local et testable.
  constructor(
    private readonly emetteur?: (notification: NotificationBulletin) => Promise<void>,
  ) {}

  // Cette methode emet une notification fonctionnelle sans imposer une technologie.
  public async notifier(notification: NotificationBulletin): Promise<void> {
    await this.emetteur?.(notification);
  }
}
