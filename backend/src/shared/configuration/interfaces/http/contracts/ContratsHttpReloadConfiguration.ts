// Ce fichier declare les contrats HTTP de reload Configuration.

export interface ContratHttpReloadConfiguration {
  readonly donnees: {
    readonly configurationId: string;
    readonly reloadDemande: true;
  };
}
