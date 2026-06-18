import { PorteeConfigurationProps } from '../../domain';

// Ce fichier declare la query de lecture effective.

/** Cette interface represente la recherche d une configuration effective pour une portee. */
export interface GetEffectiveConfigurationQuery {
  readonly scope: PorteeConfigurationProps;
  readonly keyPrefix?: string;
}
