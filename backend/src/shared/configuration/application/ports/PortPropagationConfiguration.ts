// Ce fichier declare le port de propagation de configuration.

/** Cette interface represente le pont applicatif vers la propagation transverse. */
export interface PortPropagationConfiguration {
  propagerConfiguration(
    configurationId: string,
    canauxCibles?: readonly string[],
  ): Promise<void>;

  propagerSuppressionConfiguration(configurationId: string): Promise<void>;
}
