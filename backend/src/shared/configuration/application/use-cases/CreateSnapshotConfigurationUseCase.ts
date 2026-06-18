import {
  ConfigurationId,
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
  EffectiveValue,
  PortRepositoryConfiguration,
  PortRepositoryConfigurationSnapshot,
} from '../../domain';
import { randomUUID } from 'node:crypto';
import { CreateSnapshotConfigurationCommand } from '../commands';
import { ConfigurationSnapshotDto } from '../dto';
import { ExceptionConfigurationIntrouvable } from '../exceptions';
import { ConfigurationSnapshotMapper } from '../mappers';
import { PortAuditConfiguration, PortMonitoringConfiguration } from '../ports';

// Ce fichier declare le use case de creation de snapshot.

/** Cette classe orchestre la creation d un snapshot de configuration. */
export class CreateSnapshotConfigurationUseCase {
  constructor(
    private readonly repository: PortRepositoryConfiguration,
    private readonly snapshotRepository: PortRepositoryConfigurationSnapshot,
    private readonly audit: PortAuditConfiguration,
    private readonly monitoring: PortMonitoringConfiguration,
    private readonly mapper = new ConfigurationSnapshotMapper(),
  ) {}

  /** Cette methode execute la creation applicative d un snapshot. */
  public async executer(
    commande: CreateSnapshotConfigurationCommand,
  ): Promise<ConfigurationSnapshotDto> {
    const configuration = await this.repository.trouverParId(ConfigurationId.creer(commande.configurationId));
    if (!configuration) {
      throw new ExceptionConfigurationIntrouvable(commande.configurationId);
    }

    const details = configuration.details();
    const scope = commande.scope ? ConfigurationScope.creer(commande.scope) : ConfigurationScope.creer(details.scope);
    const snapshot = configuration.creerSnapshot(commande.snapshotId ?? randomUUID(), [
      new EffectiveValue({
        key: ConfigurationKey.creer(details.key),
        value: ConfigurationValue.creer(details.valeur),
        sourceNiveau: scope.niveau(),
        herite: false,
        verrouille: details.lock !== null,
        explanation: 'Snapshot applicatif cree depuis l etat courant de la configuration.',
      }),
    ]);

    await this.snapshotRepository.sauvegarder(snapshot);
    await this.audit.enregistrerEvenementsConfiguration(
      details.identifiant,
      configuration.relacherEvenements(),
    );
    await this.monitoring.publierSignalConfiguration('SNAPSHOT', details.identifiant);

    return this.mapper.versDto(snapshot);
  }
}
