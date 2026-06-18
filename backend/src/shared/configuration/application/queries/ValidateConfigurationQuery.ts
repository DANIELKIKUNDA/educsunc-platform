import { ValeurConfiguration } from '../../domain';

// Ce fichier declare la query de validation.

/** Cette interface represente une demande de validation applicative d une configuration. */
export interface ValidateConfigurationQuery {
  readonly key: string;
  readonly value: ValeurConfiguration;
}
