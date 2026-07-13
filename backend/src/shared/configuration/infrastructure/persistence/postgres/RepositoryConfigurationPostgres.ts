import {
  Configuration,
  ConfigurationId,
  PortRepositoryConfiguration,
  ExceptionConflitVersionConfiguration,
  type ValeurConfiguration,
} from '../../../domain';
import { ConfigurationPersistenceMapper } from '../../mappers/ConfigurationPersistenceMapper';
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

export class RepositoryConfigurationPostgres implements PortRepositoryConfiguration {
  private readonly mapper = new ConfigurationPersistenceMapper();

  constructor(private readonly client: SqlQueryClient) {}

  public async sauvegarder(configuration: Configuration): Promise<void> {
    const projection = this.mapper.versProjection(configuration);

    if (projection.revisionPersistence === null) {
      const resultat = await this.client.executer<{ revision: number | string }>(`
        INSERT INTO educsyn_configuration_entries (
          identifiant, cle, valeur, statut, scope_niveau, organisation_id, ecole_id, utilisateur_id,
          gouvernance, overrides, verrou, total_versions, cree_le, sauvegarde_le, revision
        ) VALUES (
          $1, $2, $3::jsonb, $4, $5, $6, $7, $8,
          $9::jsonb, $10::jsonb, $11::jsonb, $12, $13, NOW(), 0
        )
        RETURNING revision
      `,
      this.parametresProjection(projection));
      configuration.confirmerPersistance(Number(resultat.lignes[0]?.revision ?? 0));
      return;
    }

    const resultat = await this.client.executer<{ revision: number | string }>(`
      UPDATE educsyn_configuration_entries SET
        cle = $2,
        valeur = $3::jsonb,
        statut = $4,
        scope_niveau = $5,
        organisation_id = $6,
        ecole_id = $7,
        utilisateur_id = $8,
        gouvernance = $9::jsonb,
        overrides = $10::jsonb,
        verrou = $11::jsonb,
        total_versions = $12,
        cree_le = $13,
        sauvegarde_le = NOW(),
        revision = revision + 1
      WHERE identifiant = $1
        AND revision = $14
      RETURNING revision
    `, [
      ...this.parametresProjection(projection),
      projection.revisionPersistence,
    ]);

    if (resultat.nombreLignesAffectees !== 1 || !resultat.lignes[0]) {
      throw new ExceptionConflitVersionConfiguration(projection.identifiant);
    }
    configuration.confirmerPersistance(Number(resultat.lignes[0].revision));
  }

  public async trouverParId(identifiant: ConfigurationId): Promise<Configuration | null> {
    const resultat = await this.client.executer<LigneConfigurationPostgres>(
      `
        SELECT identifiant, cle, valeur, statut, scope_niveau, organisation_id, ecole_id, utilisateur_id,
               gouvernance, overrides, verrou, total_versions, cree_le, revision
        FROM educsyn_configuration_entries
        WHERE identifiant = $1
      `,
      [identifiant.valeur()],
    );

    const ligne = resultat.lignes[0];
    if (!ligne) {
      return null;
    }

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

  private parametresProjection(
    projection: ReturnType<ConfigurationPersistenceMapper['versProjection']>,
  ): readonly unknown[] {
    return [
      projection.identifiant,
      projection.key,
      JSON.stringify(projection.valeur),
      projection.statut,
      projection.scope.niveau,
      projection.scope.organisationId ?? null,
      projection.scope.ecoleId ?? null,
      projection.scope.utilisateurId ?? null,
      JSON.stringify(projection.gouvernance),
      JSON.stringify(projection.overrides.map((override) => ({
        ...override,
        overrideLe: override.overrideLe.toISOString(),
      }))),
      projection.lock
        ? JSON.stringify({
          ...projection.lock,
          verrouilleLe: projection.lock.verrouilleLe.toISOString(),
        })
        : null,
      projection.totalVersions,
      projection.creeLe,
    ];
  }
}
