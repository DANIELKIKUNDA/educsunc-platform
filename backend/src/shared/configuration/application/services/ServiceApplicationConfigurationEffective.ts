import {
  ConfigurationLock,
  ConfigurationScope,
  EffectiveConfiguration,
  EntreeCalculConfigurationEffective,
  PorteeConfigurationProps,
  ServiceCalculConfigurationEffective,
} from '../../domain';
import { EffectiveConfigurationDto } from '../dto';
import { EffectiveConfigurationMapper } from '../mappers';

// Ce fichier declare le service applicatif de calcul effectif.

/** Cette classe centralise l exposition applicative du calcul effectif. */
export class ServiceApplicationConfigurationEffective {
  constructor(
    private readonly serviceDomaine = new ServiceCalculConfigurationEffective(),
    private readonly mapper = new EffectiveConfigurationMapper(),
  ) {}

  /** Cette methode calcule et projette une configuration effective. */
  public calculer(
    scope: PorteeConfigurationProps,
    entrees: readonly EntreeCalculConfigurationEffective[],
    lock: ConfigurationLock | null = null,
  ): EffectiveConfigurationDto {
    return this.mapper.versDto(
      this.serviceDomaine.calculer(ConfigurationScope.creer(scope), entrees, lock),
    );
  }

  /** Cette methode projette directement une configuration effective deja resolue. */
  public versDto(configuration: EffectiveConfiguration): EffectiveConfigurationDto {
    return this.mapper.versDto(configuration);
  }
}
