// Ce fichier declare le port applicatif de mise en file principale.

/** Cette interface isole la mise en file du traitement principal de notification. */
export interface PortFileDispatchNotification {
  /** Cette methode enfile une notification pour diffusion. */
  ajouter(identifiantNotification: string, metadata?: Readonly<Record<string, unknown>>): Promise<void>;
}
