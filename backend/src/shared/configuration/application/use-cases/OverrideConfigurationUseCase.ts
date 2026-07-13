import {
  ConfigurationId,
  ConfigurationKey,
  ConfigurationOverride,
  ConfigurationScope,
  ConfigurationValue,
  PortRepositoryConfiguration,
} from '../../domain';
import { OverrideConfigurationCommand } from '../commands';
import { ConfigurationDto } from '../dto';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { ConfigurationApplicationMapper } from '../mappers';
import {
  PortAuditConfiguration,
  PortMonitoringConfiguration,
  type PortUniteTravailConfiguration,
  UniteTravailConfigurationImmediate,
} from '../ports';
import { ValidateurOverrideConfiguration } from '../validators';

// Ce fichier declare le use case d override.

/** Cette classe orchestre l override applicatif d une configuration. */
export class OverrideConfigurationUseCase {
  constructor(
    private readonly repository: PortRepositoryConfiguration,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
    private readonly validateur = new ValidateurOverrideConfiguration(),
    private readonly mapper = new ConfigurationApplicationMapper(),
    private readonly uniteTravail: PortUniteTravailConfiguration = new UniteTravailConfigurationImmediate(),
  ) {}

  /** Cette methode execute l override applicatif d une configuration. */
  public async executer(commande: OverrideConfigurationCommand): Promise<ConfigurationDto> {
    this.validateur.valider(commande);
    const configuration = await this.repository.trouverParId(ConfigurationId.creer(commande.configurationId));
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    configuration.appliquerOverride(
      new ConfigurationOverride({
        key: ConfigurationKey.creer(configuration.details().key),
        scope: ConfigurationScope.creer(commande.scope),
        value: ConfigurationValue.creer(commande.value),
        actorId: commande.actorId,
        raison: commande.raison,
        overrideLe: new Date(),
      }),
    );

    const evenements = configuration.relacherEvenements();
    await this.uniteTravail.dansTransaction(async () => {
      await this.repository.sauvegarder(configuration);
      await this.audit.enregistrerEvenementsConfiguration(
        configuration.details().identifiant,
        evenements,
      );
    });
    await this.monitoring.publierSignalConfiguration('OVERRIDDEN', configuration.details().identifiant);

    return this.mapper.versDto(configuration);
  }
}
