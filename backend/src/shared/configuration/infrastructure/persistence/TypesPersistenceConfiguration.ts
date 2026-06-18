import { Configuration, ConfigurationSnapshot, ConfigurationVersion } from '../../domain';

// Ce fichier declare les types techniques de persistence locale.

/** Cette interface represente un enregistrement technique de configuration en memoire. */
export interface EnregistrementConfigurationMemoire {
  readonly configuration: Configuration;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente un enregistrement technique de version en memoire. */
export interface EnregistrementVersionConfigurationMemoire {
  readonly version: ConfigurationVersion;
  readonly sauvegardeLe: Date;
}

/** Cette interface represente un enregistrement technique de snapshot en memoire. */
export interface EnregistrementSnapshotConfigurationMemoire {
  readonly snapshot: ConfigurationSnapshot;
  readonly configurationId: string;
  readonly sauvegardeLe: Date;
}
