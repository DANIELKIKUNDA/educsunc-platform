import { PreferencesNotification } from '../../domain';

// Ce fichier declare le port applicatif de lecture des preferences Notifications.

/** Cette interface isole la lecture des preferences resolues d'un destinataire. */
export interface PortDepotPreferencesNotification {
  /** Cette methode retourne les preferences d'un destinataire si elles existent. */
  rechercherPourDestinataire(destinataireId: string): Promise<PreferencesNotification | null>;
}
