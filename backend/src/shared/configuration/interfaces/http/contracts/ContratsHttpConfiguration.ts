import type { DtoHttpConfiguration, DtoHttpConfigurationEffective } from '../dto/outputs';

// Ce fichier declare les contrats HTTP principaux de Configuration.

/** Cette interface represente la reponse HTTP d une configuration. */
export interface ContratHttpConfiguration {
  readonly donnees: DtoHttpConfiguration;
}

/** Cette interface represente la reponse HTTP d une configuration effective. */
export interface ContratHttpConfigurationEffective {
  readonly donnees: DtoHttpConfigurationEffective | null;
}
