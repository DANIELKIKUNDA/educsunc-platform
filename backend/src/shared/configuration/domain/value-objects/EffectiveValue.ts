import { NiveauConfiguration } from '../enums';
import { ConfigurationKey } from './ConfigurationKey';
import { ConfigurationValue, ValeurConfiguration } from './ConfigurationValue';

// Ce fichier declare une valeur effective resolue avec sa provenance.

/** Cette interface represente les metadonnees d une valeur effective calculee. */
export interface EffectiveValueProps {
  readonly key: ConfigurationKey;
  readonly value: ConfigurationValue;
  readonly sourceNiveau: NiveauConfiguration;
  readonly herite: boolean;
  readonly verrouille: boolean;
  readonly explanation: string;
  readonly sourceConfigurationId?: string;
  readonly sourceStatut?: string;
  readonly sourceTotalVersions?: number;
  readonly sourceCreeLe?: Date;
}

/** Cette classe represente le resultat final d une resolution de configuration. */
export class EffectiveValue {
  /** Ce constructeur memorise la valeur calculee et sa provenance. */
  constructor(private readonly props: EffectiveValueProps) {}

  /** Cette methode retourne la cle brute concernee. */
  public cle(): string {
    return this.props.key.valeur();
  }

  /** Cette methode retourne la valeur serialisable resolue. */
  public valeur(): ValeurConfiguration {
    return this.props.value.valeur();
  }

  /** Cette methode retourne les proprietes effectives completement expliquees. */
  public details(): EffectiveValueProps {
    return { ...this.props };
  }
}
