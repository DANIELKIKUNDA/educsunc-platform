// Ce fichier declare le port de reload runtime.

/** Cette interface represente le pont applicatif vers le rechargement runtime. */
export interface PortReloadRuntimeConfiguration {
  rechargerConfigurationRuntime(configurationId: string, forcer: boolean): Promise<void>;
}
