// Ce fichier declare le port d audit de l application Configuration.

/** Cette interface represente le pont applicatif vers l audit. */
export interface PortAuditConfiguration {
  enregistrerEvenementsConfiguration(
    configurationId: string,
    evenements: readonly object[],
  ): Promise<void>;
}
