// Ce fichier declare le port de monitoring Configuration.

/** Cette interface represente le pont applicatif vers les signaux de monitoring. */
export interface PortMonitoringConfiguration {
  publierSignalConfiguration(
    signal: 'CREATED' | 'UPDATED' | 'LOCKED' | 'UNLOCKED' | 'OVERRIDDEN' | 'SNAPSHOT' | 'DELETED',
    configurationId: string,
  ): Promise<void>;
}
