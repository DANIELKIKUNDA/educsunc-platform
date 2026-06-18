// Ce fichier declare le port applicatif de monitoring et d'observabilite Notifications.

/** Cette interface isole la remontee de signaux de monitoring vers l'infrastructure. */
export interface PortMonitoringNotification {
  /** Cette methode enregistre une mesure ou un signal de monitoring. */
  enregistrerSignal(nom: string, valeurs?: Readonly<Record<string, unknown>>): Promise<void>;
}
