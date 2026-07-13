import {
  ConfigurationId,
  ConfigurationKey,
  ConfigurationLock,
  PortRepositoryConfiguration,
} from '../../domain';
import { LockConfigurationCommand } from '../commands';
import { ConfigurationDto } from '../dto';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { ConfigurationApplicationMapper } from '../mappers';
import {
  PortAuditConfiguration,
  PortMonitoringConfiguration,
  type PortUniteTravailConfiguration,
  UniteTravailConfigurationImmediate,
} from '../ports';
import { ValidateurLockConfiguration } from '../validators';

// Ce fichier declare le use case de verrouillage.

/** Cette classe orchestre le verrouillage d une configuration. */
export class LockConfigurationUseCase {
  constructor(
    private readonly repository: PortRepositoryConfiguration,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
    private readonly validateur = new ValidateurLockConfiguration(),
    private readonly mapper = new ConfigurationApplicationMapper(),
    private readonly uniteTravail: PortUniteTravailConfiguration = new UniteTravailConfigurationImmediate(),
  ) {}

  /** Cette methode execute le verrouillage applicatif d une configuration. */
  public async executer(commande: LockConfigurationCommand): Promise<ConfigurationDto> {
    this.validateur.valider(commande);
    const configuration = await this.repository.trouverParId(ConfigurationId.creer(commande.configurationId));
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    configuration.verrouiller(
      new ConfigurationLock({
        key: ConfigurationKey.creer(configuration.details().key),
        niveauMinimalAutorise: commande.niveauMinimalAutorise,
        actorId: commande.actorId,
        raison: commande.raison,
        verrouilleLe: new Date(),
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
    await this.monitoring.publierSignalConfiguration('LOCKED', configuration.details().identifiant);

    return this.mapper.versDto(configuration);
  }
}
