import {
  ConfigurationId,
  ConfigurationKey,
  ConfigurationSnapshot,
  ConfigurationValue,
  EffectiveValue,
  PortRepositoryConfigurationSnapshot,
  type ValeurConfiguration,
} from '../../../domain';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

interface LigneSnapshotConfigurationPostgres {
  identifiant_snapshot: string;
  configuration_id: string;
  valeurs: Array<{
    key: string;
    value: unknown;
    sourceNiveau: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
    herite: boolean;
    verrouille: boolean;
    explanation: string;
  }>;
  cree_le: Date | string;
}

export class RepositoryConfigurationSnapshotPostgres implements PortRepositoryConfigurationSnapshot {
  constructor(private readonly client: SqlQueryClient) {}

  public async sauvegarder(snapshot: ConfigurationSnapshot): Promise<void> {
    const details = snapshot.details();
    await this.client.executer(
      `
        INSERT INTO educsyn_configuration_snapshots (
          identifiant_snapshot, configuration_id, valeurs, cree_le, sauvegarde_le
        ) VALUES ($1, $2, $3::jsonb, $4, NOW())
      `,
      [
        details.identifiantSnapshot,
        details.configurationId,
        JSON.stringify(details.valeurs.map((valeur) => ({
          key: valeur.key.valeur(),
          value: valeur.value.valeur(),
          sourceNiveau: valeur.sourceNiveau,
          herite: valeur.herite,
          verrouille: valeur.verrouille,
          explanation: valeur.explanation,
        }))),
        details.creeLe,
      ],
    );
  }

  public async listerParConfiguration(
    identifiant: ConfigurationId,
  ): Promise<readonly ConfigurationSnapshot[]> {
    const resultat = await this.client.executer<LigneSnapshotConfigurationPostgres>(
      `
        SELECT identifiant_snapshot, configuration_id, valeurs, cree_le
        FROM educsyn_configuration_snapshots
        WHERE configuration_id = $1
        ORDER BY cree_le DESC
      `,
      [identifiant.valeur()],
    );

    return resultat.lignes.map((ligne) => new ConfigurationSnapshot(
      ligne.identifiant_snapshot,
      ligne.configuration_id,
      ligne.valeurs.map((valeur) => new EffectiveValue({
        key: ConfigurationKey.creer(valeur.key),
        value: ConfigurationValue.creer(valeur.value as ValeurConfiguration),
        sourceNiveau: valeur.sourceNiveau,
        herite: valeur.herite,
        verrouille: valeur.verrouille,
        explanation: valeur.explanation,
      })),
      new Date(ligne.cree_le),
    ));
  }
}
