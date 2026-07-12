import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { Configuration, ConfigurationId, type ValeurConfiguration } from '../../domain';
import { ConfigurationPersistenceMapper } from '../mappers/ConfigurationPersistenceMapper';
import { RepositoryConfigurationMemoire } from './RepositoryConfigurationMemoire';

interface ProjectionPersistanteConfiguration {
  readonly identifiant: string;
  readonly key: string;
  readonly valeur: ValeurConfiguration;
  readonly statut: 'BROUILLON' | 'ACTIVE' | 'LOCKED' | 'ARCHIVED';
  readonly scope: ReturnType<Configuration['details']>['scope'];
  readonly gouvernance: ReturnType<Configuration['details']>['gouvernance'];
  readonly overrides: readonly {
    readonly key: string;
    readonly scope: ReturnType<Configuration['details']>['scope'];
    readonly value: ValeurConfiguration;
    readonly actorId: string;
    readonly raison?: string;
    readonly overrideLe: string;
  }[];
  readonly lock: {
    readonly key: string;
    readonly niveauMinimalAutorise: 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';
    readonly actorId: string;
    readonly raison?: string;
    readonly verrouilleLe: string;
  } | null;
  readonly totalVersions: number;
  readonly creeLe: string;
  readonly sauvegardeLe: string;
}

/** Ce depot persiste les configurations sur disque tout en conservant le comportement memoire existant. */
export class RepositoryConfigurationMemoirePersistante extends RepositoryConfigurationMemoire {
  private readonly mapper = new ConfigurationPersistenceMapper();
  private readonly cheminFichier: string;

  constructor(cheminFichier = path.resolve(process.cwd(), 'stockage-local/configuration/configurations.json')) {
    super();
    this.cheminFichier = cheminFichier;
    this.hydraterDepuisDisque();
  }

  /** Cette methode persiste une configuration et synchronise le fichier local. */
  public override async sauvegarder(configuration: Configuration): Promise<void> {
    await super.sauvegarder(configuration);
    this.persistreVersDisque();
  }

  /** Cette methode supprime une configuration et synchronise le fichier local. */
  public override async supprimer(identifiant: ConfigurationId): Promise<void> {
    await super.supprimer(identifiant);
    this.persistreVersDisque();
  }

  private hydraterDepuisDisque(): void {
    if (!existsSync(this.cheminFichier)) {
      return;
    }

    const contenu = readFileSync(this.cheminFichier, 'utf8').trim();
    if (contenu.length === 0) {
      return;
    }

    const projections = JSON.parse(contenu) as ProjectionPersistanteConfiguration[];
    for (const projection of projections) {
      const configuration = Configuration.reconstituer({
        identifiant: projection.identifiant,
        scope: projection.scope,
        key: projection.key,
        valeur: projection.valeur,
        statut: projection.statut,
        creeLe: new Date(projection.creeLe),
        gouvernance: projection.gouvernance,
        overrides: projection.overrides.map((override) => ({
          ...override,
          overrideLe: new Date(override.overrideLe),
        })),
        lock: projection.lock
          ? {
            ...projection.lock,
            verrouilleLe: new Date(projection.lock.verrouilleLe),
          }
          : null,
        totalVersions: projection.totalVersions,
      });

      this.stockageMemoire().enregistrer(ConfigurationId.creer(projection.identifiant), {
        configuration,
        sauvegardeLe: new Date(projection.sauvegardeLe),
      });
    }
  }

  private persistreVersDisque(): void {
    const dossier = path.dirname(this.cheminFichier);
    mkdirSync(dossier, { recursive: true });

    const projections = this.stockageMemoire().lister().map((enregistrement) => {
      const projection = this.mapper.versProjection(enregistrement.configuration);
      return {
        ...projection,
        creeLe: projection.creeLe.toISOString(),
        overrides: projection.overrides.map((override) => ({
          ...override,
          overrideLe: override.overrideLe.toISOString(),
        })),
        lock: projection.lock
          ? {
            ...projection.lock,
            verrouilleLe: projection.lock.verrouilleLe.toISOString(),
          }
          : null,
        sauvegardeLe: enregistrement.sauvegardeLe.toISOString(),
      };
    });

    writeFileSync(this.cheminFichier, JSON.stringify(projections, null, 2), 'utf8');
  }
}
