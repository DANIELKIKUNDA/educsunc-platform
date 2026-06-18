import { PorteeConfigurationProps } from '../../domain';
import { EffectiveConfigurationDto } from '../dto';

// Ce fichier declare le read model de configuration effective.

/** Cette interface represente la lecture optimisee des configurations effectives. */
export interface EffectiveConfigurationReadModel {
  trouver(
    scope: PorteeConfigurationProps,
    keyPrefix?: string,
  ): Promise<EffectiveConfigurationDto | null>;
}
