import { ConfigurationChange } from '../entities';
import { ConfigurationId, ConfigurationValue } from '../value-objects';

// Ce fichier declare l agregat de version de configuration.

/** Cette classe represente une version immuable d une configuration. */
export class ConfigurationVersion {
  constructor(
    private readonly configurationId: ConfigurationId,
    private readonly numeroVersion: number,
    private readonly valeur: ConfigurationValue,
    private readonly changement: ConfigurationChange,
    private readonly creeLe: Date = new Date(),
  ) {}

  /** Cette methode retourne la version en lecture brute. */
  public details(): {
    readonly configurationId: string;
    readonly numeroVersion: number;
    readonly valeur: ReturnType<ConfigurationValue['valeur']>;
    readonly changement: ReturnType<ConfigurationChange['valeur']>;
    readonly creeLe: Date;
  } {
    return {
      configurationId: this.configurationId.valeur(),
      numeroVersion: this.numeroVersion,
      valeur: this.valeur.valeur(),
      changement: this.changement.valeur(),
      creeLe: this.creeLe,
    };
  }
}
