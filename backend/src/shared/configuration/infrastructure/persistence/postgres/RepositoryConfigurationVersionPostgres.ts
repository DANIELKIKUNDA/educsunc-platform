import {
  ConfigurationChange,
  ConfigurationId,
  ConfigurationValue,
  ConfigurationVersion,
  PortRepositoryConfigurationVersion,
  type ValeurConfiguration,
} from '../../../domain';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

interface LigneVersionConfigurationPostgres {
  configuration_id: string;
  numero_version: number;
  valeur: unknown;
  changement: ReturnType<ConfigurationChange['valeur']> & { changedAt: string };
  cree_le: Date | string;
}

export class RepositoryConfigurationVersionPostgres implements PortRepositoryConfigurationVersion {
  constructor(private readonly client: SqlQueryClient) {}

  public async sauvegarder(version: ConfigurationVersion): Promise<void> {
    const details = version.details();
    await this.client.executer(
      `
        INSERT INTO educsyn_configuration_versions (
          configuration_id, numero_version, valeur, changement, cree_le
        ) VALUES ($1, $2, $3::jsonb, $4::jsonb, $5)
      `,
      [
        details.configurationId,
        details.numeroVersion,
        JSON.stringify(details.valeur),
        JSON.stringify({
          ...details.changement,
          changedAt: details.changement.changedAt.toISOString(),
        }),
        details.creeLe,
      ],
    );
  }

  public async listerParConfiguration(
    identifiant: ConfigurationId,
  ): Promise<readonly ConfigurationVersion[]> {
    const resultat = await this.client.executer<LigneVersionConfigurationPostgres>(
      `
        SELECT configuration_id, numero_version, valeur, changement, cree_le
        FROM educsyn_configuration_versions
        WHERE configuration_id = $1
        ORDER BY numero_version ASC
      `,
      [identifiant.valeur()],
    );

    return resultat.lignes.map((ligne) => new ConfigurationVersion(
      ConfigurationId.creer(ligne.configuration_id),
      ligne.numero_version,
      ConfigurationValue.creer(ligne.valeur as ValeurConfiguration),
      new ConfigurationChange({
        ...ligne.changement,
        changedAt: new Date(ligne.changement.changedAt),
      }),
      new Date(ligne.cree_le),
    ));
  }
}
