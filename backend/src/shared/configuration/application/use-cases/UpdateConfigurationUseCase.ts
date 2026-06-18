import {
  ConfigurationChange,
  ConfigurationId,
  ConfigurationValue,
  PortRepositoryConfiguration,
  PortRepositoryConfigurationVersion,
} from '../../domain';
import { UpdateConfigurationCommand } from '../commands';
import { ConfigurationDto } from '../dto';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { ConfigurationApplicationMapper } from '../mappers';
import { PortAuditConfiguration, PortMonitoringConfiguration } from '../ports';
import { ValidateurUpdateConfiguration } from '../validators';

// Ce fichier declare le use case de mise a jour.

/** Cette classe orchestre la mise a jour d une configuration. */
export class UpdateConfigurationUseCase {
  constructor(
    private readonly repository: PortRepositoryConfiguration,
    private readonly versionRepository: PortRepositoryConfigurationVersion,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
    private readonly validateur = new ValidateurUpdateConfiguration(),
    private readonly mapper = new ConfigurationApplicationMapper(),
  ) {}

  /** Cette methode execute la mise a jour applicative d une configuration. */
  public async executer(commande: UpdateConfigurationCommand): Promise<ConfigurationDto> {
    this.validateur.valider(commande);
    const configuration = await this.repository.trouverParId(ConfigurationId.creer(commande.configurationId));
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    configuration.mettreAJour(
      ConfigurationValue.creer(commande.value),
      new ConfigurationChange({
        type: 'UPDATED',
        actorId: commande.actorId,
        requestId: commande.requestId,
        correlationId: commande.correlationId,
        changedAt: new Date(),
        metadata: commande.metadata ?? {},
      }),
    );

    await this.repository.sauvegarder(configuration);
    const derniereVersion = configuration.versionsHistorisees().at(-1);
    if (derniereVersion) {
      await this.versionRepository.sauvegarder(derniereVersion);
    }
    await this.audit.enregistrerEvenementsConfiguration(
      configuration.details().identifiant,
      configuration.relacherEvenements(),
    );
    await this.monitoring.publierSignalConfiguration('UPDATED', configuration.details().identifiant);

    return this.mapper.versDto(configuration);
  }
}
