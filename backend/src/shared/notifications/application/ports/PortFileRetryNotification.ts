// Ce fichier declare le port applicatif de mise en file des retries.

/** Cette interface isole la mise en file des retries de notification. */
export interface PortFileRetryNotification {
  /** Cette methode enfile une notification pour retry. */
  ajouter(identifiantNotification: string, metadata?: Readonly<Record<string, unknown>>): Promise<void>;
}
