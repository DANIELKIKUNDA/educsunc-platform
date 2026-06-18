// Ce fichier declare le port applicatif de mise en file des rejeux.

/** Cette interface isole la mise en file des rejeux techniques de notification. */
export interface PortFileReplayNotification {
  /** Cette methode enfile une notification pour rejeu. */
  ajouter(identifiantNotification: string, metadata?: Readonly<Record<string, unknown>>): Promise<void>;
}
