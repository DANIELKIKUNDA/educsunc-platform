import {
  Configuration,
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationSnapshot,
  ConfigurationValue,
  EffectiveValue,
  type ValeurConfiguration,
} from '../../../domain';
import {
  ConfigurationApplicationMapper,
  ConfigurationSnapshotMapper,
} from '../../../application/mappers';
import type {
  ConfigurationDto,
  ConfigurationSnapshotDto,
  EffectiveConfigurationDto,
} from '../../../application/dto';
import type {
  ConfigurationReadModel,
  ConfigurationSnapshotReadModel,
  EffectiveConfigurationReadModel,
} from '../../../application/read-models';
import { ServiceApplicationConfigurationEffective } from '../../../application/services';
import type { PorteeConfigurationProps } from '../../..';
import type { SqlQueryClient } from '../../../../../shared/infrastructure/persistence/SqlQueryClient';

interface LigneConfigurationPostgres {
  identifiant: string;
  cle: string;
  valeur: unknown;
  statut: 'BROUILLON' | 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
  scope_niveau: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
  organisation_id: string | null;
  ecole_id: string | null;
  utilisateur_id: string | null;
  gouvernance: ReturnType<Configuration['details']>['gouvernance'];
  overrides: Array<{
    key: string;
    scope: ReturnType<Configuration['details']>['scope'];
    value: unknown;
    actorId: string;
    raison?: string;
    overrideLe: string;
  }>;
  verrou: {
    key: string;
    niveauMinimalAutorise: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
    actorId: string;
    raison?: string;
    verrouilleLe: string;
  } | null;
  total_versions: number;
  revision: number | string;
  cree_le: Date | string;
}

interface LigneSnapshotPostgres {
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

function reconstituerConfiguration(ligne: LigneConfigurationPostgres): Configuration {
  return Configuration.reconstituer({
    identifiant: ligne.identifiant,
    scope: {
      niveau: ligne.scope_niveau,
      organisationId: ligne.organisation_id ?? undefined,
      ecoleId: ligne.ecole_id ?? undefined,
      utilisateurId: ligne.utilisateur_id ?? undefined,
    },
    key: ligne.cle,
    valeur: ligne.valeur as ValeurConfiguration,
    statut: ligne.statut,
    creeLe: new Date(ligne.cree_le),
    gouvernance: ligne.gouvernance,
    overrides: (ligne.overrides ?? []).map((override) => ({
      ...override,
      value: override.value as ValeurConfiguration,
      overrideLe: new Date(override.overrideLe),
    })),
    lock: ligne.verrou
      ? {
        ...ligne.verrou,
        verrouilleLe: new Date(ligne.verrou.verrouilleLe),
      }
      : null,
    totalVersions: ligne.total_versions,
    revisionPersistence: Number(ligne.revision),
  });
}

export class ConfigurationReadModelPostgres implements ConfigurationReadModel {
  private readonly mapper = new ConfigurationApplicationMapper();

  constructor(private readonly client: SqlQueryClient) {}

  public async trouverParId(configurationId: string): Promise<ConfigurationDto | null> {
    const configurations = await this.listerConfigurations();
    const configuration =
      configurations.find((entry) => entry.details().identifiant === configurationId) ?? null;
    return configuration ? this.mapper.versDto(configuration) : null;
  }

  public async listerConfigurations(): Promise<readonly Configuration[]> {
    const resultat = await this.client.executer<LigneConfigurationPostgres>(
      `
        SELECT identifiant, cle, valeur, statut, scope_niveau, organisation_id, ecole_id, utilisateur_id,
               gouvernance, overrides, verrou, total_versions, cree_le, revision
        FROM educsyn_configuration_entries
      `,
    );

    return resultat.lignes.map(reconstituerConfiguration);
  }
}

export class EffectiveConfigurationReadModelPostgres implements EffectiveConfigurationReadModel {
  private readonly service = new ServiceApplicationConfigurationEffective();

  constructor(private readonly readModel: ConfigurationReadModelPostgres) {}

  public async trouver(
    scope: PorteeConfigurationProps,
    keyPrefix?: string,
  ): Promise<EffectiveConfigurationDto | null> {
    const configurations = await this.readModel.listerConfigurations();
    const entrees = configurations.flatMap((configuration) => {
      const details = configuration.details();
      const verrouille = details.lock !== null;
      const cle = details.key;
      if (keyPrefix && !cle.startsWith(keyPrefix)) {
        return [];
      }

      const base = {
        key: ConfigurationKey.creer(cle),
        scope: ConfigurationScope.creer(details.scope),
        value: ConfigurationValue.creer(details.valeur),
        verrouille,
        sourceConfigurationId: details.identifiant,
        sourceStatut: details.statut,
        sourceTotalVersions: details.totalVersions,
        sourceCreeLe: details.creeLe,
      };
      const overrides = details.overrides
        .filter(() => !keyPrefix || cle.startsWith(keyPrefix))
        .map((entreeOverride) => ({
          key: ConfigurationKey.creer(cle),
          scope: ConfigurationScope.creer(entreeOverride.scope.valeur()),
          value: ConfigurationValue.creer(entreeOverride.value.valeur()),
          verrouille,
          sourceConfigurationId: details.identifiant,
          sourceStatut: details.statut,
          sourceTotalVersions: details.totalVersions,
          sourceCreeLe: details.creeLe,
        }));

      return [base, ...overrides];
    });

    return this.service.calculer(scope, entrees);
  }
}

export class ConfigurationSnapshotReadModelPostgres implements ConfigurationSnapshotReadModel {
  private readonly mapper = new ConfigurationSnapshotMapper();

  constructor(private readonly client: SqlQueryClient) {}

  public async trouverParId(
    configurationId: string,
    snapshotId: string,
  ): Promise<ConfigurationSnapshotDto | null> {
    const resultat = await this.client.executer<LigneSnapshotPostgres>(
      `
        SELECT identifiant_snapshot, configuration_id, valeurs, cree_le
        FROM educsyn_configuration_snapshots
        WHERE identifiant_snapshot = $1
          AND configuration_id = $2
      `,
      [snapshotId, configurationId],
    );

    const ligne = resultat.lignes[0];
    if (!ligne) {
      return null;
    }

    return this.mapper.versDto(this.reconstituerSnapshot(ligne));
  }

  public async listerParConfiguration(
    configurationId: string,
  ): Promise<readonly ConfigurationSnapshotDto[]> {
    const resultat = await this.client.executer<LigneSnapshotPostgres>(
      `
        SELECT identifiant_snapshot, configuration_id, valeurs, cree_le
        FROM educsyn_configuration_snapshots
        WHERE configuration_id = $1
        ORDER BY cree_le DESC
      `,
      [configurationId],
    );

    return resultat.lignes.map((ligne) => this.mapper.versDto(this.reconstituerSnapshot(ligne)));
  }

  private reconstituerSnapshot(ligne: LigneSnapshotPostgres): ConfigurationSnapshot {
    return new ConfigurationSnapshot(
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
    );
  }
}
