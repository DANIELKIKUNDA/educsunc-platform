// Ce fichier declare le port applicatif de mise en file des escalades.

/** Cette interface isole la mise en file des escalades de notification. */
export interface PortFileEscaladeNotification {
  /** Cette methode enfile une notification pour escalation. */
  ajouter(identifiantNotification: string, metadata?: Readonly<Record<string, unknown>>): Promise<void>;
}
