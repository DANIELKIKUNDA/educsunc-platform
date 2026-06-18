import { Notification } from '../../domain';

// Ce fichier declare le port applicatif de persistence principale des notifications.

/** Cette interface isole le stockage et la relecture de l'agregat Notification. */
export interface PortDepotNotifications {
  /** Cette methode persiste l'agregat Notification. */
  sauvegarder(notification: Notification): Promise<void>;

  /** Cette methode relit une notification par identifiant metier. */
  rechercherParId(identifiantNotification: string): Promise<Notification | null>;
}
