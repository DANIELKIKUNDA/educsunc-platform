// Ce fichier declare le port applicatif de configuration Notifications.

/** Cette interface isole la lecture de configuration runtime et metier. */
export interface PortConfigurationNotification {
  /** Cette methode retourne une valeur de configuration ou la valeur par defaut fournie. */
  lire<T>(cle: string, valeurParDefaut: T): Promise<T>;
}
