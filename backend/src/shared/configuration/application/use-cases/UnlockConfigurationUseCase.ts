import {
  ConfigurationId,
  PortRepositoryConfiguration,
} from '../../domain';
import { UnlockConfigurationCommand } from '../commands';
import { ConfigurationDto } from '../dto';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { ConfigurationApplicationMapper } from '../mappers';
import {
  PortAuditConfiguration,
  PortMonitoringConfiguration,
  type PortUniteTravailConfiguration,
  UniteTravailConfigurationImmediate,
} from '../ports';

// Ce fichier declare le use case de deverrouillage.

/** Cette classe orchestre le deverrouillage d une configuration. */
export class UnlockConfigurationUseCase {
  constructor(
    private readonly repository: PortRepositoryConfiguration,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
    private readonly mapper = new ConfigurationApplicationMapper(),
    private readonly uniteTravail: PortUniteTravailConfiguration = new UniteTravailConfigurationImmediate(),
  ) {}

  /** Cette methode execute le deverrouillage applicatif d une configuration. */
  public async executer(commande: UnlockConfigurationCommand): Promise<ConfigurationDto> {
    const configuration = await this.repository.trouverParId(ConfigurationId.creer(commande.configurationId));
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    configuration.deverrouiller(commande.actorId);
    const evenements = configuration.relacherEvenements();
    await this.uniteTravail.dansTransaction(async () => {
      await this.repository.sauvegarder(configuration);
      await this.audit.enregistrerEvenementsConfiguration(
        configuration.details().identifiant,
        evenements,
      );
    });
    await this.monitoring.publierSignalConfiguration('UNLOCKED', configuration.details().identifiant);

    return this.mapper.versDto(configuration);
  }
}
