import type { Notification, DepotNotification } from '../../domain';
import type { PortDepotNotifications } from '../../application';
/** Ecrit durablement puis maintient une projection locale compatible avec le read-side historique. */
export class DepotNotificationsComposite implements DepotNotification, PortDepotNotifications {
  constructor(private readonly durable: PortDepotNotifications, private readonly projectionLocale: PortDepotNotifications) {}
  public async sauvegarder(notification: Notification): Promise<void> { await this.durable.sauvegarder(notification); await this.projectionLocale.sauvegarder(notification); }
  public async rechercherParId(id: string): Promise<Notification|null> { return (await this.durable.rechercherParId(id)) ?? this.projectionLocale.rechercherParId(id); }
}
