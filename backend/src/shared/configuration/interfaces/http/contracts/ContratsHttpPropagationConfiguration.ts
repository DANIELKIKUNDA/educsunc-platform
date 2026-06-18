// Ce fichier declare les contrats HTTP de propagation Configuration.

export interface ContratHttpPropagationConfiguration {
  readonly donnees: {
    readonly configurationId: string;
    readonly propagationDemandee: true;
  };
}
