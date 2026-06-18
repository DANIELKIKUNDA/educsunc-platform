import {
  Configuration,
  ConfigurationChange,
  ConfigurationId,
  ConfigurationKey,
  PolitiqueClassificationConfiguration,
  ConfigurationScope,
  ConfigurationValue,
  PortRepositoryConfiguration,
} from '../../domain';
import { CreateConfigurationCommand } from '../commands';
import { ConfigurationDto } from '../dto';
import { ConfigurationApplicationMapper } from '../mappers';
import { PortAuditConfiguration, PortMonitoringConfiguration } from '../ports';
import { ValidateurCreateConfiguration } from '../validators';

// Ce fichier declare le use case de creation.

/** Cette classe orchestre la creation d une configuration. */
export class CreateConfigurationUseCase {
  constructor(
    private readonly repository: PortRepositoryConfiguration,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
    private readonly validateur = new ValidateurCreateConfiguration(),
    private readonly politiqueClassification = new PolitiqueClassificationConfiguration(),
    private readonly mapper = new ConfigurationApplicationMapper(),
  ) {}

  /** Cette methode execute la creation applicative d une configuration. */
  public async executer(commande: CreateConfigurationCommand): Promise<ConfigurationDto> {
    this.validateur.valider(commande);
    const gouvernanceNormalisee = this.politiqueClassification.normaliserGouvernance(
      commande.key,
      commande.scope.niveau,
      commande.gouvernance,
    );

    const configuration = new Configuration(
      ConfigurationId.creer(commande.configurationId),
      ConfigurationScope.creer(commande.scope),
      ConfigurationKey.creer(commande.key),
      ConfigurationValue.creer(commande.value),
      'BROUILLON',
      new Date(),
      {
        proprietaireNiveau: gouvernanceNormalisee.proprietaireNiveau,
        heritable: gouvernanceNormalisee.heritable,
        overridable: gouvernanceNormalisee.overridable,
        visiblePour: gouvernanceNormalisee.visiblePour,
        auditRequis: commande.gouvernance?.auditRequis ?? true,
        restartRequis: commande.gouvernance?.restartRequis ?? false,
      },
    );

    if (commande.actorId) {
      configuration.mettreAJour(
        ConfigurationValue.creer(commande.value),
        new ConfigurationChange({
          type: 'CREATED',
          actorId: commande.actorId,
          requestId: commande.requestId,
          correlationId: commande.correlationId,
          changedAt: new Date(),
          metadata: {},
        }),
      );
    }

    await this.repository.sauvegarder(configuration);
    await this.audit.enregistrerEvenementsConfiguration(
      configuration.details().identifiant,
      configuration.relacherEvenements(),
    );
    await this.monitoring.publierSignalConfiguration('CREATED', configuration.details().identifiant);

    return this.mapper.versDto(configuration);
  }
}
